import React from 'react';
import { MediaUploadType } from '@/components/ui/media-upload';

export const useInstantFileUpload = ({
    mediaFiles, 
    activeVideoId, 
    setMediaFiles, 
    setActiveVideoId
  } : {
    mediaFiles?: MediaUploadType,
    activeVideoId?: string,
    setMediaFiles?: React.Dispatch<React.SetStateAction<MediaUploadType>>,
    setActiveVideoId?: React.Dispatch<React.SetStateAction<string>>
  }
) => {

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newMediaFiles = files.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      const type = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : "document" as "image" | "video" | "document";

      return {
        id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        type,
        file,
        status: "uploading" as const,
        previewUrl: previewUrl
      };
    });

    setMediaFiles!((prev: any) => [...prev, ...newMediaFiles]);
    e.target.value = "";
  };

  const handleRemoveFile = async (id: string) => {
    const mediaToRemove = mediaFiles?.find((media) => media.id === id);
    if (!mediaToRemove) return;

    try {

      // Remove from local state
      setMediaFiles!((prev) => prev.filter((media) => media.id !== id));
      
      // Clean up video playback if needed
      if (activeVideoId === id) setActiveVideoId!("");
      
      // Clean up object URL
      if (mediaToRemove.previewUrl) {
        URL.revokeObjectURL(mediaToRemove.previewUrl);
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  return {
    handleFileChange,
    handleRemoveFile,
  };
};