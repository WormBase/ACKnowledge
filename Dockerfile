FROM ubuntu:16.04

RUN apt update && apt install -y python3 python3-pip cron

WORKDIR /usr/src/app

ADD requirements.txt .

RUN pip3 install -r requirements.txt

ADD . /usr/src/app

ENV TPC_API_TOKEN=""

ADD crontab /etc/cron.d/afp-cron
RUN chmod 0644 /etc/cron.d/afp-cron
RUN touch /var/log/cron.log

CMD echo $TPC_API_TOKEN > /etc/tpc_api_token && cron /etc/cron.d/afp-cron && tail -f /var/log/cron.log
#CMD ./afp_pipeline.py -t ${TPC_API_TOKEN} -L INFO -n1