import { api } from "@/api/api";

export const addGarbagePickupRequest = async (requestInfo: Record<string, any>, files: {name: string | undefined; type: string | undefined; file?: string | undefined}[] ) => {
    try {
        let fileId = null;
        if (files) {

            const filePayload = {
                files: files.map(file => ({
                    name: file.name,
                    type: file.type,
                    file: file.file  
                }))
            }
            const fileUploadResponse = await api.post('waste/garbage-pickup-file/', filePayload);

            if (fileUploadResponse.data && fileUploadResponse.data.gprf_id) {
                fileId = fileUploadResponse.data.gprf_id;
            }
        }

        const payload = {
            garb_location: requestInfo.garb_location,
            garb_waste_type: requestInfo.garb_waste_type,
            garb_pref_date: requestInfo.garb_pref_date,
            garb_pref_time: requestInfo.garb_pref_time,
            garb_additional_notes: requestInfo.garb_additional_notes,
            garb_req_status: 'pending',
            garb_created_at: new Date().toISOString(),
            sitio_id: requestInfo.sitio_id, // this is OK
            gprf: Number(fileId),
            rp: '00006250722'  
        };

        console.log("Garbage Pickup Request Payload:", payload);

        const res = await api.post('waste/garbage-pickup-request-pending/', payload);
        return res.data;

    } catch (err) {
        console.error("Error submitting garbage pickup request");
        throw err;
    }
};