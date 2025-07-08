// // import { useState } from "react";
// // import { Button } from "@/components/ui/button/button";
// // import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
// // import { Form } from "@/components/ui/form/form";
// // import { FormSelect } from "@/components/ui/form/form-select";
// // import SummonSchema from "@/form-schema/summon-schema";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import z from "zod";
// // import { useForm } from "react-hook-form";
// // import { useGetServiceChargeTemplates } from "./queries/summonFetchQueries";
// // import { Skeleton } from "@/components/ui/skeleton";
// // import DialogLayout from "@/components/ui/dialog/dialog-layout";
// // import SummonPreview from "./summon-preview";

// // function CreateNewSummon({ sr_id, onSuccess }: {
// //     sr_id: number, 
// //     onSuccess: () => void
// // }) {
// //     const [openPreview, setOpenPreview] = useState(false);
// //     const { data: templates = [], isLoading } = useGetServiceChargeTemplates();

// //     const reasons = [
// //         { id: "First Hearing", name: "First Hearing" },
// //         { id: "Unresolved", name: "Unresolved" },
// //         { id: "Complainant is Absent/Unavailable", name: "Complainant is Absent/Unavailable" },
// //         { id: "Accused is Absent/Unavailable", name: "Accused is Absent/Unavailable" },
// //     ];

// //     const templateOptions = templates.map(template => ({
// //         id: String(template.temp_id),  
// //         name: template.temp_title
// //     }));
    
// //     const form = useForm<z.infer<typeof SummonSchema>>({
// //         resolver: zodResolver(SummonSchema),
// //         defaultValues: {
// //             reason: "",
// //             hearingDate: "",
// //             hearingTime: "",
// //             sr_id: String(sr_id),
// //             template: ""
// //         },
// //     });

// //     const selectedTemplateId = form.watch("template");
// //     const selectedTemplate = templates.find(t => t.temp_id === Number(selectedTemplateId));

// //     const handleSubmit = async (e: React.FormEvent) => {
// //         e.preventDefault();
// //         const isValid = await form.trigger();
        
// //         if (isValid && selectedTemplate) {
// //             setOpenPreview(true);
// //         }
// //     };

// //     const handleConfirmSave = () => {
// //         setOpenPreview(false);
// //         const values = form.getValues();
// //         console.log('Form Values', values);
// //         // createSummon(values); // Uncomment when ready
// //         // if (onSuccess) onSuccess();
// //     };

// //     const onError = (errors: any) => {
// //         console.log('Form errors:', errors);
// //     };

// //     if (isLoading) {
// //         return (
// //             <div className="space-y-4">
// //                 <Skeleton className="h-10 w-full" />
// //                 <Skeleton className="h-32 w-full" />
// //                 <Skeleton className="h-10 w-full" />
// //                 <Skeleton className="h-10 w-full" />
// //                 <Skeleton className="h-10 w-full" />
// //                 <div className="flex justify-end">
// //                     <Skeleton className="h-10 w-24" />
// //                 </div>
// //             </div>
// //         );
// //     }

// //     return (
// //         <div>
// //             <Form {...form}>
// //                 <form onSubmit={handleSubmit}>
// //                     <div className="space-y-4">
// //                         <FormSelect
// //                             control={form.control}
// //                             name="reason"
// //                             label="Reason"
// //                             options={reasons}
// //                         />

// //                         <FormDateTimeInput
// //                             control={form.control}
// //                             name="hearingDate"
// //                             label="Hearing Date"
// //                             type="date"
// //                         />

// //                         <FormDateTimeInput
// //                             control={form.control}
// //                             name="hearingTime"
// //                             label="Hearing Time"
// //                             type="time"
// //                         />

// //                         <FormSelect
// //                             control={form.control}
// //                             name="template"
// //                             label="Template"
// //                             options={templateOptions}
// //                         />
// //                     </div>

// //                     <div className="flex justify-end mt-6 gap-2">
// //                          <Button type="submit">Save</Button>
// //                     </div>
// //                 </form>
// //             </Form>
// //         </div>
// //     );
// // }

