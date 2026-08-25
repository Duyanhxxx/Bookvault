'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, Star, DollarSign, MapPin, Calendar, Bookmark, Tag as TagIcon, Loader2, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { STATUS_CONFIG } from '@/lib/utils';
import { useTags } from '@/hooks/useTags';
import { useUpdateUserBook } from '@/hooks/useLibrary';
import { setBookTags } from '@/services/tags';
import type { MyLibraryItem, BookStatus, Tag } from '@/types/database';
import { toast } from 'sonner';

export interface EditPersonalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: MyLibraryItem;
  onSaved?: () => void;
}

export function EditPersonalInfoModal({
  isOpen,
  onClose,
  book,
  onSaved,
}: EditPersonalInfoModalProps) {
  const { data: allTags = [] } = useTags();
  const updateUserBookMutation = useUpdateUserBook();

  const [status, setStatus] = useState<BookStatus>(book.status || 'OWNED');
  const [rating, setRating] = useState<number>(book.rating || 0);
  const [purchaseStore, setPurchaseStore] = useState<string>(book.purchase_store || '');
  const [purchasePrice, setPurchasePrice] = useState<string>(
    book.purchase_price !== null && book.purchase_price !== undefined ? String(book.purchase_price) : ''
  );
  const [purchaseDate, setPurchaseDate] = useState<string>(book.purchase_date || '');
  const [startedReadingAt, setStartedReadingAt] = useState<string>(book.started_reading_at || '');
  const [finishedReadingAt, setFinishedReadingAt] = useState<string>(book.finished_reading_at || '');
  const [notes, setNotes] = useState<string>(book.notes || '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    book.tags?.map((t) => t.id) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && book) {
      setStatus(book.status || 'OWNED');
      setRating(book.rating || 0);
      setPurchaseStore(book.purchase_store || '');
      setPurchasePrice(
        book.purchase_price !== null && book.purchase_price !== undefined ? String(book.purchase_price) : ''
      );
      setPurchaseDate(book.purchase_date || '');
      setStartedReadingAt(book.started_reading_at || '');
      setFinishedReadingAt(book.finished_reading_at || '');
      setNotes(book.notes || '');
      setSelectedTagIds(book.tags?.map((t) => t.id) || []);
    }
  }, [isOpen, book]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Update user_books record
      await updateUserBookMutation.mutateAsync({
        userBookId: book.id,
        updates: {
          status,
          rating: rating > 0 ? rating : null,
          purchase_store: purchaseStore.trim() || null,
          purchase_price: purchasePrice !== '' ? Number(purchasePrice) : null,
          purchase_date: purchaseDate || null,
          started_reading_at: startedReadingAt || null,
          finished_reading_at: finishedReadingAt || null,
          notes: notes.trim() || null,
        },
      });

      // 2. Update book_tags
      await setBookTags(book.id, selectedTagIds);

      toast.success('Đã cập nhật thông tin sở hữu cá nhân thành công!');
      onSaved?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <Edit3 className="h-5 w-5 text-[#1e3a2f]" />
          <span>Chỉnh sửa thông tin sở hữu cá nhân</span>
        </div>
      }
      description={`Cập nhật thông tin mua, đánh giá và ghi chú riêng cho cuốn "${book.title}"`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
            Trạng thái sách *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(Object.keys(STATUS_CONFIG) as BookStatus[]).map((st) => {
              const conf = STATUS_CONFIG[st];
              const isSelected = status === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#1e3a2f] bg-emerald-50 text-[#1e3a2f] ring-2 ring-[#1e3a2f]/20 shadow-2xs'
                      : 'border-stone-200 bg-white hover:border-stone-300 text-stone-600'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full mb-1 ${conf.dot}`} />
                  {conf.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Purchase Info Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Nơi mua sách"
            placeholder="Fahasa, Nhã Nam, Tiki..."
            value={purchaseStore}
            onChange={(e) => setPurchaseStore(e.target.value)}
            leftIcon={<MapPin className="h-4 w-4" />}
          />

          <Input
            label="Giá mua (VNĐ)"
            type="number"
            min="0"
            placeholder="120000"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            leftIcon={<DollarSign className="h-4 w-4" />}
          />

          <Input
            label="Ngày mua"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            leftIcon={<Calendar className="h-4 w-4" />}
          />
        </div>

        {/* Dates Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Ngày bắt đầu đọc"
            type="date"
            value={startedReadingAt}
            onChange={(e) => setStartedReadingAt(e.target.value)}
            leftIcon={<Calendar className="h-4 w-4" />}
          />

          <Input
            label="Ngày hoàn thành"
            type="date"
            value={finishedReadingAt}
            onChange={(e) => setFinishedReadingAt(e.target.value)}
            leftIcon={<Calendar className="h-4 w-4" />}
          />
        </div>

        {/* Rating Row */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
            Đánh giá cá nhân: {rating > 0 ? `${rating} / 5 ⭐` : 'Chưa đánh giá'}
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(rating === star ? 0 : star)}
                className="text-2xl hover:scale-110 transition-transform cursor-pointer"
              >
                {star <= rating ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>

        {/* Tags Selection */}
        {allTags.length > 0 && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Gắn thẻ phân loại
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag: Tag) => {
                const isTagged = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      const next = isTagged
                        ? selectedTagIds.filter((id) => id !== tag.id)
                        : [...selectedTagIds, tag.id];
                      setSelectedTagIds(next);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer ${
                      isTagged
                        ? 'bg-[#1e3a2f] text-white border-[#1e3a2f]'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    #{tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Personal Notes */}
        <Textarea
          label="Ghi chú riêng về cuốn sách"
          placeholder="Ví dụ: Bạn tặng sinh nhật, sách ấn bản giới hạn..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

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
                Lưu thông tin
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
