// import { useState, useEffect } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { FormInput } from "@/components/ui/form/form-input";
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
// import { useTemplateRecord } from "./queries/template-AddQueries";
// import { Loader2 } from "lucide-react";


// function TemplateCreateForm({ onSuccess }: { onSuccess?: () => void }) {
//   const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
//   const [activeVideoId, setActiveVideoId] = useState<string>("");

//   const form = useForm<z.infer<typeof documentTemplateFormSchema>>({
//     resolver: zodResolver(documentTemplateFormSchema),
//     defaultValues: {
//       temp_contact_number: "",
//       temp_email: ""
//     },
//   });

//   //Add mutation
//   const { mutate: createTemplate, isPending } = useTemplateRecord(onSuccess);


//   function onSubmit(values: z.infer<typeof documentTemplateFormSchema>) {

//     const files = mediaFiles.map((media) => ({
//         'name': media.name,
//         'type': media.type,
//         'file': media.file
//     }))

//     const newTemplate = {
//       ...values,
//       files
//     };

//     createTemplate(newTemplate);

//     console.log(newTemplate)
//   }


//   return (
//     <>
//         <div className="flex flex-col p-2 min-h-0 h-auto rounded-lg overflow-auto">
//             <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">                          
//                 <div className="flex-1">
//                   <MediaUpload
//                       title=""
//                       description="Upload barangay logo"
//                       mediaFiles={mediaFiles}
//                       activeVideoId={activeVideoId}
//                       setMediaFiles={setMediaFiles}
//                       setActiveVideoId={setActiveVideoId}
//                       maxFiles={1}
//                   />  
//                 </div>                                                 

//                 <div className="flex-1">
//                   <FormInput
//                     control={form.control}
//                     name="temp_contact_number"
//                     label="Contact Number"
//                     placeholder="Enter Contact Number"
//                     readOnly={false}
//                   />
//                 </div>  

//                 <div className="flex-1">
//                   <FormInput
//                     control={form.control}
//                     name="temp_email"
//                     label="Email"
//                     placeholder="Enter Email"
//                     readOnly={false}
//                   />
//                 </div>                                   

//                 {/* Buttons */}
//                 <div className="flex justify-end pt-6 gap-2">
//                   <Button className="flex items-center gap-2" disabled={ isPending }>
//                     {isPending ? (
//                         <>
//                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                             Submitting...
//                         </>
//                     ) : (
//                         "Submit"
//                     )}
//                   </Button>
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
import { FormInput } from "@/components/ui/form/form-input";
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
import documentTemplateFormSchema from "@/form-schema/council/documentTemplateSchema";
import { useTemplateRecord } from "./queries/template-AddQueries";
import { Loader2 } from "lucide-react";


function TemplateCreateForm({ onSuccess }: { onSuccess?: () => void }) {
  const [barangayLogoFiles, setBarangayLogoFiles] = useState<MediaUploadType>([]);
  const [cityLogoFiles, setCityLogoFiles] = useState<MediaUploadType>([]);
  const [activeVideoId, setActiveVideoId] = useState<string>("");

  const form = useForm<z.infer<typeof documentTemplateFormSchema>>({
    resolver: zodResolver(documentTemplateFormSchema),
    defaultValues: {
      temp_contact_number: "",
      temp_email: ""
    },
  });

  const { mutate: createTemplate, isPending } = useTemplateRecord(onSuccess);

  function onSubmit(values: z.infer<typeof documentTemplateFormSchema>) {
    const files = barangayLogoFiles.map((media) => ({
      name: media.name,
      type: media.type,
      file: media.file,
      logoType: "barangayLogo",
    }));

    const files2 = cityLogoFiles.map((media) => ({
      name: media.name,
      type: media.type,
      file: media.file,
      logoType: "cityLogo",
    }));

    const newTemplate = {
      ...values,
      files,
      files2,
    };

    createTemplate(newTemplate);
    console.log(newTemplate);
  }

  return (
    <div className="flex flex-col p-2 min-h-0 h-auto rounded-lg overflow-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">

          {/* Barangay Logo */}
          <MediaUpload
            title=""
            description="Upload Barangay Logo"
            mediaFiles={barangayLogoFiles}
            activeVideoId={activeVideoId}
            setMediaFiles={setBarangayLogoFiles}
            setActiveVideoId={setActiveVideoId}
            maxFiles={1}
          />

          {/* City Logo */}
          <MediaUpload
            title=""
            description="Upload City Logo"
            mediaFiles={cityLogoFiles}
            activeVideoId={activeVideoId}
            setMediaFiles={setCityLogoFiles}
            setActiveVideoId={setActiveVideoId}
            maxFiles={1}
          />

          <FormInput
            control={form.control}
            name="temp_contact_number"
            label="Contact Number"
            placeholder="Enter Contact Number"
            readOnly={false}
          />

          <FormInput
            control={form.control}
            name="temp_email"
            label="Email"
            placeholder="Enter Email"
            readOnly={false}
          />

          <div className="flex justify-end pt-6 gap-2">
            <Button className="flex items-center gap-2" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default TemplateCreateForm;