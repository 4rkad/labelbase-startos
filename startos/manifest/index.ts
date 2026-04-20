import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'labelbase',
  title: 'Labelbase',
  license: 'AGPL-3.0',
  packageRepo: 'https://github.com/4rkad/labelbase-startos',
  upstreamRepo: 'https://github.com/Labelbase/Labelbase',
  marketingUrl: 'https://labelbase.space',
  donationUrl: null,
  docsUrls: ['https://github.com/Labelbase/Labelbase/blob/main/install.md'],
  description: { short, long },

  volumes: ['main'],

  images: {
    django: {
      source: { dockerTag: 'ghcr.io/4rkad/labelbase-django:2.3.0-4rkad.12' },
      arch: ['x86_64', 'aarch64'],
    },
    mysql: {
      source: { dockerTag: 'mysql:8.0.36' },
      arch: ['x86_64', 'aarch64'],
    },
    nginx: {
      source: { dockerTag: 'nginx:1.27-alpine' },
      arch: ['x86_64', 'aarch64'],
    },
  },

  alerts: {
    install:
      'Labelbase encrypts every label with a per-instance salt derived on first boot. Keep your StartOS backups up to date — losing the salt makes existing labels unreadable.',
    update: null,
    uninstall:
      'Uninstalling removes the label database permanently unless you keep your data volume or a recent backup.',
    restore: null,
    start: null,
    stop: null,
  },

  dependencies: {},
})
