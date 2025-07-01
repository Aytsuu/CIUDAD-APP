// Import necessary libraries and components
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
import { Card } from "@/components/ui/card/card";
import { useLocation } from "react-router";
import { toast } from "sonner";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { useAddAR, useAddARFile } from "../queries/reportAdd";
import { useAuth } from "@/context/AuthContext";
import { formatSitio } from "../../profiling/profilingFormats";

// Main component for the DRR AR Form
export default function ARFormLayout() {
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
  const { mutateAsync: addARFile } = useAddARFile(); 
  const defaultValues = generateDefaultValues(getARFormSchema(selected))
  const form = useForm<z.infer<ReturnType<typeof getARFormSchema>>>({
    resolver: zodResolver(getARFormSchema(selected)),
    defaultValues,
  });

  const formattedSitio = React.useMemo(() => formatSitio(sitio) || [], [sitio])

  // Function to handle form submission
  const submit = async () => {
    setIsSubmitting(true);
    const formIsValid = await form.trigger();

    if(!formIsValid){
      setIsSubmitting(false);
      toast("Please fill out all required fields", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
        style: {
          border: '1px solid rgb(225, 193, 193)',
          padding: '16px',
          color: '#b91c1c',
          background: '#fef2f2',
        },
        action: {
          label: <X size={14} className="bg-transparent"/>,
          onClick: () => toast.dismiss(),
        },
      });
      return;
    }

    if(mediaFiles.length === 0) {
      setIsSubmitting(false);
      toast("Please upload an image", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
        style: {
          border: '1px solid rgb(225, 193, 193)',
          padding: '16px',
          color: '#b91c1c',
          background: '#fef2f2',
        },
        action: {
          label: <X size={14} className="bg-transparent"/>,
          onClick: () => toast.dismiss(),
        },
      });
      return;
    }

    const values = form.getValues();
    addAR(selected ? {
      ...values,
      'ir_sitio': data.ir_sitio,
      'ir_street': data.ir_street,
      'ir': data.ir_id,
      'staff': user?.staff?.staff_id,
      'rt': data.ir_type || null
    } : {
      ...values,
      'staff': user?.staff?.staff_id,
    }, {
      onSuccess: (newAR) => {
        const files = mediaFiles.map((media) => ({
          'arf_name': media.file.name,
          'arf_type': media.file.type,
          'arf_path': media.storagePath,
          'arf_url': media.publicUrl,
          'ar': newAR.ar_id,
          'staff': user?.staff?.staff_id
        }))

        addARFile(files, {
          onSuccess: () => {
            toast("Record added successfully", {
              icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
            });
            setIsSubmitting(false);
            setMediaFiles([])
            form.reset(defaultValues);
          }
        });
      },
      onError: () => {
        toast("Failed to create AR. Please try again.", {
          icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
          style: {
            border: '1px solid rgb(225, 193, 193)',
            padding: '16px',
            color: '#b91c1c',
            background: '#fef2f2',
          },
          action: {
            label: <X size={14} className="bg-transparent"/>,
            onClick: () => toast.dismiss(),
          },
        });
        setIsSubmitting(false);
      }
    }) 
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
