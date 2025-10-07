// import { jsPDF } from "jspdf";
// import { useEffect, useState } from "react";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Button } from "@/components/ui/button/button";
// import { formatSummonDateTime } from "@/helpers/summonDateTimeFormatter";
// import sealImage from "@/assets/images/Seal.png";
// import { veraMonoNormal } from "@/assets/fonts/VeraMono-normal";
// import { veraMonoBold } from "@/assets/fonts/VeraMono-Bold-bold";
// import { formatDateForSummon, formatTimestampToDate } from "@/helpers/summonTimestampFormatter";

// interface SummonPreviewProps {
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
//   onClose?: () => void;
// }

// export const SummonPreview: React.FC<SummonPreviewProps> = ({
//   sr_code,
//   incident_type,
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
//   onClose,
// }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(false);
//   const [pdfData, setPdfData] = useState<string | null>(null);
  
//   console.log(complainant)
//   console.log('Accused', accused)

//   // const header = template?.temp_header;
//   const header = "w";
//   const marginSetting =  "narrow";
//   const paperSizeSetting = "letter";
//   const withSeal = false;
//   console.log(paperSizeSetting)

//   const registerFonts = (doc: jsPDF) => {
//     doc.addFileToVFS('VeraMono-normal.ttf', veraMonoNormal);
//     doc.addFont('VeraMono-normal.ttf', 'VeraMono', 'normal');
//     doc.addFileToVFS('VeraMono-Bold-bold.ttf', veraMonoBold);
//     doc.addFont('VeraMono-Bold-bold.ttf', 'VeraMono', 'bold');
//   };

//   const newIssuanceDate = issuance_date ? formatTimestampToDate(issuance_date) : formatDateForSummon(new Date());

//   useEffect(() => {
//     setIsLoading(true);
//     setError(false);

//     const generateDocument = async () => {
//       try {
//         let pageFormat = [612, 792];
//         const marginValue = marginSetting === 'narrow' ? 36 : 72;
//         const doc = new jsPDF({ 
//           orientation: "portrait",
//           unit: "pt",
//           format: pageFormat,
//         });

//         registerFonts(doc);

//         let yPos = marginValue;
//         const pageWidth = doc.internal.pageSize.getWidth();
//         const pageHeight = doc.internal.pageSize.getHeight();
//         const lineHeight = 14;
//         const sectionGap = 20;

//         const setCurrentFont = (style: 'normal' | 'bold' = 'normal') => {
//           doc.setFont("VeraMono", style);
//         };

//         // Add header - check if header is an image URL or text content
//         if (header && (header.startsWith('http://') || header.startsWith('https://'))) {
//           try {
//             const img = new Image();
//             img.crossOrigin = "Anonymous";
//             img.src = header;
            
//             await new Promise<void>((resolve, reject) => {
//               img.onload = () => {
//                 try {
//                   const imageHeight = 130;
//                   doc.addImage(img, "PNG", marginValue, yPos, pageWidth - marginValue * 2, imageHeight);
//                   yPos += imageHeight + 30;
//                   resolve();
//                 } catch (e) {
//                   console.error("Error adding header image:", e);
//                   reject(e);
//                 }
//               };
//               img.onerror = () => {
//                 console.error("Failed to load header image");
//                 reject(new Error("Header image failed to load"));
//               };
//             });
//           } catch (e) {
//             console.error("Error processing header image:", e);
//             // Fallback to text header
//             addTextHeader();
//           }
//         } else {
//           // Handle text header
//           addTextHeader();
//         }

//         function addTextHeader() {
//           setCurrentFont('normal');
//           doc.setFontSize(10);

//           const headerLines = header && !header.startsWith('http')
//             ? header.split("\n")
//             : [
//                 "Republic of the Philippines",
//                 "Cebu City | San Roque Ciudad",
//                 "",
//                 "Office of the Barangay Captain",
//                 "Arellano Boulevard, Cebu City, Cebu 6000",
//                 "barangaysanroquetiudad23@gmail.com",
//                 "(032) 231-36-99"
//               ];

