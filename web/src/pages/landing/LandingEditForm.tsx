import { Button } from "@/components/ui/button/button";
import { FormInput } from "@/components/ui/form/form-input";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import { landingEditFormSchema } from "@/form-schema/landing-page-schema";
import { useInstantFileUpload } from "@/hooks/use-file-upload";
import { RotateCcw } from "lucide-react";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import z from "zod";

export default function LandingEditForm({
  form,
  carousel,
  setCarousel,
}: {
  form: UseFormReturn<z.infer<typeof landingEditFormSchema>>;
  carousel: MediaUploadType;
  setCarousel: React.Dispatch<React.SetStateAction<MediaUploadType>>;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [mediaFiles, setMediaFiles] = React.useState<MediaUploadType>([]);
  const { handleFileChange } = useInstantFileUpload({
    mediaFiles: mediaFiles,
    setMediaFiles: setMediaFiles,
  });

  React.useEffect(() => {
    if (mediaFiles.length > 0) {
      form.setValue(
        "cpt_photo",
        mediaFiles.map((media) => ({
          name: media.name,
          type: media.type,
          file: media.file,
        }))[0] as any,
        { shouldDirty: true }
      );
    }
  }, [mediaFiles]);

  const resetPhoto = () => {
    setMediaFiles([]);
    form.resetField("cpt_photo");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="grid gap-4">
      <div className="mb-4">
        <MediaUpload
          title="Carousel"
          description="Add images that will appear in the rotating carousel banner on your site. Recommended size: 1920×1080 px. Up to 10 images."
          mediaFiles={carousel}
          setMediaFiles={setCarousel}
          acceptableFiles="image"
          maxFiles={10}
        />
      </div>

      <Input
        ref={fileInputRef}
        className="hidden"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        id="cptPhoto"
      />
      <div className="flex gap-4">
        <img
          src={mediaFiles[0]?.url || form.watch("cpt_photo.url")}
          alt="Barangay Captain"
          className="w-[130px] h-[150px] bg-gray-200 rounded-lg"
        />
        <div className="flex flex-col gap-2 mt-4">
          <Label>Barangay Captain Photo</Label>
          <div className="flex gap-2">
            <Button
              className="bg-gray-600 p-0 h-7 w-24 hover:bg-gray-500"
              type="button"
            >
              <Label htmlFor="cptPhoto">Change</Label>
            </Button>
            {mediaFiles.length > 0 && (
              <Button
                className="p-0 h-7 w-10 border-none shadow-none hover:bg-white font-normal"
                variant={"outline"}
                type="button"
                onClick={resetPhoto}
              >
                <RotateCcw />
              </Button>
            )}
          </div>
        </div>
      </div>
      <FormInput
        control={form.control}
        name="cpt_name"
        label="Barangay Captain"
        placeholder="Name/Title of your barangay captain"
      />
      <FormTextArea
        control={form.control}
        name="quote"
        label="Quote"
        rows={4}
      />
      <FormTextArea
        control={form.control}
        name="mission"
        label="Mission"
        rows={4}
      />
      <FormTextArea
        control={form.control}
        name="vision"
        label="Vision"
        rows={4}
      />
      <FormTextArea
        control={form.control}
        name="values"
        label="Values"
        rows={4}
      />
      <FormInput control={form.control} name="contact" label="Contact" />
      <FormInput control={form.control} name="email" label="Email" />
      <FormInput control={form.control} name="address" label="Adress" />
    </div>
  );
}
