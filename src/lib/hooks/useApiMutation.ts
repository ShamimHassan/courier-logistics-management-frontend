"use client";

import {
  useMutation,
  type MutationFunction,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiRequestError } from "@/lib/api/client";

export type UseApiMutationOptions<
  TData = unknown,
  TVariables = void,
  TContext = unknown,
> = Omit<
  UseMutationOptions<TData, ApiRequestError, TVariables, TContext>,
  "mutationFn"
> & {
  mutationFn: MutationFunction<TData, TVariables>;
  /** Show toast.success on success. If string, uses as message; else if true, uses generic message. */
  successToast?: boolean | string;
  /** If true (default), toast.error is shown on failure. */
  errorToast?: boolean;
};

export function useApiMutation<
  TData = unknown,
  TVariables = void,
  TContext = unknown,
>(
  opts: UseApiMutationOptions<TData, TVariables, TContext>,
): UseMutationResult<TData, ApiRequestError, TVariables, TContext> {
  const {
    successToast = true,
    errorToast = true,
    onSuccess,
    onError,
    mutationFn,
    ...rest
  } = opts;

  const wrappedOnSuccess: NonNullable<
    UseMutationOptions<TData, ApiRequestError, TVariables, TContext>["onSuccess"]
  > = (data, vars, ctx) => {
    if (successToast) {
      const msg =
        typeof successToast === "string"
          ? successToast
          : "Saved successfully.";
      toast.success(msg);
    }
    if (onSuccess) {
      // @ts-expect-error - TanStack v4/v5 type differences on callback arity
      onSuccess(data, vars, ctx);
    }
  };

  const wrappedOnError: NonNullable<
    UseMutationOptions<TData, ApiRequestError, TVariables, TContext>["onError"]
  > = (err, vars, ctx) => {
    if (errorToast) {
      toast.error(err.message || "Something went wrong.");
    }
    if (onError) {
      // @ts-expect-error - TanStack v4/v5 type differences on callback arity
      onError(err, vars, ctx);
    }
  };

  const config: UseMutationOptions<TData, ApiRequestError, TVariables, TContext> = {
    mutationFn,
    onSuccess: wrappedOnSuccess,
    onError: wrappedOnError,
    ...rest,
  };

  return useMutation<TData, ApiRequestError, TVariables, TContext>(config);
}

export { ApiRequestError };
