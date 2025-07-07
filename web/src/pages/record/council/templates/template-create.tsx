// import { useState, useEffect } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import {Textarea} from '@/components/ui/textarea.tsx';
// import { FormInput } from "@/components/ui/form/form-input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { FormTextArea } from "@/components/ui/form/form-text-area";
// import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
// import { FormSelect } from "@/components/ui/form/form-select";
// import {Label} from '../../../../components/ui/label.tsx';
// import {Button} from '../../../../components/ui/button/button.tsx';
// import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form/form";
// import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
// import documentTemplateFormSchema from "@/form-schema/council/documentTemlateSchema.tsx";


// function TemplateCreateForm() {
//     const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
//     const [activeVideoId, setActiveVideoId] = useState<string>("");

//     const form = useForm<z.infer<typeof documentTemplateFormSchema>>({
//         resolver: zodResolver(documentTemplateFormSchema),
//         defaultValues: {
//             temp_title: "",
//             temp_w_sign: false,
//             temp_w_seal: false,
//             temp_body: "", 
//         },
//     });


//     function onSubmit(values: z.infer<typeof documentTemplateFormSchema>) {
//         console.log("Values", values);
//     }

//     // const departmentOptions = [
//     //     { id: "hr", name: "Human Resources" },
//     //     { id: "it", name: "IT Department" },
//     //     { id: "finance", name: "Finance" },
//     // ]

//     return (
//         <div className="flex flex-col p-2 min-h-0 h-auto rounded-lg overflow-auto">
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
//                     <MediaUpload
//                         title=""
//                         description=""
//                         mediaFiles={mediaFiles}
//                         activeVideoId={activeVideoId}
//                         setMediaFiles={setMediaFiles}
//                         setActiveVideoId={setActiveVideoId}
//                     />
                    
//                     {/* <FormComboCheckbox
//                         control={form.control}
//                         name="temp_departments"
//                         label="Document Footer"
//                         options={departmentOptions}
//                         placeholder="Select"
//                         showBadges={true}
//                     /> */}

//                     <div className="">
//                         <FormField
//                             control={form.control}
//                             name="temp_w_seal"
//                             render={({ field }) => (
//                                 <FormItem className="flex flex-row items-start space-x-3 space-y-0">
//                                 <FormControl>
//                                     <Checkbox
//                                     id="w_seal"
//                                     checked={!!field.value}
//                                     onCheckedChange={(checked) => {
//                                         field.onChange(checked);
//                                     }}
//                                     />
//                                 </FormControl>
//                                 <FormLabel htmlFor="w_seal" className="leading-none">
//                                     With Seal
//                                 </FormLabel>
//                                 </FormItem>
//                             )}
//                         />

//                         <FormField
//                             control={form.control}
//                             name="temp_w_sign"
//                             render={({ field }) => (
//                                 <FormItem className="flex flex-row items-start space-x-3 space-y-0">
//                                 <FormControl>
//                                     <Checkbox
//                                     id="w_sign"
//                                     checked={!!field.value}
//                                     onCheckedChange={(checked) => {
//                                         field.onChange(checked);
//                                     }}
//                                     />
//                                 </FormControl>
//                                 <FormLabel htmlFor="w_sign" className="leading-none">
//                                     Sign
//                                 </FormLabel>
//                                 </FormItem>
//                             )}
//                         />
//                     </div>
                    
//                     <FormInput
//                         control={form.control}
//                         name="temp_title"
//                         label="Title"
//                         placeholder="Enter Template Title"
//                         readOnly={false}
//                     />


//                     <FormField
//                         control={form.control}
//                         name="temp_body"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Template Body</FormLabel>
//                                 <FormControl>
//                                     <Textarea
//                                         className="w-full p-2 shadow-sm h-96 mt-[12px] rounded-[5px] resize-none"
//                                         placeholder="Enter Body"
//                                         {...field}
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />  
//                     <div className="flex justify-end pb-6 pt-6 gap-2">
//                         <Button
//                             variant="outline"
//                             className="flex items-center gap-2"
//                         >
//                             Preview
//                         </Button>
//                         <Button className="flex items-center gap-2">Save</Button>
//                     </div>

//                 </form>
//             </Form>
//         </div>
    
//     );
// }
// export default TemplateCreateForm;








//working w/document preview but premature
// import { useState, useEffect } from "react";
// import { Link } from 'react-router';
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import {Textarea} from '@/components/ui/textarea.tsx';
// import { FormInput } from "@/components/ui/form/form-input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { FormTextArea } from "@/components/ui/form/form-text-area";
// import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
// import { FormSelect } from "@/components/ui/form/form-select";
// import {Label} from '../../../../components/ui/label.tsx';
// import {Button} from '../../../../components/ui/button/button.tsx';
// import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form/form";
// import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
// import documentTemplateFormSchema from "@/form-schema/council/documentTemlateSchema.tsx";
// import TemplatePreview from "./template-preview.tsx";

// function TemplateCreateForm() {
//     const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
//     const [activeVideoId, setActiveVideoId] = useState<string>("");
//     const [isPreviewOpen, setIsPreviewOpen] = useState(false);


//     const form = useForm<z.infer<typeof documentTemplateFormSchema>>({
//         resolver: zodResolver(documentTemplateFormSchema),
//         defaultValues: {
//             temp_header: "",
//             temp_title: "",
//             temp_w_sign: false,
//             temp_w_seal: false,
//             temp_body: "", 
//         },
//     });

//     useEffect(() => {
//         if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
//             form.setValue('temp_header', mediaFiles[0].publicUrl);
//         } else {
//             form.setValue('temp_header', 'no-image-url-fetched');
//         }
//     }, [mediaFiles, form]);


//     function onSubmit(values: z.infer<typeof documentTemplateFormSchema>) {
//         console.log("Values", values);
//     }


//     return (
//         <div className="flex flex-col p-2 min-h-0 h-auto rounded-lg overflow-auto">
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                
//                     {/* Header + Footer Container */}
//                     <div className="flex flex-row gap-12 items-stretch">
                        
//                         {/* Document Header */}
//                         <div className="flex flex-col gap-2 w-3/5">
//                             <Label className="mb-1">Document Header</Label>
//                             <MediaUpload
//                                 title=""
//                                 description=""
//                                 mediaFiles={mediaFiles}
//                                 activeVideoId={activeVideoId}
//                                 setMediaFiles={setMediaFiles}
//                                 setActiveVideoId={setActiveVideoId}
//                             />
//                         </div>

