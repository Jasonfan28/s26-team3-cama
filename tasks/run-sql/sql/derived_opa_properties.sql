CREATE OR REPLACE TABLE ${dataset_name_derived}.derived_opa_properties AS
WITH base AS (
    SELECT o.*
    FROM ${dataset_name_core}.core_phl_opa_properties o
    INNER JOIN ${dataset_name_core}.core_phl_pwd_parcels p
        ON o.parcel_id = p.parcel_id
),

distances AS (
    SELECT
        b.*,
        s.stopid,
        ST_DISTANCE(b.geometry, s.geometry) AS dist,
        ROW_NUMBER() OVER (
            PARTITION BY b.parcel_id
            ORDER BY ST_DISTANCE(b.geometry, s.geometry)
        ) AS rn
    FROM base b
    CROSS JOIN ${dataset_name_core}.core_phl_septa_stops s
),

knn AS (
    SELECT *
    FROM distances
    WHERE rn <= 3
)

SELECT
    b.parcel_id,
    b.sale_price,
    b.sale_date,
    b.total_livable_area,
    b.census_tract,
    b.zoning,
    (2026 - CAST(b.year_built AS INT64)) AS age,
    AVG(k.dist) AS septa_dist
FROM base b
LEFT JOIN knn k
    ON b.parcel_id = k.parcel_id
GROUP BY ALL;
