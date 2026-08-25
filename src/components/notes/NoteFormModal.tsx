'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, Loader2, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { createBookNote, updateBookNote } from '@/services/notes';
import type { BookNote } from '@/types/database';
import { toast } from 'sonner';

export function NoteFormModal({
  isOpen,
  onClose,
  userBookId,
  initialNote,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  userBookId: string;
  initialNote?: BookNote | null;
  onSaved?: () => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || '');
      setContent(initialNote.content || '');
      setPageNumber(initialNote.page_number ? String(initialNote.page_number) : '');
    } else {
      setTitle('');
      setContent('');
      setPageNumber('');
    }
  }, [initialNote, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung ghi chú.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialNote) {
        await updateBookNote({
          noteId: initialNote.id,
          title,
          content,
          pageNumber: Number(pageNumber) || null,
        });
        toast.success('Đã cập nhật ghi chú.');
      } else {
        await createBookNote({
          userBookId,
          title,
          content,
          pageNumber: Number(pageNumber) || null,
        });
        toast.success('Đã thêm ghi chú mới.');
      }

      onSaved?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu ghi chú.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={initialNote ? 'Chỉnh sửa ghi chú' : 'Thêm ghi chú suy ngẫm'}
      description="Lưu lại những câu trích dẫn tâm đắc hoặc bài học từ cuốn sách."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input
              label="Tiêu đề (tuỳ chọn)"
              placeholder="Ý tưởng quan trọng, Trích dẫn hay..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Input
              label="Tại trang số"
              type="number"
              min="1"
              placeholder="124"
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              leftIcon={<Bookmark className="h-4 w-4" />}
            />
          </div>
        </div>

        <Textarea
          label="Nội dung ghi chú *"
          placeholder="Ví dụ: Những thói quen nhỏ tích luỹ theo thời gian sẽ tạo nên kết quả đột phá..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          required
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
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
                Lưu ghi chú
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
