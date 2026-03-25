import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import DashboardPage from './pages/DashboardPage';
import './index.css';
import 'maplibre-gl/dist/maplibre-gl.css';

const LandingPage = lazy(() => import('./pages/LandingPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route
            path="/landing"
            element={
              <Suspense fallback={
                <div className="h-screen w-screen flex items-center justify-center bg-flood-bg">
                  <div className="text-flood-accent text-sm animate-pulse">Loading…</div>
                </div>
              }>
                <LandingPage />
              </Suspense>
            }
          />
          <Route path="/*" element={<DashboardPage />} />
        </Routes>
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          toastOptions={{
            style: {
              background: 'var(--flood-surface)',
              border: '1px solid var(--flood-border)',
              color: 'var(--flood-text)',
            },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
