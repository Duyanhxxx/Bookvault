'use client';

import React from 'react';
import Link from 'next/link';
import { Bookmark, Edit3, Trash2, BookOpen } from 'lucide-react';
import type { BookNote } from '@/types/database';
import { formatDateVN } from '@/lib/utils';
import type { NoteWithBook } from '@/services/notes';

export function NoteCard({
  note,
  onEdit,
  onDelete,
  showBookLink = false,
}: {
  note: BookNote | NoteWithBook;
  onEdit?: (note: BookNote) => void;
  onDelete?: (noteId: string) => void;
  showBookLink?: boolean;
}) {
  const noteWithBook = note as NoteWithBook;
  const bookInfo = noteWithBook.user_books?.books;
  const userBookId = noteWithBook.user_books?.id || note.user_book_id;

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-xs transition-all hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-sm">
      <div className="space-y-2">
        {/* Top bar: Page Number Pill & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {note.page_number && note.page_number > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#f3eee7] dark:bg-stone-800 px-2 py-0.5 text-[11px] font-semibold text-[#1e3a2f] dark:text-emerald-400">
                <Bookmark className="h-3 w-3" />
                Trang {note.page_number}
              </span>
            ) : (
              <span className="text-[11px] text-stone-400 italic">Ghi chú chung</span>
            )}

            <span className="text-[11px] text-stone-400">
              {formatDateVN(note.created_at)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(note)}
                className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 cursor-pointer"
                title="Chỉnh sửa"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(note.id)}
                className="rounded p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 cursor-pointer"
                title="Xoá ghi chú"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Optional Book Title Link for global notes page */}
        {showBookLink && bookInfo && (
          <Link
            href={`/app/library/${userBookId}`}
            className="inline-flex items-center gap-1 font-serif text-xs font-semibold text-[#1e3a2f] dark:text-emerald-400 hover:underline"
          >
            <BookOpen className="h-3 w-3" />
            {bookInfo.title}
          </Link>
        )}

        {/* Title */}
        {note.title && (
          <h5 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
            {note.title}
          </h5>
        )}

        {/* Content */}
        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
          &ldquo;{note.content}&rdquo;
        </p>
      </div>
    </div>
  );
}
