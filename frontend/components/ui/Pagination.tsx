import Link from 'next/link';
import { toFa } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function Pagination({ page, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="mt-10 flex items-center justify-center gap-2">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`flex h-10 w-10 items-center justify-center rounded-full border border-line ${
          page === 1 ? 'pointer-events-none opacity-40' : 'hover:border-primary hover:text-primary'
        }`}
      >
        <i className="ph ph-caret-right" />
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
            p === page ? 'bg-primary text-white' : 'border border-line text-ink hover:border-primary'
          }`}
        >
          {toFa(p)}
        </Link>
      ))}
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`flex h-10 w-10 items-center justify-center rounded-full border border-line ${
          page === totalPages ? 'pointer-events-none opacity-40' : 'hover:border-primary hover:text-primary'
        }`}
      >
        <i className="ph ph-caret-left" />
      </Link>
    </nav>
  );
}