//           headerLines.forEach((line) => {
//             doc.text(line, pageWidth / 2, yPos, { align: "center" });
//             yPos += lineHeight;
//           });
//           yPos += 20; // Add some space after the header
//         }

//         // Case Info
//         setCurrentFont('bold');
//         doc.setFontSize(10);
//         doc.text(`BARANGAY CASE NO. : ${sr_code}`, pageWidth - marginValue, yPos, { align: "right" });
//         yPos += lineHeight;

//         // FOR: aligned right below case number
//         // doc.text(`FOR: ${incident_type}`, pageWidth - marginValue, yPos, { align: "right" });
//         yPos += lineHeight * 2;  // Extra space after header

//         // Left-aligned complainant details
//         for (let i = 0; i < complainant.length; i++) {
//           // Print name
//           setCurrentFont('bold');
//           doc.text(`NAME:`, marginValue, yPos);
//           setCurrentFont('bold');
//           doc.text(`${complainant[i]}`, marginValue + 35, yPos);
//           yPos += lineHeight;
          
//           // Print corresponding address if available
//           if (i < complainant_address.length) {
//             setCurrentFont('normal');
//             doc.text(`ADDRESS:`, marginValue, yPos);
//             setCurrentFont('normal');
//             doc.text(`${complainant_address[i]}`, marginValue + 50, yPos);
//             yPos += lineHeight;
//           }
//         }

//         doc.text(`COMPLAINANT/S`, marginValue, yPos);
//         yPos += lineHeight * 1.5;  // Extra space before divider

//         // Divider
//         setCurrentFont('bold');
//         doc.text(`-AGAINST-`, marginValue, yPos);
//         yPos += lineHeight * 1.5;  // Extra space after divider

//         // Left-aligned respondent details
//         for (let i = 0; i < accused.length; i++) {
//           // Print name
//           setCurrentFont('bold');
//           doc.text(`NAME:`, marginValue, yPos);
//           setCurrentFont('bold');
//           doc.text(`${accused[i]}`, marginValue + 35, yPos);
//           yPos += lineHeight;
          
//           // Print corresponding address if available
//           if (i < accused_address.length) {
//             setCurrentFont('normal');
//             doc.text(`ADDRESS:`, marginValue, yPos);
//             setCurrentFont('normal');
//             doc.text(`${accused_address[i]}`, marginValue + 50, yPos);
//             yPos += lineHeight;
//           }
//         }

//         doc.text(`RESPONDENT/S`, marginValue, yPos);
//         yPos += lineHeight * 2;  

//         // Title
//         doc.setFont("times", "bold");
//         doc.setFontSize(16);
//         const title = "S U M M O N";
//         const titleWidth = doc.getTextWidth(title);
//         doc.text(title, (pageWidth - titleWidth) / 2, yPos);
//         yPos += lineHeight;

//         // Subtitle
//         doc.setFont("times", "normal");
//         doc.setFontSize(9);
//         const subtitle = `${mediation}`;
//         const subtitleWidth = doc.getTextWidth(subtitle);
//         doc.text(subtitle, (pageWidth - subtitleWidth) / 2, yPos);
//         yPos += lineHeight * 2;

//         // Body
//         setCurrentFont('normal');
//         doc.setFontSize(10);

//         const formattedDateTime = formatSummonDateTime(hearingDate, hearingTime);

//         const bodyText1 = `You are hereby informed to appear before me in person, together with your witnesses, on the ${formattedDateTime} at the Barangay Hall of San Roque (CIUDAD). Then and there to answer the complaint made before me, for mediation of your dispute with complainant.`;
//         const splitText1 = doc.splitTextToSize(bodyText1, pageWidth - marginValue * 2);
//         splitText1.forEach((line: string) => {
//           doc.text(line, marginValue, yPos);
//           yPos += lineHeight;
//         });

