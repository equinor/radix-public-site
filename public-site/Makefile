.PHONY: dev-up
dev-up:
	docker compose --profile dev up --build

.PHONY: dev-down
dev-down:
	docker compose --profile dev down

.PHONY: prod-up
prod-up:
	docker compose --profile prod up --build

.PHONY: prod-down
prod-down:
	docker compose --profile prod down

varia-techdocs:
	uv run ./scripts/mkdocs-preprocess.sh

techdocs-serve: varia-techdocs
	npx techdocs-cli serve --no-docker -v

techdocs-generate: varia-techdocs
	npx techdocs-cli generate --no-docker -v