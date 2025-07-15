// import { jsPDF } from "jspdf";
// import { useEffect, useState } from "react";
// import sealImage from "@/assets/images/Seal.png";
// import { veraMonoNormal } from "@/assets/fonts/VeraMono-normal";
// import { veraMonoBold } from "@/assets/fonts/VeraMono-Bold-bold";
// import { useGetSummonTemplate } from "./queries/summonFetchQueries";


// interface SummonPreviewProps {    
//     reason: string;
//     hearingDate: string;
//     hearingTime: string;
//     sr_id: string;
// }

// function SummonPreview() {
//   const {data: template, isLoading} = useGetSummonTemplate();
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

// export default SummonPreview;