//         yPos += sectionGap;

//         const bodyText2 = `You are hereby warned that if you refuse or willfully fail to appear in obedience to this Summon, you may be barred from filing any counter claim arising from said complaint. Fail not or else face punishment for contempt of court.`;
//         const splitText2 = doc.splitTextToSize(bodyText2, pageWidth - marginValue * 2);
//         splitText2.forEach((line: string) => {
//           doc.text(line, marginValue, yPos);
//           yPos += lineHeight;
//         });

//         yPos += sectionGap;

//         // Current date formatting
//         doc.text(`Issued this ${newIssuanceDate}, in the City of Cebu, Philippines.`, marginValue, yPos);
//         yPos += lineHeight * 3;

//         // Signature section
//         setCurrentFont("bold");
//         const captainName = "HON. VIRGINIA N. ABENOJA";
//         const nameWidth = doc.getTextWidth(captainName);
//         doc.text(captainName, pageWidth - marginValue, yPos, { align: "right" });

//         setCurrentFont("normal");
//         const position = "Punong Barangay";
//         const positionWidth = doc.getTextWidth(position);
//         const positionX = pageWidth - marginValue - (nameWidth - positionWidth)/2;
//         doc.text(position, positionX, yPos + lineHeight, { align: "right" });

//         yPos += lineHeight * 4;

//         // Signature fields
//         setCurrentFont('normal');
//         doc.text("COMPLAINANT ____________________", marginValue, yPos);
//         doc.text("RESPONDENT ____________________", marginValue + 250, yPos);
//         doc.text("SERVER ____________________", marginValue + 250, yPos + lineHeight * 2);

//         // Add seal image if enabled
//         if (withSeal) {
//           const sealSize = 80;
//           const sealX = pageWidth - marginValue - sealSize;
//           const sealY = pageHeight - marginValue - sealSize - 50;

//           const img = new Image();
//           img.src = sealImage;
//           await new Promise<void>((resolve) => {
//             img.onload = () => {
//               doc.addImage(img, "PNG", sealX, sealY, sealSize, sealSize);

//               // Red seal label
//               doc.setFontSize(10);
//               doc.setTextColor(255, 0, 0);
//               doc.setFont("times", "bold");

//               const sealText = "NOT VALID WITHOUT SEAL";
//               const textWidth = doc.getTextWidth(sealText);
//               doc.text(sealText, sealX + (sealSize - textWidth) / 2, sealY + sealSize + 15);
//               resolve();
//             };
//           });
//         }

//         setPdfData(doc.output('datauristring'));
//         setIsLoading(false);
//       } catch (error) {
//         console.error("Document generation failed:", error);
//         setError(true);
//         setIsLoading(false);
//       }
//     };

//     generateDocument();
//   }, [sr_code, incident_type, complainant, complainant_address, accused, accused_address, hearingDate, hearingTime, mediation, header, marginSetting, paperSizeSetting, withSeal]);

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2">
//         <span className="text-lg font-medium">Failed to generate document</span>
//         <span className="text-sm">Please try again later</span>
//         <Button variant="outline" onClick={onClose} className="mt-4">
//           Close
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-full flex flex-col">
//       <div className="flex justify-end">
//         {onClose && (
//           <Button variant="outline" onClick={onClose}>
//             Close
//           </Button>
//         )}
//       </div>
      
//       {isLoading ? (
//         <div className="w-full h-full p-6 space-y-4">
//           <Skeleton className="h-8 w-3/4 mx-auto" />
//           <Skeleton className="h-4 w-full" />
//           <Skeleton className="h-4 w-5/6" />
//           <div className="space-y-2">
//             <Skeleton className="h-6 w-1/4" />
//             <Skeleton className="h-32 w-full" />
//           </div>
//           <div className="space-y-2">
//             <Skeleton className="h-6 w-1/4" />
//             <Skeleton className="h-24 w-full" />
//           </div>
//         </div>
//       ) : pdfData ? (
//         <iframe 
//           src={pdfData}
//           className="flex-1 w-full h-full border rounded-lg"
//           style={{ minHeight: '78vh' }}
//           title="Summon Preview"
//         />
//       ) : null}
//     </div>
//   );
// };

