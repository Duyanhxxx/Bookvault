import { createClient } from '@/lib/supabase/client';
import type { BookImage, BookImageType } from '@/types/database';

const BUCKET_NAME = 'book-images';
const SIGNED_URL_EXPIRES_IN = 60 * 60 * 24; // 24 hours

export async function uploadBookImage({
  userId,
  bookId,
  file,
  imageType,
  isPrimary = false,
}: {
  userId: string;
  bookId: string;
  file: File;
  imageType: BookImageType;
  isPrimary?: boolean;
}): Promise<BookImage> {
  const supabase = createClient();

  // 1. Sanitize file name & determine file extension
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `${userId}/${bookId}/${fileName}`;

  // 2. Upload file to Supabase private storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw new Error(`Tải ảnh thất bại: ${uploadError.message}`);
  }

  // 3. Generate signed URL for immediate display
  const { data: signedData } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, SIGNED_URL_EXPIRES_IN);

  const imageUrl = signedData?.signedUrl || filePath;

  // 4. If setting as primary, unset other primary images for this book
  if (isPrimary) {
    await supabase
      .from('book_images')
      .update({ is_primary: false } as any)
      .eq('book_id', bookId);
  }

  // 5. Insert record into book_images table
  const imagePayload = {
    book_id: bookId,
    image_url: imageUrl,
    storage_path: filePath,
    image_type: imageType,
    is_primary: isPrimary,
    sort_order: isPrimary ? 0 : 10,
  };

  const { data: imageRecord, error: dbError } = await supabase
    .from('book_images')
    .insert(imagePayload as any)
    .select('*')
    .single();

  if (dbError) {
    console.error('Database book_images insert error:', dbError);
    // Cleanup uploaded file
    await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    throw new Error(`Lưu thông tin ảnh thất bại: ${dbError.message}`);
  }

  return imageRecord as BookImage;
}

export async function getSignedUrlForPath(storagePath: string): Promise<string | null> {
  if (!storagePath) return null;
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }

  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRES_IN);

  if (error || !data) {
    console.error('Error creating signed URL:', error);
    return null;
  }

  return data.signedUrl;
}

export async function getSignedUrlsForImages(images: BookImage[]): Promise<BookImage[]> {
  if (!images || images.length === 0) return [];
  const supabase = createClient();

  const refreshedImages = await Promise.all(
    images.map(async (img) => {
      if (img.storage_path) {
        const { data } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(img.storage_path, SIGNED_URL_EXPIRES_IN);
        if (data?.signedUrl) {
          return { ...img, image_url: data.signedUrl };
        }
      }
      return img;
    })
  );

  return refreshedImages;
}

export async function deleteBookImage(image: BookImage): Promise<void> {
  const supabase = createClient();

  const { error: dbError } = await supabase
    .from('book_images')
    .delete()
    .eq('id', image.id);

  if (dbError) {
    throw new Error(`Xoá ảnh thất bại: ${dbError.message}`);
  }

  if (image.storage_path) {
    await supabase.storage.from(BUCKET_NAME).remove([image.storage_path]);
  }
}

export async function setPrimaryBookImage(bookId: string, imageId: string): Promise<void> {
  const supabase = createClient();

  await supabase
    .from('book_images')
    .update({ is_primary: false } as any)
    .eq('book_id', bookId);

  const { error } = await supabase
    .from('book_images')
    .update({ is_primary: true } as any)
    .eq('id', imageId);

  if (error) {
    throw new Error(`Cập nhật ảnh đại diện thất bại: ${error.message}`);
  }
}
