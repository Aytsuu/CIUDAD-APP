// import { useState } from "react";
// import { Button } from "@/components/ui/button/button";
// import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
// import { Form } from "@/components/ui/form/form";
// import { FormSelect } from "@/components/ui/form/form-select";
// import SummonSchema from "@/form-schema/summon-schema";
// import { zodResolver } from "@hookform/resolvers/zod";
// import z from "zod";
// import { useForm } from "react-hook-form";
// import { useAddCaseActivity } from "./queries/summonInsertQueries";
// import { useGetSummonTemplate } from "./queries/summonFetchQueries";

// function CreateNewSummon({ sr_id, complainant, accused, onSuccess }: {
//     sr_id: number;
//     complainant: string;
//     accused: string[];
//     onSuccess: () => void
// }) {
//     const [openPreview, setOpenPreview] = useState(false);
//     const {mutate: addCase} = useAddCaseActivity(onSuccess)
//     const {data: template, isLoading} = useGetSummonTemplate();
//     const header = template?.temp_header

//     const reasons = [
//         { id: "First Hearing", name: "First Hearing" },
//         { id: "Unresolved", name: "Unresolved" },
//         { id: "Complainant is Absent/Unavailable", name: "Complainant is Absent/Unavailable" },
//         { id: "Accused is Absent/Unavailable", name: "Accused is Absent/Unavailable" },
//     ];
    
//     const form = useForm<z.infer<typeof SummonSchema>>({
//         resolver: zodResolver(SummonSchema),
//         defaultValues: {
//             reason: "",
//             hearingDate: "",
//             hearingTime: "",
//             sr_id: String(sr_id),
//         },
//     });


//     const onSubmit = (values: z.infer<typeof SummonSchema>) => {
//         addCase(values)
//     }

//     return (
//         <div>
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)}>
//                     <div className="space-y-4">
//                         <FormSelect
//                             control={form.control}
//                             name="reason"
//                             label="Reason"
//                             options={reasons}
//                         />

//                         <FormDateTimeInput
//                             control={form.control}
//                             name="hearingDate"
//                             label="Hearing Date"
//                             type="date"
//                         />

//                         <FormDateTimeInput
//                             control={form.control}
//                             name="hearingTime"
//                             label="Hearing Time"
//                             type="time"
//                         />
//                     </div>

//                     <div className="flex justify-end mt-6 gap-2">
//                          <Button type="submit">Save</Button>
//                     </div>
//                 </form>
//             </Form>
//         </div>
//     );
// }

// export default CreateNewSummon;


