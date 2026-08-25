'use client';

import React from 'react';
import { Tag as TagIcon } from 'lucide-react';
import { TagManager } from '@/components/tags/TagManager';

export default function TagsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <TagIcon className="h-6 w-6 text-[#1e3a2f]" />
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Quản lý Thẻ phân loại
          </h1>
        </div>
        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
          Tạo và sắp xếp các thẻ phân loại riêng cho các thể loại sách và mục tiêu đọc của bạn.
        </p>
      </div>

      <TagManager />
    </div>
  );
}
