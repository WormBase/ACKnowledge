FROM python:3.8-slim

WORKDIR /usr/src/app/
ADD requirements.txt .
RUN pip3 install -r requirements.txt
RUN pip3 install gunicorn
RUN python3 -c "import nltk; nltk.download('stopwords'); nltk.download('punkt')"

COPY src/backend src/backend


ENV EMAIL_PASSWD=""
ENV DB_HOST=""
ENV DB_NAME=""
ENV DB_USER=""
ENV DB_PASSWD=""
ENV PORT=8000
ENV ADMINS=""
ENV AFP_BASE_URL="http://textpressocentral.org:3000"
ENV TAZENDRA_USER=""
ENV TAZENDRA_PASSWORD=""
ENV DEV_MODE=""
ENV LOG_FILE=/var/log/afp_db_api.log
ENV INFO_FILE=/var/log/afp_db_api.info
ENV SENTENCE_CLASSIFICATION_API=http://textpressocentral.org:8002

ENV PYTHONPATH=$PYTHONPATH:/usr/src/app/

EXPOSE ${PORT}

CMD gunicorn -b 0.0.0.0:8001 -t 1800 src.backend.api.afp_api:app >> /var/log/afp_api.log 2>&1

#CMD python3 src/backend/api/afp_api.py -N ${DB_NAME} -U ${DB_USER} -P "${DB_PASSWD}" -H ${DB_HOST} -p ${PORT} -a ${ADMINS} -e ${EMAIL_PASSWD} -u ${AFP_BASE_URL} -w ${TAZENDRA_USER} -z ${TAZENDRA_PASSWORD} ${DEV_MODE} -l ${LOG_FILE} -L DEBUG -c ${SENTENCE_CLASSIFICATION_API} >> ${INFO_FILE} 2>&1