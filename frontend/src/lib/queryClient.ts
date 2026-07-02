import { QueryClient } from '@tanstack/react-query';

/**
 * One shared React Query client. Sensible defaults for an internal tool: retry once,
 * don't refetch on window focus (avoids surprise reloads), keep data fresh for 30s.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});
