'use client';

import React, { useState } from 'react';
import { Clock, BookOpen, Calendar, Loader2, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { logReadingSession } from '@/services/reading';
import type { MyLibraryItem } from '@/types/database';
import { toast } from 'sonner';

export function ReadingSessionModal({
  isOpen,
  onClose,
  book,
  onSessionLogged,
}: {
  isOpen: boolean;
  onClose: () => void;
  book: MyLibraryItem;
  onSessionLogged?: () => void;
}) {
  const [startPage, setStartPage] = useState<string>(String(book.current_page || 0));
  const [endPage, setEndPage] = useState<string>(
    String(Math.min((book.current_page || 0) + 20, book.total_pages || (book.current_page || 0) + 20))
  );
  const [durationMinutes, setDurationMinutes] = useState<string>('30');
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pagesRead = Math.max(0, (Number(endPage) || 0) - (Number(startPage) || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const start = Number(startPage);
    const end = Number(endPage);

    if (end < start) {
      toast.error('Trang kết thúc phải lớn hơn hoặc bằng trang bắt đầu.');
      return;
    }

    setIsSubmitting(true);
    try {
      await logReadingSession({
        userBookId: book.id,
        startPage: start,
        endPage: end,
        durationMinutes: Number(durationMinutes) || null,
        startedAt: `${sessionDate}T12:00:00.000Z`,
        totalPages: book.total_pages,
      });

      toast.success(`Đã ghi nhận đọc ${pagesRead} trang hôm nay!`);
      onSessionLogged?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu phiên đọc.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Ghi nhật ký đọc sách"
      description={`Ghi lại tiến độ đọc của cuốn "${book.title}"`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl bg-[#f3eee7]/60 dark:bg-stone-800/40 p-3 text-center">
          <span className="text-xs text-stone-500 font-medium">Số trang bạn đã đọc trong phiên này:</span>
          <p className="font-serif text-2xl font-bold text-[#1e3a2f] dark:text-emerald-400">
            {pagesRead} <span className="text-sm font-sans font-normal text-stone-600">trang</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Trang bắt đầu"
            type="number"
            min="0"
            value={startPage}
            onChange={(e) => setStartPage(e.target.value)}
            required
          />
          <Input
            label="Trang kết thúc"
            type="number"
            min="0"
            max={book.total_pages || undefined}
            value={endPage}
            onChange={(e) => setEndPage(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Thời gian đọc (phút)"
            type="number"
            min="1"
            placeholder="30"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            leftIcon={<Clock className="h-4 w-4" />}
          />
          <Input
            label="Ngày đọc"
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            leftIcon={<Calendar className="h-4 w-4" />}
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5 font-semibold">
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Lưu phiên đọc
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