// import { jsPDF } from "jspdf";
// import { useEffect, useState } from "react";
// import sealImage from "@/assets/images/Seal.png";
// import { veraMonoNormal } from "@/assets/fonts/VeraMono-normal";
// import { veraMonoBold } from "@/assets/fonts/VeraMono-Bold-bold";
// import { formatSummonDateTime } from "@/helpers/summonDateTimeFormatter";
// import {
//   formatDateForSummon,
//   formatTimestampToDate,
// } from "@/helpers/summonTimestampFormatter";

// interface SummonPreviewProps {
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

// export default function SummonPreviewLikeTemplate({
//   sr_code,
//   incident_type,
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
// }: SummonPreviewProps) {
//   const [pdfUrl, setPdfUrl] = useState<string | null>(null);
//   const [imagesLoaded, setImagesLoaded] = useState(false);
//   const [barangayLogoData, setBarangayLogoData] = useState<string | null>(null);
//   const [cityLogoData, setCityLogoData] = useState<string | null>(null);
//   const [sealData, setSealData] = useState<string | null>(null);

//   console.log('brgyLogo', barangayLogo)
//   console.log('cityLogo', cityLogo)
  
//   const registerFonts = (doc: jsPDF) => {
//     doc.addFileToVFS("VeraMono-normal.ttf", veraMonoNormal);
//     doc.addFont("VeraMono-normal.ttf", "VeraMono", "normal");
//     doc.addFileToVFS("VeraMono-Bold-bold.ttf", veraMonoBold);
//     doc.addFont("VeraMono-Bold-bold.ttf", "VeraMono", "bold");
//   };

//   // --- Preload all required images before generating the PDF ---
//   useEffect(() => {
//     const preloadImages = async () => {
//       try {
//         const tasks: Promise<void>[] = [];

//         // Clean URLs first
//         const cleanBarangayLogo = barangayLogo?.split('?')[0];
//         const cleanCityLogo = cityLogo?.split('?')[0];

//         if (cleanBarangayLogo && cleanBarangayLogo !== "no-image-url-fetched") {
//           tasks.push(
//             new Promise((resolve, reject) => {
//               const img = new Image();
//               img.crossOrigin = "anonymous";
//               img.src = cleanBarangayLogo;
//               img.onload = () => {
//                 setBarangayLogoData(cleanBarangayLogo);
//                 resolve();
//               };
//               img.onerror = () => {
//                 console.warn("Failed to load barangay logo");
//                 resolve(); // Still resolve to continue
//               };
//             })
//           );
//         }

//         if (cleanCityLogo && cleanCityLogo !== "no-image-url-fetched") {
//           tasks.push(
//             new Promise((resolve, reject) => {
//               const img = new Image();
//               img.crossOrigin = "anonymous";
//               img.src = cleanCityLogo;
//               img.onload = () => {
//                 setCityLogoData(cleanCityLogo);
//                 resolve();
//               };
//               img.onerror = () => {
//                 console.warn("Failed to load city logo");
//                 resolve(); // Still resolve to continue
//               };
//             })
//           );
//         }

//         // Seal image
//         tasks.push(
//           new Promise((resolve, reject) => {
//             const img = new Image();
//             img.src = sealImage;
//             img.onload = () => {
//               setSealData(sealImage);
//               resolve();
//             };
//             img.onerror = () => {
//               console.warn("Failed to load seal image");
//               resolve();
//             };
//           })
//         );

