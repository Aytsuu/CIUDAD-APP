// Import necessary libraries and components
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form/form";
import ARForm from "./ARForm";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { MediaUploadType } from "@/components/ui/media-upload";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card";
import { useLocation } from "react-router";
import { useAddAR } from "../queries/reportAdd";
import { useAuth } from "@/context/AuthContext";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { ARFormSchema } from "@/form-schema/report-schema";

// Main component for the DRR AR Form
export default function ARFormLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state]);
  const data = React.useMemo(() => params?.data, [params]);
  const selected = React.useMemo(() => params?.selected, [params])
  const [mediaFiles, setMediaFiles] = React.useState<MediaUploadType>([]);
  const [activeVideoId, setActiveVideoId] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  
  const { mutateAsync: addAR } = useAddAR(); 
  const defaultValues = generateDefaultValues(ARFormSchema)
  const form = useForm<z.infer<typeof ARFormSchema>>({
    resolver: zodResolver(ARFormSchema),
    defaultValues: generateDefaultValues(ARFormSchema)
  });

  // Function to handle form submission
  const submit = async () => {
    setIsSubmitting(true);
    const formIsValid = await form.trigger();

    if(!formIsValid){
      setIsSubmitting(false);
      showErrorToast("Please fill out all required fields")
      return;
    }

    if(mediaFiles.length === 0) {
      setIsSubmitting(false);
      showErrorToast("Please upload an image")
      return;
    }

    try {
      const values = form.getValues();
      const files = mediaFiles.map((media) => ({
        'name': media.name,
        'type': media.type,
        'file': media.file
      }))

      await addAR({
        ...values,
        ...(data?.ir_id && {'ir': data.ir_id}),
        'files': files,
        'staff': user?.staff?.staff_id,
      }) 
      
      showSuccessToast("Report Added Successfully!")
      setIsSubmitting(false);
      setMediaFiles([])
      form.reset(defaultValues);
    } catch (err) {
      setIsSubmitting(false);
      showErrorToast("Failed to create AR. Please try again.");
    }
  };

  return (
    <LayoutWithBack 
      title="Create Acknowledgement Report"
      description="Create an acknowledgement report to confirm completion of services or tasks. 
                  Upload supporting files, add descriptions, and submit for records."
    >
      <Card className="w-full p-10">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex flex-col gap-8"
          >
            <ARForm
              form={form}
              mediaFiles={mediaFiles}
              isSubmitting={isSubmitting}
              activeVideoId={activeVideoId}
              setActiveVideoId={setActiveVideoId}
              setMediaFiles={setMediaFiles}
              submit={submit}
            />
          </form>
        </Form>
      </Card>
    </LayoutWithBack>
  );
}
