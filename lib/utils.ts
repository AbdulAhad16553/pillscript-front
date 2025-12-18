import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getNhostImageUrl(imageId: string | null | undefined): string | null {
  if (!imageId) return null
  return `${process.env.NEXT_PUBLIC_NHOST_STORAGE_URL || 'https://lfgwnrkyoofwbvejrpqm.storage.eu-central-1.nhost.run'}/v1/files/${imageId}`
}
