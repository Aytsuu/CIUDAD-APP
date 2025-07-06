import { api } from "@/api/api"
import { formatDate } from "@/helpers/dateHelper"
import axios from "axios"


const patient = async (data: Record<string, any>) => {
  try {
    const payload = {
      pat_id: String(data.pat_id),
      patrec_type: "Animal Bites",
      created_at: new Date().toISOString()
    }
    console.log("Payload:", payload)
    const res = await api.post("patientrecords/patient-record/", payload)
    return res.data.patrec_id;
  } catch (err: any) {
     if (axios.isAxiosError(err)) {
          console.error("❌ Records API Error:", err.response?.data || err.message)
        } else {
          console.error("❌ Unexpected Error:", err)
        }
        throw err 
      }
  }
  
const referral = async (data: Record<string, any>) => {
  try {
    const payload = {
      receiver: data.receiver,
      sender: data.sender,
      date: formatDate(data.date),
      transient: data.transient,
      patrec: data.patrec_id
    }
    const res = await api.post("animalbites/referral/", payload)
    console.log("✅ Referral created successfully:", res.data)
    return res.data.referral_id
  } catch (err: any) {
    console.error("❌ Referral API Error:", err.response?.data || err.message)

  }
}

const bitedetails = async (data: Record<string, any>) => {
  try {
    const payload = {
      exposure_type: data.exposure_type,
      exposure_site: data.exposure_site,
      biting_animal: data.biting_animal,
      actions_taken: data.p_actions || "No actions recorded",
      referredby: data.p_referred,
      referral: data.referral_id,
    }
    const res = await api.post("animalbites/details/", payload)
    console.log("✅ Bite details created successfully:", res.data)
    return res.data
  } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to create bite details")
  }
}

export { patient, referral, bitedetails }
