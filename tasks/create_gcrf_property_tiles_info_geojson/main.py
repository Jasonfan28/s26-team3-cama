import os
import json
import functions_framework
import geopandas as gpd
from shapely.geometry import shape
from google.cloud import storage, bigquery


@functions_framework.http
def export_property_tile_info(request):
    try:
        # --- Config ---
        project = os.environ["GCP_PROJECT"]
        dataset_derived = os.environ["BQ_DATASET_DERIVED"]
        dataset_core = os.environ["BQ_DATASET_CORE"]
        output_bucket = os.environ["OUTPUT_BUCKET"]
        output_file = os.environ["OUTPUT_FILE"]

        gcs_client = storage.Client()
        bq_client = bigquery.Client(project=project)

        query = f"""
            WITH residential_parcels AS (
                SELECT DISTINCT parcel_id
                FROM `{project}.{dataset_core}.core_phl_opa_properties`
                WHERE category_code = '1'
            ),
            web_data AS (
                SELECT * EXCEPT(rn)
                FROM (
                    SELECT
                        parcel_id,
                        market_value_2024,
                        market_value_2025,
                        address,
                        geometry,
                        ROW_NUMBER() OVER (PARTITION BY parcel_id ORDER BY parcel_id) AS rn
                    FROM `{project}.{dataset_derived}.derived_web_dataset`
                ) WHERE rn = 1
            ),
            pred_data AS (
                SELECT * EXCEPT(rn)
                FROM (
                    SELECT
                        parcel_id,
                        pred_value,
                        ROW_NUMBER() OVER (PARTITION BY parcel_id ORDER BY parcel_id) AS rn
                    FROM `{project}.{dataset_derived}.derived_predicted_values`
                ) WHERE rn = 1
            )
            SELECT
                w.parcel_id,
                w.market_value_2024,
                w.market_value_2025,
                p.pred_value,
                w.address,
                w.geometry
            FROM web_data w
            INNER JOIN residential_parcels r USING (parcel_id)
            LEFT JOIN pred_data p USING (parcel_id)
        """

        print("Querying BigQuery...")
        df = bq_client.query(query).to_dataframe()
        print(f"Loaded {len(df)} rows from BigQuery")

        # --- Convert to GeoDataFrame ---
        print("Converting to GeoDataFrame...")
        df["geometry"] = df["geometry"].apply(lambda x: shape(json.loads(x)))
        gdf = gpd.GeoDataFrame(df, geometry="geometry", crs="EPSG:4326")

        # --- Export to GeoJSON ---
        print("Converting to GeoJSON...")
        geojson_str = gdf.to_json()

        # --- Upload to GCS ---
        print(f"Uploading to {output_bucket}/{output_file}...")
        blob = gcs_client.bucket(output_bucket).blob(output_file)
        blob.upload_from_string(geojson_str, content_type="application/json")

        print("Done!")
        return f"Success! Exported {len(gdf)} rows to {output_bucket}/{output_file}", 200

    except Exception as e:
        print(f"Error: {e}")
        return f"Error: {str(e)}", 500
