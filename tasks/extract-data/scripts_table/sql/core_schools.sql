CREATE OR REPLACE TABLE ${dataset_name_core}.core_phl_schools AS
SELECT
    objectid,
    school_name,
    zip_code,
    `geometry`
FROM ${dataset_name_source}.source_phl_schools
WHERE
    school_name IS NOT NULL;
