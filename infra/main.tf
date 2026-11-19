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
  services = toset(["artifactregistry.googleapis.com", "secretmanager.googleapis.com", "run.googleapis.com"])
}

resource "google_project_service" "services" {
  for_each           = local.services
  project            = var.project
  service            = each.value
  disable_on_destroy = false
}

resource "google_artifact_registry_repository" "anderhalf" {
  depends_on    = [google_project_service.services]
  location      = var.region
  repository_id = "anderhalf"
  description   = "Docker repository for anderhalf"
  format        = "DOCKER"
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

  depends_on = [google_project_service.services, google_secret_manager_secret_iam_member.db_url_accessor]
}

resource "google_cloud_run_v2_service_iam_member" "api_public" {
  project  = google_cloud_run_v2_service.api.project
  location = google_cloud_run_v2_service.api.location
  name     = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}