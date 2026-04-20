import { FileHelper, utils } from '@start9labs/start-sdk'
import { z } from 'zod'
import { sdk } from '../sdk'

/**
 * Equivalent to the Umbrel `exports.sh`:
 *   APP_DJANGO_SECRET_KEY / APP_DJANGO_CRYPTO_SALT / APP_MYSQL_PASSWORD /
 *   APP_MYSQL_ROOT_PASSWORD — all derived once and persisted in config.ini.
 *
 * Zod `.catch(() => generateOnce())` guarantees that the first read creates
 * the file with fresh secrets and every subsequent read returns the same
 * persisted values. Regenerating `crypto_salt` would make every existing
 * label unreadable, so these values MUST survive updates.
 */

const shape = z.object({
  internal: z
    .object({
      secret_key: z
        .string()
        .catch(() =>
          utils.getDefaultString({
            charset: 'a-z,A-Z,1-9',
            len: 50,
          }),
        ),
      proj_name: z.string().catch(() => 'labelbase'),
      crypto_salt: z
        .string()
        .catch(
          () =>
            'labelbase_' +
            utils.getDefaultString({ charset: 'a-z,A-Z,1-9', len: 22 }) +
            '_',
        ),
      allowed_host: z.string().catch(() => '*'),
      debug: z.string().catch(() => 'False'),
      current_timestamp_seconds: z
        .number()
        .or(z.string().transform((s) => parseInt(s, 10)))
        .catch(() => Math.floor(Date.now() / 1000)),
      self_hosted: z.string().catch(() => 'True'),
      sentry_dsn: z.string().catch(() => ''),
    })
    .default(() => ({}) as any),

  database: z
    .object({
      name: z.string().catch(() => 'labelbase'),
      user: z.string().catch(() => 'ulabelbase'),
      password: z
        .string()
        .catch(() =>
          utils.getDefaultString({ charset: 'a-z,A-Z,1-9', len: 32 }),
        ),
      host: z.string().catch(() => '127.0.0.1'),
      port: z
        .number()
        .or(z.string().transform((s) => parseInt(s, 10)))
        .catch(() => 3306),
    })
    .default(() => ({}) as any),

  mysql: z
    .object({
      root_password: z
        .string()
        .catch(() =>
          utils.getDefaultString({ charset: 'a-z,A-Z,1-9', len: 32 }),
        ),
    })
    .default(() => ({}) as any),

  umbrel: z
    .object({
      // Optional external endpoints — user can edit config.ini directly or
      // leave blank to disable the autofill on new user profiles.
      electrum_hostname: z.string().catch(() => ''),
      electrum_ports: z.string().catch(() => 't50001'),
      mempool_endpoint: z.string().catch(() => ''),
    })
    .default(() => ({}) as any),
})

export type Config = z.infer<typeof shape>

export const configIni = FileHelper.ini(
  { base: sdk.volumes.main, subpath: '/config.ini' },
  shape,
)
