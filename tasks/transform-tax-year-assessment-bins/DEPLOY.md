## Function Deploy Commands

### Transform Tax Year Assessment Bins
```bash
gcloud functions deploy transform-tax-year-assessment-bins \
--gen2 \
--region=us-central1 \
--runtime=python311 \
--source=../transform-tax-year-assessment-bins \
--entry-point=main \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com' \
--memory=512Mi \
--timeout=120 \
--no-allow-unauthenticated \
--trigger-http
```

# Call function
gcloud functions call transform-tax-year-assessment-bins \
  --region=us-central1 \
  --project=musa5090s26-team3