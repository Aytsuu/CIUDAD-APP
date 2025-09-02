import React from 'react';
import { MediaUploadType } from '@/components/ui/media-upload';
import { fileToBase64 } from '@/helpers/fileHelpers';

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

    // Map files to promises that resolve to media objects
    const newMediaFilesPromises = files.map(async (file) => {
      const url = URL.createObjectURL(file);
      const base64 = await fileToBase64(file);

      return {
        id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        name: `media_${file.name}_${Date.now()}.${file.type.split('/')[1]}${Math.random().toString(36).substring(2, 8)}`,
        type: file.type,
        file: base64,
        url
      };
    });

    // Wait for all promises to resolve
    const newMediaFiles = await Promise.all(newMediaFilesPromises);

    // Now update state with resolved media files
    setMediaFiles && setMediaFiles((prev: any) => [...prev, ...newMediaFiles]);
  };

  const handleRemoveMedia = async (id: string) => {
    const mediaToRemove = mediaFiles?.find((media) => media.id === id);
    if (!mediaToRemove) return;

    // Remove from local state
    setMediaFiles && setMediaFiles((prev) => prev.filter((media) => media.id !== id));
    
    // Clean up video playback if needed
    if (activeVideoId === id) setActiveVideoId && setActiveVideoId("");
    
    // Clean up object URL
    if (mediaToRemove.url) {
      URL.revokeObjectURL(mediaToRemove.url);
    }
  };
  
  return {
    handleFileChange,
    handleRemoveMedia,
  };
};