// // export default CreateNewSummon;
// import { useState } from "react";
// import { Button } from "@/components/ui/button/button";
// import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
// import { Form } from "@/components/ui/form/form";
// import { FormSelect } from "@/components/ui/form/form-select";
// import SummonSchema from "@/form-schema/summon-schema";
// import { zodResolver } from "@hookform/resolvers/zod";
// import z from "zod";
// import { useForm } from "react-hook-form";
// import { useGetServiceChargeTemplates } from "./queries/summonFetchQueries";
// import { Skeleton } from "@/components/ui/skeleton";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import SummonPreview from "./summon-preview";
// import { X } from "node_modules/framer-motion/dist/types.d-B50aGbjN";

// function CreateNewSummon({ sr_id, onSuccess }: {
//     sr_id: number, 
//     onSuccess: () => void
// }) {
//     const [openPreview, setOpenPreview] = useState(false);
//     const { data: templates = [], isLoading } = useGetServiceChargeTemplates();

//     const reasons = [
//         { id: "First Hearing", name: "First Hearing" },
//         { id: "Unresolved", name: "Unresolved" },
//         { id: "Complainant is Absent/Unavailable", name: "Complainant is Absent/Unavailable" },
//         { id: "Accused is Absent/Unavailable", name: "Accused is Absent/Unavailable" },
//     ];

//     const templateOptions = templates.map(template => ({
//         id: String(template.temp_id),  
//         name: template.temp_title
//     }));
    
//     const form = useForm<z.infer<typeof SummonSchema>>({
//         resolver: zodResolver(SummonSchema),
//         defaultValues: {
//             reason: "",
//             hearingDate: "",
//             hearingTime: "",
//             sr_id: String(sr_id),
//             // template: ""
//         },
//     });

//     const selectedTemplateId = form.watch("template");
//     const selectedTemplate = templates.find(t => t.temp_id === Number(selectedTemplateId));

//     const handleSubmit = (values: z.infer<typeof SummonSchema>) => {
//        console.log("Selected Template:", selectedTemplate)
//        console.log("Form Values: ", values)
//     };

//     // const handleConfirmSave = () => {
//     //     setOpenPreview(false);
//     //     const values = form.getValues();
//     //     console.log('Form Values', values);
//     //     // createSummon(values); // Uncomment when ready
//     //     // if (onSuccess) onSuccess();
//     // };

  
//     if (isLoading) {
//         return (
//             <div className="space-y-4">
//                 <Skeleton className="h-10 w-full" />
//                 <Skeleton className="h-32 w-full" />
//                 <Skeleton className="h-10 w-full" />
//                 <Skeleton className="h-10 w-full" />
//                 <Skeleton className="h-10 w-full" />
//                 <div className="flex justify-end">
//                     <Skeleton className="h-10 w-24" />
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div>
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(handleSubmit)}>
//                      <div className="space-y-4">
//                          <FormSelect
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

//                         <FormSelect
//                             control={form.control}
//                             name="template"
//                             label="Template"
//                             options={templateOptions}
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


import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import SummonSchema from "@/form-schema/summon-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useForm } from "react-hook-form";
import { useGetServiceChargeTemplates } from "./queries/summonFetchQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { jsPDF } from "jspdf";
import sealImage from "@/assets/images/Seal.png";

