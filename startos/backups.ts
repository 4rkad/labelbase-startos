import { configIni } from './file-models/config.ini'
import { sdk } from './sdk'

/**
 * MySQL-dump based backup — restores cleanly across MySQL minor versions.
 * The `main` volume also holds config.ini (crypto_salt!), nginx.conf,
 * static/, media/ and labelbase.log — so we add it to persist those alongside
 * the database dump.
 */
export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.withMysqlDump({
    imageId: 'mysql',
    dbVolume: 'main',
    datadir: '/var/lib/mysql',
    database: 'labelbase',
    user: 'ulabelbase',
    password: async () => {
      const pw = await configIni.read((c) => c.database.password).once()
      if (!pw) throw new Error('No MySQL password found in config.ini')
      return pw
    },
    engine: 'mysql',
    readyCommand: ['mysqladmin', 'ping', '-h', '127.0.0.1'],
  }).addVolume('main'),
)
