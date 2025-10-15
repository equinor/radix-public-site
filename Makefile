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

docusaurus-serve:
	./node_modules/.bin/docusaurus start --port 8000 --host 0.0.0.0

docusaurus-generate:
	./node_modules/.bin/docusaurus build

techdocs-serve:
	uv run npx @techdocs/cli@1.9.8 serve --no-docker -v -c ./mkdocs.yml --mkdocs-port 8001

techdocs-generate:
	uv run npx @techdocs/cli@1.9.8 generate --no-docker -v