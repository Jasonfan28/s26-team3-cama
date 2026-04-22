import functions_framework
from google.cloud import bigquery


@functions_framework.http
def main(request):
    client = bigquery.Client()
    project = client.project

    with open('create_derived_current_assessment_bins.sql', 'r') as f:
        sql = f.read()

    sql = sql.replace('{project}', project)

    job = client.query(sql)
    job.result()

    return ('Created derived.current_assessment_bins', 200)