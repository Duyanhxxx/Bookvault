'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotesByBook,
  getAllUserNotes,
  createBookNote,
  updateBookNote,
  deleteBookNote,
} from '@/services/notes';
import { useUser } from './useUser';

export function useBookNotes(userBookId: string) {
  return useQuery({
    queryKey: ['notes', userBookId],
    queryFn: () => (userBookId ? getNotesByBook(userBookId) : Promise.resolve([])),
    enabled: !!userBookId,
  });
}

export function useAllUserNotes(search?: string) {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['all-notes', userId, search],
    queryFn: () => (userId ? getAllUserNotes(userId, search) : Promise.resolve([])),
    enabled: !!userId,
  });
}

export function useCreateBookNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userBookId: string;
      title?: string | null;
      content: string;
      pageNumber?: number | null;
    }) => {
      return createBookNote(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.userBookId] });
      queryClient.invalidateQueries({ queryKey: ['all-notes'] });
    },
  });
}

export function useUpdateBookNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      noteId: string;
      userBookId: string;
      title?: string | null;
      content: string;
      pageNumber?: number | null;
    }) => {
      return updateBookNote(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.userBookId] });
      queryClient.invalidateQueries({ queryKey: ['all-notes'] });
    },
  });
}

export function useDeleteBookNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, userBookId }: { noteId: string; userBookId?: string }) => {
      return deleteBookNote(noteId);
    },
    onSuccess: (_, variables) => {
      if (variables.userBookId) {
        queryClient.invalidateQueries({ queryKey: ['notes', variables.userBookId] });
      }
      queryClient.invalidateQueries({ queryKey: ['all-notes'] });
    },
  });
}
