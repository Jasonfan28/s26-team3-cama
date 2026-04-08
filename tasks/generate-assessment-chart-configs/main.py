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
        FROM `derived.current_assessment_bins`
        ORDER BY lower_bound
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

    blob_name = "configs/current_assessment_bins.json"

    try:
        rows = query_assessment_bins(project_id)
    except exceptions.GoogleCloudError as e:
        logging.exception(f"BigQuery query failed: {e}")
        return ("BigQuery query failed", 500)

    try:
        upload_json_to_gcs(rows, bucket_name, blob_name)
    except exceptions.GoogleCloudError as e:
        logging.exception(f"Upload failed for {blob_name} in {bucket_name}: {e}")
        return ("Upload failed", 500)

    return (f"Successfully generated {blob_name}.", 200)
