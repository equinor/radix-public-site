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
	python ./scripts/copy_images.py
	python ./scripts/convert_admonitions.py
	sed -i -e '/<RadixTeam \/>/r public-site/docs/community/RadixTeam.md' -e '/<RadixTeam \/>/d' public-site/docs/community/index.md

techdocs-serve: varia-techdocs
	techdocs-cli serve --no-docker -v

techdocs-generate: varia-techdocs
	techdocs-cli generate --no-docker -v