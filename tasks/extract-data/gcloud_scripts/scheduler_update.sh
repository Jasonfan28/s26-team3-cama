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
