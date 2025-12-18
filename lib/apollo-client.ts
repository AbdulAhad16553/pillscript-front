"use client"

import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { nhost } from "./nhost"

const httpLink = createHttpLink({
  uri: nhost.graphql.getUrl(),
})

const authLink = setContext((_, { headers }) => {
  const token = nhost.auth.getAccessToken()

  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }
})

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          medicalsubstance: {
            merge(existing = [], incoming) {
              return incoming
            },
          },
          brand: {
            merge(existing = [], incoming) {
              return incoming
            },
          },
          company: {
            merge(existing = [], incoming) {
              return incoming
            },
          },
          product: {
            merge(existing = [], incoming) {
              return incoming
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
    },
    query: {
      errorPolicy: "all",
      fetchPolicy: "cache-first",
    },
  },
})
