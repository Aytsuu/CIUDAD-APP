import { jsPDF } from "jspdf";
import { useEffect, useState } from "react";
import sealImage from "@/assets/images/Seal.png";
import { veraMonoNormal } from "@/assets/fonts/VeraMono-normal";
import { veraMonoBold } from "@/assets/fonts/VeraMono-Bold-bold";

interface TemplatePreviewProps {
  barangayLogo: string;
  cityLogo: string
  email?: string;
  telNum: string;
  belowHeaderContent?: string;
  title: string;
  subtitle?: string;
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
  barangayLogo,
  cityLogo,
  email,
  telNum,
  belowHeaderContent,
  title,
  subtitle,
  body,
  withSeal,
  withSignRight,
  withSignLeft,
  withSignatureApplicant,
  withSummon,
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
  }, [barangayLogo, cityLogo, email, telNum, belowHeaderContent, title, subtitle, body, withSeal, withSummon, withSignRight, withSignLeft, withSignatureApplicant, withSummon, paperSize, margin]);

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
    // const sectionGap = 20;

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


    // WATERMARK
    if (barangayLogo && barangayLogo !== "no-image-url-fetched") {
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

        doc.addImage(barangayLogo, "PNG", bgX, bgY, bgWidth, bgHeight);

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
      { text: "Republic of the Philippines", bold: true, size: 12 },
      { text: "City of Cebu | San Roque Ciudad", bold: false, size: 11 },
      { text: "____________________________________", bold: true, size: 14 },
      { text: "Office of the Barangay Captain", bold: false, size: 13 },
      { text: "Arellano Boulevard, Cebu City, Cebu, 6000", bold: false, size: 11 },
      { text: `${email} | ${telNum}`, bold: false, size: 11 }
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

    yPos = headerY + 40;



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
    
    
    if (barangayLogo && barangayLogo !== "no-image-url-fetched") {
      try {
        // Create a faded version of the logo (synchronous)
        const img = new Image();
        img.src = barangayLogo;
        
        // Create canvas and adjust opacity
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          ctx.globalAlpha = 0.2; // Adjust opacity here
          ctx.drawImage(img, 0, 0, img.width, img.height);
          
          // Get the faded image
          const fadedLogo = canvas.toDataURL("image/png");
          
          // Calculate position and size
          const bgWidth = pageWidth * 0.6;
          const bgHeight = (img.height / img.width) * bgWidth;
          const bgX = (pageWidth - bgWidth) / 2;
          const bgY = (pageHeight - bgHeight) / 2;
          
          // Add to PDF
          doc.addImage(fadedLogo, "PNG", bgX, bgY, bgWidth, bgHeight);
        }
      } catch (e) {
        console.error("Error adding background logo:", e);
      }
    }

    // Title
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    const titleWidth = doc.getTextWidth(title); 
    doc.text(title, (pageWidth - titleWidth) / 2, yPos);
    yPos += lineHeight + 10; // Fixed space after title

    //Subtitle Content
    if (subtitle) {
      yPos -= 10;
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      const subtitleWidth = doc.getTextWidth(subtitle);
      doc.text(subtitle, (pageWidth - subtitleWidth) / 2, yPos);
      yPos += lineHeight + 10; // Space after subtitle
    }

    yPos += 10;

    // Body content
    setCurrentFont('normal');
    doc.setFontSize(11);
    
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

      if (withSummon) {
        // Barangay captain info on the right side
        const captainX = pageWidth - marginValue - 170;
        setCurrentFont('bold');
        doc.text("HON. VIRGINIA N. ABENOJA", captainX, currentY);
        setCurrentFont('normal');;
        doc.text("Punong Barangay", captainX + 34, currentY + 20);

        //adds a space after the Punong Barangay na word
        currentY += 70;

        // Summon signature fields - new format
        setCurrentFont('normal');
        
        // Calculate positions
        const fieldSpacing = 30;
        const lineLength = 200; // Length of each field line
        
        // COMPLAINANT and RESPONDENT on same line
        doc.text("COMPLAINANT ____________________", signatureX, currentY);
        doc.text("RESPONDENT ____________________", signatureX + lineLength + 20, currentY);
        
        // SERVER aligned to right below RESPONDENT
        doc.text("SERVER ____________________", signatureX + lineLength + 20, currentY + fieldSpacing);
      }       

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
        
        doc.text("[ NAME OF THE APPLICANT ]", signatureX, currentY);
        currentY += 15; // Move down for the next line
        
        setCurrentFont('bold');
        doc.text("NAME AND SIGNATURE OF APPLICANT", signatureX, currentY);
        
        setCurrentFont('normal');
        doc.setFontSize(9);
        doc.text("CERTIFIED TRUE AND CORRECT:", signatureX, currentY + 15);
        currentY += 60;

        setCurrentFont('bold');
        doc.setFontSize(10);
        doc.text("HON. VIRGINIA N. ABENOJA", signatureX, currentY);
        setCurrentFont('normal');
        doc.text("Punong Barangay, San Roque Ciudad", signatureX, currentY + 13);
      }

      if (withSeal && sealBase64) {
        const sealY = footerY - 18;
        doc.addImage(sealBase64, "PNG", sealX, sealY, sealSize, sealSize);

        setCurrentFont('bold');
        doc.setFontSize(8);
        
        const text = "NOT VALID WITHOUT SEAL";
        const textWidth = doc.getTextWidth(text);
        const finalX = sealX + (sealSize - textWidth) / 2;
        
        doc.text(text, finalX, sealY + sealSize + textBelowSealOffset);
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