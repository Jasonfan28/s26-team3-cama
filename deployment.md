## Cloud Storage CORS Configuration

The public bucket has a CORS configuration that allows the web application to access the files in the bucket. The configuration was applied using a permissive wildcard setup (`origin: ["*"]`) to ensure smooth access during development.

The command used to set that configuration is:
`gcloud storage buckets update gs://musa5090s26-team3-public --cors-file=cors.json`