function CreateNewSummon({ sr_id, onSuccess }: {
    sr_id: number, 
    onSuccess: () => void
}) {
    const { data: templates = [], isLoading } = useGetServiceChargeTemplates();

    const reasons = [
        { id: "First Hearing", name: "First Hearing" },
        { id: "Unresolved", name: "Unresolved" },
        { id: "Complainant is Absent/Unavailable", name: "Complainant is Absent/Unavailable" },
        { id: "Accused is Absent/Unavailable", name: "Accused is Absent/Unavailable" },
    ];

    const templateOptions = templates.map(template => ({
        id: String(template.temp_id),  
        name: template.temp_title
    }));
    
    const form = useForm<z.infer<typeof SummonSchema>>({
        resolver: zodResolver(SummonSchema),
        defaultValues: {
            reason: "",
            hearingDate: "",
            hearingTime: "",
            sr_id: String(sr_id),
            template: ""
        },
    });

    const selectedTemplateId = form.watch("template");
    const selectedTemplate = templates.find(t => t.temp_id === Number(selectedTemplateId));

    const generateSummonPDF = (template: any, formValues: any) => {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: template.temp_paperSize === "legal" ? [612, 1008] : 
                   template.temp_paperSize === "a4" ? "a4" : [612, 792]
        });

        const marginValue = template.temp_margin === 'narrow' ? 36 : 72;
        let yPos = marginValue;
        const pageWidth = doc.internal.pageSize.getWidth();
        const lineHeight = 14;

        // Replace placeholders in the content
        const processedBody = template.temp_body
            .replace('[date]', formValues.hearingDate)
            .replace('[time]', formValues.hearingTime)
            .replace('[date today]', new Date().toLocaleDateString());

        // Header image
        if (template.temp_header && template.temp_header !== "no-image-url-fetched") {
            try {
                const imageHeight = 130;
                doc.addImage(template.temp_header, "PNG", marginValue, yPos, pageWidth - marginValue * 2, imageHeight);
                yPos += imageHeight + 30;
            } catch (e) {
                console.error("Error adding header image:", e);
            }
        }

        // Below header content
        if (template.temp_below_headerContent) {
            doc.setFontSize(10);
            const belowHeaderLines = doc.splitTextToSize(template.temp_below_headerContent, pageWidth - marginValue * 2);
            belowHeaderLines.forEach(line => {
                doc.text(line, marginValue, yPos);
                yPos += lineHeight;
            });
            yPos += 20;
        }

        // Title
        doc.setFont("times", "bold");
        doc.setFontSize(16);
        const titleWidth = doc.getTextWidth(template.temp_title);
        doc.text(template.temp_title, (pageWidth - titleWidth) / 2, yPos);
        yPos += lineHeight;

        // Subtitle
        if (template.temp_subtitle) {
            doc.setFont("times", "normal");
            doc.setFontSize(9);
            const subtitleWidth = doc.getTextWidth(template.temp_subtitle);
            doc.text(template.temp_subtitle, (pageWidth - subtitleWidth) / 2, yPos);
            yPos += 10;
        }

        // Body content
        doc.setFont("times", "normal");
        doc.setFontSize(10);
        const bodyLines = doc.splitTextToSize(processedBody, pageWidth - marginValue * 2);
        bodyLines.forEach(line => {
            if (yPos + lineHeight > doc.internal.pageSize.getHeight() - marginValue) {
                doc.addPage();
                yPos = marginValue;
            }
            doc.text(line, marginValue, yPos);
            yPos += lineHeight;
        });

        // Footer with signature and seal
        yPos = doc.internal.pageSize.getHeight() - marginValue - 120;
        
        if (template.temp_w_summon) {
            // Summon signature fields
            doc.text("COMPLAINANT ____________________", marginValue, yPos);
            doc.text("RESPONDENT ____________________", marginValue + 250, yPos);
            doc.text("SERVER ____________________", marginValue + 250, yPos + 30);
            
            // Barangay captain info
            doc.setFont("times", "bold");
            doc.text("HON. VIRGINIA N. ABENOJA", marginValue + 250, yPos + 60);
            doc.setFont("times", "normal");
            doc.text("Punong Barangay", marginValue + 290, yPos + 80);
        }

        if (template.temp_w_seal) {
            const sealSize = 80;
            const sealX = pageWidth - marginValue - sealSize - 35;
            const sealY = yPos - 40;
            
            doc.addImage(sealImage, "PNG", sealX, sealY, sealSize, sealSize);
            
            // "NOT VALID WITHOUT SEAL" text
            doc.setTextColor(255, 0, 0);
            doc.setFont("times", "bold");
            doc.text("NOT VALID WITHOUT SEAL", sealX + 5, sealY + sealSize + 15);
            doc.setTextColor(0, 0, 0);
        }

        // Save the PDF
        doc.save(`${template.temp_title.replace(/\s+/g, '_')}_${formValues.sr_id}.pdf`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = await form.trigger();
        
        if (isValid && selectedTemplate) {
            const values = form.getValues();
            generateSummonPDF(selectedTemplate, values);
            onSuccess?.();
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        );
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={handleSubmit}>
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
                            name="template"
                            label="Template"
                            options={templateOptions}
                        />
                    </div>

                    <div className="flex justify-end mt-6 gap-2">
                        <Button type="submit">Generate Summon</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default CreateNewSummon;