//         await Promise.all(tasks);
//         setImagesLoaded(true);
//       } catch (err) {
//         console.error("Image preload failed:", err);
//         setImagesLoaded(true); // Still allow generation
//       }
//     };

//     preloadImages();
//   }, [barangayLogo, cityLogo]);

//   // --- Generate the PDF only when all images are ready ---
//   useEffect(() => {
//     if (!imagesLoaded) return;

//     const generatePDF = async () => {
//       try {
//         const doc = new jsPDF({
//           orientation: "portrait",
//           unit: "pt",
//           format: [612, 792],
//         });
//         registerFonts(doc);

//         const marginValue = 36;
//         let yPos = marginValue;
//         const pageWidth = doc.internal.pageSize.getWidth();
//         const lineHeight = 14;
//         const sectionGap = 20;

//         const setFont = (style: "normal" | "bold" = "normal") =>
//           doc.setFont("VeraMono", style);

//         // ---------- HEADER ----------
//         const headerLines: { text: string; bold: boolean; size: number }[] = [
//           { text: "Republic of the Philippines", bold: true, size: 12 },
//           { text: "City of Cebu | San Roque Ciudad", bold: false, size: 11 },
//           { text: "____________________________________", bold: true, size: 14 },
//           { text: "", bold: false, size: 8 },
//           { text: "Office of the Barangay Captain", bold: false, size: 13 },
//           { text: "Arellano Boulevard, Cebu City, Cebu, 6000", bold: false, size: 11 },
//           { text: `${email} | ${telnum}`, bold: false, size: 11 },
//         ];

//         headerLines.forEach((line) => {
//           setFont(line.bold ? "bold" : "normal");
//           doc.setFontSize(line.size);
//           doc.text(line.text, pageWidth / 2, yPos, { align: "center" });
//           yPos += lineHeight;
//         });

//         yPos += 20;
//         // ---------- END HEADER ----------

//         setFont("bold");
//         doc.setFontSize(10);
//         doc.text(`BARANGAY CASE NO.: ${sr_code}`, pageWidth - marginValue, yPos, {
//           align: "right",
//         });
//         yPos += lineHeight * 2;

//         complainant.forEach((name, i) => {
//           setFont("bold");
//           doc.text("NAME:", marginValue, yPos);
//           doc.text(name, marginValue + 40, yPos);
//           yPos += lineHeight;
//           if (complainant_address[i]) {
//             setFont("normal");
//             doc.text("ADDRESS:", marginValue, yPos);
//             doc.text(complainant_address[i], marginValue + 50, yPos);
//             yPos += lineHeight;
//           }
//         });
//         doc.text("COMPLAINANT/S", marginValue, yPos);
//         yPos += lineHeight * 1.5;

//         setFont("bold");
//         doc.text("-AGAINST-", marginValue, yPos);
//         yPos += lineHeight * 1.5;

//         accused.forEach((name, i) => {
//           setFont("bold");
//           doc.text("NAME:", marginValue, yPos);
//           doc.text(name, marginValue + 40, yPos);
//           yPos += lineHeight;
//           if (accused_address[i]) {
//             setFont("normal");
//             doc.text("ADDRESS:", marginValue, yPos);
//             doc.text(accused_address[i], marginValue + 50, yPos);
//             yPos += lineHeight;
//           }
//         });
//         doc.text("RESPONDENT/S", marginValue, yPos);
//         yPos += lineHeight * 2;

//         doc.setFont("times", "bold");
//         doc.setFontSize(16);
//         const title = "S U M M O N";
//         doc.text(title, pageWidth / 2, yPos, { align: "center" });
//         yPos += lineHeight;

//         doc.setFont("times", "normal");
//         doc.setFontSize(9);
//         doc.text(mediation, pageWidth / 2, yPos, { align: "center" });
//         yPos += lineHeight * 2;

