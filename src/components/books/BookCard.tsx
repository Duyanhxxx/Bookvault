'use client';

import React from 'react';
import Link from 'next/link';
import { Star, BookOpen, Clock, Tag as TagIcon } from 'lucide-react';
import type { MyLibraryItem } from '@/types/database';
import { BookCover } from './BookCover';
import { BookStatusBadge } from './BookStatusBadge';

export function BookCard({ book }: { book: MyLibraryItem }) {
  // Find primary image or first image
  const primaryImage =
    book.images?.find((img) => img.is_primary)?.image_url ||
    book.images?.[0]?.image_url;

  const showProgress =
    book.status === 'READING' || (book.current_page > 0 && book.total_pages && book.total_pages > 0);

  return (
    <Link
      href={`/app/library/${book.id}`}
      className="group relative flex flex-col rounded-xl bg-white dark:bg-stone-900 border border-[#e7e2d9] dark:border-stone-800 p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#1e3a2f]/40 dark:hover:border-emerald-700/50"
    >
      {/* Cover container */}
      <div className="relative mb-3 flex items-center justify-center overflow-hidden rounded-lg bg-[#f7f4ee] dark:bg-stone-800/60 p-2 sm:p-3 aspect-[3/4]">
        <div className="book-shadow group-hover:scale-[1.03] transition-transform duration-300">
          <BookCover
            src={primaryImage}
            title={book.title}
            author={book.author}
            size="fill"
            className="w-28 h-40 sm:w-32 sm:h-46"
          />
        </div>

        {/* Floating status badge on top right */}
        <div className="absolute top-2 right-2 z-20">
          <BookStatusBadge status={book.status} />
        </div>
      </div>

      {/* Book details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h4 className="font-serif text-sm sm:text-base font-semibold leading-snug text-stone-900 dark:text-stone-100 line-clamp-2 group-hover:text-[#1e3a2f] dark:group-hover:text-emerald-400 transition-colors">
            {book.title}
          </h4>
          <p className="mt-1 text-xs text-stone-600 dark:text-stone-400 line-clamp-1 font-medium">
            {book.author || 'Tác giả chưa rõ'}
          </p>
        </div>

        {/* Meta / Progress / Rating */}
        <div className="mt-3 space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800/80 text-xs text-stone-500 dark:text-stone-400">
          {/* Progress bar if reading */}
          {showProgress && (
            <div>
              <div className="flex justify-between items-center text-[11px] mb-1 font-medium">
                <span className="flex items-center gap-1 text-[#1e3a2f] dark:text-emerald-400">
                  <BookOpen className="h-3 w-3" />
                  {book.current_page} / {book.total_pages || '?'} tr
                </span>
                <span className="font-semibold">{book.reading_progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                <div
                  className="h-full rounded-full bg-[#1e3a2f] dark:bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(book.reading_progress || 0, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Rating and Tags row */}
          <div className="flex items-center justify-between gap-1 pt-0.5">
            {book.rating && book.rating > 0 ? (
              <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 text-xs">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                <span>{book.rating.toFixed(1)}</span>
              </div>
            ) : (
              <span className="text-[11px] text-stone-400">Chưa đánh giá</span>
            )}

            {/* Tags preview */}
            {book.tags && book.tags.length > 0 && (
              <div className="flex items-center gap-1 overflow-hidden">
                <span
                  className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: `${book.tags[0].color || '#1e3a2f'}18`,
                    color: book.tags[0].color || '#1e3a2f',
                  }}
                >
                  <TagIcon className="h-2.5 w-2.5" />
                  <span className="truncate max-w-[60px]">{book.tags[0].name}</span>
                </span>
                {book.tags.length > 1 && (
                  <span className="text-[10px] text-stone-400 font-medium">
                    +{book.tags.length - 1}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
