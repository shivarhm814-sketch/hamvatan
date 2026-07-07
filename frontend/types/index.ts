export type PropertyType = 'VILLA' | 'LAND' | 'SHOP' | 'APARTMENT' | 'PADDY_FIELD';
export type DealType = 'SALE' | 'RENT';
export type PropertyStatus = 'ACTIVE' | 'SOLD' | 'ARCHIVED';

export interface PropertyImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface Property {
  id: string;
  title: string;
  description: string | null;
  type: PropertyType;
  dealType: DealType;
  price: string;
  areaSqm: string | null;
  province: string | null;
  city: string;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  hasSingleDeed: boolean;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
  images: PropertyImage[];
}

export interface PaginatedProperties {
  items: Property[];
  total: number;
  page: number;
  limit: number;
}

export type AdminServiceType =
  | 'SINGLE_DEED'
  | 'OLD_DEED_CONVERSION'
  | 'SURVEY_SSBR'
  | 'SUBDIVISION'
  | 'PURCHASE_SALE_CONSULTATION'
  | 'OTHER';

export type CaseStatus = 'SUBMITTED' | 'DOCUMENT_REVIEW' | 'AGENCY_FOLLOW_UP' | 'COMPLETED' | 'FAILED';

export interface CaseStatusHistoryItem {
  id: string;
  oldStatus: CaseStatus | null;
  newStatus: CaseStatus;
  note: string | null;
  createdAt: string;
}

export interface AdminServiceRequest {
  id: string;
  trackingCode: string;
  serviceType: AdminServiceType;
  status: CaseStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory: CaseStatusHistoryItem[];
}

export interface CaseDocument {
  id: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
}

export interface AdminServiceRequestDetail extends AdminServiceRequest {
  contactMobile: string;
  internalNotes: string | null;
  documents: CaseDocument[];
}

export interface ContactRequest {
  id: string;
  name: string;
  mobile: string;
  message: string;
  isHandled: boolean;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  mobile: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  fullName: string | null;
}

export interface User {
  id: string;
  mobile: string;
  fullName: string | null;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MessageStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface MessageLog {
  id: string;
  mobile: string;
  message: string;
  status: MessageStatus;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  activeProperties: number;
  inProgressCases: number;
  unhandledContacts: number;
  newUsersThisWeek: number;
  recentCases: Array<{
    id: string;
    trackingCode: string;
    serviceType: AdminServiceType;
    status: CaseStatus;
    createdAt: string;
  }>;
  recentContacts: Array<{
    id: string;
    name: string;
    mobile: string;
    isHandled: boolean;
    createdAt: string;
  }>;
}

export interface ContactSettings {
  'contact.phone': string;
  'contact.phoneSecondary': string;
  'contact.whatsapp': string;
  'contact.address': string;
  'contact.workingHours': string;
}

export type SmsTemplates = Record<CaseStatus, string>;

export interface ServiceStatus {
  smsProvider: string;
  storageConfigured: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string | string[];
  statusCode: number;
  path: string;
  timestamp: string;
}
