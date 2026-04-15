FROM gcr.io/google.com/cloudsdktool/cloud-sdk:slim

RUN apt-get update
RUN apt-get install -y gdal-bin

WORKDIR /workspace
COPY script.sh .
RUN chmod +x ./script.sh

CMD [ "./script.sh" ]