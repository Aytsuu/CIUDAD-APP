// import { useEffect, useState, useRef } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
// import { modifySinglePdf, processPurposes } from "./queries/viewDocumentQueries";

// export default function ViewDocumentation() {
//   const navigate = useNavigate();
//   const { state } = useLocation();
//   const [pdfUrls, setPdfUrls] = useState<string[]>([]);
//   const [currentPdfIndex, setCurrentPdfIndex] = useState(0);
//   const iframeRef = useRef<HTMLIFrameElement>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const handleBackNavigation = () => {
//     if (state?.isIssued) {
//       navigate('/record/clearances/issuedcertificates');
//     } else {
//       navigate('/record/clearances/certification');
//     }
//   };

//   const requestData = {
//     name: state?.name || "Unknown",
//     purposes: processPurposes(state?.purpose),
//     date: state?.date || "Unknown",
//     requestId: state?.requestId || "",
//     requestDate: state?.requestDate || "",
//     paymentMethod: state?.paymentMethod || "",
//   };

//   const modifyPdfs = async () => {
//     setIsLoading(true);
//     setError(null);
//     const urls: string[] = [];
    
//     try {
//       for (const purpose of requestData.purposes) {
//         try {
//           const result = await modifySinglePdf(purpose, requestData);
          
//           const blob = new Blob([result], { type: "application/pdf" });
//           console.log(`Generated blob for ${purpose}:`, blob.size, 'bytes');
//           urls.push(URL.createObjectURL(blob));
//         } catch (error) {
//           console.error(`Skipping ${purpose} due to error`);
//           const fallbackResponse = await fetch("/src/assets/pdfs/Default.pdf");
//           const fallbackBytes = await fallbackResponse.arrayBuffer();
//           const blob = new Blob([fallbackBytes], { type: "application/pdf" });
//           urls.push(URL.createObjectURL(blob));
//         }
//       }
      
//       if (urls.length === 0) {
//         throw new Error("No valid PDFs could be generated");
//       }
       
//       setPdfUrls(urls);
//     } catch (error) {
//       console.error("PDF processing failed:", error);
//       setError("Failed to generate documents. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handlePrint = () => {
//     if (!iframeRef.current || pdfUrls.length === 0) return;

//     const iframe = iframeRef.current;
//     const printIframe = () => {
//       if (iframe.contentWindow) {
//         iframe.contentWindow.focus();
//         iframe.contentWindow.print();
//       }
//     };

//     if (iframe.contentDocument?.readyState === "complete") {
//       printIframe();
//     } else {
//       iframe.onload = printIframe;
//     }
//   };

//   const goToNextPdf = () => {
//     setCurrentPdfIndex((prev) => (prev + 1) % pdfUrls.length);
//   };

//   const goToPrevPdf = () => {
//     setCurrentPdfIndex((prev) => (prev - 1 + pdfUrls.length) % pdfUrls.length);
//   };

//   useEffect(() => {
//     modifyPdfs();
//     return () => {
//       pdfUrls.forEach(url => URL.revokeObjectURL(url));
//     };
//   }, []);

//   return (
//     <div className="min-h-screen flex flex-col p-4 bg-gray-50">
//       <div className="flex justify-between items-center mb-6">
//         <button
//           onClick={handleBackNavigation}
//           className="bg-[#1273B8] text-white flex items-center gap-2 px-4 py-2 rounded-lg shadow hover:bg-[#0e5a8f] transition-colors"
//         >
//           <ArrowLeft size={20} /> Back
//         </button>
//       </div>

//       {error && (
//         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
//           <p>{error}</p>
//         </div>
//       )}

//       {isLoading ? (
//         <div className="flex-1 flex flex-col items-center justify-center">
//           <p className="text-gray-600">Loading documents...</p>
//         </div>
//       ) : pdfUrls.length > 0 ? (
//         <div className="flex-1 flex flex-col">
//           {/* Document navigation header */}
//           <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg shadow">
//             <button
//               onClick={goToPrevPdf}
//               disabled={pdfUrls.length <= 1}
//               className={`p-2 rounded-full ${pdfUrls.length > 1 ? "text-[#1273B8] hover:bg-gray-100" : "text-gray-400 cursor-not-allowed"}`}
//             >
//               <ChevronLeft size={28} />
//             </button>

//             <div className="text-center">
//               <p className="text-lg text-gray-500 font-semibold">
//                 Document {currentPdfIndex + 1} of {pdfUrls.length}
//               </p>
//             </div>

//             <button
//               onClick={goToNextPdf}
//               disabled={pdfUrls.length <= 1}
//               className={`p-2 rounded-full ${pdfUrls.length > 1 ? "text-[#1273B8] hover:bg-gray-100" : "text-gray-400 cursor-not-allowed"}`}
//             >
//               <ChevronRight size={28} />
//             </button>
//           </div>

//           {/* PDF Viewer */}
//           <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
//             <iframe
//               ref={iframeRef}
//               src={`${pdfUrls[currentPdfIndex]}#toolbar=0&navpanes=0&scrollbar=0`}
//               className="w-full h-full min-h-[70vh] border-none"
//               title={`Generated Document - ${requestData.purposes[currentPdfIndex]}`}
//               onLoad={() => {
//                 if (iframeRef.current) {
//                   iframeRef.current.style.visibility = "visible";
//                 }
//               }}
//               style={{ visibility: "hidden" }}
//             />
//           </div>
//         </div>
//       ) : (
//         <div className="flex-1 flex items-center justify-center">
//           <p className="text-gray-600">No documents available to display.</p>
//         </div>
//       )}

//       {/* Print Button */}
//       <div className="flex justify-end mt-6">
//         <button
//           onClick={handlePrint}
//           disabled={isLoading || pdfUrls.length === 0}
//           className={`bg-[#16396d] text-white px-6 py-3 rounded-lg shadow hover:bg-[#1e4b8a] transition-colors ${
//             isLoading || pdfUrls.length === 0 ? "opacity-50 cursor-not-allowed" : ""
//           }`}
//         >
//           Print Current Document
//         </button>
//       </div>
//     </div>
//   );
// }
