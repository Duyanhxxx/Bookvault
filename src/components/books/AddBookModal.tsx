'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  BookOpen,
  UserCheck,
  Camera,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { BookCover } from './BookCover';
import { BookUploader } from './BookUploader';
import { STATUS_CONFIG } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import { useTags } from '@/hooks/useTags';
import { searchGlobalBooks, findBookByISBN, createOrFindBook } from '@/services/books';
import { addBookToLibrary, checkBookInUserLibrary } from '@/services/library';
import { setBookTags } from '@/services/tags';
import type { Book, BookStatus, UserBook, Tag } from '@/types/database';
import { toast } from 'sonner';

export interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Book>;
}

export function AddBookModal({ isOpen, onClose, initialData }: AddBookModalProps) {
  const router = useRouter();
  const { user } = useUser();
  const { data: allTags = [] } = useTags();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 State: Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [alreadyOwned, setAlreadyOwned] = useState<boolean>(false);

  // Step 2 State: Book Metadata
  const [bookMeta, setBookMeta] = useState({
    title: '',
    subtitle: '',
    author: '',
    publisher: '',
    isbn_10: '',
    isbn_13: '',
    language: 'vi',
    release_year: new Date().getFullYear(),
    page_count: '',
    description: '',
  });

  // Step 3 State: Personal Ownership Info
  const [personalInfo, setPersonalInfo] = useState({
    status: 'OWNED' as BookStatus,
    rating: 0,
    purchase_price: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_store: '',
    current_page: '0',
    notes: '',
    selectedTagIds: [] as string[],
  });

  // Step 4 State: Created Records
  const [createdUserBook, setCreatedUserBook] = useState<UserBook | null>(null);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);

  // Prefill if initialData given
  useEffect(() => {
    if (initialData && isOpen) {
      setBookMeta((prev) => ({
        ...prev,
        title: initialData.title || '',
        subtitle: initialData.subtitle || '',
        author: initialData.author || '',
        publisher: initialData.publisher || '',
        isbn_10: initialData.isbn_10 || '',
        isbn_13: initialData.isbn_13 || '',
        page_count: initialData.page_count ? String(initialData.page_count) : '',
        release_year: initialData.release_year || new Date().getFullYear(),
        description: initialData.description || '',
      }));
      setStep(2);
    }
  }, [initialData, isOpen]);

  // Reset state when closed
  const handleClose = () => {
    setStep(1);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedBook(null);
    setAlreadyOwned(false);
    setBookMeta({
      title: '',
      subtitle: '',
      author: '',
      publisher: '',
      isbn_10: '',
      isbn_13: '',
      language: 'vi',
      release_year: new Date().getFullYear(),
      page_count: '',
      description: '',
    });
    setPersonalInfo({
      status: 'OWNED',
      rating: 0,
      purchase_price: '',
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_store: '',
      current_page: '0',
      notes: '',
      selectedTagIds: [],
    });
    setCreatedUserBook(null);
    setActiveBookId(null);
    onClose();
  };

  // Search existing books
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setAlreadyOwned(false);
    try {
      // Check ISBN first if looks like ISBN
      const clean = searchQuery.replace(/[-\s]/g, '');
      if (clean.length === 10 || clean.length === 13) {
        const byIsbn = await findBookByISBN(clean);
        if (byIsbn) {
          setSearchResults([byIsbn]);
          setIsSearching(false);
          return;
        }
      }

      const results = await searchGlobalBooks(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Select an existing book from catalog
  const handleSelectBook = async (book: Book) => {
    if (!user) return;
    setSelectedBook(book);
    setActiveBookId(book.id);

    // Check if user already owns this book
    const existing = await checkBookInUserLibrary(user.id, book.id);
    if (existing) {
      setAlreadyOwned(true);
      toast.error('Bạn đã sở hữu cuốn sách này trong tủ sách!');
      return;
    }

    setAlreadyOwned(false);
    setBookMeta({
      title: book.title || '',
      subtitle: book.subtitle || '',
      author: book.author || '',
      publisher: book.publisher || '',
      isbn_10: book.isbn_10 || '',
      isbn_13: book.isbn_13 || '',
      language: book.language || 'vi',
      release_year: book.release_year || new Date().getFullYear(),
      page_count: book.page_count ? String(book.page_count) : '',
      description: book.description || '',
    });
    setStep(3); // Jump straight to personal info!
  };

  // Move to Step 2 for creating a new book from scratch
  const handleStartCustomBook = () => {
    setBookMeta((prev) => ({
      ...prev,
      title: searchQuery.trim(),
    }));
    setSelectedBook(null);
    setStep(2);
  };

  // Submit Step 3: Save to Database!
  const handleSaveToLibrary = async () => {
    if (!user) return;
    if (!bookMeta.title.trim()) {
      toast.error('Vui lòng nhập tên cuốn sách.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create or obtain global book
      let bookId = selectedBook?.id;
      if (!bookId) {
        const createdBook = await createOrFindBook({
          title: bookMeta.title,
          subtitle: bookMeta.subtitle || null,
          author: bookMeta.author || null,
          publisher: bookMeta.publisher || null,
          isbn_10: bookMeta.isbn_10 || null,
          isbn_13: bookMeta.isbn_13 || null,
          language: bookMeta.language || 'vi',
          release_year: Number(bookMeta.release_year) || null,
          page_count: Number(bookMeta.page_count) || null,
          description: bookMeta.description || null,
        });
        bookId = createdBook.id;
      }

      setActiveBookId(bookId);

      // 2. Add to user_books
      const userBook = await addBookToLibrary(user.id, bookId, {
        status: personalInfo.status,
        rating: personalInfo.rating > 0 ? personalInfo.rating : null,
        purchase_price: personalInfo.purchase_price ? Number(personalInfo.purchase_price) : null,
        purchase_date: personalInfo.purchase_date || null,
        purchase_store: personalInfo.purchase_store || null,
        current_page: Number(personalInfo.current_page) || 0,
        notes: personalInfo.notes || null,
      });

      setCreatedUserBook(userBook);

      // 3. Assign tags
      if (personalInfo.selectedTagIds.length > 0) {
        await setBookTags(userBook.id, personalInfo.selectedTagIds);
      }

      toast.success('Đã thêm sách vào tủ sách thành công!');
      // Move to Step 4 for optional photo uploading
      setStep(4);
    } catch (err: any) {
      toast.error(err.message || 'Không thể thêm sách.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    handleClose();
    router.refresh();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#1e3a2f]" />
          <span>Thêm sách vào tủ sách</span>
        </div>
      }
      description="Quản lý sách vật lý và ấn bản điện tử trong tủ sách số cá nhân của bạn."
    >
      {/* Steps indicator */}
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
        <span className={step >= 1 ? 'text-[#1e3a2f] font-bold' : ''}>1. Tra cứu</span>
        <span>&rarr;</span>
        <span className={step >= 2 ? 'text-[#1e3a2f] font-bold' : ''}>2. Thông tin sách</span>
        <span>&rarr;</span>
        <span className={step >= 3 ? 'text-[#1e3a2f] font-bold' : ''}>3. Thông tin cá nhân</span>
        <span>&rarr;</span>
        <span className={step === 4 ? 'text-[#1e3a2f] font-bold' : ''}>4. Ảnh sách thật</span>
      </div>

      {/* ================= STEP 1: SEARCH / CHECK ================= */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Tìm sách đã có trong kho dữ liệu hoặc nhập ISBN
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Nhập tên sách, tác giả hoặc ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                leftIcon={<Search className="h-4 w-4" />}
              />
              <Button onClick={handleSearch} disabled={isSearching} className="flex-shrink-0">
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tìm kiếm'}
              </Button>
            </div>
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              <p className="text-xs font-semibold text-stone-500">Kết quả tìm thấy ({searchResults.length}):</p>
              {searchResults.map((book) => (
                <div
                  key={book.id}
                  onClick={() => handleSelectBook(book)}
                  className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3 hover:border-[#1e3a2f] hover:bg-[#faf8f5] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BookCover title={book.title} author={book.author} size="sm" className="w-10 h-14" />
                    <div>
                      <h5 className="font-serif text-sm font-semibold text-stone-900">{book.title}</h5>
                      <p className="text-xs text-stone-500">
                        {book.author || 'Chưa rõ tác giả'} {book.release_year ? `• ${book.release_year}` : ''}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" className="text-xs">
                    Chọn sách này
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Already owned alert */}
          {alreadyOwned && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600" />
              <span>Cuốn sách này đã có sẵn trong tủ sách của bạn rồi!</span>
            </div>
          )}

          {/* Manual Create Option */}
          <div className="rounded-xl border border-dashed border-stone-300 p-4 text-center bg-stone-50/50">
            <p className="text-xs text-stone-600">
              Không tìm thấy sách bạn cần hoặc muốn tạo thủ công?
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartCustomBook}
              className="mt-2 text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Nhập thông tin sách mới
            </Button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: BOOK METADATA ================= */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Tên cuốn sách *"
                placeholder="Ví dụ: Đắc Nhân Tâm, Atomic Habits..."
                value={bookMeta.title}
                onChange={(e) => setBookMeta({ ...bookMeta, title: e.target.value })}
                required
              />
            </div>

            <Input
              label="Tác giả"
              placeholder="Ví dụ: James Clear, Dale Carnegie"
              value={bookMeta.author}
              onChange={(e) => setBookMeta({ ...bookMeta, author: e.target.value })}
            />

            <Input
              label="Nhà xuất bản"
              placeholder="Ví dụ: NXB Trẻ, NXB Thế Giới"
              value={bookMeta.publisher}
              onChange={(e) => setBookMeta({ ...bookMeta, publisher: e.target.value })}
            />

            <Input
              label="Mã ISBN-13"
              placeholder="978-604-..."
              value={bookMeta.isbn_13}
              onChange={(e) => setBookMeta({ ...bookMeta, isbn_13: e.target.value })}
            />

            <Input
              label="Mã ISBN-10"
              placeholder="0-7432-..."
              value={bookMeta.isbn_10}
              onChange={(e) => setBookMeta({ ...bookMeta, isbn_10: e.target.value })}
            />

            <Input
              label="Tổng số trang"
              type="number"
              min="1"
              placeholder="320"
              value={bookMeta.page_count}
              onChange={(e) => setBookMeta({ ...bookMeta, page_count: e.target.value })}
            />

            <Input
              label="Năm xuất bản"
              type="number"
              placeholder="2023"
              value={String(bookMeta.release_year)}
              onChange={(e) => setBookMeta({ ...bookMeta, release_year: Number(e.target.value) })}
            />

            <div className="sm:col-span-2">
              <Textarea
                label="Mô tả / Tóm tắt nội dung"
                placeholder="Tóm tắt ngắn về nội dung cuốn sách..."
                value={bookMeta.description}
                onChange={(e) => setBookMeta({ ...bookMeta, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm" onClick={() => setStep(1)} className="gap-1 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              Quay lại
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (!bookMeta.title.trim()) {
                  toast.error('Vui lòng nhập tên sách.');
                  return;
                }
                setStep(3);
              }}
              className="gap-1 text-xs"
            >
              Tiếp tục
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: PERSONAL OWNERSHIP INFO ================= */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status Selector */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Trạng thái sách trong tủ *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(Object.keys(STATUS_CONFIG) as BookStatus[]).map((st) => {
                  const conf = STATUS_CONFIG[st];
                  const isSelected = personalInfo.status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setPersonalInfo({ ...personalInfo, status: st })}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1e3a2f] bg-emerald-50/70 text-[#1e3a2f] ring-2 ring-[#1e3a2f]/20 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-300 text-stone-600'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full mb-1.5 ${conf.dot}`} />
                      {conf.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Purchase Store */}
            <Input
              label="Nơi mua sách"
              placeholder="Fahasa, Nhã Nam, Tiki, Shopee..."
              value={personalInfo.purchase_store}
              onChange={(e) => setPersonalInfo({ ...personalInfo, purchase_store: e.target.value })}
            />

            {/* Purchase Price */}
            <Input
              label="Giá mua (VNĐ)"
              type="number"
              placeholder="120000"
              value={personalInfo.purchase_price}
              onChange={(e) => setPersonalInfo({ ...personalInfo, purchase_price: e.target.value })}
            />

            {/* Purchase Date */}
            <Input
              label="Ngày mua"
              type="date"
              value={personalInfo.purchase_date}
              onChange={(e) => setPersonalInfo({ ...personalInfo, purchase_date: e.target.value })}
            />

            {/* Current Page */}
            <Input
              label="Trang đang đọc hiện tại"
              type="number"
              min="0"
              max={bookMeta.page_count || undefined}
              placeholder="0"
              value={personalInfo.current_page}
              onChange={(e) => setPersonalInfo({ ...personalInfo, current_page: e.target.value })}
            />

            {/* Rating */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Đánh giá cá nhân: {personalInfo.rating > 0 ? `${personalInfo.rating} / 5 ⭐` : 'Chưa đánh giá'}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setPersonalInfo({
                        ...personalInfo,
                        rating: personalInfo.rating === star ? 0 : star,
                      })
                    }
                    className="text-2xl hover:scale-110 transition-transform cursor-pointer"
                  >
                    {star <= personalInfo.rating ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Selection */}
            {allTags.length > 0 && (
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Gắn thẻ phân loại
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag: Tag) => {
                    const isTagged = personalInfo.selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          const next = isTagged
                            ? personalInfo.selectedTagIds.filter((id) => id !== tag.id)
                            : [...personalInfo.selectedTagIds, tag.id];
                          setPersonalInfo({ ...personalInfo, selectedTagIds: next });
                        }}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer ${
                          isTagged
                            ? 'bg-[#1e3a2f] text-white border-[#1e3a2f]'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        #{tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="sm:col-span-2">
              <Textarea
                label="Ghi chú cá nhân về cuốn sách"
                placeholder="Ví dụ: Được bạn tặng sinh nhật, sách bản bìa cứng có chữ ký..."
                value={personalInfo.notes}
                onChange={(e) => setPersonalInfo({ ...personalInfo, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(selectedBook ? 1 : 2)}
              className="gap-1 text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Quay lại
            </Button>
            <Button
              size="sm"
              onClick={handleSaveToLibrary}
              disabled={isSubmitting}
              className="gap-2 text-xs font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Lưu vào tủ sách
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: PHOTO UPLOAD (OPTIONAL) ================= */}
      {step === 4 && activeBookId && (
        <div className="space-y-5">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Đã thêm &quot;{bookMeta.title}&quot; vào tủ sách thành công!</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Bạn có muốn tải ảnh chụp bìa sách thật lên để lưu lại kỷ niệm không?
              </p>
            </div>
          </div>

          <BookUploader
            bookId={activeBookId}
            onUploaded={() => {
              toast.success('Đã lưu ảnh sách!');
            }}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={handleFinish} className="gap-1.5 text-xs font-semibold">
              Hoàn tất & Xem tủ sách &rarr;
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
