'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserLibrary,
  getUserBookById,
  addBookToLibrary,
  updateUserBook,
  deleteUserBook,
  getLibraryStats,
  type LibraryFilters,
} from '@/services/library';
import { useUser } from './useUser';
import type { UserBook, BookStatus } from '@/types/database';

export function useLibrary(filters?: LibraryFilters) {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['library', userId, filters],
    queryFn: () => (userId ? getUserLibrary(userId, filters) : Promise.resolve([])),
    enabled: !!userId,
  });
}

export function useBookDetail(userBookId: string) {
  return useQuery({
    queryKey: ['book-detail', userBookId],
    queryFn: () => (userBookId ? getUserBookById(userBookId) : Promise.resolve(null)),
    enabled: !!userBookId,
  });
}

export function useLibraryStats() {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['library-stats', userId],
    queryFn: () => (userId ? getLibraryStats(userId) : Promise.resolve(null)),
    enabled: !!userId,
  });
}

export function useAddBookToLibrary() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({
      bookId,
      details,
    }: {
      bookId: string;
      details?: {
        status?: BookStatus;
        rating?: number | null;
        purchase_price?: number | null;
        purchase_date?: string | null;
        purchase_store?: string | null;
        current_page?: number;
        notes?: string | null;
      };
    }) => {
      if (!user) throw new Error('Bạn cần đăng nhập để thêm sách.');
      return addBookToLibrary(user.id, bookId, details);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
    },
  });
}

export function useUpdateUserBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userBookId,
      updates,
    }: {
      userBookId: string;
      updates: Partial<UserBook>;
    }) => {
      return updateUserBook(userBookId, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['book-detail', variables.userBookId] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
    },
  });
}

export function useDeleteUserBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userBookId: string) => {
      return deleteUserBook(userBookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
    },
  });
}
