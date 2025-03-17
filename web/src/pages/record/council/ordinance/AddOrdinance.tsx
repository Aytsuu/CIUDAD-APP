//addOrdinance




// "use client"
// import { useState } from 'react';
// import {Input} from '../../../../components/ui/input.tsx';
// import {Label} from '../../../../components/ui/label.tsx';
// import {DatePicker} from '../../../../components/ui/datepicker.tsx';
// import {Textarea} from '../../../../components/ui/textarea.tsx';
// import {Button} from '../../../../components/ui/button.tsx';
// import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { ChevronLeft } from "lucide-react";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//     Accordion,
//     AccordionContent,
//     AccordionItem,
//     AccordionTrigger,
// } from "@/components/ui/accordion";
// import { ArrowLeft } from 'lucide-react';

// import { Link } from 'react-router';


// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import ordinanceFormSchema from '@/form-schema/ordinanceFormSchema.ts';
// import Tiptap from '@/components/ui/tiptap/tiptap.tsx';


// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";



// function AddOrdinancePage() {
//     const form = useForm<z.infer<typeof ordinanceFormSchema>>({
//         resolver: zodResolver(ordinanceFormSchema),
//         mode: 'onChange',
//         defaultValues: {
//             ordTitle: "",        
//             ordDate: "",
//             ordDescription: "",
//             ordAreaOfFocus: [],
//         },
//     });

//     let ordAreaOfFocus = [
//         "Council", "GAD", 
//         "Waste Committee", "Finance"
//     ];

//     const exportToPDF = async (content: string) => {
//         const doc = new jsPDF("p", "mm", "a4"); // A4 size document
//         const element = document.createElement("div");
//         element.innerHTML = content;
//         element.style.width = "210mm"; // A4 width
//         element.style.padding = "20px"; // Add padding for spacing
    
//         document.body.appendChild(element); // Temporarily add element to the DOM
//         const canvas = await html2canvas(element);
//         document.body.removeChild(element); // Remove the element after rendering
    
//         const imgData = canvas.toDataURL("image/png");
//         const imgWidth = 190; // Width inside A4 page
//         const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
    
//         doc.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
//         doc.save("Ordinance_Description.pdf"); // Save as PDF
//     };

//     function onSubmit(values: z.infer<typeof ordinanceFormSchema>) {
//         console.log("Values", values);
//         exportToPDF(values.ordDescription);
//     }


//     return (
//         <div className="flex p-5 w-full mx-auto h-full justify-center">
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                     <div className="text-[#394360] pb-2">
//                         {/* <Link to="/ord-page"><button className="flex items-center gap-2 text-md font-semibold"><ArrowLeft/>Back</button></Link> */}
//                         <Link to="/ord-page">
//                             <Button 
//                                 className="text-black p-2 self-start"
//                                 variant={"outline"}
//                             >
//                                 <ChevronLeft />
//                             </Button>                        
//                         </Link>
//                     </div>

//                     {/* Ordinance Description Field */}
//                     <FormField
//                         control={form.control}
//                         name="ordDescription"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel></FormLabel>
//                                 <FormControl>
//                                     <Tiptap description={field.value} onChange={field.onChange} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />

//                     <div className="flex items-center justify-end pt-5 pb-9">
//                         {/* Dialog with Form Inside */}
//                         <DialogLayout
//                             trigger={
//                                 <div className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-6 py-2 rounded-md cursor-pointer flex items-center">
//                                     Next
//                                 </div>
//                             }
//                             className="max-w-[30%] h-[460px] flex flex-col overflow-auto scrollbar-custom"
//                             title="Ordinance Details"
//                             description="Add details."
//                             mainContent={
//                                 <div>
//                                     {/* Form Inside Dialog */}
//                                     <Form {...form}>
//                                         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                                             {/* Ordinance Title Field */}
//                                             <FormField
//                                                 control={form.control}
//                                                 name="ordTitle"
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel>Ordinance Title</FormLabel>
//                                                         <FormControl>
//                                                             {/* <Input placeholder="Enter Event Title" {...field} /> */}
//                                                             <Textarea
//                                                                 className="w-full p-2 shadow-sm h-20 mt-[12px] rounded-[5px] resize-none"
//                                                                 placeholder="Enter Ordinance Title"
//                                                                 {...field}>
//                                                             </Textarea>                                                            
//                                                         </FormControl>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />

