## 3. Workflows
Deploy overall workflow to GCloud.

### 3.1. Workflow Deploy Scripts
```bash
# Workflow Main
gcloud workflows deploy workflow-main \
--location=us-central1 \
--project=musa5090s26-team3 \
--source=scripts_workflow/workflow_main.yaml \
--service-account='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'
```

### 3.2. Workflow Testing Scripts
```bash
# Main Workflow
gcloud workflows run workflow-main --location=us-central1
```

## 4. Schedulers
Deploy scheduler jobs logic to automate the running of extract/import workflows.

### 4.1. Scheduler Deploy Scripts
```bash
# Main
gcloud scheduler jobs create http scheduler-main \
--location=us-central1 \
--schedule='0 0 * * 1' \
--time-zone='America/New_York' \
--uri='https://workflowexecutions.googleapis.com/v1/projects/musa5090s26-team3/locations/us-central1/workflows/workflow-main/executions' \
--oauth-service-account-email='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'
```

### 4.2. Scheduler Update Scripts
Run if scheduler jobs need to be updated. Original "create" scripts won't update existing scheduler jobs.
```bash
# Main
gcloud scheduler jobs update http scheduler-main \
--location=us-central1 \
--schedule='0 0 * * 1' \
--time-zone='America/New_York' \
--uri='https://workflowexecutions.googleapis.com/v1/projects/musa5090s26-team3/locations/us-central1/workflows/workflow-main/executions' \
--oauth-service-account-email='data-pipeline-user@musa5090s26-team3.iam.gserviceaccount.com'
```

### 4.3. Scheduler Testing Scripts
```bash
# Scheduler Main
gcloud scheduler jobs run scheduler-main --location=us-central1
```