'use client';

import React from 'react';
import Link from 'next/link';
import { Star, BookOpen, ChevronRight, Tag as TagIcon } from 'lucide-react';
import type { MyLibraryItem } from '@/types/database';
import { BookCover } from './BookCover';
import { BookStatusBadge } from './BookStatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatVND, formatDateVN } from '@/lib/utils';

export function BookList({
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
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-stone-200/70 dark:border-stone-800 bg-white dark:bg-stone-900 p-4"
          >
            <Skeleton className="h-16 w-12 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
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
    <div className="space-y-3">
      {books.map((book) => {
        const primaryImage =
          book.images?.find((img) => img.is_primary)?.image_url ||
          book.images?.[0]?.image_url;

        return (
          <Link
            key={book.id}
            href={`/app/library/${book.id}`}
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 transition-all duration-200 hover:border-[#1e3a2f]/40 hover:shadow-md dark:hover:border-emerald-700/50"
          >
            {/* Left: Cover & Info */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <BookCover
                  src={primaryImage}
                  title={book.title}
                  author={book.author}
                  size="sm"
                  className="w-12 h-16 sm:w-14 sm:h-20"
                />
              </div>

              <div>
                <h4 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 group-hover:text-[#1e3a2f] dark:group-hover:text-emerald-400 transition-colors">
                  {book.title}
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                  {book.author || 'Tác giả chưa rõ'}
                  {book.release_year ? ` • ${book.release_year}` : ''}
                </p>

                {/* Additional metadata info */}
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-stone-500">
                  {book.purchase_store && (
                    <span>Mua tại: <strong className="text-stone-700 dark:text-stone-300">{book.purchase_store}</strong></span>
                  )}
                  {book.purchase_price !== null && (
                    <span>Giá: <strong className="text-stone-700 dark:text-stone-300">{formatVND(book.purchase_price)}</strong></span>
                  )}
                  {book.purchase_date && (
                    <span>Ngày: {formatDateVN(book.purchase_date)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Status, Progress, Tags, Action */}
            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 dark:border-stone-800">
              {/* Progress if reading */}
              {book.status === 'READING' && (
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-semibold text-[#1e3a2f] dark:text-emerald-400">
                    {book.current_page} / {book.total_pages || '?'} tr ({book.reading_progress}%)
                  </span>
                  <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                    <div
                      className="h-full rounded-full bg-[#1e3a2f] dark:bg-emerald-500"
                      style={{ width: `${Math.min(book.reading_progress || 0, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Rating */}
              {book.rating && book.rating > 0 ? (
                <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 text-xs">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  <span>{book.rating.toFixed(1)}</span>
                </div>
              ) : null}

              {/* Status Badge */}
              <BookStatusBadge status={book.status} />

              <ChevronRight className="h-4 w-4 text-stone-400 group-hover:text-stone-700 group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