//                         {/* Document Footer Label & Box */}
//                         <div className="flex flex-col gap-2 h-80%">
//                             <Label className="mb-1">Document Footer</Label>
//                             <div className="flex flex-col gap-5 p-4 border border-gray-300 rounded-md h-full justify-center">
//                                 <FormField
//                                     control={form.control}
//                                     name="temp_w_seal"
//                                     render={({ field }) => (
//                                         <FormItem className="flex flex-row items-center space-x-3 space-y-0">
//                                         <FormControl>
//                                             <Checkbox
//                                             id="w_seal"
//                                             checked={!!field.value}
//                                             onCheckedChange={(checked) => field.onChange(checked)}
//                                             />
//                                         </FormControl>
//                                         <FormLabel htmlFor="w_seal" className="leading-none">
//                                             With Seal
//                                         </FormLabel>
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="temp_w_sign"
//                                     render={({ field }) => (
//                                         <FormItem className="flex flex-row items-center space-x-3 space-y-0">
//                                         <FormControl>
//                                             <Checkbox
//                                             id="w_sign"
//                                             checked={!!field.value}
//                                             onCheckedChange={(checked) => field.onChange(checked)}
//                                             />
//                                         </FormControl>
//                                         <FormLabel htmlFor="w_sign" className="leading-none">
//                                             With Applicant Signature
//                                         </FormLabel>
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Title Input */}
//                     <FormInput
//                         control={form.control}
//                         name="temp_title"
//                         label="Title"
//                         placeholder="Enter Template Title"
//                         readOnly={false}
//                     />

//                     {/* Template Body */}
//                     <FormField
//                         control={form.control}
//                         name="temp_body"
//                         render={({ field }) => (
//                         <FormItem>
//                             <FormLabel>Template Body</FormLabel>
//                             <FormControl>
//                             <Textarea
//                                 className="w-full p-2 shadow-sm h-96 mt-[12px] rounded-[5px] resize-none"
//                                 placeholder="Enter Body"
//                                 {...field}
//                             />
//                             </FormControl>
//                             <FormMessage />
//                         </FormItem>
//                         )}
//                     />

//                     {/* Buttons */}
//                     <div className="flex justify-end pb-6 pt-6 gap-2">
//                         <Button 
//                             variant="outline" className="flex items-center gap-2" onClick={() => setIsPreviewOpen(true)}
//                         >
//                             Preview
//                         </Button>
//                         <Button className="flex items-center gap-2">Save</Button>
//                     </div>

//                     {isPreviewOpen && (
//                         <TemplatePreview
//                             headerImage={form.watch('temp_header')}
//                             title={form.watch('temp_title')}
//                             body={form.watch('temp_body')}
//                             withSeal={form.watch('temp_w_seal')}
//                             withSignature={form.watch('temp_w_sign')}
//                             onClose={() => setIsPreviewOpen(false)}
//                         />
//                     )}
//                 </form>
//             </Form>
//         </div>
//     );
// }
// export default TemplateCreateForm;







//LATEST WORKING
// import { useState, useEffect } from "react";
// import { Link } from 'react-router';
// import { useNavigate } from "react-router-dom";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import {Textarea} from '@/components/ui/textarea.tsx';
// import { FormInput } from "@/components/ui/form/form-input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { FormTextArea } from "@/components/ui/form/form-text-area";
// import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
// import { FormSelect } from "@/components/ui/form/form-select";
// import {Label} from '../../../../components/ui/label.tsx';
// import {Button} from '../../../../components/ui/button/button.tsx';
// import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form/form";
// import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
// import documentTemplateFormSchema from "@/form-schema/council/documentTemlateSchema.tsx";
// import TemplatePreview from "./template-preview.tsx";


// function TemplateCreateForm() {
//     const navigate = useNavigate();
//     const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
//     const [activeVideoId, setActiveVideoId] = useState<string>("");
//     const [isPreviewOpen, setIsPreviewOpen] = useState(false);


//     const form = useForm<z.infer<typeof documentTemplateFormSchema>>({
//         resolver: zodResolver(documentTemplateFormSchema),
//         defaultValues: {
//             temp_header: "",
//             temp_title: "",
//             temp_w_sign: false,
//             temp_w_seal: false,
//             temp_body: "", 
//         },
//     });

//     useEffect(() => {
//         if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
//             form.setValue('temp_header', mediaFiles[0].publicUrl);
//         } else {
//             form.setValue('temp_header', 'no-image-url-fetched');
//         }
//     }, [mediaFiles, form]);


//     const handlePreview = () => {
//         navigate('/template-preview', {
//             state: {
//                 headerImage: form.watch('temp_header'),
//                 title: form.watch('temp_title'),
//                 body: form.watch('temp_body'),
//                 withSeal: form.watch('temp_w_seal'),
//                 withSignature: form.watch('temp_w_sign')
//             }
//         });
//     };


//     function onSubmit(values: z.infer<typeof documentTemplateFormSchema>) {
//         console.log("Values", values);
//     }


//     return (
//         <div className="flex flex-col p-2 min-h-0 h-auto rounded-lg overflow-auto">
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                
//                     {/* Header + Footer Container */}
//                     <div className="flex flex-row gap-12 items-stretch">
                        
//                         {/* Document Header */}
//                         <div className="flex flex-col gap-2 w-3/5">
//                             <Label className="mb-1">Document Header</Label>
//                             <MediaUpload
//                                 title=""
//                                 description=""
//                                 mediaFiles={mediaFiles}
//                                 activeVideoId={activeVideoId}
//                                 setMediaFiles={setMediaFiles}
//                                 setActiveVideoId={setActiveVideoId}
//                             />
//                         </div>

//                         {/* Document Footer Label & Box */}
//                         <div className="flex flex-col gap-2 h-80%">
//                             <Label className="mb-1">Document Footer</Label>
//                             <div className="flex flex-col gap-5 p-4 border border-gray-300 rounded-md h-full justify-center">
//                                 <FormField
//                                     control={form.control}
//                                     name="temp_w_seal"
//                                     render={({ field }) => (
//                                         <FormItem className="flex flex-row items-center space-x-3 space-y-0">
//                                         <FormControl>
//                                             <Checkbox
//                                             id="w_seal"
//                                             checked={!!field.value}
//                                             onCheckedChange={(checked) => field.onChange(checked)}
//                                             />
//                                         </FormControl>
//                                         <FormLabel htmlFor="w_seal" className="leading-none">
//                                             With Seal
//                                         </FormLabel>
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="temp_w_sign"
//                                     render={({ field }) => (
//                                         <FormItem className="flex flex-row items-center space-x-3 space-y-0">
//                                         <FormControl>
//                                             <Checkbox
//                                             id="w_sign"
//                                             checked={!!field.value}
//                                             onCheckedChange={(checked) => field.onChange(checked)}
//                                             />
//                                         </FormControl>
//                                         <FormLabel htmlFor="w_sign" className="leading-none">
//                                             With Applicant Signature
//                                         </FormLabel>
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Title Input */}
//                     <FormInput
//                         control={form.control}
//                         name="temp_title"
//                         label="Title"
//                         placeholder="Enter Template Title"
//                         readOnly={false}
//                     />

