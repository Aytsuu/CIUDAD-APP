import api from "@/api/api"
import { formatDate } from "@/helpers/dateFormatter"

const patient = async (data: Record<string, any>) => {
  try {
    console.log("Patient data being sent to API:", {
      transient: data.transient,
      lastname: data.lastname,
      firstname: data.firstname,
      middlename: data.middlename,
      address: data.address,
      age: data.age,
      gender: data.gender,
    })

    const res = await api.post("patients/", {
      transient: data.transient,
      lastname: data.lastname,
      firstname: data.firstname,
      middlename: data.middlename,
      address: data.address,
      age: data.age,
      gender: data.gender,
    })
    console.log("Patient API response:", res.data)
    return res.data.patient_id // Return the patient ID for use in referral
  } catch (err) {
    console.error("Error creating patient:", err)
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

    const res = await api.post("referral/", {
      receiver: data.receiver,
      sender: data.sender,
      date: formatDate(data.date),
      patient: patientId, // Pass the patient ID
    })
    console.log("Referral API response:", res.data)
    return res.data.referral_id // Return the referral ID for use in bite details
  } catch (err) {
    console.error("Error creating referral:", err)
    throw err // Rethrow the error for handling in the calling function
  }
}

const bitedetails = async (data: Record<string, any>, referralId: number) => {
  try {
    console.log("Bite details data being sent to API:", {
      exposure_type: data.exposure_type,
      exposure_site: data.exposure_site,
      biting_animal: data.biting_animal,
      lab_exam: data.lab_exam || "",
      actions_taken: data.actions_taken,
      referral: referralId, // Link bite details to the referral
    })

    const res = await api.post("details/", {
      exposure_type: data.exposure_type,
      exposure_site: data.exposure_site,
      biting_animal: data.biting_animal,
      lab_exam: data.lab_exam || "",
      actions_taken: data.actions_taken,
      referral: referralId, // Pass the referral ID
    })
    console.log("Bite details API response:", res.data)
    return res.data.bite_id // Return the bite details ID
  } catch (err) {
    console.error("Error creating bite details:", err)
    throw err // Rethrow the error for handling in the calling function
  }
}

export { patient, referral, bitedetails }

