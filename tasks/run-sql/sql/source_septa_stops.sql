CREATE OR REPLACE EXTERNAL TABLE ${dataset_name_source}.source_phl_septa_stops (
    fid INT64,
    lineabbr STRING,
    direction STRING,
    `sequence` INT64,
    stopid INT64,
    stopabbr STRING,
    stopname STRING,
    lon FLOAT64,
    lat FLOAT64,
    `geometry` GEOGRAPHY
)
OPTIONS (
    format = "PARQUET",
    uris = ['gs://${bucket_name}/septa_stops/septa_stops.geoparquet']
)