//                     {/* Template Body */}
//                     <FormField
//                         control={form.control}
//                         name="temp_body"
//                         render={({ field }) => (
//                         <FormItem>
//                             <FormLabel>Template Body</FormLabel>
//                             <FormControl>
//                             <Textarea
//                                 className="w-full p-2 shadow-sm h-96 mt-[12px] rounded-[5px] resize-none"
//                                 placeholder="Enter Body"
//                                 {...field}
//                             />
//                             </FormControl>
//                             <FormMessage />
//                         </FormItem>
//                         )}
//                     />

//                     {/* Buttons */}
//                     <div className="flex justify-end pb-6 pt-6 gap-2">
//                         <Button 
//                             variant="outline" className="flex items-center gap-2" onClick={handlePreview}
//                         >
//                             Preview
//                         </Button>
//                         <Button className="flex items-center gap-2">Save</Button>
//                     </div>
//                 </form>
//             </Form>
//         </div>
//     );
// }
// export default TemplateCreateForm;






// import { useState, useEffect } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { Textarea } from '@/components/ui/textarea';
// import { FormInput } from "@/components/ui/form/form-input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { FormTextArea } from "@/components/ui/form/form-text-area";
// import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
// import { FormSelect } from "@/components/ui/form/form-select";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Label } from '@/components/ui/label';
// import { Button } from '@/components/ui/button/button';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form/form";
// import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
// import documentTemplateFormSchema from "@/form-schema/council/documentTemlateSchema";
// import TemplatePreview from "./template-preview";
// import { Divide } from "lucide-react";

// function TemplateCreateForm() {
//   const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
//   const [activeVideoId, setActiveVideoId] = useState<string>("");
//   const [isPreviewOpen, setIsPreviewOpen] = useState(false);

//   const form = useForm<z.infer<typeof documentTemplateFormSchema>>({
//     resolver: zodResolver(documentTemplateFormSchema),
//     defaultValues: {
//       temp_header: "",
//       temp_title: "",
//       temp_w_sign: false,
//       temp_w_seal: false,
//       temp_body: "",
//     },
//   });

//   useEffect(() => {
//     if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
//       form.setValue('temp_header', mediaFiles[0].publicUrl);
//     } else {
//       form.setValue('temp_header', 'no-image-url-fetched');
//     }
//   }, [mediaFiles, form]);

//   const handlePreview = () => {
//     setIsPreviewOpen(true);
//   };

//   function onSubmit(values: z.infer<typeof documentTemplateFormSchema>) {
//     console.log("Values", values);
//   }

//   return (
//     <div className="flex flex-col p-2 min-h-0 h-auto rounded-lg overflow-auto">
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
//           {/* Header + Footer Container */}
//           <div className="flex flex-row gap-12 items-stretch">
//             {/* Document Header */}
//             <div className="flex flex-col gap-2 w-3/5">
//               <Label className="mb-1">Document Header</Label>
//               <MediaUpload
//                 title=""
//                 description=""
//                 mediaFiles={mediaFiles}
//                 activeVideoId={activeVideoId}
//                 setMediaFiles={setMediaFiles}
//                 setActiveVideoId={setActiveVideoId}
//               />
//             </div>

//             {/* Document Footer */}
//             <div className="flex flex-col gap-2 h-80%">
//               <Label className="mb-1">Document Footer</Label>
//               <div className="flex flex-col gap-5 p-4 border border-gray-300 rounded-md h-full justify-center">
//                 <FormField
//                   control={form.control}
//                   name="temp_w_seal"
//                   render={({ field }) => (
//                     <FormItem className="flex flex-row items-center space-x-3 space-y-0">
//                       <FormControl>
//                         <Checkbox
//                           id="w_seal"
//                           checked={!!field.value}
//                           onCheckedChange={(checked) => field.onChange(checked)}
//                         />
//                       </FormControl>
//                       <FormLabel htmlFor="w_seal" className="leading-none">
//                         With Seal
//                       </FormLabel>
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="temp_w_sign"
//                   render={({ field }) => (
//                     <FormItem className="flex flex-row items-center space-x-3 space-y-0">
//                       <FormControl>
//                         <Checkbox
//                           id="w_sign"
//                           checked={!!field.value}
//                           onCheckedChange={(checked) => field.onChange(checked)}
//                         />
//                       </FormControl>
//                       <FormLabel htmlFor="w_sign" className="leading-none">
//                         With Applicant Signature
//                       </FormLabel>
//                     </FormItem>
//                   )}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Title Input */}
//           <FormInput
//             control={form.control}
//             name="temp_title"
//             label="Title"
//             placeholder="Enter Template Title"
//             readOnly={false}
//           />

//           {/* Template Body */}
//           <FormField
//             control={form.control}
//             name="temp_body"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Template Body</FormLabel>
//                 <FormControl>
//                   <Textarea
//                     className="w-full p-2 shadow-sm h-96 mt-[12px] rounded-[5px] resize-none"
//                     placeholder="Enter Body"
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* Buttons */}
//           <div className="flex justify-end pb-6 pt-6 gap-2">
//             <Button 
//               variant="outline" className="flex items-center gap-2" type="button" onClick={handlePreview}
//             >
//               Preview
//             </Button>
//             <Button className="flex items-center gap-2">Save</Button>
//           </div>
//         </form>
//       </Form>
//     </div>
//   );
// }

// export default TemplateCreateForm;




//BEFORE DIALOG THE PREVIEW
// import { useState, useEffect } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { Textarea } from '@/components/ui/textarea';
// import { FormInput } from "@/components/ui/form/form-input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { FormTextArea } from "@/components/ui/form/form-text-area";
// import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
// import { FormSelect } from "@/components/ui/form/form-select";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Label } from '@/components/ui/label';
// import { Button } from '@/components/ui/button/button';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form/form";
// import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
// import documentTemplateFormSchema from "@/form-schema/council/documentTemlateSchema";
// import TemplatePreview from "./template-preview";

// function TemplateCreateForm() {
//   const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
//   const [activeVideoId, setActiveVideoId] = useState<string>("");
//   const [isPreviewOpen, setIsPreviewOpen] = useState(false);

