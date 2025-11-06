// import { jsPDF } from "jspdf";
// import { useEffect, useState } from "react";
// import sealImage from "@/assets/images/Seal.png";
// import { veraMonoNormal } from "@/assets/fonts/VeraMono-normal";
// import { veraMonoBold } from "@/assets/fonts/VeraMono-Bold-bold";
// import { formatDateForSummon, formatTimestampToDate } from "@/helpers/summonTimestampFormatter";
// import { formatSummonDateTime } from "@/helpers/summonDateTimeFormatter";

// interface LuponPreview {
//   sr_code: string;
//   incident_type?: string;
//   complainant: string[];
//   complainant_address: string[];
//   accused: string[];
//   accused_address: string[];
//   hearingDate: string;
//   hearingTime: string;
//   mediation: string;
//   issuance_date: string;
//   barangayLogo: string;
//   cityLogo: string;
//   email: string;
//   telnum: string;
//   withSeal?: boolean;
// }

// function LuponPreview({
//   sr_code,
//   complainant,
//   complainant_address,
//   accused,
//   accused_address,
//   hearingDate,
//   hearingTime,
//   mediation,
//   issuance_date,
//   barangayLogo,
//   cityLogo,
//   email,
//   telnum,
//   withSeal = false,
// }: LuponPreview) {
//   const [pdfUrl, setPdfUrl] = useState<string | null>(null);
//   const [imagesLoaded, setImagesLoaded] = useState(false);
//   const [barangayLogoData, setBarangayLogoData] = useState<string | null>(null);
//   const [cityLogoData, setCityLogoData] = useState<string | null>(null);
//   const [sealData, setSealData] = useState<string | null>(null);

//   const registerFonts = (doc: jsPDF) => {
//     doc.addFileToVFS('VeraMono-normal.ttf', veraMonoNormal);
//     doc.addFont('VeraMono-normal.ttf', 'VeraMono', 'normal');
//     doc.addFileToVFS('VeraMono-Bold-bold.ttf', veraMonoBold);
//     doc.addFont('VeraMono-Bold-bold.ttf', 'VeraMono', 'bold');
//   };

//   const newIssuanceDate = issuance_date ? formatTimestampToDate(issuance_date) : formatDateForSummon(new Date());

//   useEffect(() => {
//     const preloadImages = async () => {
//       try {
//         // Preload barangay logo
//         if (barangayLogo && barangayLogo !== "no-image-url-fetched") {
//           const img = new Image();
//           img.crossOrigin = "anonymous";
//           img.src = barangayLogo;
//           await img.decode();
//           setBarangayLogoData(barangayLogo);
//         }

//         // Preload city logo
//         if (cityLogo && cityLogo !== "no-image-url-fetched") {
//           const img = new Image();
//           img.crossOrigin = "anonymous";
//           img.src = cityLogo;
//           await img.decode();
//           setCityLogoData(cityLogo);
//         }

//         // Preload seal image
//         const sealImg = new Image();
//         sealImg.src = sealImage;
//         await sealImg.decode();
//         setSealData(sealImage);

//         setImagesLoaded(true);
//       } catch (error) {
//         console.error("Error preloading images:", error);
//         setImagesLoaded(true); // Continue even if images fail to load
//       }
//     };

//     preloadImages();
//   }, [barangayLogo, cityLogo]);

//   useEffect(() => {
//     if (imagesLoaded) {
//       generatePDF();
//     }
//   }, [imagesLoaded, barangayLogoData, cityLogoData, sealData, 
//       sr_code, complainant, complainant_address, accused, accused_address,
//       hearingDate, hearingTime, mediation, issuance_date, withSeal]);

//   const generatePDF = () => {
//     const pageFormat: [number, number] = [612, 792]; // Letter size
//     const marginValue = 72;
//     const lineHeight = 14;
//     const sectionGap = 20;

//     const doc = new jsPDF({
//       orientation: "portrait",
//       unit: "pt",
//       format: pageFormat,
//     });

//     registerFonts(doc);

//     let yPos = marginValue;
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();

//     // Set font function
//     const setFont = (style: 'normal' | 'bold' = 'normal') => {
//       doc.setFont("times", style);
//     };

//     setFont('normal');
//     doc.setFontSize(12);

