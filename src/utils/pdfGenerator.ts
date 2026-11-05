import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { NewsArticle, PortalSettings } from '../types/news';
import { getTodayHindiDate } from './hindiHelpers';

/**
 * Downloads a publication-ready PDF of a single news article with masthead, headline,
 * metadata, featured image, full story, and official Khabri Dost verification stamp.
 */
export async function generateArticlePdf(
  article: NewsArticle,
  portalSettings?: PortalSettings
): Promise<boolean> {
  try {
    const siteTitle = portalSettings?.headerFooter?.siteTitle || 'खबरी दोस्त';
    const siteTagline = portalSettings?.headerFooter?.siteTagline || 'दैनिक राष्ट्रीय समाचार पत्र';
    const rni = portalSettings?.headerFooter?.rniNumber ? `RNI No: ${portalSettings.headerFooter.rniNumber}` : '';
    const todayHindi = getTodayHindiDate();

    // Create a temporary off-screen container styled specifically for high-DPI PDF printing
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-99999px';
    container.style.left = '-99999px';
    container.style.width = '794px'; // A4 standard width at 96 DPI
    container.style.minHeight = '1123px'; // A4 standard height
    container.style.backgroundColor = '#ffffff';
    container.style.color = '#111827';
    container.style.padding = '36px 40px';
    container.style.fontFamily = "'Mukta', sans-serif, -apple-system";
    container.style.boxSizing = 'border-box';
    container.style.zIndex = '-9999';

    // Format clean paragraphs
    const paragraphs = article.content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && !p.startsWith('[youtube:') && !p.startsWith('[tweet:') && !p.startsWith('[factcheck:'));

    // Safe sanitized image
    const hasImage = Boolean(article.imageUrl);

    container.innerHTML = `
      <div style="border-bottom: 3px double #dc2626; padding-bottom: 12px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; font-size: 11px; color: #4b5563;">
          <div>
            <strong>${todayHindi}</strong> • विशेष संस्करण
          </div>
          <div>
            ${rni ? `<span style="font-family: monospace; font-weight: bold; color: #991b1b;">${rni}</span> • ` : ''}
            <span>डिजिटल ई-संस्करण</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 10px;">
          <h1 style="font-size: 32px; font-weight: 900; margin: 0; color: #0f172a; letter-spacing: -0.5px; font-family: 'Rozha One', serif, -apple-system;">
            ${siteTitle}
          </h1>
          <p style="font-size: 11px; color: #dc2626; margin: 2px 0 0; font-weight: 600; text-transform: uppercase;">
            ${siteTagline}
          </p>
        </div>
      </div>

      <!-- Article Header -->
      <div style="margin-bottom: 14px;">
        <div style="display: inline-block; background-color: #fee2e2; color: #dc2626; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; margin-bottom: 6px;">
          ${article.category || 'ताज़ा ख़बर'}
        </div>
        <h2 style="font-size: 22px; font-weight: 800; line-height: 1.35; color: #0f172a; margin: 0 0 8px 0; font-family: 'Rozha One', serif, -apple-system;">
          ${article.title}
        </h2>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
          <div>
            <strong>रिपोर्टर:</strong> ${article.authorName || 'संवाददाता'} • <strong>स्थान:</strong> ${article.location || 'नई दिल्ली'}
          </div>
          <div>
            <strong>प्रकाशन:</strong> ${new Date(article.createdAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      <!-- Featured Image if available -->
      ${
        hasImage
          ? `
          <div style="margin-bottom: 16px; text-align: center;">
            <img 
              src="${article.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}" 
              alt="${article.title}" 
              crossorigin="anonymous"
              style="width: 100%; max-height: 320px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0;"
            />
            <div style="font-size: 10px; color: #64748b; font-style: italic; margin-top: 4px; text-align: right;">
              चित्र: खबरी दोस्त डिजिटल डेस्क / समाचार एजेंसी
            </div>
          </div>
        `
          : ''
      }

      <!-- Article Body (2-column newspaper typesetting) -->
      <div style="font-size: 12.5px; line-height: 1.75; color: #1e293b; text-align: justify; margin-bottom: 20px;">
        ${paragraphs
          .map(
            (p, idx) => `
          <p style="margin-bottom: 10px; text-indent: ${idx === 0 ? '0' : '16px'};">
            ${idx === 0 ? `<strong>${article.location || 'नई दिल्ली'}।</strong> ` : ''}${p}
          </p>
        `
          )
          .join('')}
      </div>

      <!-- Hindi Editorial Disclaimer (Simple & Easy Hindi) -->
      <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; font-size: 10.5px; line-height: 1.5; color: #713f12;">
        <strong style="color: #422006; display: block; margin-bottom: 3px;">
          ✓ संपादकीय नीति एवं सत्यता मानक (Editorial Standards):
        </strong>
        इस समाचार में प्रस्तुत सभी तथ्य व विवरण आधिकारिक बयानों, विश्वसनीय स्रोतों और जमीनी रिपोर्टिंग के आधार पर निष्पक्षता से तैयार किए गए हैं। हम जिम्मेदार पत्रकारिता के प्रति पूर्ण रूप से समर्पित हैं।
      </div>

      <!-- Footer Branding & QR Link -->
      <div style="border-top: 2px solid #0f172a; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b;">
        <div>
          <strong>${siteTitle}</strong> • राष्ट्र का सबसे विश्वसनीय हिंदी समाचार पोर्टल<br/>
          वेबसाइट: <span style="color: #dc2626;">www.khabridost.com</span> | ईमेल: ${portalSettings?.headerFooter?.contactEmail || 'khabridost.com@gmail.com'}
        </div>
        <div style="text-align: right; font-weight: bold; color: #0f172a;">
          पेज 1/1 • डिजिटल सुरक्षित प्रतिलिपि
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Wait briefly for layout
    await new Promise((resolve) => setTimeout(resolve, 300));

    let pdfGenerated = false;

    try {
      // Capture using html2canvas without tainting canvas
      const canvas = await html2canvas(container, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false, // Never taint canvas so toDataURL never throws
        imageTimeout: 3000,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc: Document) => {
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              box-sizing: border-box !important;
              color-scheme: light !important;
            }
          `;
          clonedDoc.head?.appendChild(style);
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      } else {
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }
      }

      const safeTitle = (article.title || 'khabri_dost_news')
        .replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_')
        .substring(0, 30);

      // Direct reliable blob download
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = `${safeTitle}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);

      pdfGenerated = true;
    } catch (renderError) {
      console.warn('Canvas capture fallback to printable PDF:', renderError);
      // Fallback: Generate clean text-based PDF directly with jsPDF
      const fallbackPdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      fallbackPdf.setFontSize(18);
      fallbackPdf.setTextColor(220, 38, 38);
      fallbackPdf.text(siteTitle, 14, 18);

      fallbackPdf.setFontSize(10);
      fallbackPdf.setTextColor(100, 116, 139);
      fallbackPdf.text(`${siteTagline} • ${todayHindi}`, 14, 25);

      fallbackPdf.setFontSize(14);
      fallbackPdf.setTextColor(15, 23, 42);
      const splitTitle = fallbackPdf.splitTextToSize(article.title, 180);
      fallbackPdf.text(splitTitle, 14, 35);

      let curY = 35 + splitTitle.length * 7;
      fallbackPdf.setFontSize(9);
      fallbackPdf.setTextColor(100, 116, 139);
      fallbackPdf.text(`संवाददाता: ${article.authorName || 'खबरी दोस्त'} | स्थान: ${article.location || 'नई दिल्ली'} | श्रेणी: ${article.category}`, 14, curY);

      curY += 8;
      if (article.summary) {
        fallbackPdf.setFontSize(10);
        fallbackPdf.setTextColor(51, 65, 85);
        const splitSummary = fallbackPdf.splitTextToSize(article.summary, 180);
        fallbackPdf.text(splitSummary, 14, curY);
        curY += splitSummary.length * 6 + 4;
      }

      fallbackPdf.setFontSize(10);
      fallbackPdf.setTextColor(30, 41, 59);
      const splitContent = fallbackPdf.splitTextToSize(article.content.replace(/\[.*?\]/g, ''), 180);
      fallbackPdf.text(splitContent, 14, curY);

      const safeTitle = (article.title || 'khabri_dost_news')
        .replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_')
        .substring(0, 30);

      fallbackPdf.save(`${safeTitle}.pdf`);
      pdfGenerated = true;
    } finally {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }

    return pdfGenerated;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return false;
  }
}

/**
 * Downloads a complete daily newspaper edition PDF directly from the stored/uploaded file.
 */
export async function downloadDailyEPaperPdf(
  portalSettings?: PortalSettings,
  _articles?: NewsArticle[],
  _pages?: any[],
  editionTitle?: string,
  dateString?: string,
  explicitPdfUrl?: string
): Promise<boolean> {
  const dateStr = dateString || new Date().toISOString().slice(0, 10);
  const pdfUrl = explicitPdfUrl || portalSettings?.epaperSettings?.customPdfUrl || '';
  if (!pdfUrl) return false;

  try {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `KhabriDost-EPaper-${editionTitle ? editionTitle.replace(/\s+/g, '-') : 'National'}-${dateStr}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Error downloading EPaper PDF:', err);
    window.open(pdfUrl, '_blank');
    return true;
  }
}
