import { createClient } from '@/lib/supabase/client';
import type { MyLibraryItem, BookStatus, UserBook, BookImage, Tag } from '@/types/database';
import { getSignedUrlsForImages } from './storage';

export interface LibraryFilters {
  status?: BookStatus | 'ALL';
  tagId?: string;
  search?: string;
  sortBy?: 'recently_added' | 'title' | 'author' | 'rating' | 'progress';
}

export async function getUserLibrary(
  userId: string,
  filters: LibraryFilters = {}
): Promise<MyLibraryItem[]> {
  const supabase = createClient();

  let query = supabase
    .from('my_library')
    .select('*')
    .eq('user_id', userId);

  // Status Filter
  if (filters.status && filters.status !== 'ALL') {
    query = query.eq('status', filters.status);
  }

  // Search Filter
  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim();
    query = query.or(`title.ilike.%${term}%,author.ilike.%${term}%,isbn_10.ilike.%${term}%,isbn_13.ilike.%${term}%`);
  }

  // Sorting
  switch (filters.sortBy) {
    case 'title':
      query = query.order('title', { ascending: true });
      break;
    case 'author':
      query = query.order('author', { ascending: true, nullsFirst: false });
      break;
    case 'rating':
      query = query.order('rating', { ascending: false, nullsFirst: false });
      break;
    case 'progress':
      query = query.order('reading_progress', { ascending: false });
      break;
    case 'recently_added':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user library:', error);
    return [];
  }

  const libraryItems: MyLibraryItem[] = data || [];

  if (libraryItems.length === 0) {
    return [];
  }

  // Fetch images & tags in batch for these books
  const bookIds = Array.from(new Set(libraryItems.map((item) => item.book_id)));
  const userBookIds = libraryItems.map((item) => item.id);

  // 1. Fetch images
  const { data: imagesData } = await supabase
    .from('book_images')
    .select('*')
    .in('book_id', bookIds)
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true });

  const refreshedImages = imagesData ? await getSignedUrlsForImages(imagesData as BookImage[]) : [];

  const imagesByBookId: Record<string, BookImage[]> = {};
  for (const img of refreshedImages) {
    if (!imagesByBookId[img.book_id]) imagesByBookId[img.book_id] = [];
    imagesByBookId[img.book_id].push(img);
  }

  // 2. Fetch tags
  const { data: tagsData } = await supabase
    .from('book_tags')
    .select('user_book_id, tags(*)')
    .in('user_book_id', userBookIds);

  const tagsByUserBookId: Record<string, Tag[]> = {};
  if (tagsData) {
    for (const row of tagsData as any[]) {
      if (row.tags) {
        if (!tagsByUserBookId[row.user_book_id]) tagsByUserBookId[row.user_book_id] = [];
        tagsByUserBookId[row.user_book_id].push(row.tags as Tag);
      }
    }
  }

  // Tag filter if specified
  let result: MyLibraryItem[] = libraryItems.map((item) => ({
    ...item,
    images: imagesByBookId[item.book_id] || [],
    tags: tagsByUserBookId[item.id] || [],
  }));

  if (filters.tagId) {
    result = result.filter((item) => item.tags?.some((t: Tag) => t.id === filters.tagId));
  }

  return result;
}

export async function getUserBookById(userBookId: string): Promise<MyLibraryItem | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('my_library')
    .select('*')
    .eq('id', userBookId)
    .maybeSingle();

  if (error || !data) {
    console.error('Error fetching user book:', error);
    return null;
  }

  const item = data as MyLibraryItem;

  // Fetch images & tags
  const { data: imagesData } = await supabase
    .from('book_images')
    .select('*')
    .eq('book_id', item.book_id)
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true });

  const refreshedImages = imagesData ? await getSignedUrlsForImages(imagesData as BookImage[]) : [];

  const { data: tagsData } = await supabase
    .from('book_tags')
    .select('tag_id, tags(*)')
    .eq('user_book_id', item.id);

  const tags = (tagsData || []).map((t: any) => t.tags).filter(Boolean) as Tag[];

  return {
    ...item,
    images: refreshedImages,
    tags,
  };
}

