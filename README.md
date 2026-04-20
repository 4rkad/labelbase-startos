# Labelbase — StartOS package

Self-hosted BIP-329 label management for Bitcoin wallets, packaged for [StartOS](https://start9.com).

## Status

**This is a packaging skeleton.** It will not produce a working `.s9pk` until two prerequisites are met:

### 1. A combined Docker image must exist on a registry

Upstream Labelbase ships **three containers** (Django + MySQL + nginx) and **does not publish prebuilt images**. StartOS expects a **single image per package**, so you must build a combined image first.

Suggested approach — write a multi-stage Dockerfile that bundles:

- The Django app (gunicorn) on port 8000 (loopback)
- MySQL 8 with data dir on `/data/mysql`
- nginx serving static + reverse-proxying Django, listening on **8080**
- A `supervisord.conf` that boots all three
- An entrypoint `/usr/local/bin/start-labelbase.sh` that runs `supervisord -n`

Push it to `ghcr.io/<your-fork>/labelbase:2.3.0` and update `startos/manifest/index.ts` to point to your tag.

### 2. The StartOS SDK build toolchain must be installed

Build steps, from this directory:

```bash
npm install
npm run build       # transpile TS → ./javascript
make                # produce labelbase.s9pk via s9pk.mk
```

You also need `s9pk.mk` (copy from any reference Start9Labs package, e.g. `Start9Labs/hello-world-startos`) — it's not duplicated here to avoid tracking upstream drift.

## Structure

```
labelbase-startos/
├── Makefile
├── README.md
├── icon.svg
├── package.json
├── tsconfig.json
└── startos/
    ├── index.ts            # plumbing — do not edit
    ├── sdk.ts              # plumbing — do not edit
    ├── utils.ts            # uiPort = 8080
    ├── i18n.ts             # passthrough translator
    ├── main.ts             # daemon: runs start-labelbase.sh
    ├── interfaces.ts       # exports the web UI on uiPort
    ├── dependencies.ts     # none
    ├── backups.ts          # backs up the entire 'main' volume
    ├── manifest/
    │   ├── index.ts        # id, image tag, license, alerts
    │   └── i18n.ts         # short/long descriptions (EN, ES)
    ├── init/index.ts       # init/uninit wiring
    ├── actions/index.ts    # empty — add custom actions here
    └── versions/
        ├── index.ts
        └── v2.3.0.ts       # initial version
```

## What's missing for production

- **`s9pk.mk`** copied from a reference Start9 package.
- **Combined Dockerfile + supervisord config + start script** — the hardest part.
- **Marketing screenshots** in `assets/` and `gallery` field in manifest.
- **Custom actions** (reset admin password, export labels, view BIP-329 dump).
- **Backup config tuning** — currently dumps the whole `main` volume; for big DBs, prefer a `mysqldump`-based hook.
- **Health check refinement** — currently just port-listening; could hit a Django health endpoint.

## Why this is harder than the Umbrel package

Umbrel runs **multi-container** docker-compose stacks natively. Start9 packages are **single-image** by convention, so you have to combine all three Labelbase services into one container. This is a real engineering task, not a config exercise.

If you want to ship Labelbase on StartOS quickly, the realistic path is:

1. Convince Labelbase upstream to publish official images, OR
2. Maintain a fork of `Labelbase/Labelbase` whose CI builds the combined image and a release artifact pointing to it.