// import { useState } from "react";
// import { Button } from "@/components/ui/button/button";
// import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
// import { Form } from "@/components/ui/form/form";
// import { FormSelect } from "@/components/ui/form/form-select";
// import SummonSchema from "@/form-schema/summon-schema";
// import { zodResolver } from "@hookform/resolvers/zod";
// import z from "zod";
// import { useForm } from "react-hook-form";
// import { useAddCaseActivity } from "./queries/summonInsertQueries";
// import { useGetSummonTemplate } from "./queries/summonFetchQueries";
// import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// // Create styles that match the original PDF exactly
// const styles = StyleSheet.create({
//   page: {
//     padding: 40,
//     fontFamily: 'Times-Roman',
//     fontSize: 12,
//     lineHeight: 1.5,
//   },
//   header: {
//     fontSize: 12,
//     marginBottom: 10,
//     textAlign: 'center',
//     fontWeight: 'bold',
//   },
//   title: {
//     fontSize: 14,
//     marginTop: 20,
//     marginBottom: 20,
//     textAlign: 'center',
//     fontWeight: 'bold',
//     textDecoration: 'none',
//     letterSpacing: 1,
//   },
//   body: {
//     fontSize: 12,
//     lineHeight: 1.8,
//     marginBottom: 10,
//     textAlign: 'left',
//   },
//   caseInfo: {
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   against: {
//     marginTop: 5,
//     marginBottom: 20,
//   },
//   signature: {
//     marginTop: 60,
//     marginBottom: 5,
//   },
//   signatureLine: {
//     marginTop: 30,
//   },
//   divider: {
//     borderBottom: '1px solid black',
//     marginTop: 30,
//     marginBottom: 5,
//     width: '40%',
//   },
//   footer: {
//     marginTop: 40,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   footerColumn: {
//     width: '45%',
//   }
// });

// // PDF Document Component with exact original formatting
// const SummonDocument = ({ 
//   header, 
//   caseNo, 
//   complainant, 
//   accused, 
//   hearingDate, 
//   hearingTime 
// }: {
//   header: string;
//   caseNo: string;
//   complainant: string;
//   accused: string[];
//   hearingDate: string;
//   hearingTime: string;
// }) => {
//   // Split the header into lines as shown in the original
//   const headerLines = header ? header.split('\n') : [
//     "Republic of the Philippines",
//     "Cebu City | San Roque Ciudad",
//     "",
//     "Office of the Barangay Captain",
//     "Arellano Boulevard, Cebu City, Cebu 6000",
//     "barangaysanroquetiudad23@gmail.com",
//     "(032) 231-36-99"
//   ];

//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         {/* Header with exact original spacing */}
//         <View style={styles.header}>
//           {headerLines.map((line, index) => (
//             <Text key={index}>{line}</Text>
//           ))}
//         </View>

//         {/* Case information */}
//         <View style={styles.caseInfo}>
//           <Text style={styles.body}>BARANGAY CASE NO. {caseNo}</Text>
//           <Text style={styles.body}>FOR:</Text>
//           <Text style={{...styles.body, marginLeft: 20}}>{complainant}</Text>
//         </View>

//         <View style={styles.against}>
//           <Text style={styles.body}>-AGAINST-</Text>
//           <Text style={{...styles.body, marginLeft: 20}}>{accused.join(", ")}</Text>
//         </View>

//         {/* Title with exact original formatting */}
//         <Text style={styles.title}>S U M M O N</Text>
//         <Text style={{...styles.title, marginTop: -10, fontSize: 12}}>MEDIATION</Text>

//         {/* Main body text */}
//         <Text style={{...styles.body, marginTop: 20}}>
//           You are hereby informed to appear before me in person, together with your witnesses, on the day of {hearingDate}, at {hearingTime} in the afternoon at the Barangay Hall of San Roque (CIUDAD). Then and there to answer the complaint made before me, for mediation of your dispute with complainant.
//         </Text>

//         <Text style={{...styles.body, marginTop: 15}}>
//           You are hereby warned that if you refuse or willfully fail to appear in obedience to this Summon, you May be barred from filling any counter claim arising from said complainant. Fail not or else face punishment for contempt of court.
//         </Text>

//         <Text style={{...styles.body, marginTop: 15}}>
//           Issued this day in the City of Cebu, Philippines.
//         </Text>

//         {/* Signature section */}
//         <View style={styles.signature}>
//           <Text style={{...styles.body, fontWeight: 'bold'}}>HON. VIRGINIA N. ABENOJA</Text>
//           <Text style={styles.body}>Punong Barangay</Text>
//         </View>

//         {/* Footer with signature lines */}
//         <View style={styles.footer}>
//           <View style={styles.footerColumn}>
//             <View style={styles.divider}></View>
//             <Text style={styles.body}>COMPLAINANT</Text>
//           </View>
//           <View style={styles.footerColumn}>
//             <View style={styles.divider}></View>
//             <Text style={styles.body}>RESPONDENT</Text>
//           </View>
//         </View>
//       </Page>
//     </Document>
//   );
// };

// function CreateNewSummon({ sr_id, complainant, accused, onSuccess }: {
//     sr_id: number;
//     complainant: string;
//     accused: string[];
//     onSuccess: () => void
// }) {
//     const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
//     const {mutate: addCase} = useAddCaseActivity(onSuccess);
//     const {data: template, isLoading} = useGetSummonTemplate();
//     const header = template?.temp_header;
//     console.log('header:', header)

//     const reasons = [
//         { id: "First Hearing", name: "First Hearing" },
//         { id: "Unresolved", name: "Unresolved" },
//         { id: "Complainant is Absent/Unavailable", name: "Complainant is Absent/Unavailable" },
//         { id: "Accused is Absent/Unavailable", name: "Accused is Absent/Unavailable" },
//     ];
    
//     const form = useForm<z.infer<typeof SummonSchema>>({
//         resolver: zodResolver(SummonSchema),
//         defaultValues: {
//             reason: "",
//             hearingDate: "",
//             hearingTime: "",
//             sr_id: String(sr_id),
//         },
//     });

//     const onSubmit = async (values: z.infer<typeof SummonSchema>) => {
//         try {
//             setIsGeneratingPdf(true);
            
//             // Generate a case number
//             const caseNo = `BC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
            
//             // Create the PDF document
//             const doc = (
//                 <SummonDocument
//                     header={header || "Republic of the Philippines\nCebu City | San Roque Ciudad\nOffice of the Barangay Captain"}
//                     caseNo={caseNo}
//                     complainant={complainant}
//                     accused={accused}
//                     hearingDate={values.hearingDate}
//                     hearingTime={values.hearingTime}
//                 />
//             );
            
//             // Generate PDF blob
//             const blob = await pdf(doc).toBlob();
            
//             // Create download link
//             const url = URL.createObjectURL(blob);
//             const link = document.createElement('a');
//             link.href = url;
//             link.download = `Summon_${caseNo}.pdf`;
//             document.body.appendChild(link);
//             link.click();
            
//             // Clean up
//             setTimeout(() => {
//                 document.body.removeChild(link);
//                 URL.revokeObjectURL(url);
//                 setIsGeneratingPdf(false);
//             }, 100);
            
//             // Now call the API to add the case
//             addCase(values);
            
//         } catch (error) {
//             console.error("Error generating PDF:", error);
//             setIsGeneratingPdf(false);
//         }
//     };

//     return (
//         <div>
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)}>
//                     <div className="space-y-4">
//                         <FormSelect
//                             control={form.control}
//                             name="reason"
//                             label="Reason"
//                             options={reasons}
//                         />

