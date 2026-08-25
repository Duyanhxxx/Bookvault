'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Library,
  Flame,
  Heart,
  Settings,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav({ onOpenAddModal }: { onOpenAddModal: () => void }) {
  const pathname = usePathname();

  const items = [
    {
      name: 'Trang chủ',
      href: '/app/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Tủ sách',
      href: '/app/library',
      icon: Library,
    },
    {
      name: 'Đang đọc',
      href: '/app/reading',
      icon: Flame,
    },
    {
      name: 'Muốn đọc',
      href: '/app/wishlist',
      icon: Heart,
    },
    {
      name: 'Cá nhân',
      href: '/app/settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Floating Action Button (+) */}
      <div className="fixed bottom-20 right-4 z-40 lg:hidden">
        <button
          onClick={onOpenAddModal}
          className="flex h-13 w-13 items-center justify-center rounded-full bg-[#1e3a2f] text-white shadow-xl hover:bg-[#284f40] active:scale-95 transition-all cursor-pointer ring-4 ring-white dark:ring-stone-900"
          aria-label="Thêm sách"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-[#e7e2d9] bg-[#faf8f5]/95 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/95 px-2 py-1.5 shadow-lg">
        <div className="flex items-center justify-around">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/app/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors',
                  isActive
                    ? 'text-[#1e3a2f] dark:text-emerald-400 font-bold'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
