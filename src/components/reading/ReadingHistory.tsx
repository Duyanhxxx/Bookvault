'use client';

import React from 'react';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import type { ReadingSession } from '@/types/database';
import { formatDateVN } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

export function ReadingHistory({
  sessions,
  isLoading,
}: {
  sessions?: ReadingSession[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/50 p-6 text-center text-xs text-stone-500">
        <Clock className="mx-auto h-6 w-6 text-stone-400 mb-1" />
        <p className="font-medium text-stone-700">Chưa có nhật ký đọc nào</p>
        <p className="mt-0.5">Nhấn &quot;Ghi phiên đọc hôm nay&quot; để lưu lại thói quen đọc mỗi ngày của bạn.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-stone-200 dark:before:bg-stone-800">
      {sessions.map((session) => {
        const pagesCount =
          session.start_page !== null && session.end_page !== null
            ? Math.max(0, session.end_page - session.start_page)
            : null;

        return (
          <div key={session.id} className="relative group">
            {/* Timeline bullet */}
            <div className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-stone-900 bg-[#1e3a2f] shadow-xs group-hover:scale-125 transition-transform" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-3 text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-stone-400" />
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  {formatDateVN(session.started_at)}
                </span>
                {session.start_page !== null && session.end_page !== null && (
                  <span className="text-stone-500 font-mono">
                    (Trang {session.start_page} &rarr; {session.end_page})
                  </span>
                )}
              </div>

              <div className="mt-1 sm:mt-0 flex items-center gap-3 font-medium text-stone-600 dark:text-stone-400">
                {pagesCount !== null && (
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <BookOpen className="h-3 w-3" />
                    +{pagesCount} trang
                  </span>
                )}
                {session.duration_minutes && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {session.duration_minutes} phút
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
