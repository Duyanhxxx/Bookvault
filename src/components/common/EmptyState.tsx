'use client';

import * as React from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#dcd6ca] bg-white/50 dark:bg-stone-900/30 p-12 text-center my-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f3eee7] dark:bg-stone-800 text-[#1e3a2f] dark:text-emerald-400 mb-4 shadow-inner">
        {icon || <BookOpen className="h-8 w-8 stroke-[1.5]" />}
      </div>
      <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-stone-600 dark:text-stone-400">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction} className="gap-2">
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
