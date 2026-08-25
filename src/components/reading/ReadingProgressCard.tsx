'use client';

import React, { useState } from 'react';
import { BookOpen, CheckCircle, Play, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateBookProgress } from '@/services/reading';
import type { MyLibraryItem, BookStatus } from '@/types/database';
import { toast } from 'sonner';

export function ReadingProgressCard({
  book,
  onUpdated,
  onOpenSessionModal,
}: {
  book: MyLibraryItem;
  onUpdated?: () => void;
  onOpenSessionModal?: () => void;
}) {
  const [currentPage, setCurrentPage] = useState<number>(book.current_page || 0);
  const [isUpdating, setIsUpdating] = useState(false);

  const totalPages = book.total_pages || 0;
  const progressPercent =
    totalPages > 0 ? Number(((currentPage / totalPages) * 100).toFixed(1)) : 0;

  const handleSaveProgress = async (newPage: number) => {
    setIsUpdating(true);
    try {
      await updateBookProgress({
        userBookId: book.id,
        currentPage: newPage,
        totalPages: book.total_pages,
        currentStatus: book.status,
      });
      toast.success('Đã cập nhật tiến độ đọc.');
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật tiến độ.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAsFinished = async () => {
    if (!book.total_pages) {
      handleSaveProgress(book.current_page);
      return;
    }
    setCurrentPage(book.total_pages);
    await handleSaveProgress(book.total_pages);
  };

  return (
    <div className="rounded-2xl border border-[#e7e2d9] bg-white dark:bg-stone-900 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#1e3a2f] dark:text-emerald-400" />
          <h4 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100">
            Tiến độ đọc sách
          </h4>
        </div>
        <span className="font-sans text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          {progressPercent}% hoàn thành
        </span>
      </div>

      {/* Progress bar visual */}
      <div className="space-y-1.5">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#1e3a2f] to-[#2d5a47] dark:from-emerald-600 dark:to-emerald-400 transition-all duration-300"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-stone-500 font-medium">
          <span>Trang {currentPage}</span>
          <span>Tổng {totalPages > 0 ? `${totalPages} trang` : 'chưa có số trang'}</span>
        </div>
      </div>

      {/* Quick interactive page updater */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            type="number"
            min={0}
            max={totalPages || undefined}
            value={currentPage}
            onChange={(e) => setCurrentPage(Math.max(0, Number(e.target.value)))}
            className="w-24 text-center font-bold"
          />
          <Button
            size="sm"
            onClick={() => handleSaveProgress(currentPage)}
            disabled={isUpdating || currentPage === book.current_page}
            className="text-xs"
          >
            {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Lưu trang'}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
          {onOpenSessionModal && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onOpenSessionModal}
              className="text-xs gap-1.5 flex-1 sm:flex-initial"
            >
              <Plus className="h-3.5 w-3.5" />
              Ghi phiên đọc hôm nay
            </Button>
          )}

          {book.status !== 'READ' && totalPages > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAsFinished}
              disabled={isUpdating}
              className="text-xs gap-1.5 flex-1 sm:flex-initial border-emerald-300 text-emerald-800 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Đã đọc xong
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
