import React, { useState, useRef } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Mail,
  Calendar,
  FileText,
  Camera,
  Upload,
  Check,
  Sparkles,
  LayoutGrid,
  List,
  Search,
  Key,
  Sliders,
  Eye,
  Tag,
  MapPin,
  Phone,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { EditorialUser, StaffRole, StaffPermissions, NewsCategory } from '../../types/news';
import { compressImage } from '../../utils/imageCompressor';
import { CATEGORIES, MAJOR_INDIAN_STATES } from '../../data/seedNews';

interface UserManagementTabProps {
  users: EditorialUser[];
  onAddUser: (user: Omit<EditorialUser, 'id' | 'joinedAt'>) => void;
  onUpdateUser: (user: Partial<EditorialUser> & { id: string }) => void;
  onDeleteUser: (id: string) => void;
  isSuperAdmin?: boolean;
}

const PRESET_AVATARS = [
  { label: 'Avatar 1 (Male 1)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { label: 'Avatar 2 (Female 1)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80' },
  { label: 'Avatar 3 (Male 2)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { label: 'Avatar 4 (Female 2)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  { label: 'Avatar 5 (Male 3)', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80' },
  { label: 'Avatar 6 (Male 4)', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80' },
  { label: 'Avatar 7 (Male 5)', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80' },
  { label: 'Avatar 8 (Female 3)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
];

export const ROLE_LABELS: Record<StaffRole, { label: string; badge: string; desc: string }> = {
  super_admin: {
    label: 'Super Admin',
    badge: 'bg-red-50 text-red-700 border-red-200',
    desc: 'Unrestricted portal control: user management, global settings, monetization, and security overrides.',
  },
  editor_in_chief: {
    label: 'Editor-in-Chief',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    desc: 'Highest editorial authority: approve all drafts, assign lead stories, and control breaking news.',
  },
  editor: {
    label: 'Editor',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    desc: 'Editorial desk review, live news publishing, and homepage layout customization.',
  },
  sub_editor: {
    label: 'Sub-Editor',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    desc: 'Desk editor: copy-edit reporter submissions, moderate categories, and proofread content.',
  },
  senior_editor: {
    label: 'Senior Editor',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    desc: 'Senior editorial review, direct category governance, and special investigations.',
  },
  reporter: {
    label: 'Reporter',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    desc: 'Field reporting: compose new articles, upload ground photos/videos, and submit drafts for editorial review.',
  },
  journalist: {
    label: 'Journalist',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    desc: 'Bureau reporting, feature writing, and ground news coverage.',
  },
  contributor: {
    label: 'Contributor / Columnist',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    desc: 'Submit guest columns and opinion essays for editorial review. Direct live publishing restricted.',
  },
  seo_manager: {
    label: 'SEO Manager',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    desc: 'Meta tags, XML sitemap pinging, Google Search Console, and search ranking optimization.',
  },
  analyst: {
    label: 'Data Analyst',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    desc: 'Audience readership analytics, Core Web Vitals, and portal performance reporting.',
  },
  fact_checker: {
    label: 'Fact Checker',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    desc: 'Verification of viral claims, photo/video forensics, and misinformation flagging.',
  },
};

const DEFAULT_PERMISSIONS_BY_ROLE: Record<StaffRole, StaffPermissions> = {
  super_admin: {
    canPublishDirectly: true,
    canEditAllArticles: true,
    canDeleteArticles: true,
    canAccessMediaLibrary: true,
    canAccessSEO: true,
    canAccessSettings: true,
    canManageUsers: true,
    canManageMonetization: true,
    allowedCategories: [],
  },
  editor_in_chief: {
    canPublishDirectly: true,
    canEditAllArticles: true,
    canDeleteArticles: true,
    canAccessMediaLibrary: true,
    canAccessSEO: true,
    canAccessSettings: true,
    canManageUsers: true,
    canManageMonetization: false,
    allowedCategories: [],
  },
  editor: {
    canPublishDirectly: true,
    canEditAllArticles: true,
    canDeleteArticles: true,
    canAccessMediaLibrary: true,
    canAccessSEO: true,
    canAccessSettings: false,
    canManageUsers: false,
    canManageMonetization: false,
    allowedCategories: [],
  },
  sub_editor: {
    canPublishDirectly: true,
    canEditAllArticles: true,
    canDeleteArticles: false,
    canAccessMediaLibrary: true,
    canAccessSEO: true,
    canAccessSettings: false,
    canManageUsers: false,
    canManageMonetization: false,
    allowedCategories: [],
  },
  senior_editor: {
    canPublishDirectly: true,
    canEditAllArticles: true,
    canDeleteArticles: false,
    canAccessMediaLibrary: true,
    canAccessSEO: true,
    canAccessSettings: false,
    canManageUsers: false,
    canManageMonetization: false,
    allowedCategories: [],
  },
  reporter: {
    canPublishDirectly: false, // Requires editorial review
    canEditAllArticles: false, // Own articles only
    canDeleteArticles: false,
    canAccessMediaLibrary: true,
    canAccessSEO: false,
    canAccessSettings: false,
    canManageUsers: false,
    canManageMonetization: false,
    allowedCategories: [],
  },
  journalist: {
    canPublishDirectly: false,
    canEditAllArticles: false,
    canDeleteArticles: false,
    canAccessMediaLibrary: true,
    canAccessSEO: false,
    canAccessSettings: false,
    canManageUsers: false,
    canManageMonetization: false,
    allowedCategories: [],
  },
  contributor: {
    canPublishDirectly: false,
    canEditAllArticles: false,
    canDeleteArticles: false,
    canAccessMediaLibrary: false,
    canAccessSEO: false,
    canAccessSettings: false,
    canManageUsers: false,
    canManageMonetization: false,
    allowedCategories: [],
  },
  seo_manager: {
    canPublishDirectly: false,
    canEditAllArticles: true,
    canDeleteArticles: false,
    canAccessMediaLibrary: true,
    canAccessSEO: true,
    canAccessSettings: false,
    canManageUsers: false,
    canManageMonetization: false,
    allowedCategories: [],
  },
  analyst: {
    canPublishDirectly: false,
    canEditAllArticles: false,
    canDeleteArticles: false,
    canAccessMediaLibrary: false,
    canAccessSEO: false,
    canAccessSettings: false,
    canManageUsers: false,
    canManageMonetization: false,
    allowedCategories: [],
  },
  fact_checker: {
    canPublishDirectly: false,
    canEditAllArticles: false,
    canDeleteArticles: false,
    canAccessMediaLibrary: true,
    canAccessSEO: false,
    canAccessSettings: false,
    canManageUsers: false,
    canManageMonetization: false,
    allowedCategories: [],
  },
};

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  isSuperAdmin = true,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<EditorialUser | null>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'matrix'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Add Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('sub_editor');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [accessPin, setAccessPin] = useState('1234');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('संपादकीय डेस्क (Editorial Desk)');
  const [permissions, setPermissions] = useState<StaffPermissions>(DEFAULT_PERMISSIONS_BY_ROLE.sub_editor);
  const [assignedCategories, setAssignedCategories] = useState<NewsCategory[]>([]);
  const [assignedStates, setAssignedStates] = useState<string[]>([]);

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<StaffRole>('sub_editor');
  const [editBio, setEditBio] = useState('');
  const [editPhotoURL, setEditPhotoURL] = useState('');
  const [editAccessPin, setEditAccessPin] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editPermissions, setEditPermissions] = useState<StaffPermissions>(DEFAULT_PERMISSIONS_BY_ROLE.sub_editor);
  const [editAssignedCategories, setEditAssignedCategories] = useState<NewsCategory[]>([]);
  const [editAssignedStates, setEditAssignedStates] = useState<string[]>([]);

  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // When changing role in Add modal, auto-populate recommended permissions
  const handleRoleChangeInAdd = (newRole: StaffRole) => {
    setRole(newRole);
    setPermissions(DEFAULT_PERMISSIONS_BY_ROLE[newRole] || DEFAULT_PERMISSIONS_BY_ROLE.sub_editor);
  };

  const handleRoleChangeInEdit = (newRole: StaffRole) => {
    setEditRole(newRole);
    setEditPermissions(DEFAULT_PERMISSIONS_BY_ROLE[newRole] || DEFAULT_PERMISSIONS_BY_ROLE.sub_editor);
  };

  // Open edit modal
  const openEditModal = (staff: EditorialUser) => {
    setEditingUser(staff);
    setEditName(staff.name);
    setEditEmail(staff.email);
    setEditRole(staff.role);
    setEditBio(staff.bio || '');
    setEditPhotoURL(
      staff.photoURL ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
    );
    setEditAccessPin(staff.accessPin || '1234');
    setEditPhone(staff.phone || '');
    setEditDepartment(staff.department || 'संपादकीय डेस्क');
    setEditPermissions(
      staff.permissions || DEFAULT_PERMISSIONS_BY_ROLE[staff.role] || DEFAULT_PERMISSIONS_BY_ROLE.sub_editor
    );
    setEditAssignedCategories(staff.assignedCategories || []);
    setEditAssignedStates(staff.assignedStates || []);
  };

  // Handle Photo upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const res = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85,
        format: 'image/webp',
      });
      if (isEdit) {
        setEditPhotoURL(res.dataUrl);
      } else {
        setPhotoURL(res.dataUrl);
      }
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  // Submit Add form
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onAddUser({
      name: name.trim(),
      email: email.trim(),
      role,
      status: 'active',
      bio: bio.trim(),
      photoURL:
        photoURL.trim() ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      articlesCount: 0,
      lastLogin: 'Never',
      permissions: {
        ...permissions,
        allowedCategories: assignedCategories,
      },
      phone: phone.trim() || undefined,
      department: department.trim() || undefined,
      assignedCategories,
      assignedStates,
    });

    // Reset Form
    setName('');
    setEmail('');
    setBio('');
    setPhotoURL('');
    setPhone('');
    setAccessPin('1234');
    setAssignedCategories([]);
    setAssignedStates([]);
    setShowAddModal(false);

    setActionSuccessMsg(`नया उपयोगकर्ता '${name.trim()}' (${ROLE_LABELS[role]?.label}) सफलतापूर्वक जोड़ा गया!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Submit Edit form
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editName.trim() || !editEmail.trim()) return;

    onUpdateUser({
      id: editingUser.id,
      name: editName.trim(),
      email: editEmail.trim(),
      role: editRole,
      bio: editBio.trim(),
      photoURL:
        editPhotoURL.trim() ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      permissions: {
        ...editPermissions,
        allowedCategories: editAssignedCategories,
      },
      phone: editPhone.trim() || undefined,
      department: editDepartment.trim() || undefined,
      assignedCategories: editAssignedCategories,
      assignedStates: editAssignedStates,
    });

    setEditingUser(null);
    setActionSuccessMsg(`उपयोगकर्ता '${editName.trim()}' के अधिकार व प्रोफ़ाइल सफलतापूर्वक अपडेट किए गए!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Filtered staff list
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (selectedRoleFilter === 'sub_editor') return u.role === 'sub_editor';
    if (selectedRoleFilter === 'reporter') return u.role === 'reporter' || u.role === 'journalist';
    if (selectedRoleFilter === 'editor') return u.role === 'editor' || u.role === 'senior_editor' || u.role === 'editor_in_chief';
    if (selectedRoleFilter === 'contributor') return u.role === 'contributor';
    if (selectedRoleFilter === 'super_admin') return u.role === 'super_admin';

    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-kd-meta">
      {/* Top Heading Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-md">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-kd-headline">
                Advance Level User Role Management
              </h2>
              <span className="text-xs font-mono bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200 font-bold">
                {users.length} Active Staff
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Super-Admin access control: Create Sub-Editor, Reporter, Editor &amp; Contributor accounts with restricted permissions and category beats.
            </p>
          </div>
        </div>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => {
              setRole('sub_editor');
              setPermissions(DEFAULT_PERMISSIONS_BY_ROLE.sub_editor);
              setShowAddModal(true);
            }}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-md cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Create Sub-Editor / Reporter</span>
          </button>
        )}
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Role Quick Filter Pills Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Quick Filter Buttons */}
          <div className="flex items-center flex-wrap gap-1.5">
            {[
              { id: 'all', label: `All Staff (${users.length})` },
              { id: 'sub_editor', label: `Sub-Editors (${users.filter((u) => u.role === 'sub_editor').length})`, icon: '✏️' },
              { id: 'reporter', label: `Reporters (${users.filter((u) => u.role === 'reporter' || u.role === 'journalist').length})`, icon: '🎙️' },
              { id: 'editor', label: `Editors (${users.filter((u) => u.role === 'editor' || u.role === 'senior_editor' || u.role === 'editor_in_chief').length})`, icon: '📰' },
              { id: 'contributor', label: `Contributors (${users.filter((u) => u.role === 'contributor').length})`, icon: '✍️' },
              { id: 'super_admin', label: `Admins (${users.filter((u) => u.role === 'super_admin').length})`, icon: '🛡️' },
            ].map((rf) => (
              <button
                key={rf.id}
                type="button"
                onClick={() => setSelectedRoleFilter(rf.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                  selectedRoleFilter === rf.id
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{rf.label}</span>
              </button>
            ))}
          </div>

          {/* View Mode Switcher */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
                viewMode === 'grid' ? 'bg-white text-red-600 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
                viewMode === 'table' ? 'bg-white text-red-600 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
                viewMode === 'matrix' ? 'bg-white text-red-600 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Permissions Matrix</span>
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="नाम, ईमेल, पद (Role) अथवा ब्यूरो से खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
          />
        </div>
      </div>

      {/* VIEW 1: GRID CARDS VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((staff) => {
            const roleMeta = ROLE_LABELS[staff.role] || ROLE_LABELS.sub_editor;
            const staffPerms = staff.permissions || DEFAULT_PERMISSIONS_BY_ROLE[staff.role] || DEFAULT_PERMISSIONS_BY_ROLE.sub_editor;

            return (
              <div
                key={staff.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-4 space-y-3.5 shadow-2xs transition flex flex-col justify-between"
              >
                <div>
                  {/* Top user row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={staff.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                        alt={staff.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0 bg-slate-100"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{staff.name}</h4>
                        <p className="text-[11px] text-slate-500 font-mono truncate">{staff.email}</p>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 ${roleMeta.badge}`}>
                          {roleMeta.label.split('(')[0].trim()}
                        </span>
                      </div>
                    </div>

                    {/* Status badge toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        const newStatus = staff.status === 'active' ? 'suspended' : 'active';
                        onUpdateUser({ id: staff.id, status: newStatus });
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase transition cursor-pointer shrink-0 ${
                        staff.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                      title="Click to toggle Active / Suspended"
                    >
                      {staff.status}
                    </button>
                  </div>

                  {/* Bureau & Department */}
                  {staff.department && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center gap-1.5 mt-2">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{staff.department}</span>
                    </div>
                  )}

                  {/* Quick Restricted Permissions Badges */}
                  <div className="space-y-1.5 pt-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Restricted Access Scope:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center space-x-1 ${
                          staffPerms.canPublishDirectly
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <span>{staffPerms.canPublishDirectly ? '✓ Live Publish' : '⏳ Review Required'}</span>
                      </span>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          staffPerms.canEditAllArticles
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {staffPerms.canEditAllArticles ? 'Edit Any Post' : 'Own Posts Only'}
                      </span>

                      {staffPerms.canAccessSEO && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          SEO Editor
                        </span>
                      )}

                      {staffPerms.canAccessSettings && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          Settings
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Assigned Categories & States */}
                  {staff.assignedCategories && staff.assignedCategories.length > 0 && (
                    <div className="text-[10px] text-slate-500 pt-1 flex items-center gap-1 flex-wrap">
                      <span className="font-bold text-slate-700">Beats:</span>
                      {staff.assignedCategories.map((c) => (
                        <span key={c} className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold uppercase">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {staff.assignedStates && staff.assignedStates.length > 0 && (
                    <div className="text-[10px] text-slate-500 pt-0.5 flex items-center gap-1 flex-wrap">
                      <span className="font-bold text-red-700 flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" /> States:
                      </span>
                      {staff.assignedStates.map((st) => (
                        <span key={st} className="bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.2 rounded font-semibold">
                          {st}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-xs text-slate-500">Google sign-in</div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(staff)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 transition cursor-pointer font-bold flex items-center space-x-1 text-xs"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Roles</span>
                    </button>

                    {isSuperAdmin && staff.role !== 'super_admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove staff member ${staff.name}?`)) {
                            onDeleteUser(staff.id);
                          }
                        }}
                        className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: DETAILED TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200 tracking-wider">
              <tr>
                <th className="p-3">Staff / Author</th>
                <th className="p-3">Role</th>
                <th className="p-3">Direct Publish</th>
                <th className="p-3">Edit Scope</th>
                <th className="p-3">Assigned Beats</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredUsers.map((staff) => {
                const roleMeta = ROLE_LABELS[staff.role] || ROLE_LABELS.sub_editor;
                const perms = staff.permissions || DEFAULT_PERMISSIONS_BY_ROLE[staff.role] || DEFAULT_PERMISSIONS_BY_ROLE.sub_editor;

                return (
                  <tr key={staff.id} className="hover:bg-slate-50 transition">
                    <td className="p-3">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={staff.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                          alt={staff.name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{staff.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{staff.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleMeta.badge}`}>
                        {roleMeta.label.split('(')[0].trim()}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        perms.canPublishDirectly ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {perms.canPublishDirectly ? '✓ Live Direct' : '⏳ Review Required'}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="text-[11px] text-slate-700">
                        {perms.canEditAllArticles ? 'All Articles' : 'Own Stories Only'}
                      </span>
                    </td>

                    <td className="p-3 text-[11px] text-slate-600">
                      {staff.assignedCategories && staff.assignedCategories.length > 0 ? (
                        <span>{staff.assignedCategories.join(', ')}</span>
                      ) : (
                        <span className="text-slate-400">All Categories</span>
                      )}
                    </td>

                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        staff.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {staff.status}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(staff)}
                        className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-lg border border-slate-200 cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 3: INTERACTIVE ROLE PERMISSION MATRIX */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Role Permissions &amp; Capabilities Master Matrix (अधिकार तालिका)
            </h3>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-2.5 px-3">Role (पद)</th>
                  <th className="py-2.5 px-3 text-center">Live Direct Publish</th>
                  <th className="py-2.5 px-3 text-center">Edit Any Article</th>
                  <th className="py-2.5 px-3 text-center">Delete Rights</th>
                  <th className="py-2.5 px-3 text-center">Media Uploads</th>
                  <th className="py-2.5 px-3 text-center">Advance SEO Suite</th>
                  <th className="py-2.5 px-3 text-center">Portal Settings</th>
                  <th className="py-2.5 px-3 text-center">Manage Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {[
                  { role: 'Super Admin', live: '✓ Full', editAll: '✓ Full', del: '✓ Full', media: '✓ Full', seo: '✓ Full', settings: '✓ Full', users: '✓ Full' },
                  { role: 'Editor-in-Chief', live: '✓ Direct', editAll: '✓ Full', del: '✕ Admin only', media: '✓ Full', seo: '✓ Full', settings: '✕ Restricted', users: '✕ Restricted' },
                  { role: 'Editor', live: '✓ Direct', editAll: '✓ Full', del: '✕ Admin only', media: '✓ Full', seo: '✓ Full', settings: '✕ Restricted', users: '✕ Restricted' },
                  { role: 'Sub-Editor (उप-संपादक)', live: '✓ Direct', editAll: '✓ Full', del: '✕ No', media: '✓ Full', seo: '✓ Full', settings: '✕ Restricted', users: '✕ Restricted' },
                  { role: 'Senior Editor', live: '✓ Direct', editAll: '✓ Full', del: '✕ No', media: '✓ Full', seo: '✓ Full', settings: '✕ Restricted', users: '✕ Restricted' },
                  { role: 'Reporter / Journalist', live: '⏳ Review Needed', editAll: 'Own Stories', del: '✕ No', media: '✓ Upload', seo: '✕ No', settings: '✕ Restricted', users: '✕ Restricted' },
                  { role: 'Contributor (स्तंभकार)', live: '⏳ Review Needed', editAll: 'Own Drafts', del: '✕ No', media: '✕ No', seo: '✕ No', settings: '✕ Restricted', users: '✕ Restricted' },
                ].map((row, ri) => (
                  <tr key={ri} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{row.role}</td>
                    <td className="text-center font-bold text-emerald-700">{row.live}</td>
                    <td className="text-center text-blue-700">{row.editAll}</td>
                    <td className="text-center text-slate-600">{row.del}</td>
                    <td className="text-center text-teal-700">{row.media}</td>
                    <td className="text-center text-indigo-700">{row.seo}</td>
                    <td className="text-center text-slate-500">{row.settings}</td>
                    <td className="text-center text-slate-500">{row.users}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUB-EDITOR / REPORTER ACCOUNT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl p-5 space-y-4 shadow-2xl text-slate-900 max-h-[92vh] overflow-y-auto font-kd-meta">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Create Sub-Editor / Reporter Account
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Set restricted roles, granular permissions, beats, and access PIN
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. राहुल शर्मा"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="subeditor@khabridost.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Editorial Role (पद चुनें) *
                </label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChangeInAdd(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
                >
                  <option value="sub_editor">Sub-Editor (उप-संपादक) — Review &amp; Edit Desk</option>
                  <option value="reporter">Reporter (संवाददाता / रिपोर्टर) — Field Reporting</option>
                  <option value="editor">Editor (संपादक) — Full Editorial Publishing</option>
                  <option value="contributor">Contributor (अतिथि लेखक) — Opinion Columns</option>
                  <option value="senior_editor">Senior Editor (वरिष्ठ संपादक)</option>
                  <option value="editor_in_chief">Editor-in-Chief (प्रधान संपादक)</option>
                  <option value="seo_manager">SEO Manager (एसईओ प्रबंधक)</option>
                  <option value="super_admin">Super Administrator (मुख्य व्यवस्थापक)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1 italic">
                  {ROLE_LABELS[role]?.desc}
                </p>
              </div>

              {/* Department & Access PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department / Bureau
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. उत्तर प्रदेश ब्यूरो, खेल डेस्क..."
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-700 mb-1">Sign-in</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    This person signs in with Google using the email above. No PIN or password is used.
                  </p>
                </div>
              </div>

              {/* RESTRICTED PERMISSIONS CHECKBOX MATRIX */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-red-600" />
                    <span>Granular Access Controls &amp; Permissions</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    Access is enforced by role in the database rules; these boxes are notes only.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* canPublishDirectly */}
                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canPublishDirectly}
                      onChange={(e) => setPermissions({ ...permissions, canPublishDirectly: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-slate-800">Direct Live Publish (बिना समीक्षा)</span>
                  </label>

                  {/* canEditAllArticles */}
                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canEditAllArticles}
                      onChange={(e) => setPermissions({ ...permissions, canEditAllArticles: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-slate-800">Edit Any Article (अन्य के भी)</span>
                  </label>

                  {/* canDeleteArticles */}
                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canDeleteArticles}
                      onChange={(e) => setPermissions({ ...permissions, canDeleteArticles: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-slate-800">Delete Articles (हटाने का अधिकार)</span>
                  </label>

                  {/* canAccessMediaLibrary */}
                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canAccessMediaLibrary}
                      onChange={(e) => setPermissions({ ...permissions, canAccessMediaLibrary: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-slate-800">Media Library (फ़ोटो/मीडिया अपलोड)</span>
                  </label>

                  {/* canAccessSEO */}
                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canAccessSEO}
                      onChange={(e) => setPermissions({ ...permissions, canAccessSEO: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-slate-800">Advance SEO Suite (मेटा टैग्स)</span>
                  </label>

                  {/* canAccessSettings */}
                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canAccessSettings}
                      onChange={(e) => setPermissions({ ...permissions, canAccessSettings: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-slate-800">Portal Settings (वेबसाइट सेटिंग्स)</span>
                  </label>
                </div>
              </div>

              {/* ALLOWED CATEGORY BEATS RESTRICTIONS */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    <span>Allowed Category Beats (स्वीकृत श्रेणियां)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {assignedCategories.length === 0 ? 'All Categories Allowed' : `${assignedCategories.length} selected`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                    const isChecked = assignedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setAssignedCategories(assignedCategories.filter((c) => c !== cat.id));
                          } else {
                            setAssignedCategories([...assignedCategories, cat.id]);
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition border cursor-pointer ${
                          isChecked
                            ? 'bg-red-600 text-white border-red-600 shadow-2xs font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat.labelHindi}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DESIGNATED REGIONAL STATES BEAT */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    <span>Designated State Bureaus (राज्य कवरेज)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {assignedStates.length === 0 ? 'All States' : `${assignedStates.length} states`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto scrollbar-thin pt-1">
                  {MAJOR_INDIAN_STATES.slice(0, 16).map((st) => {
                    const isChecked = assignedStates.includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setAssignedStates(assignedStates.filter((s) => s !== st));
                          } else {
                            setAssignedStates([...assignedStates, st]);
                          }
                        }}
                        className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold transition border cursor-pointer ${
                          isChecked
                            ? 'bg-slate-900 text-white border-slate-900 font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo Upload in Add */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Profile Photo (फ़ोटो अपलोड या प्रीसेट)
                </label>
                <div className="flex items-center space-x-3">
                  <img
                    src={photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-300 shrink-0 bg-white"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        ref={addFileInputRef}
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, false)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => addFileInputRef.current?.click()}
                        disabled={isCompressing}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>{isCompressing ? 'Compressing...' : 'Upload File'}</span>
                      </button>
                      <span className="text-[10px] text-slate-400">or paste URL:</span>
                    </div>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SUB-EDITOR / STAFF PERMISSIONS */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl p-5 space-y-4 shadow-2xl text-slate-900 max-h-[92vh] overflow-y-auto font-kd-meta">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Edit Account &amp; Restricted Permissions
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Update role, capabilities, beats, PIN, and status
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Editorial Role (पद) *
                </label>
                <select
                  value={editRole}
                  onChange={(e) => handleRoleChangeInEdit(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
                >
                  <option value="sub_editor">Sub-Editor (उप-संपादक) — Review &amp; Edit Desk</option>
                  <option value="reporter">Reporter (संवाददाता / रिपोर्टर) — Field Reporting</option>
                  <option value="editor">Editor (संपादक) — CMS Publishing</option>
                  <option value="contributor">Contributor (अतिथि लेखक) — Opinion Columns</option>
                  <option value="senior_editor">Senior Editor (वरिष्ठ संपादक)</option>
                  <option value="editor_in_chief">Editor-in-Chief (प्रधान संपादक)</option>
                  <option value="seo_manager">SEO Manager (एसईओ प्रबंधक)</option>
                  <option value="super_admin">Super Administrator (मुख्य व्यवस्थापक)</option>
                </select>
              </div>

              {/* Department & Access PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department / Bureau
                  </label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-700 mb-1">Sign-in</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    This person signs in with Google using the email above. No PIN or password is used.
                  </p>
                </div>
              </div>

              {/* RESTRICTED PERMISSIONS CHECKBOX MATRIX */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-red-600" />
                  <span>Granular Access Controls &amp; Permissions</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.canPublishDirectly}
                      onChange={(e) => setEditPermissions({ ...editPermissions, canPublishDirectly: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-slate-800">Direct Live Publish (बिना समीक्षा)</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.canEditAllArticles}
                      onChange={(e) => setEditPermissions({ ...editPermissions, canEditAllArticles: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-slate-800">Edit Any Article (अन्य के भी)</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.canDeleteArticles}
                      onChange={(e) => setEditPermissions({ ...editPermissions, canDeleteArticles: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-slate-800">Delete Articles (हटाने का अधिकार)</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.canAccessMediaLibrary}
                      onChange={(e) => setEditPermissions({ ...editPermissions, canAccessMediaLibrary: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-slate-800">Media Library (फ़ोटो/मीडिया अपलोड)</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.canAccessSEO}
                      onChange={(e) => setEditPermissions({ ...editPermissions, canAccessSEO: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-slate-800">Advance SEO Suite (मेटा टैग्स)</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.canAccessSettings}
                      onChange={(e) => setEditPermissions({ ...editPermissions, canAccessSettings: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-slate-800">Portal Settings (वेबसाइट सेटिंग्स)</span>
                  </label>
                </div>
              </div>

              {/* ALLOWED CATEGORY BEATS */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Allowed Category Beats</span>
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                    const isChecked = editAssignedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setEditAssignedCategories(editAssignedCategories.filter((c) => c !== cat.id));
                          } else {
                            setEditAssignedCategories([...editAssignedCategories, cat.id]);
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition border cursor-pointer ${
                          isChecked
                            ? 'bg-red-600 text-white border-red-600 shadow-2xs font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat.labelHindi}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DESIGNATED REGIONAL STATES BEAT */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  <span>Designated State Bureaus</span>
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto scrollbar-thin pt-1">
                  {MAJOR_INDIAN_STATES.slice(0, 16).map((st) => {
                    const isChecked = editAssignedStates.includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setEditAssignedStates(editAssignedStates.filter((s) => s !== st));
                          } else {
                            setEditAssignedStates([...editAssignedStates, st]);
                          }
                        }}
                        className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold transition border cursor-pointer ${
                          isChecked
                            ? 'bg-slate-900 text-white border-slate-900 font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo Section in Edit */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">Profile Photo</label>
                <div className="flex items-center space-x-3">
                  <img
                    src={editPhotoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                    alt={editName || 'Staff Member'}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-300 shrink-0 bg-white"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        ref={editFileInputRef}
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, true)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        disabled={isCompressing}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>{isCompressing ? 'Compressing...' : 'Upload File'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={editPhotoURL}
                      onChange={(e) => setEditPhotoURL(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
