'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUser } from '@/hooks/useUser';

interface HeaderProps {
  onOpenSearchModal: () => void;
  onOpenAddModal: () => void;
}

export function Header({ onOpenSearchModal, onOpenAddModal }: HeaderProps) {
  const { user, profile } = useUser();

  // Global keyboard shortcut: Cmd+K or Ctrl+K to open Bookstore Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearchModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearchModal]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e7e2d9] bg-[#faf8f5]/85 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/85 px-4 sm:px-8 transition-colors">
      {/* Mobile Logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e3a2f] text-white">
          <BookOpen className="h-4 w-4" />
        </div>
        <span className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
          BookVault
        </span>
      </div>

      {/* Instant Bookstore Search Bar Trigger */}
      <div className="flex-1 max-w-lg mx-2 sm:mx-0">
        <button
          type="button"
          onClick={onOpenSearchModal}
          className="group flex w-full items-center justify-between rounded-xl border border-[#dcd6ca] bg-white dark:bg-stone-900 dark:border-stone-800 px-3.5 py-2 text-xs text-stone-500 hover:border-[#1e3a2f] hover:text-stone-800 dark:hover:text-stone-200 transition-all shadow-2xs cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="truncate">Tra cứu nhanh tại nhà sách (tên, tác giả, ISBN)...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 font-mono text-[10px] text-stone-400 font-semibold">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onOpenAddModal}
          size="sm"
          className="hidden sm:inline-flex gap-1.5 text-xs font-semibold"
        >
          <Plus className="h-4 w-4" />
          Thêm sách
        </Button>

        {/* User avatar link */}
        <Link
          href="/app/settings"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a2f]/10 text-[#1e3a2f] dark:bg-emerald-950 dark:text-emerald-400 font-serif font-bold text-xs border border-[#1e3a2f]/20 hover:scale-105 transition-transform"
        >
          {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
        </Link>
      </div>
    </header>
  );
}
