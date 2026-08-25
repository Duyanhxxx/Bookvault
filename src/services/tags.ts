import { createClient } from '@/lib/supabase/client';
import type { Tag } from '@/types/database';

export async function getUserTags(userId: string): Promise<Tag[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return (data || []) as Tag[];
}

export async function createTag(userId: string, name: string, color?: string): Promise<Tag> {
  const supabase = createClient();
  const payload = {
    user_id: userId,
    name: name.trim(),
    color: color || '#1E3A2F',
  };

  const { data, error } = await supabase
    .from('tags')
    .insert(payload as any)
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error(`Thẻ "${name}" đã tồn tại.`);
    }
    throw new Error(`Tạo thẻ thất bại: ${error.message}`);
  }

  return data as Tag;
}

export async function updateTag(tagId: string, name: string, color?: string): Promise<Tag> {
  const supabase = createClient();
  const payload = {
    name: name.trim(),
    color: color,
  };

  const { data, error } = await supabase
    .from('tags')
    .update(payload as any)
    .eq('id', tagId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Cập nhật thẻ thất bại: ${error.message}`);
  }

  return data as Tag;
}

export async function deleteTag(tagId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('tags').delete().eq('id', tagId);
  if (error) {
    throw new Error(`Xoá thẻ thất bại: ${error.message}`);
  }
}

export async function getBookTags(userBookId: string): Promise<Tag[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('book_tags')
    .select('tag_id, tags(*)')
    .eq('user_book_id', userBookId);

  if (error) {
    console.error('Error fetching book tags:', error);
    return [];
  }

  return (data || []).map((item: any) => item.tags).filter(Boolean) as Tag[];
}

export async function setBookTags(userBookId: string, tagIds: string[]): Promise<void> {
  const supabase = createClient();

  // 1. Remove existing tag associations
  const { error: deleteError } = await supabase
    .from('book_tags')
    .delete()
    .eq('user_book_id', userBookId);

  if (deleteError) {
    throw new Error(`Cập nhật thẻ thất bại: ${deleteError.message}`);
  }

  // 2. Insert new associations
  if (tagIds.length > 0) {
    const rows = tagIds.map((tagId) => ({
      user_book_id: userBookId,
      tag_id: tagId,
    }));

    const { error: insertError } = await supabase.from('book_tags').insert(rows as any);
    if (insertError) {
      throw new Error(`Gán thẻ thất bại: ${insertError.message}`);
    }
  }
}
