import { sdk } from './sdk'

// Labelbase is self-contained — MySQL, Django and nginx all ship as sibling
// containers within this package. It can optionally talk to external
// electrs / mempool endpoints via `config.ini [umbrel]` but those are not
// StartOS package dependencies.
export const setDependencies = sdk.setupDependencies(async () => ({}))
