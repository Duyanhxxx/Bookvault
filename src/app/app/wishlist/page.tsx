'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Check, Plus, Trash2, DollarSign, BookOpen } from 'lucide-react';
import { useLibrary, useUpdateUserBook, useDeleteUserBook } from '@/hooks/useLibrary';
import { BookCover } from '@/components/books/BookCover';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatVND } from '@/lib/utils';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { data: allBooks = [], isLoading, refetch } = useLibrary({ status: 'WISHLIST' });
  const updateBookMutation = useUpdateUserBook();
  const deleteBookMutation = useDeleteUserBook();

  const wishlistBooks = allBooks.filter((b) => b.status === 'WISHLIST');

  const handleMarkAsOwned = async (bookId: string, title: string) => {
    try {
      await updateBookMutation.mutateAsync({
        userBookId: bookId,
        updates: {
          status: 'OWNED',
          purchase_date: new Date().toISOString().split('T')[0],
        },
      });
      toast.success(`Đã chuyển "${title}" sang Đang sở hữu!`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật.');
    }
  };

  const handleRemove = async (bookId: string) => {
    if (!confirm('Bạn có chắc muốn bỏ cuốn sách này khỏi danh sách muốn mua?')) return;
    try {
      await deleteBookMutation.mutateAsync(bookId);
      toast.success('Đã xoá khỏi danh sách muốn mua.');
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xoá.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-amber-600 fill-amber-500/30" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Danh sách muốn mua / Wishlist ({wishlistBooks.length})
            </h1>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Những cuốn sách bạn dự định mua khi ghé nhà sách hoặc trên các sàn thương mại.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : wishlistBooks.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-8 w-8 text-amber-600" />}
          title="Danh sách muốn mua đang trống"
          description="Khi bạn thấy một cuốn sách hay nhưng chưa kịp mua, hãy thêm vào đây với trạng thái 'Muốn đọc'."
          actionLabel="Tìm sách để thêm"
          onAction={() => {
            const searchBtn = document.querySelector('header button');
            if (searchBtn instanceof HTMLElement) searchBtn.click();
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistBooks.map((book) => {
            const primaryImage =
              book.images?.find((img) => img.is_primary)?.image_url ||
              book.images?.[0]?.image_url;

            return (
              <div
                key={book.id}
                className="flex flex-col justify-between rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-xs hover:border-amber-500/40 transition-colors"
              >
                <div className="flex gap-4 items-start">
                  <BookCover
                    src={primaryImage}
                    title={book.title}
                    author={book.author}
                    size="sm"
                    className="w-16 h-24 flex-shrink-0"
                  />

                  <div className="flex-1 space-y-1">
                    <Link
                      href={`/app/library/${book.id}`}
                      className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100 hover:text-[#1e3a2f] dark:hover:text-emerald-400 line-clamp-2"
                    >
                      {book.title}
                    </Link>
                    <p className="text-xs text-stone-500 line-clamp-1">
                      {book.author || 'Chưa rõ tác giả'}
                    </p>

                    {book.purchase_price !== null && (
                      <div className="flex items-center gap-1 text-xs text-emerald-800 font-semibold pt-1">
                        <DollarSign className="h-3 w-3" />
                        <span>Dự tính: {formatVND(book.purchase_price)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleMarkAsOwned(book.id, book.title)}
                    className="flex-1 text-xs gap-1.5 h-8 font-semibold bg-emerald-800 hover:bg-emerald-900 text-white"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Đã mua sách
                  </Button>

                  <button
                    onClick={() => handleRemove(book.id)}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Bỏ khỏi wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