//         setFont("normal");
//         doc.setFontSize(10);
//         const formattedDateTime = formatSummonDateTime(hearingDate, hearingTime);
//         const body1 = `You are hereby informed to appear before me in person, together with your witnesses, on the ${formattedDateTime} at the Barangay Hall of San Roque (CIUDAD). Then and there to answer the complaint made before me, for mediation of your dispute with complainant.`;
//         doc.splitTextToSize(body1, pageWidth - marginValue * 2).forEach((line: string) => {
//           doc.text(line, marginValue, yPos);
//           yPos += lineHeight;
//         });
//         yPos += sectionGap;

//         const body2 =
//           "You are hereby warned that if you refuse or willfully fail to appear in obedience to this Summon, you may be barred from filing any counter claim arising from said complaint. Fail not or else face punishment for contempt of court.";
//         doc.splitTextToSize(body2, pageWidth - marginValue * 2).forEach((line: string) => {
//           doc.text(line, marginValue, yPos);
//           yPos += lineHeight;
//         });
//         yPos += sectionGap;

//         const issuance = issuance_date
//           ? formatTimestampToDate(issuance_date)
//           : formatDateForSummon(new Date());
//         doc.text(
//           `Issued this ${issuance}, in the City of Cebu, Philippines.`,
//           marginValue,
//           yPos
//         );
//         yPos += lineHeight * 3;

//         setFont("bold");
//         doc.text("HON. VIRGINIA N. ABENOJA", pageWidth - marginValue, yPos, {
//           align: "right",
//         });
//         setFont("normal");
//         doc.text("Punong Barangay", pageWidth - marginValue, yPos + lineHeight, {
//           align: "right",
//         });
//         yPos += lineHeight * 4;

//         setFont("normal");
//         doc.text("COMPLAINANT ____________________", marginValue, yPos);
//         doc.text("RESPONDENT ____________________", marginValue + 250, yPos);
//         doc.text("SERVER ____________________", marginValue + 250, yPos + lineHeight * 2);

//         if (withSeal && sealData) {
//           const sealSize = 80;
//           const sealX = pageWidth - marginValue - sealSize;
//           const sealY = doc.internal.pageSize.getHeight() - marginValue - sealSize - 50;
//           doc.addImage(sealData, "PNG", sealX, sealY, sealSize, sealSize);
//           doc.setTextColor(255, 0, 0);
//           doc.setFont("times", "bold");
//           doc.setFontSize(10);
//           const txt = "NOT VALID WITHOUT SEAL";
//           const tWidth = doc.getTextWidth(txt);
//           doc.text(txt, sealX + (sealSize - tWidth) / 2, sealY + sealSize + 15);
//           doc.setTextColor(0, 0, 0);
//         }

//         setPdfUrl(doc.output("datauristring"));
//       } catch (err) {
//         console.error("Failed to generate summon pdf:", err);
//       }
//     };

//     generatePDF();
//   }, [
//     imagesLoaded,
//     sr_code,
//     incident_type,
//     complainant,
//     complainant_address,
//     accused,
//     accused_address,
//     hearingDate,
//     hearingTime,
//     mediation,
//     issuance_date,
//     barangayLogoData,
//     cityLogoData,
//     sealData,
//     email,
//     telnum,
//     withSeal,
//   ]);

//   return (
//     <div className="w-full h-full flex flex-col">
//       {imagesLoaded && pdfUrl ? (
//         <iframe
//           src={`${pdfUrl}#zoom=FitH`}
//           className="flex-1 w-full h-full border rounded-lg"
//           style={{ minHeight: "78vh" }}
//           title="Summon Document Preview"
//         />
//       ) : (
//         <div className="flex items-center justify-center h-full">
//           <p>Loading images and generating Summon PDF...</p>
//         </div>
//       )}
//     </div>
//   );
// }



