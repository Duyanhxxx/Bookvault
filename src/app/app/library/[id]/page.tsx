'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  DollarSign,
  MapPin,
  Star,
  Clock,
  Bookmark,
  Tag as TagIcon,
  Camera,
  Trash2,
  Edit3,
  CheckCircle2,
  Plus,
  Share2,
} from 'lucide-react';
import { useBookDetail, useDeleteUserBook, useUpdateUserBook } from '@/hooks/useLibrary';
import { useBookNotes, useDeleteBookNote } from '@/hooks/useNotes';
import { useReadingSessions } from '@/hooks/useReading';
import { BookCover } from '@/components/books/BookCover';
import { BookStatusBadge } from '@/components/books/BookStatusBadge';
import { BookImageGallery } from '@/components/books/BookImageGallery';
import { BookUploader } from '@/components/books/BookUploader';
import { EditPersonalInfoModal } from '@/components/books/EditPersonalInfoModal';
import { ReadingProgressCard } from '@/components/reading/ReadingProgressCard';
import { ReadingSessionModal } from '@/components/reading/ReadingSessionModal';
import { ReadingHistory } from '@/components/reading/ReadingHistory';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteFormModal } from '@/components/notes/NoteFormModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatVND, formatDateVN, STATUS_CONFIG } from '@/lib/utils';
import type { BookStatus, BookNote } from '@/types/database';
import { toast } from 'sonner';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userBookId = params.id as string;

  const { data: book, isLoading, refetch } = useBookDetail(userBookId);
  const { data: notes = [], refetch: refetchNotes } = useBookNotes(userBookId);
  const { data: sessions = [], refetch: refetchSessions } = useReadingSessions(userBookId);

  const deleteBookMutation = useDeleteUserBook();
  const updateBookMutation = useUpdateUserBook();
  const deleteNoteMutation = useDeleteBookNote();

  // Modals state
  const [isEditPersonalModalOpen, setIsEditPersonalModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<BookNote | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-800">Không tìm thấy sách</h2>
        <p className="text-sm text-stone-500">Cuốn sách này không tồn tại hoặc đã bị xoá khỏi tủ sách.</p>
        <Link href="/app/library">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay về Tủ sách
          </Button>
        </Link>
      </div>
    );
  }

  const primaryImage =
    book.images?.find((img) => img.is_primary)?.image_url ||
    book.images?.[0]?.image_url;

  const handleDeleteBook = async () => {
    try {
      await deleteBookMutation.mutateAsync(book.id);
      toast.success('Đã xoá cuốn sách khỏi tủ sách của bạn.');
      router.push('/app/library');
    } catch (err: any) {
      toast.error(err.message || 'Không thể xoá sách.');
    }
  };

  const handleStatusChange = async (newStatus: BookStatus) => {
    try {
      await updateBookMutation.mutateAsync({
        userBookId: book.id,
        updates: {
          status: newStatus,
          started_reading_at:
            newStatus === 'READING' && !book.started_reading_at
              ? new Date().toISOString().split('T')[0]
              : book.started_reading_at,
          finished_reading_at:
            newStatus === 'READ'
              ? new Date().toISOString().split('T')[0]
              : book.finished_reading_at,
        },
      });
      setIsStatusMenuOpen(false);
      toast.success(`Đã chuyển trạng thái sang "${STATUS_CONFIG[newStatus].label}".`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật trạng thái.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back button & Action toolbar */}
      <div className="flex items-center justify-between">
        <Link
          href="/app/library"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Thư viện
        </Link>

        <div className="flex items-center gap-2">
          {/* Status Quick Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
              className="cursor-pointer"
            >
              <BookStatusBadge status={book.status} />
            </button>

            {isStatusMenuOpen && (
              <div className="absolute right-0 mt-2 z-30 w-44 rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl dark:border-stone-800 dark:bg-stone-900">
                {(Object.keys(STATUS_CONFIG) as BookStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(st)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 cursor-pointer"
                  >
                    <span className={`h-2 w-2 rounded-full ${STATUS_CONFIG[st].dot}`} />
                    <span>{STATUS_CONFIG[st].label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditPersonalModalOpen(true)}
            className="h-8 px-2.5 text-xs gap-1 text-stone-700 hover:text-[#1e3a2f]"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sửa thông tin cá nhân</span>
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="h-8 px-2.5 text-xs gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Xoá sách</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Cover/Gallery, Right Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Column: Book Cover & Photo Gallery */}
        <div className="space-y-6">
          <div className="flex justify-center rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs">
            <BookCover
              src={primaryImage}
              title={book.title}
              author={book.author}
              size="lg"
              className="w-44 h-64 sm:w-52 sm:h-76 book-shadow"
            />
          </div>

          {/* Physical Photo Uploader & Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-[#1e3a2f]" />
                Ảnh chụp sách vật lý ({book.images?.length || 0})
              </h3>
            </div>

            <BookImageGallery
              bookId={book.book_id}
              images={book.images || []}
              onImageChanged={() => refetch()}
            />

            <div className="pt-1">
              <BookUploader
                bookId={book.book_id}
                onUploaded={() => refetch()}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Title, Metadata, Progress, Purchase Info, Notes */}
        <div className="md:col-span-2 space-y-6">
          {/* Header titles */}
          <div className="space-y-2 border-b border-stone-200 dark:border-stone-800 pb-4">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {book.title}
            </h1>
            {book.subtitle && (
              <p className="font-serif italic text-base text-stone-600 dark:text-stone-400">
                {book.subtitle}
              </p>
            )}
            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Tác giả: <strong>{book.author || 'Chưa rõ tác giả'}</strong>
            </p>
          </div>

          {/* Reading Progress Card */}
          <ReadingProgressCard
            book={book}
            onUpdated={() => refetch()}
            onOpenSessionModal={() => setIsSessionModalOpen(true)}
          />

          {/* Personal Purchase & Ownership Information Box */}
          <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                Thông tin sở hữu cá nhân
              </h3>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditPersonalModalOpen(true)}
                className="text-xs gap-1.5 h-7 px-2.5 text-[#1e3a2f] border-[#1e3a2f]/30 hover:bg-emerald-50"
              >
                <Edit3 className="h-3 w-3" />
                Chỉnh sửa
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-0.5">
                <span className="text-stone-500 font-medium">Nơi mua:</span>
                <p className="font-semibold text-stone-800 dark:text-stone-200">
                  {book.purchase_store || 'Chưa lưu'}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-stone-500 font-medium">Giá mua:</span>
                <p className="font-semibold text-emerald-800 dark:text-emerald-400">
                  {formatVND(book.purchase_price)}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-stone-500 font-medium">Ngày mua:</span>
                <p className="font-semibold text-stone-800 dark:text-stone-200">
                  {formatDateVN(book.purchase_date)}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-stone-500 font-medium">Đánh giá:</span>
                <div className="flex items-center gap-1 font-semibold text-amber-600">
                  {book.rating ? (
                    <>
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{book.rating} / 5</span>
                    </>
                  ) : (
                    <span className="text-stone-400 font-normal">Chưa đánh giá</span>
                  )}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-stone-500 font-medium">Bắt đầu đọc:</span>
                <p className="font-semibold text-stone-800 dark:text-stone-200">
                  {formatDateVN(book.started_reading_at)}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-stone-500 font-medium">Hoàn thành:</span>
                <p className="font-semibold text-stone-800 dark:text-stone-200">
                  {formatDateVN(book.finished_reading_at)}
                </p>
              </div>
            </div>

            {book.notes && (
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400">
                <span className="font-medium text-stone-500">Ghi chú riêng:</span> {book.notes}
              </div>
            )}

            {/* Tags preview */}
            {book.tags && book.tags.length > 0 && (
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                  <TagIcon className="h-3 w-3" /> Thẻ:
                </span>
                {book.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor: `${tag.color || '#1e3a2f'}18`,
                      color: tag.color || '#1e3a2f',
                    }}
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Book Catalog Details */}
          <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs space-y-3">
            <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#1e3a2f]" />
              Thông tin ấn bản
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-stone-500">Nhà xuất bản:</span>
                <p className="font-medium text-stone-800 dark:text-stone-200">{book.publisher || '—'}</p>
              </div>
              <div>
                <span className="text-stone-500">Năm xuất bản:</span>
                <p className="font-medium text-stone-800 dark:text-stone-200">{book.release_year || '—'}</p>
              </div>
              <div>
                <span className="text-stone-500">Tổng số trang:</span>
                <p className="font-medium text-stone-800 dark:text-stone-200">{book.page_count ? `${book.page_count} trang` : '—'}</p>
              </div>
              <div>
                <span className="text-stone-500">Mã ISBN-13:</span>
                <p className="font-mono text-stone-800 dark:text-stone-200">{book.isbn_13 || '—'}</p>
              </div>
              <div>
                <span className="text-stone-500">Mã ISBN-10:</span>
                <p className="font-mono text-stone-800 dark:text-stone-200">{book.isbn_10 || '—'}</p>
              </div>
              <div>
                <span className="text-stone-500">Ngôn ngữ:</span>
                <p className="font-medium text-stone-800 dark:text-stone-200 uppercase">{book.language || 'vi'}</p>
              </div>
            </div>

            {book.description && (
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 space-y-1">
                <span className="font-semibold text-stone-700 dark:text-stone-300">Tóm tắt nội dung:</span>
                <p className="leading-relaxed whitespace-pre-line">{book.description}</p>
              </div>
            )}
          </div>

          {/* Section: Reading Sessions History */}
          <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#1e3a2f]" />
                Nhật ký các phiên đọc ({sessions.length})
              </h3>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsSessionModalOpen(true)}
                className="text-xs gap-1 h-8"
              >
                <Plus className="h-3.5 w-3.5" />
                Ghi phiên đọc
              </Button>
            </div>

            <ReadingHistory sessions={sessions} />
          </div>

          {/* Section: Book Notes */}
          <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-[#1e3a2f]" />
                Ghi chú & Trích dẫn ({notes.length})
              </h3>

              <Button
                size="sm"
                onClick={() => {
                  setEditingNote(null);
                  setIsNoteModalOpen(true);
                }}
                className="text-xs gap-1 h-8"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm ghi chú
              </Button>
            </div>

            {notes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/50 p-6 text-center text-xs text-stone-500">
                <p className="font-medium text-stone-700">Chưa có ghi chú nào cho cuốn sách này</p>
                <p className="mt-0.5">Nhấn &quot;Thêm ghi chú&quot; để lưu lại những câu trích dẫn và suy ngẫm hay.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={(n) => {
                      setEditingNote(n);
                      setIsNoteModalOpen(true);
                    }}
                    onDelete={async (noteId) => {
                      if (confirm('Bạn có chắc muốn xoá ghi chú này?')) {
                        await deleteNoteMutation.mutateAsync({ noteId, userBookId: book.id });
                        toast.success('Đã xoá ghi chú.');
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Personal Ownership Info Modal */}
      <EditPersonalInfoModal
        isOpen={isEditPersonalModalOpen}
        onClose={() => setIsEditPersonalModalOpen(false)}
        book={book}
        onSaved={() => refetch()}
      />

      {/* Log Reading Session Modal */}
      <ReadingSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        book={book}
        onSessionLogged={() => {
          refetch();
          refetchSessions();
        }}
      />

      {/* Note Form Modal */}
      <NoteFormModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
        }}
        userBookId={book.id}
        initialNote={editingNote}
        onSaved={() => refetchNotes()}
      />

      {/* Delete Book Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteBook}
        title="Xoá sách khỏi tủ sách?"
        description={`Bạn có chắc chắn muốn xoá cuốn "${book.title}" khỏi tủ sách cá nhân? Toàn bộ ảnh chụp và nhật ký đọc liên quan của bạn cũng sẽ bị gỡ bỏ.`}
        confirmText="Xoá khỏi tủ sách"
        isDestructive
        isLoading={deleteBookMutation.isPending}
      />
    </div>
  );
}
