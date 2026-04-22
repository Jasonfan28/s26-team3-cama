import io
import json
import logging
import os

import functions_framework
from google.cloud import bigquery, exceptions, storage


def query_assessment_bins(project_id: str) -> list[dict]:
    client = bigquery.Client(project=project_id)
    query = """
        SELECT
            lower_bound,
            upper_bound,
            property_count
        FROM `musa5090s26-team3.derived.current_assessment_bins`
        ORDER BY lower_bound
    """
    rows = client.query(query).result()
    return [dict(row) for row in rows]


def query_tax_year_assessment_bins(project_id: str) -> list[dict]:
    client = bigquery.Client(project=project_id)
    query = """
        SELECT
            tax_year,
            lower_bound,
            upper_bound,
            property_count
        FROM `musa5090s26-team3.derived.tax_year_assessment_bins`
        ORDER BY tax_year, lower_bound
    """
    rows = client.query(query).result()
    return [dict(row) for row in rows]


def upload_json_to_gcs(data: list[dict], bucket_name: str, blob_name: str):
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    json_bytes = json.dumps(data, indent=2).encode("utf-8")
    blob.upload_from_file(
        io.BytesIO(json_bytes),
        content_type="application/json",
    )
    logging.info(f"Uploaded {blob_name} to {bucket_name}.")


@functions_framework.http
def generate_assessment_chart_configs(request):
    logging.info("Generating assessment chart configs...")

    try:
        project_id = os.environ["PROJECT_ID"]
        bucket_name = os.environ["BUCKET_NAME"]
    except KeyError as e:
        logging.error(f"Configuration error: {e}")
        return ("Server misconfiguration", 500)

    errors = []

    # --- current_assessment_bins ---
    current_blob_name = "configs/current_assessment_bins.json"
    try:
        current_rows = query_assessment_bins(project_id)
    except exceptions.GoogleCloudError as e:
        logging.exception(f"BigQuery query failed for current_assessment_bins: {e}")
        errors.append("current_assessment_bins query failed")
        current_rows = None

    if current_rows is not None:
        try:
            upload_json_to_gcs(current_rows, bucket_name, current_blob_name)
        except exceptions.GoogleCloudError as e:
            logging.exception(f"Upload failed for {current_blob_name}: {e}")
            errors.append(f"Upload failed for {current_blob_name}")

    # --- tax_year_assessment_bins ---
    tax_year_blob_name = "configs/tax_year_assessment_bins.json"
    try:
        tax_year_rows = query_tax_year_assessment_bins(project_id)
    except exceptions.GoogleCloudError as e:
        logging.exception(f"BigQuery query failed for tax_year_assessment_bins: {e}")
        errors.append("tax_year_assessment_bins query failed")
        tax_year_rows = None

    if tax_year_rows is not None:
        try:
            upload_json_to_gcs(tax_year_rows, bucket_name, tax_year_blob_name)
        except exceptions.GoogleCloudError as e:
            logging.exception(f"Upload failed for {tax_year_blob_name}: {e}")
            errors.append(f"Upload failed for {tax_year_blob_name}")

    if errors:
        return (f"Completed with errors: {'; '.join(errors)}", 500)

    return ("Successfully generated current_assessment_bins.json and tax_year_assessment_bins.json.", 200)
