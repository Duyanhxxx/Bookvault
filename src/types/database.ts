export type BookStatus = 'WISHLIST' | 'OWNED' | 'READING' | 'READ' | 'DROPPED';

export type BookImageType = 'COVER' | 'BACK_COVER' | 'SPINE' | 'ISBN' | 'OTHER';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  author: string | null;
  publisher: string | null;
  isbn_10: string | null;
  isbn_13: string | null;
  language: string | null;
  release_year: number | null;
  description: string | null;
  page_count: number | null;
  google_books_id: string | null;
  open_library_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookImage {
  id: string;
  book_id: string;
  image_url: string;
  storage_path: string | null;
  image_type: BookImageType;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface UserBook {
  id: string;
  user_id: string;
  book_id: string;
  status: BookStatus;
  rating: number | null;
  purchase_price: number | null;
  purchase_date: string | null;
  purchase_store: string | null;
  started_reading_at: string | null;
  finished_reading_at: string | null;
  current_page: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReadingSession {
  id: string;
  user_book_id: string;
  started_at: string;
  ended_at: string | null;
  start_page: number | null;
  end_page: number | null;
  duration_minutes: number | null;
  created_at: string;
}

export interface BookNote {
  id: string;
  user_book_id: string;
  title: string | null;
  content: string;
  page_number: number | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface BookTag {
  user_book_id: string;
  tag_id: string;
  created_at: string;
}

export interface MyLibraryItem {
  id: string;
  user_id: string;
  book_id: string;
  title: string;
  subtitle: string | null;
  author: string | null;
  publisher: string | null;
  isbn_10: string | null;
  isbn_13: string | null;
  language: string | null;
  release_year: number | null;
  description: string | null;
  page_count: number | null;
  status: BookStatus;
  rating: number | null;
  purchase_price: number | null;
  purchase_date: string | null;
  purchase_store: string | null;
  started_reading_at: string | null;
  finished_reading_at: string | null;
  current_page: number;
  total_pages: number | null;
  reading_progress: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  images?: BookImage[];
  tags?: Tag[];
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      books: {
        Row: Book;
        Insert: Partial<Book> & { title: string };
        Update: Partial<Book>;
      };
      book_images: {
        Row: BookImage;
        Insert: Partial<BookImage> & { book_id: string; image_url: string };
        Update: Partial<BookImage>;
      };
      user_books: {
        Row: UserBook;
        Insert: Partial<UserBook> & { user_id: string; book_id: string };
        Update: Partial<UserBook>;
      };
      reading_sessions: {
        Row: ReadingSession;
        Insert: Partial<ReadingSession> & { user_book_id: string; started_at: string };
        Update: Partial<ReadingSession>;
      };
      book_notes: {
        Row: BookNote;
        Insert: Partial<BookNote> & { user_book_id: string; content: string };
        Update: Partial<BookNote>;
      };
      tags: {
        Row: Tag;
        Insert: Partial<Tag> & { user_id: string; name: string };
        Update: Partial<Tag>;
      };
      book_tags: {
        Row: BookTag;
        Insert: BookTag | BookTag[];
        Update: Partial<BookTag>;
      };
    };
    Views: {
      my_library: {
        Row: MyLibraryItem;
      };
    };
  };
};
