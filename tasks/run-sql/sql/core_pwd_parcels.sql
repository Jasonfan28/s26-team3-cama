CREATE OR REPLACE TABLE ${dataset_name_core}.core_phl_pwd_parcels AS
SELECT
    TRIM(brt_id) AS parcel_id,
    address,
    bldg_code,
    bldg_desc,
    shape__area AS shape_area,
    geometry
FROM ${dataset_name_source}.source_phl_pwd_parcels
WHERE LENGTH(TRIM(brt_id)) = 9;
