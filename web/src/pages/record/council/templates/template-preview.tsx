// import { jsPDF } from "jspdf";
// import { useEffect, useState } from "react";
// import sealImage from "@/assets/images/Seal.png";
// import { veraMonoNormal } from "@/assets/fonts/VeraMono-normal";
// import { veraMonoBold } from "@/assets/fonts/VeraMono-Bold-bold";

// interface TemplatePreviewProps {
//   barangayLogo: string;
//   cityLogo: string
//   email?: string;
//   telNum: string;
//   belowHeaderContent?: string;
//   title: string;
//   subtitle?: string;
//   body: string;
//   applicantName?: string;
//   withSeal: boolean;
//   withSignRight: boolean;
//   withSignLeft: boolean;
//   withSignatureApplicant: boolean;
//   withSummon?: boolean;
//   paperSize?: string;
//   margin?: string;
//   signatory?: string | null;
// }

// function TemplatePreview({
//   barangayLogo,
//   cityLogo,
//   email,
//   telNum,
//   belowHeaderContent,
//   title,
//   subtitle,
//   body,
//   applicantName,
//   withSeal,
//   withSignRight,
//   withSignLeft,
//   withSignatureApplicant,
//   withSummon,
//   paperSize = "letter",
//   margin = "normal",
//   signatory
// }: TemplatePreviewProps) {
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

// useEffect(() => {
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
//   }, [imagesLoaded, barangayLogoData, cityLogoData, sealData, title, subtitle, body, withSeal, withSummon, withSignRight, withSignLeft, withSignatureApplicant, paperSize, margin]);
  
//   const generatePDF = () => {
//     // Convert paper size to jsPDF format
//     let pageFormat: [number, number] | string;
//     switch(paperSize) {
//       case "legal":
//         pageFormat = [612, 1008];
//         break;
//       case "letter":
//       default:
//         pageFormat = [612, 792];
//     }

//     const doc = new jsPDF({
//       orientation: "portrait",
//       unit: "pt",
//       format: pageFormat,
//     });

//     registerFonts(doc);

//     const marginValue = margin === 'narrow' ? 36 : 72;
//     let yPos = marginValue;
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const lineHeight = 14;
//     // const sectionGap = 20;

//     // Set initial font
//     // const setCurrentFont = (style: 'normal' | 'bold' = 'normal') => {
//     //   if (withSummon) {
//     //     doc.setFont("times", style);
//     //   } else {
//     //     doc.setFont("times", style);
//     //   }
//     // };
//     const setCurrentFont = (style: 'normal' | 'bold' = 'normal') => {
//       doc.setFont("times", style);
//     };    

//     setCurrentFont('normal');
//     doc.setFontSize(12);


//     // WATERMARK
//     if (barangayLogo && barangayLogo !== "no-image-url-fetched") {
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

//         doc.addImage(barangayLogo, "PNG", bgX, bgY, bgWidth, bgHeight);

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

//     if (barangayLogo && barangayLogo !== "no-image-url-fetched") {
//       try {
//         doc.addImage(barangayLogo, "PNG", leftLogoX, yPos, logoWidth, logoHeight);
//       } catch (e) {
//         console.error("Error adding barangay logo:", e);
//       }
//     }

//     if (cityLogo && cityLogo !== "no-image-url-fetched") {
//       try {
//         doc.addImage(cityLogo, "PNG", rightLogoX, yPos, logoWidth, logoHeight);
//       } catch (e) {
//         console.error("Error adding city logo:", e);
//       }
//     }

//     // Header text configuration
//     const headerText = [
//       { text: "Republic of the Philippines", bold: true, size: 12 },
//       { text: "City of Cebu | San Roque Ciudad", bold: false, size: 11 },
//       { text: "____________________________________", bold: true, size: 14 },
//       { text: "Office of the Barangay Captain", bold: false, size: 13 },
//       { text: "Arellano Boulevard, Cebu City, Cebu, 6000", bold: false, size: 11 },
//       { text: `${email} | ${telNum}`, bold: false, size: 11 }
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



//     //Below Header Content
//     if (belowHeaderContent) {

//       doc.setFontSize(12);
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
    
    
//     if (barangayLogo && barangayLogo !== "no-image-url-fetched") {
//       try {
//         // Create a faded version of the logo (synchronous)
//         const img = new Image();
//         img.src = barangayLogo;
        