//   const form = useForm<z.infer<typeof documentTemplateFormSchema>>({
//     resolver: zodResolver(documentTemplateFormSchema),
//     defaultValues: {
//       temp_header: "",
//       temp_title: "",
//       temp_w_sign: false,
//       temp_w_seal: false,
//       temp_body: "",
//     },
//   });

//   useEffect(() => {
//     if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
//       form.setValue('temp_header', mediaFiles[0].publicUrl);
//     } else {
//       form.setValue('temp_header', 'no-image-url-fetched');
//     }
//   }, [mediaFiles, form]);

//   const handlePreview = () => {
//     setIsPreviewOpen(true);
//   };

//   function onSubmit(values: z.infer<typeof documentTemplateFormSchema>) {
//     console.log("Values", values);
//   }

//   return (
//     <>

//         <div className="flex flex-col p-2 min-h-0 h-auto rounded-lg overflow-auto">
//             <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
//                 {/* Header + Footer Container */}
//                 <div className="flex flex-row gap-12 items-stretch">
//                 {/* Document Header */}
//                 <div className="flex flex-col gap-2 w-3/5">
//                     <Label className="mb-1">Document Header</Label>
//                     <MediaUpload
//                     title=""
//                     description=""
//                     mediaFiles={mediaFiles}
//                     activeVideoId={activeVideoId}
//                     setMediaFiles={setMediaFiles}
//                     setActiveVideoId={setActiveVideoId}
//                     />
//                 </div>

//                 {/* Document Footer */}
//                 <div className="flex flex-col gap-2 h-80%">
//                     <Label className="mb-1">Document Footer</Label>
//                     <div className="flex flex-col gap-5 p-4 border border-gray-300 rounded-md h-full justify-center">
//                     <FormField
//                         control={form.control}
//                         name="temp_w_seal"
//                         render={({ field }) => (
//                         <FormItem className="flex flex-row items-center space-x-3 space-y-0">
//                             <FormControl>
//                             <Checkbox
//                                 id="w_seal"
//                                 checked={!!field.value}
//                                 onCheckedChange={(checked) => field.onChange(checked)}
//                             />
//                             </FormControl>
//                             <FormLabel htmlFor="w_seal" className="leading-none">
//                               With Seal
//                             </FormLabel>
//                         </FormItem>
//                         )}
//                     />

//                     <FormField
//                         control={form.control}
//                         name="temp_w_sign"
//                         render={({ field }) => (
//                         <FormItem className="flex flex-row items-center space-x-3 space-y-0">
//                             <FormControl>
//                             <Checkbox
//                                 id="w_sign"
//                                 checked={!!field.value}
//                                 onCheckedChange={(checked) => field.onChange(checked)}
//                             />
//                             </FormControl>
//                             <FormLabel htmlFor="w_sign" className="leading-none">
//                             With Applicant Signature
//                             </FormLabel>
//                         </FormItem>
//                         )}
//                     />
//                     </div>
//                 </div>
//                 </div>

//                 {/* Title Input */}
//                 <FormInput
//                   control={form.control}
//                   name="temp_title"
//                   label="Title"
//                   placeholder="Enter Template Title"
//                   readOnly={false}
//                 />

//                 {/* Template Body */}
//                 <FormField
//                 control={form.control}
//                 name="temp_body"
//                 render={({ field }) => (
//                     <FormItem>
//                     <FormLabel>Template Body</FormLabel>
//                     <FormControl>
//                         <Textarea
//                         className="w-full p-2 shadow-sm h-96 mt-[12px] rounded-[5px] resize-none"
//                         placeholder="Enter Body"
//                         {...field}
//                         />
//                     </FormControl>
//                     <FormMessage />
//                     </FormItem>
//                 )}
//                 />

//                 {/* Buttons */}
//                 <div className="flex justify-end pb-6 pt-6 gap-2">
//                 <Button 
//                     variant="outline" 
//                     className="flex items-center gap-2" 
//                     onClick={handlePreview}
//                     type="button"
//                 >
//                     Preview
//                 </Button>
//                 <Button className="flex items-center gap-2">Save</Button>
//                 </div>
//             </form>
//             </Form>
//         </div>

//         {/* Preview Modal - separate from the form dialog */}
//         {isPreviewOpen && (
//             <TemplatePreview
//             headerImage={form.watch('temp_header')}
//             title={form.watch('temp_title')}
//             body={form.watch('temp_body')}
//             withSeal={form.watch('temp_w_seal')}
//             withSignature={form.watch('temp_w_sign')}
//             onClose={() => setIsPreviewOpen(false)}
//             />
//         )}
//     </>
//   );
// }

// export default TemplateCreateForm;










//LATEST WORKING BUT NOT ACCURATE TAB
// import { useState, useEffect } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { Textarea } from '@/components/ui/textarea';
// import { TextareaTab } from "@/components/ui/textarea-tab";
// import { FormInput } from "@/components/ui/form/form-input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { FormTextArea } from "@/components/ui/form/form-text-area";
// import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
// import { FormSelect } from "@/components/ui/form/form-select";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Label } from '@/components/ui/label';
// import { Button } from '@/components/ui/button/button';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form/form";
// import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
// import documentTemplateFormSchema from "@/form-schema/council/documentTemlateSchema";
// import TemplatePreview from "./template-preview";

// function TemplateCreateForm() {
//   const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
//   const [activeVideoId, setActiveVideoId] = useState<string>("");

//   const form = useForm<z.infer<typeof documentTemplateFormSchema>>({
//     resolver: zodResolver(documentTemplateFormSchema),
//     defaultValues: {
//       temp_header: "",
//       temp_below_headerContent: "",
//       temp_title: "",
//       temp_paperSize: "",
//       temp_w_sign: false,
//       temp_w_seal: false,
//       temp_body: "",
//     },
//   });

//   const isSummonChecked = form.watch('temp_w_summon');

//   useEffect(() => {
//     if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
//       form.setValue('temp_header', mediaFiles[0].publicUrl);
//     } else {
//       form.setValue('temp_header', 'no-image-url-fetched');
//     }
//   }, [mediaFiles, form]);


//   function onSubmit(values: z.infer<typeof documentTemplateFormSchema>) {
//     console.log("Values", values);
//   }


