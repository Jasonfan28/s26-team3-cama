# Main
gcloud scheduler jobs create http scheduler-main \
--location=us-central1 \
--schedule='0 0 * * 1' \
--time-zone='America/New_York' \
--uri='https://workflowexecutions.googleapis.com/v1/projects/musa5090s26-team3/locations/us-central1/workflows/workflow-main/executions' \
--oauth-service-account-email='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'