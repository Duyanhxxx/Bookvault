'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập địa chỉ email.');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsSent(true);
      toast.success('Đã gửi email hướng dẫn khôi phục mật khẩu!');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi gửi yêu cầu.');
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
            Quên mật khẩu?
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
          </p>
        </div>

        <div className="rounded-2xl border border-[#e7e2d9] bg-white dark:border-stone-800 dark:bg-stone-900 p-8 shadow-sm">
          {isSent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm text-stone-700 dark:text-stone-300">
                Chúng tôi đã gửi đường dẫn đặt lại mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm tra hòm thư của bạn.
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full text-xs">
                    Quay lại đăng nhập
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <Input
                label="Địa chỉ Email"
                type="email"
                placeholder="tenban@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
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
                    Đang gửi yêu cầu...
                  </>
                ) : (
                  'Gửi liên kết khôi phục'
                )}
              </Button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
