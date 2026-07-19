import type { CaseStatus, CaseStatusHistoryItem } from '@/types';
import { caseStatusLabel, toFa } from '@/lib/utils';

const STAGE_ORDER: CaseStatus[] = ['SUBMITTED', 'DOCUMENT_REVIEW', 'AGENCY_FOLLOW_UP', 'COMPLETED'];

interface TimelineProps {
  status: CaseStatus;
  history: CaseStatusHistoryItem[];
  serviceType?: string;
}

function formatDate(iso: string): string {
  return toFa(new Date(iso).toLocaleDateString('fa-IR'));
}

function reachedIndex(history: CaseStatusHistoryItem[]): number {
  const indices = history
    .map((item) => STAGE_ORDER.indexOf(item.newStatus))
    .filter((index) => index >= 0);
  return indices.length > 0 ? Math.max(...indices) : -1;
}

export function Timeline({ status, history, serviceType }: TimelineProps) {
  const isFailed = status === 'FAILED';
  const currentIndex = isFailed ? reachedIndex(history) : STAGE_ORDER.indexOf(status);
  const dateByStatus = new Map(history.map((item) => [item.newStatus, item.createdAt]));

  return (
    <div className="flex flex-col">
      {isFailed && (
        <p className="mb-4 flex items-center gap-2 rounded-lg bg-[rgba(192,57,43,0.08)] p-3 text-sm text-error">
          <i className="ph-fill ph-x-circle" />
          این پرونده در وضعیت «{caseStatusLabel('FAILED', serviceType)}» قرار دارد. جهت پیگیری با ما تماس بگیرید.
        </p>
      )}
      {STAGE_ORDER.map((stage, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex && !isFailed;
        const isFailedStage = index === currentIndex && isFailed;
        const isLast = index === STAGE_ORDER.length - 1;
        const date = dateByStatus.get(stage);

        const dotClasses = isFailedStage
          ? 'bg-error text-white'
          : isDone
            ? 'bg-[#1E8E5A] text-white'
            : isCurrent
              ? 'bg-[#F39C12] text-white'
              : 'bg-[#EDF1F4] text-[#9AA6B0]';
        const icon = isFailedStage ? 'ph-x' : isDone ? 'ph-check' : isCurrent ? 'ph-dots-three' : 'ph-circle';
        const labelColor = isFailedStage
          ? 'text-error'
          : isDone
            ? 'text-[#1E8E5A]'
            : isCurrent
              ? 'text-[#F39C12]'
              : 'text-muted';

        return (
          <div key={stage} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full ${dotClasses}`}>
                <i className={`ph-fill ${icon} text-base`} />
              </span>
              {!isLast && <span className="w-[2px] flex-1 bg-line" />}
            </div>
            <div className="pb-8">
              <p className={`font-bold ${labelColor}`}>{caseStatusLabel(stage, serviceType)}</p>
              <p className="text-sm text-muted">{date ? formatDate(date) : '—'}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
