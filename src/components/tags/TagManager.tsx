'use client';

import React, { useState } from 'react';
import { Tag as TagIcon, Plus, Edit2, Trash2, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/useTags';
import type { Tag } from '@/types/database';
import { toast } from 'sonner';

const PRESET_COLORS = [
  '#1E3A2F', // Forest Green
  '#2D5A47', // Emerald
  '#7A3E2D', // Terracotta
  '#2E4A62', // Deep Slate Blue
  '#6B5B3E', // Warm Ochre
  '#4A3B52', // Plum
  '#C05621', // Amber Dark
  '#9B2C2C', // Crimson
];

export function TagManager() {
  const { data: tags = [], isLoading } = useTags();
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();

  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      await createTagMutation.mutateAsync({
        name: newTagName.trim(),
        color: selectedColor,
      });
      toast.success(`Đã tạo thẻ #${newTagName.trim()}`);
      setNewTagName('');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tạo thẻ.');
    }
  };

  const handleUpdate = async (tag: Tag) => {
    try {
      await updateTagMutation.mutateAsync({
        tagId: tag.id,
        name: tag.name,
        color: tag.color || undefined,
      });
      toast.success('Đã cập nhật thẻ.');
      setEditingTag(null);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật.');
    }
  };

  const handleDelete = async (tagId: string) => {
    if (!confirm('Bạn có chắc muốn xoá thẻ này không?')) return;
    try {
      await deleteTagMutation.mutateAsync(tagId);
      toast.success('Đã xoá thẻ.');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xoá thẻ.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Create new tag form */}
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs space-y-4"
      >
        <h4 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <TagIcon className="h-4 w-4 text-[#1e3a2f]" />
          Tạo thẻ phân loại mới
        </h4>

        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Input
              label="Tên thẻ"
              placeholder="Ví dụ: Kinh doanh, Lập trình, Tâm lý học, Đọc lại..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              required
            />
          </div>

          {/* Color palette */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Màu sắc
            </label>
            <div className="flex items-center gap-1.5 h-10 px-2 rounded-lg border border-stone-200 bg-stone-50">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`h-5 w-5 rounded-full transition-transform cursor-pointer ${
                    selectedColor === c ? 'scale-125 ring-2 ring-stone-900 dark:ring-white' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={createTagMutation.isPending || !newTagName.trim()}
            className="gap-1.5 text-xs font-semibold h-10 w-full sm:w-auto"
          >
            {createTagMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Thêm thẻ
          </Button>
        </div>
      </form>

      {/* Tags List */}
      <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs space-y-4">
        <h4 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100">
          Danh sách thẻ cá nhân ({tags.length})
        </h4>

        {tags.length === 0 ? (
          <p className="text-xs text-stone-500 italic py-4 text-center">
            Bạn chưa tạo thẻ phân loại nào.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {tags.map((tag: Tag) => {
              const isEditing = editingTag?.id === tag.id;

              return (
                <div
                  key={tag.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-stone-200 dark:border-stone-800 p-3 bg-stone-50/50 dark:bg-stone-800/40"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingTag.name}
                        onChange={(e) =>
                          setEditingTag({ ...editingTag, name: e.target.value })
                        }
                        className="h-8 flex-1 rounded border border-stone-300 px-2 text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdate(editingTag)}
                        className="rounded p-1 text-emerald-600 hover:bg-emerald-50"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color || '#1e3a2f' }}
                      />
                      <span className="font-medium text-xs text-stone-800 dark:text-stone-200">
                        #{tag.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => setEditingTag(tag)}
                        className="p-1 text-stone-400 hover:text-stone-600"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(tag.id)}
                      className="p-1 text-stone-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
