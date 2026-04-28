CREATE OR REPLACE TABLE ${dataset_name_core}.core_phl_opa_assessments
AS
SELECT
    src.parcel_number AS parcel_id,
    src.year,
    src.market_value,
    src.taxable_land,
    src.taxable_building,
    src.exempt_land,
    src.exempt_building
FROM ${dataset_name_source}.source_phl_opa_assessments AS src;
