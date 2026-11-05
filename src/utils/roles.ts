/**
 * Newsroom roles, shared by the browser app and the server.
 * Keep these lists identical to the role functions in `firestore.rules`.
 */
import type { StaffRole } from '../types/news';

/** Owner accounts that always have full access (bootstrap; everyone else is invited in Users & roles). */
export const OWNER_EMAILS: readonly string[] = ['khabridost.com@gmail.com', 'khabaridost.com@gmail.com'];

/** Full control: users, ads, settings, integrations. */
export const ADMIN_ROLES: readonly StaffRole[] = ['super_admin'];

/** Can edit any article and publish, schedule or unpublish. */
export const EDITOR_ROLES: readonly StaffRole[] = [...ADMIN_ROLES, 'editor_in_chief', 'senior_editor', 'editor', 'sub_editor'];

/** Any newsroom member: can write drafts, upload media and submit for review. */
export const STAFF_ROLES: readonly StaffRole[] = [
  ...EDITOR_ROLES,
  'reporter',
  'journalist',
  'contributor',
  'fact_checker',
  'seo_manager',
  'analyst',
];

export type RoleLevel = 'staff' | 'editor' | 'admin';

export const isOwnerEmail = (email?: string | null): boolean =>
  !!email && OWNER_EMAILS.includes(email.trim().toLowerCase());

/** True when `role` meets the required level. Owners pass every level. */
export function roleAllows(role: string | null | undefined, level: RoleLevel, email?: string | null): boolean {
  if (isOwnerEmail(email)) return true;
  if (!role) return false;
  const list = level === 'admin' ? ADMIN_ROLES : level === 'editor' ? EDITOR_ROLES : STAFF_ROLES;
  return (list as readonly string[]).includes(role);
}

export const ROLE_LABELS: Record<StaffRole, string> = {
  super_admin: 'Administrator',
  editor_in_chief: 'Editor-in-chief',
  senior_editor: 'Senior editor',
  editor: 'Editor',
  sub_editor: 'Sub-editor',
  reporter: 'Reporter',
  journalist: 'Journalist',
  contributor: 'Contributor',
  fact_checker: 'Fact-checker',
  seo_manager: 'SEO manager',
  analyst: 'Analyst',
};

/** Firestore document id for a staff record: the lower-cased email. */
export const staffDocId = (email: string) => email.trim().toLowerCase();
