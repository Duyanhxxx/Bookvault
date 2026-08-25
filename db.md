-- ============================================================
-- BOOKVAULT / SHELFOS
-- Supabase Database Migration v2
--
-- Features:
-- - Supabase Auth integration
-- - Profiles
-- - Books
-- - Personal library
-- - Book images
-- - Reading sessions
-- - Notes
-- - Tags
-- - RLS
-- - Private Storage
-- ============================================================


-- ============================================================
-- 1. EXTENSIONS
-- ============================================================

create extension if not exists "pgcrypto";


-- ============================================================
-- 2. ENUMS
-- ============================================================

do $$
begin

  if not exists (
    select 1
    from pg_type
    where typname = 'book_status'
  ) then

    create type public.book_status as enum (
      'WISHLIST',
      'OWNED',
      'READING',
      'READ',
      'DROPPED'
    );

  end if;


  if not exists (
    select 1
    from pg_type
    where typname = 'book_image_type'
  ) then

    create type public.book_image_type as enum (
      'COVER',
      'BACK_COVER',
      'SPINE',
      'ISBN',
      'OTHER'
    );

  end if;

end
$$;


-- ============================================================
-- 3. COMMON UPDATED_AT FUNCTION
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin

  new.updated_at = now();

  return new;

end;
$$;


-- ============================================================
-- 4. PROFILES
-- ============================================================

create table if not exists public.profiles (

  id uuid primary key
    references auth.users(id)
    on delete cascade,

  display_name text,

  avatar_url text,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()

);


-- ============================================================
-- 5. BOOKS
-- ============================================================
-- Global book metadata.
--
-- Example:
--
-- Clean Code
-- Atomic Habits
-- The Pragmatic Programmer
--
-- Users can read and add books.
-- Only trusted backend/admin logic should update
-- global metadata.
-- ============================================================

create table if not exists public.books (

  id uuid primary key
    default gen_random_uuid(),

  title text not null,

  subtitle text,

  author text,

  publisher text,

  isbn_10 text,

  isbn_13 text,

  language text,

  release_year integer,

  description text,

  page_count integer,

  google_books_id text,

  open_library_id text,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint books_release_year_check
    check (
      release_year is null
      or release_year between 1000 and 3000
    ),

  constraint books_page_count_check
    check (
      page_count is null
      or page_count > 0
    )

);


-- ============================================================
-- 6. UNIQUE BOOK IDENTIFIERS
-- ============================================================

create unique index if not exists idx_books_isbn_10_unique
on public.books(isbn_10)
where isbn_10 is not null
and isbn_10 <> '';


create unique index if not exists idx_books_isbn_13_unique
on public.books(isbn_13)
where isbn_13 is not null
and isbn_13 <> '';


create unique index if not exists idx_books_google_books_unique
on public.books(google_books_id)
where google_books_id is not null
and google_books_id <> '';


create unique index if not exists idx_books_open_library_unique
on public.books(open_library_id)
where open_library_id is not null
and open_library_id <> '';


-- ============================================================
-- 7. BOOK IMAGES
-- ============================================================

create table if not exists public.book_images (

  id uuid primary key
    default gen_random_uuid(),

  book_id uuid not null
    references public.books(id)
    on delete cascade,

  image_url text not null,

  storage_path text,

  image_type public.book_image_type
    not null
    default 'OTHER',

  is_primary boolean
    not null
    default false,

  sort_order integer
    not null
    default 0,

  created_at timestamptz
    not null
    default now()

);


-- ============================================================
-- 8. USER BOOKS
-- ============================================================
-- Personal relationship between user and book.
--
-- One user cannot add the same book twice.
-- ============================================================

create table if not exists public.user_books (

  id uuid primary key
    default gen_random_uuid(),

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  book_id uuid not null
    references public.books(id)
    on delete cascade,

  status public.book_status
    not null
    default 'OWNED',

  rating numeric(2,1),

  purchase_price numeric(12,0),

  purchase_date date,

  purchase_store text,

  started_reading_at date,

  finished_reading_at date,

  current_page integer
    not null
    default 0,

  notes text,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint user_books_rating_check
    check (
      rating is null
      or rating between 0 and 5
    ),

  constraint user_books_purchase_price_check
    check (
      purchase_price is null
      or purchase_price >= 0
    ),

  constraint user_books_current_page_check
    check (
      current_page >= 0
    ),

  constraint user_books_unique_user_book
    unique (user_id, book_id)

);


