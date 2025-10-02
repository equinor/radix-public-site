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
	python3 ./scripts/copy_images.py
	python3 ./scripts/convert_admonitions.py
	sed -i -e '/<RadixTeam \/>/r docs/community/RadixTeam.md' -e '/<RadixTeam \/>/d' docs/community/index.md

techdocs-serve: varia-techdocs
	techdocs-cli serve --no-docker -v

techdocs-generate: varia-techdocs
	techdocs-cli generate --no-docker -v