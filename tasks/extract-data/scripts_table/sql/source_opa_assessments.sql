CREATE OR REPLACE EXTERNAL TABLE ${dataset_name_source}.source_phl_opa_assessments (
    cartodb_id INT64,
    the_geom STRING,
    the_geom_webmercator STRING,
    parcel_number STRING,
    `year` INT64,
    market_value INT64,
    taxable_land FLOAT64,
    taxable_building FLOAT64,
    exempt_land FLOAT64,
    exempt_building FLOAT64,
    objectid INT64
)
OPTIONS (
    format = "PARQUET",
    uris = ['gs://${bucket_name}/opa_assessments/opa_assessments.parquet']
);