//   return (
//     <>
//         <div className="flex flex-col p-2 min-h-0 h-auto rounded-lg overflow-auto">
//             <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
//                 {/* Header + Footer Container */}
//                 <div className="flex flex-row gap-11 items-stretch">
//                   {/* Document Header */}
//                   <div className="flex flex-col gap-2 w-3/5">
//                       <Label className="mb-1">Document Header</Label>
//                       <MediaUpload
//                         title=""
//                         description=""
//                         mediaFiles={mediaFiles}
//                         activeVideoId={activeVideoId}
//                         setMediaFiles={setMediaFiles}
//                         setActiveVideoId={setActiveVideoId}
//                       />
//                   </div>

//                   {/* Document Footer */}
//                   <div className="flex flex-col gap-2 h-80%">
//                       <Label className="mb-1">Document Footer</Label>
//                       <div className="flex flex-col gap-5 p-4 border border-gray-300 rounded-md h-full justify-center">
//                         <FormField
//                             control={form.control}
//                             name="temp_w_seal"
//                             render={({ field }) => (
//                             <FormItem className="flex flex-row items-center space-x-3 space-y-0">
//                                 <FormControl>
//                                   <Checkbox
//                                       id="w_seal"
//                                       checked={!!field.value}
//                                       onCheckedChange={(checked) => field.onChange(checked)}
//                                       disabled={isSummonChecked}
//                                   />
//                                 </FormControl>
//                                 <FormLabel htmlFor="w_seal" className="leading-none">
//                                   With Seal
//                                 </FormLabel>
//                             </FormItem>
//                             )}
//                         />

//                         <FormField
//                             control={form.control}
//                             name="temp_w_sign"
//                             render={({ field }) => (
//                             <FormItem className="flex flex-row items-center space-x-3 space-y-0">
//                                 <FormControl>
//                                   <Checkbox
//                                       id="w_sign"
//                                       checked={!!field.value}
//                                       onCheckedChange={(checked) => field.onChange(checked)}
//                                       disabled={isSummonChecked}
//                                   />
//                                 </FormControl>
//                                 <FormLabel htmlFor="w_sign" className="leading-none">
//                                   With Applicant Signature
//                                 </FormLabel>
//                             </FormItem>
//                             )}
//                         />

//                         <FormField
//                             control={form.control}
//                             name="temp_w_summon"
//                             render={({ field }) => (
//                             <FormItem className="flex flex-row items-center space-x-3 space-y-0">
//                                 <FormControl>
//                                   <Checkbox
//                                       id="w_summon"
//                                       checked={!!field.value}
//                                       onCheckedChange={(checked) => {
//                                       field.onChange(checked);
//                                       // If summon is checked, uncheck the other two
//                                       if (checked) {
//                                         form.setValue('temp_w_seal', false);
//                                         form.setValue('temp_w_sign', false);
//                                       }
//                                     }}
//                                   />
//                                 </FormControl>
//                                 <FormLabel htmlFor="w_summon" className="leading-none">
//                                   With Summon details
//                                 </FormLabel>
//                             </FormItem>
//                             )}
//                         />
                      
//                       </div>
//                   </div>
//                 </div>


//                 <FormField
//                   control={form.control}
//                   name="temp_below_headerContent"
//                   render={({ field }) => (
//                       <FormItem>
//                       <FormLabel>Additional Details</FormLabel>
//                       <FormControl>
//                           <TextareaTab
//                             className="w-full p-2 shadow-sm h-40 mt-[12px] rounded-[5px] resize-none"
//                             placeholder="Enter additional details above the title"
//                             {...field}
//                           />
//                       </FormControl>
//                       <FormMessage />
//                       </FormItem>
//                   )}
//                 />

//                 {/* Title and Paper Size in same row */}
//                 <div className="flex flex-row gap-2">
//                   <div className="flex-1">
//                     <FormInput
//                       control={form.control}
//                       name="temp_title"
//                       label="Title"
//                       placeholder="Enter Template Title"
//                       readOnly={false}
//                     />
//                   </div>

//                   <div className="flex-1">
//                     <FormSelect
//                       control={form.control}
//                       name="temp_paperSize"
//                       label="Paper Size"
//                       options={[
//                         { id: "a4", name: "A4" },
//                         { id: "letter", name: "Letter" },
//                         { id: "legal", name: "Legal" },
//                       ]}
//                       readOnly={false}
//                     />
//                   </div>
//                 </div>

//                 {/* Template Body */}
//                 <FormField
//                   control={form.control}
//                   name="temp_body"
//                   render={({ field }) => (
//                       <FormItem>
//                       <FormLabel>Template Body</FormLabel>
//                       <FormControl>
//                           <TextareaTab
//                             className="w-full p-2 shadow-sm h-96 mt-[12px] rounded-[5px] resize-none"
//                             placeholder="Enter Body"
//                             {...field}
//                           />
//                       </FormControl>
//                       <FormMessage />
//                       </FormItem>
//                   )}
//                 />

//                 {/* Buttons */}
//                 <div className="flex justify-end pb-6 pt-6 gap-2">
//                 {/* <Button 
//                     variant="outline" 
//                     className="flex items-center gap-2" 
//                     onClick={handlePreview}
//                     type="button"
//                 >
//                     Preview
//                 </Button> */}
//                 <DialogLayout
//                   trigger={
//                     <Button variant="outline" className="flex items-center gap-2">
//                       Preview
//                     </Button>
//                   }
//                   className="max-w-full h-full flex flex-col overflow-auto scrollbar-custom"
//                   title=""
//                   description=""
//                   mainContent={
//                     <div className="w-full h-full">
//                       <TemplatePreview
//                         headerImage={form.watch('temp_header')}
//                         belowHeaderContent={form.watch('temp_below_headerContent')}
//                         title={form.watch('temp_title')}
//                         body={form.watch('temp_body')}
//                         withSeal={form.watch('temp_w_seal')}
//                         withSignature={form.watch('temp_w_sign')}
//                         withSummon={form.watch('temp_w_summon')} 
//                         paperSize={form.watch('temp_paperSize')} 
//                       />
//                     </div>
//                   }
//                 />
//                 <Button className="flex items-center gap-2">Save</Button>
//                 </div>
//             </form>
//             </Form>
//         </div>
//     </>
//   );
// }

// export default TemplateCreateForm;







//LATEST WORKING W/O PURPOSE RATES LIST
// import { useState, useEffect } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { Textarea } from '@/components/ui/textarea';
// import { TextareaTab } from "@/components/ui/textarea-tab";
// import { FormInput } from "@/components/ui/form/form-input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { FormTextArea } from "@/components/ui/form/form-text-area";
// import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
// import { FormSelect } from "@/components/ui/form/form-select";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { getTextareaWidth } from "./width";
// import { Label } from '@/components/ui/label';
// import { Button } from '@/components/ui/button/button';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form/form";
// import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
// import documentTemplateFormSchema from "@/form-schema/council/documentTemlateSchema";
// import TemplatePreview from "./template-preview";
// import { useTemplateRecord } from "./queries/template-AddQueries";



