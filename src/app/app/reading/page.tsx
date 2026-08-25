'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, BookOpen, Clock, Plus, Sparkles } from 'lucide-react';
import { useLibrary } from '@/hooks/useLibrary';
import { BookCover } from '@/components/books/BookCover';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';

export default function ReadingPage() {
  const { data: allBooks = [], isLoading } = useLibrary({ status: 'READING' });

  const readingBooks = allBooks.filter((b) => b.status === 'READING');

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Đang đọc ({readingBooks.length})
            </h1>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Theo dõi tiến độ đọc từng trang và duy trì thói quen đọc sách mỗi ngày.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : readingBooks.length === 0 ? (
        <EmptyState
          icon={<Flame className="h-8 w-8 text-blue-600" />}
          title="Bạn chưa có cuốn sách nào đang đọc"
          description="Khám phá tủ sách và chuyển trạng thái một cuốn sang 'Đang đọc' để bắt đầu ghi nhận tiến độ."
          actionLabel="Xem tủ sách"
          onAction={() => {
            window.location.href = '/app/library';
          }}
        />
      ) : (
        <div className="space-y-4">
          {readingBooks.map((book) => {
            const primaryImage =
              book.images?.find((img) => img.is_primary)?.image_url ||
              book.images?.[0]?.image_url;

            return (
              <div
                key={book.id}
                className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs hover:border-[#1e3a2f]/40 transition-colors"
              >
                <div className="flex-shrink-0">
                  <BookCover
                    src={primaryImage}
                    title={book.title}
                    author={book.author}
                    size="md"
                    className="w-24 h-36 sm:w-28 sm:h-40"
                  />
                </div>

                <div className="flex-1 space-y-3 w-full text-center sm:text-left">
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                      {book.title}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400 font-medium mt-0.5">
                      {book.author || 'Tác giả chưa rõ'}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                      <span className="flex items-center gap-1.5 text-[#1e3a2f] dark:text-emerald-400">
                        <BookOpen className="h-3.5 w-3.5" />
                        Đang đọc trang {book.current_page} / {book.total_pages || '?'}
                      </span>
                      <span className="font-bold text-emerald-800 dark:text-emerald-400">
                        {book.reading_progress}%
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#1e3a2f] to-[#2d5a47] dark:from-emerald-600 dark:to-emerald-400 transition-all duration-300"
                        style={{ width: `${Math.min(book.reading_progress || 0, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <Link href={`/app/library/${book.id}`}>
                      <Button size="sm" className="gap-1.5 text-xs h-9">
                        <BookOpen className="h-3.5 w-3.5" />
                        Tiếp tục đọc & Ghi nhật ký &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
