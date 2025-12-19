"use client"

import { useState } from "react"
import { useQuery } from "@apollo/client/react"
import { Search, Loader2, Package, Building2, Pill, Store } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SEARCH_ALL } from "@/lib/graphql/queries"
import { getNhostImageUrl, fuzzyMatchScore } from "@/lib/utils"

interface SearchResult {
  medicalsubstances: Array<{
    medicalsubstanceid: string
    medicalsubstancename: string
    therapeuticdrugclass: {
      therapeuticdrugclassname: string
    } | null
  }>
  companies: Array<{
    company_id: string
    company_fullname: string
    company_displayname: string | null
  }>
  brands: Array<{
    brandid: number
    brandname: string
    logo_id: string | null
    company: {
      company_fullname: string
    } | null
  }>
  products: Array<{
    productid: number
    productname: string
    brand: {
      brandname: string
    } | null
    company: {
      company_fullname: string
    } | null
    image_id: string | null
  }>
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const trimmedSearch = searchTerm.trim()
  // Use more characters for "starts with" pattern
  // For short terms (<= 6 chars), use most of the term; for longer terms, use first 4-5 chars
  const startPatternLength = trimmedSearch.length >= 2 
    ? trimmedSearch.length <= 6 
      ? Math.max(3, trimmedSearch.length - 1) // Use most of short terms (e.g., "espro" -> 4 chars)
      : 4 // Use first 4 chars for longer terms
    : 0
  const firstChars = startPatternLength > 0 ? trimmedSearch.substring(0, startPatternLength) : ""
  
  const { data, loading, error } = useQuery<SearchResult>(SEARCH_ALL, {
    variables: {
      textSearch: `%${trimmedSearch}%`,   // for text/string columns - contains pattern
      citextSearch: `%${trimmedSearch}%`,  // for citext columns - contains pattern
      textSearchStart: firstChars ? `${firstChars}%` : `%`,   // for text/string columns - starts with first few chars
      citextSearchStart: firstChars ? `${firstChars}%` : `%`  // for citext columns - starts with first few chars
    },
    skip: !searchTerm || trimmedSearch.length < 2,
  });
  


  const results = data || {
    medicalsubstances: [],
    companies: [],
    brands: [],
    products: [],
  }

  // Combine all results with fuzzy matching scores
  const allResults = [
    // Products first (they have images)
    ...results.products.map((product) => ({
      id: `product-${product.productid}`,
      type: "Product" as const,
      icon: Package,
      title: product.productname,
      subtitle: [
        product.brand?.brandname ? `Brand: ${product.brand.brandname}` : null,
        product.company?.company_fullname
          ? `• ${product.company.company_fullname}`
          : null,
      ]
        .filter(Boolean)
        .join(" "),
      imageUrl: product.image_id ? getNhostImageUrl(product.image_id) : null,
      searchText: product.productname,
    })),
    // Brands (may have logo)
    ...results.brands.map((brand) => ({
      id: `brand-${brand.brandid}`,
      type: "Brand" as const,
      icon: Store,
      title: brand.brandname,
      subtitle: brand.company?.company_fullname || "",
      imageUrl: brand.logo_id ? getNhostImageUrl(brand.logo_id) : null,
      searchText: brand.brandname,
    })),
    // Companies
    ...results.companies.map((company) => ({
      id: `company-${company.company_id}`,
      type: "Company" as const,
      icon: Building2,
      title: company.company_fullname,
      subtitle: company.company_displayname || "",
      imageUrl: null as string | null,
      searchText: company.company_fullname,
    })),
    // Medical Substances
    ...results.medicalsubstances.map((substance) => ({
      id: `substance-${substance.medicalsubstanceid}`,
      type: "Substance" as const,
      icon: Pill,
      title: substance.medicalsubstancename,
      subtitle:
        substance.therapeuticdrugclass?.therapeuticdrugclassname || "",
      imageUrl: null as string | null,
      searchText: substance.medicalsubstancename,
    })),
  ]

  // Score and rank results using fuzzy matching
  const minScore = trimmedSearch.length <= 5 ? 0.15 : 0.2 // More lenient for shorter terms
  
  const scoredResults = allResults
    .map((item) => ({
      ...item,
      score: fuzzyMatchScore(trimmedSearch, item.searchText),
    }))
    .filter((item) => item.score > minScore) // Filter out very low matches (more lenient for short terms)
    .sort((a, b) => b.score - a.score) // Sort by score (highest first)
    .slice(0, 15) // Limit to top 15 results

  const combinedResults = scoredResults.map(({ searchText, ...item }) => item)
  
  const totalResults = combinedResults.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              PillScript Search
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
            Search medicines by brand, generic, or company
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Search medicines by brand, generic, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 h-12 text-lg rounded-full border border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
              />

              {/* Dropdown results under search bar */}
              {searchTerm.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-full bg-white dark:bg-gray-900 border-x border-b border-gray-300 dark:border-gray-700 rounded-b-2xl shadow-lg max-h-80 overflow-y-auto z-50">
                    {loading && (
                      <div className="flex items-center justify-center py-4 px-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Searching...
                      </div>
                    )}

                    {error && !loading && (
                      <div className="py-3 px-3 text-sm text-red-600 dark:text-red-400">
                        Error: {error.message}
                      </div>
                    )}

                    {!loading && !error && totalResults === 0 && (
                      <div className="py-3 px-3 text-sm text-muted-foreground">
                        No results found for "{searchTerm}"
                      </div>
                    )}

                    {!loading && !error && totalResults > 0 && (
                      <div className="py-2">
                       
                        {combinedResults.map((item) => {
                          const Icon = item.icon
                          return (
                            <button
                              key={item.id}
                              type="button"
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/70 focus:bg-muted/70 focus:outline-none"
                            >
                              {/* Image or icon */}
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl || "/placeholder.svg"}
                                  alt={item.title}
                                  className="h-10 w-10 rounded object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                  <Icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}

                              {/* Text */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-medium text-sm truncate">
                                    {item.title}
                                  </p>
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] px-1.5 py-0"
                                  >
                                    {item.type}
                                  </Badge>
                                </div>
                                {item.subtitle && (
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                                    {item.subtitle}
                                  </p>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
