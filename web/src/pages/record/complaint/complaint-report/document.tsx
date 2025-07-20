import React, { useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";

interface Document {
  id: string;
  name: string;
  size: number;
  type: "image" | "video" | "document";
  file?: File;
  publicUrl?: string;
  storagePath?: string;
  status?: "uploading" | "uploaded" | "error";
  previewUrl?: string;
}

export const DocumentUploaded = () => {
  const { setValue, watch } = useFormContext();
  const [activeVideoId, setActiveVideoId] = useState("");
  const documents: Document[] = watch("documents") || [];

  const getFileType = (
    mimeTypeOrName: string
  ): "image" | "video" | "document" => {
    if (!mimeTypeOrName) return "document";
    if (mimeTypeOrName.startsWith("image/")) return "image";
    if (mimeTypeOrName.startsWith("video/")) return "video";
    if (/\.(pdf|doc|docx)$/i.test(mimeTypeOrName)) return "document";
    return "document";
  };

  const mediaFiles: MediaUploadType = useMemo(() => {
    return documents
      .filter((doc) => !!doc.file) // Only include documents with a defined file
      .map((doc, index) => {
        const type = doc.type || getFileType(doc.file?.type || doc.name);
        const name = doc.name || doc.file?.name || "unnamed-file";
        const size = doc.size || doc.file?.size || 0;

        let previewUrl = doc.previewUrl || doc.publicUrl;
        if (!previewUrl && doc.file) {
          previewUrl = URL.createObjectURL(doc.file);
        }

        return {
          id: `${name}_${size}_${index}`, // Stable key based on content
          type,
          file: doc.file as File, // Assert file is defined
          name,
          size,
          publicUrl: doc.publicUrl,
          storagePath: doc.storagePath,
          status: doc.status || "uploaded",
          previewUrl,
        };
      });
  }, [documents]);

  const setMediaFiles = (
    newFiles: MediaUploadType | ((prev: MediaUploadType) => MediaUploadType)
  ) => {
    let finalFiles: MediaUploadType;

    if (typeof newFiles === "function") {
      finalFiles = newFiles(mediaFiles);
    } else if (Array.isArray(newFiles)) {
      finalFiles = newFiles;
    } else {
      console.error("Invalid value passed to setMediaFiles:", newFiles);
      return;
    }

    const documentsFormat = finalFiles.map((file, index) => ({
      id: `doc_${Date.now()}_${index}`, // Let MediaUpload handle its own IDs
      name: file.file?.name || "unnamed-file",
      size: file.file?.size || 0,
      type: file.type,
      file: file.file,
      publicUrl: file.publicUrl,
      storagePath: file.storagePath,
      status: file.status || "uploaded",
      previewUrl: file.previewUrl || file.publicUrl,
    }));

    setValue("documents", documentsFormat, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <MediaUpload
        title="Supporting Documents"
        description="Upload images, videos, or documents (PDF, DOC, DOCX) that support your complaint (Max 10MB each)"
        mediaFiles={mediaFiles}
        activeVideoId={activeVideoId}
        setMediaFiles={setMediaFiles}
        setActiveVideoId={setActiveVideoId}
      />
    </div>
  );
};