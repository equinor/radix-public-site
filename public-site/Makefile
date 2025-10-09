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
	uv run npx @techdocs/cli@1.9.8 serve --no-docker -v -c ./mkdocs.yml

techdocs-generate: varia-techdocs
	uv run npx @techdocs/cli@1.9.8 generate --no-docker -v