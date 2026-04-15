import os
import io
import logging
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import geopandas as gpd

import functions_framework
from google.cloud import storage, exceptions


def data_to_geoparquet(url: str):
    """
    Function to validate URL and convert GeoJSON to GeoParquet
    """
    with requests.Session() as session:
        retries = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET"]
        )
        session.mount("https://", HTTPAdapter(max_retries=retries))

        response = session.get(url, timeout=120)
        response.raise_for_status()

        # basic content validation
        content_type = response.headers.get("Content-Type", "")
        if "error" in response.text.lower():
            raise ValueError("Remote URL response contains error payload")

        if not any(ct in content_type.lower() for ct in ["application/json", "geo+json", "json"]):
            logging.warning(f"Unexpected Content-Type '{content_type}' on {url}, attempting gpd read anyway.")

    gdf = gpd.read_file(io.BytesIO(response.content)).to_crs(crs="EPSG:4326")
    gdf.columns = gdf.columns.str.lower()

    if gdf.empty:
        raise ValueError("Loaded GeoDataFrame is empty")

    buffer = io.BytesIO()
    gdf.to_parquet(buffer, engine="pyarrow", index=False)
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
def extract_phl_septa_stops(request):

    logging.info("Extracting SEPTA Stops...")

    try:
        bucket_name = os.environ["BUCKET_NAME"]
        blob_name = os.environ["BLOB_SEPTA_STOPS"]
    except (KeyError, ValueError) as e:
        logging.error(f"Configuration error {e}")
        return ("Server misconfiguration", 500)

    URL_SEPTA = "https://hub.arcgis.com/api/v3/datasets/b227f3ddbe3e47b4bcc7b7c65ef2cef6_0/downloads/data?format=geojson&spatialRefId=4326&where=1%3D1"

    try:
        data = data_to_geoparquet(URL_SEPTA)

        try:
            upload_to_gcloud(
                obj=data,
                bucket_name=bucket_name,
                blob_name=blob_name
                )
        finally:
            data.close()
    except (requests.RequestException, ValueError, exceptions.GoogleCloudError) as e:
        logging.exception(f"Upload failed for {blob_name} in {bucket_name}: {e}")
        return ("Upload failed", 500)

    return ("Successfully imported SEPTA Stations.", 200)
