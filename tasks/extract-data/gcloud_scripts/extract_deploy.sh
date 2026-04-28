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

# Web Dataset (final export)
gcloud functions deploy extract_web_dataset \
--gen2 \
--region=us-central1 \
--runtime=python311 \
--source=. \
--entry-point=extract_web_dataset \
--set-env-vars='DATASET_TABLE=musa5090s26-team3.derived.derived_web_dataset,BUCKET_NAME=musa5090s26-team3-public,BLOB_WEB_DATA=web_dataset/web_dataset.geojson' \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com' \
--memory=8Gi \
--timeout=240 \
--no-allow-unauthenticated \
--trigger-http
