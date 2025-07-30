import { useFormContext } from "react-hook-form";
import { MediaUpload } from "@/components/ui/media-upload";
import { MediaUploadType } from "@/components/ui/media-upload";
import { useState } from "react";

export const DocumentUploaded = () => {
  const { watch, setValue } = useFormContext();
  const mediaFiles = watch("documents") as MediaUploadType[] || [];

  const setMediaFiles = (files: MediaUploadType[]) => {
    setValue("documents", files, { shouldValidate: true });
  };

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <MediaUpload
        title="Supporting Documents"
        description="Upload images, videos, or documents (PDF, DOC, DOCX) that support your complaint (Max 10MB each)"
        mediaFiles={mediaFiles}
        setMediaFiles={setMediaFiles}
        activeVideoId={activeVideoId}
        setActiveVideoId={setActiveVideoId}
      />
    </div>
  );
};
