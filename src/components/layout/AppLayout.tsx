'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { BookSearchModal } from '@/components/books/BookSearchModal';
import { AddBookModal } from '@/components/books/AddBookModal';
import type { Book } from '@/types/database';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addPrefill, setAddPrefill] = useState<Partial<Book> | undefined>(undefined);

  const handleOpenAddWithPrefill = (prefill?: Partial<Book>) => {
    setAddPrefill(prefill);
    setIsAddOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#faf8f5] dark:bg-stone-950">
      {/* Desktop Sidebar */}
      <Sidebar
        onOpenAddModal={() => {
          setAddPrefill(undefined);
          setIsAddOpen(true);
        }}
        onOpenSearchModal={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0 pb-24 lg:pb-8">
        <Header
          onOpenSearchModal={() => setIsSearchOpen(true)}
          onOpenAddModal={() => {
            setAddPrefill(undefined);
            setIsAddOpen(true);
          }}
        />

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        onOpenAddModal={() => {
          setAddPrefill(undefined);
          setIsAddOpen(true);
        }}
      />

      {/* Global Instant Bookstore Search Modal */}
      <BookSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenAddModal={handleOpenAddWithPrefill}
      />

      {/* Multi-step Add Book Modal */}
      <AddBookModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setAddPrefill(undefined);
        }}
        initialData={addPrefill}
      />
    </div>
  );
}
