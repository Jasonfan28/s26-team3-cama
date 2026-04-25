gcloud functions deploy transform-current-assessment-bins \
--gen2 \
--region=us-central1 \
--runtime=python311 \
--source=../transform-current-assessment-bins \
--entry-point=main \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com' \
--memory=512Mi \
--timeout=120 \
--no-allow-unauthenticated \
--trigger-http

# Call

gcloud functions call transform-current-assessment-bins \
  --region=us-central1 \
  --project=musa5090s26-team3