//                                             {/* Date Approved Field */}
//                                             <FormField
//                                                 control={form.control}
//                                                 name="ordDate"
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel>Date Approved</FormLabel>
//                                                         <FormControl>
//                                                             <input type="date" {...field} className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]" />
//                                                         </FormControl>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />

//                                             {/* Categories Field */}
//                                             <Accordion type="single" collapsible>
//                                                 <AccordionItem value="category-list">
//                                                     <AccordionTrigger>Select Area of Focus</AccordionTrigger>
//                                                     <AccordionContent>
//                                                         <div className="space-y-2">
//                                                             {ordAreaOfFocus.map((area, index) => (
//                                                                 <FormField
//                                                                     key={index}
//                                                                     control={form.control}
//                                                                     name="ordAreaOfFocus"
//                                                                     render={({ field }) => {
//                                                                         const selectedCategory = field.value ?? [];
//                                                                         return (
//                                                                             <FormItem className="flex flex-row items-start space-x-3 space-y-0.5">
//                                                                                 <FormControl>
//                                                                                     <Checkbox
//                                                                                         id={`area-${index}`}
//                                                                                         className="h-5 w-5"
//                                                                                         checked={selectedCategory.includes(area)}
//                                                                                         onCheckedChange={(checked) => {
//                                                                                             field.onChange(
//                                                                                                 checked
//                                                                                                     ? [...selectedCategory, area]
//                                                                                                     : selectedCategory.filter((name: string) => name !== area)
//                                                                                             );
//                                                                                         }}
//                                                                                     />
//                                                                                 </FormControl>
//                                                                                 <FormLabel
//                                                                                     htmlFor={`area-${index}`}
//                                                                                     className="cursor-pointer whitespace-normal break-words flex-1"
//                                                                                     style={{ wordBreak: "break-all" }} // Ensures long words break
//                                                                                 >
//                                                                                     {area}
//                                                                                 </FormLabel>
//                                                                             </FormItem>
//                                                                         );
//                                                                     }}
//                                                                 />
//                                                             ))}
//                                                         </div>
//                                                     </AccordionContent>
//                                                 </AccordionItem>
//                                             </Accordion>                                            

//                                             {/* Submit Button (Inside Dialog) */}
//                                             <div className="flex items-center justify-end pt-4">
//                                                 <Button type="submit" className="w-[100px]">
//                                                     Create
//                                                 </Button>
//                                             </div>
//                                         </form>
//                                     </Form>
//                                 </div>
//                             }
//                         />
//                     </div>
//                 </form>
//             </Form>
//         </div>
//     );
// }

// export default AddOrdinancePage;







    // const exportToPDF = async (content: string) => {
    //     // Create a temporary div to hold the HTML content
    //     const element = document.createElement("div");
    //     element.innerHTML = content;

    //     // Apply styles to the temporary div (optional, but recommended)
    //     element.style.whiteSpace = "pre-wrap"; // Preserve spaces and line breaks
    //     element.style.fontFamily = "Arial, sans-serif"; // Match the editor's font
    //     element.style.padding = "96px"; // Add padding for spacing

    //     // Append the element to the DOM (required for html2pdf to work)
    //     document.body.appendChild(element);

    //     // Convert the HTML content to PDF
    //     html2pdf()
    //         .from(element)
    //         .save("Ordinance_Description.pdf")
    //         .then(() => {
    //             // Remove the temporary element after conversion
    //             document.body.removeChild(element);
    //         });
    // };





