FROM python:3.8-slim

WORKDIR /usr/src/app/
ADD requirements.txt .
RUN pip3 install -r requirements.txt
RUN python3 -c "import nltk; nltk.download('stopwords'); nltk.download('punkt')"
RUN mkdir -p src/backend/sentence_classification_api
COPY src/backend/sentence_classification_api src/backend/sentence_classification_api

ENV PYTHONPATH=$PYTHONPATH:/usr/src/app/

EXPOSE ${PORT}
CMD python3 src/backend/sentence_classification_api/sentence_classification_api.py >> /var/log/sentence_classification_api.log 2>&1