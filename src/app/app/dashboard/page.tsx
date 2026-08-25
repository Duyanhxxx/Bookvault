'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Flame,
  CheckCircle2,
  Heart,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Bookmark,
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useLibrary, useLibraryStats } from '@/hooks/useLibrary';
import { BookCover } from '@/components/books/BookCover';
import { BookCard } from '@/components/books/BookCard';
import { BookStatusBadge } from '@/components/books/BookStatusBadge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import type { MyLibraryItem } from '@/types/database';

export default function DashboardPage() {
  const { user, profile, loading: userLoading } = useUser();
  const { data: stats, isLoading: statsLoading } = useLibraryStats();
  const { data: allBooks = [], isLoading: booksLoading } = useLibrary();

  // Greeting by hour of the day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'bạn';

  // Slices
  const currentlyReading = allBooks.filter((b) => b.status === 'READING');
  const recentlyAdded = [...allBooks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  const recentlyRead = allBooks
    .filter((b) => b.status === 'READ')
    .slice(0, 5);

  return (
    <div className="space-y-10">
      {/* Editorial Header */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {getGreeting()}, {displayName}
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Chào mừng trở lại tủ sách số của bạn. Dưới đây là kệ sách hiện tại.
        </p>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Total Books */}
        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Tổng số sách</span>
            <BookOpen className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalBooks || 0}
          </p>
          <span className="text-[11px] text-stone-400 font-medium">cuốn trong tủ</span>
        </div>

        {/* Stat 2: Currently Reading */}
        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Đang đọc</span>
            <Flame className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-400">
            {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.reading || 0}
          </p>
          <span className="text-[11px] text-stone-400 font-medium">đang theo dõi</span>
        </div>

        {/* Stat 3: Books Read */}
        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Đã đọc xong</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-400">
            {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.read || 0}
          </p>
          <span className="text-[11px] text-stone-400 font-medium">cuốn hoàn thành</span>
        </div>

        {/* Stat 4: Wishlist */}
        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Muốn đọc</span>
            <Heart className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-700 dark:text-amber-400">
            {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.wishlist || 0}
          </p>
          <span className="text-[11px] text-stone-400 font-medium">trong danh sách</span>
        </div>
      </div>

      {/* Main Section: "Continue Reading" */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#1e3a2f] dark:text-emerald-400" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
              Tiếp tục đọc
            </h2>
          </div>
          {currentlyReading.length > 0 && (
            <Link
              href="/app/reading"
              className="text-xs font-semibold text-[#1e3a2f] dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              Xem tất cả ({currentlyReading.length}) &rarr;
            </Link>
          )}
        </div>

        {booksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        ) : currentlyReading.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#dcd6ca] bg-white/60 dark:bg-stone-900/40 p-6 text-center text-xs text-stone-500 space-y-2">
            <p className="font-medium text-stone-700 dark:text-stone-300">
              Hiện tại bạn chưa đánh dấu cuốn sách nào là &quot;Đang đọc&quot;.
            </p>
            <p>Chọn một cuốn sách từ thư viện và cập nhật trạng thái để theo dõi tiến độ mỗi ngày!</p>
            <div className="pt-1">
              <Link href="/app/library">
                <Button size="sm" variant="outline" className="text-xs">
                  Khám phá tủ sách
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentlyReading.map((book) => {
              const primaryImage =
                book.images?.find((img) => img.is_primary)?.image_url ||
                book.images?.[0]?.image_url;

              return (
                <div
                  key={book.id}
                  className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-xs hover:border-[#1e3a2f]/40 transition-colors"
                >
                  <BookCover
                    src={primaryImage}
                    title={book.title}
                    author={book.author}
                    size="sm"
                    className="w-20 h-28 sm:w-24 sm:h-34 flex-shrink-0"
                  />

                  <div className="flex-1 space-y-2 w-full text-center sm:text-left">
                    <div>
                      <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                        {book.title}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400">
                        {book.author || 'Tác giả chưa rõ'}
                      </p>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                        <span>
                          {book.current_page} / {book.total_pages || '?'} trang
                        </span>
                        <span className="text-[#1e3a2f] dark:text-emerald-400">
                          {book.reading_progress}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                        <div
                          className="h-full rounded-full bg-[#1e3a2f] dark:bg-emerald-500 transition-all duration-300"
                          style={{ width: `${Math.min(book.reading_progress || 0, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <Link href={`/app/library/${book.id}`}>
                        <Button size="sm" className="w-full sm:w-auto text-xs gap-1.5 h-8">
                          <BookOpen className="h-3.5 w-3.5" />
                          Tiếp tục đọc &rarr;
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section: "Recently Added" */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            Mới thêm vào tủ sách
          </h2>
          <Link
            href="/app/library"
            className="text-xs font-semibold text-[#1e3a2f] dark:text-emerald-400 hover:underline"
          >
            Xem toàn bộ tủ sách &rarr;
          </Link>
        </div>

        {booksLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
            ))}
          </div>
        ) : recentlyAdded.length === 0 ? (
          <EmptyState
            title="Tủ sách của bạn còn trống"
            description="Hãy bắt đầu thêm những cuốn sách đầu tiên bạn đang sở hữu."
            actionLabel="Thêm sách mới"
            onAction={() => {
              const addBtn = document.querySelector('header button');
              if (addBtn instanceof HTMLElement) addBtn.click();
            }}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {recentlyAdded.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* Section: "Recently Read" */}
      {recentlyRead.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
              Sách đã đọc xong gần đây
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {recentlyRead.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
