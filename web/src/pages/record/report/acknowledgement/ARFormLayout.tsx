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
import { useLocation, useNavigate } from "react-router";
import { useAddAR } from "../queries/reportAdd";
import { useAuth } from "@/context/AuthContext";
import {
  showErrorToast,
  showPlainToast,
  showSuccessToast,
} from "@/components/ui/toast";
import { ARFormSchema } from "@/form-schema/report-schema";
import { isEqual } from "lodash";
import { useUpdateAR } from "../queries/reportUpdate";

export default function ARFormLayout() {
  // ============= STATE INITIALIZATION =============
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state]);
  const data = React.useMemo(() => params?.data, [params]);
  const ARInfo = React.useMemo(() => params?.ARInfo, [params]);
  const [mediaFiles, setMediaFiles] = React.useState<MediaUploadType>([]);
  const [activeVideoId, setActiveVideoId] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const { mutateAsync: addAR } = useAddAR();
  const { mutateAsync: updateAR } = useUpdateAR();
  const defaultValues = generateDefaultValues(ARFormSchema);
  const form = useForm<z.infer<typeof ARFormSchema>>({
    resolver: zodResolver(ARFormSchema),
    defaultValues: generateDefaultValues(ARFormSchema),
  });

  // ============= SIDE EFFECTS =============
  React.useEffect(() => {
    if (ARInfo) {
      console.log(ARInfo.ar_files);
      form.reset(
        {
          ar_title: ARInfo.ar_title,
          ar_area: ARInfo.ar_area,
          ar_date_started: ARInfo.ar_date_started,
          ar_time_started: ARInfo.ar_time_started?.split(" ")[0],
          ar_date_completed: ARInfo.ar_date_completed,
          ar_time_completed: ARInfo.ar_time_completed?.split(" ")[0],
          ar_action_taken: ARInfo.ar_action_taken,
          ar_result: ARInfo.ar_result,
        },
        {
          keepDirty: false,
        }
      );

      setMediaFiles(ARInfo.ar_files);
    }
  }, [ARInfo]);

  // ============= HANDLERS =============
  const create = async (
    values: Record<string, any>,
    files: Record<string, any>
  ) => {
    try {
      await addAR({
        ...values,
        ...(data?.ir_id && { ir: data.ir_id }),
        files: files,
        staff: user?.staff?.staff_id,
      });

      showSuccessToast("Report added successfully!");
      setMediaFiles([]);
      form.reset(defaultValues);
      if (data?.ir_id) {
        navigate("/report/incident");
      }
    } catch (err) {
      showErrorToast("Failed to create AR. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = async (
    values: Record<string, any>,
    files?: Record<string, any>
  ) => {
    try {
      await updateAR({
        data: {
          ...values,
          files: files,
        },
        ar_id: ARInfo.id,
      });
      showSuccessToast("Report updated successfully!");
    } catch (err) {
      showErrorToast("Failed to update AR. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle form submission
  const submit = async () => {
    const formIsValid = await form.trigger();

    if (!formIsValid) {
      showErrorToast("Please fill out all required fields");
      return;
    }

    if (mediaFiles.length === 0) {
      showErrorToast("Please upload an image");
      return;
    }

    if (
      ARInfo &&
      !form.formState.isDirty &&
      isEqual(ARInfo.ar_files, mediaFiles)
    ) {
      showPlainToast("No changes made");
      return;
    }

    setIsSubmitting(true);
    const values = form.getValues();
    const files = mediaFiles.map((media) => ({
      name: media.name,
      type: media.type,
      file: media.file,
    }));

    if (ARInfo) {
      await update(
        values,
        isEqual(ARInfo.ar_files, mediaFiles) ? undefined : files
      );
    } else {
      await create(values, files);
    }
  };

  // ============= RENDER =============
  return (
    <LayoutWithBack
      title={`${ARInfo ? "Edit" : "Create"} Acknowledgement Report`}
      description={
        ARInfo
          ? "Update acknowledgement report and make any changes as needed, review before saving."
          : "Create an acknowledgement report to confirm completion of services or tasks. Upload supporting files, add descriptions, and submit for records."
      }
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
              isEdit={ARInfo && true}
            />
          </form>
        </Form>
      </Card>
    </LayoutWithBack>
  );
}
