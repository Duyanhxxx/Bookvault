'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getReadingSessions,
  logReadingSession,
  updateBookProgress,
} from '@/services/reading';
import type { BookStatus } from '@/types/database';

export function useReadingSessions(userBookId: string) {
  return useQuery({
    queryKey: ['reading-sessions', userBookId],
    queryFn: () => (userBookId ? getReadingSessions(userBookId) : Promise.resolve([])),
    enabled: !!userBookId,
  });
}

export function useLogReadingSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userBookId: string;
      startPage?: number | null;
      endPage?: number | null;
      durationMinutes?: number | null;
      startedAt?: string;
      endedAt?: string;
      totalPages?: number | null;
    }) => {
      return logReadingSession(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reading-sessions', variables.userBookId] });
      queryClient.invalidateQueries({ queryKey: ['book-detail', variables.userBookId] });
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
    },
  });
}

export function useUpdateReadingProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userBookId: string;
      currentPage: number;
      totalPages?: number | null;
      currentStatus?: BookStatus;
    }) => {
      return updateBookProgress(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['book-detail', variables.userBookId] });
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
    },
  });
}
