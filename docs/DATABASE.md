# Optional MySQL metadata mode

`DATABASE_URL` is unset by default. In this mode, the existing file-backed demo remains usable. The database is for structured metadata; WAV/FLAC files remain on temporary/local storage and are **not** made durable by this change.

Pinned runtime: SQLAlchemy 2.0.54, Alembic 1.20.0, PyMySQL 1.2.3. MySQL 8.4 is the opt-in local/CI service. Production needs a separately approved provider, non-root credentials, TLS, backups and a media-storage decision. No provider or production secret is configured in this repository.

## Local setup

1. Copy `.env.example` to a private `.env` and set `MYSQL_LOCAL_PASSWORD` and `MYSQL_LOCAL_ROOT_PASSWORD` to unique local passwords. Do not commit `.env`.
2. Start MySQL: `docker compose -f compose.yaml -f compose.db.yaml --profile mysql up -d mysql`.
3. Set `DATABASE_URL=mysql+pymysql://research:<local-password>@127.0.0.1:3306/trishul` in the shell used for migrations. Run `python -m alembic -c alembic.ini upgrade head`.
4. Use the same `DATABASE_URL` when starting the app. `GET /api/readiness` must return `metadata_mode=mysql`, `database=connected`. Without it the endpoint reports `ephemeral_files`.
5. Optionally run `python -m scripts.migrate_file_metadata --source ./artifacts` first as a dry run, then with `--apply`; rerunning is idempotent. For a hosted workspace tree, pass its `experiments` directory. The script does not move media and does not print visitor tokens.
6. Test with `python -m pytest -q tests/test_db.py`. The MySQL integration test runs when `MYSQL_TEST_URL` points at a migrated test database.

## Storage and rollback

The existing endpoint JSON remains unchanged for retained files. With database mode enabled, list/detail access is owner-scoped by a SHA-256 hash of the anonymous capability token. If a DB write fails, the just-created output directory is removed and the request fails rather than claiming to have saved. If DB metadata exists but the temporary report/audio directory is gone, detail returns HTTP 410. Export results before temporary storage expires.

Rollback: stop the app, unset `DATABASE_URL`, restart. The file-backed mode reads existing `report.json` files exactly as before. Database records remain untouched; do not run `alembic downgrade` on production without a verified backup. To reverse the test schema in a disposable local database, run `python -m alembic -c alembic.ini downgrade base`.

Production readiness requires testing direct and embedded browser session behavior, storage expiry, cross-visitor isolation, migration, backup/restore, and deletion policy. This branch is not a production MySQL deployment.
