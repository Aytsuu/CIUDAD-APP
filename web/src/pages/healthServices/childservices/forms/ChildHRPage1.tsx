import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormMessage,
} from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { BasicInfoType, BasicInfoSchema } from "@/form-schema/chr-schema";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button/button";
import { UserPlus, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Patient } from "@/components/ui/patientSearch";
import { calculateAge } from "@/helpers/ageCalculator";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { PatientSearch } from "@/components/ui/patientSearch";
import { useLocalStorage } from "@/helpers/useLocalStorage";
import { calculateAgeFromDOB } from "@/helpers/mmddwksAgeCalculator";
type Page1Props = {
  onNext: () => void;
  updateFormData: (data: Partial<BasicInfoType>) => void;
  formData: BasicInfoType;
};

const STORAGE_KEY = "childHrFormData";
const PATIENT_STORAGE_KEY = "selectedPatient";

export default function ChildHRPage1({
  onNext,
  updateFormData,
  formData,
}: Page1Props) {
  const [selectedPatient, setSelectedPatient] = useLocalStorage<Patient | null>(
    PATIENT_STORAGE_KEY,
    null
  );

  const [childAge, setChildAge] = useState("");
  const [storedFormData, setStoredFormData] = useLocalStorage<BasicInfoType>(
    STORAGE_KEY,
    formData
  );

  const form = useForm<BasicInfoType>({
    resolver: zodResolver(BasicInfoSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: storedFormData,
  });

  const { handleSubmit, watch, setValue, reset, getValues, formState } = form;
  const { errors, isValid, isSubmitting, isDirty } = formState;

  const residenceType = watch("residenceType");
  const isTransient = residenceType === "Transient";
  const childDob = watch("childDob");
  const motherdob = watch("motherdob");
  const fatherdob = watch("fatherdob");

  // Persist form data to localStorage on change
  useEffect(() => {
    const subscription = watch((value) => {
      if (isDirty) {
        setStoredFormData(value as BasicInfoType);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setStoredFormData, isDirty]);

  // Initialize form with patient data if selected patient exists
  useEffect(() => {
    if (selectedPatient) {
      populatePatientData(selectedPatient);
    } else {
      // Clear all fields if no patient is selected
reset()    }
  }, [selectedPatient, reset]);

  const populatePatientData = (patient: Patient) => {
    // 1. FIRST RESET ALL FIELDS TO DEFAULT/EMPTY
    const defaultValues: Partial<BasicInfoType> = {
      // Reset all fields that could have old data
      pat_id: "",
      pat_type:"",
      familyNo: "",
      ufcNo: "N/A",
      childFname: "",
      childLname: "",
      childMname: "",
      childSex: "",
      childDob: "",
      childAge: "",
      childPob: "", // Reset place of birth
      residenceType: "",
      address: "",
      motherFname: "",
      motherLname: "",
      motherMname: "",
      motherdob: "",
      motherAge: "",
      motherOccupation: "", // Reset mother's occupation
      fatherFname: "",
      fatherLname: "",
      fatherMname: "",
      fatherdob: "",
      fatherAge: "",
      fatherOccupation: "", // Reset father's occupation
      landmarks: "",
      staff_id: "1"
    };
    // 2. NOW OVERWRITE WITH NEW PATIENT DATA
    if (patient) {
      defaultValues.pat_id = patient.pat_id?.toString() || "";
      defaultValues.familyNo = patient.family?.fam_id || "";
      defaultValues.childFname = patient.personal_info?.per_fname || "";
      defaultValues.childLname = patient.personal_info?.per_lname || "";
      defaultValues.childMname = patient.personal_info?.per_mname || "";
      defaultValues.childSex = patient.personal_info?.per_sex || "";
      defaultValues.childDob = patient.personal_info?.per_dob || "";
      defaultValues.residenceType = patient.pat_type || "Resident";
      defaultValues.address = patient.address?.full_address || "No address provided";
  
      defaultValues.pat_type = patient.pat_type || "";
      // Calculate child age
      if (patient.personal_info?.per_dob) {

        // const age = calculateAge(patient.personal_info.per_dob);
        const age =calculateAgeFromDOB(patient.personal_info.per_dob).ageString 
        setChildAge(age);
        defaultValues.childAge = age;
      }
  
      // Only populate parent data if NOT transient
      if (!isTransient) {
        const motherInfo = patient.family_head_info?.family_heads?.mother?.personal_info;
        if (motherInfo) {
          defaultValues.motherFname = motherInfo.per_fname || "";
          defaultValues.motherLname = motherInfo.per_lname || "";
          defaultValues.motherMname = motherInfo.per_mname || "";
          defaultValues.motherdob = motherInfo.per_dob || "";
          if (motherInfo.per_dob) {
            defaultValues.motherAge = calculateAge(motherInfo.per_dob).toString();
          }
        }
  
        const fatherInfo = patient.family_head_info?.family_heads?.father?.personal_info;
        if (fatherInfo) {
          defaultValues.fatherFname = fatherInfo.per_fname || "";
          defaultValues.fatherLname = fatherInfo.per_lname || "";
          defaultValues.fatherMname = fatherInfo.per_mname || "";
          defaultValues.fatherdob = fatherInfo.per_dob || "";
          if (fatherInfo.per_dob) {
            defaultValues.fatherAge = calculateAge(fatherInfo.per_dob).toString();
          }
        }
      }
    }
  
    // 3. APPLY THE RESET + NEW DATA
    reset(defaultValues);
  };

  const handlePatientSelect = (patient: Patient | null, patientId: string) => {
    setSelectedPatient(patient);
    if (!patient) {
      reset(); 
    }
  };

  // Calculate child age for transient patients
  useEffect(() => {
    if (isTransient && childDob) {
      const age = calculateAge(childDob);
      setChildAge(age);
      setValue("childAge", age, { shouldValidate: true });
    }
  }, [childDob, isTransient, setValue]);

  // Calculate mother's age when DOB changes
  useEffect(() => {
    if (motherdob) {
      const age = calculateAge(motherdob);
      setValue("motherAge", age.toString(), { shouldValidate: true });
    } else {
      setValue("motherAge", "", { shouldValidate: true });
    }
  }, [motherdob, setValue]);

  // Calculate father's age when DOB changes
  useEffect(() => {
    if (fatherdob) {
      const age = calculateAge(fatherdob);
      setValue("fatherAge", age.toString(), { shouldValidate: true });
    } else {
      setValue("fatherAge", "", { shouldValidate: true });
    }
  }, [fatherdob, setValue]);

  const onSubmitForm = async (data: BasicInfoType) => {
    try {
      console.log("PAGE 1:", data);
      updateFormData(data);
    
      onNext();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Manually trigger form validation and submission
    handleSubmit(onSubmitForm, (errors) => {
      console.error("Form validation errors:", errors);
    })(e);
  };

  const location = useLocation();
  const recordType = location.state?.recordType || "nonExistingPatient";

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between w-full">
        {recordType === "existingPatient" || (
          <div className="flex items-center justify-between gap-3 mb-10 w-full">
            <div className="flex-1">
              <PatientSearch
                onPatientSelect={handlePatientSelect}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow md:p-4 lg:p-8">
        <Form {...form}>
          <form
            onSubmit={handleFormSubmit}
            className="space-y-6 md:p-6 lg:p-8"
            noValidate
          >
           

            <div className="flex w-full flex-wrap gap-4">
              <div className="flex justify-end gap-4 w-full">
                <FormInput
                  control={form.control}
                  name="residenceType"
                  label="Residence Type"
                  type="text"
                  readOnly
                  className="w-[200px]"
                />
              </div>

              <div className="flex justify-end gap-4 w-full">
                <FormInput
                  control={form.control}
                  name="familyNo"
                  label="Family No:"
                  type="text"
                  readOnly={!isTransient && !!selectedPatient}
                  className="w-[200px]"
                />
                <FormInput
                  control={form.control}
                  name="ufcNo"
                  label="UFC No:"
                  type="text"
                  readOnly={!!selectedPatient}
                  className="w-[200px]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-bold text-lg text-darkBlue2 mt-10">
                Child's Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormInput
                  control={form.control}
                  name="childFname"
                  label="First Name"
                  type="text"
                  readOnly={!!selectedPatient}
                />
                <FormInput
                  control={form.control}
                  name="childLname"
                  label="Last Name"
                  type="text"
                  readOnly={!!selectedPatient}
                />
                <FormInput
                  control={form.control}
                  name="childMname"
                  label="Middle Name"
                  type="text"
                  readOnly={!!selectedPatient}
                />
              
              <FormInput
                  control={form.control}
                  name="childSex"
                  label="Gender"
                  type="text"
                  readOnly={!!selectedPatient}
                />

                <FormDateTimeInput
                  control={form.control}
                  name="childDob"
                  label="Date of Birth"
                  type="date"
                  readOnly={!!selectedPatient && !isTransient}
                />
                <FormInput
                  control={form.control}
                  name="childAge"
                  label="Age"
                  type="text"
                  readOnly
                  className="bg-gray-100"
                />
                <div className="sm:col-span-2 lg:col-span-3">
                  <FormInput
                    control={form.control}
                    name="childPob"
                    label="Place of Birth"
                    type="text"
                    placeholder="Enter place of birth"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-bold text-lg text-darkBlue2">
                Mother's Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormInput
                  control={form.control}
                  name="motherFname"
                  label="First Name"
                  type="text"
                  readOnly={!isTransient && !!selectedPatient}
                />
                <FormInput
                  control={form.control}
                  name="motherLname"
                  label="Last Name"
                  type="text"
                  readOnly={!isTransient && !!selectedPatient}
                />
                <FormInput
                  control={form.control}
                  name="motherMname"
                  label="Middle Name"
                  type="text"
                  readOnly={!isTransient && !!selectedPatient}
                />
                <FormDateTimeInput
                  control={form.control}
                  name="motherdob"
                  label="Date of Birth"
                  type="date"
                  readOnly={!isTransient && !!selectedPatient}
                />
                <FormInput
                  control={form.control}
                  name="motherAge"
                  label="Age"
                  type="text"
                  readOnly
                  className="bg-gray-100"
                />
                <FormInput
                  control={form.control}
                  name="motherOccupation"
                  label="Occupation"
                  placeholder="Enter Occupation"
                  type="text"
                  readOnly={!isTransient && !!selectedPatient}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-bold text-lg text-darkBlue2 mt-10">
                Father's Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormInput
                  control={form.control}
                  name="fatherFname"
                  label="First Name"
                  type="text"
                  readOnly={!isTransient && !!selectedPatient}
                />
                <FormInput
                  control={form.control}
                  name="fatherLname"
                  label="Last Name"
                  type="text"
                  readOnly={!isTransient && !!selectedPatient}
                />
                <FormInput
                  control={form.control}
                  name="fatherMname"
                  label="Middle Name"
                  type="text"
                  readOnly={!isTransient && !!selectedPatient}
                />
                <FormDateTimeInput
                  control={form.control}
                  name="fatherdob"
                  label="Date of Birth"
                  type="date"
                  readOnly={!isTransient && !!selectedPatient}
                />
                <FormInput
                  control={form.control}
                  name="fatherAge"
                  label="Age"
                  type="text"
                  readOnly
                  className="bg-gray-100"
                />
                <FormInput
                  control={form.control}
                  name="fatherOccupation"
                  label="Occupation"
                  placeholder="Enter Occupation"

                  type="text"
                  readOnly={!isTransient && !!selectedPatient}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-bold text-lg text-darkBlue2 mt-10">
                Address
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <FormInput
                  control={form.control}
                  name="address"
                  label="Complete Address"
                  type="text"
                  readOnly={!isTransient && !!selectedPatient}
                />
                <FormInput
                  control={form.control}
                  name="landmarks"
                  label="Landmarks"
                  type="text"
                  placeholder="Enter landmarks"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="w-full sm:w-[100px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Loading..." : "Next"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}