// "use client"
// import { useState } from 'react';
// import {Input} from '../../../../components/ui/input.tsx';
// import {Label} from '../../../../components/ui/label.tsx';
// import {DatePicker} from '../../../../components/ui/datepicker.tsx';
// import {Textarea} from '../../../../components/ui/textarea.tsx';
// import {Button} from '../../../../components/ui/button.tsx';
// import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { ChevronLeft } from "lucide-react";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//     Accordion,
//     AccordionContent,
//     AccordionItem,
//     AccordionTrigger,
// } from "@/components/ui/accordion";
// import { ArrowLeft } from 'lucide-react';

// import { Link } from 'react-router';


// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import ordinanceFormSchema from '@/form-schema/ordinanceFormSchema.ts';
// import Tiptap from '@/components/ui/tiptap/tiptap.tsx';


// import html2pdf from "html2pdf.js";

    
// function AddOrdinancePage() {
//     const form = useForm<z.infer<typeof ordinanceFormSchema>>({
//         resolver: zodResolver(ordinanceFormSchema),
//         mode: 'onChange',
//         defaultValues: {
//             ordTitle: "",        
//             ordDate: "",
//             ordDescription: "",
//             ordAreaOfFocus: [],
//         },
//     });

//     let ordAreaOfFocus = [
//         "Council", "GAD", 
//         "Waste Committee", "Finance"
//     ];


//     const exportToPDF = async (content: string) => {
//         // Create a temporary div to hold the HTML content
//         const element = document.createElement("div");
//         element.innerHTML = content;
    
//         // Apply styles to ensure page breaks
//         element.style.whiteSpace = "pre-wrap"; // Preserve spaces and line breaks
//         element.style.fontFamily = "Arial, sans-serif"; // Match the editor's font
//         element.style.paddingBottom = "96px"; 
//         element.style.paddingLeft = "96px"; 
    
//         // Append the element to the DOM
//         document.body.appendChild(element);

    
//         // Force page breaks on specific elements
//         const style = document.createElement("style");
//         style.innerHTML = `
//             @media print {
//                 .page-break {
//                     page-break-before: always;
//                     display: block;
//                     height: 0;
//                 }
//             }
//         `;
//         document.head.appendChild(style);
    
//         // Convert the HTML content to PDF
//         html2pdf()
//             .set({
//                 margin: [25.4, 0, 25.4, 25.4], // Adjust margins 25.4-1 inch
//                 pagebreak: { mode: ["css", "legacy"] }, // Enable page breaks
//             })
//             .from(element)
//             .save("Ordinance_Description.pdf")
//             .then(() => {
//                 // Remove the temporary elements after conversion
//                 document.body.removeChild(element);
//                 document.head.removeChild(style);
//             });
//     };



//     function onSubmit(values: z.infer<typeof ordinanceFormSchema>) {
//         console.log("Values", values);
//         exportToPDF(values.ordDescription);
//     }


//     return (
//         <div className="flex p-5 w-full mx-auto h-full justify-center">
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                     <div className="text-[#394360] pb-2">
//                         {/* <Link to="/ord-page"><button className="flex items-center gap-2 text-md font-semibold"><ArrowLeft/>Back</button></Link> */}
//                         <Link to="/ord-page">
//                             <Button 
//                                 className="text-black p-2 self-start"
//                                 variant={"outline"}
//                             >
//                                 <ChevronLeft />
//                             </Button>                        
//                         </Link>
//                     </div>

//                     {/* Ordinance Description Field */}
//                     <FormField
//                         control={form.control}
//                         name="ordDescription"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel></FormLabel>
//                                 <FormControl>
//                                     <Tiptap description={field.value} onChange={field.onChange} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />

//                     <div className="flex items-center justify-end pt-5 pb-9">
//                         {/* Dialog with Form Inside */}
//                         <DialogLayout
//                             trigger={
//                                 <div className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-6 py-2 rounded-md cursor-pointer flex items-center">
//                                     Next
//                                 </div>
//                             }
//                             className="max-w-[30%] h-[460px] flex flex-col overflow-auto scrollbar-custom"
//                             title="Ordinance Details"
//                             description="Add details."
//                             mainContent={
//                                 <div>
//                                     {/* Form Inside Dialog */}
//                                     <Form {...form}>
//                                         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                                             {/* Ordinance Title Field */}
//                                             <FormField
//                                                 control={form.control}
//                                                 name="ordTitle"
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel>Ordinance Title</FormLabel>
//                                                         <FormControl>
//                                                             {/* <Input placeholder="Enter Event Title" {...field} /> */}
//                                                             <Textarea
//                                                                 className="w-full p-2 shadow-sm h-20 mt-[12px] rounded-[5px] resize-none"
//                                                                 placeholder="Enter Ordinance Title"
//                                                                 {...field}>
//                                                             </Textarea>                                                            
//                                                         </FormControl>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />

