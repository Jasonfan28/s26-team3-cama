import os
import io
import functions_framework
import pandas as pd
import geopandas as gpd
from google.cloud import storage

@functions_framework.http
def export_property_tile_info(request):
    try:
        # --- Config ---
        bucket          = os.environ["BUCKET_NAME"]
        parquet_file    = os.environ["PARQUET_FILE"]
        opa_props_file  = os.environ["OPA_PROPERTIES_FILE"]
        output_bucket   = os.environ["OUTPUT_BUCKET"]
        output_file     = os.environ["OUTPUT_FILE"]

        client = storage.Client()

        def read_parquet(bucket_name, filename, cols=None):
            blob = client.bucket(bucket_name).blob(filename)
            data = blob.download_as_bytes()
            return pd.read_parquet(io.BytesIO(data), columns=cols)

        # --- Load assessments, keep only latest year per parcel ---
        print("Loading opa_assessments...")
        assessments = read_parquet(bucket, parquet_file, cols=[
            "parcel_number", "year", "market_value"
        ])
        assessments["parcel_number"] = assessments["parcel_number"].astype(str).str.strip()
        assessments = assessments.sort_values("year").groupby("parcel_number").last().reset_index()
        print(f"Assessments after dedup: {len(assessments)} rows")

        # --- Load properties with geometry ---
        print("Loading opa_properties...")
        properties = read_parquet(bucket, opa_props_file, cols=[
            "parcel_number", "the_geom", "building_code_description", "category_code_description",
            "number_of_bathrooms", "number_of_bedrooms", "number_stories",
            "total_livable_area", "total_area", "year_built",
            "sale_date", "sale_price", "owner_1", "zip_code", "zoning"
        ])
        properties["parcel_number"] = properties["parcel_number"].astype(str).str.strip()

        # --- Filter residential ---
        print("Filtering residential...")
        RESIDENTIAL_CATEGORIES = [
            "SINGLE FAMILY",
            "MULTI FAMILY",
            "APARTMENTS  > 4 UNITS",
            "GARAGE - RESIDENTIAL",
            "VACANT LAND - RESIDENTIAL",
        ]
        properties = properties[properties["category_code_description"].isin(RESIDENTIAL_CATEGORIES)]
        print(f"Properties after filter: {len(properties)} rows")

        # --- Keep only latest record per parcel in properties ---
        properties = properties.groupby("parcel_number").last().reset_index()
        print(f"Properties after dedup: {len(properties)} rows")

        # --- Join assessments ---
        print("Joining assessments...")
        combined = properties.merge(assessments, on="parcel_number", how="left")
        print(f"Combined rows: {len(combined)}")

        # --- Convert to GeoDataFrame ---
        print("Converting to GeoDataFrame...")
        combined["geometry"] = gpd.GeoSeries.from_wkb(combined["the_geom"])
        gdf = gpd.GeoDataFrame(combined.drop(columns=["the_geom"]), geometry="geometry", crs="EPSG:4326")

        # --- Export to GeoJSON ---
        print("Converting to GeoJSON...")
        geojson_str = gdf.to_json()

        # --- Upload to GCS ---
        print(f"Uploading to {output_bucket}/{output_file}...")
        blob = client.bucket(output_bucket).blob(output_file)
        blob.upload_from_string(geojson_str, content_type="application/json")

        print("Done!")
        return f"Success! Exported {len(gdf)} rows to {output_bucket}/{output_file}", 200

    except Exception as e:
        print(f"Error: {e}")
        return f"Error: {str(e)}", 500