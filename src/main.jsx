import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { NhostProvider } from '@nhost/react'
import { ApolloProvider } from '@apollo/client/react'
import nhost from './nhost'
import apolloClient from './apollo'
import AppRoutes from './routes.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={apolloClient}>
        <AppRoutes />
      </ApolloProvider>
    </NhostProvider>
  </StrictMode>,
)