//     // WATERMARK
//     if (barangayLogoData && barangayLogoData !== "no-image-url-fetched") {
//       try {
//         if (doc.setGState) {
//           // @ts-ignore
//           const gState = doc.GState({ opacity: 0.15 });
//           // @ts-ignore
//           doc.setGState(gState);
//         }

//         // Place background image in center
//         const bgWidth = 400;   
//         const bgHeight = 400;  
//         const bgX = (pageWidth - bgWidth) / 2;
//         const bgY = (pageHeight - bgHeight) / 2;

//         doc.addImage(barangayLogoData, "PNG", bgX, bgY, bgWidth, bgHeight);

//         // Reset opacity back to normal
//         if (doc.setGState) {
//           // @ts-ignore
//           const gStateReset = doc.GState({ opacity: 1 });
//           // @ts-ignore
//           doc.setGState(gStateReset);
//         }
//       } catch (e) {
//         console.error("Error adding faded background logo:", e);
//       }
//     }

//     // Logo dimensions
//     const logoWidth = 90;
//     const logoHeight = 90;

//     // Style 1: Original layout with logos on sides
//     const leftLogoX = marginValue;
//     const rightLogoX = pageWidth - marginValue - logoWidth;

//     if (barangayLogoData && barangayLogoData !== "no-image-url-fetched") {
//       try {
//         doc.addImage(barangayLogoData, "PNG", leftLogoX, yPos, logoWidth, logoHeight);
//       } catch (e) {
//         console.error("Error adding barangay logo:", e);
//       }
//     }

//     if (cityLogoData && cityLogoData !== "no-image-url-fetched") {
//       try {
//         doc.addImage(cityLogoData, "PNG", rightLogoX, yPos, logoWidth, logoHeight);
//       } catch (e) {
//         console.error("Error adding city logo:", e);
//       }
//     }

//     // Header text configuration
//     const headerText = [
//       { text: "Republic of the Philippines", bold: true, size: 12 },
//       { text: "City of Cebu | San Roque Ciudad", bold: false, size: 11 },
//       { text: "____________________________________", bold: true, size: 14 },
//       { text: "Office of the Lupong Tagapamayapa", bold: false, size: 13 },
//       { text: "Arellano Boulevard, Cebu City, Cebu, 6000", bold: false, size: 11 },
//       { text: `${email} | ${telnum}`, bold: false, size: 11 }
//     ];

//     const centerX = pageWidth / 2;
//     let headerY = yPos + 15;

//     headerText.forEach((line) => {
//       if (line.text === "") {
//         headerY += 10;
//         return;
//       }
      
//       doc.setFont("times", line.bold ? 'bold' : 'normal');
//       doc.setFontSize(line.size);
      
//       const textWidth = doc.getTextWidth(line.text);
//       doc.text(line.text, centerX - (textWidth / 2), headerY);
//       headerY += lineHeight;
      
//       if (line.bold) {
//         headerY += 5;
//       }
//     });

//     yPos = headerY + 40;

//     // Summon content
//     setFont("bold");
//     doc.setFontSize(10);
//     doc.text(`BARANGAY CASE NO.: ${sr_code}`, pageWidth - marginValue, yPos, {
//       align: "right",
//     });
//     yPos += lineHeight * 2;

//     // Complainant section
//     complainant.forEach((name, i) => {
//       setFont("bold");
//       doc.text("NAME:", marginValue, yPos);
//       doc.text(name, marginValue + 40, yPos);
//       yPos += lineHeight;
//       if (complainant_address[i]) {
//         setFont("normal");
//         doc.text("ADDRESS:", marginValue, yPos);
//         doc.text(complainant_address[i], marginValue + 50, yPos);
//         yPos += lineHeight;
//       }
//     });
//     doc.text("COMPLAINANT/S", marginValue, yPos);
//     yPos += lineHeight * 1.5;

//     setFont("bold");
//     doc.text("-AGAINST-", marginValue, yPos);
//     yPos += lineHeight * 1.5;

//     // Accused section
//     accused.forEach((name, i) => {
//       setFont("bold");
//       doc.text("NAME:", marginValue, yPos);
//       doc.text(name, marginValue + 40, yPos);
//       yPos += lineHeight;
//       if (accused_address[i]) {
//         setFont("normal");
//         doc.text("ADDRESS:", marginValue, yPos);
//         doc.text(accused_address[i], marginValue + 50, yPos);
//         yPos += lineHeight;
//       }
//     });
//     doc.text("RESPONDENT/S", marginValue, yPos);
//     yPos += lineHeight * 2;

