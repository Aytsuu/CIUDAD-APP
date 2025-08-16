import { api } from "@/api/api";




// export const addWasteReport = async (reportInfo: Record<string, any>) => {
//     try {
//         let RepNum = null;

//         console.log("WASTE REPORT DATA: ",{
//             rep_date: reportInfo.rep_date,
//             rep_location: reportInfo.rep_location,
//             rep_contact: "09346573869",
//             rep_matter: reportInfo.rep_matter,
//             rep_violator: reportInfo.rep_violator,
//             rep_add_details: reportInfo.rep_add_details,
//             rep_anonymous: reportInfo.rep_anonymous || "None",
//             sitio_id: reportInfo.sitio_id,    
//             rp_id: "00005250624",
//             staff_id: "00003250624"
//         });        


//         // First API call to create the report
//         const wasteReportResponse = await api.post('waste/waste-report/', {
//             rep_date: reportInfo.rep_date,
//             rep_location: reportInfo.rep_location,
//             rep_contact: "09346573869",
//             rep_matter: reportInfo.rep_matter,
//             rep_violator: reportInfo.rep_violator,
//             rep_add_details: reportInfo.rep_add_details || "None",
//             rep_anonymous: reportInfo.rep_anonymous,
//             sitio_id: reportInfo.sitio_id,    
//             rp_id: "00006250624",
//             staff_id: "00003250624"
//         });

//         if (wasteReportResponse.data && wasteReportResponse.data.rep_id) {
//             RepNum = wasteReportResponse.data.rep_id;
//         }

//         // Check if there are any images to upload
//         if (!reportInfo.rep_image || reportInfo.rep_image.length === 0) {
//             return wasteReportResponse.data;
//         }

//         // Get the file(IMAGE)
//         const fileData = reportInfo.rep_image[0];

//         console.log("FILE WASTE DATA: ",{
//             wrf_name: fileData.name,
//             wrf_type: fileData.type,
//             wrf_path: fileData.path,
//             wrf_url: fileData.uri,
//             rep_id: Number(RepNum)
//         });      

//         // Second API call to upload the file
//         const payload = {
//             wrf_name: fileData.name,
//             wrf_type: fileData.type,
//             wrf_path: fileData.path,
//             wrf_url: fileData.uri,
//             rep_id: Number(RepNum)
//         };

//         const res = await api.post('waste/waste-rep-file/', payload);
//         return res.data;

//     } catch (err) {
//         console.error("Error creating waste report");
//         throw err;
//     }
// };


export const addWasteReport = async (reportInfo: Record<string, any>) => {
    try {
        let RepNum = null;

        console.log("WASTE REPORT DATA: ", {
            rep_date: reportInfo.rep_date,
            rep_location: reportInfo.rep_location,
            rep_contact: "09346573869",
            rep_matter: reportInfo.rep_matter,
            rep_violator: reportInfo.rep_violator,
            rep_add_details: reportInfo.rep_add_details,
            rep_anonymous: reportInfo.rep_anonymous || "None",
            sitio_id: reportInfo.sitio_id,    
            rp_id: "00003250722",
            staff_id: "00004250722"
        });        

        // First API call to create the report
        const wasteReportResponse = await api.post('waste/waste-report/', {
            rep_date: reportInfo.rep_date,
            rep_location: reportInfo.rep_location,
            rep_contact: "09346573869",
            rep_matter: reportInfo.rep_matter,
            rep_violator: reportInfo.rep_violator,
            rep_add_details: reportInfo.rep_add_details || "None",
            rep_anonymous: reportInfo.rep_anonymous,
            sitio_id: reportInfo.sitio_id,    
            rp_id: "00003250722",
            staff_id: "00004250722"
        });

        if (wasteReportResponse.data && wasteReportResponse.data.rep_id) {
            RepNum = wasteReportResponse.data.rep_id;
        }

        // Check if there are any images to upload
        if (!reportInfo.files || reportInfo.files.length === 0) {
            return wasteReportResponse.data;
        }

        // Upload all images
        const uploadPromises = reportInfo.files.map(async (fileData: any) => { 

            const payload = {
                // wrf_name: fileData.name,
                // wrf_type: fileData.type,
                // wrf_path: fileData.path,
                // wrf_url: fileData.uri,
                rep_id: Number(RepNum),
                files: [{
                    name: fileData.name,
                    type: fileData.type,
                    file: fileData.file // The actual file object
                }]
            };

            return api.post('waste/waste-rep-file/', payload);
        });

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);

        return wasteReportResponse.data;

    } catch (err) {
        console.error("Error creating waste report");
        throw err;
    }
};