import type {
  AdminServiceRequest,
  AdminServiceRequestDetail,
  AuthUser,
  CaseStatus,
  ContactRequest,
  ContactSettings,
  DashboardSummary,
  MessageLog,
  MessageStatus,
  PaginatedProperties,
  Property,
  PropertyImage,
  ServiceStatus,
  SmsTemplates,
  User,
} from '@/types';
import { TOKEN_COOKIE } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

interface RequestOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const isFormData = rest.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.success) {
    if ((response.status === 401 || response.status === 403) && token && typeof document !== 'undefined') {
      // Stale/expired token — drop it so middleware sends the next /admin/* visit back to /login.
      document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
    }
    const message = Array.isArray(body?.message) ? body.message.join(' ') : body?.message;
    throw new ApiRequestError(message ?? 'خطا در ارتباط با سرور', response.status);
  }

  return body.data as T;
}

function buildQuery(filters: object): string {
  const params = new URLSearchParams();
  Object.entries(filters as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export interface PropertyFilters {
  type?: string;
  dealType?: string;
  province?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export function listProperties(filters: PropertyFilters = {}): Promise<PaginatedProperties> {
  return apiFetch<PaginatedProperties>(`/properties${buildQuery(filters)}`, {
    cache: 'no-store',
  });
}

export function getProperty(id: string): Promise<Property> {
  return apiFetch<Property>(`/properties/${id}`, { cache: 'no-store' });
}

export function createProperty(token: string, data: Record<string, unknown>): Promise<Property> {
  return apiFetch<Property>('/properties', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export function updateProperty(
  token: string,
  id: string,
  data: Record<string, unknown>,
): Promise<Property> {
  return apiFetch<Property>(`/properties/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    token,
  });
}

export function archiveProperty(token: string, id: string): Promise<Property> {
  return apiFetch<Property>(`/properties/${id}`, { method: 'DELETE', token });
}

export function uploadPropertyImage(token: string, id: string, file: File): Promise<PropertyImage> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch(`/properties/${id}/images`, { method: 'POST', body: formData, token });
}

export function deletePropertyImage(token: string, propertyId: string, imageId: string): Promise<void> {
  return apiFetch(`/properties/${propertyId}/images/${imageId}`, { method: 'DELETE', token });
}

export function reorderPropertyImages(
  token: string,
  propertyId: string,
  imageIds: string[],
): Promise<PropertyImage[]> {
  return apiFetch(`/properties/${propertyId}/images/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ imageIds }),
    token,
  });
}

export interface AdminPropertyFilters extends PropertyFilters {
  status?: string;
}

export function listAdminProperties(
  token: string,
  filters: AdminPropertyFilters = {},
): Promise<PaginatedProperties> {
  return apiFetch(`/properties/admin/list${buildQuery(filters)}`, { token, cache: 'no-store' });
}

export function getAdminProperty(token: string, id: string): Promise<Property> {
  return apiFetch(`/properties/admin/${id}`, { token, cache: 'no-store' });
}

export function requestOtp(mobile: string): Promise<{ ttlSeconds: number }> {
  return apiFetch('/auth/otp/request', { method: 'POST', body: JSON.stringify({ mobile }) });
}

export function verifyOtp(mobile: string, code: string): Promise<{ accessToken: string; user: AuthUser }> {
  return apiFetch('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ mobile, code }) });
}

export function submitAdminServiceRequest(formData: FormData): Promise<AdminServiceRequest> {
  return apiFetch('/admin-service-requests', { method: 'POST', body: formData });
}

export function trackCase(code: string): Promise<AdminServiceRequest> {
  return apiFetch(`/admin-service-requests/track/${encodeURIComponent(code)}`, { cache: 'no-store' });
}

export function listAdminServiceRequests(
  token: string,
  status?: string,
  serviceType?: string,
): Promise<AdminServiceRequest[]> {
  return apiFetch(`/admin-service-requests${buildQuery({ status, serviceType })}`, {
    token,
    cache: 'no-store',
  });
}

export function getCaseDetail(token: string, id: string): Promise<AdminServiceRequestDetail> {
  return apiFetch(`/admin-service-requests/${id}`, { token, cache: 'no-store' });
}

export function previewCaseSms(
  token: string,
  id: string,
  status: CaseStatus,
): Promise<{ message: string }> {
  return apiFetch(`/admin-service-requests/${id}/sms-preview${buildQuery({ status })}`, { token });
}

export function updateCaseStatus(
  token: string,
  id: string,
  status: string,
  note?: string,
): Promise<AdminServiceRequest> {
  return apiFetch(`/admin-service-requests/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
    token,
  });
}

export function updateCaseInternalNotes(
  token: string,
  id: string,
  internalNotes: string,
): Promise<AdminServiceRequestDetail> {
  return apiFetch(`/admin-service-requests/${id}/internal-notes`, {
    method: 'PATCH',
    body: JSON.stringify({ internalNotes }),
    token,
  });
}

export function submitContactRequest(data: {
  name: string;
  mobile: string;
  message: string;
}): Promise<ContactRequest> {
  return apiFetch('/contact-requests', { method: 'POST', body: JSON.stringify(data) });
}

export function listContactRequests(token: string): Promise<ContactRequest[]> {
  return apiFetch('/contact-requests', { token, cache: 'no-store' });
}

export function markContactHandled(token: string, id: string): Promise<ContactRequest> {
  return apiFetch(`/contact-requests/${id}/handled`, { method: 'PATCH', token });
}

export function listSmsLogs(token: string, status?: MessageStatus): Promise<MessageLog[]> {
  return apiFetch(`/notifications/logs${buildQuery({ status })}`, { token, cache: 'no-store' });
}

export function resendSms(token: string, id: string): Promise<MessageLog> {
  return apiFetch(`/notifications/logs/${id}/resend`, { method: 'POST', token });
}

export function getDashboardSummary(token: string): Promise<DashboardSummary> {
  return apiFetch('/dashboard/summary', { token, cache: 'no-store' });
}

export function listUsers(token: string): Promise<User[]> {
  return apiFetch('/users', { token, cache: 'no-store' });
}

export function updateUserRole(token: string, id: string, role: string): Promise<User> {
  return apiFetch(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }), token });
}

export function setUserActive(token: string, id: string, isActive: boolean): Promise<User> {
  return apiFetch(`/users/${id}/active`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
    token,
  });
}

export function getPublicSettings(): Promise<ContactSettings> {
  return apiFetch('/settings/public', { cache: 'no-store' });
}

export function getSmsTemplates(token: string): Promise<SmsTemplates> {
  return apiFetch('/settings/sms-templates', { token, cache: 'no-store' });
}

export function updateSmsTemplate(
  token: string,
  status: CaseStatus,
  template: string,
): Promise<SmsTemplates> {
  return apiFetch('/settings/sms-templates', {
    method: 'PATCH',
    body: JSON.stringify({ status, template }),
    token,
  });
}

export function updateContactSettings(
  token: string,
  data: Partial<ContactSettings>,
): Promise<ContactSettings> {
  return apiFetch('/settings/contact', { method: 'PATCH', body: JSON.stringify(data), token });
}

export function getServiceStatus(token: string): Promise<ServiceStatus> {
  return apiFetch('/settings/service-status', { token, cache: 'no-store' });
}