-- ============================================================
-- 9. READING SESSIONS
-- ============================================================

create table if not exists public.reading_sessions (

  id uuid primary key
    default gen_random_uuid(),

  user_book_id uuid not null
    references public.user_books(id)
    on delete cascade,

  started_at timestamptz not null,

  ended_at timestamptz,

  start_page integer,

  end_page integer,

  duration_minutes integer,

  created_at timestamptz
    not null
    default now(),

  constraint reading_sessions_page_check
    check (
      (start_page is null or start_page >= 0)
      and
      (end_page is null or end_page >= 0)
    ),

  constraint reading_sessions_duration_check
    check (
      duration_minutes is null
      or duration_minutes >= 0
    )

);


-- ============================================================
-- 10. BOOK NOTES
-- ============================================================

create table if not exists public.book_notes (

  id uuid primary key
    default gen_random_uuid(),

  user_book_id uuid not null
    references public.user_books(id)
    on delete cascade,

  title text,

  content text not null,

  page_number integer,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint book_notes_page_number_check
    check (
      page_number is null
      or page_number > 0
    )

);


-- ============================================================
-- 11. TAGS
-- ============================================================

create table if not exists public.tags (

  id uuid primary key
    default gen_random_uuid(),

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  name text not null,

  color text,

  created_at timestamptz
    not null
    default now(),

  constraint tags_unique_user_name
    unique (user_id, name)

);


-- ============================================================
-- 12. BOOK TAGS
-- ============================================================

create table if not exists public.book_tags (

  user_book_id uuid not null
    references public.user_books(id)
    on delete cascade,

  tag_id uuid not null
    references public.tags(id)
    on delete cascade,

  created_at timestamptz
    not null
    default now(),

  primary key (
    user_book_id,
    tag_id
  )

);


-- ============================================================
-- 13. INDEXES
-- ============================================================

create index if not exists idx_books_title
on public.books(title);

create index if not exists idx_books_author
on public.books(author);

create index if not exists idx_books_isbn_10
on public.books(isbn_10);

create index if not exists idx_books_isbn_13
on public.books(isbn_13);

create index if not exists idx_books_google_books_id
on public.books(google_books_id);

create index if not exists idx_books_open_library_id
on public.books(open_library_id);


create index if not exists idx_user_books_user_id
on public.user_books(user_id);

create index if not exists idx_user_books_book_id
on public.user_books(book_id);

create index if not exists idx_user_books_status
on public.user_books(user_id, status);

create index if not exists idx_user_books_created_at
on public.user_books(
  user_id,
  created_at desc
);


create index if not exists idx_book_images_book_id
on public.book_images(book_id);


create index if not exists idx_reading_sessions_user_book
on public.reading_sessions(user_book_id);

create index if not exists idx_reading_sessions_started_at
on public.reading_sessions(started_at desc);


create index if not exists idx_book_notes_user_book
on public.book_notes(user_book_id);

create index if not exists idx_book_notes_page
on public.book_notes(
  user_book_id,
  page_number
);


create index if not exists idx_tags_user_id
on public.tags(user_id);


-- ============================================================
-- 14. UPDATED_AT TRIGGERS
-- ============================================================

drop trigger if exists books_updated_at
on public.books;

create trigger books_updated_at

before update
on public.books

for each row

execute function public.handle_updated_at();


drop trigger if exists profiles_updated_at
on public.profiles;

create trigger profiles_updated_at

before update
on public.profiles

for each row

execute function public.handle_updated_at();


drop trigger if exists user_books_updated_at
on public.user_books;

create trigger user_books_updated_at

before update
on public.user_books

for each row

execute function public.handle_updated_at();


drop trigger if exists book_notes_updated_at
on public.book_notes;

