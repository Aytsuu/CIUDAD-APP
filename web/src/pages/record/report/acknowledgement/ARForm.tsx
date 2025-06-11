import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { ARFormSchema } from "@/form-schema/report-schema";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import { Button } from "@/components/ui/button/button";
import React from "react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { LoadButton } from "@/components/ui/button/load-button";

export default function ARForm({
  form, 
  mediaFiles, 
  isSubmitting,
  activeVideoId,
  setActiveVideoId,
  setMediaFiles,
  submit
} : {
  form: UseFormReturn<z.infer<typeof ARFormSchema>>;
  mediaFiles: MediaUploadType;
  isSubmitting: boolean;
  activeVideoId: string;
  setActiveVideoId: React.Dispatch<React.SetStateAction<string>>;
  setMediaFiles: React.Dispatch<React.SetStateAction<MediaUploadType>>;
  submit: () => void;
}) {
  return (
    <>
      {/* First row: Name, Location, and Sitio fields */}
      <div className="grid grid-cols-4 gap-4">
        <FormInput control={form.control} name="ar_title" label="Name of Incident/Activity" placeholder="Enter incident/activity name" className="col-span-2"/>
        <FormDateTimeInput control={form.control} name="ar_date_started" label="Date Started" type="date"/>
        <FormDateTimeInput control={form.control} name="ar_time_started" label="Time Started" type="time" />
        <FormDateTimeInput control={form.control} name="ar_date_completed" label="Date Completed" type="date"/>
        <FormDateTimeInput control={form.control} name="ar_time_completed" label="Time Completed" type="time" />
      </div>
      <FormTextArea control={form.control} name="ar_action_taken" label="Action Taken"/>

      {/* Image upload field */}
      <div className="w-full">
        <MediaUpload 
          title="Supporting Documents"
          description="Upload documents to support the report"
          mediaFiles={mediaFiles}
          activeVideoId={activeVideoId}
          setActiveVideoId={setActiveVideoId}
          setMediaFiles={setMediaFiles}
        />
      </div>

      {/* Submit button */}
      <div className="flex justify-end mt-8">
        {!isSubmitting ? (<ConfirmationModal 
          trigger={<Button className="w-32">Create Report</Button>}
          title="Confirm Create"
          description="Are you sure you want to create a report?"
          actionLabel="Confirm"
          onClick={submit}
        />) : (
          <LoadButton>Creating...</LoadButton>
        )}
      </div>
    </>
  );
}
