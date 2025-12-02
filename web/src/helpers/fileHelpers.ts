// Helper to convert one file to base64 string with a Promise
export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject("Failed to read file as base64");
      }
    };
    reader.onerror = (error) => reject(error);
  });

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const handleImageUpload = async (files: any[]) => {
    if (files.length === 0) return;
    const base64 = await fileToBase64(files[0]);
    const file = {
      name: `media_${files[0].name}_${Date.now()}.${files[0].type.split('/')[1]}${Math.random().toString(36).substring(2, 8)}`,
      type: files[0].type, 
      file: base64,
    }
    return file;
  }