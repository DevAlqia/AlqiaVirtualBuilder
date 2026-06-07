import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ui/Toast'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: 1,
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>{children}</ToastProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
