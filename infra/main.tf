terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "8.12.0"
    }
  }
  backend "gcs" {
    bucket = "anderhalf-tf-state"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project
  region  = var.region
}

locals {
  services = toset(["artifactregistry.googleapis.com", "secretmanager.googleapis.com", "run.googleapis.com", "iamcredentials.googleapis.com", "sts.googleapis.com"])
}

resource "google_project_service" "services" {
  for_each           = local.services
  project            = var.project
  service            = each.value
  disable_on_destroy = false
}

resource "google_artifact_registry_repository" "anderhalf" {
  depends_on             = [google_project_service.services]
  location               = var.region
  repository_id          = "anderhalf"
  description            = "Docker repository for anderhalf"
  format                 = "DOCKER"
  cleanup_policy_dry_run = false
  cleanup_policies {
    id     = "delete-all"
    action = "DELETE"
    condition {
      tag_state = "ANY"
    }
  }

  cleanup_policies {
    id     = "keep-last-2"
    action = "KEEP"
    most_recent_versions {
      keep_count = 2
    }
  }
}


resource "google_secret_manager_secret" "db_url" {
  secret_id = "db-url"
  labels = {
    app = "anderhalf"
  }
  replication {
    auto {}
  }
  secret_type = "OTHER_DB_CREDENTIALS"
  depends_on  = [google_project_service.services]
}

resource "google_service_account" "api_runtime" {
  account_id   = "api-runtime"
  display_name = "API Runtime Service Account"
  project      = var.project
}

resource "google_secret_manager_secret_iam_member" "db_url_accessor" {
  secret_id = google_secret_manager_secret.db_url.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.api_runtime.email}"
}

resource "google_cloud_run_v2_service" "api" {
  name                = "api"
  location            = var.region
  deletion_protection = false

  template {
    containers {
      image = "europe-west4-docker.pkg.dev/anderhalf/anderhalf/api:44db7ea"
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.db_url.id
            version = "latest"
          }
        }
      }
    }
    service_account = google_service_account.api_runtime.email
    scaling {
      min_instance_count = 0
      max_instance_count = 1
    }
  }

  lifecycle {
    ignore_changes = [template[0].containers[0].image, client, client_version]
  }

  depends_on = [google_project_service.services, google_secret_manager_secret_iam_member.db_url_accessor]
}

resource "google_cloud_run_v2_service_iam_member" "api_public" {
  project  = google_cloud_run_v2_service.api.project
  location = google_cloud_run_v2_service.api.location
  name     = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_iam_workload_identity_pool" "github_actions_pool" {
  workload_identity_pool_id = "github-actions-pool"
  display_name              = "GitHub Actions Pool"
  description               = "GitHub Actions identity pool for Anderhalf project"
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_actions_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github"
  display_name                       = "GitHub Actions Provider"
  description                        = "GitHub Actions identity pool provider for CI/CD"
  attribute_condition                = <<EOT
    assertion.repository_owner_id == "66479463" &&
    assertion.repository == "neliia-zelienova/anderhalf-dutch" &&
    assertion.ref == "refs/heads/main" &&
    assertion.ref_type == "branch"
EOT
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.aud"        = "assertion.aud"
    "attribute.repository" = "assertion.repository"
  }
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account" "github_actions" {
  account_id   = "github-actions"
  display_name = "GitHub Actions Service Account"
  project      = var.project
}

resource "google_artifact_registry_repository_iam_member" "github_actions_registry_writer" {
  project    = google_artifact_registry_repository.anderhalf.project
  location   = google_artifact_registry_repository.anderhalf.location
  repository = google_artifact_registry_repository.anderhalf.name
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_cloud_run_v2_service_iam_member" "github_actions_run_developer" {
  project  = google_cloud_run_v2_service.api.project
  location = google_cloud_run_v2_service.api.location
  name     = google_cloud_run_v2_service.api.name
  role     = "roles/run.developer"
  member   = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_service_account_iam_member" "github_actions_act_as_runtime" {
  service_account_id = google_service_account.api_runtime.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_service_account_iam_member" "github_actions_workload_identity_user" {
  service_account_id = google_service_account.github_actions.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_actions_pool.name}/attribute.repository/neliia-zelienova/anderhalf-dutch"
}