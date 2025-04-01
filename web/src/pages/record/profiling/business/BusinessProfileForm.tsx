import { z } from "zod";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateInput } from "@/components/ui/form/form-date-input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button/button";
import { LoadButton } from "@/components/ui/button/load-button";
import { Control } from "react-hook-form";
import { businessFormSchema } from "@/form-schema/profiling-schema";
import { MediaUpload } from "@/components/ui/media-upload";
import { ChangeEvent } from "react";

export default function BusinessProfileForm({
  sitio,
  control,
  isSubmitting,
  mediaFiles,
  activeVideoId,
  fileInputRef,
  toggleVideoPlayback,
  handleRemoveMedia,
  handleAddMediaClick,
  handleFileChange

}: {
  sitio: any[];
  control: Control<z.infer<typeof businessFormSchema>>;
  isSubmitting: boolean;
  mediaFiles: any[];
  activeVideoId: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  toggleVideoPlayback: (value: string) => void;
  handleRemoveMedia: (value: string) => void;
  handleAddMediaClick: () => void;
  handleFileChange: (value: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <div className="w-full">
        <Label className="text-lg font-semibold">Respondent Information</Label>
        <p className="text-xs text-black/50 mb-4">
          Fill out all necessary fields
        </p>

        <div className="grid grid-cols-4 gap-4">
          <FormInput
            control={control}
            name="respondentLname"
            label="Last Name"
            placeholder="Enter last name"
          />
          <FormInput
            control={control}
            name="respondentFname"
            label="First Name"
            placeholder="Enter first name"
          />
          <FormInput
            control={control}
            name="respondentMname"
            label="Middle Name"
            placeholder="Enter middle name"
          />
          <FormDateInput
            control={control}
            name="respondentDob"
            label="Date of Birth"
          />
        </div>
      </div>

      <Separator />

      <div className="w-full">
        <Label className="text-lg font-semibold">Business Information</Label>
        <p className="text-xs text-black/50 mb-4">
          Fill out all necessary fields
        </p>

        <div className="grid grid-cols-4 gap-4">
          <FormInput
            control={control}
            name="name"
            label="Business Name"
            placeholder="Enter business name"
          />
          <FormInput
            control={control}
            name="grossSales"
            label="Gross Sales"
            placeholder="Enter gross sales"
          />
          <FormSelect
            control={control}
            name="sitio"
            label="Sitio"
            options={sitio}
          />
          <FormInput
            control={control}
            name="street"
            label="Street Address"
            placeholder="Enter street address"
          />
        </div>
      </div>

      <MediaUpload
        title="Supporting Documents"
        description="Upload supporting documents that verify your reported gross sales. 
              Acceptable files include Official sales receipts or invoices, 
              Bank statements showing business transactions, etc."
        mediaFiles={mediaFiles}
        activeVideoId={activeVideoId}
        fileInputRef={fileInputRef}
        toggleVideoPlayback={toggleVideoPlayback}
        handleRemoveMedia={handleRemoveMedia}
        handleAddMediaClick={handleAddMediaClick}
        handleFileChange={handleFileChange}
      />

      <div className="flex justify-end mt-8">
        {!isSubmitting ? (
          <Button type="submit" className="w-32">
            Register
          </Button>
        ) : (
          <LoadButton>Registering...</LoadButton>
        )}
      </div>
    </>
  );
}
