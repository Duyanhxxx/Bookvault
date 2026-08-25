'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { Search, BookCheck, Plus, Sparkles, CheckCircle2, DollarSign, MapPin, Calendar } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BookCover } from './BookCover';
import { BookStatusBadge } from './BookStatusBadge';
import { useUser } from '@/hooks/useUser';
import { searchGlobalBooks } from '@/services/books';
import { getUserLibrary } from '@/services/library';
import type { MyLibraryItem, Book } from '@/types/database';
import { formatVND, formatDateVN } from '@/lib/utils';

export function BookSearchModal({
  isOpen,
  onClose,
  onOpenAddModal,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddModal?: (prefill?: Partial<Book>) => void;
}) {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();
  const [userBooksResults, setUserBooksResults] = useState<MyLibraryItem[]>([]);
  const [globalBooksResults, setGlobalBooksResults] = useState<Book[]>([]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setUserBooksResults([]);
      setGlobalBooksResults([]);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        // 1. Search in user's personal library
        if (user?.id) {
          const userBooks = await getUserLibrary(user.id, { search: searchTerm });
          setUserBooksResults(userBooks);
        }

        // 2. Search in global catalog
        const globalBooks = await searchGlobalBooks(searchTerm);
        // Exclude books already in user's library
        const filteredGlobal = globalBooks.filter(
          (gb) => !userBooksResults.some((ub) => ub.book_id === gb.id)
        );
        setGlobalBooksResults(filteredGlobal);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, user?.id]);

  const hasSearched = searchTerm.trim().length > 0;
  const hasUserMatches = userBooksResults.length > 0;
  const hasGlobalMatches = globalBooksResults.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          <span>Tra cứu nhanh khi mua sách</span>
        </div>
      }
      description="Nhập tên sách, tác giả hoặc mã ISBN để kiểm tra xem bạn đã sở hữu cuốn sách này chưa."
    >
      <div className="space-y-6">
        {/* Search input */}
        <div className="relative">
          <Input
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ví dụ: Atomic Habits, Clean Code, 9786045635032..."
            leftIcon={<Search className="h-4 w-4" />}
            className="h-12 text-base shadow-xs"
          />
        </div>

        {/* Loading */}
        {isPending && (
          <div className="py-8 text-center text-sm text-stone-500">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#1e3a2f] border-r-transparent" />
            <p className="mt-2 font-medium">Đang tìm kiếm trong tủ sách và kho dữ liệu...</p>
          </div>
        )}

        {/* Results Container */}
        {!isPending && hasSearched && (
          <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-1">
            {/* GROUP 1: In User Library (THE PRIMARY USE CASE) */}
            {hasUserMatches && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Đã có trong tủ sách của bạn ({userBooksResults.length})
                  </h4>
                </div>

                <div className="space-y-3">
                  {userBooksResults.map((item) => {
                    const primaryImage =
                      item.images?.find((img) => img.is_primary)?.image_url ||
                      item.images?.[0]?.image_url;

                    return (
                      <div
                        key={item.id}
                        className="relative rounded-xl border-2 border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 shadow-sm"
                      >
                        {/* Duplicate Alert Banner */}
                        <div className="mb-3 flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-900/60 pb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-200">
                            <BookCheck className="h-4 w-4 text-emerald-600" />
                            <span>BẠN ĐÃ SỞ HỮU CUỐN SÁCH NÀY — KHÔNG CẦN MUA LẠI!</span>
                          </div>
                          <BookStatusBadge status={item.status} />
                        </div>

                        <div className="flex gap-4">
                          <BookCover
                            src={primaryImage}
                            title={item.title}
                            author={item.author}
                            size="sm"
                            className="w-14 h-20 sm:w-16 sm:h-24 flex-shrink-0"
                          />

                          <div className="flex-1 space-y-1.5 text-xs">
                            <h5 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                              {item.title}
                            </h5>
                            <p className="text-stone-600 dark:text-stone-300 font-medium">
                              Tác giả: {item.author || 'Chưa rõ'}
                            </p>

                            {/* Purchase Info Pill Grid */}
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-emerald-200/60 dark:border-emerald-900/40">
                              {item.purchase_store && (
                                <div className="flex items-center gap-1 text-stone-700 dark:text-stone-300">
                                  <MapPin className="h-3 w-3 text-emerald-700" />
                                  <span className="truncate">Nơi mua: <strong>{item.purchase_store}</strong></span>
                                </div>
                              )}
                              {item.purchase_price !== null && (
                                <div className="flex items-center gap-1 text-stone-700 dark:text-stone-300">
                                  <DollarSign className="h-3 w-3 text-emerald-700" />
                                  <span>Giá: <strong>{formatVND(item.purchase_price)}</strong></span>
                                </div>
                              )}
                              {item.purchase_date && (
                                <div className="flex items-center gap-1 text-stone-700 dark:text-stone-300">
                                  <Calendar className="h-3 w-3 text-emerald-700" />
                                  <span>Ngày mua: <strong>{formatDateVN(item.purchase_date)}</strong></span>
                                </div>
                              )}
                            </div>

                            <div className="pt-2 flex justify-end">
                              <Link
                                href={`/app/library/${item.id}`}
                                onClick={onClose}
                                className="inline-flex items-center text-xs font-semibold text-emerald-800 hover:text-emerald-900 dark:text-emerald-300 hover:underline"
                              >
                                Xem chi tiết trong tủ sách &rarr;
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* GROUP 2: Global Books (Not in user's library) */}
            {hasGlobalMatches && (
              <div className="space-y-3 pt-2">
                <h4 className="px-1 font-serif text-sm font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Sách khác trong hệ thống ({globalBooksResults.length})
                </h4>

                <div className="space-y-2.5">
                  {globalBooksResults.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white dark:bg-stone-900 p-3 hover:border-stone-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <BookCover
                          title={b.title}
                          author={b.author}
                          size="sm"
                          className="w-10 h-14"
                        />
                        <div>
                          <h5 className="font-serif text-sm font-semibold text-stone-900 dark:text-stone-100">
                            {b.title}
                          </h5>
                          <p className="text-xs text-stone-500">
                            {b.author || 'Chưa rõ tác giả'} {b.release_year ? `• ${b.release_year}` : ''}
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          onClose();
                          onOpenAddModal?.({
                            title: b.title,
                            subtitle: b.subtitle,
                            author: b.author,
                            publisher: b.publisher,
                            isbn_10: b.isbn_10,
                            isbn_13: b.isbn_13,
                            page_count: b.page_count,
                            release_year: b.release_year,
                            description: b.description,
                          });
                        }}
                        className="gap-1.5 text-xs font-semibold"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Thêm vào tủ sách
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No matches at all */}
            {!hasUserMatches && !hasGlobalMatches && (
              <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center bg-stone-50/50 dark:bg-stone-900/40">
                <p className="font-serif text-base font-semibold text-stone-800 dark:text-stone-200">
                  Chưa tìm thấy sách &quot;{searchTerm}&quot;
                </p>
                <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
                  Bạn có thể tạo mới cuốn sách này và thêm ngay vào tủ sách cá nhân.
                </p>
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      onClose();
                      onOpenAddModal?.({ title: searchTerm });
                    }}
                    className="gap-2 text-xs"
                  >
                    <Plus className="h-4 w-4" />
                    Tạo mới và thêm vào tủ sách
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Helper Prompt when empty */}
        {!hasSearched && (
          <div className="rounded-xl bg-[#f3eee7]/70 dark:bg-stone-800/40 p-4 text-xs text-stone-600 dark:text-stone-400 space-y-1">
            <p className="font-semibold text-stone-800 dark:text-stone-200">
              💡 Mẹo tra cứu tại nhà sách:
            </p>
            <p>
              Bạn chỉ cần nhập tên sách hoặc số ISBN trên bìa sau để BookVault lập tức báo nếu bạn đã từng mua hoặc đọc cuốn này!
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
