"use client"

import { useState } from "react"
import { useQuery } from "@apollo/client/react"
import { Search, Loader2, Package, Building2, Pill, Store } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SEARCH_ALL } from "@/lib/graphql/queries"
import { getNhostImageUrl } from "@/lib/utils"

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
  const { data, loading, error } = useQuery<SearchResult>(SEARCH_ALL, {
    variables: {
      textSearch: `%${searchTerm.trim()}%`,   // for text/string columns
      citextSearch: `%${searchTerm.trim()}%`  // for citext columns
    },
    skip: !searchTerm || searchTerm.trim().length < 2,
  });
  


  const results = data || {
    medicalsubstances: [],
    companies: [],
    brands: [],
    products: [],
  }

  const totalResults =
    results.medicalsubstances.length +
    results.companies.length +
    results.brands.length +
    results.products.length

  const combinedResults = [
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
    })),
    // Brands (may have logo)
    ...results.brands.map((brand) => ({
      id: `brand-${brand.brandid}`,
      type: "Brand" as const,
      icon: Store,
      title: brand.brandname,
      subtitle: brand.company?.company_fullname || "",
      imageUrl: brand.logo_id ? getNhostImageUrl(brand.logo_id) : null,
    })),
    // Companies
    ...results.companies.map((company) => ({
      id: `company-${company.company_id}`,
      type: "Company" as const,
      icon: Building2,
      title: company.company_fullname,
      subtitle: company.company_displayname || "",
      imageUrl: null as string | null,
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
    })),
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              PhilScript Search
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Search medical substances, companies, brands, and products
            </p>
          </div>

          {/* Search Bar */}
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for medical substances, companies, brands, or products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />

                {/* Dropdown results under search bar */}
                {searchTerm.trim().length >= 2 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-border rounded-md shadow-lg max-h-80 overflow-y-auto z-50">
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
                        <div className="px-3 pb-2 text-xs text-muted-foreground">
                          Found {totalResults} result
                          {totalResults !== 1 ? "s" : ""}
                        </div>
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
                                  className="h-10 w-10 rounded object-cover border border-border flex-shrink-0"
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
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
