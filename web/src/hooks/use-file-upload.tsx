import React from 'react';
import supabase from '@/supabase/supabase';
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

  const generateFileName = (file: File) => {
    const fileExt = file.name.split('.').pop();
    return `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}.${fileExt}`;
  };

  const uploadFile = async (file: File) => {
    const fileName = generateFileName(file);
    const filePath = `uploads/${fileName}`;

    const { error } = await supabase.storage
      .from("image-bucket")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("image-bucket")
      .getPublicUrl(filePath);

    return { publicUrl, storagePath: filePath };
  };

  const deleteFile = async (path: string) => {
    const { error } = await supabase.storage
      .from("image-bucket")
      .remove([path]);
    
    if (error) throw error;
    return true;
  };


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

    setMediaFiles!((prev) => [...prev, ...newMediaFiles]);

    // Upload files and update state with URLs
    for (const media of newMediaFiles) {
      try {
        const { publicUrl, storagePath } = await uploadFile(media.file);
        if (publicUrl) {
          setMediaFiles!((prev) =>
            prev.map((m) =>
              m.id === media.id 
                ? { ...m, publicUrl, storagePath, status: "uploaded" } 
                : m
            )
          );
        }
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }

    e.target.value = "";
  };

  const handleRemoveFile = async (id: string) => {
    const mediaToRemove = mediaFiles?.find((media) => media.id === id);
    if (!mediaToRemove) return;

    try {
      // Remove from Supabase if already uploaded
      if (mediaToRemove.storagePath) {
        await deleteFile(mediaToRemove.storagePath);
      }

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
    uploadFile,
    deleteFile,
    handleFileChange,
    handleRemoveFile,
  };
};