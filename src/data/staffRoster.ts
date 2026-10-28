import { StaffProfile } from '../types/claim';

export const DEFAULT_STAFF_ROSTER: StaffProfile[] = [
  {
    id: 'user-admin-1',
    name: 'Accounts Executive',
    staffId: 'EMO-ACC-001',
    email: 'emoacc2@gmail.com',
    department: 'Finance & Administration',
    role: 'accounts_admin',
    active: true,
    avatarColor: 'bg-emerald-500',
    joinedDate: '2023-01-15',
  },
  {
    id: 'user-staff-1',
    name: 'Mohd Haziq bin Ismail',
    staffId: 'EMO-STF-084',
    email: 'haziq@emobooks.com',
    department: 'Sales & Marketing',
    role: 'staff',
    active: true,
    avatarColor: 'bg-amber-500',
    joinedDate: '2024-03-01',
  },
  {
    id: 'user-staff-2',
    name: 'Nur Aishah binti Razali',
    staffId: 'EMO-EDT-022',
    email: 'aishah@emobooks.com',
    department: 'Editorial & Publishing',
    role: 'staff',
    active: true,
    avatarColor: 'bg-blue-500',
    joinedDate: '2023-08-10',
  },
  {
    id: 'user-staff-3',
    name: 'Tan Wei Ming',
    staffId: 'EMO-WHS-015',
    email: 'weiming@emobooks.com',
    department: 'Warehouse & Dispatch',
    role: 'staff',
    active: true,
    avatarColor: 'bg-purple-500',
    joinedDate: '2024-01-20',
  },
  {
    id: 'user-staff-4',
    name: 'Siti Sarah binti Latif',
    staffId: 'EMO-OPS-031',
    email: 'sitisarah@emobooks.com',
    department: 'Operations & Retail',
    role: 'staff',
    active: true,
    avatarColor: 'bg-rose-500',
    joinedDate: '2024-05-12',
  },
  {
    id: 'user-staff-5',
    name: 'Farid bin Zakaria',
    staffId: 'EMO-STF-099',
    email: 'farid@emobooks.com',
    department: 'Sales & Marketing',
    role: 'staff',
    active: true,
    avatarColor: 'bg-teal-500',
    joinedDate: '2024-09-01',
  },
];

const ROSTER_STORAGE_KEY = 'emo_book_services_staff_roster_v1';

export function loadStaffRoster(): StaffProfile[] {
  try {
    const raw = localStorage.getItem(ROSTER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load roster from localStorage:', e);
  }
  return DEFAULT_STAFF_ROSTER;
}

export function saveStaffRoster(roster: StaffProfile[]): void {
  try {
    localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(roster));
  } catch (e) {
    console.error('Failed to save roster to localStorage:', e);
  }
}
