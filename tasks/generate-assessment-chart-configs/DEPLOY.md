## Function Deploy Commands

### Generate Assessment Chart Configs
```bash
gcloud functions deploy generate-assessment-chart-configs \
--gen2 \
--region=us-central1 \
--runtime=python311 \
--source=. \
--entry-point=generate_assessment_chart_configs \
--set-env-vars='PROJECT_ID=musa5090s26-team3,BUCKET_NAME=musa5090s26-team3-public' \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com' \
--memory=512Mi \
--timeout=120 \
--no-allow-unauthenticated \
--trigger-http
```

# call

gcloud functions call generate-assessment-chart-configs \
  --region=us-central1 \
  --project=musa5090s26-team3