// function TemplateCreateForm({ onSuccess }: { onSuccess?: () => void }) {
//   const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
//   const [activeVideoId, setActiveVideoId] = useState<string>("");

//   const form = useForm<z.infer<typeof documentTemplateFormSchema>>({
//     resolver: zodResolver(documentTemplateFormSchema),
//     defaultValues: {
//       temp_header: "",
//       temp_below_headerContent: "",
//       temp_title: "CERTIFICATION",
//       temp_subtitle: "",
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "",
//       temp_w_sign: false,
//       temp_w_seal: false,
//       temp_w_summon: false,
//       temp_body: "",
//     },
//   });

//   const { mutate: createTemplate } = useTemplateRecord(onSuccess);

//   const isSummonChecked = form.watch('temp_w_summon');

//   useEffect(() => {
//     if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
//       form.setValue('temp_header', mediaFiles[0].publicUrl);
//     } else {
//       form.setValue('temp_header', 'no-image-url-fetched');
//     }
//   }, [mediaFiles, form]);


//   function onSubmit(values: z.infer<typeof documentTemplateFormSchema>) {
//     createTemplate (values);
//   }


//   return (
//     <>
//         <div className="flex flex-col p-2 min-h-0 h-auto rounded-lg overflow-auto">
//             <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">

//                  {/* Filename field*/}               
//                 <FormInput
//                   control={form.control}
//                   name="temp_filename"
//                   label="Filename"
//                   placeholder="Enter Filename"
//                   readOnly={false}
//                 />                
                            
//                 {/* Header + Footer Container */}
//                 <div className="flex flex-row gap-6 items-stretch">
//                   {/* Document Header */}
//                   <div className="flex flex-col gap-2 w-3/5">
//                       <Label className="mb-1">Document Header</Label>
//                       <MediaUpload
//                         title=""
//                         description=""
//                         mediaFiles={mediaFiles}
//                         activeVideoId={activeVideoId}
//                         setMediaFiles={setMediaFiles}
//                         setActiveVideoId={setActiveVideoId}
//                       />
//                   </div>

//                   {/* Document Footer */}
//                   <div className="flex flex-col gap-2 h-80%">
//                       <Label className="mb-1">Document Footer</Label>
//                       <div className="flex flex-col gap-5 p-4 border border-gray-300 rounded-md h-full justify-center">
//                         <FormField
//                             control={form.control}
//                             name="temp_w_seal"
//                             render={({ field }) => (
//                             <FormItem className="flex flex-row items-center space-x-3 space-y-0">
//                                 <FormControl>
//                                   <Checkbox
//                                       id="w_seal"
//                                       checked={!!field.value}
//                                       onCheckedChange={(checked) => field.onChange(checked)}
//                                       disabled={isSummonChecked}
//                                   />
//                                 </FormControl>
//                                 <FormLabel htmlFor="w_seal" className="leading-none">
//                                   With Seal
//                                 </FormLabel>
//                             </FormItem>
//                             )}
//                         />

//                         <FormField
//                             control={form.control}
//                             name="temp_w_sign"
//                             render={({ field }) => (
//                             <FormItem className="flex flex-row items-center space-x-3 space-y-0">
//                                 <FormControl>
//                                   <Checkbox
//                                       id="w_sign"
//                                       checked={!!field.value}
//                                       onCheckedChange={(checked) => field.onChange(checked)}
//                                       disabled={isSummonChecked}
//                                   />
//                                 </FormControl>
//                                 <FormLabel htmlFor="w_sign" className="leading-none">
//                                   With Applicant Signature
//                                 </FormLabel>
//                             </FormItem>
//                             )}
//                         />

//                         <FormField
//                             control={form.control}
//                             name="temp_w_summon"
//                             render={({ field }) => (
//                             <FormItem className="flex flex-row items-center space-x-3 space-y-0">
//                                 <FormControl>
//                                   <Checkbox
//                                       id="w_summon"
//                                       checked={!!field.value}
//                                       onCheckedChange={(checked) => {
//                                       field.onChange(checked);
//                                       // If summon is checked, uncheck the other two
//                                       if (checked) {
//                                         form.setValue('temp_w_seal', false);
//                                         form.setValue('temp_w_sign', false);
//                                       }
//                                     }}
//                                   />
//                                 </FormControl>
//                                 <FormLabel htmlFor="w_summon" className="leading-none">
//                                   With Summon details
//                                 </FormLabel>
//                             </FormItem>
//                             )}
//                         />
                      
//                       </div>
//                   </div>
//                 </div>


//                 <FormField
//                   control={form.control}
//                   name="temp_below_headerContent"
//                   render={({ field }) => (
//                       <FormItem>
//                       <FormLabel>Additional Details</FormLabel>
//                       <FormControl>
//                         <TextareaTab
//                           className="p-2 shadow-sm h-44 mt-[12px] rounded-[5px] resize-none"
//                           style={{ 
//                             width: `${getTextareaWidth(form.watch('temp_paperSize'), form.watch('temp_margin'))}px`,
//                             fontFamily: form.watch('temp_w_summon') ? 'VeraMono' : 'Times New Roman',
//                             fontSize: '10pt' 
//                           }}
//                           placeholder="Enter additional details above the title"
//                           onKeyDown={(e) => {
//                             if (e.key === 'Tab') {
//                               e.preventDefault();
//                               const start = e.currentTarget.selectionStart;
//                               const end = e.currentTarget.selectionEnd;
//                               const value = field.value;
//                               field.onChange(value.substring(0, start) + '    ' + value.substring(end));
//                               setTimeout(() => {
//                                 e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4;
//                               }, 0);
//                             }
//                           }}
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                       </FormItem>
//                   )}
//                 />

//                 {/* Title and Paper Size in same row */}
//                 <div className="flex flex-col gap-4">
//                   <div className="flex flex-row gap-2">
//                     <div className="flex-1">
//                       <FormInput
//                         control={form.control}
//                         name="temp_title"
//                         label="Title"
//                         placeholder="Enter Template Title"
//                         readOnly={false}
//                       />
//                     </div>

//                     <div className="flex-1">
//                       <FormSelect
//                         control={form.control}
//                         name="temp_paperSize"
//                         label="Paper Size"
//                         options={[
//                           { id: "a4", name: "A4" },
//                           { id: "letter", name: "Letter" },
//                           { id: "legal", name: "Legal" },
//                         ]}
//                         readOnly={false}
//                       />
//                     </div>
//                   </div>
                  