//     // Title
//     doc.setFont("times", "bold");
//     doc.setFontSize(16);
//     const title = "NOTICE OF HEARING";
//     doc.text(title, pageWidth / 2, yPos, { align: "center" });
//     yPos += lineHeight;

//     // Mediation text
//     doc.setFont("times", "normal");
//     doc.setFontSize(9);
//     doc.text(mediation, pageWidth / 2, yPos, { align: "center" });
//     yPos += lineHeight * 2;

//     // Body content
//     setFont("normal");
//     doc.setFontSize(10);
//     const formattedDateTime = formatSummonDateTime(hearingDate, hearingTime);
//     const body1 = `         You are hereby informed to appear before me in person, on the ${formattedDateTime} then and there to answer the complaint made before me, before conciliation your dispute with complaint.`;
//     doc.splitTextToSize(body1, pageWidth - marginValue * 2).forEach((line: string) => {
//       doc.text(line, marginValue, yPos);
//       yPos += lineHeight;
//     });
//     yPos += sectionGap;

//     const body2 = "         You are hereby warned that if you refuse or willfully fail to appear in obedience to this Summon. You may be barred from filing any counter claim arising from said complaint. Fail not or else face punishment for contempt of court.";
//     doc.splitTextToSize(body2, pageWidth - marginValue * 2).forEach((line: string) => {
//       doc.text(line, marginValue, yPos);
//       yPos += lineHeight;
//     });
//     yPos += sectionGap;

//     // Issuance date
//     doc.text(`               Issued this ${newIssuanceDate}, in the City of Cebu, Philippines.`, marginValue, yPos);
//     yPos += lineHeight * 3;

//     // Signature section
//     setFont("bold");
//     doc.text("FLORANTE T. NAVARRO III/ ANGELITA C. SIPE", pageWidth - marginValue, yPos, {
//       align: "right",
//     });
//     setFont("normal");
//     doc.text("Pangkat Chairman/ Lupon Secretary", pageWidth - marginValue, yPos + lineHeight, {
//       align: "right",
//     });
//     yPos += lineHeight * 4;

//     // Signatures section
//     setFont("normal");
//     doc.text("COMPLAINANT ____________________", marginValue, yPos);
//     doc.text("RESPONDENT ____________________", marginValue + 250, yPos);
//     doc.text("SERVER ____________________", marginValue + 250, yPos + lineHeight * 2);

//     // Seal
//     if (withSeal && sealData) {
//       const sealSize = 80;
//       const sealX = pageWidth - marginValue - sealSize;
//       const sealY = doc.internal.pageSize.getHeight() - marginValue - sealSize - 50;
//       doc.addImage(sealData, "PNG", sealX, sealY, sealSize, sealSize);
//       doc.setTextColor(255, 0, 0);
//       doc.setFont("times", "bold");
//       doc.setFontSize(10);
//       const txt = "NOT VALID WITHOUT SEAL";
//       const tWidth = doc.getTextWidth(txt);
//       doc.text(txt, sealX + (sealSize - tWidth) / 2, sealY + sealSize + 15);
//       doc.setTextColor(0, 0, 0);
//     }

//     const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
//     setPdfUrl(url);
//   };

//   return (
//     <div className="w-full h-full">
//       {pdfUrl ? (
//         <iframe
//           src={`${pdfUrl}#zoom=FitH`}
//           className="flex-1 w-full h-full border rounded-lg"
//           style={{ minHeight: "78vh" }}
//           title="Summon Document Preview"
//         />
//       ) : (
//         <div className="flex items-center justify-center h-full">
//           <p>Generating Summon PDF preview...</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default LuponPreview;

import { jsPDF } from "jspdf";
import { useEffect, useState } from "react";
import sealImage from "@/assets/images/Seal.png";
import { veraMonoNormal } from "@/assets/fonts/VeraMono-normal";
import { veraMonoBold } from "@/assets/fonts/VeraMono-Bold-bold";
import { formatDateForSummon, formatTimestampToDate } from "@/helpers/summonTimestampFormatter";
import { formatSummonDateTime } from "@/helpers/summonDateTimeFormatter";

