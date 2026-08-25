'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserTags,
  createTag,
  updateTag,
  deleteTag,
  getBookTags,
  setBookTags,
} from '@/services/tags';
import { useUser } from './useUser';

export function useTags() {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['tags', userId],
    queryFn: () => (userId ? getUserTags(userId) : Promise.resolve([])),
    enabled: !!userId,
  });
}

export function useBookTags(userBookId: string) {
  return useQuery({
    queryKey: ['book-tags', userBookId],
    queryFn: () => (userBookId ? getBookTags(userBookId) : Promise.resolve([])),
    enabled: !!userBookId,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color?: string }) => {
      if (!user) throw new Error('Bạn cần đăng nhập để tạo thẻ.');
      return createTag(user.id, name, color);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tagId, name, color }: { tagId: string; name: string; color?: string }) => {
      return updateTag(tagId, name, color);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagId: string) => {
      return deleteTag(tagId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });
}

export function useSetBookTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userBookId,
      tagIds,
    }: {
      userBookId: string;
      tagIds: string[];
    }) => {
      return setBookTags(userBookId, tagIds);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['book-tags', variables.userBookId] });
      queryClient.invalidateQueries({ queryKey: ['book-detail', variables.userBookId] });
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });
}
