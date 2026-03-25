import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Prefetch immédiat — les requêtes partent avant que React monte les composants
const STALE = 5 * 60 * 1000;
queryClient.prefetchQuery({
  queryKey: ['hero_data'],
  queryFn: () => fetch('/api/index.php?action=hero_data').then(r => r.json()).then(d => d.data),
  staleTime: STALE,
});
queryClient.prefetchQuery({
  queryKey: ['vehicles', 'featured'],
  queryFn: () => fetch('/api/index.php?action=vehicles&limit=8').then(r => r.json()).then(d => d.data || []),
  staleTime: STALE,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
