# Bootstrap 

## Login to GCP
```bash
gcloud auth application-default login
```

## Create a bucket to store terraform.tfstate 
- with restricted public access -> public-access-prevention
- uniform-bucket-level-access -> only bucket-level Identity and Access Management (IAM) permissions grant access to that bucket and the objects it contains

```bash
gcloud storage buckets create gs://<BUCKET_NAME> --project=<PROJECT_ID> --default-storage-class=STANDARD --location=<REGION> --uniform-bucket-level-access --public-access-prevention
```

## Enable versioning to allow state recovery in the case of accidental deletions and human error
```bash
gcloud storage buckets update gs://<BUCKET_NAME> --versioning
```

## Use <BUCKET_NAME> for Terraform configuration main.tf for backend block
```hcl
    backend gcs {
        bucket = "<BUCKET_NAME>"
        prefix = "<PREFIX>"
    }
```

## Initialize 
```bash
terraform init
```