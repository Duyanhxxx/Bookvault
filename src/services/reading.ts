import { createClient } from '@/lib/supabase/client';
import type { ReadingSession, BookStatus } from '@/types/database';

export interface ReadingSessionWithBook extends ReadingSession {
  user_books?: {
    id: string;
    current_page: number;
    books?: {
      id: string;
      title: string;
      author: string | null;
      page_count: number | null;
    };
  };
}

export async function getReadingSessions(userBookId: string): Promise<ReadingSession[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reading_sessions')
    .select('*')
    .eq('user_book_id', userBookId)
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Error fetching reading sessions:', error);
    return [];
  }

  return (data || []) as ReadingSession[];
}

export async function logReadingSession({
  userBookId,
  startPage,
  endPage,
  durationMinutes,
  startedAt,
  endedAt,
  totalPages,
}: {
  userBookId: string;
  startPage?: number | null;
  endPage?: number | null;
  durationMinutes?: number | null;
  startedAt?: string;
  endedAt?: string;
  totalPages?: number | null;
}): Promise<ReadingSession> {
  const supabase = createClient();

  const now = new Date().toISOString();
  const sessionStartTime = startedAt || now;

  // 1. Create reading session record
  const sessionPayload = {
    user_book_id: userBookId,
    start_page: startPage && startPage >= 0 ? startPage : null,
    end_page: endPage && endPage >= 0 ? endPage : null,
    duration_minutes: durationMinutes && durationMinutes >= 0 ? durationMinutes : null,
    started_at: sessionStartTime,
    ended_at: endedAt || null,
  };

  const { data: sessionData, error: sessionError } = await supabase
    .from('reading_sessions')
    .insert(sessionPayload as any)
    .select('*')
    .single();

  if (sessionError) {
    throw new Error(`Lưu phiên đọc thất bại: ${sessionError.message}`);
  }

  // 2. Update user_books current_page if endPage provided
  if (endPage !== undefined && endPage !== null && endPage >= 0) {
    const isCompleted = totalPages && endPage >= totalPages;
    const updatePayload: {
      current_page: number;
      status?: BookStatus;
      finished_reading_at?: string;
      started_reading_at?: string;
    } = {
      current_page: endPage,
    };

    if (isCompleted) {
      updatePayload.status = 'READ';
      updatePayload.finished_reading_at = new Date().toISOString().split('T')[0];
    } else {
      updatePayload.status = 'READING';
      updatePayload.started_reading_at = new Date().toISOString().split('T')[0];
    }

    await supabase
      .from('user_books')
      .update(updatePayload as any)
      .eq('id', userBookId);
  }

  return sessionData as ReadingSession;
}

export async function updateBookProgress({
  userBookId,
  currentPage,
  totalPages,
  currentStatus,
}: {
  userBookId: string;
  currentPage: number;
  totalPages?: number | null;
  currentStatus?: BookStatus;
}): Promise<void> {
  const supabase = createClient();

  const clampedPage = totalPages ? Math.min(currentPage, totalPages) : currentPage;
  const isFinished = totalPages ? clampedPage >= totalPages : false;

  const updates: Record<string, any> = {
    current_page: Math.max(0, clampedPage),
  };

  if (isFinished) {
    updates.status = 'READ';
    updates.finished_reading_at = new Date().toISOString().split('T')[0];
  } else if (currentStatus === 'OWNED' || currentStatus === 'WISHLIST') {
    updates.status = 'READING';
    updates.started_reading_at = new Date().toISOString().split('T')[0];
  }

  const { error } = await supabase
    .from('user_books')
    .update(updates as any)
    .eq('id', userBookId);

  if (error) {
    throw new Error(`Cập nhật tiến độ thất bại: ${error.message}`);
  }
}
