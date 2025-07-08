import { api } from "@/api/api";

export const addGarbagePickupRequest = async (requestInfo: Record<string, any>) => {
    try {
        let fileId = null;
        if (requestInfo.garb_image && requestInfo.garb_image.length > 0) {
            const fileData = requestInfo.garb_image[0];

            const fileUploadResponse = await api.post('file/upload/', {
                file_name: fileData.name,
                file_type: fileData.type,
                file_path: fileData.path,
                file_url: fileData.uri
            });

            if (fileUploadResponse.data && fileUploadResponse.data.file_id) {
                fileId = fileUploadResponse.data.file_id;
            }
        }

        const payload = {
            garb_location: requestInfo.garb_location,
            garb_waste_type: requestInfo.garb_waste_type,
            garb_pref_date: requestInfo.garb_pref_date,
            garb_pref_time: requestInfo.garb_pref_time,
            // garb_pref_time: '05:30:00',
            garb_additional_notes: requestInfo.garb_additional_notes,
            garb_req_status: 'pending',
            garb_created_at: new Date().toISOString(),
            sitio_id: requestInfo.sitio_id, // this is OK
            file: Number(fileId),
            rp: '00006250624'  
        };

        console.log("Garbage Pickup Request Payload:", payload);

        const res = await api.post('waste/garbage-pickup-request-pending/', payload);
        return res.data;

    } catch (err) {
        console.error("Error submitting garbage pickup request");
        throw err;
    }
};
