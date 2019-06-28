FROM python:3.7-slim

RUN apt-get update && apt-get install cron

WORKDIR /usr/src/app/
ADD requirements.txt .
RUN pip3 install -r requirements.txt
COPY src/backend/pipeline src/backend/pipeline
COPY src/backend/common src/backend/common

ENV EMAIL_PASSWD=""
ENV DB_HOST=""
ENV DB_NAME=""
ENV DB_USER=""
ENV DB_PASSWD=""
ENV PORT=8000
ENV ADMINS=""
ENV NUM_PAPERS_PER_RUN=10
ENV AFP_BASE_URL="http://textpressocentral.org:3000"

ADD src/backend/pipeline/crontab /etc/cron.d/afp-cron
RUN chmod 0644 /etc/cron.d/afp-cron
RUN touch /var/log/afp_pipeline.log
RUN touch /var/log/afp_monthly_digest.log
RUN crontab /etc/cron.d/afp-cron

CMD echo $EMAIL_PASSWD > /etc/afp_email_passwd && \
    echo $DB_HOST > /etc/afp_db_host && \
    echo $DB_NAME > /etc/afp_db_name && \
    echo $DB_USER > /etc/afp_db_user && \
    echo $DB_PASSWD > /etc/afp_db_passwd && \
    echo $ADMINS > /etc/afp_admins && \
    echo $NUM_PAPERS_PER_RUN > /etc/afp_num_papers_per_run && \
    echo $AFP_BASE_URL > /etc/afp_base_url && \
    cron && tail -f /dev/null & > /dev/null &