//                                             {/* Date Approved Field */}
//                                             <FormField
//                                                 control={form.control}
//                                                 name="ordDate"
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel>Date Approved</FormLabel>
//                                                         <FormControl>
//                                                             <input type="date" {...field} className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]" />
//                                                         </FormControl>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />

//                                             {/* Categories Field */}
//                                             <Accordion type="single" collapsible>
//                                                 <AccordionItem value="category-list">
//                                                     <AccordionTrigger>Select Area of Focus</AccordionTrigger>
//                                                     <AccordionContent>
//                                                         <div className="space-y-2">
//                                                             {ordAreaOfFocus.map((area, index) => (
//                                                                 <FormField
//                                                                     key={index}
//                                                                     control={form.control}
//                                                                     name="ordAreaOfFocus"
//                                                                     render={({ field }) => {
//                                                                         const selectedCategory = field.value ?? [];
//                                                                         return (
//                                                                             <FormItem className="flex flex-row items-start space-x-3 space-y-0.5">
//                                                                                 <FormControl>
//                                                                                     <Checkbox
//                                                                                         id={`area-${index}`}
//                                                                                         className="h-5 w-5"
//                                                                                         checked={selectedCategory.includes(area)}
//                                                                                         onCheckedChange={(checked) => {
//                                                                                             field.onChange(
//                                                                                                 checked
//                                                                                                     ? [...selectedCategory, area]
//                                                                                                     : selectedCategory.filter((name: string) => name !== area)
//                                                                                             );
//                                                                                         }}
//                                                                                     />
//                                                                                 </FormControl>
//                                                                                 <FormLabel
//                                                                                     htmlFor={`area-${index}`}
//                                                                                     className="cursor-pointer whitespace-normal break-words flex-1"
//                                                                                     style={{ wordBreak: "break-all" }} // Ensures long words break
//                                                                                 >
//                                                                                     {area}
//                                                                                 </FormLabel>
//                                                                             </FormItem>
//                                                                         );
//                                                                     }}
//                                                                 />
//                                                             ))}
//                                                         </div>
//                                                     </AccordionContent>
//                                                 </AccordionItem>
//                                             </Accordion>                                            

//                                             {/* Submit Button (Inside Dialog) */}
//                                             <div className="flex items-center justify-end pt-4">
//                                                 <Button type="submit" className="w-[100px]">
//                                                     Create
//                                                 </Button>
//                                             </div>
//                                         </form>
//                                     </Form>
//                                 </div>
//                             }
//                         />
//                     </div>
//                 </form>
//             </Form>
//         </div>
//     );
// }

// export default AddOrdinancePage;









// "use client"
// import { useState } from 'react';
// import {Textarea} from '../../../../components/ui/textarea.tsx';
// import {Button} from '../../../../components/ui/button.tsx';
// import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { ChevronLeft } from "lucide-react";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//     Accordion,
//     AccordionContent,
//     AccordionItem,
//     AccordionTrigger,
// } from "@/components/ui/accordion";

// import { Link } from 'react-router';


// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import ordinanceFormSchema from '@/form-schema/ordinanceFormSchema.ts';
// import Tiptap from '@/components/ui/tiptap/tiptap.tsx';



// import pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
// import { htmlToText } from "html-to-text";
// import cheerio from "cheerio";


    
// function AddOrdinancePage() {
//     const form = useForm<z.infer<typeof ordinanceFormSchema>>({
//         resolver: zodResolver(ordinanceFormSchema),
//         mode: 'onChange',
//         defaultValues: {
//             ordTitle: "",        
//             ordDate: "",
//             ordDescription: "",
//             ordAreaOfFocus: [],
//         },
//     });

