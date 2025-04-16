// Import necessary libraries and components
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ARFormSchema } from "@/form-schema/drr-schema";
import { Form } from "@/components/ui/form/form";
import ARForm from "./ARForm";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { MediaUploadType } from "@/components/ui/media-upload";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card/card";

// Main component for the DRR AR Form
export default function ARFormLayout() {
  // Initialize the form using react-hook-form and Zod for validation
  const [mediaFiles, setMediaFiles] = React.useState<MediaUploadType>([]);
  const [activeVideoId, setActiveVideoId] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const defaultValues = React.useRef(
    generateDefaultValues(ARFormSchema)
  ).current;
  const form = useForm<z.infer<typeof ARFormSchema>>({
    resolver: zodResolver(ARFormSchema),
    defaultValues,
  });

  // Function to handle form submission
  const submit = () => {};

  return (
    <LayoutWithBack title="Create Acknowledgement Report" description="">
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
