/**
 * EPaper Edition Record
 * Authoritative PDF-first edition record for Khabri Dost
 */
export interface EPaperEditionRecord {
  id: string; // e.g. 'edition_2026-10-21_national'
  title?: string; // Edition title e.g. 'दैनिक खबरी दोस्त • राष्ट्रीय संस्करण'
  date: string; // YYYY-MM-DD e.g. '2026-10-21'
  editionName: string; // e.g. 'राष्ट्रीय संस्करण (नई दिल्ली)'
  editionCode: string; // e.g. 'national' | 'delhi' | 'up' | 'bihar' | 'rajasthan' | 'mp'
  pdfUrl: string; // Direct URL to uploaded PDF (e.g. '/uploads/epaper/2026-11-05-national.pdf')
  pdfFileName?: string;
  pdfFileSize?: string; // e.g. '28.6 MB'
  pageCount: number;
  thumbnailUrl?: string;
  leadHeadline?: string;
  description?: string;
  price?: string; // e.g. '₹ 4.50'
  issueNumber?: string; // e.g. 'वर्ष 1 • अंक 245'
  rniNumber?: string;
  status: 'published' | 'draft' | 'archived';
  allowDownload?: boolean;
  allowPrint?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Resolution result for EPaper Edition
 */
export type ResolvedEPaperMode =
  | {
      type: 'pdf';
      edition: EPaperEditionRecord;
      pdfUrl: string;
      totalPages: number;
      dateString: string;
    }
  | {
      type: 'not_available';
      edition?: EPaperEditionRecord;
      date: string;
      message: string;
    };
