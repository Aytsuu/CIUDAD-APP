import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { PDFDocument } from 'pdf-lib';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize the Supabase client directly here
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ViewDocumentation() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [pdfUrls, setPdfUrls] = useState<string[]>([]);
  const [currentPdfIndex, setCurrentPdfIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const requestData = {
    name: state?.name || "Unknown",
    purposes: processPurposes(),
    date: state?.date || "Unknown",
  };

  const getPdfPathByPurpose = (purpose: string) => {
    switch (purpose.toLowerCase()) {
      case "barangay clearance":
      case "clearance":
      case "certification":
      case "employment":
      case "nso-gsis-sss":
      case "hospitalization-champ":
      case "birth certificate":
      case "medical assistance":
      case "residency":
      case "police requirement":
      case "burial":
      case "death":
      case "indigency-claim":
      case "complaint":
      case "filing-fee":
      case "certificate-to-file-action":
        return "Barangay-Clearance.pdf"; // File name in Supabase bucket
      case "indigency":
      case "indigent":
        return "Barangay-Indigency.pdf"; // File name in Supabase bucket
      case "business permit":
      case "business":
      case "permit":
        return "Business-Permit.pdf"; // File name in Supabase bucket
      default:
        return "Default.pdf"; // Default fallback file in Supabase bucket
    }
  };          

  const modifySinglePdf = async (purpose: string) => {
    try {
      // Fetch PDF URL from Supabase bucket
      const { data, error } = await supabase
        .storage
        .from('clerk-documents') // Supabase bucket name
        .download(getPdfPathByPurpose(purpose)); // Fetch file by name or path in Supabase bucket

      if (error) {
      console.error(`Error fetching PDF for ${purpose}:`, error.message);
      throw error;
    }

      if (!data) {
      console.error(`No data returned for ${purpose}`);
      throw new Error("No PDF data returned");
    }
      
      // Convert the downloaded data to a blob
      const pdfBlob = new Blob([data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Modify the PDF logic
      const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();

      // Fill the form fields
      form.getTextField("RequestName")?.setText(requestData.name);
      form.getTextField("RequestPurpose")?.setText(purpose);
      form.getTextField("RequestDate")?.setText(requestData.date);
      form.flatten();

      return await pdfDoc.save();
    } catch (error) {
      console.error(`Error processing ${purpose}:`, error);
      throw error;
    }
  };

  const modifyPdfs = async () => {
    setIsLoading(true);
    setError(null);
    const urls: string[] = [];
    
    try {
      for (const purpose of requestData.purposes) {
        try {
          const pdfBytes = await modifySinglePdf(purpose);
          const blob = new Blob([pdfBytes], { type: "application/pdf" });
          urls.push(URL.createObjectURL(blob));
        } catch (error) {
          console.error(`Skipping ${purpose} due to error`);
          // Add fallback PDF for failed purposes
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
      console.error("PDF processing failed:", error);
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
          onClick={() => navigate(-1)}
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
          {/* Document navigation header */}
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

          {/* PDF Viewer */}
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

      {/* Print Button */}
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
