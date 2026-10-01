"use client";

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: process.env.NODE_ENV !== "production",
            retry: (failureCount, error) => {
              const status =
                (error as { status?: number })?.status ??
                (error as { response?: { status?: number } })?.response
                  ?.status;
              if (status && status >= 400 && status < 500 && status !== 408) {
                return false;
              }
              return failureCount < 2;
            },
          },
          mutations: {
            onError: (error) => {
              const message =
                (error as { message?: string })?.message ??
                "Something went wrong. Please try again.";
              toast.error(message);
            },
          },
        },
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.state.fetchStatus === "idle") return;
            const status =
              (error as { status?: number })?.status ??
              (error as { response?: { status?: number } })?.response
                ?.status;
            if (status === 401 || status === 403) return;
            const message =
              (error as { message?: string })?.message ??
              `${query.queryKey[0]} failed to load.`;
            toast.error(message);
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
