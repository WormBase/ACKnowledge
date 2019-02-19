FROM ubuntu:16.04

RUN apt update && apt install -y python3 python3-pip cron

WORKDIR /usr/src/app

ADD requirements.txt .

RUN pip3 install -r requirements.txt

COPY . /usr/src/app

ENV EMAIL_PASSWD=""
ENV DB_HOST=""
ENV DB_NAME=""
ENV DB_USER=""
ENV DB_PASSWD=""
ENV PORT=8000
ENV ADMINS=""
ENV NUM_PAPERS_PER_RUN=10
ENV AFP_BASE_URL="http://textpressocentral.org:3000"

ADD crontab /etc/cron.d/afp-cron
RUN chmod 0644 /etc/cron.d/afp-cron
RUN touch /var/log/cron.log

CMD echo $EMAIL_PASSWD > /etc/afp_email_passwd && \
    echo $DB_HOST > /etc/afp_db_host && \
    echo $DB_NAME > /etc/afp_db_name && \
    echo $DB_USER > /etc/afp_db_user && \
    echo $DB_PASSWD > /etc/afp_db_passwd && \
    echo $ADMINS > /etc/afp_admins && \
    echo $NUM_PAPERS_PER_RUN > /etc/afp_num_papers_per_run && \
    echo $AFP_BASE_URL > /etc/afp_base_url
#    crontab /etc/cron.d/afp-cron && \
#    tail -f /var/log/cron.log

EXPOSE ${PORT}
CMD python3 db_api.py -N ${DB_NAME} -U ${DB_USER} -P ${DB_PASSWD} -H ${DB_HOST} -p ${PORT} -a ${ADMINS} -e ${EMAIL_PASSWD}