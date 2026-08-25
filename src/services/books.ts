import { createClient } from '@/lib/supabase/client';
import type { Book } from '@/types/database';

export async function searchGlobalBooks(query: string): Promise<Book[]> {
  if (!query || query.trim().length === 0) return [];
  const supabase = createClient();
  const trimmed = query.trim();

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .or(`title.ilike.%${trimmed}%,author.ilike.%${trimmed}%,isbn_10.ilike.%${trimmed}%,isbn_13.ilike.%${trimmed}%`)
    .limit(10);

  if (error) {
    console.error('Error searching global books:', error);
    return [];
  }

  return (data || []) as Book[];
}

export async function findBookByISBN(isbn: string): Promise<Book | null> {
  if (!isbn) return null;
  const cleanIsbn = isbn.replace(/[-\s]/g, '').trim();
  const supabase = createClient();

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .or(`isbn_10.eq.${cleanIsbn},isbn_13.eq.${cleanIsbn}`)
    .maybeSingle();

  if (error) {
    console.error('Error finding book by ISBN:', error);
    return null;
  }

  return data as Book | null;
}

export async function getBookById(id: string): Promise<Book | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching book by ID:', error);
    return null;
  }

  return data as Book | null;
}

export interface CreateBookInput {
  title: string;
  subtitle?: string | null;
  author?: string | null;
  publisher?: string | null;
  isbn_10?: string | null;
  isbn_13?: string | null;
  language?: string | null;
  release_year?: number | null;
  description?: string | null;
  page_count?: number | null;
  google_books_id?: string | null;
  open_library_id?: string | null;
}

export async function createOrFindBook(input: CreateBookInput): Promise<Book> {
  const supabase = createClient();

  // Clean ISBNs
  const isbn10 = input.isbn_10 ? input.isbn_10.replace(/[-\s]/g, '').trim() : null;
  const isbn13 = input.isbn_13 ? input.isbn_13.replace(/[-\s]/g, '').trim() : null;

  // 1. Check if book already exists by ISBN-13
  if (isbn13) {
    const existing13 = await findBookByISBN(isbn13);
    if (existing13) return existing13;
  }

  // 2. Check if book already exists by ISBN-10
  if (isbn10) {
    const existing10 = await findBookByISBN(isbn10);
    if (existing10) return existing10;
  }

  // 3. Insert new book
  const payload = {
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || null,
    author: input.author?.trim() || null,
    publisher: input.publisher?.trim() || null,
    isbn_10: isbn10 || null,
    isbn_13: isbn13 || null,
    language: input.language?.trim() || 'vi',
    release_year: input.release_year || null,
    description: input.description?.trim() || null,
    page_count: input.page_count && input.page_count > 0 ? input.page_count : null,
    google_books_id: input.google_books_id || null,
    open_library_id: input.open_library_id || null,
  };

  const { data, error } = await supabase
    .from('books')
    .insert(payload as any)
    .select('*')
    .single();

  if (error) {
    console.error('Error creating book in global catalog:', error);
    throw new Error(`Không thể tạo thông tin sách: ${error.message}`);
  }

  return data as Book;
}
