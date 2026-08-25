import { createClient } from '@/lib/supabase/client';
import type { BookNote } from '@/types/database';

export interface NoteWithBook extends BookNote {
  user_books?: {
    id: string;
    books?: {
      id: string;
      title: string;
      author: string | null;
    };
  };
}

export async function getNotesByBook(userBookId: string): Promise<BookNote[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('book_notes')
    .select('*')
    .eq('user_book_id', userBookId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching book notes:', error);
    return [];
  }

  return (data || []) as BookNote[];
}

export async function getAllUserNotes(userId: string, search?: string): Promise<NoteWithBook[]> {
  const supabase = createClient();

  let query = supabase
    .from('book_notes')
    .select(`
      *,
      user_books!inner (
        id,
        user_id,
        books (
          id,
          title,
          author
        )
      )
    `)
    .eq('user_books.user_id', userId)
    .order('created_at', { ascending: false });

  if (search && search.trim()) {
    query = query.or(`title.ilike.%${search.trim()}%,content.ilike.%${search.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching all user notes:', error);
    return [];
  }

  return (data || []) as unknown as NoteWithBook[];
}

export async function createBookNote({
  userBookId,
  title,
  content,
  pageNumber,
}: {
  userBookId: string;
  title?: string | null;
  content: string;
  pageNumber?: number | null;
}): Promise<BookNote> {
  const supabase = createClient();
  const payload = {
    user_book_id: userBookId,
    title: title?.trim() || null,
    content: content.trim(),
    page_number: pageNumber && pageNumber > 0 ? pageNumber : null,
  };

  const { data, error } = await supabase
    .from('book_notes')
    .insert(payload as any)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Lưu ghi chú thất bại: ${error.message}`);
  }

  return data as BookNote;
}

export async function updateBookNote({
  noteId,
  title,
  content,
  pageNumber,
}: {
  noteId: string;
  title?: string | null;
  content: string;
  pageNumber?: number | null;
}): Promise<BookNote> {
  const supabase = createClient();
  const payload = {
    title: title?.trim() || null,
    content: content.trim(),
    page_number: pageNumber && pageNumber > 0 ? pageNumber : null,
  };

  const { data, error } = await supabase
    .from('book_notes')
    .update(payload as any)
    .eq('id', noteId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Cập nhật ghi chú thất bại: ${error.message}`);
  }

  return data as BookNote;
}

export async function deleteBookNote(noteId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('book_notes').delete().eq('id', noteId);
  if (error) {
    throw new Error(`Xoá ghi chú thất bại: ${error.message}`);
  }
}
