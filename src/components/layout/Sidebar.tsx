'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  LayoutDashboard,
  Library,
  Flame,
  Heart,
  Bookmark,
  Tag as TagIcon,
  Settings,
  Plus,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import { signOut } from '@/services/auth';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  onOpenAddModal: () => void;
  onOpenSearchModal: () => void;
}

export function Sidebar({ onOpenAddModal, onOpenSearchModal }: SidebarProps) {
  const pathname = usePathname();
  const { user, profile } = useUser();

  const navItems = [
    {
      name: 'Tổng quan',
      href: '/app/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Thư viện sách',
      href: '/app/library',
      icon: Library,
    },
    {
      name: 'Đang đọc',
      href: '/app/reading',
      icon: Flame,
    },
    {
      name: 'Muốn đọc / Wishlist',
      href: '/app/wishlist',
      icon: Heart,
    },
    {
      name: 'Ghi chú & Trích dẫn',
      href: '/app/notes',
      icon: Bookmark,
    },
    {
      name: 'Thẻ phân loại',
      href: '/app/tags',
      icon: TagIcon,
    },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-[#e7e2d9] bg-[#faf8f5] dark:border-stone-800 dark:bg-stone-950 p-4 min-h-screen">
      <div className="space-y-6">
        {/* Logo & Tagline */}
        <div className="px-3 pt-2">
          <Link href="/app/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a2f] text-white shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100 block leading-tight">
                BookVault
              </span>
              <span className="text-[10px] text-stone-500 font-medium block">
                Never buy the same book twice
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Add CTA */}
        <div className="px-2 space-y-2">
          <Button
            onClick={onOpenAddModal}
            className="w-full gap-2 font-semibold shadow-xs text-xs h-10"
          >
            <Plus className="h-4 w-4" />
            Thêm sách mới
          </Button>

          <button
            onClick={onOpenSearchModal}
            className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg border border-[#dcd6ca] bg-white hover:bg-stone-50 text-stone-600 transition-colors shadow-2xs cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
              Tra cứu tại nhà sách
            </span>
            <kbd className="text-[10px] font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-400">⌘K</kbd>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/app/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-[#1e3a2f] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-[#f3eee7] hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-900'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Settings */}
      <div className="space-y-2 px-2 pt-4 border-t border-[#e7e2d9] dark:border-stone-800">
        <Link
          href="/app/settings"
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-colors',
            pathname === '/app/settings'
              ? 'bg-[#1e3a2f] text-white'
              : 'text-stone-700 hover:bg-[#f3eee7] dark:text-stone-300'
          )}
        >
          <Settings className="h-4 w-4" />
          <span>Cài đặt & Tài khoản</span>
        </Link>

        <div className="flex items-center justify-between rounded-xl bg-white dark:bg-stone-900 p-2.5 border border-[#e7e2d9] dark:border-stone-800 shadow-2xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a2f]/15 text-[#1e3a2f] font-serif font-bold text-xs flex-shrink-0">
              {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                {profile?.display_name || user?.email?.split('@')[0] || 'Độc giả'}
              </p>
              <p className="text-[10px] text-stone-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            title="Đăng xuất"
            className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
