import { veraMonoNormal } from "@/assets/fonts/VeraMono-normal";
import { veraMonoBold } from "@/assets/fonts/VeraMono-Bold-bold";
import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import SummonSchema from "@/form-schema/summon-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useForm } from "react-hook-form";
import { useAddCaseActivity } from "./queries/summonInsertQueries";
import { useGetSummonTemplate } from "./queries/summonFetchQueries";
import { jsPDF } from "jspdf";
import sealImage from "@/assets/images/Seal.png";
import { formatSummonDateTime } from "@/helpers/summonDateTimeFormatter";

// Helper function to format date for summon
const formatDateForSummon = (date: Date) => {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' }).toUpperCase();
  const year = date.getFullYear();
  
  // Add ordinal suffix to day
  const suffix = 
    day === 1 || day === 21 || day === 31 ? 'st' :
    day === 2 || day === 22 ? 'nd' :
    day === 3 || day === 23 ? 'rd' : 'th';
  
  return `${day}${suffix} day of ${month} ${year}`;
};

function CreateNewSummon({ sr_id, complainant, accused, incident_type, complainant_address, accused_address, sr_code, onSuccess }: {
    sr_id: number;
    complainant: string;
    accused: string[];
    incident_type: string;
    complainant_address: string;
    accused_address: string[];
    sr_code: string;
    onSuccess: () => void
}) {
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const { mutate: addCase } = useAddCaseActivity(onSuccess);
    const { data: template } = useGetSummonTemplate();
    const header = template?.temp_header;
    const marginSetting = template?.temp_margin || "normal";
    const paperSizeSetting = template?.temp_paperSize || "letter";
    const withSeal = template?.temp_w_seal || false;

    const reasons = [
        { id: "First Hearing", name: "First Hearing" },
        { id: "Unresolved", name: "Unresolved" },
        { id: "Complainant is Absent/Unavailable", name: "Complainant is Absent/Unavailable" },
        { id: "Accused is Absent/Unavailable", name: "Accused is Absent/Unavailable" },
    ];

    const mediationNumber = [
        { id: "1st", name: "1st" },
        { id: "2nd", name: "2nd" },
        { id: "3rd", name: "3rd" },
    ];

    const form = useForm<z.infer<typeof SummonSchema>>({
        resolver: zodResolver(SummonSchema),
        defaultValues: {
            reason: "",
            hearingDate: "",
            hearingTime: "",
            mediation: "",
            sr_id: String(sr_id),
        },
    });

    const registerFonts = (doc: jsPDF) => {
        doc.addFileToVFS('VeraMono-normal.ttf', veraMonoNormal);
        doc.addFont('VeraMono-normal.ttf', 'VeraMono', 'normal');
        doc.addFileToVFS('VeraMono-Bold-bold.ttf', veraMonoBold);
        doc.addFont('VeraMono-Bold-bold.ttf', 'VeraMono', 'bold');
    };

    const generatePdf = async (hearingDate: string, hearingTime: string, mediation: string) => {
        return new Promise<void>((resolve) => {
            // Convert paper size to jsPDF format
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
                // Handle image header
                const imageHeight = 130;
                const img = new Image();
                img.crossOrigin = "Anonymous"; // Handle CORS if needed
                img.src = header;
                
                img.onload = () => {
                    try {
                        doc.addImage(img, "PNG", marginValue, yPos, pageWidth - marginValue * 2, imageHeight);
                        yPos += imageHeight + 30;
                        continueDocumentGeneration();
                    } catch (e) {
                        console.error("Error adding header image:", e);
                        // Fallback to text if image fails
                        addTextHeader();
                        continueDocumentGeneration();
                    }
                };
                
                img.onerror = () => {
                    console.error("Failed to load header image");
                    addTextHeader();
                    continueDocumentGeneration();
                };
            } else {
                // Handle text header
                addTextHeader();
                continueDocumentGeneration();
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

            function continueDocumentGeneration() {
                // Case Info
                setCurrentFont('bold');
                doc.setFontSize(10);
                doc.text(`BARANGAY CASE NO. : ${sr_code}`, pageWidth - marginValue, yPos, { align: "right" });
                yPos += lineHeight;

                // FOR: aligned right below case number
                doc.text(`FOR: ${incident_type}`, pageWidth - marginValue, yPos, { align: "right" });
                yPos += lineHeight * 2;  // Extra space after header

                // Left-aligned complainant details
                setCurrentFont('bold');
                doc.text(`NAME: ${complainant}`, marginValue, yPos);
                yPos += lineHeight;

                setCurrentFont('normal');
                doc.text(`ADDRESS: ${complainant_address}`, marginValue, yPos);
                yPos += lineHeight;

                doc.text(`COMPLAINANT/S`, marginValue, yPos);
                yPos += lineHeight * 2;  // Extra space before divider

                // Divider
                setCurrentFont('bold');
                doc.text(`-AGAINST-`, marginValue, yPos);
                yPos += lineHeight * 2;  // Extra space after divider

                // Left-aligned respondent details

                for (let i = 0; i < accused.length; i++) {
                    // Print name
                    setCurrentFont('bold');
                    doc.text(`NAME:`, marginValue, yPos);
                    setCurrentFont('bold');
                    doc.text(`${accused[i]}`, marginValue + 35, yPos); // Indent name text
                    yPos += lineHeight;
                    
                    
                    // Print corresponding address if available
                    if (i < accused_address.length) {
                        setCurrentFont('normal');
                        doc.text(`ADDRESS:`, marginValue, yPos);
                        setCurrentFont('normal');
                        doc.text(`${accused_address[i]}`, marginValue + 50, yPos); // Indent address text
                        yPos += lineHeight;
                    }
                    
                    // Add extra space between entries if not last item
                    if (i < accused.length - 1) {
                        yPos += lineHeight * 0.5;
                    }
                }

                doc.text(`RESPONDENT`, marginValue, yPos);
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
                const currentDate = new Date();
                const formattedDate = formatDateForSummon(currentDate);
                doc.text(`Issued this ${formattedDate}, in the City of Cebu, Philippines.`, marginValue, yPos);
                yPos += lineHeight * 3;

                // Signature section
                // Signature section - Right-aligned
                setCurrentFont("bold");
                const captainName = "HON. VIRGINIA N. ABENOJA";
                const nameWidth = doc.getTextWidth(captainName);
                doc.text(captainName, pageWidth - marginValue, yPos, { align: "right" });

                setCurrentFont("normal");
                const position = "Punong Barangay";
                const positionWidth = doc.getTextWidth(position);
                // Calculate right alignment offset to center position under name
                const positionX = pageWidth - marginValue - (nameWidth - positionWidth)/2;
                doc.text(position, positionX, yPos + lineHeight, { align: "right" });

                yPos += lineHeight * 5;

                // Signature fields
                setCurrentFont('normal');
                doc.text("COMPLAINANT ____________________", marginValue, yPos);
                doc.text("RESPONDENT ____________________", marginValue + 250, yPos);
                doc.text("SERVER ____________________", marginValue + 250, yPos + lineHeight * 2);

                // Add seal image only if withSeal is true
                if (withSeal) {
                    const sealSize = 80;
                    const sealX = pageWidth - marginValue - sealSize;
                    const sealY = pageHeight - marginValue - sealSize - 50;

                    const img = new Image();
                    img.src = sealImage;
                    img.onload = () => {
                        doc.addImage(img, "PNG", sealX, sealY, sealSize, sealSize);

                        // Red seal label
                        doc.setFontSize(10);
                        doc.setTextColor(255, 0, 0);
                        doc.setFont("times", "bold");

                        const sealText = "NOT VALID WITHOUT SEAL";
                        const textWidth = doc.getTextWidth(sealText);
                        doc.text(sealText, sealX + (sealSize - textWidth) / 2, sealY + sealSize + 15);

                        doc.save(`Summon_${sr_code}.pdf`);
                        resolve();
                    };
                } else {
                    doc.save(`Summon_${sr_code}.pdf`);
                    resolve();
                }
            }
        });
    };

    const onSubmit = async (values: z.infer<typeof SummonSchema>) => {
        try {
            setIsGeneratingPdf(true);
            await generatePdf(values.hearingDate, values.hearingTime, values.mediation);
            addCase(values);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <FormSelect
                            control={form.control}
                            name="reason"
                            label="Reason"
                            options={reasons}
                        />

                        <FormDateTimeInput
                            control={form.control}
                            name="hearingDate"
                            label="Hearing Date"
                            type="date"
                        />

                        <FormDateTimeInput
                            control={form.control}
                            name="hearingTime"
                            label="Hearing Time"
                            type="time"
                        />

                        <FormSelect
                            control={form.control}
                            name="mediation"
                            label="Mediation"
                            options={mediationNumber}
                        />

                        
                    </div>

                    <div className="flex justify-end mt-6 gap-2">
                        <Button type="submit" disabled={isGeneratingPdf}>
                            {isGeneratingPdf ? "Generating PDF..." : "Save"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default CreateNewSummon;