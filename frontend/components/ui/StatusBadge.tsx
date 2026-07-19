import type { CaseStatus } from '@/types';
import { caseStatusLabel } from '@/lib/utils';

const STATUS_STYLES: Record<CaseStatus, string> = {
  SUBMITTED: 'bg-[#F39C12] text-white',
  DOCUMENT_REVIEW: 'bg-[#F39C12] text-white',
  AGENCY_FOLLOW_UP: 'bg-[#F39C12] text-white',
  COMPLETED: 'bg-[#1E8E5A] text-white',
  FAILED: 'bg-[#C0392B] text-white',
};

const STATUS_ICONS: Record<CaseStatus, string> = {
  SUBMITTED: 'ph-spinner-gap',
  DOCUMENT_REVIEW: 'ph-spinner-gap',
  AGENCY_FOLLOW_UP: 'ph-spinner-gap',
  COMPLETED: 'ph-check-circle',
  FAILED: 'ph-x-circle',
};

export function StatusBadge({ status, serviceType }: { status: CaseStatus; serviceType?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${STATUS_STYLES[status]}`}
    >
      <i className={`ph-fill ${STATUS_ICONS[status]}`} />
      {caseStatusLabel(status, serviceType)}
    </span>
  );
}
