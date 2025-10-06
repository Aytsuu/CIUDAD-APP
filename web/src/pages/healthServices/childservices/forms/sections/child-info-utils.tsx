import { calculateAge, calculateAgeFromDOB } from "@/helpers/ageCalculator";
import type { FormData } from "@/form-schema/chr-schema/chr-schema";
import type { Patient } from "@/components/ui/patientSearch";
import { initialFormData } from "../muti-step-form/types";

export const populatePatientData = (patient: Patient | null): Partial<FormData> => {
  if (!patient) return initialFormData;

  const newFormData: Partial<FormData> = {
    pat_id: patient.pat_id?.toString() || "",
    familyNo: patient.family?.fam_id || "",
    ufcNo: "N/A",
    childFname: patient.personal_info?.per_fname || "",
    childLname: patient.personal_info?.per_lname || "",
    childMname: patient.personal_info?.per_mname || "",
    childSex: patient.personal_info?.per_sex || "",
    childDob: patient.personal_info?.per_dob || "",
    residenceType: patient.pat_type || "Resident",
    address: patient.address?.full_address || "No address provided",
    landmarks: "",
    trans_id: patient.trans_id || "",
    rp_id: patient.rp_id?.rp_id || "",
    birth_order: 1,
    placeOfDeliveryType: "Home",
    placeOfDeliveryLocation: "",
    motherFname: "",
    motherLname: "",
    motherMname: "",
    motherdob: "",
    motherAge: "",
    motherOccupation: "",
    fatherFname: "",
    fatherLname: "",
    fatherMname: "",
    fatherdob: "",
    fatherAge: "",
    fatherOccupation: "",
  };

  if (patient.personal_info?.per_dob) {
    newFormData.childAge = calculateAgeFromDOB(
      patient.personal_info.per_dob
    ).ageString;
  }

  if (patient.pat_type !== "Transient") {
    const motherInfo = patient.family_head_info?.family_heads?.mother?.personal_info;
    if (motherInfo) {
      newFormData.motherFname = motherInfo.per_fname || "";
      newFormData.motherLname = motherInfo.per_lname || "";
      newFormData.motherMname = motherInfo.per_mname || "";
      newFormData.motherdob = motherInfo.per_dob || "";
      if (motherInfo.per_dob) {
        newFormData.motherAge = calculateAge(motherInfo.per_dob).toString();
      }
    }

    const fatherInfo = patient.family_head_info?.family_heads?.father?.personal_info;
    if (fatherInfo) {
      newFormData.fatherFname = fatherInfo.per_fname || "";
      newFormData.fatherLname = fatherInfo.per_lname || "";
      newFormData.fatherMname = fatherInfo.per_mname || "";
      newFormData.fatherdob = fatherInfo.per_dob || "";
      if (fatherInfo.per_dob) {
        newFormData.fatherAge = calculateAge(fatherInfo.per_dob).toString();
      }
    }
  }

  return newFormData;
};

export const updateAgeFields = (
  childDob: string | undefined,
  motherdob: string | undefined,
  fatherdob: string | undefined,
  setValue: (name: keyof FormData, value: any, options?: any) => void
) => {
  if (childDob) {
    const age = calculateAgeFromDOB(childDob).ageString;
    setValue("childAge", age, { shouldValidate: true });
  } else {
    setValue("childAge", "", { shouldValidate: true });
  }

  if (motherdob) {
    const age = calculateAge(motherdob);
    setValue("motherAge", age.toString(), { shouldValidate: true });
  } else {
    setValue("motherAge", "", { shouldValidate: true });
  }

  if (fatherdob) {
    const age = calculateAge(fatherdob);
    setValue("fatherAge", age.toString(), { shouldValidate: true });
  } else {
    setValue("fatherAge", "", { shouldValidate: true });
  }
};