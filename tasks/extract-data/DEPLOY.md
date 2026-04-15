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
--set-env-vars='BUCKET_NAME=musa5090s26-team3-raw_data,BLOB_OPA_PROPERTIES=opa_properties/opa_properties.parquet,START_YEAR=2024' \
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

## 3. Workflows
Deploy workflows for each dataset to GCloud.

### 3.1. Workflow Deploy Scripts
```bash
# OPA Assessments
gcloud workflows deploy data-pipeline-phl-opa-assessments \
--location=us-central1 \
--project=musa5090s26-team3 \
--source=scripts_workflow/workflow_opa_assessments.yaml \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'

# OPA Properties
gcloud workflows deploy data-pipeline-phl-opa-properties \
--location=us-central1 \
--project=musa5090s26-team3 \
--source=scripts_workflow/workflow_opa_properties.yaml \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'

# PWD Parcels
gcloud workflows deploy data-pipeline-phl-pwd-parcels \
--location=us-central1 \
--project=musa5090s26-team3 \
--source=scripts_workflow/workflow_pwd_parcels.yaml \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'

# Real Estate Transfers
gcloud workflows deploy data-pipeline-phl-real-estate-transfers \
--location=us-central1 \
--project=musa5090s26-team3 \
--source=scripts_workflow/workflow_real_estate_transfers.yaml \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'

# Philly Schools
gcloud workflows deploy data-pipeline-phl-schools \
--location=us-central1 \
--project=musa5090s26-team3 \
--source=scripts_workflow/workflow_schools.yaml \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'

# SEPTA Stops
gcloud workflows deploy data-pipeline-phl-septa-stops \
--location=us-central1 \
--project=musa5090s26-team3 \
--source=scripts_workflow/workflow_septa_stops.yaml \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'

```

### 3.2. Workflow Testing Scripts
```bash
# OPA Assessments
gcloud workflows run data-pipeline-phl-opa-assessments --location=us-central1

# OPA Properties
gcloud workflows run data-pipeline-phl-opa-properties --location=us-central1

# PWD Parcels
gcloud workflows run data-pipeline-phl-pwd-parcels --location=us-central1

# Real Estate Transfers
gcloud workflows run data-pipeline-phl-real-estate-transfers --location=us-central1

# Schools
gcloud workflows run data-pipeline-phl-schools --location=us-central1

# SEPTA Stops
gcloud workflows run data-pipeline-phl-septa-stops --location=us-central1


```

## 4. Schedulers
Deploy scheduler jobs logic to automate the running of extract/import workflows.

### 4.1. Scheduler Deploy Scripts
```bash
# OPA Assessments
# OPA Assessments
gcloud scheduler jobs create http scheduler-job-opa-assessments \
--location=us-central1 \
--schedule='0 0 * * 1' \
--time-zone='America/New_York' \
--uri='https://workflowexecutions.googleapis.com/v1/projects/musa5090s26-team3/locations/us-central1/workflows/data-pipeline-phl-opa-assessments/executions' \
--oauth-service-account-email='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'

# OPA Properties
gcloud scheduler jobs create http scheduler-job-opa-properties \
--location=us-central1 \
--schedule='0 0 * * 1' \
--time-zone='America/New_York' \
--uri='https://workflowexecutions.googleapis.com/v1/projects/musa5090s26-team3/locations/us-central1/workflows/data-pipeline-phl-opa-properties/executions' \
--oauth-service-account-email='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'

# PWD Parcels
gcloud scheduler jobs create http scheduler-job-pwd-parcels \
--location=us-central1 \
--schedule='0 0 * * 1' \
--time-zone='America/New_York' \
--uri='https://workflowexecutions.googleapis.com/v1/projects/musa5090s26-team3/locations/us-central1/workflows/data-pipeline-phl-pwd-parcels/executions' \
--oauth-service-account-email='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'

# Real Estate Transfers
gcloud scheduler jobs create http scheduler-job-real-estate-transfers \
--location=us-central1 \
--schedule='0 0 * * 1' \
--time-zone='America/New_York' \
--uri='https://workflowexecutions.googleapis.com/v1/projects/musa5090s26-team3/locations/us-central1/workflows/data-pipeline-phl-real-estate-transfers/executions' \
--oauth-service-account-email='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'

# Philly Schools
gcloud scheduler jobs create http scheduler-job-schools \
--location=us-central1 \
--schedule='0 0 * * 1' \
--time-zone='America/New_York' \
--uri='https://workflowexecutions.googleapis.com/v1/projects/musa5090s26-team3/locations/us-central1/workflows/data-pipeline-phl-schools/executions' \
--oauth-service-account-email='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'

# SEPTA Stops
gcloud scheduler jobs create http scheduler-job-septa-stops \
--location=us-central1 \
--schedule='0 0 * * 1' \
--time-zone='America/New_York' \
--uri='https://workflowexecutions.googleapis.com/v1/projects/musa5090s26-team3/locations/us-central1/workflows/data-pipeline-phl-septa-stops/executions' \
--oauth-service-account-email='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'

```

