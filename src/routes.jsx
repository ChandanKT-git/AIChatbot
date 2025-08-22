import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Suspense, lazy } from 'react'

const AuthPage = lazy(() => import('./screens/AuthPage.jsx'))
const ChatList = lazy(() => import('./screens/ChatList.jsx'))
const ChatView = lazy(() => import('./screens/ChatView.jsx'))
const RequireAuth = lazy(() => import('./screens/RequireAuth.jsx'))

const withSuspense = (element) => <Suspense fallback={<div>Loading...</div>}>{element}</Suspense>

const router = createBrowserRouter([
  { path: '/auth', element: withSuspense(<AuthPage />) },
  {
    path: '/',
    element: withSuspense(
      <RequireAuth>
        <ChatList />
      </RequireAuth>
    )
  },
  {
    path: '/chat/:id',
    element: withSuspense(
      <RequireAuth>
        <ChatView />
      </RequireAuth>
    )
  }
])

export default function AppRoutes() {
  return <RouterProvider router={router} />
}


