// import { api } from "@/api/api";
// // import type { MediaUploadType } from "@/components/ui/media-upload";

// export const resolveCase = async (sr_id: string) => {
//     try{
//         const res = await api.put(`clerk/update-service-charge-request/${sr_id}/`, {
//             status: "Resolved",
//             decision_date: new Date().toISOString(),
//         })
//         return res.data
//     }catch(err){
//         console.error(err)
//     }
// }

// export const escalateCase = async (sr_id: string, comp_id: string) => {
//     try{
//          const res2 = await api.post('clerk/file-action-request/', {
//             comp: comp_id,
//             sr_type: 'File Action',
//             sr_request_date: new Date().toISOString(),
//             sr_payment_status: "Unpaid",
//             parent_summon: sr_id
//         })

//         const res = await api.put(`clerk/update-service-charge-request/${sr_id}/`, {
//             status: "Escalated",
//             decision_date: new Date().toISOString(),
//         })

//         return res.data
//     }catch(err){
//         console.error(err)
//     }
// }


// // export const updateSuppDoc = async (values: {csd_id: string; description: string; media?: MediaUploadType[number];}) => {
// //   try {
// //     const formData = new FormData();
    

// //     formData.append('csd_description', values.description);
    
// //     // Handle file upload if new media exists
// //     if (values.media && values.media.status === 'uploaded') {
// //       formData.append('file', values.media.file);
// //       formData.append('csd_name', values.media.file.name);
// //       formData.append('csd_type', values.media.file.type || 'application/octet-stream');
      
// //       if (values.media.storagePath) {
// //         formData.append('csd_path', values.media.storagePath);
// //       }
// //       if (values.media.publicUrl) {
// //         formData.append('csd_url', values.media.publicUrl);
// //       }
// //     }

// //     const res = await api.put(`clerk/update-case-supp-doc/${values.csd_id}/`, formData);
    
// //     return res.data;
// //   } catch(err) {
// //     console.error(err);
// //     throw err;
// //   }
// // }


import { api } from "@/api/api";

export const resolveCase = async (status_type: string, sc_id: string) => {
    try{

        if(status_type == "Council"){
            const res = await api.put(`clerk/update-summon-case/${sc_id}/`, {
                sc_mediation_status: "Resolved",
                sc_date_marked: new Date().toISOString(),
            })

            return res.data
        } else {
            const res = await api.put(`clerk/update-summon-case/${sc_id}/`, {
                sc_conciliation_status: "Resolved",
                sc_date_marked: new Date().toISOString(),
            })
            return res.data
        }
        
    }catch(err){
        console.error(err)
    }
}

export const forwardCase = async(sc_id:string) => {
    try{
        const res = await api.put(`clerk/update-summon-case/${sc_id}/`, {
            sc_mediation_status: "Forwarded to Lupon",
            sc_conciliation_status: "Waiting for Schedule",
        })
        return res.data
    }catch(err){
        console.error(err)
        throw err
    }
}


export const escalateCase = async (sc_id: string, comp_id: string) => {
    try{
        const currentDate = new Date();
        const dueDate = new Date(currentDate);
        dueDate.setDate(currentDate.getDate() + 7);

        const response = await api.get('clerk/file-action-id/')

        if(response){
            await api.post('clerk/service-charge-payment-req/', {
                comp_id: comp_id,
                pay_sr_type: "File Action",
                pay_status: "Unpaid",
                pay_date_req: new Date().toISOString(),
                pay_due_date: dueDate.toISOString().split('T')[0],
                pr_id: response.data.pr_id
            })
        }

        const res = await api.put(`clerk/update-summon-case/${sc_id}/`, {
            sc_conciliation_status: "Escalated",
            sc_date_marked: new Date().toISOString(),
        })

        return res.data
    }catch(err){
        console.error(err)
    }
}

