import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import jsPDF from 'jspdf';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function BusinessPermitDocumentation() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [pdfUrls, setPdfUrls] = useState<string[]>([]);
  const [currentPdfIndex, setCurrentPdfIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleBackNavigation = () => {
    navigate('/record/clearances/businesspermit');
  };

  const processPurposes = () => {
    if (!state?.purpose) return ["unknown"];
    if (Array.isArray(state.purpose)) {
      return state.purpose.map((p: string) => p.toLowerCase().trim());
    }
    if (typeof state.purpose === 'string' && state.purpose.includes(',')) {
      return state.purpose.split(',').map((p: string) => p.toLowerCase().trim());
    }
    return [state.purpose.toLowerCase().trim()];
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const generatePdfFromTemplate = async (templateData: any, requestData: any) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 72;
      const lineHeight = 14;
      const sectionGap = 20;
      let yPos = margin;
      if (templateData.temp_header && templateData.temp_header !== "no-image-url-fetched") {
        const imageHeight = 130;
        try {
          doc.addImage(templateData.temp_header, "PNG", margin, yPos, pageWidth - margin * 2, imageHeight);
          yPos += imageHeight + 30;
        } catch (e) {
          console.error("Error adding header image:", e);
        }
        yPos += 10;
      }
      if (templateData.temp_below_headerContent) {
        doc.setFontSize(10);
        doc.setFont("times", "normal");
        const belowHeaderLines = doc.splitTextToSize(templateData.temp_below_headerContent, pageWidth - margin * 2);
        for (let i = 0; i < belowHeaderLines.length; i++) {
          if (yPos + lineHeight > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
          }
          doc.text(belowHeaderLines[i], margin, yPos);
          yPos += lineHeight;
        }
        yPos += 20;
      }
      if (templateData.temp_title) {
        doc.setFont("times", "bold");
        doc.setFontSize(16);
        const titleWidth = doc.getTextWidth(templateData.temp_title);
        doc.text(templateData.temp_title, (pageWidth - titleWidth) / 2, yPos);
        yPos += lineHeight;
      } else {
        doc.setFont("times", "bold");
        doc.setFontSize(16);
        const defaultTitle = "BUSINESS PERMIT";
        const titleWidth = doc.getTextWidth(defaultTitle);
        doc.text(defaultTitle, (pageWidth - titleWidth) / 2, yPos);
        yPos += lineHeight;
      }
      if (templateData.temp_subtitle) {
        doc.setFont("times", "normal");
        doc.setFontSize(9);
        const subtitleWidth = doc.getTextWidth(templateData.temp_subtitle);
        doc.text(templateData.temp_subtitle, (pageWidth - subtitleWidth) / 2, yPos);
        yPos += 10;
      }
      if (templateData.temp_body) {
        const bodyText = templateData.temp_body;
        const businessName = requestData.businessName || 'Unknown';
        const businessAddress = requestData.businessAddress || 'Unknown';
        const dateValue = formatDate(requestData.date) || 'Unknown';
        doc.setFont("times", "normal");
        doc.setFontSize(10);
        yPos += sectionGap;
        const contentWidth = pageWidth - margin * 2;
        const processedText = bodyText
          .replace(/\[BUSINESS NAME\]/g, businessName)
          .replace(/\[BUSINESS_ADDRESS\]/g, businessAddress)
          .replace(/\[BUSINESS ADDRESS\]/g, businessAddress)
          .replace(/\[DATE\]/g, dateValue);
        const lines = processedText.split('\n');
        for (const line of lines) {
          if (line.trim() === '') {
            yPos += lineHeight;
            continue;
          }
          const wrappedLines = doc.splitTextToSize(line, contentWidth);
          for (const wrappedLine of wrappedLines) {
            if (yPos + lineHeight > pageHeight - margin) {
              doc.addPage();
              yPos = margin;
            }
            if (
              wrappedLine.includes(businessName) ||
              wrappedLine.includes(businessAddress) ||
              wrappedLine.includes(dateValue)
            ) {
              const parts = wrappedLine.split(new RegExp(`(${businessName}|${businessAddress}|${dateValue})`, 'g'));
              let currentX = margin;
              for (const part of parts) {
                if (part === businessName || part === businessAddress || part === dateValue) {
                  doc.setFont("times", "bold");
                  doc.text(part, currentX, yPos);
                  currentX += doc.getTextWidth(part);
                } else if (part.trim() !== '') {
                  doc.setFont("times", "normal");
                  doc.text(part, currentX, yPos);
                  currentX += doc.getTextWidth(part);
                }
              }
            } else {
              doc.setFont("times", "normal");
              doc.text(wrappedLine, margin, yPos);
            }
            yPos += lineHeight;
          }
        }
      }
      if (templateData.temp_w_sign) {
        yPos += 40;
        doc.setFontSize(10);
        const footerY = pageHeight - margin - 120;
        doc.setFont("times", "normal");
        doc.text("Name and signature of Applicant", margin, footerY);
        doc.text("Certified true and correct:", margin, footerY + 20);
        doc.setFont("times", "bold");
        doc.text("HON. VIRGINIA N. ABENOJA", margin, footerY + 60);
        doc.setFont("times", "normal");
        doc.text("Punong Barangay, San Roque Ciudad", margin, footerY + 80);
      }
      const blob = doc.output("blob");
      return blob;
    } catch (error) {
      console.error('Error generating PDF from template:', error);
      throw error;
    }
  };

  const requestData = {
    businessName: state?.businessName || "Unknown",
    businessAddress: state?.businessAddress || "Unknown",
    purposes: processPurposes(),
    date: state?.dateClaim || "Unknown",
    requestId: state?.requestNo || "",
    requestDate: state?.dateRequested || "",
    paymentMethod: state?.paymentMethod || "",
  };

  const getPdfPathByPurpose = (purpose: string) => {
    switch (purpose.toLowerCase()) {
      case "business permit":
      case "commercial building permit":
      case "residential permit":
      case "water connection permit (commercial)":
      case "water connection permit (residential)":
      case "electrical permit connection (commercial)":
        return "Business-Permit.pdf";
      default:
        return "Default.pdf";
    }
  };

  const modifySinglePdf = async (purpose: string) => {
    try {
      // Fetch the business permit template from the council API
      const response = await fetch('http://localhost:8000/council/template/');
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.statusText}`);
      }
      const templateDataArr = await response.json();
      let template = null;
      // Prefer temp_filename if present (match to purpose)
      const filename = (state?.purpose || '').trim();
      if (filename) {
        template = templateDataArr.find((t: any) => t.temp_filename?.toLowerCase() === filename.toLowerCase());
      }
      // Fallback to business keyword logic
      if (!template) {
        template = templateDataArr.find((t: any) =>
          t.temp_title?.toLowerCase().includes('business') ||
          t.temp_body?.toLowerCase().includes('business')
        );
      }
      if (!template) template = templateDataArr[0];
      // Generate PDF from template data
      const pdfBytes = await generatePdfFromTemplate(template, requestData);
      return pdfBytes;
    } catch (error) {
      // Fallback to static PDF from Supabase
      try {
        const { data, error: supaError } = await supabase
          .storage
          .from('clerk-documents')
          .download(getPdfPathByPurpose(purpose));
        if (supaError) throw supaError;
        if (!data) throw new Error('No PDF data returned');
        return data;
      } catch (fallbackError) {
        // Fallback to local default PDF
        const fallbackResponse = await fetch("/src/assets/pdfs/Default.pdf");
        const fallbackBytes = await fallbackResponse.arrayBuffer();
        return new Blob([fallbackBytes], { type: "application/pdf" });
      }
    }
  };

  const modifyPdfs = async () => {
    setIsLoading(true);
    setError(null);
    const urls: string[] = [];
    try {
      for (const purpose of requestData.purposes) {
        try {
          const result = await modifySinglePdf(purpose);
          const blob = new Blob([result], { type: "application/pdf" });
          urls.push(URL.createObjectURL(blob));
        } catch (error) {
          const fallbackResponse = await fetch("/src/assets/pdfs/Default.pdf");
          const fallbackBytes = await fallbackResponse.arrayBuffer();
          const blob = new Blob([fallbackBytes], { type: "application/pdf" });
          urls.push(URL.createObjectURL(blob));
        }
      }
      if (urls.length === 0) {
        throw new Error("No valid PDFs could be generated");
      }
      setPdfUrls(urls);
    } catch (error) {
      setError("Failed to generate documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (!iframeRef.current || pdfUrls.length === 0) return;
    const iframe = iframeRef.current;
    const printIframe = () => {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
    };
    if (iframe.contentDocument?.readyState === "complete") {
      printIframe();
    } else {
      iframe.onload = printIframe;
    }
  };

  const goToNextPdf = () => {
    setCurrentPdfIndex((prev) => (prev + 1) % pdfUrls.length);
  };

  const goToPrevPdf = () => {
    setCurrentPdfIndex((prev) => (prev - 1 + pdfUrls.length) % pdfUrls.length);
  };

  useEffect(() => {
    modifyPdfs();
    return () => {
      pdfUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBackNavigation}
          className="bg-[#1273B8] text-white flex items-center gap-2 px-4 py-2 rounded-lg shadow hover:bg-[#0e5a8f] transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>
      </div>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p>{error}</p>
        </div>
      )}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-gray-600">Loading documents...</p>
        </div>
      ) : pdfUrls.length > 0 ? (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg shadow">
            <button
              onClick={goToPrevPdf}
              disabled={pdfUrls.length <= 1}
              className={`p-2 rounded-full ${pdfUrls.length > 1 ? "text-[#1273B8] hover:bg-gray-100" : "text-gray-400 cursor-not-allowed"}`}
            >
              <ChevronLeft size={28} />
            </button>
            <div className="text-center">
              <p className="text-lg text-gray-500 font-semibold">
                Document {currentPdfIndex + 1} of {pdfUrls.length}
              </p>
            </div>
            <button
              onClick={goToNextPdf}
              disabled={pdfUrls.length <= 1}
              className={`p-2 rounded-full ${pdfUrls.length > 1 ? "text-[#1273B8] hover:bg-gray-100" : "text-gray-400 cursor-not-allowed"}`}
            >
              <ChevronRight size={28} />
            </button>
          </div>
          <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
            <iframe
              ref={iframeRef}
              src={`${pdfUrls[currentPdfIndex]}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-full min-h-[70vh] border-none"
              title={`Generated Document - ${requestData.purposes[currentPdfIndex]}`}
              onLoad={() => {
                if (iframeRef.current) {
                  iframeRef.current.style.visibility = "visible";
                }
              }}
              style={{ visibility: "hidden" }}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">No documents available to display.</p>
        </div>
      )}
      <div className="flex justify-end mt-6">
        <button
          onClick={handlePrint}
          disabled={isLoading || pdfUrls.length === 0}
          className={`bg-[#16396d] text-white px-6 py-3 rounded-lg shadow hover:bg-[#1e4b8a] transition-colors ${
            isLoading || pdfUrls.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Print Current Document
        </button>
      </div>
    </div>
  );
}
