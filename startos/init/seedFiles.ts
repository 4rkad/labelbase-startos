import { configIni } from '../file-models/config.ini'
import { nginxConf } from '../file-models/nginx.conf'
import { sdk } from '../sdk'

/**
 * Runs on install (and after migrations). Triggering `.read()` on each
 * file-model with `.catch()` defaults causes the file to be written with
 * generated values (secret_key, crypto_salt, passwords, nginx.conf body)
 * on first boot. Subsequent reads return the persisted values.
 *
 * The labelbase.log file must exist as a regular file before the django
 * subcontainer mounts it with `type: 'file'` — touch via the SDK.
 */
export const seedFiles = sdk.setupOnInit(async (effects, _kind) => {
  // Reading with `.catch()` defaults persists generated secrets on first install.
  // On upgrades, `.merge({})` is a no-op that still validates the shape.
  await configIni.merge(effects, {})
  await nginxConf.merge(effects, undefined as any)
})
