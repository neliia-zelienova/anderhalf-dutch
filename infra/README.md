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

## Add secret values (db-url DATABASE_URL for API)
Never pass secret values as command arguments: they stay in shell history. 
Use this flow:
1. Start with command
```bash
read -rs <VARIABLE_NAME>
```
2. Enter the secret (it will not be visible), hit Enter
3. Send the secret to remote using the variable without a trailing newline [printf '%s'] (which would break the value)
```bash
printf '%s' "$<VARIABLE_NAME>" | gcloud secrets versions add <SECRET_NAME> --data-file=-
```
4. Don't forget to delete the variable
```bash
unset <VARIABLE_NAME>
```