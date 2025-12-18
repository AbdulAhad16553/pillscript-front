import { NhostClient } from '@nhost/nextjs'

export const nhost = new NhostClient({
  subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || 'lfgwnrkyoofwbvejrpqm',
  region: process.env.NEXT_PUBLIC_NHOST_REGION || 'eu-central-1',
  storageUrl: process.env.NEXT_PUBLIC_NHOST_STORAGE_URL || 'https://lfgwnrkyoofwbvejrpqm.storage.eu-central-1.nhost.run',
})
