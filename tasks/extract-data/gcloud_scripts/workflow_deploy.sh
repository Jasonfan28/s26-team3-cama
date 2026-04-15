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
