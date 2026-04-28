CREATE OR REPLACE TABLE ${dataset_name_core}.core_phl_opa_properties AS
WITH market AS (
    SELECT
        *,
        CAST(sale_price AS INT64) AS sale_price_int
    FROM ${dataset_name_source}.source_phl_opa_properties
    WHERE sale_price > 1000.0 AND sale_price < 3.0e6
),

no_bundled AS (
    SELECT *
    FROM (
        SELECT
            *,
            COUNT(*) OVER (PARTITION BY sale_date, sale_price_int) AS dup_count
        FROM market
    )
    WHERE dup_count = 1
),

selected AS (
    SELECT
        ST_GEOGFROMWKB(FROM_HEX(the_geom)) AS `geometry`,
        CAST(parcel_number AS STRING) AS parcel_id,
        category_code,
        total_livable_area,
        year_built,
        (2026 - CAST(year_built AS INT64)) AS `age`,
        zip_code,
        zoning,
        census_tract,
        DATE(TIMESTAMP(sale_date)) AS sale_date,
        sale_price_int AS sale_price
    FROM no_bundled
),

cleaned AS (
    SELECT *
    FROM selected
    WHERE
        `geometry` IS NOT NULL AND
        parcel_id IS NOT NULL AND
        category_code IS NOT NULL AND
        total_livable_area IS NOT NULL AND
        year_built IS NOT NULL AND
        `age` IS NOT NULL AND
        zip_code IS NOT NULL AND
        zoning IS NOT NULL AND
        census_tract IS NOT NULL AND
        sale_date IS NOT NULL AND
        sale_price IS NOT NULL
)

SELECT *
FROM cleaned;
