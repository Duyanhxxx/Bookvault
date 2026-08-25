'use client';

import React from 'react';
import type { BookStatus } from '@/types/database';
import { STATUS_CONFIG, cn } from '@/lib/utils';

export function BookStatusBadge({
  status,
  className,
}: {
  status: BookStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.OWNED;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}
