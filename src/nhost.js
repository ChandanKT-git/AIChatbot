import { NhostClient } from '@nhost/nhost-js'

const backendUrl = import.meta.env.VITE_NHOST_BACKEND_URL?.replace(/\/$/, '')
const subdomain = import.meta.env.VITE_NHOST_SUBDOMAIN
const region = import.meta.env.VITE_NHOST_REGION
const graphqlHttp = import.meta.env.VITE_GRAPHQL_HTTP?.replace(/\/$/, '')

let config

if (subdomain && region) {
  config = { subdomain, region }
} else if (backendUrl) {
  config = {
    authUrl: `${backendUrl}/v1/auth`,
    graphqlUrl: graphqlHttp || `${backendUrl}/v1/graphql`,
    storageUrl: `${backendUrl}/v1/storage`,
    functionsUrl: `${backendUrl}/v1/functions`,
  }
} else if (graphqlHttp) {
  const base = graphqlHttp.replace(/\/v1\/graphql$/, '')
  config = {
    authUrl: `${base}/v1/auth`,
    graphqlUrl,
    storageUrl: `${base}/v1/storage`,
    functionsUrl: `${base}/v1/functions`,
  }
} else {
  config = {} // will still error if nothing is set
}

const nhost = new NhostClient(config)
export default nhost


