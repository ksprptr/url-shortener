# Postman collection — URL Shortener API

`url-shortener-api.postman_collection.json` is a regression pass over every API endpoint: happy paths plus
the edge cases (bad credentials, rejected payloads, unknown ids, disabled links). It asserts status
codes and response shape, so it is a real check, not just a set of saved requests.

## Running it

The environment file holds the actual values and is **gitignored** — create it locally:

```bash
cp postman/local.postman_environment.example.json postman/local.postman_environment.json
# then set operatorPassword to the password whose bcrypt hash is in apps/api/.env
```

```bash
postman collection run postman/url-shortener-api.postman_collection.json \
  -e postman/local.postman_environment.json
```

The requests share a cookie jar, so the auth group logs in once and the admin group reuses that
session. Run the whole collection in order — later requests depend on variables earlier ones set
(`publicSlug`, `adminLinkId`).

It cleans up after itself: the link it creates is deleted by the last admin request.
