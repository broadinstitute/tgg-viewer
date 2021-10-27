TAG1 = weisburd/rnaseq-utils:v1
TAG2 = weisburd/rnaseq-utils:latest

all: build push

build:
	docker build -t $(TAG1) -t $(TAG2) .

push:
	docker push $(TAG1)
	docker push $(TAG2)
