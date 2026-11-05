import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Lock,
  AlertCircle,
  CheckCircle2,
  Scale,
  Printer,
  Share2,
  Copy,
  Check,
  Mail,
  Building2,
  ChevronRight,
  PenTool,
  Clock,
  BookOpen,
  Search,
  Sliders,
  Type,
  Menu,
  X,
  ExternalLink,
  Award,
  Phone,
  Compass,
  Send,
  MessageSquare,
  DollarSign,
  Radio,
  Flame,
  Globe2,
  Users,
  Target,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import { PortalSettings, ContactInquiry } from '../types/news';
import { DEFAULT_HEADER_FOOTER_SETTINGS } from '../data/portalDefaults';

export type LegalPolicyType =
  | 'privacy'
  | 'terms'
  | 'cookies'
  | 'dmca'
  | 'factCheck'
  | 'ethics'
  | 'corrections'
  | 'disclaimer'
  | 'grievance'
  | 'complaint'
  | 'contact'
  | 'about';

interface LegalPolicyPageViewProps {
  initialPolicyType?: LegalPolicyType;
  onBackToHome: () => void;
  portalSettings: PortalSettings;
  isAdmin: boolean;
  onUpdateSettings?: (newSettings: PortalSettings) => void;
  onOpenContactPage?: () => void;
  onOpenAboutUsPage?: () => void;
  onOpenAdminSettings?: () => void;
  onAddInquiry?: (inquiry: Omit<ContactInquiry, 'id' | 'submittedAt' | 'status'>) => void;
}

interface PolicyDefinition {
  id: LegalPolicyType;
  category: 'legal_data' | 'editorial' | 'grievance' | 'institution';
  categoryLabel: string;
  title: string;
  englishTitle: string;
  key?: keyof NonNullable<typeof DEFAULT_HEADER_FOOTER_SETTINGS.legalPolicies>;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  statuteReference?: string;
  keywords: string[];
}

