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









// BEFORE GROK (WORKING)
import { jsPDF } from "jspdf";
import { useEffect, useState } from "react";
import sealImage from "@/assets/images/Seal.png";

interface TemplatePreviewProps {
  headerImage: string;
  title: string;
  body: string;
  withSeal: boolean;
  withSignature: boolean;
  onClose: () => void;
}

function TemplatePreview({
  headerImage,
  title,
  body,
  withSeal,
  withSignature,
  onClose,
}: TemplatePreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    generatePDF();
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const margin = 72;
    let yPos = margin;
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const lineHeight = 14;
    const sectionGap = 20;

    doc.setFont("times", "normal");
    doc.setFontSize(12);

    // Header image
    if (headerImage && headerImage !== "no-image-url-fetched") {
      try {
        doc.addImage(headerImage, "PNG", margin, yPos, pageWidth - margin * 2, 60);
        yPos += 80;
      } catch (e) {
        console.error("Error adding header image:", e);
      }
    }

    // Title
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, yPos);
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    yPos += sectionGap + lineHeight;

    // Body
    const splitText = doc.splitTextToSize(body, pageWidth - margin * 2);
    for (let i = 0; i < splitText.length; i++) {
      if (yPos + lineHeight > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(splitText[i], margin, yPos);
      yPos += lineHeight;
    }

    // Footer elements
    const footerY = pageHeight - margin - 80;
    const signatureX = margin;
    const sealSize = 80;
    const sealX = pageWidth - margin - sealSize;

    const addFooter = (sealBase64?: string) => {
      if (withSignature) {
        doc.setFont("times", "normal");
        doc.text("Name and signature of Applicant", signatureX, footerY);
        doc.text("Certified true and correct:", signatureX, footerY + 20);
      }

      if (withSeal && sealBase64) {
        const sealY = footerY - 20;
        doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

        doc.setTextColor(255, 0, 0);
        doc.setFont("times", "bold");
        doc.setFontSize(10);
        doc.text("NOT VALID WITHOUT SEAL", sealX + sealSize / 2, sealY + sealSize + 10, {
          align: "center",
        });

        doc.setTextColor(0, 0, 0);
        doc.setFont("times", "normal");
        doc.setFontSize(12);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[90vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Document Preview</h2>
          <button
            onClick={onClose}
            className="text-sm text-red-600 hover:underline"
          >
            Close
          </button>
        </div>

        {/* PDF Preview */}
        <div className="flex-1 min-h-0">
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

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={() => {
              if (pdfUrl) {
                const a = document.createElement("a");
                a.href = pdfUrl;
                a.download = `${title.replace(/[^a-z0-9]/gi, "_")}_document.pdf`;
                a.click();
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplatePreview;



