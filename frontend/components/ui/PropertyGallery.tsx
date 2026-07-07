'use client';

import { useState } from 'react';
import type { PropertyImage } from '@/types';
import { dealTypeLabel } from '@/lib/utils';
import { ImageLightbox } from './ImageLightbox';

interface PropertyGalleryProps {
  images: PropertyImage[];
  dealType: string;
}

export function PropertyGallery({ images, dealType }: PropertyGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeImage = images[active];

  return (
    <div>
      <div className="relative mb-3 flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl bg-[#0f1e2c]">
        {activeImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activeImage.url} alt="" className="h-full w-full object-contain" />
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label="بزرگ‌نمایی تصویر"
              className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
            >
              <i className="ph ph-magnifying-glass-plus text-lg" />
            </button>
          </>
        ) : (
          <span className="font-mono text-sm text-muted">GALLERY IMAGE 1</span>
        )}
        <span
          className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold text-white ${
            dealType === 'RENT' ? 'bg-rent' : 'bg-sale'
          }`}
        >
          {dealTypeLabel(dealType)}
        </span>
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              className={`flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border-2 bg-[#0f1e2c] transition ${
                active === index ? 'border-primary' : 'border-transparent'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && activeImage && (
        <ImageLightbox src={activeImage.url} alt="" onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}
