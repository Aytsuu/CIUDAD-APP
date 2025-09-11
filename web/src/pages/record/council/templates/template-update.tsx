// import { useState, useEffect } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { FormInput } from "@/components/ui/form/form-input";
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
// import { useUpdateTemplate } from "./queries/template-UpdateQueries";
// import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// import { Loader2 } from "lucide-react";


// interface TemplateUpdateFormProps{
//   temp_id: number;
//   temp_email: string;
//   temp_contact_num: string;
//   template_files: {  
//       tf_id: number;
//       tf_url: string;
//   }[];
//   onSuccess?: () => void;
//   onClose?: () => void; 
// }



// function TemplateUpdateForm({
//     temp_id,
//     temp_email,
//     temp_contact_num,
//     template_files,
//     onSuccess,
//     onClose 
//   } : TemplateUpdateFormProps) {

//   const [activeVideoId, setActiveVideoId] = useState<string>("");
//   const [_isConfirmOpen, setIsConfirmOpen] = useState(false);
//   const [_formValues, setFormValues] = useState<z.infer<typeof documentTemplateFormSchema>>();


//   const [mediaFiles, setMediaFiles] = useState<MediaUploadType>(() => {
//       return template_files?.map(file => ({
//           id: `existing-${file.tf_id}`,
//           name: `file-${file.tf_id}`, // You might want to get the actual filename from somewhere
//           type: 'image/jpeg', // Default type or get from your file data
//           url: file.tf_url // Using url instead of publicUrl/previewUrl
//       })) || [];
//   });   


//   const form = useForm<z.infer<typeof documentTemplateFormSchema>>({
//     resolver: zodResolver(documentTemplateFormSchema),
//     defaultValues: {
//       temp_contact_number: temp_contact_num,
//       temp_email: temp_email
//     },
//   });





//   //Update mutation
//   const { mutate: updateTemplateRecord, isPending } = useUpdateTemplate(temp_id, () => {
//       if (onSuccess) onSuccess();
//       if (onClose) onClose();
//   });



//   function onSubmit(values: z.infer<typeof documentTemplateFormSchema>) {

//     const files = mediaFiles.map((media) => ({
//         'id': media.id,
//         'name': media.name,
//         'type': media.type,
//         'file': media.file
//     }))

//     const updatedValues = {
//       ...values,
//       files
//     };

//     updateTemplateRecord(updatedValues);
//     console.log("VALUESSSS UPDATED: ", updatedValues)
//   }


//   const handleSaveClick = () => {
//       setFormValues(form.getValues()); // Store current form values
//       setIsConfirmOpen(true); // Open confirmation modal
//   };

//   const handleConfirmSave = () => {
//       setIsConfirmOpen(false); // Close confirmation modal
//       form.handleSubmit(onSubmit)(); // Call the submit function
//   };


//   return (
//     <>
//         <div className="flex flex-col p-2 min-h-0 h-auto rounded-lg overflow-auto">
//             <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
//                <div className="flex-1">
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

//                 {/* <Button className="flex items-center gap-2">Save</Button> */}
//                 <div className="pt-5 flex justify-end">
//                   <ConfirmationModal
//                       trigger={

//                             <Button onClick={handleSaveClick} disabled={ isPending }>
//                               {isPending ? (
//                                   <>
//                                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                       Saving...
//                                   </>
//                               ) : (
//                                   "Save"
//                               )}
//                             </Button>

//                       }
//                       title="Confirm Save"
//                       description="Are you sure you want to save the changes?"
//                       actionLabel="Confirm"
//                       onClick={handleConfirmSave} // This will be called when the user confirms
//                   />  
//                 </div>
//             </form>
//             </Form>
//         </div>
//     </>  
//   );
// }

// export default TemplateUpdateForm;











import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/components/ui/form/form-input";
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
import { useUpdateTemplate } from "./queries/template-UpdateQueries";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Loader2 } from "lucide-react";

interface TemplateUpdateFormProps {
  temp_id: number;
  temp_email: string;
  temp_contact_num: string;
  template_files: {  
    tf_id: number;
    tf_url: string;
    tf_logoType: string;
    tf_name: string;
  }[];
  onSuccess?: () => void;
  onClose?: () => void; 
}