//     let ordAreaOfFocus = [
//         "Council", "GAD", 
//         "Waste Committee", "Finance"
//     ];


//     pdfMake.vfs = pdfFonts.vfs;

//     const exportToPDF = (content: string) => {
//         // Convert HTML to plain text while preserving line breaks and spacing
//         const plainTextContent = htmlToText(content, {
//             wordwrap: false, // Prevent word wrapping
//             preserveNewlines: true, // Preserve line breaks
//         });
    
//         // Define the document structure
//         const documentDefinition = {
//             content: [
//                 { text: "Ordinance Description", style: "header" },
//                 { text: plainTextContent, style: "content" },
//             ],
//             styles: {
//                 header: {
//                     fontSize: 18,
//                     bold: true,
//                     margin: [24.5, 24.5, 24.5, 24.5] as [number, number, number, number], // [left, top, right, bottom]
//                 },
//                 content: {
//                     fontSize: 12,
//                     lineHeight: 1.5,
//                 },
//             },
//             defaultStyle: {
//                 font: "Roboto",
//             },
//         };
    
//         // Generate and download the PDF
//         pdfMake.createPdf(documentDefinition).download("Ordinance_Description.pdf");
//     };


//     function onSubmit(values: z.infer<typeof ordinanceFormSchema>) {
//         console.log("Values", values);
//         exportToPDF(values.ordDescription);
//     }


//     return (
//         <div className="flex p-5 w-full mx-auto h-full justify-center">
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                     <div className="text-[#394360] pb-2">
//                         {/* <Link to="/ord-page"><button className="flex items-center gap-2 text-md font-semibold"><ArrowLeft/>Back</button></Link> */}
//                         <Link to="/ord-page">
//                             <Button 
//                                 className="text-black p-2 self-start"
//                                 variant={"outline"}
//                             >
//                                 <ChevronLeft />
//                             </Button>                        
//                         </Link>
//                     </div>

//                     {/* Ordinance Description Field */}
//                     <FormField
//                         control={form.control}
//                         name="ordDescription"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel></FormLabel>
//                                 <FormControl>
//                                     <Tiptap description={field.value} onChange={field.onChange} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />

//                     <div className="flex items-center justify-end pt-5 pb-9">
//                         {/* Dialog with Form Inside */}
//                         <DialogLayout
//                             trigger={
//                                 <div className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-6 py-2 rounded-md cursor-pointer flex items-center">
//                                     Next
//                                 </div>
//                             }
//                             className="max-w-[30%] h-[460px] flex flex-col overflow-auto scrollbar-custom"
//                             title="Ordinance Details"
//                             description="Add details."
//                             mainContent={
//                                 <div>
//                                     {/* Form Inside Dialog */}
//                                     <Form {...form}>
//                                         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                                             {/* Ordinance Title Field */}
//                                             <FormField
//                                                 control={form.control}
//                                                 name="ordTitle"
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel>Ordinance Title</FormLabel>
//                                                         <FormControl>
//                                                             {/* <Input placeholder="Enter Event Title" {...field} /> */}
//                                                             <Textarea
//                                                                 className="w-full p-2 shadow-sm h-20 mt-[12px] rounded-[5px] resize-none"
//                                                                 placeholder="Enter Ordinance Title"
//                                                                 {...field}>
//                                                             </Textarea>                                                            
//                                                         </FormControl>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />

//                                             {/* Date Approved Field */}
//                                             <FormField
//                                                 control={form.control}
//                                                 name="ordDate"
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel>Date Approved</FormLabel>
//                                                         <FormControl>
//                                                             <input type="date" {...field} className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]" />
//                                                         </FormControl>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />

//                                             {/* Categories Field */}
//                                             <Accordion type="single" collapsible>
//                                                 <AccordionItem value="category-list">
//                                                     <AccordionTrigger>Select Area of Focus</AccordionTrigger>
//                                                     <AccordionContent>
//                                                         <div className="space-y-2">
//                                                             {ordAreaOfFocus.map((area, index) => (
//                                                                 <FormField
//                                                                     key={index}
//                                                                     control={form.control}
//                                                                     name="ordAreaOfFocus"
//                                                                     render={({ field }) => {
//                                                                         const selectedCategory = field.value ?? [];
//                                                                         return (
//                                                                             <FormItem className="flex flex-row items-start space-x-3 space-y-0.5">
//                                                                                 <FormControl>
//                                                                                     <Checkbox
//                                                                                         id={`area-${index}`}
//                                                                                         className="h-5 w-5"
//                                                                                         checked={selectedCategory.includes(area)}
//                                                                                         onCheckedChange={(checked) => {
//                                                                                             field.onChange(
//                                                                                                 checked
//                                                                                                     ? [...selectedCategory, area]
//                                                                                                     : selectedCategory.filter((name: string) => name !== area)
//                                                                                             );
//                                                                                         }}
//                                                                                     />
//                                                                                 </FormControl>
//                                                                                 <FormLabel
//                                                                                     htmlFor={`area-${index}`}
//                                                                                     className="cursor-pointer whitespace-normal break-words flex-1"
//                                                                                     style={{ wordBreak: "break-all" }} // Ensures long words break
//                                                                                 >
//                                                                                     {area}
//                                                                                 </FormLabel>
//                                                                             </FormItem>
//                                                                         );
//                                                                     }}
//                                                                 />
//                                                             ))}
//                                                         </div>
//                                                     </AccordionContent>
//                                                 </AccordionItem>
//                                             </Accordion>                                            

//                                             {/* Submit Button (Inside Dialog) */}
//                                             <div className="flex items-center justify-end pt-4">
//                                                 <Button type="submit" className="w-[100px]">
//                                                     Create
//                                                 </Button>
//                                             </div>
//                                         </form>
//                                     </Form>
//                                 </div>
//                             }
//                         />
//                     </div>
//                 </form>
//             </Form>
//         </div>
//     );
// }

// export default AddOrdinancePage;