//                   <div className="flex flex-row gap-2">
//                     <div className="flex-1">
//                       <FormInput
//                         control={form.control}
//                         name="temp_subtitle"
//                         label="Subtitle"
//                         placeholder="Enter Subtitle (optional)"
//                         readOnly={false}
//                       />
//                     </div>
//                     <div className="flex-1">
//                       <FormSelect
//                         control={form.control}
//                         name="temp_margin"
//                         label="Margin"
//                         options={[
//                           { id: "normal", name: "Normal" },
//                           { id: "narrow", name: "Narrow" },
//                         ]}
//                         readOnly={false}
//                       />
//                     </div>
//                   </div>
//                 </div>


//                 {/* Template Body */}
//                 <FormField
//                   control={form.control}
//                   name="temp_body"
//                   render={({ field }) => (
//                       <FormItem>
//                       <FormLabel>Template Body</FormLabel>
//                       <FormControl>
//                           <TextareaTab
//                             className="p-2 shadow-sm h-96 mt-[12px] rounded-[5px] resize-none"
//                             style={{ 
//                               width: `${getTextareaWidth(form.watch('temp_paperSize'), form.watch('temp_margin'))}px`,
//                               fontFamily: form.watch('temp_w_summon') ? 'VeraMono' : 'Times New Roman',
//                               fontSize: '10pt' 
//                             }}
//                             placeholder="Enter body"
//                             onKeyDown={(e) => {
//                               if (e.key === 'Tab') {
//                                 e.preventDefault();
//                                 const start = e.currentTarget.selectionStart;
//                                 const end = e.currentTarget.selectionEnd;
//                                 const value = field.value;
//                                 field.onChange(value.substring(0, start) + '    ' + value.substring(end));
//                                 setTimeout(() => {
//                                   e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4;
//                                 }, 0);
//                               }
//                             }}
//                             {...field}
//                           />
//                       </FormControl>
//                       <FormMessage />
//                       </FormItem>
//                   )}
//                 />

//                 {/* Buttons */}
//                 <div className="flex justify-end pb-6 pt-6 gap-2">
//                 {/* <Button 
//                     variant="outline" 
//                     className="flex items-center gap-2" 
//                     onClick={handlePreview}
//                     type="button"
//                 >
//                     Preview
//                 </Button> */}
//                 <DialogLayout
//                   trigger={
//                     <Button variant="outline" className="flex items-center gap-2">
//                       Preview
//                     </Button>
//                   }
//                   className="max-w-full h-full flex flex-col overflow-auto scrollbar-custom"
//                   title=""
//                   description=""
//                   mainContent={
//                     <div className="w-full h-full">
//                       <TemplatePreview
//                         headerImage={form.watch('temp_header')}
//                         belowHeaderContent={form.watch('temp_below_headerContent')}
//                         title={form.watch('temp_title')}
//                         subtitle={form.watch('temp_subtitle')}
//                         body={form.watch('temp_body')}
//                         withSeal={form.watch('temp_w_seal')}
//                         withSignature={form.watch('temp_w_sign')}
//                         withSummon={form.watch('temp_w_summon')} 
//                         paperSize={form.watch('temp_paperSize')} 
//                         margin={form.watch('temp_margin')}
//                       />
//                     </div>
//                   }
//                 />
//                 <Button className="flex items-center gap-2">Submit</Button>
//                 </div>
//             </form>
//             </Form>
//         </div>
//     </>
//   );
// }

// export default TemplateCreateForm;







import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from '@/components/ui/textarea';
import { TextareaTab } from "@/components/ui/textarea-tab";
import { FormInput } from "@/components/ui/form/form-input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
import { FormSelect } from "@/components/ui/form/form-select";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { getTextareaWidth } from "./width";
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import documentTemplateFormSchema from "@/form-schema/council/documentTemlateSchema";
import TemplatePreview from "./template-preview";
import { useTemplateRecord } from "./queries/template-AddQueries";
import { useGetPurposeRates } from "./queries/template-FetchQueries";