//                         <FormDateTimeInput
//                             control={form.control}
//                             name="hearingDate"
//                             label="Hearing Date"
//                             type="date"
//                         />

//                         <FormDateTimeInput
//                             control={form.control}
//                             name="hearingTime"
//                             label="Hearing Time"
//                             type="time"
//                         />
//                     </div>

//                     <div className="flex justify-end mt-6 gap-2">
//                         <Button type="submit" disabled={isGeneratingPdf}>
//                             {isGeneratingPdf ? "Generating PDF..." : "Save"}
//                         </Button>
//                     </div>
//                 </form>
//             </Form>
//         </div>
//     );
// }

// export default CreateNewSummon;

// import { useState } from "react";
// import { Button } from "@/components/ui/button/button";
// import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
// import { Form } from "@/components/ui/form/form";
// import { FormSelect } from "@/components/ui/form/form-select";
// import SummonSchema from "@/form-schema/summon-schema";
// import { zodResolver } from "@hookform/resolvers/zod";
// import z from "zod";
// import { useForm } from "react-hook-form";
// import { useAddCaseActivity } from "./queries/summonInsertQueries";
// import { useGetSummonTemplate } from "./queries/summonFetchQueries";
// import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// // Create styles that match the original PDF exactly
// const styles = StyleSheet.create({
//   page: {
//     padding: 40,
//     fontFamily: 'Times-Roman',
//     fontSize: 12,
//     lineHeight: 1.5,
//   },
//   header: {
//     fontSize: 12,
//     marginBottom: 10,
//     textAlign: 'center',
//     fontWeight: 'bold',
//   },
//   title: {
//     fontSize: 14,
//     marginTop: 20,
//     marginBottom: 20,
//     textAlign: 'center',
//     fontWeight: 'bold',
//     textDecoration: 'none',
//     letterSpacing: 1,
//   },
//   body: {
//     fontSize: 12,
//     lineHeight: 1.8,
//     marginBottom: 10,
//     textAlign: 'left',
//   },
//   caseInfo: {
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   against: {
//     marginTop: 5,
//     marginBottom: 20,
//   },
//   signature: {
//     marginTop: 60,
//     marginBottom: 5,
//   },
//   signatureLine: {
//     marginTop: 30,
//   },
//   divider: {
//     borderBottom: '1px solid black',
//     marginTop: 30,
//     marginBottom: 5,
//     width: '40%',
//   },
//   footer: {
//     marginTop: 40,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   footerColumn: {
//     width: '45%',
//   }
// });

// // PDF Document Component with exact original formatting
// const SummonDocument = ({ 
//   header, 
//   caseNo, 
//   complainant, 
//   accused, 
//   hearingDate, 
//   hearingTime 
// }: {
//   header: string;
//   caseNo: string;
//   complainant: string;
//   accused: string[];
//   hearingDate: string;
//   hearingTime: string;
// }) => {
//   // Split the header into lines as shown in the original
//   const headerLines = header ? header.split('\n') : [
//     "Republic of the Philippines",
//     "Cebu City | San Roque Ciudad",
//     "",
//     "Office of the Barangay Captain",
//     "Arellano Boulevard, Cebu City, Cebu 6000",
//     "barangaysanroquetiudad23@gmail.com",
//     "(032) 231-36-99"
//   ];

//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         {/* Header with exact original spacing */}
//         <View style={styles.header}>
//           {headerLines.map((line, index) => (
//             <Text key={index}>{line}</Text>
//           ))}
//         </View>

//         {/* Case information */}
//         <View style={styles.caseInfo}>
//           <Text style={styles.body}>BARANGAY CASE NO. {caseNo}</Text>
//           <Text style={styles.body}>FOR:</Text>
//           <Text style={{...styles.body, marginLeft: 20}}>{complainant}</Text>
//         </View>

//         <View style={styles.against}>
//           <Text style={styles.body}>-AGAINST-</Text>
//           <Text style={{...styles.body, marginLeft: 20}}>{accused.join(", ")}</Text>
//         </View>

//         {/* Title with exact original formatting */}
//         <Text style={styles.title}>S U M M O N</Text>
//         <Text style={{...styles.title, marginTop: -10, fontSize: 12}}>MEDIATION</Text>

//         {/* Main body text */}
//         <Text style={{...styles.body, marginTop: 20}}>
//           You are hereby informed to appear before me in person, together with your witnesses, on the day of {hearingDate}, at {hearingTime} in the afternoon at the Barangay Hall of San Roque (CIUDAD). Then and there to answer the complaint made before me, for mediation of your dispute with complainant.
//         </Text>

//         <Text style={{...styles.body, marginTop: 15}}>
//           You are hereby warned that if you refuse or willfully fail to appear in obedience to this Summon, you May be barred from filling any counter claim arising from said complainant. Fail not or else face punishment for contempt of court.
//         </Text>

//         <Text style={{...styles.body, marginTop: 15}}>
//           Issued this day in the City of Cebu, Philippines.
//         </Text>

//         {/* Signature section */}
//         <View style={styles.signature}>
//           <Text style={{...styles.body, fontWeight: 'bold'}}>HON. VIRGINIA N. ABENOJA</Text>
//           <Text style={styles.body}>Punong Barangay</Text>
//         </View>

//         {/* Footer with signature lines */}
//         <View style={styles.footer}>
//           <View style={styles.footerColumn}>
//             <View style={styles.divider}></View>
//             <Text style={styles.body}>COMPLAINANT</Text>
//           </View>
//           <View style={styles.footerColumn}>
//             <View style={styles.divider}></View>
//             <Text style={styles.body}>RESPONDENT</Text>
//           </View>
//         </View>
//       </Page>
//     </Document>
//   );
// };

// function CreateNewSummon({ sr_id, complainant, accused, onSuccess }: {
//     sr_id: number;
//     complainant: string;
//     accused: string[];
//     onSuccess: () => void
// }) {
//     const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
//     const {mutate: addCase} = useAddCaseActivity(onSuccess);
//     const {data: template, isLoading} = useGetSummonTemplate();
//     const header = template?.temp_header;
//     console.log('header:', header)

//     const reasons = [
//         { id: "First Hearing", name: "First Hearing" },
//         { id: "Unresolved", name: "Unresolved" },
//         { id: "Complainant is Absent/Unavailable", name: "Complainant is Absent/Unavailable" },
//         { id: "Accused is Absent/Unavailable", name: "Accused is Absent/Unavailable" },
//     ];
    
//     const form = useForm<z.infer<typeof SummonSchema>>({
//         resolver: zodResolver(SummonSchema),
//         defaultValues: {
//             reason: "",
//             hearingDate: "",
//             hearingTime: "",
//             sr_id: String(sr_id),
//         },
//     });

//     const onSubmit = async (values: z.infer<typeof SummonSchema>) => {
//         try {
//             setIsGeneratingPdf(true);
            
//             // Generate a case number
//             const caseNo = `BC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
            
//             // Create the PDF document
//             const doc = (
//                 <SummonDocument
//                     header={header || "Republic of the Philippines\nCebu City | San Roque Ciudad\nOffice of the Barangay Captain"}
//                     caseNo={caseNo}
//                     complainant={complainant}
//                     accused={accused}
//                     hearingDate={values.hearingDate}
//                     hearingTime={values.hearingTime}
//                 />
//             );
            
//             // Generate PDF blob
//             const blob = await pdf(doc).toBlob();
            
//             // Create download link
//             const url = URL.createObjectURL(blob);
//             const link = document.createElement('a');
//             link.href = url;
//             link.download = `Summon_${caseNo}.pdf`;
//             document.body.appendChild(link);
//             link.click();
            
//             // Clean up
//             setTimeout(() => {
//                 document.body.removeChild(link);
//                 URL.revokeObjectURL(url);
//                 setIsGeneratingPdf(false);
//             }, 100);
            
//             // Now call the API to add the case
//             addCase(values);
            
//         } catch (error) {
//             console.error("Error generating PDF:", error);
//             setIsGeneratingPdf(false);
//         }
//     };

//     return (
//         <div>
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)}>
//                     <div className="space-y-4">
//                         <FormSelect
//                             control={form.control}
//                             name="reason"
//                             label="Reason"
//                             options={reasons}
//                         />

