"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
  Search,
  Loader2,
  Package,
  Building2,
  Pill,
  Store,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SEARCH_ALL } from "@/lib/graphql/queries";
import { getNhostImageUrl, fuzzyMatchScore } from "@/lib/utils";
import Header from "@/components/layout/header";

interface SearchResult {
  medicalsubstances: Array<{
    medicalsubstanceid: string;
    medicalsubstancename: string;
    therapeuticdrugclass: {
      therapeuticdrugclassname: string;
    } | null;
  }>;
  companies: Array<{
    company_id: string;
    company_fullname: string;
    company_displayname: string | null;
    industry: {
      industryname: string;
    } | null;
  }>;
  brands: Array<{
    brandid: number;
    brandname: string;
    logo_id: string | null;
    company: {
      company_fullname: string;
    } | null;
  }>;
  products: Array<{
    productid: number;
    productname: string;
    logo_id?: string | null;
    image_id: string | null;
    brand: {
      brandname: string;
    } | null;
    company: {
      company_fullname: string;
    } | null;
  }>;
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const trimmedSearch = searchTerm.trim();
  const isSearchActive = trimmedSearch.length >= 1;
  const showDropdown = isSearchActive && isFocused;

  const { data, loading } = useQuery<SearchResult>(SEARCH_ALL, {
    variables: {
      textSearch: `%${trimmedSearch}%`,
      citextSearch: `%${trimmedSearch}%`,
      textSearchStart: `${trimmedSearch}%`,
      citextSearchStart: `${trimmedSearch}%`,
    },
    skip: !isSearchActive,
  });

  const results = data || {
    medicalsubstances: [],
    companies: [],
    brands: [],
    products: [],
  };

  const allResults = [
    ...results.products.map((p: any) => ({
      id: `p-${p.productid}`,
      type: "Product",
      icon: Package,
      title: p.productname,
      subtitle: p.brand?.brandname || p.company?.company_fullname || "",
      imageUrl: p.image_id ? getNhostImageUrl(p.image_id) : null,
      searchText: p.productname,
    })),
    ...results.brands.map((b: any) => ({
      id: `b-${b.brandid}`,
      type: "Brand",
      icon: Store,
      title: b.brandname,
      subtitle: b.company?.company_fullname || "",
      imageUrl: b.logo_id ? getNhostImageUrl(b.logo_id) : null,
      searchText: b.brandname,
    })),
    ...results.companies.map((c: any) => ({
      id: `c-${c.company_id}`,
      type: "Company",
      icon: Building2,
      title: c.company_displayname || c.company_fullname,
      subtitle: c.industry?.industryname || "",
      imageUrl: null,
      searchText: c.company_fullname,
    })),
    ...results.medicalsubstances.map((s: any) => ({
      id: `s-${s.medicalsubstanceid}`,
      type: "Substance",
      icon: Pill,
      title: s.medicalsubstancename,
      subtitle: s.therapeuticdrugclass?.therapeuticdrugclassname || "",
      imageUrl: null,
      searchText: s.medicalsubstancename,
    })),
  ];

  const scoredResults = allResults
    .map((item) => ({
      ...item,
      score: fuzzyMatchScore(trimmedSearch, item.searchText),
    }))
    .filter((item) => item.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-12">
          <Header />
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                PillScrip Search
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Search medicines by brand, generic, or company
              </p>
            </div>

            <div className="relative max-w-2xl mx-auto">
              {/* FIX: The parent container is now transparent and doesn't have 'rounded-full'.
               This prevents the "giant oval" effect.
            */}
              <div className="relative flex flex-col w-full">
                {/* INPUT CONTAINER */}
                <div
                  className={`
                  relative flex items-center min-h-[56px] transition-all duration-200
                  bg-white dark:bg-gray-900 border shadow-md
                  ${
                    showDropdown
                      ? "rounded-t-[24px] border-gray-300 dark:border-gray-700 shadow-xl"
                      : "rounded-full border-gray-200 dark:border-gray-800 hover:shadow-lg"
                  }
                `}
                >
                  <Search className="absolute left-6 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search medicines..."
                    value={searchTerm}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-14 pr-12 h-14 text-lg bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-6 p-1"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* DROPDOWN CONTAINER */}
                {showDropdown && (
                  <div className="absolute top-[55px] left-0 w-full bg-white dark:bg-gray-900 border-x border-b border-gray-300 dark:border-gray-700 rounded-b-[24px] shadow-2xl z-50 overflow-hidden">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                      </div>
                    ) : (
                      <div className="max-h-[450px] overflow-y-auto pb-2">
                        {scoredResults.length > 0 ? (
                          scoredResults.map((item) => (
                            <button
                              key={item.id}
                              className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt=""
                                    className="h-full w-full rounded-lg object-cover"
                                  />
                                ) : (
                                  <item.icon className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                    {item.title}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] font-bold opacity-60"
                                  >
                                    {item.type}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                                  {item.subtitle}
                                </p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="py-12 text-center text-sm text-gray-500">
                            No results found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
