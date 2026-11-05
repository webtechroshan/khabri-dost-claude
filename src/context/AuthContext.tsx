import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, testConnection } from '../firebase';
import { UserProfile, EditorialUser, StaffRole } from '../types/news';
import { OWNER_EMAILS, ROLE_LABELS, isOwnerEmail, roleAllows, staffDocId } from '../utils/roles';

export { ROLE_LABELS };

/** First owner address, shown in help text. */
export const ADMIN_EMAIL = OWNER_EMAILS[0];

export const isPlatformAdminEmail = isOwnerEmail;

/**
 * The signed-in newsroom member. It is always derived from a verified Google account plus the
 * `staff/{email}` record an administrator created; nothing is trusted from localStorage.
 */
export interface StaffAuthSession {
  email: string;
  name: string;
  role: StaffRole;
  photoURL?: string;
  loginMethod: 'google';
  loggedAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  staffSession: StaffAuthSession | null;
  /** Any newsroom role (reporter and above). */
  isStaff: boolean;
  /** Editors and administrators: may edit any article and publish. */
  isEditor: boolean;
  /** Administrators: users, ads, settings. */
  isAdmin: boolean;
  /** Kept for older components: same as isStaff. */
  isReporter: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginAsStaffWithGoogle: () => Promise<{ success: boolean; error?: string; staff?: StaffAuthSession }>;
  logoutStaff: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  staffSession: null,
  isStaff: false,
  isEditor: false,
  isAdmin: false,
  isReporter: false,
  loading: true,
  signInWithGoogle: async () => {},
  loginAsStaffWithGoogle: async () => ({ success: false }),
  logoutStaff: async () => {},
  logout: async () => {},
});

const STAFF_COLLECTION = 'staff';

function sessionFor(user: User, record: EditorialUser | null): StaffAuthSession | null {
  if (!user.email || !user.emailVerified) return null;
  if (isOwnerEmail(user.email)) {
    return {
      email: user.email,
      name: user.displayName || record?.name || 'Administrator',
      role: 'super_admin',
      photoURL: user.photoURL || undefined,
      loginMethod: 'google',
      loggedAt: new Date().toISOString(),
    };
  }
  if (!record || record.status !== 'active' || !roleAllows(record.role, 'staff')) return null;
  return {
    email: user.email,
    name: record.name || user.displayName || user.email,
    role: record.role,
    photoURL: user.photoURL || record.photoURL || undefined,
    loginMethod: 'google',
    loggedAt: new Date().toISOString(),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [staffRecord, setStaffRecord] = useState<EditorialUser | null>(null);
  /** Email whose staff record has been loaded (prevents a stale 'loaded' flag right after sign-in). */
  const [staffLoadedFor, setStaffLoadedFor] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    testConnection();
    // Older versions kept staff sessions and lists in the browser. They are no longer trusted.
    try {
      localStorage.removeItem('kd_staff_session');
      localStorage.removeItem('kd_editorial_users');
    } catch {}
  }, []);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        setAuthLoaded(true);
        if (!currentUser) {
          setUserProfile(null);
          return;
        }
        // Reader profile (role is never set from the browser).
        try {
          const ref = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            const profile: UserProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || 'पाठक',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || '',
              role: 'reader',
              createdAt: new Date().toISOString(),
            };
            await setDoc(ref, profile);
            setUserProfile(profile);
          }
        } catch {
          setUserProfile(null);
        }
      }),
    []
  );

  // Live staff record: role changes and suspensions take effect immediately.
  useEffect(() => {
    if (!user?.email) {
      setStaffRecord(null);
      setStaffLoadedFor(null);
      return;
    }
    const email = user.email;
    return onSnapshot(
      doc(db, STAFF_COLLECTION, staffDocId(user.email)),
      (snap) => {
        setStaffRecord(snap.exists() ? ({ ...(snap.data() as EditorialUser), id: snap.id }) : null);
        setStaffLoadedFor(email);
      },
      () => {
        setStaffRecord(null);
        setStaffLoadedFor(email);
      }
    );
  }, [user?.email]);

  const staffSession = user && staffLoadedFor === user.email ? sessionFor(user, staffRecord) : null;
  const role = staffSession?.role;
  const isStaff = !!staffSession;
  const isEditor = isStaff && roleAllows(role, 'editor');
  const isAdmin = isStaff && roleAllows(role, 'admin');

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        console.warn('Google sign-in failed:', error?.code || error);
      }
    }
  };

  const loginAsStaffWithGoogle = async (): Promise<{ success: boolean; error?: string; staff?: StaffAuthSession }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      if (!email) {
        await signOut(auth);
        return { success: false, error: 'This Google account has no email address.' };
      }
      let record: EditorialUser | null = null;
      if (!isOwnerEmail(email)) {
        try {
          const snap = await getDoc(doc(db, STAFF_COLLECTION, staffDocId(email)));
          record = snap.exists() ? (snap.data() as EditorialUser) : null;
        } catch {
          record = null;
        }
      }
      const session = sessionFor(result.user, record);
      if (!session) {
        await signOut(auth);
        return {
          success: false,
          error: `${email} is not an active newsroom member. Ask an administrator to invite this address in Users & roles.`,
        };
      }
      return { success: true, staff: session };
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') return { success: false, error: 'The sign-in window was closed.' };
      return { success: false, error: 'Google sign-in failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('Sign-out failed:', error);
    }
    setUser(null);
    setUserProfile(null);
    setStaffRecord(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        staffSession,
        isStaff,
        isEditor,
        isAdmin,
        isReporter: isStaff,
        loading: !authLoaded || (!!user && staffLoadedFor !== user.email),
        signInWithGoogle,
        loginAsStaffWithGoogle,
        logoutStaff: logout,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
