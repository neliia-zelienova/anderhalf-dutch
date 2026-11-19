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
  services = toset(["artifactregistry.googleapis.com", "secretmanager.googleapis.com"])
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