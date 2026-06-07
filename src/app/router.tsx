import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LandingPage } from '@/modules/landing/LandingPage'
import { LoginPage } from '@/modules/auth/LoginPage'
import { DashboardWorkspace } from '@/modules/dashboard/DashboardWorkspace'
import { BuilderView } from '@/modules/builder/BuilderView'
import { ProjectsList } from '@/modules/projects/ProjectsList'
import { ProjectDetailView } from '@/modules/projects/ProjectDetailView'
import { CatalogList } from '@/modules/catalog-admin/CatalogList'
import { AssetsView } from '@/modules/assets-3d/AssetsView'
import { QuoteRequestsList } from '@/modules/quote-requests/QuoteRequestsList'
import { AnalyticsView } from '@/modules/analytics/AnalyticsView'
import { SettingsView } from '@/modules/settings/SettingsView'
import { ProjectPublicPreview } from '@/modules/public/ProjectPublicPreview'

const router = createBrowserRouter([
  // Pagina de inicio (publica)
  {
    path: '/',
    element: <LandingPage />,
  },
  // Login (publico)
  {
    path: '/login',
    element: <LoginPage />,
  },
  // Vista compartida de cliente (publica)
  {
    path: '/share/:shareToken',
    element: <ProjectPublicPreview />,
  },
  // Aplicacion protegida
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardWorkspace /> },
          { path: 'builder', element: <BuilderView /> },
          { path: 'projects', element: <ProjectsList /> },
          { path: 'projects/:id', element: <ProjectDetailView /> },
          { path: 'catalog', element: <CatalogList /> },
          { path: 'assets', element: <AssetsView /> },
          { path: 'quotes', element: <QuoteRequestsList /> },
          { path: 'analytics', element: <AnalyticsView /> },
          { path: 'settings', element: <SettingsView /> },
        ],
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