//         // Create canvas and adjust opacity
//         const canvas = document.createElement("canvas");
//         canvas.width = img.width;
//         canvas.height = img.height;
//         const ctx = canvas.getContext("2d");
        
//         if (ctx) {
//           ctx.globalAlpha = 0.2; // Adjust opacity here
//           ctx.drawImage(img, 0, 0, img.width, img.height);
          
//           // Get the faded image
//           const fadedLogo = canvas.toDataURL("image/png");
          
//           // Calculate position and size
//           const bgWidth = pageWidth * 0.6;
//           const bgHeight = (img.height / img.width) * bgWidth;
//           const bgX = (pageWidth - bgWidth) / 2;
//           const bgY = (pageHeight - bgHeight) / 2;
          
//           // Add to PDF
//           doc.addImage(fadedLogo, "PNG", bgX, bgY, bgWidth, bgHeight);
//         }
//       } catch (e) {
//         console.error("Error adding background logo:", e);
//       }
//     }

//     // Title
//     doc.setFont("times", "bold");
//     doc.setFontSize(20);
//     const titleWidth = doc.getTextWidth(title); 
//     doc.text(title, (pageWidth - titleWidth) / 2, yPos);
//     yPos += lineHeight + 10; // Fixed space after title

//     //Subtitle Content
//     if (subtitle) {
//       yPos -= 10;
//       doc.setFont("times", "bold");
//       doc.setFontSize(11);
//       const subtitleWidth = doc.getTextWidth(subtitle);
//       doc.text(subtitle, (pageWidth - subtitleWidth) / 2, yPos);
//       yPos += lineHeight + 10; // Space after subtitle
//     }

//     yPos += 10;

//     // Body content
//     setCurrentFont('normal');
//     doc.setFontSize(11);
    
//     const contentWidth = pageWidth - marginValue * 2;
//     const splitText = doc.splitTextToSize(body, contentWidth);
//     const lineSpacing = 18; // Increased from 14 to 18 for better readability
    
//     for (let i = 0; i < splitText.length; i++) {
//       if (yPos + lineSpacing > pageHeight - marginValue - 120) {
//         doc.addPage();
//         yPos = marginValue;
//       }
      
//       // Process each line for bold markup
//       let currentX = marginValue;
//       const parts = splitText[i].split(/(\/\*.*?\*\/)/g);
      
//       parts.forEach((part: string) => {
//         if (part.startsWith('/*') && part.endsWith('*/')) {
//           // Bold text
//           const boldText = part.slice(2, -2);
//           setCurrentFont('bold');
//           doc.text(boldText, currentX, yPos);
//           currentX += doc.getTextWidth(boldText);
//         } else if (part) {
//           // Normal text
//           setCurrentFont('normal');
//           doc.text(part, currentX, yPos);
//           currentX += doc.getTextWidth(part);
//         }
//       });
      
//       yPos += lineSpacing; // Using the increased line spacing
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
//         doc.setFont("times", "bold");
//         doc.text("HON. VIRGINIA N. ABENOJA", captainX, currentY);
//         doc.setFont("times", "normal");
//         doc.text("Punong Barangay", captainX + 34, currentY + 15);

//         // Add space after the Punong Barangay
//         currentY += 60;

//         // Attested section on the left side
//         doc.setFont("times", "normal");
//         doc.text("Attested:", signatureX, currentY);
        
//         // Add some space for the name line
//         currentY += 20;
//         doc.setFont("times", "bold");
//         doc.text("FLORANTE T. NAVARRO III", signatureX, currentY);
        
//         // Add space for the title
//         currentY += 15;
//         doc.setFont("times", "normal");
//         doc.text("Pangkat Chairman", signatureX + 25, currentY);
//       }    

//       if (withSignRight) {
//         const captainX = pageWidth - marginValue - 200; 

//         // Add the additional signatory above the existing one
//         setCurrentFont('bold');
//         doc.setFontSize(10);
//         doc.text(`HON. ${signatory}`, captainX, currentY); // Use the signatory prop
        
//         currentY += 12; // Space after name
        
