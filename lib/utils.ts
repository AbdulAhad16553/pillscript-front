import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getNhostImageUrl(imageId: string | null | undefined): string | null {
  if (!imageId) return null
  return `${process.env.NEXT_PUBLIC_NHOST_STORAGE_URL || 'https://lfgwnrkyoofwbvejrpqm.storage.eu-central-1.nhost.run'}/v1/files/${imageId}`
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching to handle typos
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + 1  // substitution
        )
      }
    }
  }

  return dp[m][n]
}

/**
 * Calculate fuzzy match score (0-1, where 1 is perfect match)
 * Higher score = better match
 */
export function fuzzyMatchScore(searchTerm: string, target: string): number {
  if (!searchTerm || !target) return 0
  
  const normalizedSearch = searchTerm.toLowerCase().trim()
  const normalizedTarget = target.toLowerCase().trim()
  
  // Exact match
  if (normalizedSearch === normalizedTarget) return 1.0
  
  // Target starts with search term (high score) - handles "espro" matching "espramcit"
  if (normalizedTarget.startsWith(normalizedSearch)) {
    // Boost score based on how much of the search term matches
    const matchRatio = normalizedSearch.length / normalizedTarget.length
    return 0.85 + (matchRatio * 0.1) // 0.85 to 0.95 based on completeness
  }
  
  // Target starts with a significant prefix of the search term
  // Handles "espro" matching "espramcit" (target starts with "espram" which starts with "espr")
  if (normalizedSearch.length >= 4) {
    // Check if target starts with first 3-4 chars of search term
    const prefixLength = Math.min(4, Math.floor(normalizedSearch.length * 0.7))
    const searchPrefix = normalizedSearch.substring(0, prefixLength)
    
    if (normalizedTarget.startsWith(searchPrefix)) {
      // Calculate how similar the rest of the search term is to the target
      const searchRest = normalizedSearch.substring(prefixLength)
      const targetAfterPrefix = normalizedTarget.substring(prefixLength)
      
      if (searchRest.length > 0) {
        // Check if target continues in a similar way
        const restSimilarity = targetAfterPrefix.length > 0
          ? 1 - levenshteinDistance(searchRest, targetAfterPrefix.substring(0, Math.min(searchRest.length + 2, targetAfterPrefix.length))) / Math.max(searchRest.length, targetAfterPrefix.length)
          : 0.5
        return 0.75 + (restSimilarity * 0.15) // 0.75 to 0.9
      }
      return 0.8 // Good prefix match
    }
  }
  
  // Check if target starts with first 3 chars of search term (for shorter search terms)
  if (normalizedSearch.length >= 3) {
    const prefixLength = 3
    const searchPrefix = normalizedSearch.substring(0, prefixLength)
    
    if (normalizedTarget.startsWith(searchPrefix)) {
      // This is a good match - target starts with the prefix
      return 0.7 // Good enough score for prefix match
    }
  }
  
  // Contains match (medium-high score)
  if (normalizedTarget.includes(normalizedSearch)) {
    return 0.8
  }
  
  // Calculate similarity using Levenshtein distance
  const maxLength = Math.max(normalizedSearch.length, normalizedTarget.length)
  if (maxLength === 0) return 1.0
  
  const distance = levenshteinDistance(normalizedSearch, normalizedTarget)
  const similarity = 1 - distance / maxLength
  
  // For shorter search terms, be more lenient with similarity threshold
  const minSimilarity = normalizedSearch.length <= 5 ? 0.4 : 0.6
  
  // Boost score if the strings are similar enough (within reasonable typo range)
  // For example, "esoromcit" vs "espramcit" should score well
  if (similarity > minSimilarity) {
    // Scale based on search term length - shorter terms get more lenient scoring
    const lengthFactor = normalizedSearch.length <= 5 ? 0.8 : 0.7
    return Math.max(0.25, similarity * lengthFactor)
  }
  
  return 0
}
