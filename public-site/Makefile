.PHONY: lint
lint:
	npm run "lint"
	npm run "lint-ts"


.PHONY: lint-strict
lint-strict:
	npm run "lint-strict"

.PHONY: run
run:
	npm run start

.PHONY: build-dist run-dist run-dist-rebuilt

build-dist:
	npm run build

run-dist:
	npm run serve

run-dist-rebuilt: build-dist run-dist

.PHONY: run-docker-dev
run-docker-dev:
	docker compose -f docker-compose.yml up

.PHONY: build-docker
build-docker:
	docker build . -t public-site

.PHONY: run-docker
run-docker:
	docker run -it -p 8080:8080 public-site

.PHONY: run-docker-rebuilt
run-docker-rebuilt: build-docker run-docker

.PHONY: down
down:
	docker compose down

