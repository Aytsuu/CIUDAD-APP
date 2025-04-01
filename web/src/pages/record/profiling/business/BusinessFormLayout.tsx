import React, { ChangeEvent } from "react";
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

  // Create a ref for the file input
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handler to open file dialog
  const handleAddMediaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handler for file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length > 0) {
      const newMediaFiles = selectedFiles.map((file, index) => {
        // Create URL for preview
        const previewUrl = URL.createObjectURL(file);

        // Determine if file is image or video
        const fileType = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
          ? "video"
          : "document";

        return {
          id: mediaFiles.length + index + 1,
          type: fileType as "image" | "video" | "document",
          url: previewUrl,
          file: file,
          description: file.name,
        };
      });

      setMediaFiles([...mediaFiles, ...newMediaFiles]);
    }

    // Reset input to allow selecting the same file again
    e.target.value = "";
  };

  // Handler to remove a media file
  const handleRemoveMedia = (id: string) => {
    setMediaFiles(mediaFiles.filter((media) => media.id !== id));
    if (activeVideoId === id) {
      setActiveVideoId('');
    }
  };

  // Toggle video playback
  const toggleVideoPlayback = (id: string) => {
    setActiveVideoId(activeVideoId === id ? '' : id);
  };

  // Function to handle form submission
  const submit = React.useCallback(async () => {
    setIsSubmitting(true);
    const formIsValid = await form.trigger();

    // Validate form
    if (!formIsValid) {
      setIsSubmitting(false);
      toast("Please fill out all required fields", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
      return;
    }

    // Submit POST request
    const businessInfo = form.getValues();
    const res = await addBusiness(businessInfo);

    if (res) {
      setIsSubmitting(false);
      toast("New record created successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        action: {
          label: "View",
          onClick: () => navigate(-1),
        },
      });
      form.reset(defaultValues.current);
    }
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
              fileInputRef={fileInputRef}
              toggleVideoPlayback={toggleVideoPlayback}
              handleRemoveMedia={handleRemoveMedia}
              handleAddMediaClick={handleAddMediaClick}
              handleFileChange={handleFileChange}
            />
          </form>
        </Form>
      </Card>
    </LayoutWithBack>
  );
}
