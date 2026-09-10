/**
 * Active Member Grants Configuration
 * Allows explicit authorization / manual subscription overrides for specific member emails.
 */

export interface MemberGrant {
  customerEmail: string;
  customerName?: string;
  planName: string;
  expiresAt: string;
  note?: string;
}

export const ACTIVE_MEMBER_GRANTS: Record<string, MemberGrant> = {
  "kantornotarissantoanggles@gmail.com": {
    customerEmail: "kantornotarissantoanggles@gmail.com",
    planName: "Paket 1 Bulan (Manual Grant)",
    expiresAt: "2026-10-04T23:59:59.000Z", // Active for 1 Month (30+ Days)
    note: "Granted 1 Month Access by Admin",
  },
  "restudarmaa@gmail.com": {
    customerEmail: "restudarmaa@gmail.com",
    customerName: "Restu Darma Saputra",
    planName: "NotaryGo Akses 3 Bulan",
    expiresAt: "2026-12-08T23:59:59.000Z", // Active for 3 Months (Dec 2026)
    note: "Mayar QRIS Rp 249.000 (Tx: 3f2b5325-8e0b-4148-b9d7-0b3c90350d9e) - Restu Darma Saputra",
  },
  "inamarsina7@gmail.com": {
    customerEmail: "inamarsina7@gmail.com",
    customerName: "INA MARSINA, S.H., M.Kn.",
    planName: "NotaryGo Akses 1 Tahun",
    expiresAt: "2027-09-09T23:59:59.000Z", // Active for 1 Year (until 9 September 2027)
    note: "Granted 1 Year Active Access by Admin for INA MARSINA",
  },
};

export function isEmailGrantActive(email?: string | null): boolean {
  if (!email) return false;
  const grant = ACTIVE_MEMBER_GRANTS[email.toLowerCase().trim()];
  if (!grant) return false;
  return new Date(grant.expiresAt) > new Date();
}

export function getEmailGrant(email?: string | null): MemberGrant | null {
  if (!email) return null;
  const grant = ACTIVE_MEMBER_GRANTS[email.toLowerCase().trim()];
  if (!grant) return null;
  if (new Date(grant.expiresAt) <= new Date()) return null;
  return grant;
}
