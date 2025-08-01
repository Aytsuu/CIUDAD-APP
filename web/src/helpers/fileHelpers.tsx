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