interface LuponPreview {
  sr_code: string;
  incident_type?: string;
  complainant: string[];
  complainant_address: string[];
  accused: string[];
  accused_address: string[];
  hearingDate: string;
  hearingTime: string;
  mediation: string;
  issuance_date: string;
  barangayLogo: string;
  cityLogo: string;
  email: string;
  telnum: string;
  withSeal?: boolean;
}

function LuponPreview({
  sr_code,
  complainant,
  complainant_address,
  accused,
  accused_address,
  hearingDate,
  hearingTime,
  mediation,
  issuance_date,
  barangayLogo,
  cityLogo,
  email,
  telnum,
  withSeal = false,
}: LuponPreview) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [barangayLogoData, setBarangayLogoData] = useState<string | null>(null);
  const [cityLogoData, setCityLogoData] = useState<string | null>(null);
  const [sealData, setSealData] = useState<string | null>(null);

  const registerFonts = (doc: jsPDF) => {
    doc.addFileToVFS('VeraMono-normal.ttf', veraMonoNormal);
    doc.addFont('VeraMono-normal.ttf', 'VeraMono', 'normal');
    doc.addFileToVFS('VeraMono-Bold-bold.ttf', veraMonoBold);
    doc.addFont('VeraMono-Bold-bold.ttf', 'VeraMono', 'bold');
  };

  const newIssuanceDate = issuance_date ? formatTimestampToDate(issuance_date) : formatDateForSummon(new Date());

  useEffect(() => {
    const preloadImages = async () => {
      try {
        // Preload barangay logo
        if (barangayLogo && barangayLogo !== "no-image-url-fetched") {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = barangayLogo;
          await img.decode();
          setBarangayLogoData(barangayLogo);
        }

        // Preload city logo
        if (cityLogo && cityLogo !== "no-image-url-fetched") {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = cityLogo;
          await img.decode();
          setCityLogoData(cityLogo);
        }

        // Preload seal image
        const sealImg = new Image();
        sealImg.src = sealImage;
        await sealImg.decode();
        setSealData(sealImage);

        setImagesLoaded(true);
      } catch (error) {
        console.error("Error preloading images:", error);
        setImagesLoaded(true); // Continue even if images fail to load
      }
    };

    preloadImages();
  }, [barangayLogo, cityLogo]);

  useEffect(() => {
    if (imagesLoaded) {
      generatePDF();
    }
  }, [imagesLoaded, barangayLogoData, cityLogoData, sealData, 
      sr_code, complainant, complainant_address, accused, accused_address,
      hearingDate, hearingTime, mediation, issuance_date, withSeal]);

  const addNewPageIfNeeded = (doc: jsPDF, currentY: number, requiredSpace: number = 100): number => {
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginValue = 72;
    
    if (currentY + requiredSpace > pageHeight - marginValue) {
      doc.addPage();
      return marginValue;
    }
    return currentY;
  };

  const generatePDF = () => {
    const pageFormat: [number, number] = [612, 792]; // Letter size
    const marginValue = 72;
    const lineHeight = 14;
    const sectionGap = 20;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: pageFormat,
    });

    registerFonts(doc);

    let yPos = marginValue;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Set font function
    const setFont = (style: 'normal' | 'bold' = 'normal') => {
      doc.setFont("times", style);
    };

    setFont('normal');
    doc.setFontSize(12);

    // Function to add header to each page
    const addHeader = (currentY: number) => {
      let headerY = currentY;

      // WATERMARK
      if (barangayLogoData && barangayLogoData !== "no-image-url-fetched") {
        try {
          if (doc.setGState) {
            // @ts-ignore
            const gState = doc.GState({ opacity: 0.15 });
            // @ts-ignore
            doc.setGState(gState);
          }

          // Place background image in center
          const bgWidth = 400;   
          const bgHeight = 400;  
          const bgX = (pageWidth - bgWidth) / 2;
          const bgY = (pageHeight - bgHeight) / 2;

          doc.addImage(barangayLogoData, "PNG", bgX, bgY, bgWidth, bgHeight);

          // Reset opacity back to normal
          if (doc.setGState) {
            // @ts-ignore
            const gStateReset = doc.GState({ opacity: 1 });
            // @ts-ignore
            doc.setGState(gStateReset);
          }
        } catch (e) {
          console.error("Error adding faded background logo:", e);
        }
      }

      // Logo dimensions
      const logoWidth = 90;
      const logoHeight = 90;

      // Style 1: Original layout with logos on sides
      const leftLogoX = marginValue;
      const rightLogoX = pageWidth - marginValue - logoWidth;

      if (barangayLogoData && barangayLogoData !== "no-image-url-fetched") {
        try {
          doc.addImage(barangayLogoData, "PNG", leftLogoX, headerY, logoWidth, logoHeight);
        } catch (e) {
          console.error("Error adding barangay logo:", e);
        }
      }

      if (cityLogoData && cityLogoData !== "no-image-url-fetched") {
        try {
          doc.addImage(cityLogoData, "PNG", rightLogoX, headerY, logoWidth, logoHeight);
        } catch (e) {
          console.error("Error adding city logo:", e);
        }
      }

      // Header text configuration
      const headerText = [
        { text: "Republic of the Philippines", bold: true, size: 12 },
        { text: "City of Cebu | San Roque Ciudad", bold: false, size: 11 },
        { text: "____________________________________", bold: true, size: 14 },
        { text: "Office of the Lupong Tagapamayapa", bold: false, size: 13 },
        { text: "Arellano Boulevard, Cebu City, Cebu, 6000", bold: false, size: 11 },
        { text: `${email} | ${telnum}`, bold: false, size: 11 }
      ];

      const centerX = pageWidth / 2;
      let textY = headerY + 15;

      headerText.forEach((line) => {
        if (line.text === "") {
          textY += 10;
          return;
        }
        
        doc.setFont("times", line.bold ? 'bold' : 'normal');
        doc.setFontSize(line.size);
        
        const textWidth = doc.getTextWidth(line.text);
        doc.text(line.text, centerX - (textWidth / 2), textY);
        textY += lineHeight;
        
        if (line.bold) {
          textY += 5;
        }
      });

      return textY + 40; // Return new Y position after header
    };

    // Add header to first page
    yPos = addHeader(yPos);

    // Summon content
    setFont("bold");
    doc.setFontSize(10);
    doc.text(`BARANGAY CASE NO.: ${sr_code}`, pageWidth - marginValue, yPos, {
      align: "right",
    });
    yPos += lineHeight * 2;

    // Complainant section
    yPos = addNewPageIfNeeded(doc, yPos, complainant.length * lineHeight * 2 + 50);
    complainant.forEach((name, i) => {
      // Check if we need a new page before adding each complainant
      yPos = addNewPageIfNeeded(doc, yPos, lineHeight * 3);
      
      setFont("bold");
      doc.text("NAME:", marginValue, yPos);
      doc.text(name, marginValue + 40, yPos);
      yPos += lineHeight;
      if (complainant_address[i]) {
        setFont("normal");
        doc.text("ADDRESS:", marginValue, yPos);
        doc.text(complainant_address[i], marginValue + 50, yPos);
        yPos += lineHeight;
      }
      yPos += 2; // Small gap between complainants
    });
    
    yPos = addNewPageIfNeeded(doc, yPos, lineHeight * 2);
    doc.text("COMPLAINANT/S", marginValue, yPos);
    yPos += lineHeight * 1.5;

    setFont("bold");
    doc.text("-AGAINST-", marginValue, yPos);
    yPos += lineHeight * 1.5;

    // Accused section
    yPos = addNewPageIfNeeded(doc, yPos, accused.length * lineHeight * 2 + 50);
    accused.forEach((name, i) => {
      // Check if we need a new page before adding each accused
      yPos = addNewPageIfNeeded(doc, yPos, lineHeight * 3);
      
      setFont("bold");
      doc.text("NAME:", marginValue, yPos);
      doc.text(name, marginValue + 40, yPos);
      yPos += lineHeight;
      if (accused_address[i]) {
        setFont("normal");
        doc.text("ADDRESS:", marginValue, yPos);
        doc.text(accused_address[i], marginValue + 50, yPos);
        yPos += lineHeight;
      }
      yPos += 2; // Small gap between accused
    });
    
    yPos = addNewPageIfNeeded(doc, yPos, lineHeight * 2);
    doc.text("RESPONDENT/S", marginValue, yPos);
    yPos += lineHeight * 2;

    // Title
    yPos = addNewPageIfNeeded(doc, yPos, 100);
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    const title = "NOTICE OF HEARING";
    doc.text(title, pageWidth / 2, yPos, { align: "center" });
    yPos += lineHeight;

    // Mediation text
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    const mediationLines = doc.splitTextToSize(mediation, pageWidth - marginValue * 2);
    yPos = addNewPageIfNeeded(doc, yPos, mediationLines.length * lineHeight);
    mediationLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, yPos, { align: "center" });
      yPos += lineHeight;
    });
    yPos += lineHeight * 2;

    // Body content - First paragraph
    setFont("normal");
    doc.setFontSize(10);
    const formattedDateTime = formatSummonDateTime(hearingDate, hearingTime);
    const body1 = `         You are hereby informed to appear before me in person, on the ${formattedDateTime} then and there to answer the complaint made before me, before conciliation your dispute with complaint.`;
    
    const body1Lines = doc.splitTextToSize(body1, pageWidth - marginValue * 2);
    yPos = addNewPageIfNeeded(doc, yPos, body1Lines.length * lineHeight);
    body1Lines.forEach((line: string) => {
      yPos = addNewPageIfNeeded(doc, yPos, lineHeight);
      doc.text(line, marginValue, yPos);
      yPos += lineHeight;
    });
    yPos += sectionGap;

    // Body content - Second paragraph
    const body2 = "         You are hereby warned that if you refuse or willfully fail to appear in obedience to this Summon. You may be barred from filing any counter claim arising from said complaint. Fail not or else face punishment for contempt of court.";
    
    const body2Lines = doc.splitTextToSize(body2, pageWidth - marginValue * 2);
    yPos = addNewPageIfNeeded(doc, yPos, body2Lines.length * lineHeight);
    body2Lines.forEach((line: string) => {
      yPos = addNewPageIfNeeded(doc, yPos, lineHeight);
      doc.text(line, marginValue, yPos);
      yPos += lineHeight;
    });
    yPos += sectionGap;

    // Issuance date
    yPos = addNewPageIfNeeded(doc, yPos, lineHeight * 4);
    doc.text(`               Issued this ${newIssuanceDate}, in the City of Cebu, Philippines.`, marginValue, yPos);
    yPos += lineHeight * 3;

    // Signature section
    yPos = addNewPageIfNeeded(doc, yPos, lineHeight * 8);
    setFont("bold");
    doc.text("FLORANTE T. NAVARRO III/ ANGELITA C. SIPE", pageWidth - marginValue, yPos, {
      align: "right",
    });
    setFont("normal");
    doc.text("Pangkat Chairman/ Lupon Secretary", pageWidth - marginValue, yPos + lineHeight, {
      align: "right",
    });
    yPos += lineHeight * 4;

    // Signatures section
    yPos = addNewPageIfNeeded(doc, yPos, lineHeight * 4);
    setFont("normal");
    doc.text("COMPLAINANT ____________________", marginValue, yPos);
    doc.text("RESPONDENT ____________________", marginValue + 250, yPos);
    
    yPos = addNewPageIfNeeded(doc, yPos, lineHeight * 3);
    doc.text("SERVER ____________________", marginValue + 250, yPos + lineHeight * 2);

    // Seal - Only on last page
    if (withSeal && sealData) {
      yPos = addNewPageIfNeeded(doc, yPos, 150);
      const sealSize = 80;
      const sealX = pageWidth - marginValue - sealSize;
      const sealY = doc.internal.pageSize.getHeight() - marginValue - sealSize - 50;
      doc.addImage(sealData, "PNG", sealX, sealY, sealSize, sealSize);
      doc.setTextColor(255, 0, 0);
      doc.setFont("times", "bold");
      doc.setFontSize(10);
      const txt = "NOT VALID WITHOUT SEAL";
      const tWidth = doc.getTextWidth(txt);
      doc.text(txt, sealX + (sealSize - tWidth) / 2, sealY + sealSize + 15);
      doc.setTextColor(0, 0, 0);
    }

    const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
    setPdfUrl(url);
  };

  return (
    <div className="w-full h-full">
      {pdfUrl ? (
        <iframe
          src={`${pdfUrl}#zoom=FitH`}
          className="flex-1 w-full h-full border rounded-lg"
          style={{ minHeight: "78vh" }}
          title="Summon Document Preview"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p>Generating Summon PDF preview...</p>
        </div>
      )}
    </div>
  );
}

export default LuponPreview;