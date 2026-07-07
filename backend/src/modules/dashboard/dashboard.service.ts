import { Injectable } from '@nestjs/common';
import { CaseStatus, PropertyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const IN_PROGRESS_CASE_STATUSES: CaseStatus[] = [
  CaseStatus.SUBMITTED,
  CaseStatus.DOCUMENT_REVIEW,
  CaseStatus.AGENCY_FOLLOW_UP,
];
const RECENT_LIST_LIMIT = 5;

export interface DashboardSummary {
  activeProperties: number;
  inProgressCases: number;
  unhandledContacts: number;
  newUsersThisWeek: number;
  recentCases: Array<{
    id: string;
    trackingCode: string;
    serviceType: string;
    status: CaseStatus;
    createdAt: Date;
  }>;
  recentContacts: Array<{
    id: string;
    name: string;
    mobile: string;
    isHandled: boolean;
    createdAt: Date;
  }>;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<DashboardSummary> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      activeProperties,
      inProgressCases,
      unhandledContacts,
      newUsersThisWeek,
      recentCases,
      recentContacts,
    ] = await this.prisma.$transaction([
      this.prisma.property.count({ where: { status: PropertyStatus.ACTIVE } }),
      this.prisma.adminServiceRequest.count({
        where: { status: { in: IN_PROGRESS_CASE_STATUSES } },
      }),
      this.prisma.contactRequest.count({ where: { isHandled: false } }),
      this.prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      this.prisma.adminServiceRequest.findMany({
        orderBy: { createdAt: 'desc' },
        take: RECENT_LIST_LIMIT,
        select: { id: true, trackingCode: true, serviceType: true, status: true, createdAt: true },
      }),
      this.prisma.contactRequest.findMany({
        orderBy: { createdAt: 'desc' },
        take: RECENT_LIST_LIMIT,
        select: { id: true, name: true, mobile: true, isHandled: true, createdAt: true },
      }),
    ]);

    return {
      activeProperties,
      inProgressCases,
      unhandledContacts,
      newUsersThisWeek,
      recentCases,
      recentContacts,
    };
  }
}
