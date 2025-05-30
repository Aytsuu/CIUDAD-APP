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








import { useState, useEffect } from "react";
import { Link } from 'react-router';
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {Textarea} from '@/components/ui/textarea.tsx';
import { FormInput } from "@/components/ui/form/form-input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
import { FormSelect } from "@/components/ui/form/form-select";
import {Label} from '../../../../components/ui/label.tsx';
import {Button} from '../../../../components/ui/button/button.tsx';
import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form/form";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import documentTemplateFormSchema from "@/form-schema/council/documentTemlateSchema.tsx";
import TemplatePreview from "./template-preview.tsx";


function TemplateCreateForm() {
    const navigate = useNavigate();
    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);


    const form = useForm<z.infer<typeof documentTemplateFormSchema>>({
        resolver: zodResolver(documentTemplateFormSchema),
        defaultValues: {
            temp_header: "",
            temp_title: "",
            temp_w_sign: false,
            temp_w_seal: false,
            temp_body: "", 
        },
    });

    useEffect(() => {
        if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
            form.setValue('temp_header', mediaFiles[0].publicUrl);
        } else {
            form.setValue('temp_header', 'no-image-url-fetched');
        }
    }, [mediaFiles, form]);


    const handlePreview = () => {
        navigate('/template-preview', {
            state: {
                headerImage: form.watch('temp_header'),
                title: form.watch('temp_title'),
                body: form.watch('temp_body'),
                withSeal: form.watch('temp_w_seal'),
                withSignature: form.watch('temp_w_sign')
            }
        });
    };


    function onSubmit(values: z.infer<typeof documentTemplateFormSchema>) {
        console.log("Values", values);
    }


    return (
        <div className="flex flex-col p-2 min-h-0 h-auto rounded-lg overflow-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                
                    {/* Header + Footer Container */}
                    <div className="flex flex-row gap-12 items-stretch">
                        
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

                        {/* Document Footer Label & Box */}
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
                                            />
                                        </FormControl>
                                        <FormLabel htmlFor="w_sign" className="leading-none">
                                            With Applicant Signature
                                        </FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Title Input */}
                    <FormInput
                        control={form.control}
                        name="temp_title"
                        label="Title"
                        placeholder="Enter Template Title"
                        readOnly={false}
                    />

                    {/* Template Body */}
                    <FormField
                        control={form.control}
                        name="temp_body"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Template Body</FormLabel>
                            <FormControl>
                            <Textarea
                                className="w-full p-2 shadow-sm h-96 mt-[12px] rounded-[5px] resize-none"
                                placeholder="Enter Body"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    {/* Buttons */}
                    <div className="flex justify-end pb-6 pt-6 gap-2">
                        <Button 
                            variant="outline" className="flex items-center gap-2" onClick={handlePreview}
                        >
                            Preview
                        </Button>
                        <Button className="flex items-center gap-2">Save</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
export default TemplateCreateForm;