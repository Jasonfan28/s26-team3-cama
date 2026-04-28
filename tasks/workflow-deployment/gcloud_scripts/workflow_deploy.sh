# Workflow Main
gcloud workflows deploy workflow-main \
--location=us-central1 \
--project=musa5090s26-team3 \
--source=scripts_workflow/workflow_main.yaml \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'
