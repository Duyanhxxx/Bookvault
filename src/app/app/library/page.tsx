'use client';

import React, { useState } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Filter,
  Plus,
  ArrowUpDown,
  Tag as TagIcon,
  X,
} from 'lucide-react';
import { useLibrary } from '@/hooks/useLibrary';
import { useTags } from '@/hooks/useTags';
import { BookGrid } from '@/components/books/BookGrid';
import { BookList } from '@/components/books/BookList';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { STATUS_CONFIG } from '@/lib/utils';
import type { BookStatus } from '@/types/database';

export default function LibraryPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookStatus | 'ALL'>('ALL');
  const [selectedTagId, setSelectedTagId] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'recently_added' | 'title' | 'author' | 'rating' | 'progress'>('recently_added');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: allTags = [] } = useTags();
  const { data: books = [], isLoading } = useLibrary({
    search: search.trim() || undefined,
    status: statusFilter,
    tagId: selectedTagId,
    sortBy: sortBy,
  });

  const statusOptions: { key: BookStatus | 'ALL'; label: string }[] = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'OWNED', label: 'Đang sở hữu' },
    { key: 'READING', label: 'Đang đọc' },
    { key: 'READ', label: 'Đã đọc' },
    { key: 'WISHLIST', label: 'Muốn đọc' },
    { key: 'DROPPED', label: 'Đã bỏ' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Thư viện của tôi
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Quản lý toàn bộ ấn bản vật lý và sách trong bộ sưu tập cá nhân ({books.length} cuốn)
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
            }`}
            title="Dạng lưới"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
            }`}
            title="Dạng danh sách"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="w-full sm:max-w-md">
            <Input
              placeholder="Tìm kiếm theo tên sách, tác giả hoặc ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="h-10 text-xs"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-stone-500 font-medium whitespace-nowrap">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-1 text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a2f]"
            >
              <option value="recently_added">Mới thêm vào tủ</option>
              <option value="title">Tên sách A-Z</option>
              <option value="author">Tên tác giả A-Z</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="progress">Tiến độ đọc cao nhất</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {statusOptions.map((opt) => {
            const isSelected = statusFilter === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setStatusFilter(opt.key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1e3a2f] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200/80 dark:hover:bg-stone-700'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Tags Filter Row */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 overflow-x-auto">
            <span className="text-[11px] text-stone-400 font-semibold flex items-center gap-1 flex-shrink-0">
              <TagIcon className="h-3 w-3" /> Thẻ:
            </span>
            {allTags.map((tag) => {
              const isSelected = selectedTagId === tag.id;
              return (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTagId(isSelected ? undefined : tag.id)}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#1e3a2f] text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  <span>#{tag.name}</span>
                  {isSelected && <X className="h-3 w-3" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Books Display */}
      {viewMode === 'grid' ? (
        <BookGrid books={books} isLoading={isLoading} />
      ) : (
        <BookList books={books} isLoading={isLoading} />
      )}
    </div>
  );
}
