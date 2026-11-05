import React, { useState } from 'react';
import { useNewsroom, PageHead, Field, Denied } from './context';
import { ROLE_LABELS, staffDocId, isOwnerEmail } from '../../utils/roles';
import type { EditorialUser, StaffRole } from '../../types/news';

const ROLE_HELP: Record<string, string> = {
  super_admin: 'Everything, including users, ads and settings.',
  editor_in_chief: 'Edit and publish any article, read the inbox.',
  senior_editor: 'Edit and publish any article, read the inbox.',
  editor: 'Edit and publish any article, read the inbox.',
  sub_editor: 'Edit and publish any article, read the inbox.',
  reporter: 'Write own drafts and submit them for review.',
  journalist: 'Write own drafts and submit them for review.',
  contributor: 'Write own drafts and submit them for review.',
  fact_checker: 'Write own drafts and submit them for review.',
  seo_manager: 'Write own drafts and submit them for review.',
  analyst: 'Write own drafts and submit them for review.',
};

/** Users & roles: who can open the newsroom. Access is enforced by Firestore rules. */
export const Users: React.FC = () => {
  const { staff, addStaff, updateStaff, deleteStaff, me } = useNewsroom();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffRole>('reporter');
  const [err, setErr] = useState('');
  if (!me.isAdmin) return <Denied what="managing users" />;

  const roles = (Object.keys(ROLE_LABELS) as StaffRole[]).filter((r) => r !== 'super_admin' || me.isOwner);

  const invite = (e: React.FormEvent) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) return setErr('Enter a valid Google account email.');
    if (staff.some((s) => s.id === staffDocId(em))) return setErr('This person is already on the list.');
    if (!name.trim()) return setErr('Enter the person’s name.');
    addStaff({ email: em, name: name.trim(), role, status: 'active', articlesCount: 0 } as Omit<EditorialUser, 'id' | 'joinedAt'>);
    setEmail('');
    setName('');
    setErr('');
  };

  return (
    <div className="kd-nr__page">
      <PageHead title="Users & roles" sub="People sign in with the Google account for their email. What they can do is enforced by the database rules." />
      <form className="kd-panel kd-form kd-form--2" onSubmit={invite} aria-labelledby="inv">
        <h2 id="inv" className="kd-span">
          Add a newsroom member
        </h2>
        <Field label="Google account email" id="u-email">
          <input id="u-email" className="kd-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
        </Field>
        <Field label="Name" id="u-name">
          <input id="u-name" className="kd-input" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Role" id="u-role" help={ROLE_HELP[role]}>
          <select id="u-role" className="kd-select" value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
            {roles.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </Field>
        <div className="kd-field" style={{ alignContent: 'end' }}>
          <button type="submit" className="kd-btn kd-btn--primary">
            Add member
          </button>
        </div>
        {err && (
          <p className="kd-field__err kd-span" role="alert">
            {err}
          </p>
        )}
      </form>

      <div className="kd-table-wrap">
        <table className="kd-table">
          <thead>
            <tr>
              <th scope="col">Member</th>
              <th scope="col">Role</th>
              <th scope="col">Access</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 && (
              <tr>
                <td colSpan={4}>No members yet. Owner accounts always have access.</td>
              </tr>
            )}
            {staff.map((u) => {
              const protectedAdmin = u.role === 'super_admin' && !me.isOwner;
              const self = u.id === staffDocId(me.email);
              return (
                <tr key={u.id}>
                  <td>
                    {u.name}
                    <span className="kd-table__sub">{u.email || u.id}</span>
                  </td>
                  <td>
                    <label className="sr-only" htmlFor={`role-${u.id}`}>
                      Role for {u.name}
                    </label>
                    <select
                      id={`role-${u.id}`}
                      className="kd-select"
                      value={u.role}
                      disabled={protectedAdmin || self}
                      onChange={(e) => updateStaff({ id: u.id, role: e.target.value as StaffRole })}
                    >
                      {(Object.keys(ROLE_LABELS) as StaffRole[])
                        .filter((r) => r !== 'super_admin' || me.isOwner || u.role === 'super_admin')
                        .map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td>
                    <label className="kd-check">
                      <input
                        type="checkbox"
                        checked={u.status === 'active'}
                        disabled={protectedAdmin || self}
                        onChange={(e) => updateStaff({ id: u.id, status: e.target.checked ? 'active' : 'suspended' })}
                      />
                      <span>{u.status === 'active' ? 'Active' : 'Suspended'}</span>
                    </label>
                  </td>
                  <td>
                    {!protectedAdmin && !self && (
                      <button type="button" className="kd-btn kd-btn--danger kd-btn--sm" onClick={() => window.confirm(`Remove ${u.name}?`) && deleteStaff(u.id)}>
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="kd-help">
        Owner accounts{isOwnerEmail(me.email) ? ' (including yours)' : ''} always have full access. Only owners can create or change administrators.
      </p>
    </div>
  );
};
