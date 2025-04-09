import React from "react";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import BusinessProfileForm from "./BusinessProfileForm";
import { Card } from "@/components/ui/card/card";
import { useLocation } from "react-router";
import { formatSitio } from "../profilingFormats";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessFormSchema } from "@/form-schema/profiling-schema";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import { Form } from "@/components/ui/form/form";
import { Type } from "../profilingEnums";
import { useAuth } from "@/context/AuthContext";
import { useAddBusiness } from "../queries/profilingAddQueries";
import { MediaUploadType } from "@/components/ui/media-upload";

export default function BusinessFormLayout() {
  // Initializing states
  const location = useLocation();
  const params = React.useMemo(
    () => location.state?.params || {},
    [location.state]
  );
  const { user } = useAuth();
  const sitio = React.useRef(formatSitio(params));
  const [mediaFiles, setMediaFiles] = React.useState<MediaUploadType>([]);
  const [activeVideoId, setActiveVideoId] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isReadOnly, setIsReadOnly] = React.useState<boolean>(false)
  const [formType, setFormType] = React.useState<Type>(params.type)
  const defaultValues = React.useRef(generateDefaultValues(businessFormSchema));
  const form = useForm<z.infer<typeof businessFormSchema>>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: defaultValues.current,
  });
  const { mutateAsync: addBusiness } = useAddBusiness();

  React.useEffect(() => {
    if(formType === Type.Viewing){
      setIsReadOnly(true)
      populateFields()
    } else {
      setIsReadOnly(false)
    }
  }, [formType])

  const populateFields = React.useCallback(() => {
    const businessInfo = params.business
    if(!businessInfo) return;

    const fields = [
      {key: "bus_respondentLname" , value: businessInfo.bus_respondentLname},
      {key: "bus_respondentFname" , value: businessInfo.bus_respondentFname},
      {key: "bus_respondentMname" , value: businessInfo.bus_respondentMname},
      {key: "bus_respondentSex" , value: businessInfo.bus_respondentSex},
      {key: "bus_respondentDob" , value: businessInfo.bus_respondentDob},
      {key: "bus_name" , value: businessInfo.bus_name},
      {key: "bus_gross_sales" , value: String(businessInfo.bus_gross_sales)},
      {key: "bus_province" , value: businessInfo.bus_province},
      {key: "bus_city" , value: businessInfo.bus_city},
      {key: "bus_barangay" , value: businessInfo.bus_barangay},
      {key: "bus_street" , value: businessInfo.bus_street},
      {key: "sitio" , value: businessInfo.sitio.sitio_name},
    ]

    fields.forEach(({key, value}) => {
      form.setValue(
        key as keyof z.infer<typeof businessFormSchema>,
        value || ""
      )
    })

    setMediaFiles((prev) => [...prev,])

  }, [params.business])

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

    // Submit POST request
    const businessInfo = form.getValues();
    await addBusiness({
      businessInfo: businessInfo,
      url: "", 
      staffId: user?.staff.staff_id
    });

    setIsSubmitting(false);
    setMediaFiles([])
    form.reset(defaultValues.current);
  };

  const errorFeedback = React.useCallback((message: string) => {
    setIsSubmitting(false);
    toast(message, {
      icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
    });
  }, []);
  
  console.log(mediaFiles)

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
              formType={formType}
              sitio={sitio.current}
              control={form.control}
              isSubmitting={isSubmitting}
              isReadOnly={isReadOnly}
              mediaFiles={mediaFiles}
              activeVideoId={activeVideoId}
              url={params.business?.bus_doc_url}
              setFormType={setFormType}
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