function TemplateCreateForm({ onSuccess }: { onSuccess?: () => void }) {
  const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
  const [activeVideoId, setActiveVideoId] = useState<string>("");

  const form = useForm<z.infer<typeof documentTemplateFormSchema>>({
    resolver: zodResolver(documentTemplateFormSchema),
    defaultValues: {
      temp_header: "",
      temp_below_headerContent: "",
      temp_title: "CERTIFICATION",
      temp_subtitle: "",
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "",
      temp_w_sign: false,
      temp_w_seal: false,
      temp_w_summon: false,
      temp_body: "",
      selectedPurposeRates: [],
    },
  });

  //Add mutation
  const { mutate: createTemplate } = useTemplateRecord(onSuccess);

  //Fetch mutation
  const { data: purposeRatesList = [] } = useGetPurposeRates();

  console.log("OPTIONS BEFORE FILTER: ", purposeRatesList)

  // const purposeRatesOptions = purposeRatesList.map(purposeList => ({
  //     id: String(purposeList.pr_id),  
  //     name: purposeList.pr_purpose 
  // }));

  const purposeRatesOptions = purposeRatesList.filter(purpose => purpose.pr_is_archive == false).map(purpose => ({
      id: String(purpose.pr_id),  
      name: purpose.pr_purpose 
  }));

  console.log("OPTIONS: ", purposeRatesOptions)



  const isSummonChecked = form.watch('temp_w_summon');

  useEffect(() => {
    if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
      form.setValue('temp_header', mediaFiles[0].publicUrl);
    } else {
      form.setValue('temp_header', 'no-image-url-fetched');
    }
  }, [mediaFiles, form]);


  function onSubmit(values: z.infer<typeof documentTemplateFormSchema>) {
    const selectedIds = values.selectedPurposeRates;

    selectedIds.forEach((id) => {
      const selectedPurpose = purposeRatesOptions.find(p => p.id === id);

      const newTemplate = {
        ...values,
        pr_id: Number(id), // Convert string back to number if needed
        temp_filename: selectedPurpose?.name || `template_${id}`,
      };

      createTemplate(newTemplate);
    });
    console.log(values)
  }


  return (
    <>
        <div className="flex flex-col p-2 min-h-0 h-auto rounded-lg overflow-auto">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">


                <FormComboCheckbox
                    control={form.control}
                    name="selectedPurposeRates"
                    label="Select Purpose"
                    options={purposeRatesOptions}
                />

                {/* Filename field*/}               
                {/* <FormInput
                  control={form.control}
                  name="temp_filename"
                  label="Filename"
                  placeholder="Enter Filename"
                  readOnly={false}
                />                 */}
                            
                {/* Header + Footer Container */}
                <div className="flex flex-row gap-6 items-stretch">
                  {/* Document Header */}
                  <div className="flex flex-col gap-2 w-3/5">
                      <Label className="mb-1">Document Header</Label>
                      <MediaUpload
                        title=""
                        description=""
                        mediaFiles={mediaFiles}
                        activeVideoId={activeVideoId}
                        setMediaFiles={setMediaFiles}
                        setActiveVideoId={setActiveVideoId}
                      />
                  </div>

                  {/* Document Footer */}
                  <div className="flex flex-col gap-2 h-80%">
                      <Label className="mb-1">Document Footer</Label>
                      <div className="flex flex-col gap-5 p-4 border border-gray-300 rounded-md h-full justify-center">
                        <FormField
                            control={form.control}
                            name="temp_w_seal"
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                      id="w_seal"
                                      checked={!!field.value}
                                      onCheckedChange={(checked) => field.onChange(checked)}
                                      disabled={isSummonChecked}
                                  />
                                </FormControl>
                                <FormLabel htmlFor="w_seal" className="leading-none">
                                  With Seal
                                </FormLabel>
                            </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="temp_w_sign"
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                      id="w_sign"
                                      checked={!!field.value}
                                      onCheckedChange={(checked) => field.onChange(checked)}
                                      disabled={isSummonChecked}
                                  />
                                </FormControl>
                                <FormLabel htmlFor="w_sign" className="leading-none">
                                  With Applicant Signature
                                </FormLabel>
                            </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="temp_w_summon"
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                      id="w_summon"
                                      checked={!!field.value}
                                      onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      // If summon is checked, uncheck the other two
                                      if (checked) {
                                        form.setValue('temp_w_seal', false);
                                        form.setValue('temp_w_sign', false);
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel htmlFor="w_summon" className="leading-none">
                                  With Summon details
                                </FormLabel>
                            </FormItem>
                            )}
                        />
                      
                      </div>
                  </div>
                </div>


                <FormField
                  control={form.control}
                  name="temp_below_headerContent"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Additional Details</FormLabel>
                      <FormControl>
                        <TextareaTab
                          className="p-2 shadow-sm h-44 mt-[12px] rounded-[5px] resize-none"
                          style={{ 
                            width: `${getTextareaWidth(form.watch('temp_paperSize'), form.watch('temp_margin'))}px`,
                            fontFamily: form.watch('temp_w_summon') ? 'VeraMono' : 'Times New Roman',
                            fontSize: '10pt' 
                          }}
                          placeholder="Enter additional details above the title"
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              const start = e.currentTarget.selectionStart;
                              const end = e.currentTarget.selectionEnd;
                              const value = field.value;
                              field.onChange(value.substring(0, start) + '    ' + value.substring(end));
                              setTimeout(() => {
                                e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4;
                              }, 0);
                            }
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                />

                {/* Title and Paper Size in same row */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row gap-2">
                    <div className="flex-1">
                      <FormInput
                        control={form.control}
                        name="temp_title"
                        label="Title"
                        placeholder="Enter Template Title"
                        readOnly={false}
                      />
                    </div>

                    <div className="flex-1">
                      <FormSelect
                        control={form.control}
                        name="temp_paperSize"
                        label="Paper Size"
                        options={[
                          { id: "a4", name: "A4" },
                          { id: "letter", name: "Letter" },
                          { id: "legal", name: "Legal" },
                        ]}
                        readOnly={false}
                      />
                    </div>
                  </div>
                  

                  <div className="flex flex-row gap-2">
                    <div className="flex-1">
                      <FormInput
                        control={form.control}
                        name="temp_subtitle"
                        label="Subtitle"
                        placeholder="Enter Subtitle (optional)"
                        readOnly={false}
                      />
                    </div>
                    <div className="flex-1">
                      <FormSelect
                        control={form.control}
                        name="temp_margin"
                        label="Margin"
                        options={[
                          { id: "normal", name: "Normal" },
                          { id: "narrow", name: "Narrow" },
                        ]}
                        readOnly={false}
                      />
                    </div>
                  </div>
                </div>


                {/* Template Body */}
                <FormField
                  control={form.control}
                  name="temp_body"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Template Body</FormLabel>
                      <FormControl>
                          <TextareaTab
                            className="p-2 shadow-sm h-96 mt-[12px] rounded-[5px] resize-none"
                            style={{ 
                              width: `${getTextareaWidth(form.watch('temp_paperSize'), form.watch('temp_margin'))}px`,
                              fontFamily: form.watch('temp_w_summon') ? 'VeraMono' : 'Times New Roman',
                              fontSize: '10pt' 
                            }}
                            placeholder="Enter body"
                            onKeyDown={(e) => {
                              if (e.key === 'Tab') {
                                e.preventDefault();
                                const start = e.currentTarget.selectionStart;
                                const end = e.currentTarget.selectionEnd;
                                const value = field.value;
                                field.onChange(value.substring(0, start) + '    ' + value.substring(end));
                                setTimeout(() => {
                                  e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4;
                                }, 0);
                              }
                            }}
                            {...field}
                          />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                />

                {/* Buttons */}
                <div className="flex justify-end pb-6 pt-6 gap-2">
                {/* <Button 
                    variant="outline" 
                    className="flex items-center gap-2" 
                    onClick={handlePreview}
                    type="button"
                >
                    Preview
                </Button> */}
                <DialogLayout
                  trigger={
                    <Button variant="outline" className="flex items-center gap-2">
                      Preview
                    </Button>
                  }
                  className="max-w-full h-full flex flex-col overflow-auto scrollbar-custom"
                  title=""
                  description=""
                  mainContent={
                    <div className="w-full h-full">
                      <TemplatePreview
                        headerImage={form.watch('temp_header')}
                        belowHeaderContent={form.watch('temp_below_headerContent')}
                        title={form.watch('temp_title')}
                        subtitle={form.watch('temp_subtitle')}
                        body={form.watch('temp_body')}
                        withSeal={form.watch('temp_w_seal')}
                        withSignature={form.watch('temp_w_sign')}
                        withSummon={form.watch('temp_w_summon')} 
                        paperSize={form.watch('temp_paperSize')} 
                        margin={form.watch('temp_margin')}
                      />
                    </div>
                  }
                />
                <Button className="flex items-center gap-2">Submit</Button>
                </div>
            </form>
            </Form>
        </div>
    </>
  );
}

export default TemplateCreateForm;