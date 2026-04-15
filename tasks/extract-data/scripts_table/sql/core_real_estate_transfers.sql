CREATE OR REPLACE TABLE ${dataset_name_core}.core_phl_real_estate_transfers AS
SELECT
    src.cartodb_id,
    src.the_geom,
    src.document_id,
    src.document_type,
    DATE(TIMESTAMP(src.display_date), "America/New_York") AS display_date,
    src.street_address,
    src.opa_account_num,
    src.record_id
FROM ${dataset_name_source}.source_phl_real_estate_transfers AS src
WHERE
    src.the_geom IS NOT NULL AND
    src.street_address IS NOT NULL AND
    src.opa_account_num IS NOT NULL AND
    src.document_type IS NOT NULL