create trigger book_notes_updated_at

before update
on public.book_notes

for each row

execute function public.handle_updated_at();


-- ============================================================
-- 15. AUTO CREATE PROFILE
-- ============================================================
-- When a user registers through Supabase Auth:
--
-- auth.users
--      ↓
-- handle_new_user()
--      ↓
-- profiles
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  insert into public.profiles (
    id,
    display_name,
    avatar_url
  )

  values (
    new.id,

    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),

    new.raw_user_meta_data ->> 'avatar_url'
  )

  on conflict (id)
  do nothing;

  return new;

end;
$$;


drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created

after insert
on auth.users

for each row

execute function public.handle_new_user();


-- ============================================================
-- 16. ENABLE RLS
-- ============================================================

alter table public.profiles
enable row level security;

alter table public.books
enable row level security;

alter table public.book_images
enable row level security;

alter table public.user_books
enable row level security;

alter table public.reading_sessions
enable row level security;

alter table public.book_notes
enable row level security;

alter table public.tags
enable row level security;

alter table public.book_tags
enable row level security;


-- ============================================================
-- 17. PROFILES RLS
-- ============================================================

drop policy if exists "Users can view own profile"
on public.profiles;

create policy "Users can view own profile"

on public.profiles

for select

to authenticated

using (
  id = auth.uid()
);


drop policy if exists "Users can update own profile"
on public.profiles;

create policy "Users can update own profile"

on public.profiles

for update

to authenticated

using (
  id = auth.uid()
)

with check (
  id = auth.uid()
);


-- ============================================================
-- 18. BOOKS RLS
-- ============================================================
-- Books are global metadata.
--
-- Authenticated users:
-- SELECT
-- INSERT
--
-- UPDATE / DELETE:
-- handled by trusted backend/service role.
-- ============================================================

drop policy if exists "Authenticated users can view books"
on public.books;

create policy "Authenticated users can view books"

on public.books

for select

to authenticated

using (true);


drop policy if exists "Authenticated users can create books"
on public.books;

create policy "Authenticated users can create books"

on public.books

for insert

to authenticated

with check (true);


-- ============================================================
-- 19. BOOK IMAGES RLS
-- ============================================================
-- User can only access images belonging to a book
-- that exists in their own library.
-- ============================================================

drop policy if exists "Users can view own book images"
on public.book_images;

create policy "Users can view own book images"

on public.book_images

for select

to authenticated

using (
  exists (
    select 1
    from public.user_books ub
    where ub.book_id = book_images.book_id
      and ub.user_id = auth.uid()
  )
);


drop policy if exists "Users can create own book images"
on public.book_images;

create policy "Users can create own book images"

on public.book_images

for insert

to authenticated

with check (
  exists (
    select 1
    from public.user_books ub
    where ub.book_id = book_images.book_id
      and ub.user_id = auth.uid()
  )
);


drop policy if exists "Users can delete own book images"
on public.book_images;

create policy "Users can delete own book images"

on public.book_images

for delete

to authenticated

using (
  exists (
    select 1
    from public.user_books ub
    where ub.book_id = book_images.book_id
      and ub.user_id = auth.uid()
  )
);


-- ============================================================
-- 20. USER BOOKS RLS
-- ============================================================

drop policy if exists "Users can view own books"
on public.user_books;

create policy "Users can view own books"

on public.user_books

for select

to authenticated

using (
  user_id = auth.uid()
);


drop policy if exists "Users can add books to own library"
on public.user_books;

create policy "Users can add books to own library"

on public.user_books

for insert

to authenticated

with check (
  user_id = auth.uid()
);


drop policy if exists "Users can update own books"
on public.user_books;

create policy "Users can update own books"

on public.user_books

for update

to authenticated

using (
  user_id = auth.uid()
)

with check (
  user_id = auth.uid()
);


drop policy if exists "Users can delete own books"
on public.user_books;

create policy "Users can delete own books"

on public.user_books

for delete

to authenticated

using (
  user_id = auth.uid()
);


-- ============================================================
-- 21. READING SESSIONS RLS
-- ============================================================

