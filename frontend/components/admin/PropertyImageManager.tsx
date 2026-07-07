'use client';

import { useRef, useState } from 'react';
import {
  ApiRequestError,
  deletePropertyImage,
  reorderPropertyImages,
  uploadPropertyImage,
} from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import type { PropertyImage } from '@/types';

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

interface PropertyImageManagerProps {
  propertyId: string;
  initialImages: PropertyImage[];
}

export function PropertyImageManager({ propertyId, initialImages }: PropertyImageManagerProps) {
  const [images, setImages] = useState<PropertyImage[]>(initialImages);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: File[]) => {
    const token = getAuthToken();
    if (!token) {
      setMessage('برای این کار باید دوباره وارد شوید.');
      return;
    }
    const invalidFile = files.find(
      (file) => !ALLOWED_TYPES.includes(file.type) || file.size > MAX_SIZE_BYTES,
    );
    if (invalidFile) {
      setMessage(`فایل «${invalidFile.name}» پذیرفته نشد. فقط عکس JPG یا PNG تا ۱۰ مگابایت.`);
      return;
    }

    setUploading(true);
    setMessage('');
    const uploaded: PropertyImage[] = [];
    for (const file of files) {
      try {
        uploaded.push(await uploadPropertyImage(token, propertyId, file));
      } catch {
        setMessage('خطا در آپلود یکی از تصاویر. دوباره تلاش کنید.');
      }
    }
    setUploading(false);
    if (uploaded.length > 0) {
      setImages((prev) => [...prev, ...uploaded]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length > 0) uploadFiles(files);
  };

  const handleDelete = async (imageId: string) => {
    const token = getAuthToken();
    if (!token) return;
    if (!confirm('این تصویر حذف شود؟')) return;
    try {
      await deletePropertyImage(token, propertyId, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      setMessage(err instanceof ApiRequestError ? String(err.message) : 'خطا در حذف تصویر.');
    }
  };

  const persistOrder = async (nextImages: PropertyImage[]) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      await reorderPropertyImages(
        token,
        propertyId,
        nextImages.map((img) => img.id),
      );
    } catch {
      setMessage('خطا در ذخیره ترتیب تصاویر.');
    }
  };

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDropReorder = (index: number) => {
    const fromIndex = dragIndex.current;
    dragIndex.current = null;
    if (fromIndex === null || fromIndex === index) return;

    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(index, 0, moved);
      persistOrder(next);
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-line bg-surface p-6">
      <h2 className="mb-4 font-bold text-ink">تصاویر آگهی</h2>

      {images.length > 0 && (
        <div className="mb-4 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropReorder(index)}
              className="group relative aspect-square cursor-move overflow-hidden rounded-lg border border-line"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleDelete(image.id)}
                aria-label="حذف تصویر"
                className="absolute left-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-error text-white opacity-0 transition group-hover:opacity-100"
              >
                <i className="ph ph-x" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 right-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                  اصلی
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-[10px] border-2 border-dashed p-6 text-center text-muted transition ${
          dragOver ? 'border-primary bg-soft' : 'border-line'
        }`}
      >
        <i className="ph ph-upload-simple text-2xl" />
        <span className="text-sm">{uploading ? 'در حال آپلود...' : 'تصاویر را بکشید و رها کنید یا کلیک کنید'}</span>
        <span className="text-xs">فرمت‌های مجاز: JPG، PNG — حداکثر ۱۰ مگابایت — می‌توانید چند تصویر با هم انتخاب کنید</span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />

      {message && <p className="mt-3 text-sm text-error">{message}</p>}
      <p className="mt-3 text-xs text-muted">برای تغییر ترتیب نمایش، تصاویر را بکشید و جابه‌جا کنید. اولین تصویر، تصویر اصلی آگهی است.</p>
    </div>
  );
}
