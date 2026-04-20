import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_3_0_1 = VersionInfo.of({
  version: '2.3.0:3',
  releaseNotes: {
    en_US:
      'Initial StartOS 0.4.0 release. Ported from the Umbrel packaging (2.3.0-4rkad.12) — same patched django image, MySQL 8 + nginx sibling containers, per-instance crypto salt preserved across updates.',
    es_ES:
      'Lanzamiento inicial para StartOS 0.4.0. Portado desde el paquete de Umbrel (2.3.0-4rkad.12) — misma imagen django parcheada, contenedores hermanos MySQL 8 + nginx, salt de cifrado propio de la instancia persistido entre actualizaciones.',
    de_DE: '',
    pl_PL: '',
    fr_FR: '',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
