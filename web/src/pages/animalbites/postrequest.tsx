import api from "@/api/api"
import { formatDate } from "@/helpers/dateFormatter"

const patient = async (data: Record<string, any>) => {
  try {
    console.log("Patient data being sent to API:", {
      transient: data.transient,
      lastname: data.p_lname,
      firstname: data.p_fname,
      middlename: data.p_mname,
      address: data.p_address,
      age: data.p_age,
      gender: data.p_gender,
    })

    // Update the endpoint path to match your Django URL configuration
    const res = await api.post("animalbites/patients/", {
      transient: data.transient,
      lastname: data.p_lname,
      firstname: data.p_fname,
      middlename: data.p_mname,
      address: data.p_address,
      age: data.p_age,
      gender: data.p_gender,
    })
    console.log("Patient API response:", res.data)
    return res.data.patient_id
  } catch (err: any) {
    console.error("Error creating patient:", err.response?.data || err.message)
    throw err
  }
}

const referral = async (data: Record<string, any>, patientId: number) => {
  try {
    console.log("Referral data being sent to API:", {
      receiver: data.receiver,
      sender: data.sender,
      date: formatDate(data.date),
      patient: patientId, // Link referral to the patient
    })

    // Update the endpoint path to match your Django URL configuration
    const res = await api.post("animalbites/referral/", {
      receiver: data.receiver,
      sender: data.sender,
      date: formatDate(data.date),
      patient: patientId, // Pass the patient ID
    })
    console.log("Referral API response:", res.data)
    return res.data.referral_id // Return the referral ID for use in bite details
  } catch (err: any) {
    console.error("Error creating referral:", err.response?.data || err.message)
    throw err // Rethrow the error for handling in the calling function
  }
}

const bitedetails = async (data: Record<string, any>, referralId: number) => {
  try {
    console.log("Bite details data being sent to API:", {
      exposure_type: data.exposure_type,
      exposure_site: data.exposure_site,
      biting_animal: data.biting_animal,
      actions_taken: data.p_actions || "No actions recorded",
      referral: referralId,
    })

    // Update the endpoint path to match your Django URL configuration
    const res = await api.post("animalbites/details/", {
      exposure_type: data.exposure_type,
      exposure_site: data.exposure_site,
      biting_animal: data.biting_animal,
      actions_taken: data.p_actions || "No actions recorded",
      referral: referralId,
    })
    console.log("Bite details API response:", res.data)
    return res.data.bite_id
  } catch (err: any) {
    console.error("Error creating bite details:", err.response?.data || err.message)
    throw err
  }
}

export { patient, referral, bitedetails }