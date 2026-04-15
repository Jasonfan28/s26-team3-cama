import os
import io
import logging
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import pandas as pd

import functions_framework
from google.cloud import storage, exceptions


def data_to_parquet(url: str, query: str):
    """
    Function to download data and convert to parquet format
    """

    with requests.Session() as session:
        retries = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET"]
        )
        session.mount("https://", HTTPAdapter(max_retries=retries))

        r = session.get(url, params={"q": query}, timeout=120)
        r.raise_for_status()

        try:
            data_raw = r.json()
        except ValueError:
            logging.error("Invalid JSON response.")
            raise

    if "rows" not in data_raw or not data_raw["rows"]:
        raise ValueError("No data returned from API")

    df = pd.DataFrame(data_raw["rows"])
    df.columns = df.columns.str.lower()

    buffer = io.BytesIO()
    df.to_parquet(buffer, engine="pyarrow", index=False)
    buffer.seek(0)

    return buffer


def upload_to_gcloud(obj, bucket_name, blob_name):
    '''
    Function to upload data to Google Cloud bucket
    '''
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    blob.upload_from_file(obj, content_type="application/x-parquet")

    logging.info(f"Uploaded {blob_name} to {bucket_name}.")


@functions_framework.http
def extract_phl_opa_assessments(request):

    logging.info("Extracting OPA Assessments...")

    try:
        start_year = int(os.environ["START_YEAR"])
        bucket_name = os.environ["BUCKET_NAME"]
        blob_name = os.environ["BLOB_OPA_ASSESS"]
    except (KeyError, ValueError) as e:
        logging.error(f"Configuration error {e}")
        return ("Server misconfiguration", 500)

    query_assess = f"SELECT * FROM assessments WHERE year >= {start_year}"
    URL_ASSESSMENTS = "https://phl.carto.com/api/v2/sql"

    try:
        data = data_to_parquet(URL_ASSESSMENTS, query_assess)

        try:
            upload_to_gcloud(
                obj=data,
                bucket_name=bucket_name,
                blob_name=blob_name
                )
        finally:
            data.close()
    except (requests.RequestException, ValueError, pd.errors.ParserError, exceptions.GoogleCloudError) as e:
        logging.exception(f"Upload failed for {blob_name} in {bucket_name}: {e}")
        return ("Upload failed", 500)

    return ("Successfully imported OPA Assessments.", 200)
