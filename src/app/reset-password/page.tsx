'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error('Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu tối thiểu 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      toast.success('Đã cập nhật mật khẩu mới thành công!');
      router.push('/app/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Không thể đổi mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#faf8f5] dark:bg-stone-950 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1e3a2f] text-white shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
          </Link>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Đặt lại mật khẩu
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        <div className="rounded-2xl border border-[#e7e2d9] bg-white dark:border-stone-800 dark:bg-stone-900 p-8 shadow-sm">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <Input
              label="Mật khẩu mới *"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              required
            />

            <Input
              label="Xác nhận mật khẩu mới *"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              required
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-semibold gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                'Lưu mật khẩu mới'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
