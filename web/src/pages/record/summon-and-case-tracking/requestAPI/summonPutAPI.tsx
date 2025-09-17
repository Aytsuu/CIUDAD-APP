import { api } from "@/api/api";

export const resolveCase = async (sr_id: string) => {
    try{
        const res = await api.put(`clerk/update-service-charge-request/${sr_id}/`, {
            status: "Resolved",
            decision_date: new Date().toISOString(),
        })
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const escalateCase = async (sr_id: string, comp_id: string) => {
    try{
         const res2 = await api.post('clerk/file-action-request/', {
            comp: comp_id,
            sr_type: 'File Action',
            sr_request_date: new Date().toISOString(),
            sr_payment_status: "Unpaid",
            parent_summon: sr_id
        })

        const res = await api.put(`clerk/update-service-charge-request/${sr_id}/`, {
            status: "Escalated",
            decision_date: new Date().toISOString(),
        })

        return res.data, res2.data
    }catch(err){
        console.error(err)
    }
}


// export const updateSuppDoc = async (values: {csd_id: string; description: string; media?: MediaUploadType[number];}) => {
  // try {
  //   const formData = new FormData();
    

  //   formData.append('csd_description', values.description);
    
  //   // Handle file upload if new media exists
  //   if (values.media && values.media.status === 'uploaded') {
  //     formData.append('file', values.media.file);
  //     formData.append('csd_name', values.media.file.name);
  //     formData.append('csd_type', values.media.file.type || 'application/octet-stream');
      
  //     if (values.media.storagePath) {
  //       formData.append('csd_path', values.media.storagePath);
  //     }
  //     if (values.media.publicUrl) {
  //       formData.append('csd_url', values.media.publicUrl);
  //     }
  //   }

  //   const res = await api.put(`clerk/update-case-supp-doc/${values.csd_id}/`, formData);
    
  //   return res.data;
  // } catch(err) {
  //   console.error(err);
  //   throw err;
  // }
// }

export const acceptSummonRequest = async(sr_id: string) => {
    try{
        let res;
        const purpose = await api.get(`treasurer/purpose-rates/`, {
                params: {
                    pr_purpose: "Summons"
                }
            }
        )
        
        if(purpose){
            await api.post('clerk/service-charge-decision/',{
                scd_decision_date: new Date().toISOString(),
                sr_id: sr_id
            })

            await api.post('clerk/service-charge-payment-request/', {
                pr_id: purpose.data.pr_id,
                spay_status: "Unpaid",
                sr_id: sr_id
            })

            res = await api.put(`clerk/update-summon-request/${sr_id}/`, {
                sr_req_status: "Accepted"
            })

        }
        
        return res?.data
        
    }catch(err){
        console.error(err)
    }
}

export const rejectSummonRequest = async(sr_id: string, reason: string) => {
    try{
        const res = await api.put(`clerk/update-summon-request/${sr_id}/`, {
            sr_req_status: "Rejected",
        })

        if(res){
            await api.post('clerk/service-charge-decision/',{
                scd_decision_date: new Date().toISOString(),
                scd_reason: reason,
                sr_id: sr_id
            })
        }
    }catch(err){
        console.error(err)
    }
}