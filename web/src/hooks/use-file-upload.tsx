import React from 'react';
import supabase from '@/utils/supabase';

type FileWithMeta = {
  file: File;
  publicUrl?: string;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  path?: string;
};

export const useInstantFileUpload = (bucketName: string = 'image-bucket') => {
  const [files, setFiles] = React.useState<FileWithMeta[]>([]);

  const generateFileName = (file: File) => {
    const fileExt = file.name.split('.').pop();
    return `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}.${fileExt}`;
  };

  const uploadFile = async (file: File) => {
    const fileName = generateFileName(file);
    const filePath = `uploads/${fileName}`;

    try {
      // Update file status to uploading
      setFiles(prev => prev.map(f => 
        f.file === file ? { ...f, status: 'uploading' } : f
      ));

      // Upload to Supabase
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // Update file status to success
      setFiles(prev => prev.map(f => 
        f.file === file ? { ...f, status: 'success', publicUrl, path: filePath } : f
      ));

      return { success: true, publicUrl, path: filePath };
    } catch (error) {
      // Update file status to error
      setFiles(prev => prev.map(f => 
        f.file === file ? { ...f, status: 'error', error: (error as Error).message } : f
      ));
      return { success: false, error: (error as Error).message };
    }
  };

  const removeFile = async (fileToRemove: File) => {
    const fileMeta = files.find(f => f.file === fileToRemove);
    
    if (fileMeta?.path) {
      try {
        // Remove from Supabase storage
        await supabase.storage
          .from(bucketName)
          .remove([fileMeta.path]);
      } catch (error) {
        console.error('Failed to delete file from storage:', error);
      }
    }

    // Remove from local state
    setFiles(prev => prev.filter(f => f.file !== fileToRemove));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    
    // Filter out already existing files
    const uniqueNewFiles = newFiles.filter(
      newFile => !files.some(existingFile => 
        existingFile.file.name === newFile.name && 
        existingFile.file.size === newFile.size
      )
    );

    // Add new files to state with initial status
    setFiles(prev => [
      ...prev,
      ...uniqueNewFiles.map(file => ({
        file,
        status: 'uploading' as const,
      }))
    ]);

    // Immediately upload each new file
    uniqueNewFiles.forEach(uploadFile);
  };

  const handleRemoveFile = async (fileToRemove: File) => {
    await removeFile(fileToRemove);
  };

  return {
    files,
    handleFileChange,
    handleRemoveFile,
    isUploading: files.some(f => f.status === 'uploading'),
    hasErrors: files.some(f => f.status === 'error'),
  };
};