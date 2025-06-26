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
import { CircleAlert, CircleCheck } from "lucide-react";
import { Form } from "@/components/ui/form/form";
import { Type } from "../profilingEnums";
import { useAuth } from "@/context/AuthContext";
import { useAddBusiness } from "../queries/profilingAddQueries";
import { MediaUploadType } from "@/components/ui/media-upload";
import { useSitioList } from "../queries/profilingFetchQueries";
import { useLoading } from "@/context/LoadingContext";
import { useInstantFileUpload } from "@/hooks/use-file-upload";
import { useUpdateBusiness } from "../queries/profilingUpdateQueries";
import { capitalize } from "@/helpers/capitalize";

export default function BusinessFormLayout() {
  // --------------------- STATE INITIALIZATION -----------------------
  const location = useLocation();
  const params = React.useMemo(
    () => location.state?.params || {},
    [location.state]
  );
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
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
  const { mutateAsync: updateBusiness } = useUpdateBusiness();
  const { data: sitioList, isLoading: isLoadingSitio } = useSitioList();
  const formattedSitio = React.useMemo(() => formatSitio(sitioList) || [], [sitioList]);
  const { deleteFile } = useInstantFileUpload({mediaFiles});
  
  // --------------------- SIDE EFFECTS -----------------------
  React.useEffect(() => {
    if(isLoadingSitio) showLoading();
    else hideLoading();
  }, [isLoadingSitio])

  React.useEffect(() => {
    if(formType === Type.Viewing){
      setIsReadOnly(true)
      populateFields()
      setMediaFiles(params?.business?.files);
    } else {
      setIsReadOnly(false)
    }
  }, [formType])

  React.useEffect(() => {
    if(params?.business?.files) {
      setMediaFiles(params?.business?.files);
    }
  }, [params?.business?.files])

  // --------------------- HANDLERS -----------------------
  const populateFields = React.useCallback(() => {
    const businessInfo = params.business
    if(!businessInfo) return;

    const fields = [
      {key: "bus_respondentLname" , value: businessInfo.bus_respondentLname},
      {key: "bus_respondentFname" , value: businessInfo.bus_respondentFname},
      {key: "bus_respondentMname" , value: businessInfo.bus_respondentMname},
      {key: "bus_respondentSex" , value: businessInfo.bus_respondentSex},
      {key: "bus_respondentDob" , value: businessInfo.bus_respondentDob},
      {key: "bus_respondentContact" , value: businessInfo.bus_respondentContact},
      {key: "bus_respondentAddress" , value: businessInfo.bus_respondentAddress},
      {key: "bus_name" , value: businessInfo.bus_name},
      {key: "bus_gross_sales" , value: String(businessInfo.bus_gross_sales)},
      {key: "bus_province" , value: businessInfo.bus_province},
      {key: "bus_city" , value: businessInfo.bus_city},
      {key: "bus_barangay" , value: businessInfo.bus_barangay},
      {key: "bus_street" , value: businessInfo.bus_street},
      {key: "sitio" , value: businessInfo.sitio},
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

    const businessInfo = form.getValues();
    const files = mediaFiles.map((media) => {
      return {
        bf_name: media.file.name,
        bf_type: media.type,
        bf_path: media.storagePath,
        bf_url: media.publicUrl,
      }
    });

    if(formType === Type.Create) {
      addBusiness({
        ...businessInfo,
        staff: user?.staff?.staff_id || "",
        files: files 
      }, {
        onSuccess: () => {
          toast("New record created successfully", {
            icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
          });

          setIsSubmitting(false);
          setMediaFiles([])
          form.reset(defaultValues.current);
        },
        onError: (error) => {
          mediaFiles.map((media) => {
            if(media.storagePath) deleteFile(media.storagePath);
          })
          throw error;
        }
      });
    } else {
      updateBusiness({
        data: {
          ...businessInfo,
          sitio: businessInfo.sitio.toLowerCase(),
          files: files,
          staff: user?.staff?.staff_id || "",
        },
        businessId: params?.business?.bus_id
      }, {
        onSuccess: () => {
          toast("Record updated successfully", {
            icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
          });

          params.business = {
            ...businessInfo,
            bus_id: params?.business?.bus_id,
            sitio: capitalize(businessInfo.sitio)
          }
          params.business.files = mediaFiles

          setIsSubmitting(false);
          setFormType(Type.Viewing);
        },
        onError: (error) => {
          mediaFiles.map((media) => {
            if(!media.storagePath) return;
            if(params?.business?.files.find((file: any) => file.storagePath == media.storagePath)) return;
            deleteFile(media.storagePath);
          })
          throw error;
        }
      })
    }
  };

  const errorFeedback = React.useCallback((message: string) => {
    setIsSubmitting(false);
    toast(message, {
      icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
    });
  }, []);

  return (
    // --------------------- RENDER -----------------------
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
              sitio={formattedSitio}
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
