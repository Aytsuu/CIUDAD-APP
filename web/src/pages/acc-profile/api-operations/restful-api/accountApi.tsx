import api from "@/api/api";
import { showSuccessToast } from "@/components/ui/toast";
import supabase from "@/supabase/supabase";

export const updateProfilePicture = async (file: File) => {
  if (!file) throw "No file selected";

  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type))
    throw "Only JPG/PNG/WEBP files are allowed";
  if (file.size > 5 * 1024 * 1024) throw "File must be less than 5MB";

  try {
    console.log("Starting file upload process...");
    console.log("File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    console.log("Generated filename:", fileName);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile_picture-bucket")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw `Upload failed: ${uploadError.message}`;
    }

    console.log("Upload successful:", uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("profile_picture-bucket")
      .getPublicUrl(fileName);

    console.log("Generated public URL:", urlData.publicUrl);

    // Send URL to backend
    const response = await api.post("/account/profileUpdate/", {
      image_url: urlData.publicUrl,
    });

    console.log("Backend update response:", response.data);
    showSuccessToast("Profile picture updated successfully");
    return `${urlData.publicUrl}?t=${Date.now()}`;
  } catch (error: any) {
    throw error.message || "Image upload failed. Please try again.";
  }
};
