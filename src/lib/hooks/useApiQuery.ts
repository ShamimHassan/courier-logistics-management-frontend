"use client";

import {
  useQuery,
  type QueryFunction,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiRequestError } from "@/lib/api/client";

export type UseApiQueryOptions<TData, TError = ApiRequestError> = Omit<
  UseQueryOptions<TData, TError, TData, QueryKey>,
  "queryKey" | "queryFn"
> & {
  queryKey: QueryKey;
  queryFn: QueryFunction<TData, QueryKey>;
};

export function useApiQuery<TData, TError = ApiRequestError>(
  opts: UseApiQueryOptions<TData, TError>,
): UseQueryResult<TData, TError> {
  return useQuery<TData, TError>({
    ...(opts as UseQueryOptions<TData, TError, TData, QueryKey>),
  });
}

export { ApiRequestError };
export type { QueryKey } from "@tanstack/react-query";
