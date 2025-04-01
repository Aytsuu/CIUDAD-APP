import React from "react";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import BusinessProfileForm from "./BusinessProfileForm";
import { Card } from "@/components/ui/card/card";
import { useLocation, useNavigate } from "react-router";
import { formatSitio } from "../profilingFormats";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessFormSchema } from "@/form-schema/profiling-schema";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { toast } from "sonner";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Form } from "@/components/ui/form/form";
import { addBusiness } from "../restful-api/profiingPostAPI";
import supabase from "@/utils/supabase";

export default function BusinessFormLayout() {
  // Initializing states
  const navigate = useNavigate();
  const location = useLocation();
  const params = React.useMemo(
    () => location.state?.params || {},
    [location.state]
  );
  const sitio = React.useRef(formatSitio(params));
  const [mediaFiles, setMediaFiles] = React.useState<any[]>([]);
  const [activeVideoId, setActiveVideoId] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const defaultValues = React.useRef(generateDefaultValues(businessFormSchema));
  const form = useForm<z.infer<typeof businessFormSchema>>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: defaultValues.current,
  });

  // Function to handle form submission
  const submit = async () => {
    setIsSubmitting(true);
    const formIsValid = await form.trigger();

    // Validate form
    if (!formIsValid) {
      errorFeedback("Please fill out all required fields");
      return;
    }

    if (mediaFiles.length == 0) {
      errorFeedback("Please submit supporting documents");
      return;
    }

    // File upload
    const [fileItem] = mediaFiles;
    const file = fileItem?.file;
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error } = await supabase.storage
      .from("image-bucket")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data: {publicUrl}} = supabase.storage
      .from('image-bucket')
      .getPublicUrl(filePath)

    // Submit POST request
    const businessInfo = form.getValues();
    const res = await addBusiness(businessInfo, publicUrl);

    if (res) {
      setIsSubmitting(false);
      setMediaFiles([])
      toast("New record created successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        action: {
          label: "View",
          onClick: () => navigate(-1),
        },
      });
      form.reset(defaultValues.current);
    }
  };

  const errorFeedback = React.useCallback((message: string) => {
    setIsSubmitting(false);
    toast(message, {
      icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
    });
  }, []);

  return (
    <LayoutWithBack
      title="Business Form"
      description="Register a new business by filling in essential details such as name, location, 
              and respondent information. Required fields must be completed to submit successfully."
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
            <BusinessProfileForm
              sitio={sitio.current}
              control={form.control}
              isSubmitting={isSubmitting}
              mediaFiles={mediaFiles}
              activeVideoId={activeVideoId}
              setMediaFiles={setMediaFiles}
              setActiveVideoId={setActiveVideoId}
              submit={submit}
            />
          </form>
        </Form>
      </Card>
    </LayoutWithBack>
  );
}
