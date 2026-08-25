'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IMAGE_TYPE_LABELS } from '@/lib/utils';
import type { BookImageType, BookImage } from '@/types/database';
import { uploadBookImage } from '@/services/storage';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

export function BookUploader({
  bookId,
  onUploaded,
}: {
  bookId: string;
  onUploaded?: (image: BookImage) => void;
}) {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageType, setImageType] = useState<BookImageType>('COVER');
  const [isPrimary, setIsPrimary] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh (JPG, PNG, WebP).');
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    setIsUploading(true);

    try {
      const uploaded = await uploadBookImage({
        userId: user.id,
        bookId,
        file: selectedFile,
        imageType,
        isPrimary,
      });

      toast.success('Đã tải ảnh lên thành công!');
      setSelectedFile(null);
      setPreviewUrl(null);
      onUploaded?.(uploaded);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải ảnh lên.');
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50/50 dark:bg-stone-900/40 p-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />

      {!previewUrl ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[#1e3a2f] bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-stone-300 hover:border-stone-400 bg-white dark:bg-stone-900'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 mb-2">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="font-serif text-sm font-semibold text-stone-800 dark:text-stone-200">
            Kéo thả hoặc nhấn để chọn ảnh sách thật
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Chụp bìa sách, gáy sách hoặc mã vạch ISBN (JPG, PNG, tối đa 10MB)
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview & Options */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="relative h-44 w-32 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0 book-shadow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={clearSelection}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Loại ảnh chụp
                </label>
                <select
                  value={imageType}
                  onChange={(e) => setImageType(e.target.value as BookImageType)}
                  className="w-full h-9 rounded-lg border border-stone-300 bg-white px-3 py-1 text-sm font-medium focus:border-[#1e3a2f] focus:outline-none"
                >
                  {(Object.keys(IMAGE_TYPE_LABELS) as BookImageType[]).map((type) => (
                    <option key={type} value={type}>
                      {IMAGE_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded border-stone-300 text-[#1e3a2f] focus:ring-[#1e3a2f]"
                />
                <span>Đặt làm ảnh đại diện chính của cuốn sách</span>
              </label>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="gap-2 text-xs"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Đang tải lên...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Xác nhận tải lên
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearSelection}
                  disabled={isUploading}
                  className="text-xs"
                >
                  Huỷ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
