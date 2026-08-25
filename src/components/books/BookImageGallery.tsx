'use client';

import React, { useState } from 'react';
import { Star, Trash2, Maximize2, Sparkles, Image as ImageIcon } from 'lucide-react';
import type { BookImage } from '@/types/database';
import { IMAGE_TYPE_LABELS } from '@/lib/utils';
import { deleteBookImage, setPrimaryBookImage } from '@/services/storage';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export function BookImageGallery({
  bookId,
  images,
  onImageChanged,
}: {
  bookId: string;
  images: BookImage[];
  onImageChanged?: () => void;
}) {
  const [selectedImage, setSelectedImage] = useState<BookImage | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleSetPrimary = async (img: BookImage) => {
    try {
      await setPrimaryBookImage(bookId, img.id);
      toast.success('Đã đặt làm ảnh bìa chính.');
      onImageChanged?.();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi đặt ảnh chính.');
    }
  };

  const handleDelete = async (img: BookImage) => {
    if (!confirm('Bạn có chắc muốn xoá ảnh này không?')) return;
    setIsDeleting(img.id);
    try {
      await deleteBookImage(img);
      toast.success('Đã xoá ảnh thành công.');
      if (selectedImage?.id === img.id) setSelectedImage(null);
      onImageChanged?.();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xoá ảnh.');
    } finally {
      setIsDeleting(null);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/50 p-6 text-center text-xs text-stone-500">
        <ImageIcon className="mx-auto h-8 w-8 text-stone-400 mb-1" />
        <p className="font-medium text-stone-700">Chưa có ảnh chụp sách vật lý nào</p>
        <p className="mt-0.5">Tải ảnh bìa, gáy sách hoặc mã ISBN để lưu giữ kỷ niệm về cuốn sách thật của bạn.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img) => (
          <div
            key={img.id}
            className={`group relative overflow-hidden rounded-xl border transition-all duration-200 bg-white ${
              img.is_primary
                ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            {/* Image Thumbnail */}
            <div
              onClick={() => setSelectedImage(img)}
              className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-stone-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.image_url}
                alt={IMAGE_TYPE_LABELS[img.image_type]}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Type Badge */}
              <div className="absolute top-2 left-2 z-10">
                <span className="rounded-md bg-stone-900/75 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                  {IMAGE_TYPE_LABELS[img.image_type]}
                </span>
              </div>

              {/* Primary Star */}
              {img.is_primary && (
                <div className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                  <Star className="h-3.5 w-3.5 fill-white" />
                </div>
              )}
            </div>

            {/* Quick action bar */}
            <div className="flex items-center justify-between p-2 text-xs border-t border-stone-100 bg-stone-50">
              {!img.is_primary ? (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(img)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-emerald-700 cursor-pointer"
                >
                  <Star className="h-3 w-3" />
                  Đặt làm bìa
                </button>
              ) : (
                <span className="text-[11px] font-semibold text-emerald-700">Ảnh bìa chính</span>
              )}

              <button
                type="button"
                onClick={() => handleDelete(img)}
                disabled={isDeleting === img.id}
                className="rounded p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                title="Xoá ảnh"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Full Preview Modal */}
      {selectedImage && (
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          maxWidth="2xl"
          title={`Ảnh chụp: ${IMAGE_TYPE_LABELS[selectedImage.image_type]}`}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="max-h-[60vh] overflow-hidden rounded-xl bg-stone-950 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage.image_url}
                alt="Full size preview"
                className="max-h-[60vh] max-w-full object-contain"
              />
            </div>

            <div className="flex w-full justify-between items-center pt-2">
              <span className="text-xs text-stone-500">
                {IMAGE_TYPE_LABELS[selectedImage.image_type]}
              </span>
              <div className="flex gap-2">
                {!selectedImage.is_primary && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleSetPrimary(selectedImage);
                      setSelectedImage(null);
                    }}
                    className="text-xs gap-1"
                  >
                    <Star className="h-3.5 w-3.5" />
                    Đặt làm ảnh bìa
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(selectedImage)}
                  className="text-xs gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Xoá ảnh
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
