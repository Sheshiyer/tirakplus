# Muse KV Versioning

Muse runtime configuration is versioned by policy, corpus, and app id.

- `MUSE_POLICY_VERSION`: source-controlled policy version exported by the Worker.
- `APP_CONFIG:<appId>`: KV app configuration for enabled state, model ids, corpus id, and search defaults.
- `index:<appId>`: KV corpus index created by `/v1/ingest`.
- `corpusId`: release label for the corpus pack that produced the index.

## Promotion Steps

1. Update prompt policy, corpus, or eval fixtures in source control.
2. Run `npm run muse:corpus`, `npm run muse:eval`, `npm run copy:audit`, and `npm run quality:release`.
3. Ingest the approved corpus into the target Worker app id.
4. Confirm `/v1/search` and `/v1/chat` return the expected `policyVersion`, `retrievedCount`, and role intent.
5. Promote KV config only after eval and copy gates pass.

## Rollback

Rollback is a config pointer change: restore the previous `corpusId` and re-ingest the previous index for the app id. Keep at least one previously approved corpus artifact available in the repo or release bundle.
