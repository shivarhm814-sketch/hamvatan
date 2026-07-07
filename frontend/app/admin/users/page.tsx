'use client';

import { useEffect, useState } from 'react';
import { listUsers, setUserActive, updateUserRole } from '@/lib/api';
import { getAuthToken, getCurrentUserRole } from '@/lib/auth';
import type { User } from '@/types';
import { toFa } from '@/lib/utils';

const ROLE_OPTIONS: { value: User['role']; label: string }[] = [
  { value: 'CUSTOMER', label: 'مشتری' },
  { value: 'STAFF', label: 'کارمند' },
  { value: 'ADMIN', label: 'ادمین' },
];

function formatDate(iso: string): string {
  return toFa(new Date(iso).toLocaleDateString('fa-IR'));
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const canChangeRole = getCurrentUserRole() === 'ADMIN';

  const load = () => {
    const token = getAuthToken();
    if (!token) return;
    setLoading(true);
    listUsers(token)
      .then(setUsers)
      .catch(() => setError('خطا در بارگذاری کاربران.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (id: string, role: User['role']) => {
    const token = getAuthToken();
    if (!token) return;
    setBusyId(id);
    try {
      const updated = await updateUserRole(token, id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch {
      setError('خطا در تغییر نقش کاربر.');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (user: User) => {
    const token = getAuthToken();
    if (!token) return;
    setBusyId(user.id);
    try {
      const updated = await setUserActive(token, user.id, !user.isActive);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    } catch {
      setError('خطا در تغییر وضعیت دسترسی کاربر.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink">کاربران</h1>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      {loading ? (
        <p className="text-muted">در حال بارگذاری...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full text-right text-sm">
            <thead className="bg-soft text-muted">
              <tr>
                <th className="p-4">شماره موبایل</th>
                <th className="p-4">نقش</th>
                <th className="p-4">تاریخ ثبت‌نام</th>
                <th className="p-4">وضعیت</th>
                <th className="p-4">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-line">
                  <td dir="ltr" className="p-4 text-left font-semibold text-ink">
                    {user.mobile}
                  </td>
                  <td className="p-4">
                    {canChangeRole ? (
                      <select
                        value={user.role}
                        disabled={busyId === user.id}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as User['role'])}
                        className="rounded-[8px] border border-line bg-bg px-3 py-1.5 text-xs"
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-primary">
                        {ROLE_OPTIONS.find((r) => r.value === user.role)?.label}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-muted">{formatDate(user.createdAt)}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        user.isActive ? 'bg-sale text-white' : 'bg-error text-white'
                      }`}
                    >
                      {user.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(user)}
                      disabled={busyId === user.id}
                      className="rounded-full border border-line px-4 py-1.5 text-xs font-bold text-ink disabled:opacity-60"
                    >
                      {user.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
