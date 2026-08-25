'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, LogOut, Check, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { updateProfile, signOut } from '@/services/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, profile, loading } = useUser();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await updateProfile(user.id, {
        display_name: displayName.trim(),
        avatar_url: avatarUrl.trim() || undefined,
      });
      toast.success('Đã cập nhật thông tin hồ sơ thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật hồ sơ.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Đã đăng xuất.');
      window.location.href = '/login';
    } catch (err: any) {
      toast.error(err.message || 'Lỗi đăng xuất.');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-stone-500">Đang tải cài đặt...</div>;
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Cài đặt & Tài khoản
        </h1>
        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
          Quản lý thông tin cá nhân và tài khoản độc giả BookVault của bạn.
        </p>
      </div>

      {/* Profile Form */}
      <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1e3a2f]/10 text-[#1e3a2f] dark:bg-emerald-950 dark:text-emerald-400 font-serif font-bold text-2xl border border-[#1e3a2f]/20">
            {displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              {displayName || 'Độc giả BookVault'}
            </h3>
            <p className="text-xs text-stone-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Tên hiển thị"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            leftIcon={<User className="h-4 w-4" />}
            required
          />

          <Input
            label="Địa chỉ Email (Được quản lý bởi Supabase Auth)"
            value={user?.email || ''}
            disabled
            leftIcon={<Mail className="h-4 w-4" />}
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="gap-1.5 text-xs font-semibold"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* App Information Box */}
      <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs space-y-3">
        <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#1e3a2f]" />
          Về ứng dụng BookVault
        </h3>
        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          BookVault là ứng dụng tủ sách số cá nhân được thiết kế nhằm giúp bạn bảo vệ tủ sách, theo dõi tiến độ đọc và giải quyết dứt điểm nỗi lo mua trùng sách tại các nhà sách.
        </p>
        <div className="pt-2 text-[11px] text-stone-400">
          Phiên bản: 1.0.0 (Production Quality) • Supabase Auth & Storage Connected
        </div>
      </div>

      {/* Danger Zone / Logout */}
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-serif text-base font-bold text-rose-900 dark:text-rose-200">
            Đăng xuất khỏi thiết bị
          </h4>
          <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
            Kết thúc phiên làm việc hiện tại trên trình duyệt này.
          </p>
        </div>

        <Button
          variant="destructive"
          onClick={handleSignOut}
          className="gap-2 text-xs font-semibold"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất tài khoản
        </Button>
      </div>
    </div>
  );
}