//         setCurrentFont('normal');
//         doc.setFontSize(11);
//         doc.text("Barangay Councilor", captainX, currentY);
        
//         currentY += 18; // Space after title
        
//         // Existing code for Virginia Abenoja
//         setCurrentFont('bold');
//         doc.setFontSize(10);
//         doc.text("HON. VIRGINIA N. ABENOJA", captainX, currentY);

//         setCurrentFont('normal');
//         doc.setFontSize(11);
//         // const titleOffset = 6;
//         doc.text(
//           "Punong Barangay, San Roque Ciudad", 
//           captainX,// + titleOffset if need
//           currentY + 12
//         );
//       }

//       if (withSignLeft) {
//         // Add the additional signatory above the existing one
//         setCurrentFont('bold');
//         doc.setFontSize(10);
//         doc.text(`HON. ${signatory}`, signatureX, currentY); // Use the signatory prop
        
//         currentY += 12; // Space after name
        
//         setCurrentFont('normal');
//         doc.setFontSize(11);
//         doc.text("Barangay Councilor", signatureX, currentY);
        
//         currentY += 18; // Space after title
        
//         // Existing code for Virginia Abenoja
//         setCurrentFont('bold');
//         doc.setFontSize(10);
//         doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY);

//         setCurrentFont('normal');
//         doc.setFontSize(11);
//         doc.text("Punong Barangay, San Roque Ciudad", signatureX, currentY + 12);        
//       }

 
//       if (withSignatureApplicant) {
//         setCurrentFont('bold');
        
//         doc.text(`${applicantName}`, signatureX, currentY);
        
//         // Calculate underline position and draw manually
//         const textWidth = doc.getTextWidth(`${applicantName}`);
//         const underlineY = currentY + 2; // Position slightly below the text
//         doc.setLineWidth(0.5);
//         doc.line(signatureX, underlineY, signatureX + textWidth, underlineY);

//         currentY += 15; // Move down for the next line
        
//         setCurrentFont('bold');
//         doc.text("NAME AND SIGNATURE OF APPLICANT", signatureX, currentY);
        
//         currentY += 15; // Space after applicant signature line
        
//         setCurrentFont('normal');
//         doc.setFontSize(9);
//         doc.text("CERTIFIED TRUE AND CORRECT:", signatureX, currentY);
        
//         currentY += 50; // Space after certification text
        
//         setCurrentFont('bold');
//         doc.setFontSize(10);
//         doc.text(`HON. ${signatory}`, signatureX, currentY);
        
//         currentY += 12; // Space after name
        
//         setCurrentFont('normal');
//         doc.setFontSize(11);
//         doc.text("Barangay Councilor", signatureX, currentY);
        
//         currentY += 18; // Space after title
        
//         setCurrentFont('bold');
//         doc.setFontSize(10);
//         doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY);
        
//         currentY += 12; // Space after name
        
//         setCurrentFont('normal');
//         doc.setFontSize(11);
//         doc.text("Punong Barangay, San Roque Ciudad", signatureX, currentY);
//       }

//       if (withSeal && sealBase64) {
//         const sealY = footerY - 18;
//         doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

//         setCurrentFont('bold');
//         doc.setFontSize(8);
        
//         const text = "NOT VALID WITHOUT SEAL";
//         const textWidth = doc.getTextWidth(text);
//         const finalX = sealX + (sealSize - textWidth) / 2;
        
//         doc.text(text, finalX, sealY + sealSize + textBelowSealOffset);
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

interface Template {
  temp_title: string;
  temp_subtitle?: string;
  temp_no_header?: boolean;
  temp_no_footer?: boolean;
  temp_belowHeaderContent?: string;
  temp_barangayLogo: string;
  temp_cityLogo: string;
  temp_email?: string;
  temp_telNum: string;
  temp_paperSize: string;
  temp_margin: string;
  temp_filename: string;
  temp_applicantName?: string;
  temp_summon?: boolean;
  temp_w_sign_right: boolean;
  temp_w_sign_left: boolean;
  temp_w_sign_applicant: boolean;
  temp_w_seal: boolean;
  temp_body: string;
  temp_id?: string;
}

interface TemplatePreviewProps {
  templates: Template[]; // Changed from individual props to array of templates
  signatory?: string | null;
}