import { jsPDF } from "jspdf";
import { useEffect, useState } from "react";
import sealImage from "@/assets/images/Seal.png";
import { veraMonoNormal } from "@/assets/fonts/VeraMono-normal";
import { veraMonoBold } from "@/assets/fonts/VeraMono-Bold-bold";
import { formatDateForSummon, formatTimestampToDate } from "@/helpers/summonTimestampFormatter";
import { formatSummonDateTime } from "@/helpers/summonDateTimeFormatter";

interface SummonPreviewProps {
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

function SummonPreview({
  sr_code,
  // incident_type,
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
}: SummonPreviewProps) {
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
        doc.addImage(barangayLogoData, "PNG", leftLogoX, yPos, logoWidth, logoHeight);
      } catch (e) {
        console.error("Error adding barangay logo:", e);
      }
    }

    if (cityLogoData && cityLogoData !== "no-image-url-fetched") {
      try {
        doc.addImage(cityLogoData, "PNG", rightLogoX, yPos, logoWidth, logoHeight);
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
      { text: `${email} | ${telnum}`, bold: false, size: 11 }
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

    // Summon content
    setFont("bold");
    doc.setFontSize(10);
    doc.text(`BARANGAY CASE NO.: ${sr_code}`, pageWidth - marginValue, yPos, {
      align: "right",
    });
    yPos += lineHeight * 2;

    // Complainant section
    complainant.forEach((name, i) => {
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
    });
    doc.text("COMPLAINANT/S", marginValue, yPos);
    yPos += lineHeight * 1.5;

    setFont("bold");
    doc.text("-AGAINST-", marginValue, yPos);
    yPos += lineHeight * 1.5;

    // Accused section
    accused.forEach((name, i) => {
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
    });
    doc.text("RESPONDENT/S", marginValue, yPos);
    yPos += lineHeight * 2;

    // Title
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    const title = "S U M M O N";
    doc.text(title, pageWidth / 2, yPos, { align: "center" });
    yPos += lineHeight;

    // Mediation text
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    doc.text(mediation, pageWidth / 2, yPos, { align: "center" });
    yPos += lineHeight * 2;

    // Body content
    setFont("normal");
    doc.setFontSize(10);
    const formattedDateTime = formatSummonDateTime(hearingDate, hearingTime);
    const body1 = `You are hereby informed to appear before me in person, together with your witnesses, on the ${formattedDateTime} at the Barangay Hall of San Roque (CIUDAD). Then and there to answer the complaint made before me, for mediation of your dispute with complainant.`;
    doc.splitTextToSize(body1, pageWidth - marginValue * 2).forEach((line: string) => {
      doc.text(line, marginValue, yPos);
      yPos += lineHeight;
    });
    yPos += sectionGap;

    const body2 = "You are hereby warned that if you refuse or willfully fail to appear in obedience to this Summon, you may be barred from filing any counter claim arising from said complaint. Fail not or else face punishment for contempt of court.";
    doc.splitTextToSize(body2, pageWidth - marginValue * 2).forEach((line: string) => {
      doc.text(line, marginValue, yPos);
      yPos += lineHeight;
    });
    yPos += sectionGap;

    // Issuance date
    doc.text(`Issued this ${newIssuanceDate}, in the City of Cebu, Philippines.`, marginValue, yPos);
    yPos += lineHeight * 3;

    // Signature section
    setFont("bold");
    doc.text("HON. VIRGINIA N. ABENOJA", pageWidth - marginValue, yPos, {
      align: "right",
    });
    setFont("normal");
    doc.text("Punong Barangay", pageWidth - marginValue, yPos + lineHeight, {
      align: "right",
    });
    yPos += lineHeight * 4;

    // Signatures section
    setFont("normal");
    doc.text("COMPLAINANT ____________________", marginValue, yPos);
    doc.text("RESPONDENT ____________________", marginValue + 250, yPos);
    doc.text("SERVER ____________________", marginValue + 250, yPos + lineHeight * 2);

    // Seal
    if (withSeal && sealData) {
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

export default SummonPreview;