function TemplateUpdateForm({
  temp_id,
  temp_email,
  temp_contact_num,
  template_files,
  onSuccess,
  onClose 
}: TemplateUpdateFormProps) {
  const [activeVideoId, setActiveVideoId] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Separate initial files by logo type
  const [initialBarangayFiles, _setInitialBarangayFiles] = useState<MediaUploadType>(() => {
    return template_files
      ?.filter(file => file.tf_logoType === "barangayLogo")
      .map(file => ({
        id: `existing-${file.tf_id}`,
        name: file.tf_name || `file-${file.tf_id}`,
        type: 'image/jpeg', // You might want to get actual type from backend
        url: file.tf_url
      })) || [];
  });

  const [initialCityFiles, _setInitialCityFiles] = useState<MediaUploadType>(() => {
    return template_files
      ?.filter(file => file.tf_logoType === "cityLogo")
      .map(file => ({
        id: `existing-${file.tf_id}`,
        name: file.tf_name || `file-${file.tf_id}`,
        type: 'image/jpeg', // You might want to get actual type from backend
        url: file.tf_url
      })) || [];
  });

  // State for current files
  const [barangayFiles, setBarangayFiles] = useState<MediaUploadType>(initialBarangayFiles);
  const [cityFiles, setCityFiles] = useState<MediaUploadType>(initialCityFiles);

  const form = useForm<z.infer<typeof documentTemplateFormSchema>>({
    resolver: zodResolver(documentTemplateFormSchema),
    defaultValues: {
      temp_contact_number: temp_contact_num,
      temp_email: temp_email
    },
  });

  const { mutate: updateTemplateRecord, isPending } = useUpdateTemplate(temp_id, () => {
    if (onSuccess) onSuccess();
    if (onClose) onClose();
    setIsEditing(false);
  });

  function onSubmit(values: z.infer<typeof documentTemplateFormSchema>) {
    const barangayFilesData = barangayFiles.map((media) => ({
      id: media.id,
      name: media.name,
      type: media.type,
      file: media.file,
      logoType: "barangayLogo" as const,
    }));

    const cityFilesData = cityFiles.map((media) => ({
      id: media.id,
      name: media.name,
      type: media.type,
      file: media.file,
      logoType: "cityLogo" as const,
    }));

    const updatedValues = {
      ...values,
      files: barangayFilesData,
      files2: cityFilesData,
    };

    updateTemplateRecord(updatedValues);
  }

  const handleConfirmSave = () => {
    setIsConfirmOpen(false);
    form.handleSubmit(onSubmit)();
  };

  const handleCancel = () => {
    // Reset form values
    form.reset({
      temp_contact_number: temp_contact_num,
      temp_email: temp_email
    });
    
    // Reset media files to initial state
    setBarangayFiles([...initialBarangayFiles]);
    setCityFiles([...initialCityFiles]);
    
    // Exit edit mode
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col p-2 min-h-0 h-auto rounded-lg overflow-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          
          {/* Barangay Logo */}
          <div className="flex-1">
            <MediaUpload
              title="Barangay Logo"
              description="Upload barangay logo"
              mediaFiles={barangayFiles}
              activeVideoId={activeVideoId}
              setMediaFiles={setBarangayFiles}
              setActiveVideoId={setActiveVideoId}
              maxFiles={1}
              hideRemoveButton={!isEditing}
            />  
          </div>

          {/* City Logo */}
          <div className="flex-1">
            <MediaUpload
              title="City Logo"
              description="Upload city logo"
              mediaFiles={cityFiles}
              activeVideoId={activeVideoId}
              setMediaFiles={setCityFiles}
              setActiveVideoId={setActiveVideoId}
              maxFiles={1}
              hideRemoveButton={!isEditing}
            />  
          </div>

          <div className="flex-1">
            <FormInput
              control={form.control}
              name="temp_contact_number"
              label="Contact Number"
              placeholder="Enter Contact Number"
              readOnly={!isEditing}
            />
          </div>  

          <div className="flex-1">
            <FormInput
              control={form.control}
              name="temp_email"
              label="Email"
              placeholder="Enter Email"
              readOnly={!isEditing}
            />
          </div>               

          <div className="pt-5 flex justify-end gap-2">
            {!isEditing ? (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={isPending}
              >
                Edit
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <ConfirmationModal
                  trigger={
                    <Button disabled={isPending}>
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  }
                  open={isConfirmOpen}
                  onOpenChange={setIsConfirmOpen}
                  title="Confirm Save"
                  description="Are you sure you want to save the changes?"
                  actionLabel="Confirm"
                  onClick={handleConfirmSave}
                />  
              </>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

export default TemplateUpdateForm;