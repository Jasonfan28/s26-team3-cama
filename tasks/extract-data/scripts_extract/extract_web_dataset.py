import json
import os
from google.cloud import bigquery, storage
import functions_framework

DATASET_TABLE = os.environ["DATASET_TABLE"]
BUCKET_NAME = os.environ["BUCKET_NAME"]
BLOB_WEB_DATA = os.environ["BLOB_WEB_DATA"]


@functions_framework.http
def extract_web_dataset(request):
    bq = bigquery.Client()

    query = f"SELECT * FROM `{DATASET_TABLE}`"
    rows = bq.query(query).result()

    features = []

    for row in rows:
        feature = {
            "type": "Feature",
            "geometry": json.loads(row.geometry),  # assumes GeoJSON-compatible
            "properties": {
                "parcel_id": row.parcel_id,
                "market_value_2024": row.market_value_2024,
                "market_value_2025": row.market_value_2025,
                "pred_value": row.pred_value,
                "address": row.address,
            }
        }
        features.append(feature)

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(blob_name=BLOB_WEB_DATA)

    blob.upload_from_string(
        json.dumps(geojson),
        content_type="application/geo+json"
    )

    return "Export complete", 200
