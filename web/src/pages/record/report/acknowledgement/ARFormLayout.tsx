import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getARFormSchema } from "@/form-schema/report-schema";
import { Form } from "@/components/ui/form/form";
import ARForm from "./ARForm";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { MediaUploadType } from "@/components/ui/media-upload";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router";
import { useAddAR } from "../queries/reportAdd";
import { useAuth } from "@/context/AuthContext";
import { formatSitio } from "../../profiling/ProfilingFormats";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

// Main component for the DRR AR Form
export default function ARFormLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state]);
  const data = React.useMemo(() => params?.data, [params]);
  const sitio = React.useMemo(() => data?.sitio || [], [data])
  const selected = React.useMemo(() => params?.selected, [params])
  const [mediaFiles, setMediaFiles] = React.useState<MediaUploadType>([]);
  const [activeVideoId, setActiveVideoId] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  
  const { mutateAsync: addAR } = useAddAR(); 
  const defaultValues = generateDefaultValues(getARFormSchema(selected))
  const form = useForm<z.infer<ReturnType<typeof getARFormSchema>>>({
    resolver: zodResolver(getARFormSchema(selected)),
    defaultValues,
  });
  console.log(data?.ir_id)

  const formattedSitio = React.useMemo(() => formatSitio(sitio) || [], [sitio])

  // Function to handle form submission
  const submit = async () => {
    const formIsValid = await form.trigger();

    if(!formIsValid){;
      showErrorToast("Please fill out all required fields")
      return;
    }

    if(mediaFiles.length === 0) {
      showErrorToast("Please upload an image")
      return;
    }

    try {
      setIsSubmitting(true);
      const values = form.getValues();
      const files = mediaFiles.map((media) => ({
        'name': media.name,
        'type': media.type,
        'file': media.file
      }))

      await addAR(selected ? {
        ...values,
        'ir_sitio': data.ir_sitio,
        'ir_street': data.ir_street,
        'ir': data.ir_id,
        'staff': user?.staff?.staff_id,
        'rt': data.ir_type || null
      } : {
        ...values,
        'files': files,
        'staff': user?.staff?.staff_id,
      }) 
      
      showSuccessToast("Report Added Successfully!")
      setMediaFiles([])
      form.reset(defaultValues);
      if(data?.ir_id) {
        navigate("/report/incident")
      }
    } catch (err) {
      showErrorToast("Failed to create AR. Please try again.");
    } finally {
      setIsSubmitting(false);
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
              sitio={formattedSitio}
              mediaFiles={mediaFiles}
              isSubmitting={isSubmitting}
              activeVideoId={activeVideoId}
              selected={selected || ""}
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