const POLICY_DEFINITIONS: PolicyDefinition[] = [
  // 1. Legal & Data Compliance
  {
    id: 'privacy',
    category: 'legal_data',
    categoryLabel: 'विधिक एवं डेटा सुरक्षा',
    title: 'गोपनीयता नीति (Privacy Policy)',
    englishTitle: 'Privacy & Data Protection Policy (DPDP Act 2023 & GDPR)',
    key: 'privacyPolicy',
    badge: 'DPDP Act & GDPR Compliant',
    icon: Lock,
    description: 'पाठक डेटा संरक्षण, कुकीज़ नीति, Google AdSense और DART विज्ञापन प्रकटीकरण एवं उपयोगकर्ता अधिकार।',
    statuteReference: 'भारतीय डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम (DPDP) 2023',
    keywords: ['privacy', 'गोपनीयता', 'data', 'cookie', 'कुकी', 'adsense', 'dart', 'gdpr', 'dpdp', 'सुरक्षा'],
  },
  {
    id: 'terms',
    category: 'legal_data',
    categoryLabel: 'विधिक एवं डेटा सुरक्षा',
    title: 'नियम एवं शर्तें (Terms of Service)',
    englishTitle: 'Terms of Service & Reader Agreement',
    key: 'termsOfService',
    badge: 'Binding Reader Agreement',
    icon: FileText,
    description: 'वेबसाइट उपयोग की वैधानिक शर्तें, उपयोगकर्ता आचरण, कॉपीराइट और बौद्धिक संपदा अधिकार।',
    statuteReference: 'भारतीय अनुबंध अधिनियम 1872 एवं सूचना प्रौद्योगिकी अधिनियम 2000',
    keywords: ['terms', 'नियम', 'शर्तें', 'agreement', 'अनुबंध', 'copyright', 'intellectual property', 'उपयोगकर्ता'],
  },
  {
    id: 'cookies',
    category: 'legal_data',
    categoryLabel: 'विधिक एवं डेटा सुरक्षा',
    title: 'कुकीज़ एवं डेटा ट्रैकिंग नीति',
    englishTitle: 'Cookie Policy & Third-Party Ad Serving (AdSense DART)',
    key: 'cookiePolicy',
    badge: 'AdSense & Cookie Consent',
    icon: Sliders,
    description: 'वेब ब्राउज़र कुकीज़, Google AdSense DART ट्रैकिंग, अनामीकृत एनालिटिक्स एवं कुकी नियंत्रण प्रक्रिया।',
    statuteReference: 'Google प्रकाशक नीतियां एवं DPDP Act 2023 कुकी सहमति नियम',
    keywords: ['cookie', 'कुकीज़', 'dart', 'adsense', 'analytics', 'tracking', 'opt-out'],
  },
  {
    id: 'dmca',
    category: 'legal_data',
    categoryLabel: 'विधिक एवं डेटा सुरक्षा',
    title: 'कॉपीराइट एवं DMCA नोटिस',
    englishTitle: 'Copyright Infringement & DMCA Takedown Notice',
    key: 'dmcaNotice',
    badge: 'Copyright Protection',
    icon: BookOpen,
    description: 'बौद्धिक संपदा संरक्षण, कॉपीराइट उल्लंघन शिकायत एवं सामग्री हटाने की विधिक प्रक्रिया।',
    statuteReference: 'भारतीय कॉपीराइट अधिनियम 1957 (धारा 52 Fair Dealing)',
    keywords: ['copyright', 'dmca', 'कॉपीराइट', 'takedown', 'बौद्धिक संपदा', 'उल्लंघन', 'नोटिस'],
  },

  // 2. Editorial & Standards
  {
    id: 'factCheck',
    category: 'editorial',
    categoryLabel: 'संपादकीय मानक एवं पारदर्शिता',
    title: 'तथ्य-जांच नीति (Fact-Checking)',
    englishTitle: 'Fact-Checking & 4-Stage Verification Protocol',
    key: 'factCheckPolicy',
    badge: 'Fact-checking',
    icon: CheckCircle2,
    description: 'गलत सूचना और अफवाहों के विरुद्ध 4-चरणीय सत्यापन प्रक्रिया और ग्राउंड रिपोर्टिंग नियम।',
    keywords: ['fact check', 'तथ्य', 'सत्यापन', 'verification', 'अफवाह', 'fake news', 'ग्राउंड रिपोर्ट'],
  },
  {
    id: 'ethics',
    category: 'editorial',
    categoryLabel: 'संपादकीय मानक एवं पारदर्शिता',
    title: 'संपादकीय आचार संहिता (Ethics)',
    englishTitle: 'Code of Editorial Ethics & Journalistic Independence',
    key: 'editorialEthics',
    badge: 'Editorial standards',
    icon: ShieldCheck,
    description: 'निष्पक्षता, पेड न्यूज़ पर रोक और हितों का टकराव।',
    keywords: ['ethics', 'आचार संहिता', 'नैतिकता', 'paid news', 'संपादकीय', 'निष्पक्षता', 'पत्रकारिता'],
  },
  {
    id: 'corrections',
    category: 'editorial',
    categoryLabel: 'संपादकीय मानक एवं पारदर्शिता',
    title: 'सुधार एवं संशोधन नीति (Corrections)',
    englishTitle: 'Transparent Corrections & Retractions Policy',
    key: 'correctionPolicy',
    badge: '24-Hour Transparency',
    icon: Clock,
    description: 'तथ्यात्मक त्रुटियों के पारदर्शी सुधार, संशोधन नोट और समाचार वापसी प्रोटोकॉल।',
    statuteReference: 'संपादकीय पारदर्शिता एवं राइट ऑफ रिप्लाई (Right of Reply)',
    keywords: ['correction', 'सुधार', 'संशोधन', 'retraction', 'त्रुटि', 'पारदर्शिता', 'खंडन'],
  },
  {
    id: 'disclaimer',
    category: 'editorial',
    categoryLabel: 'संपादकीय मानक एवं पारदर्शिता',
    title: 'अस्वीकरण एवं दायित्व सीमा (Disclaimer)',
    englishTitle: 'Editorial, Financial & Medical Disclaimer',
    key: 'disclaimer',
    badge: 'Legal Disclaimer',
    icon: Scale,
    description: 'सूचनात्मक उद्देश्य, शेयर बाजार/वित्तीय परामर्श अस्वीकरण और बाह्य वेबसाइट लिंक।',
    statuteReference: 'सेबी (SEBI) एवं भारतीय चिकित्सा परिषद (NMC) दिशानिर्देश अस्वीकरण',
    keywords: ['disclaimer', 'अस्वीकरण', 'शेयर बाजार', 'निवेश', 'चिकित्सा', 'सलाह', 'दायित्व'],
  },

  // 3. Statutory Grievance Redressal
  {
    id: 'grievance',
    category: 'grievance',
    categoryLabel: 'वैधानिक शिकायत निवारण',
    title: 'शिकायत निवारण अधिकारी (Grievance Desk)',
    englishTitle: 'Grievance Redressal Mechanism (Rule 11 IT Rules 2021)',
    key: 'grievanceRedressal',
    badge: 'Statutory 15-Day SLA',
    icon: AlertCircle,
    description: 'सूचना प्रौद्योगिकी (डिजिटल मीडिया आचार संहिता) नियम 2021 के तहत वैधानिक शिकायत निवारण तंत्र।',
    statuteReference: 'सूचना प्रौद्योगिकी (मध्यवर्ती दिशानिर्देश व डिजिटल मीडिया आचार संहिता) नियम 2021, नियम 11',
    keywords: ['grievance', 'शिकायत', 'officer', 'नियम 11', 'it rules', 'MIB', 'राजेश कुमार शर्मा'],
  },
  {
    id: 'complaint',
    category: 'grievance',
    categoryLabel: 'वैधानिक शिकायत निवारण',
    title: 'ऑनलाइन वैधानिक शिकायत फॉर्म',
    englishTitle: 'File an Online Statutory Grievance / Redressal Ticket',
    badge: 'Instant Ticket ID',
    icon: Send,
    description: 'समाचार, वीडियो अथवा लेख के विरुद्ध 24-घंटे अभिस्वीकृति व 15-दिवसीय वैधानिक शिकायत प्रपत्र।',
    statuteReference: 'नियम 11(2) डिजिटल मीडिया आचार संहिता 2021',
    keywords: ['complaint', 'शिकायत फॉर्म', 'ticket', 'ऑनलाइन', 'redressal', 'आपत्ति'],
  },

  // 4. Institution & Contact
  {
    id: 'contact',
    category: 'institution',
    categoryLabel: 'संस्थान व संपर्क डेस्क',
    title: 'संपादकीय संपर्क एवं ब्यूरो (Contact Us)',
    englishTitle: 'Newsroom Contact, Tips & Regional Bureaus',
    badge: '24x7 Active Newsroom',
    icon: Mail,
    description: 'संपादकीय बोर्ड, न्यूज़ टिप, विज्ञापन साझेदारी और राज्य संवाददाता ब्यूरो संपर्क विवरण।',
    statuteReference: 'पंजीकृत राष्ट्रीय समाचार नेटवर्क कार्यालय',
    keywords: ['contact', 'संपर्क', 'email', 'phone', 'address', 'office', 'bureau', 'विज्ञापन', 'news tip'],
  },
  {
    id: 'about',
    category: 'institution',
    categoryLabel: 'संस्थान व संपर्क डेस्क',
    title: 'हमारे बारे में (About Us)',
    englishTitle: 'About Khabri Dost, Editorial Mission & Profile',
    badge: 'Official Profile',
    icon: Award,
    description: 'खबरी दोस्त का संपादकीय मिशन, स्वतंत्रता के सिद्धांत, तथ्य-जांच मानक एवं पत्रकारिता टीम।',
    statuteReference: 'प्रेस काउंसिल ऑफ इंडिया मानकों के अनुरूप',
    keywords: ['about', 'हमारे बारे में', 'mission', 'team', 'khabri dost', 'संपादकीय'],
  },
];

