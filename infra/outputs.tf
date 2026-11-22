output "api_url" {
  description = "URL of the API Cloud Run service"
  value       = google_cloud_run_v2_service.api.uri
}

output "github_actions_provider_name" {
  description = "Name of the GitHub Actions Workload Identity Pool Provider"
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "service_account_github_actions_email" {
  description = "Email of the GitHub Actions Service Account"
  value       = google_service_account.github_actions.email
}