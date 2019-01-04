FROM ubuntu:16.04

RUN apt update && apt install -y python3 python3-pip cron

WORKDIR /usr/src/app

ADD requirements.txt .

RUN pip3 install -r requirements.txt

COPY . /usr/src/app

ENV TPC_API_TOKEN=""
ENV EMAIL_PASSWD=""
ENV DB_HOST=""
ENV DB_NAME=""
ENV DB_USER=""
ENV DB_PASSWD=""
ENV PORT=8000
ENV ADMINS=""

ADD crontab /etc/cron.d/afp-cron
RUN chmod 0644 /etc/cron.d/afp-cron
RUN touch /var/log/cron.log

#CMD echo $TPC_API_TOKEN > /etc/tpc_api_token && \
#    echo $EMAIL_PASSWD > /etc/email_passwd && \
#    crontab /etc/cron.d/afp-cron && \
#    tail -f /var/log/cron.log

EXPOSE ${PORT}
CMD python3 db_api.py -N ${DB_NAME} -U ${DB_USER} -P ${DB_PASSWD} -H ${DB_HOST} -p ${PORT} -a ${ADMINS} -e ${EMAIL_PASSWD}