### 4.2. Scheduler Update Scripts
Run if scheduler jobs need to be updated. Original "create" scripts won't update existing scheduler jobs.
```bash
# OPA Assessments
gcloud scheduler jobs update http scheduler-job-opa-assessments \
--location=us-central1 \
--schedule='0 0 * * 1' \
--time-zone='America/New_York' \
--uri='https://workflowexecutions.googleapis.com/v1/projects/musa5090s26-team3/locations/us-central1/workflows/data-pipeline-phl-opa-assessments/executions' \
--oauth-service-account-email='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'

# OPA Properties
gcloud scheduler jobs update http scheduler-job-opa-properties \
--location=us-central1 \
--schedule='0 0 * * 1' \
--time-zone='America/New_York' \
--uri='https://workflowexecutions.googleapis.com/v1/projects/musa5090s26-team3/locations/us-central1/workflows/data-pipeline-phl-opa-properties/executions' \
--oauth-service-account-email='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'

# PWD Parcels
gcloud scheduler jobs update http scheduler-job-pwd-parcels \
--location=us-central1 \
--schedule='0 0 * * 1' \
--time-zone='America/New_York' \
--uri='https://workflowexecutions.googleapis.com/v1/projects/musa5090s26-team3/locations/us-central1/workflows/data-pipeline-phl-pwd-parcels/executions' \
--oauth-service-account-email='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'

# Real Estate Transfers
gcloud scheduler jobs update http scheduler-job-real-estate-transfers \
--location=us-central1 \
--schedule='0 0 * * 1' \
--time-zone='America/New_York' \
--uri='https://workflowexecutions.googleapis.com/v1/projects/musa5090s26-team3/locations/us-central1/workflows/data-pipeline-phl-real-estate-transfers/executions' \
--oauth-service-account-email='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'

# Philly Schools
gcloud scheduler jobs update http scheduler-job-schools \
--location=us-central1 \
--schedule='0 0 * * 1' \
--time-zone='America/New_York' \
--uri='https://workflowexecutions.googleapis.com/v1/projects/musa5090s26-team3/locations/us-central1/workflows/data-pipeline-phl-schools/executions' \
--oauth-service-account-email='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'

# SEPTA Stops
gcloud scheduler jobs update http scheduler-job-septa-stops \
--location=us-central1 \
--schedule='0 0 * * 1' \
--time-zone='America/New_York' \
--uri='https://workflowexecutions.googleapis.com/v1/projects/musa5090s26-team3/locations/us-central1/workflows/data-pipeline-phl-septa-stops/executions' \
--oauth-service-account-email='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'

```

### 4.3. Scheduler Testing Scripts
```bash
# OPA Assessments
gcloud scheduler jobs run scheduler-job-opa-assessments --location=us-central1

# OPA Properties
gcloud scheduler jobs run scheduler-job-opa-properties --location=us-central1

# PWD Parcels
gcloud scheduler jobs run scheduler-job-pwd-parcels --location=us-central1

# Real Estate Transfers
gcloud scheduler jobs run scheduler-job-real-estate-transfers --location=us-central1

# Schools
gcloud scheduler jobs run scheduler-job-schools --location=us-central1

# SEPTA Stops
gcloud scheduler jobs run scheduler-job-septa-stops --location=us-central1
```
