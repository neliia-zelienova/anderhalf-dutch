terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = "8.12.0"
    }
  }
  backend gcs {
    bucket = "anderhalf-tf-state"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project
  region  = var.region
  zone    = var.zone
}