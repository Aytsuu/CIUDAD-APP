// Import necessary libraries and components
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ARFormSchema } from "@/form-schema/report-schema";
import { Form } from "@/components/ui/form/form";
import ARForm from "./ARForm";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { MediaUploadType } from "@/components/ui/media-upload";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card/card";
import { useLocation } from "react-router";
import { toast } from "sonner";
import { CircleAlert, X } from "lucide-react";
import { useAddAR } from "../queries/reportAdd";
import { useAuth } from "@/context/AuthContext";

// Main component for the DRR AR Form
export default function ARFormLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state]);
  const data = React.useMemo(() => params?.data, [params]);
  const [mediaFiles, setMediaFiles] = React.useState<MediaUploadType>([]);
  const [activeVideoId, setActiveVideoId] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const { mutateAsync: addAR } = useAddAR(); 
  const defaultValues = generateDefaultValues(ARFormSchema)
  const form = useForm<z.infer<typeof ARFormSchema>>({
    resolver: zodResolver(ARFormSchema),
    defaultValues,
  });

  // Function to handle form submission
  const submit = async () => {
    // setIsSubmitting(true);
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

    try {
      const values = form.getValues();
      console.log(data)
      addAR({
        ...values,
        'ir_sitio': data.ir_sitio,
        'ir_street': data.ir_street,
        'staff': user?.staff.staff_id,
        'rt': data.ir_type
      }, {
        onSuccess: () => {
          console.log('Acknowledgement Report Created!')
        }
      })
      
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <LayoutWithBack 
      title="Create Acknowledgement Report" 
      description="Create an acknowledgement report to confirm completion of services or tasks. Upload supporting files, add descriptions, and submit for records."
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
