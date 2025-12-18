"use client"

import type React from "react"
import { ApolloProvider } from "@apollo/client/react"
import { NhostProvider } from "@nhost/nextjs"
import { client } from "@/lib/apollo-client"
import { nhost } from "@/lib/nhost"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={client}>
        {children}
        <Toaster />
      </ApolloProvider>
    </NhostProvider>
  )
}