drop policy if exists "Users can view own reading sessions"
on public.reading_sessions;

create policy "Users can view own reading sessions"

on public.reading_sessions

for select

to authenticated

using (
  exists (
    select 1

    from public.user_books ub

    where ub.id = reading_sessions.user_book_id

      and ub.user_id = auth.uid()
  )
);


drop policy if exists "Users can create own reading sessions"
on public.reading_sessions;

create policy "Users can create own reading sessions"

on public.reading_sessions

for insert

to authenticated

with check (
  exists (
    select 1

    from public.user_books ub

    where ub.id = reading_sessions.user_book_id

      and ub.user_id = auth.uid()
  )
);


drop policy if exists "Users can update own reading sessions"
on public.reading_sessions;

create policy "Users can update own reading sessions"

on public.reading_sessions

for update

to authenticated

using (
  exists (
    select 1

    from public.user_books ub

    where ub.id = reading_sessions.user_book_id

      and ub.user_id = auth.uid()
  )
)

with check (
  exists (
    select 1

    from public.user_books ub

    where ub.id = reading_sessions.user_book_id

      and ub.user_id = auth.uid()
  )
);


drop policy if exists "Users can delete own reading sessions"
on public.reading_sessions;

create policy "Users can delete own reading sessions"

on public.reading_sessions

for delete

to authenticated

using (
  exists (
    select 1

    from public.user_books ub

    where ub.id = reading_sessions.user_book_id

      and ub.user_id = auth.uid()
  )
);


-- ============================================================
-- 22. BOOK NOTES RLS
-- ============================================================

drop policy if exists "Users can view own notes"
on public.book_notes;

create policy "Users can view own notes"

on public.book_notes

for select

to authenticated

using (
  exists (
    select 1

    from public.user_books ub

    where ub.id = book_notes.user_book_id

      and ub.user_id = auth.uid()
  )
);


drop policy if exists "Users can create own notes"
on public.book_notes;

create policy "Users can create own notes"

on public.book_notes

for insert

to authenticated

with check (
  exists (
    select 1

    from public.user_books ub

    where ub.id = book_notes.user_book_id

      and ub.user_id = auth.uid()
  )
);


drop policy if exists "Users can update own notes"
on public.book_notes;

create policy "Users can update own notes"

on public.book_notes

for update

to authenticated

using (
  exists (
    select 1

    from public.user_books ub

    where ub.id = book_notes.user_book_id

      and ub.user_id = auth.uid()
  )
)

with check (
  exists (
    select 1

    from public.user_books ub

    where ub.id = book_notes.user_book_id

      and ub.user_id = auth.uid()
  )
);


drop policy if exists "Users can delete own notes"
on public.book_notes;

create policy "Users can delete own notes"

on public.book_notes

for delete

to authenticated

using (
  exists (
    select 1

    from public.user_books ub

    where ub.id = book_notes.user_book_id

      and ub.user_id = auth.uid()
  )
);


-- ============================================================
-- 23. TAGS RLS
-- ============================================================

drop policy if exists "Users can view own tags"
on public.tags;

create policy "Users can view own tags"

on public.tags

for select

to authenticated

using (
  user_id = auth.uid()
);


drop policy if exists "Users can create own tags"
on public.tags;

create policy "Users can create own tags"

on public.tags

for insert

to authenticated

with check (
  user_id = auth.uid()
);


drop policy if exists "Users can update own tags"
on public.tags;

create policy "Users can update own tags"

on public.tags

for update

to authenticated

using (
  user_id = auth.uid()
)

with check (
  user_id = auth.uid()
);


drop policy if exists "Users can delete own tags"
on public.tags;

create policy "Users can delete own tags"

on public.tags

for delete

to authenticated

using (
  user_id = auth.uid()
);


-- ============================================================
-- 24. BOOK TAGS RLS
-- ============================================================

drop policy if exists "Users can view own book tags"
on public.book_tags;

create policy "Users can view own book tags"

on public.book_tags

for select

to authenticated