const CONTACT_DEPARTMENTS = [
  {
    id: 'news_tip' as const,
    label: 'न्यूज़ टिप व ग्राउंड रिपोर्ट',
    english: 'Breaking News Tip',
    icon: Flame,
    sla: '< 1 घंटा',
    desc: 'ब्रेकिंग न्यूज़, भ्रष्टाचार उजागर करने वाली सूचना या जनहितैषी ग्राउंड रिपोर्ट प्रेषित करें।',
  },
  {
    id: 'general' as const,
    label: 'सामान्य संपादकीय पूछताछ',
    english: 'General Editorial Inquiry',
    icon: MessageSquare,
    sla: '24 घंटे',
    desc: 'संपादकीय बोर्ड से संवाद, पाठकीय सुझाव या सामान्य जानकारी के लिए।',
  },
  {
    id: 'advertising' as const,
    label: 'विज्ञापन एवं ब्रांड साझेदारी',
    english: 'Advertising & Direct Sponsorship',
    icon: DollarSign,
    sla: '12 घंटे',
    desc: 'डिजिटल बैनर विज्ञापन, प्रायोजित ब्रांड अभियान और व्यापारिक साझेदारियों हेतु।',
  },
  {
    id: 'grievance' as const,
    label: 'शिकायत निवारण (नियम 11)',
    english: 'Statutory Grievance Redressal',
    icon: AlertCircle,
    sla: '15 दिन (विधिक)',
    desc: 'सूचना प्रौद्योगिकी (डिजिटल मीडिया आचार संहिता) नियम 2021 के तहत वैधानिक शिकायत।',
  },
  {
    id: 'press_release' as const,
    label: 'प्रेस विज्ञप्ति एवं आधिकारिक संचार',
    english: 'Press Releases & Statements',
    icon: Radio,
    sla: '48 घंटे',
    desc: 'सरकारी, कॉर्पोरेट अथवा गैर-सरकारी संस्थाओं की आधिकारिक प्रेस विज्ञप्तियां।',
  },
];

// Regional bureau contacts are published here only when the newsroom provides real ones.
const STATE_BUREAUS: Array<{ state: string; head: string; email: string; phone: string }> = [];

