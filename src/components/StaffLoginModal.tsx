import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Lock, X } from 'lucide-react';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

/**
 * Newsroom sign-in. Google accounts only; access is limited to addresses an administrator
 * added in Users & roles (Firestore `staff` collection) and to the owner accounts.
 */
export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { loginAsStaffWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    opener.current = document.activeElement;
    setError(null);
    setSuccess(null);
    buttonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginAsStaffWithGoogle();
      if (res.success && res.staff) {
        setSuccess(`Signed in as ${res.staff.name} (${ROLE_LABELS[res.staff.role] || res.staff.role}).`);
        setTimeout(() => {
          onLoginSuccess();
          onClose();
        }, 600);
      } else {
        setError(res.error || 'Sign-in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kd-dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="kd-dialog kd-admin" role="dialog" aria-modal="true" aria-labelledby="staff-login-title" lang="en">
        <div className="kd-dialog__head">
          <span className="kd-dialog__icon" aria-hidden="true">
            <Lock size={18} />
          </span>
          <div>
            <h2 id="staff-login-title" className="kd-dialog__title">
              Newsroom sign in
            </h2>
            <p className="kd-dialog__sub">For editors, reporters and administrators</p>
          </div>
          <button type="button" className="kd-iconbtn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="kd-dialog__body">
          {success ? (
            <p className="kd-alert kd-alert--success" role="status">
              {success}
            </p>
          ) : (
            <>
              <button ref={buttonRef} type="button" className="kd-btn kd-btn--secondary kd-btn--block" onClick={handleLogin} disabled={loading}>
                {loading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <GoogleMark />}
                <span>{loading ? 'Signing in…' : 'Sign in with Google'}</span>
              </button>
              {error && (
                <p className="kd-alert kd-alert--error" role="alert">
                  {error}
                </p>
              )}
              <p className="kd-help">
                Only accounts invited by an administrator can open the newsroom. What you can do (write, publish,
                change settings) depends on your role.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