using (
  exists (
    select 1

    from public.user_books ub

    where ub.id = book_tags.user_book_id

      and ub.user_id = auth.uid()
  )
);


drop policy if exists "Users can create own book tags"
on public.book_tags;

create policy "Users can create own book tags"

on public.book_tags

for insert

to authenticated

with check (

  exists (
    select 1

    from public.user_books ub

    where ub.id = book_tags.user_book_id

      and ub.user_id = auth.uid()
  )

  and

  exists (
    select 1

    from public.tags t

    where t.id = book_tags.tag_id

      and t.user_id = auth.uid()
  )

);


drop policy if exists "Users can delete own book tags"
on public.book_tags;

create policy "Users can delete own book tags"

on public.book_tags

for delete

to authenticated

using (
  exists (
    select 1

    from public.user_books ub

    where ub.id = book_tags.user_book_id

      and ub.user_id = auth.uid()
  )
);


-- ============================================================
-- 25. STORAGE BUCKET
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public
)

values (
  'book-images',
  'book-images',
  false
)

on conflict (id)
do nothing;


-- ============================================================
-- 26. STORAGE RLS
-- ============================================================
--
-- Recommended path:
--
-- book-images/
--   USER_ID/
--     BOOK_ID/
--       cover.jpg
--       back.jpg
--       isbn.jpg
--
-- ============================================================


drop policy if exists "Users can upload book images"
on storage.objects;

create policy "Users can upload book images"

on storage.objects

for insert

to authenticated

with check (

  bucket_id = 'book-images'

  and

  (storage.foldername(name))[1]
    = auth.uid()::text

);


drop policy if exists "Users can view own book images"
on storage.objects;

create policy "Users can view own book images"

on storage.objects

for select

to authenticated

using (

  bucket_id = 'book-images'

  and

  (storage.foldername(name))[1]
    = auth.uid()::text

);


drop policy if exists "Users can update own book images"
on storage.objects;

create policy "Users can update own book images"

on storage.objects

for update

to authenticated

using (

  bucket_id = 'book-images'

  and

  (storage.foldername(name))[1]
    = auth.uid()::text

)

with check (

  bucket_id = 'book-images'

  and

  (storage.foldername(name))[1]
    = auth.uid()::text

);


drop policy if exists "Users can delete own book images"
on storage.objects;

create policy "Users can delete own book images"

on storage.objects

for delete

to authenticated

using (

  bucket_id = 'book-images'

  and

  (storage.foldername(name))[1]
    = auth.uid()::text

);


-- ============================================================
-- 27. LIBRARY VIEW
-- ============================================================

create or replace view public.my_library
with (security_invoker = true)
as

select

  ub.id,

  ub.user_id,

  b.id as book_id,

  b.title,

  b.subtitle,

  b.author,

  b.publisher,

  b.isbn_10,

  b.isbn_13,

  b.language,

  b.release_year,

  b.description,

  b.page_count,

  ub.status,

  ub.rating,

  ub.purchase_price,

  ub.purchase_date,

  ub.purchase_store,

  ub.started_reading_at,

  ub.finished_reading_at,

  ub.current_page,

  b.page_count as total_pages,

  case

    when b.page_count is null
      or b.page_count = 0

    then 0

    else round(
      (
        ub.current_page::numeric
        /
        b.page_count::numeric
      ) * 100,
      1
    )

  end as reading_progress,

  ub.notes,

  ub.created_at,

  ub.updated_at

from public.user_books ub

inner join public.books b
  on b.id = ub.book_id;


-- ============================================================
-- 28. AUTH USER PROFILE SYNC
-- ============================================================
-- Optional helper function for updating profile from metadata.
-- ============================================================

create or replace function public.sync_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  update public.profiles

  set

    display_name = coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      display_name
    ),

    avatar_url = coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      avatar_url
    ),

    updated_at = now()

  where id = new.id;

  return new;

end;
$$;


drop trigger if exists on_auth_user_updated
on auth.users;

create trigger on_auth_user_updated

after update
on auth.users

for each row

execute function public.sync_profile_from_auth();


-- ============================================================
-- END
-- ============================================================