export const LegalPolicyPageView: React.FC<LegalPolicyPageViewProps> = ({
  initialPolicyType = 'privacy',
  onBackToHome,
  portalSettings,
  isAdmin,
  onUpdateSettings,
  onOpenContactPage,
  onOpenAboutUsPage,
  onOpenAdminSettings,
  onAddInquiry,
}) => {
  const [currentPolicyId, setCurrentPolicyId] = useState<LegalPolicyType>(initialPolicyType);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRni, setCopiedRni] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Contact Form State
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'news_tip' as ContactInquiry['department'],
    subject: '',
    message: '',
    sourceUrl: '',
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmittedTicket, setContactSubmittedTicket] = useState<string | null>(null);

  // Statutory Complaint Form State
  const [complaintFormData, setComplaintFormData] = useState({
    complainantName: '',
    email: '',
    phone: '',
    articleUrl: '',
    grievanceCategory: 'तथ्यात्मक त्रुटि (Factual Inaccuracy)',
    objectionDetails: '',
    evidenceLinks: '',
    declarationAgreed: false,
  });
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);
  const [complaintSubmittedTicket, setComplaintSubmittedTicket] = useState<string | null>(null);

  // Sync if initialPolicyType prop changes
  useEffect(() => {
    if (initialPolicyType) {
      setCurrentPolicyId(initialPolicyType);
      setIsEditing(false);
    }
  }, [initialPolicyType]);

  const hf = portalSettings?.headerFooter || DEFAULT_HEADER_FOOTER_SETTINGS;
  const currentDef = POLICY_DEFINITIONS.find((p) => p.id === currentPolicyId) || POLICY_DEFINITIONS[0];

  const officialRni = hf.showRniNumber ? hf.rniNumber || '' : '';
  const officialEmail = hf.contactEmail || 'khabridost.com@gmail.com';
  const officialAddress = hf.contactAddress || '';
  const officialPhone = hf.contactPhone || '';
  const editorialMotto = 'सत्य, निष्पक्षता एवं जन-सरोकार';

  const currentText = useMemo(() => {
    if (!currentDef.key) return '';
    return (
      hf.legalPolicies?.[currentDef.key] ||
      (DEFAULT_HEADER_FOOTER_SETTINGS.legalPolicies as any)?.[currentDef.key] ||
      'सामग्री उपलब्ध नहीं है।'
    );
  }, [currentDef, hf]);

  useEffect(() => {
    if (currentDef.key) {
      setEditText(currentText);
    }
    setIsEditing(false);
  }, [currentPolicyId, currentText, currentDef]);

  const handleSelectPolicy = (id: LegalPolicyType) => {
    setCurrentPolicyId(id);
    setIsEditing(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.location.hash = `#legal-${id}`;
    } catch {}
  };

  const handleSave = () => {
    if (!onUpdateSettings || !currentDef.key) return;
    const updated: PortalSettings = {
      ...portalSettings,
      headerFooter: {
        ...hf,
        legalPolicies: {
          ...(hf.legalPolicies || DEFAULT_HEADER_FOOTER_SETTINGS.legalPolicies!),
          [currentDef.key]: editText,
        },
      },
    };
    onUpdateSettings(updated);
    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const handleCopyRni = () => {
    try {
      navigator.clipboard.writeText(officialRni);
      setCopiedRni(true);
      setTimeout(() => setCopiedRni(false), 2000);
    } catch {}
  };

  // Contact Submit
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactFormData.name.trim() || !contactFormData.email.trim() || !contactFormData.message.trim() || !contactFormData.subject.trim()) {
      alert('कृपया सभी आवश्यक फ़ील्ड (नाम, ईमेल, विषय एवं संदेश) भरें।');
      return;
    }
    setContactSubmitting(true);
    const ticket = `KD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setTimeout(() => {
      if (onAddInquiry) {
        onAddInquiry({
          name: contactFormData.name.trim(),
          email: contactFormData.email.trim(),
          phone: contactFormData.phone.trim() || undefined,
          department: contactFormData.department,
          subject: contactFormData.subject.trim(),
          message: contactFormData.message.trim(),
          sourceUrl: contactFormData.sourceUrl.trim() || undefined,
          adminNotes: `Ticket: ${ticket} • Submitted via Unified Hub Desk`,
        });
      }
      setContactSubmitting(false);
      setContactSubmittedTicket(ticket);
    }, 500);
  };

  // Statutory Grievance Submit
  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !complaintFormData.complainantName.trim() ||
      !complaintFormData.email.trim() ||
      !complaintFormData.objectionDetails.trim() ||
      !complaintFormData.declarationAgreed
    ) {
      alert('कृपया नाम, ईमेल, आपत्ति का विवरण भरें तथा वैधानिक घोषणा स्वीकार करें।');
      return;
    }
    setComplaintSubmitting(true);
    const ticket = `GRV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setTimeout(() => {
      if (onAddInquiry) {
        onAddInquiry({
          name: complaintFormData.complainantName.trim(),
          email: complaintFormData.email.trim(),
          phone: complaintFormData.phone.trim() || undefined,
          department: 'grievance',
          subject: `[वैधानिक शिकायत] ${complaintFormData.grievanceCategory} - टिकट: ${ticket}`,
          message: `आपत्ति श्रेणी: ${complaintFormData.grievanceCategory}\nसंबंधित लिंक: ${complaintFormData.articleUrl || 'N/A'}\n\nआपत्ति का विवरण:\n${complaintFormData.objectionDetails}\n\nसाक्ष्य:\n${complaintFormData.evidenceLinks || 'N/A'}\n\nवैधानिक घोषणा: शिकायतकर्ता द्वारा प्रमाणित एवं सत्यापित।`,
          sourceUrl: complaintFormData.articleUrl.trim() || undefined,
          adminNotes: `Rule 11 Statutory Ticket: ${ticket} • 15-Day Timebound Disposal SLA Required`,
        });
      }
      setComplaintSubmitting(false);
      setComplaintSubmittedTicket(ticket);
    }, 600);
  };

  // Filter policies based on search query
  const filteredPolicies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return POLICY_DEFINITIONS;
    return POLICY_DEFINITIONS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.englishTitle.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Group filtered policies by category
  const categories = useMemo(() => {
    return [
      {
        id: 'legal_data',
        label: 'विधिक एवं डेटा सुरक्षा',
        sub: 'DPDP, Terms, Cookies & DMCA',
        policies: filteredPolicies.filter((p) => p.category === 'legal_data'),
      },
      {
        id: 'editorial',
        label: 'संपादकीय मानक एवं पारदर्शिता',
        sub: 'Fact-Check, Ethics, Corrections & Disclaimer',
        policies: filteredPolicies.filter((p) => p.category === 'editorial'),
      },
      {
        id: 'grievance',
        label: 'वैधानिक शिकायत निवारण',
        sub: 'IT Rules 2021 (Rule 11) & Desk',
        policies: filteredPolicies.filter((p) => p.category === 'grievance'),
      },
      {
        id: 'institution',
        label: 'संस्थान व संपर्क डेस्क',
        sub: 'Contact Us, Bureaus & About Us',
        policies: filteredPolicies.filter((p) => p.category === 'institution'),
      },
    ].filter((cat) => cat.policies.length > 0);
  }, [filteredPolicies]);

  // Parse Table of Contents & Sections from current text
  const { sections, tocItems, estimatedMinutes } = useMemo(() => {
    if (!currentText) {
      return { sections: [], tocItems: [], estimatedMinutes: 2 };
    }
    const lines: string[] = (currentText || '').split('\n');
    const parsedSections: { title: string; lines: string[]; anchorId: string }[] = [];
    let currentSection: { title: string; lines: string[]; anchorId: string } | null = null;
    let preamble: string[] = [];

    const sectionRegex = /^(\d+\.\s+[^:]+[:\-])/i;

    lines.forEach((line: string) => {
      const match = line.match(sectionRegex);
      if (match) {
        if (currentSection) {
          parsedSections.push(currentSection);
        }
        const title = line.trim();
        const anchorId = `sec-${parsedSections.length + 1}`;
        currentSection = {
          title,
          lines: [],
          anchorId,
        };
      } else if (currentSection) {
        currentSection.lines.push(line);
      } else {
        preamble.push(line);
      }
    });

    if (currentSection) {
      parsedSections.push(currentSection);
    }

    const words = currentText.trim().split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.ceil(words / 180));

    return {
      sections: parsedSections,
      tocItems: parsedSections.map((s, i) => ({ title: s.title, anchorId: s.anchorId, num: i + 1 })),
      estimatedMinutes: mins,
    };
  }, [currentText]);

  const scrollToAnchor = (anchorId: string) => {
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const IconComponent = currentDef.icon;

  const fontClass =
    fontSize === 'xlarge'
      ? 'text-base sm:text-lg leading-relaxed'
      : fontSize === 'large'
      ? 'text-sm sm:text-base leading-relaxed'
      : 'text-xs sm:text-sm leading-relaxed';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 animate-fadeIn font-kd-body">
      {/* 1. TOP BREADCRUMB & UTILITY STRIP */}
      <div className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToHome}
              className="bg-slate-100 hover:bg-red-600 hover:text-white text-slate-700 px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition cursor-pointer border border-slate-200 shadow-2xs"
              title="मुख्य पृष्ठ पर वापस जाएं"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>

            <div className="hidden sm:flex items-center space-x-2 text-slate-500 font-kd-meta">
              <span className="cursor-pointer hover:text-slate-900" onClick={onBackToHome}>
                Home
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-600">विधिक एवं अनुपालन केंद्र</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-red-600 font-bold truncate max-w-[200px]">{currentDef.title}</span>
            </div>
          </div>

          {/* Quick Reader Utilities */}
          <div className="flex items-center space-x-2 text-slate-600">
            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center space-x-1.5 cursor-pointer text-xs shadow-xs"
              title="नीतियां व प्रलेख मेनू खोलें"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>नीतियां एवं प्रलेख ({POLICY_DEFINITIONS.length})</span>
            </button>

            {/* Font Size Adjuster */}
            <div className="hidden md:flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 rounded cursor-pointer transition ${
                  fontSize === 'normal' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="सामान्य फ़ॉन्ट"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded cursor-pointer transition ${
                  fontSize === 'large' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="बड़ा फ़ॉन्ट"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSize('xlarge')}
                className={`px-2 py-0.5 rounded cursor-pointer transition ${
                  fontSize === 'xlarge' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="अधिक बड़ा फ़ॉन्ट"
              >
                A++
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition flex items-center space-x-1.5 cursor-pointer text-xs"
              title="प्रिंट करें (Print Document)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition flex items-center space-x-1.5 cursor-pointer text-xs"
              title="लिंक कॉपी करें (Share / Copy Link)"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. HERO HEADER - LEGAL & COMPLIANCE DESK */}
      <div className="bg-gradient-to-r from-red-50 via-white to-slate-50 text-slate-900 py-8 sm:py-12 border-b border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-3.5">
          <div className="flex flex-wrap items-center gap-2">
            {currentDef.key && (
              <span className="inline-flex items-center space-x-1 bg-white text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-kd-meta shadow-2xs">
                <Clock className="w-3 h-3 text-red-600" />
                <span>{estimatedMinutes} मिनट का पठन</span>
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="kd-static-title">
              {currentDef.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-kd-meta">
              {currentDef.englishTitle} • {hf.siteTitle || 'खबरी दोस्त डिजिटल न्यूज़ नेटवर्क'}
            </p>
          </div>

          <p className="text-slate-600 text-xs sm:text-sm max-w-3xl leading-relaxed font-kd-body">
            {currentDef.description}
          </p>

          {currentDef.statuteReference && (
            <div className="inline-flex items-center space-x-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono shadow-2xs">
              <Scale className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>वैधानिक संदर्भ: {currentDef.statuteReference}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. MAIN SECTION GRID: ENHANCED SIDEBAR MENU + DOCUMENT BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================
              LEFT 4 COLS: ENHANCED STICKY SIDEBAR MENU
              ======================================================== */}
          <div
            className={`lg:col-span-4 space-y-4 lg:sticky lg:top-14 z-20 ${
              mobileMenuOpen
                ? 'fixed inset-0 z-50 bg-black/60 backdrop-blur-xs p-4 flex flex-col justify-end lg:static lg:bg-transparent lg:p-0'
                : 'block'
            }`}
          >
            <div
              className={`bg-white rounded-3xl p-5 border border-slate-200/90 shadow-md space-y-4 ${
                mobileMenuOpen ? 'max-h-[88vh] overflow-y-auto animate-slideUp w-full' : ''
              }`}
            >
              {/* Sidebar Header with Policy Count & Search */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-red-600" />
                    <span>सभी नीतियां व प्रलेख (Directory)</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-mono font-bold">
                      {POLICY_DEFINITIONS.length} Items
                    </span>
                    {mobileMenuOpen && (
                      <button
                        type="button"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-1 text-slate-400 hover:text-slate-700 lg:hidden"
                        title="बंद करें"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Instant Filter Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="नीति या विषय खोजें (उदा. Privacy, Cookie, शिकायत)..."
                    className="w-full pl-8 pr-7 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 font-kd-meta"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Categorized Policy Links */}
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>{cat.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({cat.policies.length})</span>
                    </div>

                    <div className="space-y-1">
                      {cat.policies.map((def) => {
                        const Icon = def.icon;
                        const isActive = currentPolicyId === def.id;
                        return (
                          <button
                            key={def.id}
                            type="button"
                            onClick={() => handleSelectPolicy(def.id)}
                            className={`w-full text-left p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between border ${
                              isActive
                                ? 'bg-red-600 text-white font-bold border-red-500 shadow-xs'
                                : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-200/60'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 truncate">
                              <Icon
                                className={`w-4 h-4 shrink-0 ${
                                  isActive ? 'text-white' : 'text-slate-500'
                                }`}
                              />
                              <div className="truncate">
                                <span className="truncate text-xs block leading-tight">{def.title}</span>
                                <span
                                  className={`text-[10px] block truncate ${
                                    isActive ? 'text-red-100' : 'text-slate-400'
                                  }`}
                                >
                                  {def.badge}
                                </span>
                              </div>
                            </div>
                            <ChevronRight
                              className={`w-3.5 h-3.5 shrink-0 transition ${
                                isActive ? 'text-white translate-x-0.5' : 'text-slate-400'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {filteredPolicies.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400 space-y-1">
                    <p>कोई नीति या प्रलेख नहीं मिला</p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-red-600 underline text-[11px] font-bold"
                    >
                      खोज रीसेट करें
                    </button>
                  </div>
                )}
              </div>

              {/* On-Page Table of Contents (TOC) for Long Policy Reading */}
              {tocItems.length > 1 && currentDef.key && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-amber-600" />
                    <span>इस नीति के मुख्य अनुभाग (Jump to Section):</span>
                  </span>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {tocItems.map((item) => (
                      <button
                        key={item.anchorId}
                        type="button"
                        onClick={() => scrollToAnchor(item.anchorId)}
                        className="w-full text-left text-[11px] p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-red-600 transition flex items-start space-x-2 truncate cursor-pointer"
                      >
                        <span className="text-[10px] font-mono text-red-600 shrink-0 font-bold">
                          {item.num}.
                        </span>
                        <span className="truncate">{item.title.replace(/^\d+\.\s*/, '')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Bureau Verification & Credentials Card */}
            <div className="bg-white text-slate-900 rounded-3xl p-5 border border-slate-200 space-y-3.5 shadow-xs hidden lg:block">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5 font-kd-meta">
                <Building2 className="w-3.5 h-3.5" />
                <span>संपर्क विवरण</span>
              </span>

              <div className="space-y-2 text-xs font-kd-meta">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  {officialRni && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">RNI Reg:</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-900 font-mono font-bold text-[11px]">{officialRni}</span>
                      <button
                        type="button"
                        onClick={handleCopyRni}
                        className="p-0.5 text-slate-400 hover:text-slate-700"
                        title="Copy RNI"
                      >
                        {copiedRni ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  )}
                  {officialPhone && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500 text-[11px]">हेल्पलाइन:</span>
                    <span className="text-slate-700 font-mono text-[11px]">{officialPhone}</span>
                  </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500 text-[11px]">ईमेल:</span>
                    <a href={`mailto:${officialEmail}`} className="text-red-600 font-mono text-[11px] hover:underline font-semibold">
                      {officialEmail}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              RIGHT 8 COLS: COMPLETE DYNAMIC POLICY / CONTACT / ABOUT CONTENT
              ======================================================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* VIEW A: CONTACT US DESK */}
            {currentPolicyId === 'contact' ? (
              <div className="space-y-6">
                {/* Department Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CONTACT_DEPARTMENTS.slice(0, 3).map((dept) => {
                    const Icon = dept.icon;
                    const isSelected = contactFormData.department === dept.id;
                    return (
                      <div
                        key={dept.id}
                        onClick={() => setContactFormData((prev) => ({ ...prev, department: dept.id }))}
                        className={`p-4 rounded-2xl border transition cursor-pointer shadow-sm flex flex-col justify-between ${
                          isSelected
                            ? 'bg-red-50/90 border-red-500 ring-2 ring-red-400 shadow-md'
                            : 'bg-white border-slate-200 hover:border-red-200 hover:shadow-md'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-full font-bold">
                              {dept.sla}
                            </span>
                          </div>
                          <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                            {dept.label}
                          </h3>
                          <p className="text-[11px] text-slate-500 line-clamp-2">{dept.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-sm space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-xl sm:text-2xl font-black font-kd-headline text-slate-900">
                      संपादकीय बोर्ड को सीधा संदेश प्रेषित करें
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      सभी संदेश एन्क्रिप्टेड होते हैं और सीधे अधिकृत संपादकीय डेस्क को प्राप्त होते हैं।
                    </p>
                  </div>

                  {contactSubmittedTicket ? (
                    <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3 text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-emerald-900">संदेश सफलतापूर्वक प्राप्त हुआ!</h3>
                      <p className="text-xs text-emerald-800">
                        ट्रैकिंग टिकट ID: <span className="font-mono font-bold bg-white px-2 py-1 rounded border border-emerald-300">{contactSubmittedTicket}</span>
                      </p>
                      <button
                        onClick={() => {
                          setContactSubmittedTicket(null);
                          setContactFormData({
                            name: '',
                            email: '',
                            phone: '',
                            department: 'news_tip',
                            subject: '',
                            message: '',
                            sourceUrl: '',
                          });
                        }}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer mt-2"
                      >
                        नया संदेश भेजें
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4 text-xs sm:text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">
                            आपका पूरा नाम <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={contactFormData.name}
                            onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                            placeholder="उदा. राहुल वर्मा"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs sm:text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">
                            आधिकारिक ईमेल <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={contactFormData.email}
                            onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                            placeholder="name@example.com"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">फ़ोन नंबर (ऐच्छिक)</label>
                          <input
                            type="tel"
                            value={contactFormData.phone}
                            onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs sm:text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">विषय (Subject) <span className="text-red-600">*</span></label>
                          <input
                            type="text"
                            required
                            value={contactFormData.subject}
                            onChange={(e) => setContactFormData({ ...contactFormData, subject: e.target.value })}
                            placeholder="संदेश का मुख्य विषय लिखें..."
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">
                          विस्तृत संदेश अथवा विवरण <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={contactFormData.message}
                          onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                          placeholder="अपनी बात, रिपोर्ट अथवा पूछताछ का पूरा विवरण यहाँ लिखें..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs sm:text-sm leading-relaxed"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={contactSubmitting}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition cursor-pointer flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
                      >
                        {contactSubmitting ? (
                          <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>{contactSubmitting ? 'प्रेषित हो रहा है...' : 'सुरक्षित संदेश प्रेषित करें'}</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* State Bureaus Directory */}
                {STATE_BUREAUS.length > 0 && <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                    क्षेत्रीय राज्य संवाददाता एवं ब्यूरो नेटवर्क (Regional Bureaus)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {STATE_BUREAUS.map((bureau, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                        <div className="font-bold text-slate-900">{bureau.state}</div>
                        <div className="text-slate-600 flex items-center justify-between text-[11px]">
                          <span>ब्यूरो प्रमुख: {bureau.head}</span>
                          <a href={`mailto:${bureau.email}`} className="text-red-600 font-mono hover:underline">
                            {bureau.email}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>}
              </div>
            ) : currentPolicyId === 'complaint' ? (
              /* VIEW B: ONLINE STATUTORY GRIEVANCE REDRESSAL FORM */
              <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      नियम 11 IT Rules 2021 वैधानिक शिकायत प्रपत्र
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-kd-headline text-slate-900">
                    ऑनलाइन शिकायत एवं निवारण आवेदन
                  </h2>
                  <p className="text-xs text-slate-500">
                    खबरी दोस्त पर प्रकाशित किसी भी खबर, तस्वीर, वीडियो या रिपोर्ट के संबंध में वैधानिक शिकायत दर्ज करें।
                  </p>
                </div>

                {complaintSubmittedTicket ? (
                  <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-amber-900">शिकायत सफलतापूर्वक दर्ज हो गई है!</h3>
                      <p className="text-xs text-amber-800">
                        आपकी शिकायत आईटी नियम 2021 के अंतर्गत हमारे शिकायत निवारण अधिकारी को प्रेषित कर दी गई है।
                      </p>
                    </div>

                    <div className="inline-block p-3 rounded-xl bg-white border border-amber-400 font-mono font-bold text-sm text-slate-900 shadow-xs">
                      वैधानिक टिकट ID: {complaintSubmittedTicket}
                    </div>

                    <div className="text-[11px] text-amber-900 bg-white/70 p-3 rounded-xl border border-amber-200 space-y-1 text-left">
                      <div className="font-bold">वैधानिक निस्तारण समयसीमा (Statutory SLA):</div>
                      <div>• प्राप्ति की अभिस्वीकृति (Acknowledgment): 24 घंटे के भीतर जारी होगी।</div>
                      <div>• शिकायत की पूर्ण जांच एवं अंतिम निस्तारण: 15 दिनों के भीतर लिखित रूप में प्रदान किया जाएगा।</div>
                    </div>

                    <button
                      onClick={() => {
                        setComplaintSubmittedTicket(null);
                        setComplaintFormData({
                          complainantName: '',
                          email: '',
                          phone: '',
                          articleUrl: '',
                          grievanceCategory: 'तथ्यात्मक त्रुटि (Factual Inaccuracy)',
                          objectionDetails: '',
                          evidenceLinks: '',
                          declarationAgreed: false,
                        });
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      अन्य शिकायत दर्ज करें
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleComplaintSubmit} className="space-y-4 text-xs sm:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">
                          शिकायतकर्ता का नाम <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={complaintFormData.complainantName}
                          onChange={(e) => setComplaintFormData({ ...complaintFormData, complainantName: e.target.value })}
                          placeholder="पूरा नाम दर्ज करें"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">
                          शिकायतकर्ता का ईमेल <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={complaintFormData.email}
                          onChange={(e) => setComplaintFormData({ ...complaintFormData, email: e.target.value })}
                          placeholder="email@example.com"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">मोबाइल नंबर</label>
                        <input
                          type="tel"
                          value={complaintFormData.phone}
                          onChange={(e) => setComplaintFormData({ ...complaintFormData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">आपत्ति की श्रेणी <span className="text-red-600">*</span></label>
                        <select
                          value={complaintFormData.grievanceCategory}
                          onChange={(e) => setComplaintFormData({ ...complaintFormData, grievanceCategory: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
                        >
                          <option>तथ्यात्मक त्रुटि (Factual Inaccuracy)</option>
                          <option>मानहानिकारक सामग्री (Defamation / Reputation Damage)</option>
                          <option>गोपनीयता का उल्लंघन (Breach of Privacy)</option>
                          <option>कॉपीराइट / बौद्धिक संपदा उल्लंघन (Copyright Infringement)</option>
                          <option>आचार संहिता उल्लंघन (Violation of Code of Ethics)</option>
                          <option>अन्य वैधानिक आपत्ति (Other Legal Objection)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">संबंधित समाचार का लिंक अथवा शीर्षक</label>
                      <input
                        type="text"
                        value={complaintFormData.articleUrl}
                        onChange={(e) => setComplaintFormData({ ...complaintFormData, articleUrl: e.target.value })}
                        placeholder="https://khabridost.com/news/... अथवा खबर का शीर्षक"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">
                        आपत्ति का विस्तृत विवरण एवं तथ्यात्मक आधार <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={complaintFormData.objectionDetails}
                        onChange={(e) => setComplaintFormData({ ...complaintFormData, objectionDetails: e.target.value })}
                        placeholder="विवादित समाचार का कौन सा भाग अनुचित/त्रुटिपूर्ण है और सही तथ्य क्या है..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">समर्थक साक्ष्य अथवा दस्तावेज लिंक</label>
                      <input
                        type="text"
                        value={complaintFormData.evidenceLinks}
                        onChange={(e) => setComplaintFormData({ ...complaintFormData, evidenceLinks: e.target.value })}
                        placeholder="सरकारी राजपत्र, न्यायालयीन आदेश अथवा साक्ष्य URL (यदि कोई हो)"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
                      />
                    </div>

                    {/* Declaration Checkbox */}
                    <label className="flex items-start space-x-2.5 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        required
                        checked={complaintFormData.declarationAgreed}
                        onChange={(e) => setComplaintFormData({ ...complaintFormData, declarationAgreed: e.target.checked })}
                        className="mt-1 w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                      />
                      <span className="text-xs text-slate-600 leading-normal">
                        मैं प्रमाणित करता हूँ कि उपरोक्त विवरण मेरे सर्वोत्तम ज्ञान के अनुसार सत्य एवं निष्ठापूर्वक दिया गया है। मैं समझता हूँ कि झूठी शिकायत वैधानिक दायित्व का विषय हो सकती है।
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={complaintSubmitting}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-xl transition cursor-pointer flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
                    >
                      {complaintSubmitting ? (
                        <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span>{complaintSubmitting ? 'दर्ज हो रहा है...' : 'औपचारिक वैधानिक शिकायत दर्ज करें'}</span>
                    </button>
                  </form>
                )}
              </div>
            ) : currentPolicyId === 'about' ? (
              /* VIEW C: ABOUT US EDITORIAL PROFILE */
              <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-sm space-y-6">
                <div className="space-y-2 border-b border-slate-100 pb-5">
                  <span className="inline-flex items-center space-x-1.5 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5" />
                    <span>राष्ट्रीय डिजिटल समाचार संस्थान</span>
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black font-kd-headline text-slate-900">
                    {hf.siteTitle || 'खबरी दोस्त'} (Khabri Dost)
                  </h2>
                  <p className="text-red-600 font-bold text-sm sm:text-base">
                    संपादकीय ध्येय वाक्य: {editorialMotto}
                  </p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-kd-body">
                  <p>
                    खबरी दोस्त भारत का एक स्वतंत्र, निष्पक्ष एवं जन-सरोकारों को समर्पित डिजिटल समाचार नेटवर्क है। हमारा उद्देश्य बिना किसी राजनीतिक, धार्मिक या कॉरपोरेट समझौते के जमीनी भारत की सच्ची रिपोर्ट, तथ्यपरक विश्लेषण और खोजी पत्रकारिता को पाठकों तक पहुँचाना है।
                  </p>
                  <p>
                    हमारा मानना है कि सशक्त लोकतंत्र के लिए निष्पक्ष प्रेस अनिवार्य है। इसीलिए हम तथ्यों की जांच, सुधार और पारदर्शिता को अपनी संपादकीय प्रक्रिया का हिस्सा बनाते हैं।
                  </p>
                </div>

                {/* Quick Contact Button */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleSelectPolicy('contact')}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    संपादकीय टीम से संपर्क करें ➔
                  </button>
                  <button
                    onClick={() => handleSelectPolicy('ethics')}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                  >
                    संपादकीय आचार संहिता पढ़ें
                  </button>
                </div>
              </div>
            ) : (
              /* VIEW D: STANDARD LEGAL POLICY DOCUMENT */
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
                {/* Document Header & Verification Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black font-kd-headline text-slate-900">
                        {currentDef.title}
                      </h2>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5 font-mono">
                        <span>आधिकारिक प्रलेख • प्रभावी वर्ष 2026</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold">सत्यापित अनुपालन</span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Quick Editor Action */}
                  {isAdmin && currentDef.key && (
                    <div className="flex items-center space-x-2 shrink-0">
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>एडिट करें</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleSave}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>सहेजें</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditText(currentText);
                              setIsEditing(false);
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer"
                          >
                            रद्द करें
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {saveSuccess && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2 animate-fadeIn font-bold">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>नीति सफलतापूर्वक अपडेट हो गई है!</span>
                  </div>
                )}

                {/* In-Place Admin Markdown / Textarea Editor */}
                {isEditing ? (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-kd-meta">
                      नीति की सामग्री संपादित करें (Direct Content Editor)
                    </label>
                    <textarea
                      rows={18}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono leading-relaxed"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>💡 परिवर्तन सहेजने पर यह तुरंत पोर्टल पर सभी पाठकों के लिए लाइव हो जाएगा।</span>
                      <span>{editText.length} अक्षर • {editText.split(/\s+/).filter(Boolean).length} शब्द</span>
                    </div>
                  </div>
                ) : (
                  /* High-Legibility Structured Editorial Body */
                  <div className="space-y-6">
                    {/* Grievance Quick Action Callout if on Grievance Redressal */}
                    {currentPolicyId === 'grievance' && (
                      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 text-xs text-amber-950">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 font-bold text-sm text-amber-950">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span>त्वरित वैधानिक शिकायत प्रेषण (Statutory Quick Desk)</span>
                          </div>
                          <span className="text-[10px] font-mono bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                            Rule 11 IT Rules
                          </span>
                        </div>
                        <p className="leading-relaxed">
                          सूचना प्रौद्योगिकी नियम 2021 के अंतर्गत खबरी दोस्त पर प्रकाशित किसी भी समाचार के संबंध में वैधानिक शिकायत दर्ज करने के लिए हमारे ऑनलाइन शिकायत पोर्टल का उपयोग करें अथवा शिकायत निवारण अधिकारी को सीधे ईमेल प्रेषित करें।
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSelectPolicy('complaint')}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition cursor-pointer flex items-center space-x-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>ऑनलाइन शिकायत दर्ज करें (Online Form) ➔</span>
                          </button>
                          <a
                            href={`mailto:${officialEmail}`}
                            className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-100 transition flex items-center space-x-1.5"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>{officialEmail} पर ईमेल करें</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Fact-Checking Trust Stamp if on Fact Check */}
                    {currentPolicyId === 'factCheck' && (
                      <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-2 text-xs text-red-950">
                        <div className="flex items-center space-x-2 font-bold text-sm text-red-900">
                          <CheckCircle2 className="w-4 h-4 text-red-600" />
                          <span>तथ्य-जांच अनुरोध डेस्क (Reader Fact-Check Tip)</span>
                        </div>
                        <p className="leading-relaxed">
                          यदि आपको किसी सोशल मीडिया दावे, वायरल वीडियो अथवा प्रसारित खबर पर संदेह है, तो हमारे संपादकीय फैक्ट-चेकर्स को जांच हेतु प्रेषित करें।
                        </p>
                        <button
                          type="button"
                          onClick={() => handleSelectPolicy('contact')}
                          className="text-red-700 font-bold underline hover:text-red-900 text-xs"
                        >
                          तथ्य-जांच अनुरोध भेजें ➔
                        </button>
                      </div>
                    )}

                    {/* Privacy Policy AdSense / DPDP Stamp */}
                    {currentPolicyId === 'privacy' && (
                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2 text-xs text-blue-950">
                        <div className="flex items-center space-x-2 font-bold text-sm text-blue-900">
                          <Lock className="w-4 h-4 text-blue-600" />
                          <span>Google AdSense एवं DPDP Act 2023 अनुपालन सूचना</span>
                        </div>
                        <p className="leading-relaxed">
                          यह पोर्टल Google प्रकाशक नीतियों, DoubleClick DART कुकी नियमों तथा भारतीय डिजिटल व्यक्तिगत डेटा संरक्षण कानून के तहत पाठकों के डेटा की पूर्ण सुरक्षा सुनिश्चित करता है।
                        </p>
                      </div>
                    )}

                    {/* Cookie Policy Banner */}
                    {currentPolicyId === 'cookies' && (
                      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2 text-xs text-indigo-950">
                        <div className="flex items-center space-x-2 font-bold text-sm text-indigo-900">
                          <Sliders className="w-4 h-4 text-indigo-600" />
                          <span>कुकीज़ एवं पारदर्शी पाठक अनुभव</span>
                        </div>
                        <p className="leading-relaxed">
                          आप किसी भी समय अपने ब्राउज़र सेटिंग्स से कुकीज़ को अक्षम कर सकते हैं। अधिक जानकारी हेतु Google विज्ञापन गोपनीयता दिशानिर्देश देखें।
                        </p>
                      </div>
                    )}

                    {/* Formatted Sections or Fallback Pre-line */}
                    {sections.length > 0 ? (
                      <div className="space-y-6">
                        {sections.map((sec, idx) => (
                          <div
                            key={sec.anchorId}
                            id={sec.anchorId}
                            className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3 transition scroll-mt-20 hover:border-slate-300"
                          >
                            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-kd-headline">
                                {sec.title}
                              </h3>
                            </div>
                            <div className={`text-slate-800 ${fontClass} whitespace-pre-line font-kd-body`}>
                              {sec.lines.join('\n').trim()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`prose prose-slate max-w-none text-slate-800 ${fontClass} whitespace-pre-line font-kd-body bg-slate-50/60 p-6 rounded-2xl border border-slate-200`}>
                        {currentText}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Document Stamp & Regulatory Assurance */}
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 font-kd-meta">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>प्रकाशक द्वारा जारी नीति</span>
                  </div>
                  <div className="flex items-center space-x-3 font-mono text-[11px]">
                    {hf.rniNumber && hf.showRniNumber && (
                      <>
                        <span>RNI: {hf.rniNumber}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{hf.siteTitle || 'खबरी दोस्त'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
