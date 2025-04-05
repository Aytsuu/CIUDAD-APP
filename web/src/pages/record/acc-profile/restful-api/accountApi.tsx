import api from "@/api/api";

export const updatePassword = async(old_password : string, new_password: string, token: string) => {
    try{
        const response = await api.post("/user/change-password/", {
            old_password: old_password,
            new_password: new_password,
        },{
            headers: {
                Authorization: `Token ${token}`,
            }
        });
        return response.data;
    } catch(error: any){
        throw error.response?.data?.error || "Failed to update password";
    }
}

export const updateProfilePicture = async(file: File, token: string) => {
    if (!file) throw "No file selected";

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if(!validTypes.includes(file.type)) throw "Only JPG/PNG/WEBP allowed";
    if(file.size > 5 * 1024 * 1024) throw "File must be <5MB";

    const formData = new FormData();
    formData.append("profile_image", file);

    try{
        const response = await api.post("/user/upload-image/", formData, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        return `${response.data.url}?t=${Date.now()}`;
    } catch (error: any){
        throw "Image upload failed. Try again.";
    }
};