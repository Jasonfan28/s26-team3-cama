## Function Deploy Commands
**Note:** Run all commands from the extract-data directory
### OPA Assessments
```bash
gcloud functions deploy extract_phl_opa_assessments \
--gen2 \
--region=us-central1 \
--runtime=python311 \
--source=. \
--entry-point=extract_phl_opa_assessments \
--set-env-vars='BUCKET_NAME=musa5090s26-team3-raw_data,BLOB_OPA_ASSESS=opa_assessments.parquet,START_YEAR=2024' \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com' \
--memory=3Gi \
--timeout=120 \
--no-allow-unauthenticated \
--trigger-http
```

### OPA Properties
```bash
gcloud functions deploy extract_phl_opa_properties \
--gen2 \
--region=us-central1 \
--runtime=python311 \
--source=. \
--entry-point=extract_phl_opa_properties \
--set-env-vars='BUCKET_NAME=musa5090s26-team3-raw_data,BLOB_OPA_PROPERTIES=opa_properties.parquet,START_YEAR=2024' \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com' \
--memory=6Gi \
--timeout=120 \
--no-allow-unauthenticated \
--trigger-http
```

### PWD Parcels
```bash
gcloud functions deploy extract_phl_pwd_parcels \
--gen2 \
--region=us-central1 \
--runtime=python311 \
--source=. \
--entry-point=extract_phl_pwd_parcels \
--set-env-vars='BUCKET_NAME=musa5090s26-team3-raw_data,BLOB_PWD_PARCELS=pwd_parcels.geoparquet' \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com' \
--memory=6Gi \
--timeout=120 \
--no-allow-unauthenticated \
--trigger-http
```

### Real Estate
```bash
gcloud functions deploy extract_phl_real_estate_transfers \
--gen2 \
--region=us-central1 \
--runtime=python311 \
--source=. \
--entry-point=extract_phl_real_estate_transfers \
--set-env-vars='BUCKET_NAME=musa5090s26-team3-raw_data,BLOB_REAL_ESTATE=real_estate_transfers.parquet,START_YEAR=2024' \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com' \
--memory=6Gi \
--timeout=120 \
--no-allow-unauthenticated \
--trigger-http
```