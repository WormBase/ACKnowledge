FROM python:3.8-slim

RUN apt-get update && apt-get install -y cron

WORKDIR /usr/src/app/
ADD requirements.txt .
RUN pip3 install -r requirements.txt
RUN python3 -c "import nltk; nltk.download('stopwords'); nltk.download('punkt')"
COPY src/backend/ src/backend/

ENV EMAIL_PASSWD=""
ENV DB_HOST=""
ENV DB_NAME=""
ENV DB_USER=""
ENV DB_PASSWD=""
ENV ADMINS=""
ENV NUM_PAPERS_PER_RUN=10
ENV AFP_BASE_URL="http://textpressocentral.org:3000"
ENV TAZENDRA_USER=""
ENV TAZENDRA_PASSWD=""
ENV TPC_TOKEN=""
ENV SSH_USER=""
ENV SSH_PASSWD=""
ENV GROBID_API_URL="http://cervino.caltech.edu:8070/api"

# Cognito authentication for AGR/ABC API access
ENV COGNITO_ADMIN_CLIENT_ID=""
ENV COGNITO_ADMIN_CLIENT_SECRET=""
ENV COGNITO_TOKEN_URL=""
ENV COGNITO_ADMIN_SCOPE=""

ADD src/backend/pipeline/crontab /etc/cron.d/afp-cron
ENV PYTHONPATH=$PYTHONPATH:/usr/src/app/

CMD ["/bin/bash", "src/backend/pipeline/startup_script.sh"]
