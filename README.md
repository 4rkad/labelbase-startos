# Labelbase — StartOS package

Self-hosted BIP-329 label management for Bitcoin wallets, packaged for [StartOS](https://start9.com) 0.4.0.

Ported from the Umbrel packaging (`2.3.0-4rkad.12`) — same patched Django image, MySQL 8 + nginx sibling containers, per-instance crypto salt preserved across updates.

## Install (sideload)

Download the latest `.s9pk` from [Releases](https://github.com/4rkad/labelbase-startos/releases):

- `labelbase_x86_64.s9pk` — Intel/AMD mini-PCs
- `labelbase_aarch64.s9pk` — Raspberry Pi / Start9 Server

In StartOS: **Settings → Sideload Service → Upload**, select the `.s9pk`, wait for install to finish, then **Start** the service.

## Architecture

Three sibling `SubContainer`s inside the `labelbase` package, communicating over loopback (`127.0.0.1`):

- **mysql** (`mysql:8.0.36`) — data dir on subpath `mysql` of the `main` volume.
- **django** (`ghcr.io/4rkad/labelbase-django:2.3.0-4rkad.12`) — gunicorn on `:8000`, mounts `config.ini`, `labelbase.log`, `static/`, `media/`. Depends on `mysql`.
- **nginx** (`nginx:1.27-alpine`) — serves static/media + reverse-proxies Django, exposes `:8080` to StartOS. Depends on `django`.

Secrets (`secret_key`, `crypto_salt`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`) are generated once on first run and persisted in `config.ini` on the `main` volume — they survive updates.

Backups use `sdk.Backups.withMysqlDump(...).addVolume('main')` — logical DB dump plus the full `main` volume (config.ini, static/, media/, logs).

## Build from source

Requires:
- Node.js + npm
- [`start-cli 0.4.0-beta.5`](https://github.com/Start9Labs/start-os/releases) in `PATH` (pre-built binary, no Rust compile needed)
- `tar2sqfs` (`sudo apt install squashfs-tools-ng` on Debian/Ubuntu)
- Developer signing key at `~/.startos/developer.key.pem` (`start-cli init-key` to generate)

Then:

```bash
npm install
make x86    # produces labelbase_x86_64.s9pk
make arm    # produces labelbase_aarch64.s9pk
make clean  # remove .s9pk, ./javascript, ./node_modules
```

## License

[AGPL-3.0](./LICENSE) — same as upstream Labelbase.
