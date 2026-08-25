'use client';

import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BookCoverProps {
  src?: string | null;
  title: string;
  author?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fill';
  aspectRatio?: 'book' | 'square';
}

const COLOR_PALETTES = [
  { bg: 'bg-[#2D5A47]', text: 'text-[#FAF8F5]', border: 'border-[#1E3A2F]' },
  { bg: 'bg-[#7A3E2D]', text: 'text-[#FAF8F5]', border: 'border-[#5A2D1F]' },
  { bg: 'bg-[#2E4A62]', text: 'text-[#FAF8F5]', border: 'border-[#1E3345]' },
  { bg: 'bg-[#6B5B3E]', text: 'text-[#FAF8F5]', border: 'border-[#4F422C]' },
  { bg: 'bg-[#4A3B52]', text: 'text-[#FAF8F5]', border: 'border-[#332839]' },
  { bg: 'bg-[#3A504B]', text: 'text-[#FAF8F5]', border: 'border-[#263733]' },
];

export function BookCover({
  src,
  title,
  author,
  className,
  size = 'md',
  aspectRatio = 'book',
}: BookCoverProps) {
  const [imageError, setImageError] = useState(false);

  // Deterministic palette based on title
  const paletteIndex = title
    ? Math.abs(
        title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      ) % COLOR_PALETTES.length
    : 0;
  const palette = COLOR_PALETTES[paletteIndex];

  const sizeClasses = {
    sm: 'w-14 h-20 text-[10px]',
    md: 'w-24 h-36 sm:w-28 sm:h-40 text-xs',
    lg: 'w-36 h-52 sm:w-44 sm:h-64 text-sm',
    xl: 'w-48 h-72 sm:w-60 sm:h-88 text-base',
    fill: 'w-full h-full text-sm',
  };

  const aspectClass = aspectRatio === 'book' ? 'aspect-[2/3]' : 'aspect-square';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md transition-transform duration-200 select-none book-shadow flex-shrink-0',
        size !== 'fill' && sizeClasses[size],
        aspectClass,
        className
      )}
    >
      {/* Physical book spine effect on left edge */}
      <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/35 via-black/10 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-[1px] bg-white/25 z-10 pointer-events-none" />

      {src && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={title}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover object-center"
          loading="lazy"
        />
      ) : (
        /* Editorial Fallback Book Cover */
        <div
          className={cn(
            'flex h-full w-full flex-col justify-between p-2.5 sm:p-3.5 border text-left',
            palette.bg,
            palette.text,
            palette.border
          )}
        >
          {/* Top header accent */}
          <div className="flex items-center justify-between border-b border-white/20 pb-1.5 opacity-80">
            <span className="text-[9px] uppercase tracking-widest font-sans font-medium line-clamp-1">
              {author || 'BookVault'}
            </span>
            <BookOpen className="h-3 w-3 opacity-70 flex-shrink-0" />
          </div>

          {/* Center Book Title */}
          <div className="my-auto py-1">
            <p className="font-serif font-bold leading-tight line-clamp-3 text-shadow-sm">
              {title}
            </p>
          </div>

          {/* Bottom footer accent */}
          <div className="border-t border-white/20 pt-1 opacity-75">
            <p className="text-[9px] font-sans italic line-clamp-1">
              {author || 'Ấn bản cá nhân'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
