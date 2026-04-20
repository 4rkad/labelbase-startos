import { sdk } from '../sdk'

// No custom actions for the initial release. Future additions:
//   - "Configure external endpoints" (electrum, mempool) → merge into configIni
//   - "Reset admin password" (Django manage.py changepassword)
//   - "Export all labels" (manage.py dumpdata)
export const actions = sdk.Actions.of()
