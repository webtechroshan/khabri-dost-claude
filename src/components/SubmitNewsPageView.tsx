import React, { useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Video,
  Upload,
  Send,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  FileText,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  X,
  Image as ImageIcon,
  Lock,
  Phone,
  Mail,
  Building2,
  Sparkles,
  Link2,
} from 'lucide-react';
import { PortalSettings, NewsCategory } from '../types/news';
import { submitCitizenNews } from '../services/newsService';
import { compressImage } from '../utils/imageCompressor';
import { DEFAULT_HEADER_FOOTER_SETTINGS } from '../data/portalDefaults';

export interface CitizenNewsSubmission {
  id: string;
  title: string;
  category: NewsCategory | string;
  location: string;
  incidentDate: string;
  description: string;
  images: string[];
  videoUrl?: string;
  senderName: string;
  senderPhone?: string;
  senderEmail?: string;
  isAnonymous: boolean;
  submittedAt: string;
  status: 'pending' | 'verified' | 'rejected' | 'published';
}

interface SubmitNewsPageViewProps {
  onBackToHome: () => void;
  portalSettings?: PortalSettings;
  onSubmitNews?: (submission: CitizenNewsSubmission) => void;
  onOpenContactPage?: () => void;
}

export const SubmitNewsPageView: React.FC<SubmitNewsPageViewProps> = ({
  onBackToHome,
  portalSettings,
  onSubmitNews,
  onOpenContactPage,
}) => {
  const hf = portalSettings?.headerFooter || DEFAULT_HEADER_FOOTER_SETTINGS;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('national');
  const [location, setLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Handle local image file selections (up to 3 images)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 3 - images.length;
    if (remainingSlots <= 0) {
      alert('आप अधिकतम 3 तस्वीरें ही अपलोड कर सकते हैं।');
      return;
    }

    const filesToRead = Array.from(files).slice(0, remainingSlots);

    filesToRead.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`फ़ाइल "${file.name}" का साइज़ 5MB से अधिक है। कृपया छोटी फ़ाइल चुनें।`);
        return;
      }

      // Shrink to ~1000px WebP so three photos fit in one Firestore document (1 MB limit).
      compressImage(file, { maxWidth: 1000, maxHeight: 1000, quality: 0.7 })
        .then((r) => {
          if (r.dataUrl.length > 280_000) {
            alert(`फ़ाइल "${file.name}" बहुत बड़ी है। कृपया छोटी तस्वीर चुनें।`);
            return;
          }
          setImages((prev) => (prev.length < 3 ? [...prev, r.dataUrl] : prev));
        })
        .catch(() => alert(`फ़ाइल "${file.name}" पढ़ी नहीं जा सकी।`));
    });

    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !location.trim()) {
      alert('कृपया शीर्षक, घटना का स्थान और खबर का विवरण अवश्य भरें।');
      return;
    }

    if (!isAnonymous && !senderName.trim() && !senderPhone.trim()) {
      alert('कृपया अपना नाम या मोबाइल नंबर दर्ज करें, या फिर "मेरी पहचान गुप्त रखें" चुनें।');
      return;
    }

    setIsSubmitting(true);
    const ticketId = `NEWS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmitError(null);

    const submission: CitizenNewsSubmission = {
      id: ticketId,
      title: title.trim(),
      category,
      location: location.trim(),
      incidentDate: incidentDate || new Date().toISOString().split('T')[0],
      description: description.trim(),
      images,
      videoUrl: videoUrl.trim() || undefined,
      senderName: isAnonymous ? 'गोपनीय पाठक (व्हिसलब्लोअर)' : (senderName.trim() || 'नागरिक पत्रकार'),
      senderPhone: senderPhone.trim() || undefined,
      senderEmail: senderEmail.trim() || undefined,
      isAnonymous,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    if (honeypot) {
      // Bots fill the hidden field; pretend success without storing anything.
      setIsSubmitting(false);
      setSubmittedTicket(ticketId);
      return;
    }
    submitCitizenNews(submission)
      .then(() => {
        onSubmitNews?.(submission);
        setSubmittedTicket(ticketId);
      })
      .catch((err) => {
        console.warn('Submission failed:', err);
        setSubmitError('ख़बर भेजी नहीं जा सकी। कृपया इंटरनेट जांचें और दोबारा कोशिश करें।');
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleReset = () => {
    setTitle('');
    setCategory('national');
    setLocation('');
    setIncidentDate('');
    setDescription('');
    setImages([]);
    setVideoUrl('');
    setSenderName('');
    setSenderPhone('');
    setSenderEmail('');
    setIsAnonymous(false);
    setSubmittedTicket(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 animate-fadeIn font-kd-body">
      {/* 1. TOP BREADCRUMB STRIP */}
      <div className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToHome}
              className="bg-white/10 hover:bg-red-600 text-white px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition cursor-pointer border border-white/15"
              title="मुख्य पृष्ठ पर वापस जाएं"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>

            <div className="hidden sm:flex items-center space-x-2 text-slate-400 font-kd-meta">
              <span className="cursor-pointer hover:text-white" onClick={onBackToHome}>
                Home
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-red-400 font-bold">अपनी खबर भेजें (Citizen Reporter)</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-300 font-mono text-[11px]">
            <span className="flex items-center space-x-1.5 bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 px-2.5 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Direct Newsroom Tip Line</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. HERO HEADER - CITIZEN REPORTER BRANDING */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white py-10 sm:py-14 border-b border-red-900/40 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              <Camera className="w-3.5 h-3.5" />
              <span>नागरिक पत्रकार डेस्क (Citizen Reporter)</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>100% स्रोत गोपनीयता सुरक्षा</span>
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-black font-kd-header tracking-tight text-white leading-tight">
              क्या आपके पास कोई बड़ी खबर या जनसमस्या है?
            </h1>
            <p className="text-sm sm:text-base text-amber-400 font-kd-headline font-bold">
              सीधे खबरी दोस्त न्यूज़ रूम को भेजें • सच सामने लाएं
            </p>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed font-kd-body">
            अपने इलाके की घटना, भ्रष्टाचार, टूटी सड़कें, अस्पताल या स्कूल की बदहाली, या कोई सकारात्मक पहल की खबर हमें भेजें। हमारी संपादकीय टीम तथ्यों की जांच कर उसे प्रमुखता से प्रकाशित करेगी।
          </p>
        </div>
      </div>

      {/* 3. MAIN FORM & INSTRUCTIONS CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-lg space-y-6">
          {submittedTicket ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-emerald-950">आपकी खबर सफलतापूर्वक प्राप्त हुई!</h3>
                <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
                  आपकी खबर संपादकीय डेस्क के पास पहुँच गई है। सत्यापन के बाद इसे खबरी दोस्त पर प्रकाशित किया जाएगा।
                </p>
              </div>

              <div className="inline-block p-3.5 rounded-xl bg-white border border-emerald-300 font-mono font-bold text-sm text-slate-900 shadow-xs">
                ट्रैकिंग टिकट ID: {submittedTicket}
              </div>

              <div className="pt-3 flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  एक और खबर भेजें
                </button>
                <button
                  onClick={onBackToHome}
                  className="bg-white hover:bg-slate-100 text-slate-800 font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer border border-slate-300"
                >
                  मुख्य पृष्ठ पर जाएं
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
              {/* Anti-spam bot trap (hidden honeypot) */}
              <input
                type="text"
                name="website_hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none', position: 'absolute', left: '-9999px' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              {/* SECTION 1: NEWS DETAILS */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-kd-headline">
                    1. खबर का मुख्य विवरण (News Details)
                  </h3>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    खबर का मुख्य शीर्षक (Headline) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="उदा. लखनऊ-कानपुर हाईवे पर बड़ा हादसा, प्रशासन ने शुरू किया राहत कार्य..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-kd-body text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800">खबर का विषय (Category)</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-kd-body text-xs sm:text-sm"
                    >
                      <option value="national">देश / राष्ट्रीय</option>
                      <option value="politics">राजनीति</option>
                      <option value="state">राज्य व शहर समाचार</option>
                      <option value="sports">खेल</option>
                      <option value="business">व्यापार व रोजगार</option>
                      <option value="tech">तकनीक</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800">
                      घटना का स्थान (City / District) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="उदा. वाराणसी, उत्तर प्रदेश"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-kd-body text-xs sm:text-sm"
                    />
                  </div>

                  {/* Incident Date */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800">घटना की तारीख (Date)</label>
                    <input
                      type="date"
                      value={incidentDate}
                      onChange={(e) => setIncidentDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-kd-body text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    पूरी खबर का विवरण (Detailed News Report) <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="घटना कब, कहाँ और कैसे हुई? कौन-कौन लोग शामिल हैं? चश्मदीदों या अधिकारियों का क्या कहना है? पूरी बात आसान शब्दों में लिखें..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-kd-body text-xs sm:text-sm leading-relaxed"
                  />
                </div>
              </div>

              {/* SECTION 2: IMAGES UPLOAD (2-3 IMAGES OPTION AS REQUESTED) */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-red-600" />
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 font-kd-headline">
                      2. घटना से जुड़ी तस्वीरें (Upload 2-3 Images)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {images.length} / 3 तस्वीरें चुनी गईं
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  घटनास्थल, ज्ञापन, सरकारी आदेश या समस्या से जुड़ी <strong>अधिकतम 3 तस्वीरें</strong> अपलोड करें (प्रत्येक तस्वीर अधिकतम 5MB तक)।
                </p>

                {/* Upload Button & Previews */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {images.map((imgSrc, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-2xl overflow-hidden border-2 border-red-500 shadow-sm aspect-[4/3] bg-slate-100 group"
                    >
                      <img src={imgSrc || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 hover:bg-red-600 text-white transition cursor-pointer shadow-md"
                        title="तस्वीर हटाएं"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <span className="absolute bottom-2 left-2 text-[10px] bg-slate-950/70 text-white px-2 py-0.5 rounded font-mono">
                        फोटो {idx + 1}
                      </span>
                    </div>
                  ))}

                  {images.length < 3 && (
                    <label className="border-2 border-dashed border-slate-300 hover:border-red-500 bg-slate-50 hover:bg-red-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition aspect-[4/3] group">
                      <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-xs text-slate-800">तस्वीर अपलोड करें</span>
                      <span className="text-[10px] text-slate-500 mt-1">JPG, PNG या WEBP</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* SECTION 3: VIDEO UPLOAD / LINK OPTION (STRICTLY AS REQUESTED) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <Video className="w-4 h-4 text-red-600" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-kd-headline">
                    3. वीडियो फुटेज (Video Link)
                  </h3>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs leading-relaxed space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>वीडियो भेजने का आसान तरीका:</span>
                  </div>
                  <p>
                    यदि आपके पास घटना का कोई वीडियो फुटेज है, तो उसे <strong>YouTube (Unlisted)</strong>, <strong>Google Drive</strong> या <strong>Zip फ़ाइल (WeTransfer/DropBox)</strong> में अपलोड करके उसका शेयर लिंक (URL) नीचे दिए गए बॉक्स में पेस्ट करें।
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">वीडियो शेयर लिंक (YouTube / Drive / Zip Link)</label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtu.be/... या https://drive.google.com/..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-kd-body text-xs sm:text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: SENDER DETAILS & CONFIDENTIALITY */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-red-600" />
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 font-kd-headline">
                      4. प्रेषक की जानकारी एवं गोपनीयता (Reporter Information)
                    </h3>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>पूर्ण सुरक्षा</span>
                  </span>
                </div>

                {/* Anonymous Checkbox */}
                <label className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                      मेरी पहचान 100% गोपनीय रखें (Keep my identity confidential)
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      आपका नाम, फोन नंबर या पहचान किसी भी स्थिति में सार्वजनिक या किसी अधिकारी के साथ साझा नहीं की जाएगी।
                    </span>
                  </div>
                </label>

                {!isAnonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-800">आपका नाम</label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="उदा. राहुल शर्मा"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-kd-body text-xs sm:text-sm"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-800">मोबाइल / व्हाट्सएप नंबर</label>
                      <input
                        type="tel"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-kd-body text-xs sm:text-sm"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-800">ईमेल (ऐच्छिक)</label>
                      <input
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-kd-body text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {submitError && (
                <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {submitError}
                </p>
              )}
              {/* SUBMIT BUTTON */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-2xl transition cursor-pointer flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 text-xs sm:text-sm"
                >
                  {isSubmitting ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? 'खबर भेजी जा रही है...' : 'संपादकीय डेस्क को खबर भेजें'}</span>
                </button>

                <button
                  type="button"
                  onClick={onBackToHome}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-2xl transition cursor-pointer text-xs sm:text-sm"
                >
                  रद्द करें
                </button>
              </div>

              <div className="text-center text-[11px] text-slate-400 font-kd-meta">
                आपातकालीन ब्रेकिंग न्यूज़ के लिए आप हमारे सीधे ईमेल{' '}
                <a href={`mailto:${hf.contactEmail || 'khabridost.com@gmail.com'}`} className="text-red-600 underline font-mono">
                  {hf.contactEmail || 'khabridost.com@gmail.com'}
                </a>{' '}
                पर भी संपर्क कर सकते हैं।
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