export async function checkBookInUserLibrary(
  userId: string,
  bookId: string
): Promise<MyLibraryItem | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('my_library')
    .select('*')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .maybeSingle();

  if (error || !data) return null;

  return data as MyLibraryItem;
}

export async function addBookToLibrary(
  userId: string,
  bookId: string,
  details: {
    status?: BookStatus;
    rating?: number | null;
    purchase_price?: number | null;
    purchase_date?: string | null;
    purchase_store?: string | null;
    current_page?: number;
    notes?: string | null;
  } = {}
): Promise<UserBook> {
  const supabase = createClient();

  // Check if already in user library
  const existing = await checkBookInUserLibrary(userId, bookId);
  if (existing) {
    throw new Error('Bạn đã sở hữu cuốn sách này trong tủ sách.');
  }

  const { data, error } = await supabase
    .from('user_books')
    .insert({
      user_id: userId,
      book_id: bookId,
      status: details.status || 'OWNED',
      rating: details.rating || null,
      purchase_price: details.purchase_price !== undefined ? details.purchase_price : null,
      purchase_date: details.purchase_date || null,
      purchase_store: details.purchase_store || null,
      current_page: details.current_page || 0,
      notes: details.notes || null,
      started_reading_at: details.status === 'READING' ? new Date().toISOString().split('T')[0] : null,
      finished_reading_at: details.status === 'READ' ? new Date().toISOString().split('T')[0] : null,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Cuốn sách này đã có trong tủ sách của bạn.');
    }
    throw new Error(`Thêm vào tủ sách thất bại: ${error.message}`);
  }

  return data;
}

export async function updateUserBook(
  userBookId: string,
  updates: Partial<UserBook>
): Promise<UserBook> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_books')
    .update(updates)
    .eq('id', userBookId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Cập nhật thất bại: ${error.message}`);
  }

  return data;
}

export async function deleteUserBook(userBookId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('user_books')
    .delete()
    .eq('id', userBookId);

  if (error) {
    throw new Error(`Xoá khỏi tủ sách thất bại: ${error.message}`);
  }
}

export interface LibraryStats {
  totalBooks: number;
  owned: number;
  reading: number;
  read: number;
  wishlist: number;
  dropped: number;
  totalPagesRead: number;
  averageRating: number;
}

export async function getLibraryStats(userId: string): Promise<LibraryStats> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('my_library')
    .select('status, rating, current_page')
    .eq('user_id', userId);

  if (error || !data) {
    return {
      totalBooks: 0,
      owned: 0,
      reading: 0,
      read: 0,
      wishlist: 0,
      dropped: 0,
      totalPagesRead: 0,
      averageRating: 0,
    };
  }

  let totalPages = 0;
  let totalRatingSum = 0;
  let ratedCount = 0;

  const stats: LibraryStats = {
    totalBooks: data.length,
    owned: 0,
    reading: 0,
    read: 0,
    wishlist: 0,
    dropped: 0,
    totalPagesRead: 0,
    averageRating: 0,
  };

  data.forEach((item: any) => {
    if (item.status === 'OWNED') stats.owned++;
    else if (item.status === 'READING') stats.reading++;
    else if (item.status === 'READ') stats.read++;
    else if (item.status === 'WISHLIST') stats.wishlist++;
    else if (item.status === 'DROPPED') stats.dropped++;

    totalPages += item.current_page || 0;

    if (item.rating && item.rating > 0) {
      totalRatingSum += Number(item.rating);
      ratedCount++;
    }
  });

  stats.totalPagesRead = totalPages;
  stats.averageRating = ratedCount > 0 ? Number((totalRatingSum / ratedCount).toFixed(1)) : 0;

  return stats;
}
