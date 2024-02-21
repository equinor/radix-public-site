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

.PHONY: build-dist
build-dist:
	npm run build

.PHONY: run-dist
run-dist:
	npm run serve

.PHONY: run-rebuilt-dist
run-rebuild:
	npm run build && npm run serve

.PHONY: run-docker-dev
run-docker-dev:
	docker compose -f docker-compose.yml up

.PHONY: build-docker
build-docker:
	docker build . -t public-site

.PHONY: run-docker
run-docker:
	docker run -it -p 3000:3000 public-site

.PHONY: down
down:
	docker compose down

