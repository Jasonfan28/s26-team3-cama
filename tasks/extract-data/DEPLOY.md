# Cloud Function Deploy Commands
**Note:** Run all commands from the extract-data directory

## 1. Data Extraction
Deploy Cloud Run Functions to download required datasets from their respective APIs, convert to parquet, and upload to the `raw_data` bucket in GCloud.

### 1.1. Function Deploy Scripts
```bash
# OPA Assessments
gcloud functions deploy extract_phl_opa_assessments \
--gen2 \
--region=us-central1 \
--runtime=python311 \
--source=. \
--entry-point=extract_phl_opa_assessments \
--set-env-vars='BUCKET_NAME=musa5090s26-team3-raw_data,BLOB_OPA_ASSESS=opa_assessments/opa_assessments.parquet,START_YEAR=2024' \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com' \
--memory=6Gi \
--timeout=240 \
--no-allow-unauthenticated \
--trigger-http

# OPA Properties
gcloud functions deploy extract_phl_opa_properties \
--gen2 \
--region=us-central1 \
--runtime=python311 \
--source=. \
--entry-point=extract_phl_opa_properties \
--set-env-vars='BUCKET_NAME=musa5090s26-team3-raw_data,BLOB_OPA_PROPERTIES=opa_properties/opa_properties.parquet' \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com' \
--memory=8Gi \
--timeout=240 \
--no-allow-unauthenticated \
--trigger-http

# PWD Parcels
gcloud functions deploy extract_phl_pwd_parcels \
--gen2 \
--region=us-central1 \
--runtime=python311 \
--source=. \
--entry-point=extract_phl_pwd_parcels \
--set-env-vars='BUCKET_NAME=musa5090s26-team3-raw_data,BLOB_PWD_PARCELS=pwd_parcels/pwd_parcels.geoparquet' \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com' \
--memory=8Gi \
--timeout=240 \
--no-allow-unauthenticated \
--trigger-http

# Real Estate Transfers
gcloud functions deploy extract_phl_real_estate_transfers \
--gen2 \
--region=us-central1 \
--runtime=python311 \
--source=. \
--entry-point=extract_phl_real_estate_transfers \
--set-env-vars='BUCKET_NAME=musa5090s26-team3-raw_data,BLOB_REAL_ESTATE=real_estate_transfers/real_estate_transfers.parquet,START_YEAR=2024' \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com' \
--memory=8Gi \
--timeout=240 \
--no-allow-unauthenticated \
--trigger-http

# Philly Schools
gcloud functions deploy extract_phl_schools \
--gen2 \
--region=us-central1 \
--runtime=python311 \
--source=. \
--entry-point=extract_phl_schools \
--set-env-vars='BUCKET_NAME=musa5090s26-team3-raw_data,BLOB_SCHOOLS=schools/schools.geoparquet' \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com' \
--memory=8Gi \
--timeout=240 \
--no-allow-unauthenticated \
--trigger-http

# SEPTA Stops
gcloud functions deploy extract_phl_septa_stops \
--gen2 \
--region=us-central1 \
--runtime=python311 \
--source=. \
--entry-point=extract_phl_septa_stops \
--set-env-vars='BUCKET_NAME=musa5090s26-team3-raw_data,BLOB_SEPTA_STOPS=septa_stops/septa_stops.geoparquet' \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com' \
--memory=8Gi \
--timeout=240 \
--no-allow-unauthenticated \
--trigger-http

```

### 1.2. Function Testing Scripts
```bash
# OPA Assessments
gcloud functions call extract_phl_opa_assessments

# OPA Properties
gcloud functions call extract_phl_opa_properties

# PWD Parcels
gcloud functions call extract_phl_pwd_parcels

# Real Estate Transfers
gcloud functions call extract_phl_real_estate_transfers

# Philly Schools
gcloud functions call extract_phl_schools

# SEPTA Stops
gcloud functions call extract_phl_septa_stops

```