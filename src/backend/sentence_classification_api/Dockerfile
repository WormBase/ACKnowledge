FROM python:3.8-slim

WORKDIR /usr/src/app/
ADD requirements.txt .
RUN pip3 install -r requirements.txt
RUN python3 -c "import nltk; nltk.download('stopwords'); nltk.download('punkt')"
RUN mkdir -p src/backend/sentence_embedding_api
COPY src/backend/sentence_embedding_api src/backend/sentence_embedding_api

ENV PYTHONPATH=$PYTHONPATH:/usr/src/app/

EXPOSE ${PORT}
CMD python3 src/backend/sentence_embedding_api/sentence_embedding_api.py >> /var/log/sentence_embedding_api.log 2>&1