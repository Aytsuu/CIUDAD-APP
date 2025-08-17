  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import { useLocation, useNavigate } from "react-router-dom";

  // // interface TemplatePreviewProps {
  // //   headerImage?: string;
  // //   title: string;
  // //   body: string;
  // //   withSeal: boolean;
  // //   withSignature: boolean;
  // //   onClose?: () => void;
  // // }

  // function TemplatePreview() {
  //     const location = useLocation();
  //     const navigate = useNavigate();
  //     const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  //     const { 
  //         headerImage, 
  //         title, 
  //         body, 
  //         withSeal, 
  //         withSignature 
  //     } = location.state || {};

  //     useEffect(() => {
  //         if (location.state) {
  //             generatePDF();
  //         } else {
  //             // Redirect back if no data
  //             navigate('/templates-main');
  //         }
  //     }, [location.state]);

  //   const generatePDF = () => {
  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: "a4",
  //     });

  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);

  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = 595.28; // A4 width in points
  //     const pageHeight = 841.89; // A4 height in points
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     // Add header image if exists
  //     if (headerImage) {
  //       try {
  //         doc.addImage(
  //           headerImage,
  //           "PNG",
  //           margin,
  //           yPos,
  //           pageWidth - margin * 2,
  //           60
  //         );
  //         yPos += 80;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //     }

  //     // Add title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);
  //     yPos += sectionGap + lineHeight;

  //     // Add body content with proper line breaks
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     // Add footer elements if needed
  //     yPos = pageHeight - margin - 100; // Position above bottom margin

  //     if (withSignature) {
  //       doc.setFont("times", "bold");
  //       doc.text("_________________________", margin, yPos);
  //       doc.text("Applicant Signature", margin, yPos + 20);
  //       yPos += 50;
  //     }

  //     if (withSeal) {
  //       doc.setFont("times", "bold");
  //       doc.text("[OFFICIAL SEAL]", pageWidth - margin - 100, yPos);
  //     }

  //     // Generate PDF URL for preview
  //     const url = URL.createObjectURL(
  //       new Blob([doc.output("blob")], { type: "application/pdf" })
  //     );
  //     setPdfUrl(url);
  //   };

  //   return (
  //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  //       <div className="bg-white rounded-lg w-[90vw] h-[90vh] flex flex-col">
  //         <div className="p-4 border-b flex justify-between items-center">
  //           <h2 className="text-xl font-bold">Document Preview</h2>

  //         </div>
  //         <div className="flex-1 min-h-0">
  //           {pdfUrl ? (
  //             <iframe
  //               src={`${pdfUrl}#zoom=FitH`}
  //               className="w-full h-full border-0"
  //               title="Document Preview"
  //             />
  //           ) : (
  //             <div className="flex items-center justify-center h-full">
  //               <p>Generating PDF preview...</p>
  //             </div>
  //           )}
  //         </div>
  //         <div className="p-4 border-t flex justify-end gap-2">
  //           <button
  //             onClick={() => {
  //               if (pdfUrl) {
  //                 const a = document.createElement('a');
  //                 a.href = pdfUrl;
  //                 a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_document.pdf`;
  //                 a.click();
  //               }
  //             }}
  //             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  //           >
  //             Download PDF
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // export default TemplatePreview;





  //SEAL/Sentence 
  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import { useLocation, useNavigate } from "react-router-dom";
  // import sealImage from "@/assets/images/Seal.png";

  // function TemplatePreview() {
  //     const location = useLocation();
  //     const navigate = useNavigate();
  //     const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  //     const { 
  //         headerImage, 
  //         title, 
  //         body, 
  //         withSeal, 
  //         withSignature 
  //     } = location.state || {};

  //     useEffect(() => {
  //         if (location.state) {
  //             generatePDF();
  //         } else {
  //             // Redirect back if no data
  //             navigate('/templates-main');
  //         }
  //     }, [location.state]);

  //   const generatePDF = () => {
  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: "a4",
  //     });

  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);

  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = 595.28; // A4 width in points
  //     const pageHeight = 841.89; // A4 height in points
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     // Add header image if exists
  //     if (headerImage) {
  //       try {
  //         doc.addImage(
  //           headerImage,
  //           "PNG",
  //           margin,
  //           yPos,
  //           pageWidth - margin * 2,
  //           60
  //         );
  //         yPos += 80;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //     }

  //     // Add title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);
  //     yPos += sectionGap + lineHeight;

  //     // Add body content with proper line breaks
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     // Add footer elements if needed
  //     yPos = pageHeight - margin - 100; // Position above bottom margin

  //     if (withSignature) {
  //       doc.setFont("times", "bold");
  //       doc.text("_________________________", margin, yPos);
  //       doc.text("Applicant Signature", margin, yPos + 20);
  //       yPos += 50;
  //     }


  //     // if (withSeal) {
  //     //     const img = new Image();
  //     //     img.src = sealImage;
  //     //     img.onload = () => {
  //     //         const canvas = document.createElement("canvas");
  //     //         canvas.width = img.width;
  //     //         canvas.height = img.height;
  //     //         const ctx = canvas.getContext("2d");
  //     //         if (ctx) {
  //     //             ctx.drawImage(img, 0, 0);
  //     //             const base64Seal = canvas.toDataURL("image/png");
  //     //             doc.addImage(base64Seal, "PNG", pageWidth - margin - 100, yPos, 80, 80);

  //     //             const url = URL.createObjectURL(
  //     //                 new Blob([doc.output("blob")], { type: "application/pdf" })
  //     //             );
  //     //             setPdfUrl(url);
  //     //         }
  //     //     };
  //     //     return; // Wait for image to load before continuing
  //     // }


  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const base64Seal = canvas.toDataURL("image/png");

  //           const sealX = pageWidth - margin - 100;
  //           const sealY = yPos;

  //           doc.addImage(base64Seal, "PNG", sealX, sealY, 80, 80);

  //           // Add red text below seal
  //           doc.setTextColor(255, 0, 0); // Red
  //           doc.setFont("times", "bold");
  //           doc.setFontSize(10);
  //           doc.text("NOT VALID WITHOUT SEAL", sealX + 40, sealY + 90, { align: "center" });

  //           // Reset text color and font
  //           doc.setTextColor(0, 0, 0);
  //           doc.setFont("times", "normal");
  //           doc.setFontSize(12);

  //           const url = URL.createObjectURL(
  //             new Blob([doc.output("blob")], { type: "application/pdf" })
  //           );
  //           setPdfUrl(url);
  //         }
  //       };
  //       return; // Wait for image to load before continuing
  //     }


  //     // Generate PDF URL for preview
  //     const url = URL.createObjectURL(
  //       new Blob([doc.output("blob")], { type: "application/pdf" })
  //     );
  //     setPdfUrl(url);
  //   };

  //   return (
  //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  //       <div className="bg-white rounded-lg w-[90vw] h-[90vh] flex flex-col">
  //         <div className="p-4 border-b flex justify-between items-center">
  //           <h2 className="text-xl font-bold">Document Preview</h2>

  //         </div>
  //         <div className="flex-1 min-h-0">
  //           {pdfUrl ? (
  //             <iframe
  //               src={`${pdfUrl}#zoom=FitH`}
  //               className="w-full h-full border-0"
  //               title="Document Preview"
  //             />
  //           ) : (
  //             <div className="flex items-center justify-center h-full">
  //               <p>Generating PDF preview...</p>
  //             </div>
  //           )}
  //         </div>
  //         <div className="p-4 border-t flex justify-end gap-2">
  //           <button
  //             onClick={() => {
  //               if (pdfUrl) {
  //                 const a = document.createElement('a');
  //                 a.href = pdfUrl;
  //                 a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_document.pdf`;
  //                 a.click();
  //               }
  //             }}
  //             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  //           >
  //             Download PDF
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // export default TemplatePreview;






  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import { useLocation, useNavigate } from "react-router-dom";
  // import sealImage from "@/assets/images/Seal.png";

  // function TemplatePreview() {
  //     const location = useLocation();
  //     const navigate = useNavigate();
  //     const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  //     const { 
  //         headerImage, 
  //         title, 
  //         body, 
  //         withSeal, 
  //         withSignature 
  //     } = location.state || {};

  //     useEffect(() => {
  //         if (location.state) {
  //             generatePDF();
  //         } else {
  //             // Redirect back if no data
  //             navigate('/templates-main');
  //         }
  //     }, [location.state]);

  //   const generatePDF = () => {
  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: "a4",
  //     });

  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);

  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = 595.28; // A4 width in points
  //     const pageHeight = 841.89; // A4 height in points
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     // Add header image if exists
  //     if (headerImage) {
  //       try {
  //         doc.addImage(
  //           headerImage,
  //           "PNG",
  //           margin,
  //           yPos,
  //           pageWidth - margin * 2,
  //           60
  //         );
  //         yPos += 80;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //     }

  //     // Add title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);
  //     yPos += sectionGap + lineHeight;

  //     // Add body content with proper line breaks
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     // Add footer elements if needed
  //     yPos = pageHeight - margin - 100; // Position above bottom margin

  //     if (withSignature || withSeal) {
  //       const signatureY = pageHeight - margin - 80; // Adjust upward for spacing
  //       const signatureX = margin;
  //       const sealSize = 80;
  //       const sealX = pageWidth - margin - sealSize;

  //       if (withSignature) {
  //         doc.setFont("times", "normal");
  //         doc.text("Name and signature of Applicant", signatureX, signatureY);
  //         doc.text("Certified true and correct:", signatureX, signatureY + 20);
  //         doc.setFont("times", "normal");
  //       }

  //       if (withSeal) {
  //         const img = new Image();
  //         img.src = sealImage;
  //         img.onload = () => {
  //           const canvas = document.createElement("canvas");
  //           canvas.width = img.width;
  //           canvas.height = img.height;
  //           const ctx = canvas.getContext("2d");
  //           if (ctx) {
  //             ctx.drawImage(img, 0, 0);
  //             const base64Seal = canvas.toDataURL("image/png");

  //             const sealY = signatureY - 20; // Adjust if you want it to align better

  //             doc.addImage(base64Seal, "PNG", sealX, sealY, sealSize, sealSize);

  //             // Red warning text below the seal
  //             doc.setTextColor(255, 0, 0);
  //             doc.setFont("times", "bold");
  //             doc.setFontSize(10);
  //             doc.text("NOT VALID WITHOUT SEAL", sealX + sealSize / 2, sealY + sealSize + 10, {
  //               align: "center",
  //             });

  //             // Reset font
  //             doc.setTextColor(0, 0, 0);
  //             doc.setFont("times", "normal");
  //             doc.setFontSize(12);

  //             const url = URL.createObjectURL(
  //               new Blob([doc.output("blob")], { type: "application/pdf" })
  //             );
  //             setPdfUrl(url);
  //           }
  //         };
  //         return;
  //       }
  //     }

  //     // Generate PDF URL for preview
  //     const url = URL.createObjectURL(
  //       new Blob([doc.output("blob")], { type: "application/pdf" })
  //     );
  //     setPdfUrl(url);
  //   };

  //   return (
  //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  //       <div className="bg-white rounded-lg w-[90vw] h-[90vh] flex flex-col">
  //         <div className="p-4 border-b flex justify-between items-center">
  //           <h2 className="text-xl font-bold">Document Preview</h2>

  //         </div>
  //         <div className="flex-1 min-h-0">
  //           {pdfUrl ? (
  //             <iframe
  //               src={`${pdfUrl}#zoom=FitH`}
  //               className="w-full h-full border-0"
  //               title="Document Preview"
  //             />
  //           ) : (
  //             <div className="flex items-center justify-center h-full">
  //               <p>Generating PDF preview...</p>
  //             </div>
  //           )}
  //         </div>
  //         <div className="p-4 border-t flex justify-end gap-2">
  //           <button
  //             onClick={() => {
  //               if (pdfUrl) {
  //                 const a = document.createElement('a');
  //                 a.href = pdfUrl;
  //                 a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_document.pdf`;
  //                 a.click();
  //               }
  //             }}
  //             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  //           >
  //             Download PDF
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // export default TemplatePreview;






  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import { useLocation, useNavigate } from "react-router-dom";
  // import sealImage from "@/assets/images/Seal.png";

  // function TemplatePreview() {
  //   const location = useLocation();
  //   const navigate = useNavigate();
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  //   const {
  //     headerImage,
  //     title,
  //     body,
  //     withSeal,
  //     withSignature,
  //   } = location.state || {};

  //   useEffect(() => {
  //     if (location.state) {
  //       generatePDF();
  //     } else {
  //       navigate("/templates-main");
  //     }
  //   }, [location.state]);

  //   const generatePDF = () => {
  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: "a4",
  //     });

  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);

  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = 595.28;
  //     const pageHeight = 841.89;
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     // Add header image if provided
  //     if (headerImage) {
  //       try {
  //         doc.addImage(
  //           headerImage,
  //           "PNG",
  //           margin,
  //           yPos,
  //           pageWidth - margin * 2,
  //           60
  //         );
  //         yPos += 80;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //     }

  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);
  //     yPos += sectionGap + lineHeight;

  //     // Body text
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin - 120) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     // Footer positions
  //     const signatureY = pageHeight - margin - 80;
  //     const signatureX = margin;
  //     const sealSize = 80;
  //     const sealX = pageWidth - margin - sealSize;
  //     const sealY = signatureY - 20;

  //     // Signature text
  //     if (withSignature) {
  //       doc.setFont("times", "normal");
  //       doc.text("Name and signature of Applicant", signatureX, signatureY);
  //       doc.text("Certified true and correct:", signatureX, signatureY + 20);
  //     }

  //     // Handle seal if needed
  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const base64Seal = canvas.toDataURL("image/png");

  //           doc.addImage(base64Seal, "PNG", sealX, sealY, sealSize, sealSize);

  //           // Red warning text
  //           doc.setTextColor(255, 0, 0);
  //           doc.setFont("times", "bold");
  //           doc.setFontSize(10);
  //           doc.text(
  //             "NOT VALID WITHOUT SEAL",
  //             sealX + sealSize / 2,
  //             sealY + sealSize + 10,
  //             { align: "center" }
  //           );

  //           // Reset font
  //           doc.setTextColor(0, 0, 0);
  //           doc.setFont("times", "normal");
  //           doc.setFontSize(12);

  //           // Output PDF after seal is added
  //           const url = URL.createObjectURL(
  //             new Blob([doc.output("blob")], { type: "application/pdf" })
  //           );
  //           setPdfUrl(url);
  //         }
  //       };
  //       return; // Exit to wait for image loading
  //     }

  //     // No seal — generate PDF now
  //     const url = URL.createObjectURL(
  //       new Blob([doc.output("blob")], { type: "application/pdf" })
  //     );
  //     setPdfUrl(url);
  //   };

  //   return (
  //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  //       <div className="bg-white rounded-lg w-[90vw] h-[90vh] flex flex-col">
  //         <div className="p-4 border-b flex justify-between items-center">
  //           <h2 className="text-xl font-bold">Document Preview</h2>
  //         </div>
  //         <div className="flex-1 min-h-0">
  //           {pdfUrl ? (
  //             <iframe
  //               src={`${pdfUrl}#zoom=FitH`}
  //               className="w-full h-full border-0"
  //               title="Document Preview"
  //             />
  //           ) : (
  //             <div className="flex items-center justify-center h-full">
  //               <p>Generating PDF preview...</p>
  //             </div>
  //           )}
  //         </div>
  //         <div className="p-4 border-t flex justify-end gap-2">
  //           <button
  //             onClick={() => {
  //               if (pdfUrl) {
  //                 const a = document.createElement("a");
  //                 a.href = pdfUrl;
  //                 a.download = `${title.replace(/[^a-z0-9]/gi, "_")}_document.pdf`;
  //                 a.click();
  //               }
  //             }}
  //             className="px-4 py-2 bg-blue text-white rounded hover:bg-blue-700"
  //           >
  //             Download PDF
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // export default TemplatePreview;









  // LATEST WORKING BUT NOT THE DIALOG
  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";

  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   title: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  //   onClose: () => void;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   title,
  //   body,
  //   withSeal,
  //   withSignature,
  //   onClose,
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   useEffect(() => {
  //     generatePDF();
  //   }, []);

  //   const generatePDF = () => {
  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: "a4",
  //     });

  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = 595.28;
  //     const pageHeight = 841.89;
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       try {
  //         doc.addImage(headerImage, "PNG", margin, yPos, pageWidth - margin * 2, 60);
  //         yPos += 80;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //     }

  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);
  //     yPos += sectionGap + lineHeight;

  //     // Body
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     // Footer elements
  //     const footerY = pageHeight - margin - 80;
  //     const signatureX = margin;
  //     const sealSize = 80;
  //     const sealX = pageWidth - margin - sealSize;

  //     const addFooter = (sealBase64?: string) => {
  //       if (withSignature) {
  //         doc.setFont("times", "normal");
  //         doc.text("Name and signature of Applicant", signatureX, footerY);
  //         doc.text("Certified true and correct:", signatureX, footerY + 20);
  //       }

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 20;
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         doc.setTextColor(255, 0, 0);
  //         doc.setFont("times", "bold");
  //         doc.setFontSize(10);
  //         doc.text("NOT VALID WITHOUT SEAL", sealX + sealSize / 2, sealY + sealSize + 10, {
  //           align: "center",
  //         });

  //         doc.setTextColor(0, 0, 0);
  //         doc.setFont("times", "normal");
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  //       <div className="bg-white rounded-lg w-[90vw] h-[90vh] flex flex-col">
  //         {/* Header */}
  //         <div className="p-4 border-b flex justify-between items-center">
  //           <h2 className="text-xl font-bold">Document Preview</h2>
  //           <button
  //             onClick={onClose}
  //             className="text-sm text-red-600 hover:underline"
  //           >
  //             Close
  //           </button>
  //         </div>

  //         {/* PDF Preview */}
  //         <div className="flex-1 min-h-0">
  //           {pdfUrl ? (
  //             <iframe
  //               src={`${pdfUrl}#zoom=FitH`}
  //               className="w-full h-full border-0"
  //               title="Document Preview"
  //             />
  //           ) : (
  //             <div className="flex items-center justify-center h-full">
  //               <p>Generating PDF preview...</p>
  //             </div>
  //           )}
  //         </div>

  //         {/* Footer */}
  //         <div className="p-4 border-t flex justify-end gap-2">
  //           <button
  //             onClick={() => {
  //               if (pdfUrl) {
  //                 const a = document.createElement("a");
  //                 a.href = pdfUrl;
  //                 a.download = `${title.replace(/[^a-z0-9]/gi, "_")}_document.pdf`;
  //                 a.click();
  //               }
  //             }}
  //             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  //           >
  //             Download PDF
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // export default TemplatePreview;









  //LATEST WORKING BUT THE SEAL OVERLAPS IN THE MARGIN
  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";

  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   title: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   title,
  //   body,
  //   withSeal,
  //   withSignature,
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   useEffect(() => {
  //     generatePDF();
  //   }, [headerImage, title, body, withSeal, withSignature]);

  //   const generatePDF = () => {
  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: "a4",
  //     });

  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = 595.28;
  //     const pageHeight = 841.89;
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       try {
  //         doc.addImage(headerImage, "PNG", margin, yPos, pageWidth - margin * 2, 60);
  //         yPos += 80;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //     }

  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);
  //     yPos += sectionGap + lineHeight;

  //     // Body
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     // Footer elements
  //     const footerY = pageHeight - margin - 80;
  //     const signatureX = margin;
  //     const sealSize = 80;
  //     const sealX = pageWidth - margin - sealSize;

  //     const addFooter = (sealBase64?: string) => {
  //       if (withSignature) {
  //         doc.setFont("times", "normal");
  //         doc.text("Name and signature of Applicant", signatureX, footerY);
  //         doc.text("Certified true and correct:", signatureX, footerY + 20);
  //       }

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 20;
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         doc.setTextColor(255, 0, 0);
  //         doc.setFont("times", "bold");
  //         doc.setFontSize(10);
  //         doc.text("NOT VALID WITHOUT SEAL", sealX + sealSize / 2, sealY + sealSize + 10, {
  //           align: "center",
  //         });

  //         doc.setTextColor(0, 0, 0);
  //         doc.setFont("times", "normal");
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="w-full h-full">
  //       {pdfUrl ? (
  //         <iframe
  //           src={`${pdfUrl}#zoom=FitH`}
  //           className="w-full h-full border-0"
  //           title="Document Preview"
  //         />
  //       ) : (
  //         <div className="flex items-center justify-center h-full">
  //           <p>Generating PDF preview...</p>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default TemplatePreview;







  //LASTEST BUT NO PUNONG BARANGAY
  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";

  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   title: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   title,
  //   body,
  //   withSeal,
  //   withSignature,
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   useEffect(() => {
  //     generatePDF();
  //   }, [headerImage, title, body, withSeal, withSignature]);

  //   const generatePDF = () => {
  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: "a4",
  //     });

  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = 595.28;
  //     const pageHeight = 841.89;
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       try {
  //         doc.addImage(headerImage, "PNG", margin, yPos, pageWidth - margin * 2, 60);
  //         yPos += 80;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //     }

  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);
  //     yPos += sectionGap + lineHeight;

  //     // Body
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     // Footer elements
  //     const footerY = pageHeight - margin - 120; // Increased space at bottom
  //     const signatureX = margin;
  //     const sealSize = 80;
  //     const sealX = pageWidth - margin - sealSize - 35;
  //     const textBelowSealOffset = 20; // Increased space between seal and text

  //     const addFooter = (sealBase64?: string) => {
  //       if (withSignature) {
  //         doc.setFont("times", "normal");
  //         doc.text("Name and signature of Applicant", signatureX, footerY);
  //         doc.text("Certified true and correct:", signatureX, footerY + 20);
  //       }

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 40; // Seal positioned higher
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         // Text below seal - with margin check
  //         doc.setTextColor(255, 0, 0);
  //         doc.setFont("times", "bold");
  //         doc.setFontSize(10);
          
  //         const textY = sealY + sealSize + textBelowSealOffset;
  //         const text = "NOT VALID WITHOUT SEAL";
  //         const textWidth = doc.getTextWidth(text);
          
  //         // Ensure text stays within margins
  //         const minX = margin;
  //         const maxX = pageWidth - margin - textWidth;
  //         const centeredX = sealX + (sealSize - textWidth) / 2;
  //         const finalX = Math.max(minX, Math.min(centeredX, maxX));
          
  //         doc.text(text, finalX, textY);

  //         // Reset styles
  //         doc.setTextColor(0, 0, 0);
  //         doc.setFont("times", "normal");
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="w-full h-full">
  //       {pdfUrl ? (
  //         <iframe
  //           src={`${pdfUrl}#zoom=FitH`}
  //           className="w-full h-full border-0"
  //           title="Document Preview"
  //         />
  //       ) : (
  //         <div className="flex items-center justify-center h-full">
  //           <p>Generating PDF preview...</p>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default TemplatePreview;





  //LASTEST W/ PUNONG BARANGAY BUT IT WONT APPEAR PERMANENTLY
  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";

  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   title: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   title,
  //   body,
  //   withSeal,
  //   withSignature,
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   useEffect(() => {
  //     generatePDF();
  //   }, [headerImage, title, body, withSeal, withSignature]);

  //   const generatePDF = () => {
  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: "a4",
  //     });

  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = 595.28;
  //     const pageHeight = 841.89;
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       try {
  //         doc.addImage(headerImage, "PNG", margin, yPos, pageWidth - margin * 2, 60);
  //         yPos += 80;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //     }

  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);
  //     yPos += sectionGap + lineHeight;

  //     // Body
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     // Footer elements
  //     const footerY = pageHeight - margin - 150; // Increased space at bottom
  //     const signatureX = margin;
  //     const sealSize = 80;
  //     const sealX = pageWidth - margin - sealSize - 35;
  //     const textBelowSealOffset = 20;

  //     const addFooter = (sealBase64?: string) => {
  //       if (withSignature) {
  //         doc.setFont("times", "normal");
  //         doc.text("Name and signature of Applicant", signatureX, footerY);
  //         doc.text("Certified true and correct:", signatureX, footerY + 20);
          
  //         // Add barangay captain information
  //         doc.setFont("times", "bold");
  //         doc.text("HON. VIRGINIA N. ABENOJA", signatureX, footerY + 60);
  //         doc.setFont("times", "normal");
  //         doc.text("Punong Barangay, San Roque", signatureX, footerY + 80);
  //       }

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 40;
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         // Text below seal
  //         doc.setTextColor(255, 0, 0);
  //         doc.setFont("times", "bold");
  //         doc.setFontSize(10);
          
  //         const textY = sealY + sealSize + textBelowSealOffset;
  //         const text = "NOT VALID WITHOUT SEAL";
  //         const textWidth = doc.getTextWidth(text);
          
  //         const minX = margin;
  //         const maxX = pageWidth - margin - textWidth;
  //         const centeredX = sealX + (sealSize - textWidth) / 2;
  //         const finalX = Math.max(minX, Math.min(centeredX, maxX));
          
  //         doc.text(text, finalX, textY);

  //         // Reset styles
  //         doc.setTextColor(0, 0, 0);
  //         doc.setFont("times", "normal");
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="w-full h-full">
  //       {pdfUrl ? (
  //         <iframe
  //           src={`${pdfUrl}#zoom=FitH`}
  //           className="w-full h-full border-0"
  //           title="Document Preview"
  //         />
  //       ) : (
  //         <div className="flex items-center justify-center h-full">
  //           <p>Generating PDF preview...</p>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default TemplatePreview;







  //GROK ANSWER SPACING SA PUNONG BARANGAY
  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";

  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   title: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   title,
  //   body,
  //   withSeal,
  //   withSignature,
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   useEffect(() => {
  //     generatePDF();
  //   }, [headerImage, title, body, withSeal, withSignature]);

  //   const generatePDF = () => {
  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: "a4",
  //     });

  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = 595.28;
  //     const pageHeight = 841.89;
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       try {
  //         doc.addImage(headerImage, "PNG", margin, yPos, pageWidth - margin * 2, 60);
  //         yPos += 80;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //     }

  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);
  //     yPos += sectionGap + lineHeight;

  //     // Body
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     // Footer elements
  //     const footerY = pageHeight - margin - 150;
  //     const signatureX = margin;
  //     const sealSize = 80;
  //     const sealX = pageWidth - margin - sealSize - 35;
  //     const textBelowSealOffset = 20;

  //     const addFooter = (sealBase64?: string) => {
  //       // Always show barangay captain information
  //       doc.setFont("times", "bold");
  //       doc.text("HON. VIRGINIA N. ABENOJA", signatureX, footerY + 90);
  //       doc.setFont("times", "normal");
  //       doc.text("Punong Barangay, San Roque", signatureX, footerY + 110);

  //       if (withSignature) {
  //         doc.setFont("times", "normal");
  //         doc.text("Name and signature of Applicant", signatureX, footerY);
  //         doc.text("Certified true and correct:", signatureX, footerY + 20);
  //       }

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 40;
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         // Text below seal
  //         doc.setTextColor(255, 0, 0);
  //         doc.setFont("times", "bold");
  //         doc.setFontSize(10);
          
  //         const textY = sealY + sealSize + textBelowSealOffset;
  //         const text = "NOT VALID WITHOUT SEAL";
  //         const textWidth = doc.getTextWidth(text);
          
  //         const minX = margin;
  //         const maxX = pageWidth - margin - textWidth;
  //         const centeredX = sealX + (sealSize - textWidth) / 2;
  //         const finalX = Math.max(minX, Math.min(centeredX, maxX));
          
  //         doc.text(text, finalX, textY);

  //         // Reset styles
  //         doc.setTextColor(0, 0, 0);
  //         doc.setFont("times", "normal");
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="w-full h-full">
  //       {pdfUrl ? (
  //         <iframe
  //           src={`${pdfUrl}#zoom=FitH`}
  //           className="w-full h-full border-0"
  //           title="Document Preview"
  //         />
  //       ) : (
  //         <div className="flex items-center justify-center h-full">
  //           <p>Generating PDF preview...</p>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default TemplatePreview;








  //DEEPSEEK ANSWER SPACING SA PUNONG BARANGAY
  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";

  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   title: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   title,
  //   body,
  //   withSeal,
  //   withSignature,
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   useEffect(() => {
  //     generatePDF();
  //   }, [headerImage, title, body, withSeal, withSignature]);

  //   const generatePDF = () => {
  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: "a4",
  //     });

  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = 595.28;
  //     const pageHeight = 841.89;
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       try {
  //         doc.addImage(headerImage, "PNG", margin, yPos, pageWidth - margin * 2, 60);
  //         yPos += 80;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //     }

  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);
  //     yPos += sectionGap + lineHeight;

  //     // Body
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     // Footer elements
  //     const footerY = pageHeight - margin - 180; // Increased space for additional spacing
  //     const signatureX = margin;
  //     const sealSize = 80;
  //     const sealX = pageWidth - margin - sealSize - 35;
  //     const textBelowSealOffset = 20;

  //     const addFooter = (sealBase64?: string) => {
  //       let currentY = footerY;

  //       if (withSignature) {
  //         doc.setFont("times", "normal");
  //         doc.text("Name and signature of Applicant", signatureX, currentY);
  //         doc.text("Certified true and correct:", signatureX, currentY + 20);
  //         currentY += 60; // Add space after signature section
  //       }

  //       // Always show barangay captain information with proper spacing
  //       doc.setFont("times", "bold");
  //       doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY + 20);
  //       doc.setFont("times", "normal");
  //       doc.text("Punong Barangay, San Roque", signatureX, currentY + 40);

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 40;
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         // Text below seal
  //         doc.setTextColor(255, 0, 0);
  //         doc.setFont("times", "bold");
  //         doc.setFontSize(10);
          
  //         const textY = sealY + sealSize + textBelowSealOffset;
  //         const text = "NOT VALID WITHOUT SEAL";
  //         const textWidth = doc.getTextWidth(text);
          
  //         const minX = margin;
  //         const maxX = pageWidth - margin - textWidth;
  //         const centeredX = sealX + (sealSize - textWidth) / 2;
  //         const finalX = Math.max(minX, Math.min(centeredX, maxX));
          
  //         doc.text(text, finalX, textY);

  //         // Reset styles
  //         doc.setTextColor(0, 0, 0);
  //         doc.setFont("times", "normal");
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="w-full h-full">
  //       {pdfUrl ? (
  //         <iframe
  //           src={`${pdfUrl}#zoom=FitH`}
  //           className="w-full h-full border-0"
  //           title="Document Preview"
  //         />
  //       ) : (
  //         <div className="flex items-center justify-center h-full">
  //           <p>Generating PDF preview...</p>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default TemplatePreview;





  //DEEPSEEK APPLIED PAPERSIZE BUT NOT ACCURATE MEASUREMENTS
  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";

  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   title: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  //   paperSize?: string;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   title,
  //   body,
  //   withSeal,
  //   withSignature,
  //   paperSize = "a4", // default to A4
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   useEffect(() => {
  //     generatePDF();
  //   }, [headerImage, title, body, withSeal, withSignature, paperSize]);

  //   const generatePDF = () => {
  //     // Determine page format
  //     let pageFormat: "a4" | "letter" | "legal" = "a4";
  //     if (paperSize === "letter") pageFormat = "letter";
  //     if (paperSize === "legal") pageFormat = "legal";

  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: pageFormat,
  //     });

  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       try {
  //         doc.addImage(headerImage, "PNG", margin, yPos, pageWidth - margin * 2, 60);
  //         yPos += 80;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //     }

  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);
  //     yPos += sectionGap + lineHeight;

  //     // Body
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     // Footer elements
  //     const footerY = pageHeight - margin - 180;
  //     const signatureX = margin;
  //     const sealSize = 80;
  //     const sealX = pageWidth - margin - sealSize - 35;
  //     const textBelowSealOffset = 20;

  //     const addFooter = (sealBase64?: string) => {
  //       let currentY = footerY;

  //       if (withSignature) {
  //         doc.setFont("times", "normal");
  //         doc.text("Name and signature of Applicant", signatureX, currentY);
  //         doc.text("Certified true and correct:", signatureX, currentY + 20);
  //         currentY += 60;
  //       }

  //       // Always show barangay captain information
  //       doc.setFont("times", "bold");
  //       doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY + 20);
  //       doc.setFont("times", "normal");
  //       doc.text("Punong Barangay, San Roque", signatureX, currentY + 40);

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 40;
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         // Text below seal
  //         doc.setTextColor(255, 0, 0);
  //         doc.setFont("times", "bold");
  //         doc.setFontSize(10);
          
  //         const textY = sealY + sealSize + textBelowSealOffset;
  //         const text = "NOT VALID WITHOUT SEAL";
  //         const textWidth = doc.getTextWidth(text);
          
  //         const minX = margin;
  //         const maxX = pageWidth - margin - textWidth;
  //         const centeredX = sealX + (sealSize - textWidth) / 2;
  //         const finalX = Math.max(minX, Math.min(centeredX, maxX));
          
  //         doc.text(text, finalX, textY);

  //         // Reset styles
  //         doc.setTextColor(0, 0, 0);
  //         doc.setFont("times", "normal");
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="w-full h-full">
  //       {pdfUrl ? (
  //         <iframe
  //           src={`${pdfUrl}#zoom=FitH`}
  //           className="w-full h-full border-0"
  //           title="Document Preview"
  //         />
  //       ) : (
  //         <div className="flex items-center justify-center h-full">
  //           <p>Generating PDF preview...</p>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default TemplatePreview;







  //LATEST WORKIGN BUT W/O SUMMON SIGNATURES
  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";

  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   title: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  //   paperSize?: string;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   title,
  //   body,
  //   withSeal,
  //   withSignature,
  //   paperSize = "a4",
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   useEffect(() => {
  //     generatePDF();
  //   }, [headerImage, title, body, withSeal, withSignature, paperSize]);

  //   const generatePDF = () => {
  //     // Convert paper size to jsPDF format
  //     let pageFormat: [number, number] | string;
  //     switch(paperSize) {
  //       case "legal":
  //         pageFormat = [612, 1008]; // 8.5×14 in (in points)
  //         break;
  //       case "letter":
  //         pageFormat = [612, 792]; // 8.5×11 in (in points)
  //         break;
  //       case "a4":
  //       default:
  //         pageFormat = "a4"; // Standard A4
  //     }

  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: pageFormat,
  //     });

  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       try {
  //         doc.addImage(headerImage, "PNG", margin, yPos, pageWidth - margin * 2, 60);
  //         yPos += 80;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //     }

  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);
  //     yPos += sectionGap + lineHeight;

  //     // Body
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     // Footer elements
  //     const footerY = pageHeight - margin - 180;
  //     const signatureX = margin;
  //     const sealSize = 80;
  //     const sealX = pageWidth - margin - sealSize - 35;
  //     const textBelowSealOffset = 20;

  //     const addFooter = (sealBase64?: string) => {
  //       let currentY = footerY;

  //       if (withSignature) {
  //         doc.setFont("times", "normal");
  //         doc.text("Name and signature of Applicant", signatureX, currentY);
  //         doc.text("Certified true and correct:", signatureX, currentY + 20);
  //         currentY += 60;
  //       }

  //       // Always show barangay captain information
  //       doc.setFont("times", "bold");
  //       doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY + 20);
  //       doc.setFont("times", "normal");
  //       doc.text("Punong Barangay, San Roque", signatureX, currentY + 40);

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 40;
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         // Text below seal
  //         doc.setTextColor(255, 0, 0);
  //         doc.setFont("times", "bold");
  //         doc.setFontSize(10);
          
  //         const textY = sealY + sealSize + textBelowSealOffset;
  //         const text = "NOT VALID WITHOUT SEAL";
  //         const textWidth = doc.getTextWidth(text);
          
  //         const minX = margin;
  //         const maxX = pageWidth - margin - textWidth;
  //         const centeredX = sealX + (sealSize - textWidth) / 2;
  //         const finalX = Math.max(minX, Math.min(centeredX, maxX));
          
  //         doc.text(text, finalX, textY);

  //         // Reset styles
  //         doc.setTextColor(0, 0, 0);
  //         doc.setFont("times", "normal");
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="w-full h-full">
  //       {pdfUrl ? (
  //         <iframe
  //           src={`${pdfUrl}#zoom=FitH`}
  //           className="w-full h-full border-0"
  //           title="Document Preview"
  //         />
  //       ) : (
  //         <div className="flex items-center justify-center h-full">
  //           <p>Generating PDF preview...</p>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default TemplatePreview;







  //LATEST W/SUMMON BUT NOT RIGHT FORMAT
  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";

  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   title: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  //   withSummon: boolean;
  //   paperSize: string;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   title,
  //   body,
  //   withSeal,
  //   withSignature,
  //   withSummon = false,
  //   paperSize = "a4",
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   useEffect(() => {
  //     generatePDF();
  //   }, [headerImage, title, body, withSeal, withSignature, withSummon, paperSize]);

  //   const generatePDF = () => {
  //     // Convert paper size to jsPDF format
  //     let pageFormat: [number, number] | string;
  //     switch(paperSize) {
  //       case "legal":
  //         pageFormat = [612, 1008]; // 8.5×14 in (in points)
  //         break;
  //       case "letter":
  //         pageFormat = [612, 792]; // 8.5×11 in (in points)
  //         break;
  //       case "a4":
  //       default:
  //         pageFormat = "a4"; // Standard A4
  //     }

  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: pageFormat,
  //     });

  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       try {
  //         doc.addImage(headerImage, "PNG", margin, yPos, pageWidth - margin * 2, 60);
  //         yPos += 80;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //     }

  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);
  //     yPos += sectionGap + lineHeight;

  //     // Body
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     // Footer elements
  //     const footerY = pageHeight - margin - 180;
  //     const signatureX = margin;
  //     const sealSize = 80;
  //     const sealX = pageWidth - margin - sealSize - 35;
  //     const textBelowSealOffset = 20;

  //     const addFooter = (sealBase64?: string) => {
  //       let currentY = footerY;

  //       if (withSummon) {
  //         // Summon signature fields
  //         doc.setFont("times", "normal");
  //         doc.text("COMPLAINANT _________________________", signatureX, currentY);
  //         doc.text("RESPONDENT _________________________", signatureX, currentY + 20);
  //         doc.text("SERVER _________________________", signatureX, currentY + 40);
  //         currentY += 80;
  //       } 
  //       else if (withSignature) {
  //         // Regular signature fields
  //         doc.setFont("times", "normal");
  //         doc.text("Name and signature of Applicant", signatureX, currentY);
  //         doc.text("Certified true and correct:", signatureX, currentY + 20);
  //         currentY += 60;
  //       }

  //       // Always show barangay captain information
  //       doc.setFont("times", "bold");
  //       doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY + 20);
  //       doc.setFont("times", "normal");
  //       doc.text("Punong Barangay, San Roque", signatureX, currentY + 40);

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 40;
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         // Text below seal
  //         doc.setTextColor(255, 0, 0);
  //         doc.setFont("times", "bold");
  //         doc.setFontSize(10);
          
  //         const textY = sealY + sealSize + textBelowSealOffset;
  //         const text = "NOT VALID WITHOUT SEAL";
  //         const textWidth = doc.getTextWidth(text);
          
  //         const minX = margin;
  //         const maxX = pageWidth - margin - textWidth;
  //         const centeredX = sealX + (sealSize - textWidth) / 2;
  //         const finalX = Math.max(minX, Math.min(centeredX, maxX));
          
  //         doc.text(text, finalX, textY);

  //         // Reset styles
  //         doc.setTextColor(0, 0, 0);
  //         doc.setFont("times", "normal");
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="w-full h-full">
  //       {pdfUrl ? (
  //         <iframe
  //           src={`${pdfUrl}#zoom=FitH`}
  //           className="w-full h-full border-0"
  //           title="Document Preview"
  //         />
  //       ) : (
  //         <div className="flex items-center justify-center h-full">
  //           <p>Generating PDF preview...</p>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default TemplatePreview;






  // SUMMON DETAILS ARE NOW ON THE BOTTOM BUT NOT RIGHT FORMATTING
  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";

  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   title: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  //   withSummon?: boolean;
  //   paperSize?: string;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   title,
  //   body,
  //   withSeal,
  //   withSignature,
  //   withSummon = false,
  //   paperSize = "a4",
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   useEffect(() => {
  //     generatePDF();
  //   }, [headerImage, title, body, withSeal, withSignature, withSummon, paperSize]);

  //   const generatePDF = () => {
  //     // Convert paper size to jsPDF format
  //     let pageFormat: [number, number] | string;
  //     switch(paperSize) {
  //       case "legal":
  //         pageFormat = [612, 1008]; // 8.5×14 in (in points)
  //         break;
  //       case "letter":
  //         pageFormat = [612, 792]; // 8.5×11 in (in points)
  //         break;
  //       case "a4":
  //       default:
  //         pageFormat = "a4"; // Standard A4
  //     }

  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: pageFormat,
  //     });

  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       try {
  //         doc.addImage(headerImage, "PNG", margin, yPos, pageWidth - margin * 2, 60);
  //         yPos += 80;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //     }

  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);
  //     yPos += sectionGap + lineHeight;

  //     // Body
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     // Footer elements
  //     const footerY = pageHeight - margin - 180;
  //     const signatureX = margin;
  //     const sealSize = 80;
  //     const sealX = pageWidth - margin - sealSize - 35;
  //     const textBelowSealOffset = 20;

  //     const addFooter = (sealBase64?: string) => {
  //       let currentY = footerY;

  //       if (withSummon) {
  //         // Barangay captain info on the right side
  //         const captainX = pageWidth - margin - 170; // Adjust as needed
  //         doc.setFont("times", "bold");
  //         doc.text("HON. VIRGINIA N. ABENOJA", captainX, currentY);
  //         doc.setFont("times", "normal");
  //         doc.text("Punong Barangay", captainX, currentY + 20);

  //         // Summon signature fields at the bottom left
  //         doc.setFont("times", "normal");
  //         doc.text("COMPLAINANT _________________________", signatureX, currentY + 60);
  //         doc.text("RESPONDENT _________________________", signatureX, currentY + 80);
  //         doc.text("SERVER _________________________", signatureX, currentY + 100);
  //       } 
  //       else if (withSignature) {
  //         // Regular signature fields
  //         doc.setFont("times", "normal");
  //         doc.text("Name and signature of Applicant", signatureX, currentY);
  //         doc.text("Certified true and correct:", signatureX, currentY + 20);
  //         currentY += 60;

  //         // Barangay captain info
  //         doc.setFont("times", "bold");
  //         doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY + 20);
  //         doc.setFont("times", "normal");
  //         doc.text("Punong Barangay, San Roque", signatureX, currentY + 40);
  //       }

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 40;
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         // Text below seal
  //         doc.setTextColor(255, 0, 0);
  //         doc.setFont("times", "bold");
  //         doc.setFontSize(10);
          
  //         const textY = sealY + sealSize + textBelowSealOffset;
  //         const text = "NOT VALID WITHOUT SEAL";
  //         const textWidth = doc.getTextWidth(text);
          
  //         const minX = margin;
  //         const maxX = pageWidth - margin - textWidth;
  //         const centeredX = sealX + (sealSize - textWidth) / 2;
  //         const finalX = Math.max(minX, Math.min(centeredX, maxX));
          
  //         doc.text(text, finalX, textY);

  //         // Reset styles
  //         doc.setTextColor(0, 0, 0);
  //         doc.setFont("times", "normal");
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="w-full h-full">
  //       {pdfUrl ? (
  //         <iframe
  //           src={`${pdfUrl}#zoom=FitH`}
  //           className="w-full h-full border-0"
  //           title="Document Preview"
  //         />
  //       ) : (
  //         <div className="flex items-center justify-center h-full">
  //           <p>Generating PDF preview...</p>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default TemplatePreview;









  //GROK RESPONSE WITH RIGHT SUMMON FORMATTING
  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";

  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   title: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  //   withSummon?: boolean;
  //   paperSize?: string;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   title,
  //   body,
  //   withSeal,
  //   withSignature,
  //   withSummon = false,
  //   paperSize = "a4",
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   useEffect(() => {
  //     generatePDF();
  //   }, [headerImage, title, body, withSeal, withSignature, withSummon, paperSize]);

  //   const generatePDF = () => {
  //     // Convert paper size to jsPDF format
  //     let pageFormat: [number, number] | string;
  //     switch(paperSize) {
  //       case "legal":
  //         pageFormat = [612, 1008]; // 8.5×14 in (in points)
  //         break;
  //       case "letter":
  //         pageFormat = [612, 792]; // 8.5×11 in (in points)
  //         break;
  //       case "a4":
  //       default:
  //         pageFormat = "a4"; // Standard A4
  //     }

  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: pageFormat,
  //     });

  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       try {
  //         doc.addImage(headerImage, "PNG", margin, yPos, pageWidth - margin * 2, 60);
  //         yPos += 80;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //     }

  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);
  //     yPos += sectionGap + lineHeight;

  //     // Body
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     // Footer elements
  //     const footerY = pageHeight - margin - 180;
  //     const signatureX = margin;
  //     const sealSize = 80;
  //     const sealX = pageWidth - margin - sealSize - 35;
  //     const textBelowSealOffset = 20;

  //     const addFooter = (sealBase64?: string) => {
  //       let currentY = footerY;

  //       if (withSummon) {
  //         // Barangay captain info on the right side
  //         const captainX = pageWidth - margin - 170; // Adjust as needed
  //         doc.setFont("times", "bold");
  //         doc.text("HON. VIRGINIA N. ABENOJA", captainX, currentY);
  //         doc.setFont("times", "normal");
  //         doc.text("Punong Barangay", captainX, currentY + 20);

  //         // Add extra space after Punong Barangay
  //         currentY += 40;

  //         // Summon signature fields: COMPLAINANT and RESPONDENT on same line, SERVER below right-aligned
  //         doc.setFont("times", "normal");
  //         const complainantText = "COMPLAINANT  ________________";
  //         const respondentText = "RESPONDENT ___________________";
  //         const serverText = "SERVER ___________________";
          
  //         const complainantWidth = doc.getTextWidth(complainantText);
  //         const respondentWidth = doc.getTextWidth(respondentText);
  //         const serverWidth = doc.getTextWidth(serverText);
          
  //         const gapBetween = 40; // Space between COMPLAINANT and RESPONDENT
  //         const totalWidth = complainantWidth + gapBetween + respondentWidth;
  //         const availableWidth = pageWidth - 2 * margin; // Space between margins
          
  //         // Ensure text fits within margins
  //         let startX = signatureX; // Start at left margin
  //         if (totalWidth > availableWidth) {
  //           // Scale down or adjust if needed, but here we'll just ensure it starts at margin
  //           console.warn("Text may be too wide for page; adjusting to fit within margins");
  //         }
          
  //         // COMPLAINANT and RESPONDENT on the same line
  //         doc.text(complainantText, startX, currentY + 60);
  //         const respondentX = startX + complainantWidth + gapBetween;
  //         if (respondentX + respondentWidth <= pageWidth - margin) {
  //           doc.text(respondentText, respondentX, currentY + 60);
  //         } else {
  //           // If RESPONDENT would overflow, move it to the next line
  //           doc.text(respondentText, signatureX, currentY + 80);
  //           currentY += 20; // Adjust for next line
  //         }
          
  //         // SERVER right-aligned on the next line
  //         const serverX = pageWidth - margin - serverWidth - 45;
  //         doc.text(serverText, serverX, currentY + 80);
  //       } 
  //       else if (withSignature) {
  //         // Regular signature fields
  //         doc.setFont("times", "normal");
  //         doc.text("Name and signature of Applicant", signatureX, currentY);
  //         doc.text("Certified true and correct:", signatureX, currentY + 20);
  //         currentY += 60;

  //         // Barangay captain info
  //         doc.setFont("times", "bold");
  //         doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY + 20);
  //         doc.setFont("times", "normal");
  //         doc.text("Punong Barangay, San Roque", signatureX, currentY + 40);
  //       }

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 40;
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         // Text below seal
  //         doc.setTextColor(255, 0, 0);
  //         doc.setFont("times", "bold");
  //         doc.setFontSize(10);
          
  //         const textY = sealY + sealSize + textBelowSealOffset;
  //         const text = "NOT VALID WITHOUT SEAL";
  //         const textWidth = doc.getTextWidth(text);
          
  //         const minX = margin;
  //         const maxX = pageWidth - margin - textWidth;
  //         const centeredX = sealX + (sealSize - textWidth) / 2;
  //         const finalX = Math.max(minX, Math.min(centeredX, maxX));
          
  //         doc.text(text, finalX, textY);

  //         // Reset styles
  //         doc.setTextColor(0, 0, 0);
  //         doc.setFont("times", "normal");
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="w-full h-full">
  //       {pdfUrl ? (
  //         <iframe
  //           src={`${pdfUrl}#zoom=FitH`}
  //           className="w-full h-full border-0"
  //           title="Document Preview"
  //         />
  //       ) : (
  //         <div className="flex items-center justify-center h-full">
  //           <p>Generating PDF preview...</p>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default TemplatePreview;









  //LATEST WITH NO ADDITIONAL DETAILS ABOVE THE TITLE
  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";

  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   title: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  //   withSummon?: boolean;
  //   paperSize?: string;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   title,
  //   body,
  //   withSeal,
  //   withSignature,
  //   withSummon = false,
  //   paperSize = "a4",
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   useEffect(() => {
  //     generatePDF();
  //   }, [headerImage, title, body, withSeal, withSignature, withSummon, paperSize]);

  //   const generatePDF = () => {
  //     // Convert paper size to jsPDF format
  //     let pageFormat: [number, number] | string;
  //     switch(paperSize) {
  //       case "legal":
  //         pageFormat = [612, 1008]; // 8.5×14 in (in points)
  //         break;
  //       case "letter":
  //         pageFormat = [612, 792]; // 8.5×11 in (in points)
  //         break;
  //       case "a4":
  //       default:
  //         pageFormat = "a4"; // Standard A4
  //     }

  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: pageFormat,
  //     });

  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       try {
  //         doc.addImage(headerImage, "PNG", margin, yPos, pageWidth - margin * 2, 60);
  //         yPos += 80;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //     }

  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);
  //     yPos += sectionGap + lineHeight;

  //     // Body
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     // Footer elements
  //     const footerY = pageHeight - margin - 180;
  //     const signatureX = margin;
  //     const sealSize = 80;
  //     const sealX = pageWidth - margin - sealSize - 35;
  //     const textBelowSealOffset = 20;

  //     const addFooter = (sealBase64?: string) => {
  //       let currentY = footerY;

  //       if (withSummon) {
  //         // Barangay captain info on the right side
  //         const captainX = pageWidth - margin - 170;
  //         doc.setFont("times", "bold");
  //         doc.text("HON. VIRGINIA N. ABENOJA", captainX, currentY);
  //         doc.setFont("times", "normal");
  //         doc.text("Punong Barangay", captainX + 34, currentY + 20);

  //         //adds a space after the Punong Barangay na word
  //         currentY += 90;

  //         // Summon signature fields - new format
  //         doc.setFont("times", "normal");
          
  //         // Calculate positions
  //         const fieldSpacing = 30;
  //         const lineLength = 200; // Length of each field line
          
  //         // COMPLAINANT and RESPONDENT on same line
  //         doc.text("COMPLAINANT ____________________", signatureX, currentY);
  //         doc.text("RESPONDENT ____________________", signatureX + lineLength + 20, currentY);
          
  //         // SERVER aligned to right below RESPONDENT
  //         doc.text("SERVER ____________________", signatureX + lineLength + 20, currentY + fieldSpacing);
  //       } 
  //       else if (withSignature) {
  //         // Regular signature fields
  //         doc.setFont("times", "normal");
  //         doc.text("Name and signature of Applicant", signatureX, currentY);
  //         doc.text("Certified true and correct:", signatureX, currentY + 20);
  //         currentY += 60;

  //         // Barangay captain info
  //         doc.setFont("times", "bold");
  //         doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY + 20);
  //         doc.setFont("times", "normal");
  //         doc.text("Punong Barangay, San Roque", signatureX, currentY + 40);
  //       }

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 40;
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         // Text below seal
  //         doc.setTextColor(255, 0, 0);
  //         doc.setFont("times", "bold");
  //         doc.setFontSize(10);
          
  //         const textY = sealY + sealSize + textBelowSealOffset;
  //         const text = "NOT VALID WITHOUT SEAL";
  //         const textWidth = doc.getTextWidth(text);
          
  //         const minX = margin;
  //         const maxX = pageWidth - margin - textWidth;
  //         const centeredX = sealX + (sealSize - textWidth) / 2;
  //         const finalX = Math.max(minX, Math.min(centeredX, maxX));
          
  //         doc.text(text, finalX, textY);

  //         // Reset styles
  //         doc.setTextColor(0, 0, 0);
  //         doc.setFont("times", "normal");
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="w-full h-full">
  //       {pdfUrl ? (
  //         <iframe
  //           src={`${pdfUrl}#zoom=FitH`}
  //           className="w-full h-full border-0"
  //           title="Document Preview"
  //         />
  //       ) : (
  //         <div className="flex items-center justify-center h-full">
  //           <p>Generating PDF preview...</p>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default TemplatePreview;




  //LATEST BEFORE ADDING THE NEW FONT
  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";


  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   belowHeaderContent: string;
  //   title: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  //   withSummon?: boolean;
  //   paperSize?: string;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   belowHeaderContent, 
  //   title,
  //   body,
  //   withSeal,
  //   withSignature,
  //   withSummon = false,
  //   paperSize = "a4",
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   useEffect(() => {
  //     generatePDF();
  //   }, [headerImage, belowHeaderContent, title, body, withSeal, withSignature, withSummon, paperSize]);

  //   const generatePDF = () => {
  //     // Convert paper size to jsPDF format
  //     let pageFormat: [number, number] | string;
  //     switch(paperSize) {
  //       case "legal":
  //         pageFormat = [612, 1008]; // 8.5×14 in (in points)
  //         break;
  //       case "letter":
  //         pageFormat = [612, 792]; // 8.5×11 in (in points)
  //         break;
  //       case "a4":
  //       default:
  //         pageFormat = "a4"; // Standard A4
  //     }

  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: pageFormat,
  //     });

  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     doc.setFont("times", "normal");
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       try {
  //         doc.addImage(headerImage, "PNG", margin, yPos, pageWidth - margin * 2, 60);
  //         yPos += 80;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //       yPos += 10;
  //     }


  //     // Below header content (new section)
  //     if (belowHeaderContent) {

  //       doc.setFontSize(10);
  //       const belowHeaderLines = doc.splitTextToSize(belowHeaderContent, pageWidth - margin * 2);
  //       for (let i = 0; i < belowHeaderLines.length; i++) {
  //         if (yPos + lineHeight > pageHeight - margin) {
  //           doc.addPage();
  //           yPos = margin;
  //         }
  //         doc.text(belowHeaderLines[i], margin, yPos);
  //         yPos += lineHeight;
  //       }
  //       yPos += sectionGap; // Add some space after the content
  //     }

  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     doc.setFont("times", "normal");
  //     doc.setFontSize(10); // body font size
  //     yPos += sectionGap + lineHeight;

  //     // Body
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     // Footer elements
  //     doc.setFontSize(11);
  //     const footerY = pageHeight - margin - 180;
  //     const signatureX = margin;
  //     const sealSize = 80;
  //     const sealX = pageWidth - margin - sealSize - 35;
  //     const textBelowSealOffset = 20;

  //     const addFooter = (sealBase64?: string) => {
  //       let currentY = footerY;

  //       if (withSummon) {
  //         // Barangay captain info on the right side
  //         const captainX = pageWidth - margin - 170;
  //         doc.setFont("times", "bold");
  //         doc.text("HON. VIRGINIA N. ABENOJA", captainX, currentY);
  //         doc.setFont("times", "normal");
  //         doc.text("Punong Barangay", captainX + 34, currentY + 20);

  //         //adds a space after the Punong Barangay na word
  //         currentY += 90;

  //         // Summon signature fields - new format
  //         doc.setFont("times", "normal");
          
  //         // Calculate positions
  //         const fieldSpacing = 30;
  //         const lineLength = 200; // Length of each field line
          
  //         // COMPLAINANT and RESPONDENT on same line
  //         doc.text("COMPLAINANT ____________________", signatureX, currentY);
  //         doc.text("RESPONDENT ____________________", signatureX + lineLength + 20, currentY);
          
  //         // SERVER aligned to right below RESPONDENT
  //         doc.text("SERVER ____________________", signatureX + lineLength + 20, currentY + fieldSpacing);
  //       } 
  //       else if (withSignature) {
  //         // Regular signature fields
  //         doc.setFont("times", "normal");
  //         doc.text("Name and signature of Applicant", signatureX, currentY);
  //         doc.text("Certified true and correct:", signatureX, currentY + 20);
  //         currentY += 60;

  //         // Barangay captain info
  //         doc.setFont("times", "bold");
  //         doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY + 20);
  //         doc.setFont("times", "normal");
  //         doc.text("Punong Barangay, San Roque", signatureX, currentY + 40);
  //       }

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 40;
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         // Text below seal
  //         doc.setTextColor(255, 0, 0);
  //         doc.setFont("times", "bold");
  //         doc.setFontSize(10);
          
  //         const textY = sealY + sealSize + textBelowSealOffset;
  //         const text = "NOT VALID WITHOUT SEAL";
  //         const textWidth = doc.getTextWidth(text);
          
  //         const minX = margin;
  //         const maxX = pageWidth - margin - textWidth;
  //         const centeredX = sealX + (sealSize - textWidth) / 2;
  //         const finalX = Math.max(minX, Math.min(centeredX, maxX));
          
  //         doc.text(text, finalX, textY);

  //         // Reset styles
  //         doc.setTextColor(0, 0, 0);
  //         doc.setFont("times", "normal");
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="w-full h-full">
  //       {pdfUrl ? (
  //         <iframe
  //           src={`${pdfUrl}#zoom=FitH`}
  //           className="w-full h-full border-0"
  //           title="Document Preview"
  //         />
  //       ) : (
  //         <div className="flex items-center justify-center h-full">
  //           <p>Generating PDF preview...</p>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default TemplatePreview;






  //LATEST BEFORE SUBTITLE (GROK)
  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";
  // import { veraMonoNormal } from "@/assets/fonts/VeraMono-normal";
  // import { veraMonoBold } from "@/assets/fonts/VeraMono-Bold-bold";


  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   belowHeaderContent: string;
  //   title: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  //   withSummon?: boolean;
  //   paperSize?: string;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   belowHeaderContent, 
  //   title,
  //   body,
  //   withSeal,
  //   withSignature,
  //   withSummon = false,
  //   paperSize = "a4",
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   const registerFonts = (doc: jsPDF) => {
  //     doc.addFileToVFS('VeraMono-normal.ttf', veraMonoNormal);
  //     doc.addFont('VeraMono-normal.ttf', 'VeraMono', 'normal');
      
  //     doc.addFileToVFS('VeraMono-Bold-bold.ttf', veraMonoBold);
  //     doc.addFont('VeraMono-Bold-bold.ttf', 'VeraMono', 'bold');
  //   };

  //   useEffect(() => {
  //     generatePDF();
  //   }, [headerImage, belowHeaderContent, title, body, withSeal, withSignature, withSummon, paperSize]);

  //   const generatePDF = () => {
  //     // Convert paper size to jsPDF format
  //     let pageFormat: [number, number] | string;
  //     switch(paperSize) {
  //       case "legal":
  //         pageFormat = [612, 1008]; // 8.5×14 in (in points)
  //         break;
  //       case "letter":
  //         pageFormat = [612, 792]; // 8.5×11 in (in points)
  //         break;
  //       case "a4":
  //       default:
  //         pageFormat = "a4"; // Standard A4
  //     }

  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: pageFormat,
  //     });


  //     //register the fonts
  //     registerFonts(doc);

      
  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     // Set initial font based on withSummon
  //     const setCurrentFont = (style: 'normal' | 'bold' = 'normal') => {
  //       if (withSummon) {
  //         doc.setFont("VeraMono", style);
  //       } else {
  //         doc.setFont("times", style);
  //       }
  //     };

  //     setCurrentFont('normal');
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       const imageHeight = 100;
  //       try {
  //         doc.addImage(headerImage, "PNG", margin, yPos, pageWidth - margin * 2, imageHeight);
  //         yPos += imageHeight + 30;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //       yPos += 10;
  //     }


  //     // Below header content (new section)
  //     if (belowHeaderContent) {

  //       doc.setFontSize(10);
  //       setCurrentFont('normal');
  //       const belowHeaderLines = doc.splitTextToSize(belowHeaderContent, pageWidth - margin * 2);
  //       for (let i = 0; i < belowHeaderLines.length; i++) {
  //         if (yPos + lineHeight > pageHeight - margin) {
  //           doc.addPage();
  //           yPos = margin;
  //         }
  //         doc.text(belowHeaderLines[i], margin, yPos);
  //         yPos += lineHeight;
  //       }
  //       yPos += sectionGap; // Add some space after the content
  //     }


  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     // doc.setFont("times", "normal");
  //     setCurrentFont('normal');
  //     doc.setFontSize(12); // body font size
  //     yPos += sectionGap + lineHeight;

  //     // Body
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     yPos += 40;


  //     // Footer elements
  //     doc.setFontSize(10);
  //     const footerY = pageHeight - margin - 110;
  //     const signatureX = margin;
  //     const sealSize = 80;
  //     const sealX = pageWidth - margin - sealSize - 35;
  //     const textBelowSealOffset = 20;

  //     const addFooter = (sealBase64?: string) => {
  //       let currentY = footerY;

  //       if (withSummon) {
  //         // Barangay captain info on the right side
  //         const captainX = pageWidth - margin - 170;
  //         setCurrentFont('bold');
  //         doc.text("HON. VIRGINIA N. ABENOJA", captainX, currentY);
  //         setCurrentFont('normal');;
  //         doc.text("Punong Barangay", captainX + 34, currentY + 20);

  //         //adds a space after the Punong Barangay na word
  //         currentY += 73;

  //         // Summon signature fields - new format
  //         setCurrentFont('normal');
          
  //         // Calculate positions
  //         const fieldSpacing = 30;
  //         const lineLength = 200; // Length of each field line
          
  //         // COMPLAINANT and RESPONDENT on same line
  //         doc.text("COMPLAINANT ____________________", signatureX, currentY);
  //         doc.text("RESPONDENT ____________________", signatureX + lineLength + 20, currentY);
          
  //         // SERVER aligned to right below RESPONDENT
  //         doc.text("SERVER ____________________", signatureX + lineLength + 20, currentY + fieldSpacing);
  //       } 
  //       else if (withSignature) {
  //         // Regular signature fields
  //         setCurrentFont('normal');
  //         doc.text("Name and signature of Applicant", signatureX, currentY);
  //         doc.text("Certified true and correct:", signatureX, currentY + 20);
  //         currentY += 60;

  //         // Barangay captain info
  //         setCurrentFont('bold');
  //         doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY + 20);
  //         setCurrentFont('normal');
  //         doc.text("Punong Barangay, San Roque Ciudad", signatureX, currentY + 40);
  //       }

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 40;
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         // Text below seal
  //         doc.setTextColor(255, 0, 0);
  //         setCurrentFont('bold');
  //         doc.setFontSize(10);
          
  //         const textY = sealY + sealSize + textBelowSealOffset;
  //         const text = "NOT VALID WITHOUT SEAL";
  //         const textWidth = doc.getTextWidth(text);
          
  //         const minX = margin;
  //         const maxX = pageWidth - margin - textWidth;
  //         const centeredX = sealX + (sealSize - textWidth) / 2;
  //         const finalX = Math.max(minX, Math.min(centeredX, maxX));
          
  //         doc.text(text, finalX, textY);

  //         // Reset styles
  //         doc.setTextColor(0, 0, 0);
  //         setCurrentFont('normal');
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="w-full h-full">
  //       {pdfUrl ? (
  //         <iframe
  //           src={`${pdfUrl}#zoom=FitH`}
  //           className="w-full h-full border-0"
  //           title="Document Preview"
  //         />
  //       ) : (
  //         <div className="flex items-center justify-center h-full">
  //           <p>Generating PDF preview...</p>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default TemplatePreview;






  //LASTEST BEFORE DYNAMIC MARGIN
  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";
  // import { veraMonoNormal } from "@/assets/fonts/VeraMono-normal";
  // import { veraMonoBold } from "@/assets/fonts/VeraMono-Bold-bold";


  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   belowHeaderContent: string;
  //   title: string;
  //   subtitle: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  //   withSummon?: boolean;
  //   paperSize?: string;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   belowHeaderContent, 
  //   title,
  //   subtitle,
  //   body,
  //   withSeal,
  //   withSignature,
  //   withSummon = false,
  //   paperSize = "letter",
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   const registerFonts = (doc: jsPDF) => {
  //     doc.addFileToVFS('VeraMono-normal.ttf', veraMonoNormal);
  //     doc.addFont('VeraMono-normal.ttf', 'VeraMono', 'normal');
      
  //     doc.addFileToVFS('VeraMono-Bold-bold.ttf', veraMonoBold);
  //     doc.addFont('VeraMono-Bold-bold.ttf', 'VeraMono', 'bold');
  //   };

  //   useEffect(() => {
  //     generatePDF();
  //   }, [headerImage, belowHeaderContent, title, subtitle, body, withSeal, withSignature, withSummon, paperSize]);

  //   const generatePDF = () => {
  //     // Convert paper size to jsPDF format
  //     let pageFormat: [number, number] | string;
  //     switch(paperSize) {
  //       case "legal":
  //         pageFormat = [612, 1008]; // 8.5×14 in (in points)
  //         break;
  //       case "letter":
  //         pageFormat = [612, 792]; // 8.5×11 in (in points)
  //         break;
  //       case "a4":
  //       default:
  //         pageFormat = "a4"; // Standard A4
  //     }

  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: pageFormat,
  //     });


  //     //register the fonts
  //     registerFonts(doc);

      
  //     const margin = 72;
  //     let yPos = margin;
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     // Set initial font based on withSummon
  //     const setCurrentFont = (style: 'normal' | 'bold' = 'normal') => {
  //       if (withSummon) {
  //         doc.setFont("VeraMono", style);
  //       } else {
  //         doc.setFont("times", style);
  //       }
  //     };

  //     setCurrentFont('normal');
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       const imageHeight = 100;
  //       try {
  //         doc.addImage(headerImage, "PNG", margin, yPos, pageWidth - margin * 2, imageHeight);
  //         yPos += imageHeight + 30;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //       yPos += 10;
  //     }


  //     // Below header content (new section)
  //     if (belowHeaderContent) {

  //       doc.setFontSize(10);
  //       setCurrentFont('normal');
  //       const belowHeaderLines = doc.splitTextToSize(belowHeaderContent, pageWidth - margin * 2);
  //       for (let i = 0; i < belowHeaderLines.length; i++) {
  //         if (yPos + lineHeight > pageHeight - margin) {
  //           doc.addPage();
  //           yPos = margin;
  //         }
  //         doc.text(belowHeaderLines[i], margin, yPos);
  //         yPos += lineHeight;
  //       }
  //       yPos += 10; // Add some space after the content
  //     }


  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     yPos += lineHeight; // Move down for subtitle

  //     // Subtitle
  //     if (subtitle) {
  //       doc.setFont("times", "normal");
  //       doc.setFontSize(8);
  //       const subtitleWidth = doc.getTextWidth(subtitle);
  //       doc.text(subtitle, (pageWidth - subtitleWidth) / 2, yPos);
  //       yPos += 10; // Move down after subtitle
  //     }

  //     setCurrentFont('normal');
  //     doc.setFontSize(10); // body font size
  //     yPos += sectionGap;

  //     // Body
  //     const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - margin) {
  //         doc.addPage();
  //         yPos = margin;
  //       }
  //       doc.text(splitText[i], margin, yPos);
  //       yPos += lineHeight;
  //     }

  //     yPos += 40;


  //     // Footer elements
  //     doc.setFontSize(10);
  //     const footerY = pageHeight - margin - 90;
  //     const signatureX = margin;
  //     const sealSize = 80;
  //     const sealX = pageWidth - margin - sealSize - 35;
  //     const textBelowSealOffset = 20;

  //     const addFooter = (sealBase64?: string) => {
  //       let currentY = footerY;

  //       if (withSummon) {
  //         // Barangay captain info on the right side
  //         const captainX = pageWidth - margin - 170;
  //         setCurrentFont('bold');
  //         doc.text("HON. VIRGINIA N. ABENOJA", captainX, currentY);
  //         setCurrentFont('normal');;
  //         doc.text("Punong Barangay", captainX + 34, currentY + 20);

  //         //adds a space after the Punong Barangay na word
  //         currentY += 70;

  //         // Summon signature fields - new format
  //         setCurrentFont('normal');
          
  //         // Calculate positions
  //         const fieldSpacing = 30;
  //         const lineLength = 200; // Length of each field line
          
  //         // COMPLAINANT and RESPONDENT on same line
  //         doc.text("COMPLAINANT ____________________", signatureX, currentY);
  //         doc.text("RESPONDENT ____________________", signatureX + lineLength + 20, currentY);
          
  //         // SERVER aligned to right below RESPONDENT
  //         doc.text("SERVER ____________________", signatureX + lineLength + 20, currentY + fieldSpacing);
  //       } 
  //       else if (withSignature) {
  //         // Regular signature fields
  //         setCurrentFont('normal');
  //         doc.text("Name and signature of Applicant", signatureX, currentY);
  //         doc.text("Certified true and correct:", signatureX, currentY + 20);
  //         currentY += 60;

  //         // Barangay captain info
  //         setCurrentFont('bold');
  //         doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY + 20);
  //         setCurrentFont('normal');
  //         doc.text("Punong Barangay, San Roque Ciudad", signatureX, currentY + 40);
  //       }

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 40;
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         // Text below seal
  //         doc.setTextColor(255, 0, 0);
  //         setCurrentFont('bold');
  //         doc.setFontSize(10);
          
  //         const textY = sealY + sealSize + textBelowSealOffset;
  //         const text = "NOT VALID WITHOUT SEAL";
  //         const textWidth = doc.getTextWidth(text);
          
  //         const minX = margin;
  //         const maxX = pageWidth - margin - textWidth;
  //         const centeredX = sealX + (sealSize - textWidth) / 2;
  //         const finalX = Math.max(minX, Math.min(centeredX, maxX));
          
  //         doc.text(text, finalX, textY);

  //         // Reset styles
  //         doc.setTextColor(0, 0, 0);
  //         setCurrentFont('normal');
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="w-full h-full">
  //       {pdfUrl ? (
  //         <iframe
  //           src={`${pdfUrl}#zoom=FitH`}
  //           className="w-full h-full border-0"
  //           title="Document Preview"
  //         />
  //       ) : (
  //         <div className="flex items-center justify-center h-full">
  //           <p>Generating PDF preview...</p>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default TemplatePreview;






  //WITH DYNAMIC MARGIN BUT THE FOOTER OVERLAPS THE MARGIN BOTTOM
  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";
  // import { veraMonoNormal } from "@/assets/fonts/VeraMono-normal";
  // import { veraMonoBold } from "@/assets/fonts/VeraMono-Bold-bold";


  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   belowHeaderContent: string;
  //   title: string;
  //   subtitle: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  //   withSummon?: boolean;
  //   paperSize?: string;
  //   margin?: string;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   belowHeaderContent, 
  //   title,
  //   subtitle,
  //   body,
  //   withSeal,
  //   withSignature,
  //   withSummon = false,
  //   paperSize = "letter",
  //   margin = "normal"
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   const registerFonts = (doc: jsPDF) => {
  //     doc.addFileToVFS('VeraMono-normal.ttf', veraMonoNormal);
  //     doc.addFont('VeraMono-normal.ttf', 'VeraMono', 'normal');
      
  //     doc.addFileToVFS('VeraMono-Bold-bold.ttf', veraMonoBold);
  //     doc.addFont('VeraMono-Bold-bold.ttf', 'VeraMono', 'bold');
  //   };

  //   useEffect(() => {
  //     generatePDF();
  //   }, [headerImage, belowHeaderContent, title, subtitle, body, withSeal, withSignature, withSummon, paperSize]);

  //   const generatePDF = () => {
  //     // Convert paper size to jsPDF format
  //     let pageFormat: [number, number] | string;
  //     switch(paperSize) {
  //       case "legal":
  //         pageFormat = [612, 1008]; // 8.5×14 in (in points)
  //         break;
  //       case "letter":
  //         pageFormat = [612, 792]; // 8.5×11 in (in points)
  //         break;
  //       case "a4":
  //       default:
  //         pageFormat = "a4"; // Standard A4
  //     }

  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: pageFormat,
  //     });


  //     //register the fonts
  //     registerFonts(doc);

      
  //     const marginValue = margin === 'narrow' ? 36 : 72;
  //     let yPos = marginValue;
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     // Set initial font based on withSummon
  //     const setCurrentFont = (style: 'normal' | 'bold' = 'normal') => {
  //       if (withSummon) {
  //         doc.setFont("VeraMono", style);
  //       } else {
  //         doc.setFont("times", style);
  //       }
  //     };

  //     setCurrentFont('normal');
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       const imageHeight = 100;
  //       try {
  //         doc.addImage(headerImage, "PNG", marginValue, yPos, pageWidth - marginValue * 2, imageHeight);
  //         yPos += imageHeight + 30;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //       yPos += 10;
  //     }


  //     // Below header content (new section)
  //     if (belowHeaderContent) {

  //       doc.setFontSize(10);
  //       setCurrentFont('normal');
  //       const belowHeaderLines = doc.splitTextToSize(belowHeaderContent, pageWidth - marginValue * 2);
  //       for (let i = 0; i < belowHeaderLines.length; i++) {
  //         if (yPos + lineHeight > pageHeight - marginValue) {
  //           doc.addPage();
  //           yPos = marginValue;
  //         }
  //         doc.text(belowHeaderLines[i], marginValue, yPos);
  //         yPos += lineHeight;
  //       }
  //       yPos += 10; // Add some space after the content
  //     }


  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     yPos += lineHeight; // Move down for subtitle

  //     // Subtitle
  //     if (subtitle) {
  //       doc.setFont("times", "normal");
  //       doc.setFontSize(8);
  //       const subtitleWidth = doc.getTextWidth(subtitle);
  //       doc.text(subtitle, (pageWidth - subtitleWidth) / 2, yPos);
  //       yPos += 10; // Move down after subtitle
  //     }

  //     setCurrentFont('normal');
  //     doc.setFontSize(10); // body font size
  //     yPos += sectionGap;

  //     // Body
  //     const splitText = doc.splitTextToSize(body, pageWidth - marginValue * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - marginValue) {
  //         doc.addPage();
  //         yPos = marginValue;
  //       }
  //       doc.text(splitText[i], marginValue, yPos);
  //       yPos += lineHeight;
  //     }

  //     yPos += 40;


  //     // Footer elements
  //     doc.setFontSize(10);
  //     const footerY = pageHeight - marginValue - 90;
  //     const signatureX = marginValue;
  //     const sealSize = 80;
  //     const sealX = pageWidth - marginValue - sealSize - 35;
  //     const textBelowSealOffset = 20;

  //     const addFooter = (sealBase64?: string) => {
  //       let currentY = footerY;

  //       if (withSummon) {
  //         // Barangay captain info on the right side
  //         const captainX = pageWidth - marginValue - 170;
  //         setCurrentFont('bold');
  //         doc.text("HON. VIRGINIA N. ABENOJA", captainX, currentY);
  //         setCurrentFont('normal');;
  //         doc.text("Punong Barangay", captainX + 34, currentY + 20);

  //         //adds a space after the Punong Barangay na word
  //         currentY += 70;

  //         // Summon signature fields - new format
  //         setCurrentFont('normal');
          
  //         // Calculate positions
  //         const fieldSpacing = 30;
  //         const lineLength = 200; // Length of each field line
          
  //         // COMPLAINANT and RESPONDENT on same line
  //         doc.text("COMPLAINANT ____________________", signatureX, currentY);
  //         doc.text("RESPONDENT ____________________", signatureX + lineLength + 20, currentY);
          
  //         // SERVER aligned to right below RESPONDENT
  //         doc.text("SERVER ____________________", signatureX + lineLength + 20, currentY + fieldSpacing);
  //       } 
  //       else if (withSignature) {
  //         // Regular signature fields
  //         setCurrentFont('normal');
  //         doc.text("Name and signature of Applicant", signatureX, currentY);
  //         doc.text("Certified true and correct:", signatureX, currentY + 20);
  //         currentY += 60;

  //         // Barangay captain info
  //         setCurrentFont('bold');
  //         doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY + 20);
  //         setCurrentFont('normal');
  //         doc.text("Punong Barangay, San Roque Ciudad", signatureX, currentY + 40);
  //       }

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 40;
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         // Text below seal
  //         doc.setTextColor(255, 0, 0);
  //         setCurrentFont('bold');
  //         doc.setFontSize(10);
          
  //         const textY = sealY + sealSize + textBelowSealOffset;
  //         const text = "NOT VALID WITHOUT SEAL";
  //         const textWidth = doc.getTextWidth(text);
          
  //         const minX = marginValue;
  //         const maxX = pageWidth - marginValue - textWidth;
  //         const centeredX = sealX + (sealSize - textWidth) / 2;
  //         const finalX = Math.max(minX, Math.min(centeredX, maxX));
          
  //         doc.text(text, finalX, textY);

  //         // Reset styles
  //         doc.setTextColor(0, 0, 0);
  //         setCurrentFont('normal');
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="w-full h-full">
  //       {pdfUrl ? (
  //         <iframe
  //           src={`${pdfUrl}#zoom=FitH`}
  //           className="w-full h-full border-0"
  //           title="Document Preview"
  //         />
  //       ) : (
  //         <div className="flex items-center justify-center h-full">
  //           <p>Generating PDF preview...</p>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default TemplatePreview;







  //LATEST WITH NO CHANGES
  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";
  // import { veraMonoNormal } from "@/assets/fonts/VeraMono-normal";
  // import { veraMonoBold } from "@/assets/fonts/VeraMono-Bold-bold";


  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   belowHeaderContent: string;
  //   title: string;
  //   subtitle: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  //   withSummon?: boolean;
  //   paperSize?: string;
  //   margin?: string;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   belowHeaderContent, 
  //   title,
  //   subtitle,
  //   body,
  //   withSeal,
  //   withSignature,
  //   withSummon = false,
  //   paperSize = "letter",
  //   margin = "normal"
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   const registerFonts = (doc: jsPDF) => {
  //     doc.addFileToVFS('VeraMono-normal.ttf', veraMonoNormal);
  //     doc.addFont('VeraMono-normal.ttf', 'VeraMono', 'normal');
      
  //     doc.addFileToVFS('VeraMono-Bold-bold.ttf', veraMonoBold);
  //     doc.addFont('VeraMono-Bold-bold.ttf', 'VeraMono', 'bold');
  //   };

  //   useEffect(() => {
  //     generatePDF();
  //   }, [headerImage, belowHeaderContent, title, subtitle, body, withSeal, withSignature, withSummon, paperSize]);

  //   const generatePDF = () => {
  //     // Convert paper size to jsPDF format
  //     let pageFormat: [number, number] | string;
  //     switch(paperSize) {
  //       case "legal":
  //         pageFormat = [612, 1008]; // 8.5×14 in (in points)
  //         break;
  //       case "letter":
  //         pageFormat = [612, 792]; // 8.5×11 in (in points)
  //         break;
  //       case "a4":
  //       default:
  //         pageFormat = "a4"; // Standard A4
  //     }

  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: pageFormat,
  //     });


  //     //register the fonts
  //     registerFonts(doc);

      
  //     const marginValue = margin === 'narrow' ? 36 : 72;
  //     let yPos = marginValue;
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     // Set initial font based on withSummon
  //     const setCurrentFont = (style: 'normal' | 'bold' = 'normal') => {
  //       if (withSummon) {
  //         doc.setFont("VeraMono", style);
  //       } else {
  //         doc.setFont("times", style);
  //       }
  //     };

  //     setCurrentFont('normal');
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       const imageHeight = 130;
  //       try {
  //         doc.addImage(headerImage, "PNG", marginValue, yPos, pageWidth - marginValue * 2, imageHeight);
  //         yPos += imageHeight + 30;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //       yPos += 10;
  //     }


  //     // Below header content (new section)
  //     if (belowHeaderContent) {

  //       doc.setFontSize(10);
  //       setCurrentFont('normal');
  //       const belowHeaderLines = doc.splitTextToSize(belowHeaderContent, pageWidth - marginValue * 2);
  //       for (let i = 0; i < belowHeaderLines.length; i++) {
  //         if (yPos + lineHeight > pageHeight - marginValue) {
  //           doc.addPage();
  //           yPos = marginValue;
  //         }
  //         doc.text(belowHeaderLines[i], marginValue, yPos);
  //         yPos += lineHeight;
  //       }
  //       yPos += 20; // Add some space after the content
  //     }


  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     yPos += lineHeight; // Move down for subtitle

  //     // Subtitle
  //     if (subtitle) {
  //       doc.setFont("times", "normal");
  //       doc.setFontSize(9);
  //       const subtitleWidth = doc.getTextWidth(subtitle);
  //       doc.text(subtitle, (pageWidth - subtitleWidth) / 2, yPos);
  //       yPos += 10; // Move down after subtitle
  //     }

  //     setCurrentFont('normal');
  //     doc.setFontSize(10); // body font size
  //     yPos += sectionGap;

  //     // Body
  //     const contentWidth = pageWidth - marginValue * 2;
  //     const splitText = doc.splitTextToSize(body, contentWidth);
  //     // const splitText = doc.splitTextToSize(body, pageWidth - marginValue * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - marginValue) {
  //         doc.addPage();
  //         yPos = marginValue;
  //       }
  //       doc.text(splitText[i], marginValue, yPos);
  //       yPos += lineHeight;
  //     }

  //     yPos += 40;


  //     // Footer elements
  //     doc.setFontSize(10);
  //     const footerY = pageHeight - marginValue - 120;
  //     const signatureX = marginValue;
  //     const sealSize = 80;
  //     const sealX = pageWidth - marginValue - sealSize - 35;
  //     const textBelowSealOffset = 20;

  //     const addFooter = (sealBase64?: string) => {
  //       let currentY = footerY;

  //       if (withSummon) {
  //         // Barangay captain info on the right side
  //         const captainX = pageWidth - marginValue - 170;
  //         setCurrentFont('bold');
  //         doc.text("HON. VIRGINIA N. ABENOJA", captainX, currentY);
  //         setCurrentFont('normal');;
  //         doc.text("Punong Barangay", captainX + 34, currentY + 20);

  //         //adds a space after the Punong Barangay na word
  //         currentY += 70;

  //         // Summon signature fields - new format
  //         setCurrentFont('normal');
          
  //         // Calculate positions
  //         const fieldSpacing = 30;
  //         const lineLength = 200; // Length of each field line
          
  //         // COMPLAINANT and RESPONDENT on same line
  //         doc.text("COMPLAINANT ____________________", signatureX, currentY);
  //         doc.text("RESPONDENT ____________________", signatureX + lineLength + 20, currentY);
          
  //         // SERVER aligned to right below RESPONDENT
  //         doc.text("SERVER ____________________", signatureX + lineLength + 20, currentY + fieldSpacing);
  //       } 
  //       else if (withSignature) {
  //         // Regular signature fields
  //         setCurrentFont('normal');
  //         doc.text("Name and signature of Applicant", signatureX, currentY);
  //         doc.text("Certified true and correct:", signatureX, currentY + 20);
  //         currentY += 60;

  //         // Barangay captain info
  //         setCurrentFont('bold');
  //         doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY + 20);
  //         setCurrentFont('normal');
  //         doc.text("Punong Barangay, San Roque Ciudad", signatureX, currentY + 40);
  //       }

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 40;
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         // Text below seal
  //         doc.setTextColor(255, 0, 0);
  //         setCurrentFont('bold');
  //         doc.setFontSize(10);
          
  //         const textY = sealY + sealSize + textBelowSealOffset;
  //         const text = "NOT VALID WITHOUT SEAL";
  //         const textWidth = doc.getTextWidth(text);
          
  //         const minX = marginValue;
  //         const maxX = pageWidth - marginValue - textWidth;
  //         const centeredX = sealX + (sealSize - textWidth) / 2;
  //         const finalX = Math.max(minX, Math.min(centeredX, maxX));
          
  //         doc.text(text, finalX, textY);

  //         // Reset styles
  //         doc.setTextColor(0, 0, 0);
  //         setCurrentFont('normal');
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="w-full h-full">
  //       {pdfUrl ? (
  //         <iframe
  //           src={`${pdfUrl}#zoom=FitH`}
  //           className="w-full h-full border-0"
  //           title="Document Preview"
  //         />
  //       ) : (
  //         <div className="flex items-center justify-center h-full">
  //           <p>Generating PDF preview...</p>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default TemplatePreview;





  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";
  // import { veraMonoNormal } from "@/assets/fonts/VeraMono-normal";
  // import { veraMonoBold } from "@/assets/fonts/VeraMono-Bold-bold";


  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   belowHeaderContent: string;
  //   title: string;
  //   subtitle: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  //   withSummon?: boolean;
  //   paperSize?: string;
  //   margin?: string;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   belowHeaderContent, 
  //   title,
  //   subtitle,
  //   body,
  //   withSeal,
  //   withSignature,
  //   withSummon = false,
  //   paperSize = "letter",
  //   margin = "normal"
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   const registerFonts = (doc: jsPDF) => {
  //     doc.addFileToVFS('VeraMono-normal.ttf', veraMonoNormal);
  //     doc.addFont('VeraMono-normal.ttf', 'VeraMono', 'normal');
      
  //     doc.addFileToVFS('VeraMono-Bold-bold.ttf', veraMonoBold);
  //     doc.addFont('VeraMono-Bold-bold.ttf', 'VeraMono', 'bold');
  //   };

  //   useEffect(() => {
  //     generatePDF();
  //   }, [headerImage, belowHeaderContent, title, subtitle, body, withSeal, withSignature, withSummon, paperSize]);

  //   const generatePDF = () => {
  //     // Convert paper size to jsPDF format
  //     let pageFormat: [number, number] | string;
  //     switch(paperSize) {
  //       case "legal":
  //         pageFormat = [612, 1008]; // 8.5×14 in (in points)
  //         break;
  //       case "letter":
  //         pageFormat = [612, 792]; // 8.5×11 in (in points)
  //         break;
  //       case "a4":
  //       default:
  //         pageFormat = "a4"; // Standard A4
  //     }

  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: pageFormat,
  //     });


  //     //register the fonts
  //     registerFonts(doc);

      
  //     const marginValue = margin === 'narrow' ? 36 : 72;
  //     let yPos = marginValue;
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     // Set initial font based on withSummon
  //     const setCurrentFont = (style: 'normal' | 'bold' = 'normal') => {
  //       if (withSummon) {
  //         doc.setFont("VeraMono", style);
  //       } else {
  //         doc.setFont("times", style);
  //       }
  //     };

  //     setCurrentFont('normal');
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       const imageHeight = 130;
  //       try {
  //         doc.addImage(headerImage, "PNG", marginValue, yPos, pageWidth - marginValue * 2, imageHeight);
  //         yPos += imageHeight + 30;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //       yPos += 10;
  //     }


  //     // Below header content (new section)
  //     if (belowHeaderContent) {

  //       doc.setFontSize(10);
  //       setCurrentFont('normal');
  //       const belowHeaderLines = doc.splitTextToSize(belowHeaderContent, pageWidth - marginValue * 2);
  //       for (let i = 0; i < belowHeaderLines.length; i++) {
  //         if (yPos + lineHeight > pageHeight - marginValue) {
  //           doc.addPage();
  //           yPos = marginValue;
  //         }
  //         doc.text(belowHeaderLines[i], marginValue, yPos);
  //         yPos += lineHeight;
  //       }
  //       yPos += 20; // Add some space after the content
  //     }


  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title);
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     yPos += lineHeight; // Move down for subtitle

  //     // Subtitle
  //     if (subtitle) {
  //       doc.setFont("times", "normal");
  //       doc.setFontSize(9);
  //       const subtitleWidth = doc.getTextWidth(subtitle);
  //       doc.text(subtitle, (pageWidth - subtitleWidth) / 2, yPos);
  //       yPos += 10; // Move down after subtitle
  //     }

  //     setCurrentFont('normal');
  //     doc.setFontSize(10); // body font size
  //     yPos += sectionGap;

  //     // Body
  //     const contentWidth = pageWidth - marginValue * 2;
  //     const splitText = doc.splitTextToSize(body, contentWidth);
  //     // const splitText = doc.splitTextToSize(body, pageWidth - marginValue * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - marginValue) {
  //         doc.addPage();
  //         yPos = marginValue;
  //       }
  //       doc.text(splitText[i], marginValue, yPos);
  //       yPos += lineHeight;
  //     }

  //     yPos += 40;


  //     // Footer elements
  //     doc.setFontSize(10);
  //     const footerY = pageHeight - marginValue - 120;
  //     const signatureX = marginValue;
  //     const sealSize = 80;
  //     const sealX = pageWidth - marginValue - sealSize - 35;
  //     const textBelowSealOffset = 20;

  //     const addFooter = (sealBase64?: string) => {
  //       let currentY = footerY;

  //       if (withSummon) {
  //         // Barangay captain info on the right side
  //         const captainX = pageWidth - marginValue - 170;
  //         setCurrentFont('bold');
  //         doc.text("HON. VIRGINIA N. ABENOJA", captainX, currentY);
  //         setCurrentFont('normal');;
  //         doc.text("Punong Barangay", captainX + 34, currentY + 20);

  //         //adds a space after the Punong Barangay na word
  //         currentY += 70;

  //         // Summon signature fields - new format
  //         setCurrentFont('normal');
          
  //         // Calculate positions
  //         const fieldSpacing = 30;
  //         const lineLength = 200; // Length of each field line
          
  //         // COMPLAINANT and RESPONDENT on same line
  //         doc.text("COMPLAINANT ____________________", signatureX, currentY);
  //         doc.text("RESPONDENT ____________________", signatureX + lineLength + 20, currentY);
          
  //         // SERVER aligned to right below RESPONDENT
  //         doc.text("SERVER ____________________", signatureX + lineLength + 20, currentY + fieldSpacing);
  //       } 
  //       else if (withSignature) {
  //         // Regular signature fields
  //         setCurrentFont('normal');
  //         doc.text("Name and signature of Applicant", signatureX, currentY);
  //         doc.text("Certified true and correct:", signatureX, currentY + 20);
  //         currentY += 60;

  //         // Barangay captain info
  //         setCurrentFont('bold');
  //         doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY + 20);
  //         setCurrentFont('normal');
  //         doc.text("Punong Barangay, San Roque Ciudad", signatureX, currentY + 40);
  //       }

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 40;
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         // Text below seal
  //         doc.setTextColor(255, 0, 0);
  //         setCurrentFont('bold');
  //         doc.setFontSize(10);
          
  //         const textY = sealY + sealSize + textBelowSealOffset;
  //         const text = "NOT VALID WITHOUT SEAL";
  //         const textWidth = doc.getTextWidth(text);
          
  //         const minX = marginValue;
  //         const maxX = pageWidth - marginValue - textWidth;
  //         const centeredX = sealX + (sealSize - textWidth) / 2;
  //         const finalX = Math.max(minX, Math.min(centeredX, maxX));
          
  //         doc.text(text, finalX, textY);

  //         // Reset styles
  //         doc.setTextColor(0, 0, 0);
  //         setCurrentFont('normal');
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="w-full h-full">
  //       {pdfUrl ? (
  //         <iframe
  //           src={`${pdfUrl}#zoom=FitH`}
  //           className="w-full h-full border-0"
  //           title="Document Preview"
  //         />
  //       ) : (
  //         <div className="flex items-center justify-center h-full">
  //           <p>Generating PDF preview...</p>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default TemplatePreview;











  // import { jsPDF } from "jspdf";
  // import { useEffect, useState } from "react";
  // import sealImage from "@/assets/images/Seal.png";
  // import { veraMonoNormal } from "@/assets/fonts/VeraMono-normal";
  // import { veraMonoBold } from "@/assets/fonts/VeraMono-Bold-bold";


  // interface TemplatePreviewProps {
  //   headerImage: string;
  //   barangayLogo: string;
  //   cityLogo: string;
  //   title: string;
  //   body: string;
  //   withSeal: boolean;
  //   withSignature: boolean;
  //   withSummon?: boolean;
  //   paperSize?: string;
  //   margin?: string;
  // }

  // function TemplatePreview({
  //   headerImage,
  //   barangayLogo,
  //   cityLogo,
  //   title,
  //   body,
  //   withSeal,
  //   withSignature,
  //   withSummon = false,
  //   paperSize = "letter",
  //   margin = "normal"
  // }: TemplatePreviewProps) {
  //   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  //   const registerFonts = (doc: jsPDF) => {
  //     doc.addFileToVFS('VeraMono-normal.ttf', veraMonoNormal);
  //     doc.addFont('VeraMono-normal.ttf', 'VeraMono', 'normal');
      
  //     doc.addFileToVFS('VeraMono-Bold-bold.ttf', veraMonoBold);
  //     doc.addFont('VeraMono-Bold-bold.ttf', 'VeraMono', 'bold');
  //   };

  //   useEffect(() => {
  //     generatePDF();
  //   }, [headerImage, title, body, withSeal, withSignature, withSummon, paperSize]);

  //   const generatePDF = () => {
  //     // Convert paper size to jsPDF format
  //     let pageFormat: [number, number] | string;
  //     switch(paperSize) {
  //       case "legal":
  //         pageFormat = [612, 1008]; // 8.5×14 in (in points)
  //         break;
  //       case "letter":
  //         pageFormat = [612, 792]; // 8.5×11 in (in points)
  //         break;
  //       case "a4":
  //       default:
  //         pageFormat = "a4"; // Standard A4
  //     }

  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: pageFormat,
  //     });


  //     //register the fonts
  //     registerFonts(doc);

      
  //     const marginValue = margin === 'narrow' ? 36 : 72;
  //     let yPos = marginValue;
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const lineHeight = 14;
  //     const sectionGap = 20;

  //     // Set initial font based on withSummon
  //     const setCurrentFont = (style: 'normal' | 'bold' = 'normal') => {
  //       if (withSummon) {
  //         doc.setFont("VeraMono", style);
  //       } else {
  //         doc.setFont("times", style);
  //       }
  //     };

  //     setCurrentFont('normal');
  //     doc.setFontSize(12);

  //     // Header image
  //     if (headerImage && headerImage !== "no-image-url-fetched") {
  //       const imageHeight = 130;
  //       try {
  //         doc.addImage(headerImage, "PNG", marginValue, yPos, pageWidth - marginValue * 2, imageHeight);
  //         yPos += imageHeight + 30;
  //       } catch (e) {
  //         console.error("Error adding header image:", e);
  //       }
  //       yPos += 10;
  //     }


  //     // Title
  //     doc.setFont("times", "bold");
  //     doc.setFontSize(16);
  //     const titleWidth = doc.getTextWidth(title); 
  //     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  //     yPos += lineHeight; // Move down for subtitle

  //     setCurrentFont('normal');
  //     doc.setFontSize(10); // body font size
  //     yPos += sectionGap;

  //     // Body
  //     const contentWidth = pageWidth - marginValue * 2;
  //     const splitText = doc.splitTextToSize(body, contentWidth);
  //     // const splitText = doc.splitTextToSize(body, pageWidth - marginValue * 2);
  //     for (let i = 0; i < splitText.length; i++) {
  //       if (yPos + lineHeight > pageHeight - marginValue) {
  //         doc.addPage();
  //         yPos = marginValue;
  //       }
  //       doc.text(splitText[i], marginValue, yPos);
  //       yPos += lineHeight;
  //     }

  //     yPos += 40;


  //     // Footer elements
  //     doc.setFontSize(10);
  //     const footerY = pageHeight - marginValue - 120;
  //     const signatureX = marginValue;
  //     const sealSize = 80;
  //     const sealX = pageWidth - marginValue - sealSize - 35;
  //     const textBelowSealOffset = 20;

  //     const addFooter = (sealBase64?: string) => {
  //       let currentY = footerY;

  //       if (withSummon) {
  //         // Barangay captain info on the right side
  //         const captainX = pageWidth - marginValue - 170;
  //         setCurrentFont('bold');
  //         doc.text("HON. VIRGINIA N. ABENOJA", captainX, currentY);
  //         setCurrentFont('normal');;
  //         doc.text("Punong Barangay", captainX + 34, currentY + 20);

  //         //adds a space after the Punong Barangay na word
  //         currentY += 70;

  //         // Summon signature fields - new format
  //         setCurrentFont('normal');
          
  //         // Calculate positions
  //         const fieldSpacing = 30;
  //         const lineLength = 200; // Length of each field line
          
  //         // COMPLAINANT and RESPONDENT on same line
  //         doc.text("COMPLAINANT ____________________", signatureX, currentY);
  //         doc.text("RESPONDENT ____________________", signatureX + lineLength + 20, currentY);
          
  //         // SERVER aligned to right below RESPONDENT
  //         doc.text("SERVER ____________________", signatureX + lineLength + 20, currentY + fieldSpacing);
  //       } 
  //       else if (withSignature) {
  //         // Regular signature fields
  //         setCurrentFont('normal');
  //         doc.text("Name and signature of Applicant", signatureX, currentY);
  //         doc.text("Certified true and correct:", signatureX, currentY + 20);
  //         currentY += 60;

  //         // Barangay captain info
  //         setCurrentFont('bold');
  //         doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY + 20);
  //         setCurrentFont('normal');
  //         doc.text("Punong Barangay, San Roque Ciudad", signatureX, currentY + 40);
  //       }

  //       if (withSeal && sealBase64) {
  //         const sealY = footerY - 40;
  //         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

  //         // Text below seal
  //         doc.setTextColor(255, 0, 0);
  //         setCurrentFont('bold');
  //         doc.setFontSize(10);
          
  //         const textY = sealY + sealSize + textBelowSealOffset;
  //         const text = "NOT VALID WITHOUT SEAL";
  //         const textWidth = doc.getTextWidth(text);
          
  //         const minX = marginValue;
  //         const maxX = pageWidth - marginValue - textWidth;
  //         const centeredX = sealX + (sealSize - textWidth) / 2;
  //         const finalX = Math.max(minX, Math.min(centeredX, maxX));
          
  //         doc.text(text, finalX, textY);

  //         // Reset styles
  //         doc.setTextColor(0, 0, 0);
  //         setCurrentFont('normal');
  //         doc.setFontSize(12);
  //       }

  //       const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
  //       setPdfUrl(url);
  //     };

  //     if (withSeal) {
  //       const img = new Image();
  //       img.src = sealImage;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(img, 0, 0);
  //           const sealBase64 = canvas.toDataURL("image/png");
  //           addFooter(sealBase64);
  //         }
  //       };
  //     } else {
  //       addFooter();
  //     }
  //   };

  //   return (
  //     <div className="w-full h-full">
  //       {pdfUrl ? (
  //         <iframe
  //           src={`${pdfUrl}#zoom=FitH`}
  //           className="w-full h-full border-0"
  //           title="Document Preview"
  //         />
  //       ) : (
  //         <div className="flex items-center justify-center h-full">
  //           <p>Generating PDF preview...</p>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default TemplatePreview;
















import { jsPDF } from "jspdf";
import { useEffect, useState } from "react";
import sealImage from "@/assets/images/Seal.png";
import { veraMonoNormal } from "@/assets/fonts/VeraMono-normal";
import { veraMonoBold } from "@/assets/fonts/VeraMono-Bold-bold";

interface TemplatePreviewProps {
  logoStyle: number;
  barangayLogo: string;
  cityLogo: string;
  email?: string;
  telNum: string;
  belowHeaderContent?: string;
  title: string;
  body: string;
  withSeal: boolean;
  withSignRight: boolean;
  withSignLeft: boolean;
  withSignatureApplicant: boolean;
  withSummon?: boolean;
  paperSize?: string;
  margin?: string;
}

function TemplatePreview({
  logoStyle,
  barangayLogo,
  cityLogo,
  email,
  telNum,
  belowHeaderContent,
  title,
  body,
  withSeal,
  withSignRight,
  withSignLeft,
  withSignatureApplicant,
  withSummon = false,
  paperSize = "letter",
  margin = "normal"
}: TemplatePreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const registerFonts = (doc: jsPDF) => {
    doc.addFileToVFS('VeraMono-normal.ttf', veraMonoNormal);
    doc.addFont('VeraMono-normal.ttf', 'VeraMono', 'normal');
    doc.addFileToVFS('VeraMono-Bold-bold.ttf', veraMonoBold);
    doc.addFont('VeraMono-Bold-bold.ttf', 'VeraMono', 'bold');
  };

  useEffect(() => {
    generatePDF();
  }, [logoStyle, barangayLogo, cityLogo, email, telNum, belowHeaderContent, title, body, withSeal, withSignRight, withSignLeft, withSignatureApplicant, withSummon, paperSize, margin]);

  const generatePDF = () => {
    // Convert paper size to jsPDF format
    let pageFormat: [number, number] | string;
    switch(paperSize) {
      case "legal":
        pageFormat = [612, 1008];
        break;
      case "letter":
      default:
        pageFormat = [612, 792];
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: pageFormat,
    });

    registerFonts(doc);

    const marginValue = margin === 'narrow' ? 36 : 72;
    let yPos = marginValue;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const lineHeight = 14;
    const sectionGap = 20;

    // Set initial font
    const setCurrentFont = (style: 'normal' | 'bold' = 'normal') => {
      if (withSummon) {
        doc.setFont("VeraMono", style);
      } else {
        doc.setFont("times", style);
      }
    };

    setCurrentFont('normal');
    doc.setFontSize(12);


    if (logoStyle === 1) {
      // Logo dimensions
      const logoWidth = 90;
      const logoHeight = 90;

      // Style 1: Original layout with logos on sides
      const leftLogoX = marginValue;
      const rightLogoX = pageWidth - marginValue - logoWidth;

      if (barangayLogo && barangayLogo !== "no-image-url-fetched") {
        try {
          doc.addImage(barangayLogo, "PNG", leftLogoX, yPos, logoWidth, logoHeight);
        } catch (e) {
          console.error("Error adding barangay logo:", e);
        }
      }

      if (cityLogo && cityLogo !== "no-image-url-fetched") {
        try {
          doc.addImage(cityLogo, "PNG", rightLogoX, yPos, logoWidth, logoHeight);
        } catch (e) {
          console.error("Error adding city logo:", e);
        }
      }

      // Header text configuration
      const headerText = [
        { text: "REPUBLIC OF THE PHILIPPINES", bold: false, size: 12 },
        { text: "City of Cebu", bold: false, size: 11 },
        { text: "", bold: false, size: 10 },
        { text: "BARANGAY SAN ROQUE (CIUDAD)", bold: true, size: 14 },
        { text: "OFFICE OF THE BARANGAY CAPTAIN", bold: false, size: 11 },
        { text: "Arellano Blvd, Cebu City", bold: false, size: 11 },
        { text: `Tel No. ${telNum}`, bold: false, size: 11 }
      ];

      const centerX = pageWidth / 2;
      let headerY = yPos + 15;

      headerText.forEach((line) => {
        if (line.text === "") {
          headerY += 10;
          return;
        }
        
        setCurrentFont(line.bold ? 'bold' : 'normal');
        doc.setFontSize(line.size);
        
        const textWidth = doc.getTextWidth(line.text);
        doc.text(line.text, centerX - (textWidth / 2), headerY);
        headerY += lineHeight;
        
        if (line.bold) {
          headerY += 5;
        }
      });

      yPos = headerY + 40;
    } else if (logoStyle === 2) {

      // Style 2: Single centered logo with details below

      // Logo dimensions
      const logoWidth = 100;
      const logoHeight = 100;

      if (barangayLogo && barangayLogo !== "no-image-url-fetched") {
        try {
          // Center the barangay logo
          const logoX = (pageWidth - logoWidth) / 2;
          doc.addImage(barangayLogo, "PNG", logoX, yPos, logoWidth, logoHeight);
          yPos += logoHeight + 20; // Space after logo
        } catch (e) {
          console.error("Error adding barangay logo:", e);
        }
      }

      // Header text configuration for style 2
      const headerText = [
        { text: "REPUBLIC OF THE PHILIPPINES", bold: false, size: 12 },
        { text: "City of Cebu | San Roque Ciudad", bold: false, size: 11 },
        { text: "", bold: false, size: 10 },
        { text: "Office of the Barangay Captain", bold: false, size: 11 },
        { text: "Arellano Boulevard, Cebu City, Cebu, 6000", bold: false, size: 11 },
        { text: `${email}`, bold: false, size: 11 },
        { text: `(032) ${telNum}`, bold: false, size: 11 }
      ];

      const centerX = pageWidth / 2;
      let headerY = yPos;

      headerText.forEach((line) => {
        if (line.text === "") {
          headerY += 10;
          return;
        }
        
        setCurrentFont(line.bold ? 'bold' : 'normal');
        doc.setFontSize(line.size);
        
        const textWidth = doc.getTextWidth(line.text);
        doc.text(line.text, centerX - (textWidth / 2), headerY);
        headerY += lineHeight;
      });

      yPos = headerY + 40;
    }


    //Below Header Content
    if (belowHeaderContent) {

      doc.setFontSize(12);
      setCurrentFont('normal');
      const belowHeaderLines = doc.splitTextToSize(belowHeaderContent, pageWidth - marginValue * 2);
      for (let i = 0; i < belowHeaderLines.length; i++) {
        if (yPos + lineHeight > pageHeight - marginValue) {
          doc.addPage();
          yPos = marginValue;
        }
        doc.text(belowHeaderLines[i], marginValue, yPos);
        yPos += lineHeight;
      }
      yPos += 30; // Add some space after the content
    }    

    // Title
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    const titleWidth = doc.getTextWidth(title); 
    doc.text(title, (pageWidth - titleWidth) / 2, yPos);
    yPos += lineHeight + sectionGap + 20;

    // Body content
    setCurrentFont('normal');
    doc.setFontSize(12);
    
    const contentWidth = pageWidth - marginValue * 2;
    const splitText = doc.splitTextToSize(body, contentWidth);
    const lineSpacing = 18; // Increased from 14 to 18 for better readability
    
    for (let i = 0; i < splitText.length; i++) {
      if (yPos + lineSpacing > pageHeight - marginValue - 120) {
        doc.addPage();
        yPos = marginValue;
      }
      
      // Process each line for bold markup
      let currentX = marginValue;
      const parts = splitText[i].split(/(\/\*.*?\*\/)/g);
      
      parts.forEach((part: string) => {
        if (part.startsWith('/*') && part.endsWith('*/')) {
          // Bold text
          const boldText = part.slice(2, -2);
          setCurrentFont('bold');
          doc.text(boldText, currentX, yPos);
          currentX += doc.getTextWidth(boldText);
        } else if (part) {
          // Normal text
          setCurrentFont('normal');
          doc.text(part, currentX, yPos);
          currentX += doc.getTextWidth(part);
        }
      });
      
      yPos += lineSpacing; // Using the increased line spacing
    }

    yPos += 40;

    // Footer elements
    doc.setFontSize(10);
    const footerY = pageHeight - marginValue - 120;
    const signatureX = marginValue;
    const sealSize = 80;
    const sealX = pageWidth - marginValue - sealSize - 35;
    const textBelowSealOffset = 20;

    const addFooter = (sealBase64?: string) => {
      let currentY = footerY;

      if(withSignRight){
        const captainX = pageWidth - marginValue - 200; 

        setCurrentFont('bold');
        doc.setFontSize(12);
        doc.text("HON. VIRGINIA N. ABENOJA", captainX, currentY);

        setCurrentFont('normal');
        doc.setFontSize(10);
        const titleOffset = 6;
        doc.text(
          "Punong Barangay, San Roque Ciudad", 
          captainX + titleOffset,
          currentY + 20
        );
      }

      if(withSignLeft){
        setCurrentFont('bold');
        doc.setFontSize(12);
        doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY);

        setCurrentFont('normal');
        doc.setFontSize(10);
        doc.text("Punong Barangay, San Roque Ciudad", signatureX, currentY + 20);        
      }

 
      if (withSignatureApplicant) {
        setCurrentFont('normal');
        doc.text("Name and signature of Applicant", signatureX, currentY);
        doc.text("Certified true and correct:", signatureX, currentY + 20);
        currentY += 60;

        setCurrentFont('bold');
        doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY);
        setCurrentFont('normal');
        doc.text("Punong Barangay, San Roque Ciudad", signatureX, currentY + 20);
      }

      if (withSeal && sealBase64) {
        const sealY = footerY - 40;
        doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

        doc.setTextColor(255, 0, 0);
        setCurrentFont('bold');
        doc.setFontSize(10);
        
        const text = "NOT VALID WITHOUT SEAL";
        const textWidth = doc.getTextWidth(text);
        const finalX = sealX + (sealSize - textWidth) / 2;
        
        doc.text(text, finalX, sealY + sealSize + textBelowSealOffset);
        doc.setTextColor(0, 0, 0);
      }

      const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
      setPdfUrl(url);
    };

    if (withSeal) {
      const img = new Image();
      img.src = sealImage;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const sealBase64 = canvas.toDataURL("image/png");
          addFooter(sealBase64);
        }
      };
    } else {
      addFooter();
    }
  };

  return (
    <div className="w-full h-full">
      {pdfUrl ? (
        <iframe
          src={`${pdfUrl}#zoom=FitH`}
          className="w-full h-full border-0"
          title="Document Preview"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p>Generating PDF preview...</p>
        </div>
      )}
    </div>
  );
}

export default TemplatePreview;