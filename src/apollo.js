import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient as createWSClient } from 'graphql-ws'
import nhost from './nhost'

const subdomain = import.meta.env.VITE_NHOST_SUBDOMAIN
const region = import.meta.env.VITE_NHOST_REGION
const explicitHttp = import.meta.env.VITE_GRAPHQL_HTTP
const explicitWs = import.meta.env.VITE_GRAPHQL_WS

// Prefer explicit env URLs; otherwise derive from Nhost Cloud subdomain/region
const derivedHttp = subdomain && region
  ? `https://${subdomain}.graphql.${region}.nhost.run/v1`
  : undefined

const httpUrl = (explicitHttp || derivedHttp)?.replace(/\/v1\/graphql$/, '/v1')
const wsUrl = explicitWs || (httpUrl ? httpUrl.replace(/^http/, 'ws') : undefined)

const httpLink = new HttpLink({ uri: httpUrl })

const authLink = setContext(async (_, { headers }) => {
  const token = await nhost.auth.getAccessToken()
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }
})

const wsLink = new GraphQLWsLink(
  createWSClient({
    url: wsUrl,
    connectionParams: async () => {
      const session = nhost.auth.getSession()
      const token = session?.accessToken
      return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    }
  })
)

const isSubscription = ({ query }) => {
  const definition = query.definitions.find(
    def => def.kind === 'OperationDefinition'
  )
  return definition?.operation === 'subscription'
}

const link = split(isSubscription, wsLink, authLink.concat(httpLink))

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})

export default apolloClient


