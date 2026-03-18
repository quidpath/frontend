import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Hook for optimistic UI updates
 * Updates the UI immediately and syncs in the background
 * Automatically rolls back on error
 */
export function useOptimisticMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    queryKey: readonly unknown[];
    updateFn: (oldData: TData | undefined, variables: TVariables) => TData;
    onSuccess?: (data: TData, variables: TVariables, context: TContext) => void;
    onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    
    // Optimistically update the cache before mutation
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: options.queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(options.queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData<TData>(
        options.queryKey,
        (old) => options.updateFn(old, variables)
      );

      // Return context with the snapshot
      return { previousData } as TContext;
    },

    // On error, roll back to the previous value
    onError: (error, variables, context) => {
      if (context && 'previousData' in context) {
        queryClient.setQueryData(options.queryKey, (context as { previousData: TData }).previousData);
      }
      options.onError?.(error, variables, context);
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: options.queryKey });
    },

    onSuccess: options.onSuccess,
  });
}

/**
 * Hook for optimistic list item creation
 */
export function useOptimisticCreate<TItem extends { id?: string | number }>(
  mutationFn: (item: Omit<TItem, 'id'>) => Promise<TItem>,
  queryKey: readonly unknown[]
) {
  return useOptimisticMutation(mutationFn, {
    queryKey,
    updateFn: (oldData: { results?: TItem[] } | undefined, newItem) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticItem = { ...newItem, id: tempId } as TItem;
      
      return {
        ...oldData,
        results: [optimisticItem, ...(oldData?.results || [])],
      };
    },
  });
}

/**
 * Hook for optimistic list item update
 */
export function useOptimisticUpdate<TItem extends { id: string | number }>(
  mutationFn: (item: Partial<TItem> & { id: string | number }) => Promise<TItem>,
  queryKey: readonly unknown[]
) {
  return useOptimisticMutation(mutationFn, {
    queryKey,
    updateFn: (oldData: { results?: TItem[] } | undefined, updatedItem) => {
      return {
        ...oldData,
        results: oldData?.results?.map((item) =>
          item.id === updatedItem.id ? { ...item, ...updatedItem } : item
        ) || [],
      };
    },
  });
}

/**
 * Hook for optimistic list item deletion
 */
export function useOptimisticDelete<TItem extends { id: string | number }>(
  mutationFn: (id: string | number) => Promise<void>,
  queryKey: readonly unknown[]
) {
  return useOptimisticMutation(mutationFn, {
    queryKey,
    updateFn: (oldData: { results?: TItem[] } | undefined, id) => {
      return {
        ...oldData,
        results: oldData?.results?.filter((item) => item.id !== id) || [],
      };
    },
  });
}

/**
 * Hook for optimistic bulk operations
 */
export function useOptimisticBulk<TItem extends { id: string | number }>(
  mutationFn: (ids: Array<string | number>, action: string) => Promise<void>,
  queryKey: readonly unknown[],
  updateField?: keyof TItem
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, action }: { ids: Array<string | number>; action: string }) =>
      mutationFn(ids, action),
    
    onMutate: async ({ ids, action }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update items
      queryClient.setQueryData(queryKey, (old: { results?: TItem[] } | undefined) => {
        if (!old?.results) return old;
        
        return {
          ...old,
          results: old.results.map((item) => {
            if (ids.includes(item.id) && updateField) {
              return { ...item, [updateField]: action };
            }
            return item;
          }),
        };
      });

      return { previousData };
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
