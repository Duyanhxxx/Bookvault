'use client';

import React from 'react';
import type { MyLibraryItem } from '@/types/database';
import { BookCard } from './BookCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';

export function BookGrid({
  books,
  isLoading,
  onAddBook,
}: {
  books?: MyLibraryItem[];
  isLoading?: boolean;
  onAddBook?: () => void;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border border-stone-200/70 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 space-y-3"
          >
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-2 w-full mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <EmptyState
        title="Tủ sách chưa có cuốn sách nào"
        description="Bắt đầu xây dựng tủ sách số cá nhân bằng cách thêm cuốn sách đầu tiên của bạn."
        actionLabel="Thêm sách mới"
        onAction={onAddBook}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
