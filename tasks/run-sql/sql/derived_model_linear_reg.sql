CREATE OR REPLACE MODEL ${dataset_name_derived}.model_lin_reg_baseline
OPTIONS (
    MODEL_TYPE = 'LINEAR_REG',
    INPUT_LABEL_COLS = ['sale_price']
)
AS SELECT
    sale_price,
    total_livable_area,
    zoning,
    age,
    census_tract,
    septa_dist

FROM ${dataset_name_derived}.derived_training_data;
