FROM python:3

WORKDIR /usr/src/app

ADD requirements.txt .

RUN pip3 install -r requirements.txt

ADD . /usr/src/app

ENV TPC_API_TOKEN=""

CMD ./afp_pipeline.py -t ${TPC_API_TOKEN} -L INFO -n1