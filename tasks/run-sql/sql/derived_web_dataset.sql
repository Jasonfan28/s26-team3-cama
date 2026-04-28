CREATE OR REPLACE TABLE ${dataset_name_derived}.derived_web_dataset AS
WITH assess AS (
    SELECT
        parcel_id,
        _2024 AS market_value_2024,
        _2025 AS market_value_2025
    FROM (
        SELECT *
        FROM (
            SELECT parcel_id, year, market_value
            FROM ${dataset_name_core}.core_phl_opa_assessments
        )
        PIVOT (
            MAX(market_value)
            FOR year IN (2024, 2025)
        )
    )
),

preds AS (
    SELECT parcel_id, pred_value
    FROM ${dataset_name_derived}.derived_predicted_values
),

props AS (
    SELECT parcel_number AS parcel_id, mailing_street AS address
    FROM ${dataset_name_source}.source_phl_opa_properties
),

parcels AS (
    SELECT parcel_id, geometry
    FROM ${dataset_name_core}.core_phl_pwd_parcels
)

SELECT
    a.parcel_id,
    a.market_value_2024,
    a.market_value_2025,
    p.pred_value,
    pr.address,
    ST_ASGEOJSON(ge.geometry) AS geometry
FROM assess a
LEFT JOIN preds p ON a.parcel_id = p.parcel_id
LEFT JOIN props pr ON a.parcel_id = pr.parcel_id
LEFT JOIN parcels ge ON a.parcel_id = ge.parcel_id
WHERE ge.geometry IS NOT NULL;
