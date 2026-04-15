CREATE OR REPLACE EXTERNAL TABLE ${dataset_name_source}.source_phl_pwd_parcels (
    objectid INT64,
    parcelid INT64,
    tencode STRING,
    `address` STRING,
    owner1 STRING,
    owner2 STRING,
    bldg_code STRING,
    bldg_desc STRING,
    brt_id STRING,
    num_brt FLOAT64,
    num_accounts INT64,
    gross_area INT64,
    pin FLOAT64,
    parcel_id STRING,
    shape__area FLOAT64,
    shape__length FLOAT64,
    `geometry` GEOGRAPHY
)
OPTIONS (
    format = "PARQUET",
    uris = ['gs://${bucket_name}/pwd_parcels/pwd_parcels.geoparquet']
)