function TemplatePreview({ templates, signatory }: TemplatePreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [_barangayLogoData, setBarangayLogoData] = useState<string | null>(null);
  const [_cityLogoData, setCityLogoData] = useState<string | null>(null);
  const [sealData, setSealData] = useState<string | null>(null);

  // If no templates provided, return null
  if (!templates || templates.length === 0) {
    return null;
  }

  const firstTemplate = templates[0];

  const registerFonts = (doc: jsPDF) => {
    doc.addFileToVFS('VeraMono-normal.ttf', veraMonoNormal);
    doc.addFont('VeraMono-normal.ttf', 'VeraMono', 'normal');
    doc.addFileToVFS('VeraMono-Bold-bold.ttf', veraMonoBold);
    doc.addFont('VeraMono-Bold-bold.ttf', 'VeraMono', 'bold');
  };

  useEffect(() => {
    const preloadImages = async () => {
      try {
        const barangayLogo = firstTemplate.temp_barangayLogo;
        const cityLogo = firstTemplate.temp_cityLogo;

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
        setImagesLoaded(true);
      }
    };

    preloadImages();
  }, [firstTemplate.temp_barangayLogo, firstTemplate.temp_cityLogo]);

  useEffect(() => {
    if (imagesLoaded) {
      generateMultiPagePDF();
    }
  }, [imagesLoaded, templates, signatory]);

  const generateHeader = (doc: jsPDF, template: Template, yPos: number, pageWidth: number, marginValue: number) => {
    const logoWidth = 90;
    const logoHeight = 90;
    const lineHeight = 14;

    // Add watermark
    if (template.temp_barangayLogo && template.temp_barangayLogo !== "no-image-url-fetched") {
      try {
        if (doc.setGState) {
          // @ts-ignore
          const gState = doc.GState({ opacity: 0.15 });
          // @ts-ignore
          doc.setGState(gState);
        }

        const pageHeight = doc.internal.pageSize.getHeight();
        const bgWidth = 400;   
        const bgHeight = 400;  
        const bgX = (pageWidth - bgWidth) / 2;
        const bgY = (pageHeight - bgHeight) / 2;

        doc.addImage(template.temp_barangayLogo, "PNG", bgX, bgY, bgWidth, bgHeight);

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

    // Add logos
    const leftLogoX = marginValue;
    const rightLogoX = pageWidth - marginValue - logoWidth;

    if (template.temp_barangayLogo && template.temp_barangayLogo !== "no-image-url-fetched") {
      try {
        doc.addImage(template.temp_barangayLogo, "PNG", leftLogoX, yPos, logoWidth, logoHeight);
      } catch (e) {
        console.error("Error adding barangay logo:", e);
      }
    }

    if (template.temp_cityLogo && template.temp_cityLogo !== "no-image-url-fetched") {
      try {
        doc.addImage(template.temp_cityLogo, "PNG", rightLogoX, yPos, logoWidth, logoHeight);
      } catch (e) {
        console.error("Error adding city logo:", e);
      }
    }

    // Header text
    const headerText = [
      { text: "Republic of the Philippines", bold: true, size: 12 },
      { text: "City of Cebu | San Roque Ciudad", bold: false, size: 11 },
      { text: "____________________________________", bold: true, size: 14 },
      { text: "Office of the Barangay Captain", bold: false, size: 13 },
      { text: "Arellano Boulevard, Cebu City, Cebu, 6000", bold: false, size: 11 },
      { text: `${template.temp_email} | ${template.temp_telNum}`, bold: false, size: 11 }
    ];

    const centerX = pageWidth / 2;
    let headerY = yPos + 15;

    headerText.forEach((line) => {
      if (line.text === "") {
        headerY += 10;
        return;
      }
      
      doc.setFont("times", line.bold ? 'bold' : 'normal');
      doc.setFontSize(line.size);
      
      const textWidth = doc.getTextWidth(line.text);
      doc.text(line.text, centerX - (textWidth / 2), headerY);
      headerY += lineHeight;
      
      if (line.bold) {
        headerY += 5;
      }
    });

    return headerY + 40;
  };

  const generatePageContent = (doc: jsPDF, template: Template, startY: number, pageWidth: number, pageHeight: number, marginValue: number) => {
    let yPos = startY;
    const lineHeight = 14;

    // Below Header Content
    if (template.temp_belowHeaderContent) {
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      const belowHeaderLines = doc.splitTextToSize(template.temp_belowHeaderContent, pageWidth - marginValue * 2);
      for (let i = 0; i < belowHeaderLines.length; i++) {
        if (yPos + lineHeight > pageHeight - marginValue) {
          doc.addPage();
          yPos = marginValue;
        }
        doc.text(belowHeaderLines[i], marginValue, yPos);
        yPos += lineHeight;
      }
      yPos += 10;
    }

    // Title
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    const titleWidth = doc.getTextWidth(template.temp_title); 
    doc.text(template.temp_title, (pageWidth - titleWidth) / 2, yPos);
    yPos += lineHeight + 10;

    // Subtitle
    if (template.temp_subtitle) {
      yPos -= 10;
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      const subtitleWidth = doc.getTextWidth(template.temp_subtitle);
      doc.text(template.temp_subtitle, (pageWidth - subtitleWidth) / 2, yPos);
      yPos += lineHeight + 10;
    }

    yPos += 10;

    // Body content
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    
    const contentWidth = pageWidth - marginValue * 2;
    const splitText = doc.splitTextToSize(template.temp_body, contentWidth);
    const lineSpacing = 18;
    
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
          const boldText = part.slice(2, -2);
          doc.setFont("times", "bold");
          doc.text(boldText, currentX, yPos);
          currentX += doc.getTextWidth(boldText);
        } else if (part) {
          doc.setFont("times", "normal");
          doc.text(part, currentX, yPos);
          currentX += doc.getTextWidth(part);
        }
      });
      
      yPos += lineSpacing;
    }

    return yPos + 40;
  };

  const generateFooter = (doc: jsPDF, template: Template, pageWidth: number, pageHeight: number, marginValue: number) => {
    doc.setFontSize(10);
    const footerY = pageHeight - marginValue - 120;
    const signatureX = marginValue;
    const sealSize = 80;
    const sealX = pageWidth - marginValue - sealSize - 35;
    const textBelowSealOffset = 20;

    let currentY = footerY;

    if (template.temp_summon) {
      const captainX = pageWidth - marginValue - 170;
      doc.setFont("times", "bold");
      doc.text("HON. VIRGINIA N. ABENOJA", captainX, currentY);
      doc.setFont("times", "normal");
      doc.text("Punong Barangay", captainX + 34, currentY + 15);

      currentY += 60;

      doc.setFont("times", "normal");
      doc.text("Attested:", signatureX, currentY);
      
      currentY += 20;
      doc.setFont("times", "bold");
      doc.text("FLORANTE T. NAVARRO III", signatureX, currentY);
      
      currentY += 15;
      doc.setFont("times", "normal");
      doc.text("Pangkat Chairman", signatureX + 25, currentY);
    }

    if (template.temp_w_sign_right) {
      const rightMarginX = pageWidth - marginValue; // Right margin position
      const textPadding = 10; // Optional padding from the right margin

      doc.setFont("times", "normal");
      doc.setFontSize(10);
      const authorityText = "BY THE AUTHORITY OF THE BARANGAY CAPTAIN";
      const authorityWidth = doc.getTextWidth(authorityText);
      const authorityX = rightMarginX - authorityWidth - textPadding;
      doc.text(authorityText, authorityX, currentY);

      currentY += 50;

      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.setTextColor("#009fff");       
      
      // Calculate right-aligned position for the first line
      const signatoryText = `HON. ${signatory}`;
      const signatoryWidth = doc.getTextWidth(signatoryText);
      const signatoryX = rightMarginX - signatoryWidth - textPadding;
      doc.text(signatoryText, signatoryX, currentY);
      
      currentY += 12;
      
      // Calculate right-aligned position for the second line
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      const councilorText = "Barangay Councilor";
      const councilorWidth = doc.getTextWidth(councilorText);
      const councilorX = rightMarginX - councilorWidth - textPadding;
      doc.text(councilorText, councilorX, currentY);
      
      currentY += 18;
      
      // Calculate right-aligned position for the third line
      doc.setFont("times", "bold");
      doc.setTextColor(0, 0, 0); 
      doc.setFontSize(10);
      const captainNameText = "HON. VIRGINIA N. ABENOJA";
      const captainNameWidth = doc.getTextWidth(captainNameText);
      const captainNameX = rightMarginX - captainNameWidth - textPadding;
      doc.text(captainNameText, captainNameX, currentY);

      // Calculate right-aligned position for the fourth line
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      const captainTitleText = "Punong Barangay, San Roque Ciudad";
      const captainTitleWidth = doc.getTextWidth(captainTitleText);
      const captainTitleX = rightMarginX - captainTitleWidth - textPadding;
      doc.text(captainTitleText, captainTitleX, currentY + 12);
    }

    if (template.temp_w_sign_left) {

      doc.setFont("times", "normal");
      doc.setFontSize(9);
      doc.text("BY THE AUTHORITY OF THE BARANGAY CAPTAIN", signatureX, currentY);      

      currentY += 50;      

      doc.setFont("times", "bold");
      doc.setTextColor("#009fff"); 
      doc.setFontSize(10);
      doc.text(`HON. ${signatory}`, signatureX, currentY);
      
      currentY += 12;
      
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.text("Barangay Councilor", signatureX, currentY);
      
      currentY += 18;
      
      doc.setFont("times", "bold");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY);

      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.text("Punong Barangay, San Roque Ciudad", signatureX, currentY + 12);
    }

    if (template.temp_w_sign_applicant) {

      doc.setFont("times", "bold");
      
      doc.text(`${template.temp_applicantName}`, signatureX, currentY);
      
      const textWidth = doc.getTextWidth(`${template.temp_applicantName}`);
      const underlineY = currentY + 2;
      doc.setLineWidth(0.5);
      doc.line(signatureX, underlineY, signatureX + textWidth, underlineY);

      currentY += 12;
      
      doc.setFont("times", "normal");
      doc.text("NAME AND SIGNATURE OF APPLICANT", signatureX, currentY);
      
      currentY += 11;
      
      doc.setFont("times", "bold");
      doc.setFontSize(9);
      doc.text("CERTIFIED TRUE AND CORRECT:", signatureX, currentY);

      currentY += 20;      

      doc.setFont("times", "normal");

      doc.text("BY THE AUTHORITY OF THE BARANGAY CAPTAIN", signatureX, currentY);      
      
      currentY += 40;
      
      doc.setTextColor("#009fff"); // set to blue 
      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.text(`HON. ${signatory}`, signatureX, currentY);
      
      currentY += 12;
      
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.text("Barangay Councilor", signatureX, currentY);
      
      currentY += 14;
      
      doc.setTextColor(0, 0, 0); //set to black
      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY);
      
      currentY += 12;
      
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.text("Punong Barangay, San Roque Ciudad", signatureX, currentY);
    }

    if (template.temp_w_seal && sealData) {
      const sealY = footerY - 18;
      doc.addImage(sealData, "PNG", sealX, sealY, sealSize, sealSize);

      doc.setFont("times", "bold");
      doc.setFontSize(8);
      
      const text = "NOT VALID WITHOUT SEAL";
      const textWidth = doc.getTextWidth(text);
      const finalX = sealX + (sealSize - textWidth) / 2;
      
      doc.text(text, finalX, sealY + sealSize + textBelowSealOffset);
    }
  };

  const generateMultiPagePDF = () => {
    // Use the first template's paper size settings
    let pageFormat: [number, number] | string;
    switch(firstTemplate.temp_paperSize) {
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

    const marginValue = firstTemplate.temp_margin === 'narrow' ? 36 : 72;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Generate each template as a separate page
    templates.forEach((template, index) => {
      // Add a new page for each template after the first one
      if (index > 0) {
        doc.addPage();
      }

      let yPos = marginValue;

      // Generate header for this page
      if(!template.temp_no_header){
        yPos = generateHeader(doc, template, yPos, pageWidth, marginValue);
      }

      // Generate content for this page
      generatePageContent(doc, template, yPos, pageWidth, pageHeight, marginValue);

      // Generate footer for this page
      generateFooter(doc, template, pageWidth, pageHeight, marginValue);
    });

    const url = URL.createObjectURL(new Blob([doc.output("blob")], { type: "application/pdf" }));
    setPdfUrl(url);
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