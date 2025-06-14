import {api} from "@/api/api";
import supabase from "@/supabase/supabase";

export const updatePassword = async(old_password: string, new_password: string, token: string) => {
    try {
        console.log('Sending password update request...');
        const response = await api.post("/user/change-password/", {
            old_password: old_password,
            new_password: new_password,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        
        console.log('Password update response:', response.data);
        return response.data;
    } catch(error: any) {
        console.error('Password update error:', error);
        
        // Handle different error scenarios
        if (error.response?.status === 401) {
            throw "Authentication failed. Please login again.";
        } else if (error.response?.status === 400) {
            // Extract specific field errors
            const errorData = error.response.data;
            if (errorData.old_password) {
                throw errorData.old_password[0] || "Current password is incorrect";
            } else if (errorData.new_password) {
                throw errorData.new_password[0] || "New password is invalid";
            } else if (errorData.error) {
                throw errorData.error;
            }
        }
        
        throw error.response?.data?.error || error.message || "Failed to update password";
    }
}

export const updateProfilePicture = async(file: File, token: string) => {
    if (!file) throw "No file selected";

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if(!validTypes.includes(file.type)) throw "Only JPG/PNG/WEBP files are allowed";
    if(file.size > 5 * 1024 * 1024) throw "File must be less than 5MB";

    try {
        console.log('Starting file upload process...');
        console.log('File details:', { name: file.name, size: file.size, type: file.type });
        
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        console.log('Generated filename:', fileName);
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('userimage')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            throw `Upload failed: ${uploadError.message}`;
        }

        console.log('Upload successful:', uploadData);
        
        // Get public URL
        const { data: urlData } = supabase.storage
            .from('userimage')
            .getPublicUrl(fileName);

        console.log('Generated public URL:', urlData.publicUrl);
        
        // Send URL to backend
        const response = await api.post("/user/upload-image/", {
            image_url: urlData.publicUrl
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Backend update response:', response.data);
        
        // Return URL with cache-busting parameter
        return `${urlData.publicUrl}?t=${Date.now()}`;
        
    } catch (error: any) {
        console.error('Image upload error:', error);
        
        // Handle different error scenarios
        if (error.response?.status === 401) {
            throw "Authentication failed. Please login again.";
        } else if (error.response?.status === 400) {
            throw error.response.data?.error || "Invalid request";
        }
        
        throw error.message || "Image upload failed. Please try again.";
    }
};