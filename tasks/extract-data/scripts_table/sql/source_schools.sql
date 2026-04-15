CREATE OR REPLACE EXTERNAL TABLE ${dataset_name_source}.source_phl_schools (
    aun FLOAT64,
    school_num FLOAT64,
    location_id STRING,
    school_name STRING,
    school_name_label STRING,
    street_address STRING,
    zip_code STRING,
    phone_number STRING,
    grade_level STRING,
    grade_org STRING,
    enrollment FLOAT64,
    `type` INT64,
    type_specific STRING,
    objectid INT64,
    `geometry` GEOGRAPHY
)
OPTIONS (
    format = "PARQUET",
    uris = ['gs://${bucket_name}/schools/schools.geoparquet']
)
