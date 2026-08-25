'use client';

import React, { useState } from 'react';
import { Bookmark, Search, Plus } from 'lucide-react';
import { useAllUserNotes, useDeleteBookNote } from '@/hooks/useNotes';
import { NoteCard } from '@/components/notes/NoteCard';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { toast } from 'sonner';

export default function AllNotesPage() {
  const [search, setSearch] = useState('');
  const { data: notes = [], isLoading, refetch } = useAllUserNotes(search);
  const deleteNoteMutation = useDeleteBookNote();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-[#1e3a2f]" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Ghi chú & Trích dẫn ({notes.length})
            </h1>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Tổng hợp toàn bộ các suy ngẫm, trích dẫn và bài học từ các cuốn sách của bạn.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-72">
          <Input
            placeholder="Tìm theo trích dẫn, từ khoá..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="h-10 text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-8 w-8 text-[#1e3a2f]" />}
          title="Chưa có ghi chú nào"
          description="Khi đọc sách, hãy ghi lại những câu trích dẫn tâm đắc nhất vào từng cuốn sách."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              showBookLink={true}
              onDelete={async (noteId) => {
                if (confirm('Bạn có chắc muốn xoá ghi chú này?')) {
                  await deleteNoteMutation.mutateAsync({ noteId });
                  toast.success('Đã xoá ghi chú.');
                  refetch();
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
