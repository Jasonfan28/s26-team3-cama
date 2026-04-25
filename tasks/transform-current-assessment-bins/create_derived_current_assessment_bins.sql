CREATE OR REPLACE TABLE `{project}.derived.current_assessment_bins` AS

WITH residential_parcels AS (
    SELECT DISTINCT parcel_number AS parcel_id
    FROM `{project}.source.source_phl_opa_properties`
    WHERE category_code_description IN (
        'SINGLE FAMILY',
        'MULTI FAMILY',
        'APARTMENTS  > 4 UNITS',
        'GARAGE - RESIDENTIAL',
        'VACANT LAND - RESIDENTIAL'
    )
)

SELECT
    CAST(FLOOR(SAFE_CAST(p.pred_value AS FLOAT64) / 25000) * 25000 AS INT64) AS lower_bound,
    CAST((FLOOR(SAFE_CAST(p.pred_value AS FLOAT64) / 25000) + 1) * 25000 AS INT64) AS upper_bound,
    COUNT(*) AS property_count
FROM `{project}.derived.derived_predicted_values` AS p
INNER JOIN residential_parcels USING (parcel_id)
WHERE
    p.pred_value IS NOT NULL
    AND SAFE_CAST(p.pred_value AS FLOAT64) > 0
GROUP BY
    lower_bound,
    upper_bound
ORDER BY
    lower_bound