"use client";
import { useState } from "react";
import { Textarea } from "../../../../components/ui/textarea.tsx";
import { Button } from "../../../../components/ui/button.tsx";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { ChevronLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ordinanceFormSchema from "@/form-schema/council/ordinanceFormSchema.ts";

import Tiptap from "@/components/ui/tiptap/tiptap.tsx";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import cheerio from "cheerio";
import { htmlToText } from 'html-to-text';

function AddOrdinancePage() {
    const form = useForm<z.infer<typeof ordinanceFormSchema>>({
        resolver: zodResolver(ordinanceFormSchema),
        mode: "onChange",
        defaultValues: {
            ordTitle: "",
            ordDate: "",
            ordDescription: "",
            ordAreaOfFocus: [],
        },
    });

    let ordAreaOfFocus = ["Council", "GAD", "Waste Committee", "Finance"];

    pdfMake.vfs = pdfFonts.vfs;


    // const exportToPDF = async (content: string) => {
    //     const cheerio = await import('cheerio'); // Dynamic import
    //     const $ = cheerio.load(content);
    //     const pdfContent: any[] = [];
    
    //     $('p, h1, h2, h3, h4, h5, h6').each((index, element) => {
    //         const text = $(element).text();
    //         const alignment = $(element).css('text-align') || 'left';
    
    //         const textItem: any = {
    //             text: text,
    //             alignment: alignment as 'left' | 'center' | 'right' | 'justify',
    //             margin: [0, 5],
    //         };
    
    //         pdfContent.push(textItem);
    //     });
    
    //     const documentDefinition: any = {
    //         content: [
    //             { text: "Ordinance Description", style: "header", alignment: 'center' },
    //             ...pdfContent,
    //         ],
    //         styles: {
    //             header: {
    //                 fontSize: 18,
    //                 bold: true,
    //                 margin: [24.5, 24.5, 24.5, 24.5],
    //             },
    //             content: {
    //                 fontSize: 12,
    //                 lineHeight: 1.5,
    //             },
    //         },
    //         defaultStyle: {
    //             font: "Roboto",
    //         },
    //     };
    
    //     pdfMake.createPdf(documentDefinition).download("Ordinance_Description.pdf");
    // };





    // SAKTOOO

    // const exportToPDF = async (content: string) => {
    //     const cheerio = await import('cheerio'); // Dynamic import
    //     const $ = cheerio.load(content);
    //     const pdfContent: any[] = [];
    
    //     // Iterate through paragraphs and breaks
    //     $('p, h1, h2, h3, h4, h5, h6, br').each((index, element) => {
    //         if ($(element).is('br')) {
    //             // Add a space for each <br> tag
    //             pdfContent.push({ text: '', margin: [0, 10] }); // Adjust margin as needed
    //         } else {
    //             const text = $(element).text();
    //             const alignment = $(element).css('text-align') || 'left';
    
    //             const textItem: any = {
    //                 text: text,
    //                 alignment: alignment as 'left' | 'center' | 'right' | 'justify',
    //                 margin: [0, 5], // Adjust margin for paragraphs
    //             };
    
    //             pdfContent.push(textItem);
    //         }
    //     });
    
    //     const documentDefinition: any = {
    //         content: [
    //             { text: "Ordinance Description", style: "header", alignment: 'center' },
    //             ...pdfContent,
    //         ],
    //         styles: {
    //             header: {
    //                 fontSize: 18,
    //                 bold: true,
    //                 margin: [24.5, 24.5, 24.5, 24.5],
    //             },
    //             content: {
    //                 fontSize: 12,
    //                 lineHeight: 1.5,
    //             },
    //         },
    //         defaultStyle: {
    //             font: "Roboto",
    //         },
    //     };
    
    //     pdfMake.createPdf(documentDefinition).download("Ordinance_Description.pdf");
    // };



    const exportToPDF = async (content: string) => {
        const cheerio = await import('cheerio'); // Dynamic import
        const $ = cheerio.load(content);
        const pdfContent: any[] = [];
    
        // Iterate through paragraphs and breaks
        $('p, h1, h2, h3, h4, h5, h6, br').each((index, element) => {
            if ($(element).is('br')) {
                // Add a space for each <br> tag
                pdfContent.push({ text: '', margin: [0, 10] }); // Adjust margin as needed
            } else {
                const text = $(element).text();
                const alignment = $(element).css('text-align') || 'left';
    
                const textItem: any = {
                    text: text,
                    alignment: alignment as 'left' | 'center' | 'right' | 'justify',
                    margin: [0, 5], // Adjust margin for paragraphs
                };
    
                pdfContent.push(textItem);
            }
        });
    
        const documentDefinition: any = {
            pageMargins: [36, 34.5, 36, 34.5], // [left, top, right, bottom] in points  [72,69,72,69]-normal 
            content: [
                ...pdfContent, // Only include the content without the header
            ],
            styles: {
                content: {
                    fontSize: 12,
                    lineHeight: 1.5,
                },
            },
            defaultStyle: {
                font: "Roboto",
            },
        };
    
        console.log("Document Definition:", documentDefinition); // Debug: Log the document definition
    
        pdfMake.createPdf(documentDefinition).download("Ordinance_Description.pdf");
    };


    async function onSubmit(values: z.infer<typeof ordinanceFormSchema>) {
        console.log("Values", values);
        await exportToPDF(values.ordDescription);
    }

    return (
        <div className="flex p-5 w-full mx-auto h-full justify-center">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="text-[#394360] pb-2">
                        <Link to="/ord-page">
                            <Button className="text-black p-2 self-start" variant={"outline"}>
                                <ChevronLeft />
                            </Button>
                        </Link>
                    </div>

                    {/* Ordinance Description Field */}
                    <FormField
                        control={form.control}
                        name="ordDescription"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel></FormLabel>
                                <FormControl>
                                    <Tiptap description={field.value} onChange={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center justify-end pt-5 pb-9">
                        {/* Dialog with Form Inside */}
                        <DialogLayout
                            trigger={
                                <div className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-6 py-2 rounded-md cursor-pointer flex items-center">
                                    Next
                                </div>
                            }
                            className="max-w-[30%] h-[460px] flex flex-col overflow-auto scrollbar-custom"
                            title="Ordinance Details"
                            description="Add details."
                            mainContent={
                                <div>
                                    {/* Form Inside Dialog */}
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                            {/* Ordinance Title Field */}
                                            <FormField
                                                control={form.control}
                                                name="ordTitle"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Ordinance Title</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                className="w-full p-2 shadow-sm h-20 mt-[12px] rounded-[5px] resize-none"
                                                                placeholder="Enter Ordinance Title"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Date Approved Field */}
                                            <FormField
                                                control={form.control}
                                                name="ordDate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Date Approved</FormLabel>
                                                        <FormControl>
                                                            <input
                                                                type="date"
                                                                {...field}
                                                                className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Categories Field */}
                                            {/* <Accordion type="single" collapsible>
                                                <AccordionItem value="category-list">
                                                    <AccordionTrigger>Select Area of Focus</AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="space-y-2">
                                                            {ordAreaOfFocus.map((area, index) => (
                                                                <FormField
                                                                    key={index}
                                                                    control={form.control}
                                                                    name="ordAreaOfFocus"
                                                                    render={({ field }) => {
                                                                        const selectedCategory = field.value ?? [];
                                                                        return (
                                                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0.5">
                                                                                <FormControl>
                                                                                    <Checkbox
                                                                                        id={`area-${index}`}
                                                                                        className="h-5 w-5"
                                                                                        checked={selectedCategory.includes(area)}
                                                                                        onCheckedChange={(checked) => {
                                                                                            field.onChange(
                                                                                                checked
                                                                                                    ? [...selectedCategory, area]
                                                                                                    : selectedCategory.filter((name: string) => name !== area)
                                                                                            );
                                                                                        }}
                                                                                    />
                                                                                </FormControl>
                                                                                <FormLabel
                                                                                    htmlFor={`area-${index}`}
                                                                                    className="cursor-pointer whitespace-normal break-words flex-1"
                                                                                    style={{ wordBreak: "break-all" }}
                                                                                >
                                                                                    {area}
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                        );
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion> */}

                                            <Accordion type="single" collapsible className="w-full">
                                                <AccordionItem value="category-list">
                                                    <AccordionTrigger className="hover:no-underline">
                                                        <div className="flex gap-4">
                                                            Select Area of Focus
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="flex flex-col gap-3">
                                                        <div className="space-y-2">
                                                            {ordAreaOfFocus.map((area, index) => (
                                                                <FormField
                                                                    key={index}
                                                                    control={form.control}
                                                                    name="ordAreaOfFocus"
                                                                    render={({ field }) => {
                                                                        const selectedCategory = field.value ?? [];
                                                                        return (
                                                                            <div className="flex items-center gap-3">
                                                                                <FormControl>
                                                                                    <Checkbox
                                                                                        id={`area-${index}`}
                                                                                        className="h-5 w-5"
                                                                                        checked={selectedCategory.includes(area)}
                                                                                        onCheckedChange={(checked) => {
                                                                                            field.onChange(
                                                                                                checked
                                                                                                    ? [...selectedCategory, area]
                                                                                                    : selectedCategory.filter((name: string) => name !== area)
                                                                                            );
                                                                                        }}
                                                                                    />
                                                                                </FormControl>
                                                                                <FormLabel
                                                                                    htmlFor={`area-${index}`}
                                                                                    className="cursor-pointer"
                                                                                >
                                                                                    {area}
                                                                                </FormLabel>
                                                                            </div>
                                                                        );
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>                                            

                                            {/* Submit Button (Inside Dialog) */}
                                            <div className="flex items-center justify-end pt-4">
                                                <Button type="submit" className="w-[100px]">
                                                    Submit
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </div>
                            }
                        />
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default AddOrdinancePage;
