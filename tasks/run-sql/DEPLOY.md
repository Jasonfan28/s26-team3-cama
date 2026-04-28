## 2. Table Creation
Consists of a single `run_sql` function that will be used to run external table creation scripts.

### 2.1. Run SQL Function
```bash
# Run SQL Scripts
gcloud functions deploy run_sql \
--gen2 \
--region=us-central1 \
--runtime=python311 \
--source=. \
--entry-point=run_sql \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com' \
--memory=8Gi \
--timeout=480s \
--set-env-vars='DATA_LAKE_BUCKET=musa5090s26-team3-raw_data,DATA_LAKE_DATASET_SOURCE=source,DATA_LAKE_DATASET_CORE=core,DATA_LAKE_DATASET_DERIVED=derived' \
--no-allow-unauthenticated \
--trigger-http
```

### 2.2 Run SQL Testing Scripts
None, not able to test through the command line.
