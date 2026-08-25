'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Đăng nhập thành công!');
      router.push('/app/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#faf8f5] dark:bg-stone-950 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1e3a2f] text-white shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
          </Link>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Chào mừng trở lại
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Đăng nhập để truy cập tủ sách cá nhân BookVault của bạn
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#e7e2d9] bg-white dark:border-stone-800 dark:bg-stone-900 p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Địa chỉ Email"
              type="email"
              placeholder="tenban@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />

            <div className="space-y-1">
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                required
              />
              <div className="flex justify-end pt-1">
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#1e3a2f] dark:text-emerald-400 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-semibold gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-stone-600 dark:text-stone-400">
            Chưa có tài khoản?{' '}
            <Link
              href="/register"
              className="font-bold text-[#1e3a2f] dark:text-emerald-400 hover:underline"
            >
              Tạo tài khoản ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
