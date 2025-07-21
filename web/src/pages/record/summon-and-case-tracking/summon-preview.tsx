import { jsPDF } from "jspdf";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button/button";
import { formatSummonDateTime } from "@/helpers/summonDateTimeFormatter";
import { useGetSummonTemplate } from "./queries/summonFetchQueries";
import sealImage from "@/assets/images/Seal.png";
import { veraMonoNormal } from "@/assets/fonts/VeraMono-normal";
import { veraMonoBold } from "@/assets/fonts/VeraMono-Bold-bold";
import { formatDateForSummon, formatTimestampToDate } from "@/helpers/summonTimestampFormatter";

interface SummonPreviewProps {
  sr_code: string;
  incident_type: string;
  complainant: string[];
  complainant_address: string[];
  accused: string[];
  accused_address: string[];
  hearingDate: string;
  hearingTime: string;
  mediation: string;
  issuance_date: string;
  onClose?: () => void;
}

export const SummonPreview: React.FC<SummonPreviewProps> = ({
  sr_code,
  incident_type,
  complainant,
  complainant_address,
  accused,
  accused_address,
  hearingDate,
  hearingTime,
  mediation,
  issuance_date,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const { data: template } = useGetSummonTemplate();

  const header = template?.temp_header;
  const marginSetting = template?.temp_margin || "normal";
  const paperSizeSetting = template?.temp_paperSize || "letter";
  const withSeal = template?.temp_w_seal || false;
  console.log(paperSizeSetting)

  const registerFonts = (doc: jsPDF) => {
    doc.addFileToVFS('VeraMono-normal.ttf', veraMonoNormal);
    doc.addFont('VeraMono-normal.ttf', 'VeraMono', 'normal');
    doc.addFileToVFS('VeraMono-Bold-bold.ttf', veraMonoBold);
    doc.addFont('VeraMono-Bold-bold.ttf', 'VeraMono', 'bold');
  };

  const newIssuanceDate = issuance_date ? formatTimestampToDate(issuance_date) : formatDateForSummon(new Date());

  useEffect(() => {
    setIsLoading(true);
    setError(false);

    const generateDocument = async () => {
      try {
        let pageFormat: [number, number] | string;
        switch(paperSizeSetting) {
          case "legal":
            pageFormat = [612, 1008]; 
            break;
          case "letter":
            pageFormat = [612, 792]; 
            break;
          case "a4":
          default:
            pageFormat = "a4"; 
        }

        const marginValue = marginSetting === 'narrow' ? 36 : 72;
        const doc = new jsPDF({ 
          orientation: "portrait",
          unit: "pt",
          format: pageFormat,
        });

        registerFonts(doc);

        let yPos = marginValue;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const lineHeight = 14;
        const sectionGap = 20;

        const setCurrentFont = (style: 'normal' | 'bold' = 'normal') => {
          doc.setFont("VeraMono", style);
        };

        // Add header - check if header is an image URL or text content
        if (header && (header.startsWith('http://') || header.startsWith('https://'))) {
          try {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = header;
            
            await new Promise<void>((resolve, reject) => {
              img.onload = () => {
                try {
                  const imageHeight = 130;
                  doc.addImage(img, "PNG", marginValue, yPos, pageWidth - marginValue * 2, imageHeight);
                  yPos += imageHeight + 30;
                  resolve();
                } catch (e) {
                  console.error("Error adding header image:", e);
                  reject(e);
                }
              };
              img.onerror = () => {
                console.error("Failed to load header image");
                reject(new Error("Header image failed to load"));
              };
            });
          } catch (e) {
            console.error("Error processing header image:", e);
            // Fallback to text header
            addTextHeader();
          }
        } else {
          // Handle text header
          addTextHeader();
        }

        function addTextHeader() {
          setCurrentFont('normal');
          doc.setFontSize(10);

          const headerLines = header && !header.startsWith('http')
            ? header.split("\n")
            : [
                "Republic of the Philippines",
                "Cebu City | San Roque Ciudad",
                "",
                "Office of the Barangay Captain",
                "Arellano Boulevard, Cebu City, Cebu 6000",
                "barangaysanroquetiudad23@gmail.com",
                "(032) 231-36-99"
              ];

          headerLines.forEach((line) => {
            doc.text(line, pageWidth / 2, yPos, { align: "center" });
            yPos += lineHeight;
          });
          yPos += 20; // Add some space after the header
        }

        // Case Info
        setCurrentFont('bold');
        doc.setFontSize(10);
        doc.text(`BARANGAY CASE NO. : ${sr_code}`, pageWidth - marginValue, yPos, { align: "right" });
        yPos += lineHeight;

        // FOR: aligned right below case number
        doc.text(`FOR: ${incident_type}`, pageWidth - marginValue, yPos, { align: "right" });
        yPos += lineHeight * 2;  // Extra space after header

        // Left-aligned complainant details
        for (let i = 0; i < complainant.length; i++) {
          // Print name
          setCurrentFont('bold');
          doc.text(`NAME:`, marginValue, yPos);
          setCurrentFont('bold');
          doc.text(`${complainant[i]}`, marginValue + 35, yPos);
          yPos += lineHeight;
          
          // Print corresponding address if available
          if (i < complainant_address.length) {
            setCurrentFont('normal');
            doc.text(`ADDRESS:`, marginValue, yPos);
            setCurrentFont('normal');
            doc.text(`${complainant_address[i]}`, marginValue + 50, yPos);
            yPos += lineHeight;
          }
        }

        doc.text(`COMPLAINANT/S`, marginValue, yPos);
        yPos += lineHeight * 1.5;  // Extra space before divider

        // Divider
        setCurrentFont('bold');
        doc.text(`-AGAINST-`, marginValue, yPos);
        yPos += lineHeight * 1.5;  // Extra space after divider

        // Left-aligned respondent details
        for (let i = 0; i < accused.length; i++) {
          // Print name
          setCurrentFont('bold');
          doc.text(`NAME:`, marginValue, yPos);
          setCurrentFont('bold');
          doc.text(`${accused[i]}`, marginValue + 35, yPos);
          yPos += lineHeight;
          
          // Print corresponding address if available
          if (i < accused_address.length) {
            setCurrentFont('normal');
            doc.text(`ADDRESS:`, marginValue, yPos);
            setCurrentFont('normal');
            doc.text(`${accused_address[i]}`, marginValue + 50, yPos);
            yPos += lineHeight;
          }
        }

        doc.text(`RESPONDENT/S`, marginValue, yPos);
        yPos += lineHeight * 2;  

        // Title
        doc.setFont("times", "bold");
        doc.setFontSize(16);
        const title = "S U M M O N";
        const titleWidth = doc.getTextWidth(title);
        doc.text(title, (pageWidth - titleWidth) / 2, yPos);
        yPos += lineHeight;

        // Subtitle
        doc.setFont("times", "normal");
        doc.setFontSize(9);
        const subtitle = `${mediation} MEDIATION`;
        const subtitleWidth = doc.getTextWidth(subtitle);
        doc.text(subtitle, (pageWidth - subtitleWidth) / 2, yPos);
        yPos += lineHeight * 2;

        // Body
        setCurrentFont('normal');
        doc.setFontSize(10);

        const formattedDateTime = formatSummonDateTime(hearingDate, hearingTime);

        const bodyText1 = `You are hereby informed to appear before me in person, together with your witnesses, on the ${formattedDateTime} at the Barangay Hall of San Roque (CIUDAD). Then and there to answer the complaint made before me, for mediation of your dispute with complainant.`;
        const splitText1 = doc.splitTextToSize(bodyText1, pageWidth - marginValue * 2);
        splitText1.forEach((line: string) => {
          doc.text(line, marginValue, yPos);
          yPos += lineHeight;
        });

        yPos += sectionGap;

        const bodyText2 = `You are hereby warned that if you refuse or willfully fail to appear in obedience to this Summon, you may be barred from filing any counter claim arising from said complaint. Fail not or else face punishment for contempt of court.`;
        const splitText2 = doc.splitTextToSize(bodyText2, pageWidth - marginValue * 2);
        splitText2.forEach((line: string) => {
          doc.text(line, marginValue, yPos);
          yPos += lineHeight;
        });

        yPos += sectionGap;

        // Current date formatting
        doc.text(`Issued this ${newIssuanceDate}, in the City of Cebu, Philippines.`, marginValue, yPos);
        yPos += lineHeight * 3;

        // Signature section
        setCurrentFont("bold");
        const captainName = "HON. VIRGINIA N. ABENOJA";
        const nameWidth = doc.getTextWidth(captainName);
        doc.text(captainName, pageWidth - marginValue, yPos, { align: "right" });

        setCurrentFont("normal");
        const position = "Punong Barangay";
        const positionWidth = doc.getTextWidth(position);
        const positionX = pageWidth - marginValue - (nameWidth - positionWidth)/2;
        doc.text(position, positionX, yPos + lineHeight, { align: "right" });

        yPos += lineHeight * 4;

        // Signature fields
        setCurrentFont('normal');
        doc.text("COMPLAINANT ____________________", marginValue, yPos);
        doc.text("RESPONDENT ____________________", marginValue + 250, yPos);
        doc.text("SERVER ____________________", marginValue + 250, yPos + lineHeight * 2);

        // Add seal image if enabled
        if (withSeal) {
          const sealSize = 80;
          const sealX = pageWidth - marginValue - sealSize;
          const sealY = pageHeight - marginValue - sealSize - 50;

          const img = new Image();
          img.src = sealImage;
          await new Promise<void>((resolve) => {
            img.onload = () => {
              doc.addImage(img, "PNG", sealX, sealY, sealSize, sealSize);

              // Red seal label
              doc.setFontSize(10);
              doc.setTextColor(255, 0, 0);
              doc.setFont("times", "bold");

              const sealText = "NOT VALID WITHOUT SEAL";
              const textWidth = doc.getTextWidth(sealText);
              doc.text(sealText, sealX + (sealSize - textWidth) / 2, sealY + sealSize + 15);
              resolve();
            };
          });
        }

        setPdfData(doc.output('datauristring'));
        setIsLoading(false);
      } catch (error) {
        console.error("Document generation failed:", error);
        setError(true);
        setIsLoading(false);
      }
    };

    generateDocument();
  }, [sr_code, incident_type, complainant, complainant_address, accused, accused_address, hearingDate, hearingTime, mediation, header, marginSetting, paperSizeSetting, withSeal]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2">
        <span className="text-lg font-medium">Failed to generate document</span>
        <span className="text-sm">Please try again later</span>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-end">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="w-full h-full p-6 space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      ) : pdfData ? (
        <iframe 
          src={pdfData}
          className="flex-1 w-full h-full border rounded-lg"
          style={{ minHeight: '78vh' }}
          title="Summon Preview"
        />
      ) : null}
    </div>
  );
};

export default SummonPreview;