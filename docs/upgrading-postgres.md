# Upgrading Postgres

The bundled database is **Postgres 18** (`POSTGRES_VERSION` in the root `.env`; 17 still works if
you pin it).

Postgres never opens a data directory written by a different major version, so moving an existing
instance from 17 to 18 is a **dump and restore**, not a version bump. If you just change the number,
the container refuses to start with `database files are incompatible with server` — your data is
untouched, but nothing comes up until you either restore properly or pin the version back.

A fresh install needs none of this: the first `docker compose up` initializes the cluster on
whatever version is configured.

## Upgrade

Everything below runs from the repo root, with the stack currently on the **old** version.

```bash
# 1. Stop the apps so nothing writes during the dump; leave the database running.
docker compose stop url-shortener-web url-shortener-api

# 2. Dump the database (reads DB_USER / DB_NAME from your root .env).
source .env
docker compose exec -T url-shortener-pg pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists > url-shortener-backup.sql

# 3. Sanity-check the dump BEFORE deleting anything — it must be non-empty and end with a complete
#    statement. No file, no upgrade.
tail -n 3 url-shortener-backup.sql && ls -lh url-shortener-backup.sql

# 4. Remove the old cluster. `-v` drops the project's volumes, which is exactly the point: the new
#    major needs an empty data directory. (The Redis volume goes too — it only holds rate-limit
#    counters, nothing to preserve.)
docker compose down -v

# 5. Bump POSTGRES_VERSION in .env (e.g. 17 -> 18), then start the new database alone.
docker compose up -d url-shortener-pg

# 6. Restore into the database the entrypoint just created.
docker compose exec -T url-shortener-pg psql -U "$DB_USER" -d "$DB_NAME" < url-shortener-backup.sql

# 7. Bring the rest back up. `url-shortener-migrate` finds every migration already applied and exits.
docker compose up -d --build
```

## After the upgrade

Verify before deleting the dump: sign in to `/admin`, check that the totals and the 30-day chart
still show your history, and follow one short link end to end.

Keep `url-shortener-backup.sql` until you are satisfied — it is the only copy of that state. It is
gitignored, but it still contains every link, the operator's refresh-token rows and the token
version, so delete it once the upgrade is done rather than leaving it around.

## What is actually at stake

The database holds every short link with its click counter and per-day totals, the operator's
refresh-token sessions and the token version that invalidates them. Nothing about a visitor is
stored, and the links themselves are just rows: the worst case of losing the database is that every
short URL you handed out stops resolving and you are signed out of the admin.

## Postgres managed outside compose

If your Postgres runs as a Coolify service, RDS, or any managed provider, the same dump and restore
applies — run it against that service instead, using whatever upgrade path it documents. Only steps
4 and 5 are compose-specific.
