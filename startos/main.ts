import { configIni } from './file-models/config.ini'
import { nginxConf } from './file-models/nginx.conf'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { djangoPort, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Labelbase…'))

  // ========================
  // Read persistent config (file-models auto-generate defaults on first read)
  // ========================
  const config = await configIni.read().const(effects)
  if (!config) throw new Error('Could not read config.ini')

  // Ensure nginx.conf exists (seeded on first read)
  await nginxConf.read().const(effects)

  // ========================
  // SubContainers
  // ========================

  // MySQL owns /var/lib/mysql under subpath `mysql` inside the main volume.
  const mysqlSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'mysql' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: 'mysql',
      mountpoint: '/var/lib/mysql',
      readonly: false,
    }),
    'mysql-sub',
  )

  // Django mounts config.ini as file, plus the app data directories.
  const djangoSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'django' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: '/config.ini',
        mountpoint: '/app/config.ini',
        readonly: false,
        type: 'file',
      })
      .mountVolume({
        volumeId: 'main',
        subpath: '/labelbase.log',
        mountpoint: '/app/labelbase.log',
        readonly: false,
        type: 'file',
      })
      .mountVolume({
        volumeId: 'main',
        subpath: 'static',
        mountpoint: '/app/static',
        readonly: false,
      })
      .mountVolume({
        volumeId: 'main',
        subpath: 'media',
        mountpoint: '/app/media',
        readonly: false,
      }),
    'django-sub',
  )

  // Nginx gets read-only static/media + its own config.
  const nginxSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'nginx' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: 'static',
        mountpoint: '/app/static',
        readonly: true,
      })
      .mountVolume({
        volumeId: 'main',
        subpath: 'media',
        mountpoint: '/app/media',
        readonly: true,
      })
      .mountVolume({
        volumeId: 'main',
        subpath: '/nginx.conf',
        mountpoint: '/etc/nginx/nginx.conf',
        readonly: true,
        type: 'file',
      }),
    'nginx-sub',
  )

  // ========================
  // Daemons — chain: mysql → django → nginx
  // ========================
  return sdk.Daemons.of(effects)
    .addDaemon('mysql', {
      subcontainer: mysqlSub,
      exec: {
        command: sdk.useEntrypoint([
          '--bind-address=127.0.0.1',
          '--character-set-server=utf8mb4',
          '--collation-server=utf8mb4_unicode_ci',
        ]),
        env: {
          MYSQL_DATABASE: config.database.name,
          MYSQL_USER: config.database.user,
          MYSQL_PASSWORD: config.database.password,
          MYSQL_ROOT_PASSWORD: config.mysql.root_password,
        },
        user: 'mysql',
      },
      ready: {
        gracePeriod: 60_000,
        display: i18n('MySQL'),
        fn: async () => {
          const r = await mysqlSub.exec([
            'mysqladmin',
            'ping',
            '-h',
            '127.0.0.1',
            '-uroot',
            `-p${config.mysql.root_password}`,
          ])
          return r.exitCode === 0
            ? { result: 'success', message: i18n('MySQL is ready') }
            : {
                result: 'loading',
                message: i18n('Waiting for MySQL to be ready'),
              }
        },
      },
      requires: [],
    })
    .addDaemon('django', {
      subcontainer: djangoSub,
      exec: {
        command: ['/app/run.sh'],
        env: {
          MYSQL_HOST: '127.0.0.1',
          MYSQL_PORT: '3306',
          MYSQL_DATABASE: config.database.name,
          MYSQL_USER: config.database.user,
          MYSQL_PASSWORD: config.database.password,
          UMBREL_ELECTRUM_HOSTNAME: config.umbrel.electrum_hostname,
          UMBREL_ELECTRUM_PORTS: config.umbrel.electrum_ports,
          UMBREL_MEMPOOL_ENDPOINT: config.umbrel.mempool_endpoint,
        },
      },
      ready: {
        gracePeriod: 90_000,
        display: i18n('Django Application'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, djangoPort, {
            successMessage: i18n('Django is ready'),
            errorMessage: i18n('Django is not ready'),
          }),
      },
      requires: ['mysql'],
    })
    .addDaemon('nginx', {
      subcontainer: nginxSub,
      exec: { command: sdk.useEntrypoint() },
      ready: {
        gracePeriod: 10_000,
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('Labelbase is ready'),
            errorMessage: i18n('Labelbase is not ready'),
          }),
      },
      requires: ['django'],
    })
})