//                         <FormDateTimeInput
//                             control={form.control}
//                             name="hearingDate"
//                             label="Hearing Date"
//                             type="date"
//                         />

//                         <FormDateTimeInput
//                             control={form.control}
//                             name="hearingTime"
//                             label="Hearing Time"
//                             type="time"
//                         />
//                     </div>

//                     <div className="flex justify-end mt-6 gap-2">
//                         <Button type="submit" disabled={isGeneratingPdf}>
//                             {isGeneratingPdf ? "Generating PDF..." : "Save"}
//                         </Button>
//                     </div>
//                 </form>
//             </Form>
//         </div>
//     );
// }

// export default CreateNewSummon;

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

function CreateNewSummon({ sr_id, complainant, accused, incident_type, onSuccess }: {
    sr_id: number;
    complainant: string;
    accused: string[];
    incident_type: string;
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

    const form = useForm<z.infer<typeof SummonSchema>>({
        resolver: zodResolver(SummonSchema),
        defaultValues: {
            reason: "",
            hearingDate: "",
            hearingTime: "",
            sr_id: String(sr_id),
        },
    });

    const registerFonts = (doc: jsPDF) => {
        doc.addFileToVFS('VeraMono-normal.ttf', veraMonoNormal);
        doc.addFont('VeraMono-normal.ttf', 'VeraMono', 'normal');
        doc.addFileToVFS('VeraMono-Bold-bold.ttf', veraMonoBold);
        doc.addFont('VeraMono-Bold-bold.ttf', 'VeraMono', 'bold');
    };

    const generatePdf = async (caseNo: string, hearingDate: string, hearingTime: string) => {
        return new Promise<void>((resolve) => {
            // Convert paper size to jsPDF format
            let pageFormat: [number, number] | string;
            switch(paperSizeSetting) {
                case "legal":
                    pageFormat = [612, 1008]; // 8.5×14 in (in points)
                    break;
                case "letter":
                    pageFormat = [612, 792]; // 8.5×11 in (in points)
                    break;
                case "a4":
                default:
                    pageFormat = "a4"; // Standard A4
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
                doc.text(`BARANGAY CASE NO. : ${caseNo}`, pageWidth - marginValue, yPos, { align: "right" });
                yPos += lineHeight;

                // FOR: aligned right below case number
                doc.text(`FOR: ${incident_type}`, pageWidth - marginValue, yPos, { align: "right" });
                yPos += lineHeight * 2;  // Extra space after header

                // Left-aligned complainant details
                setCurrentFont('bold');
                doc.text(`NAME: ${complainant}`, marginValue, yPos);
                yPos += lineHeight;

                setCurrentFont('normal');
                doc.text(`ADDRESS:`, marginValue, yPos);
                yPos += lineHeight;

                doc.text(`COMPLAINANT/S`, marginValue, yPos);
                yPos += lineHeight * 2;  // Extra space before divider

                // Divider
                setCurrentFont('bold');
                doc.text(`-AGAINST-`, marginValue, yPos);
                yPos += lineHeight * 2;  // Extra space after divider

                // Left-aligned respondent details
                doc.text(`NAME: ${accused.join(", ")}`, marginValue, yPos);
                yPos += lineHeight;

                setCurrentFont('normal');
                doc.text(`ADDRESS:`, marginValue, yPos);
                yPos += lineHeight;

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
                const subtitle = "MEDIATION";
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

                        doc.save(`Summon_${caseNo}.pdf`);
                        resolve();
                    };
                } else {
                    doc.save(`Summon_${caseNo}.pdf`);
                    resolve();
                }
            }
        });
    };

    const onSubmit = async (values: z.infer<typeof SummonSchema>) => {
        try {
            setIsGeneratingPdf(true);
            const caseNo = `BC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
            await generatePdf(caseNo, values.hearingDate, values.hearingTime);
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