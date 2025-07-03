import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { BasicInfoType, BasicInfoSchema } from "@/form-schema/chr-schema";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button/button";
import { UserPlus } from "lucide-react";
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

type Page1Props = {
  onNext2: () => void;
  updateFormData: (data: Partial<BasicInfoType>) => void;
  formData: BasicInfoType;
};

const STORAGE_KEY = "childHrFormData";
const PATIENT_STORAGE_KEY = "selectedPatient";

export default function ChildHRPage1({
  onNext2,
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
    defaultValues: storedFormData,
  });

  const residenceType = form.watch("residenceType");
  const isTransient = residenceType === "Transient";
  const childDob = form.watch("childDob");
  const motherdob = form.watch("motherdob");
  const fatherdob = form.watch("fatherdob");

  // Persist form data to localStorage on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      setStoredFormData(value as BasicInfoType);
    });
    return () => subscription.unsubscribe();
  }, [form, setStoredFormData]);

  // Initialize form with patient data if selected patient exists
  useEffect(() => {
    if (selectedPatient) {
      populatePatientData(selectedPatient);
    }
  }, [selectedPatient]); // This should run when the component mounts AND when selectedPatient changes

  const populatePatientData = (patient: Patient) => {
    form.setValue("pat_id", patient.pat_id.toString());
    const age = calculateAge(patient.personal_info?.per_dob || "");
    setChildAge(age);
    form.setValue("childAge", age);

    form.setValue("pat_id", patient.pat_id || "");
    form.setValue("familyNo", patient.family_head_info?.fam_id || "N/A");
    form.setValue("ufcNo", "N/A");

    // Child information
    form.setValue("childFname", patient.personal_info?.per_fname || "");
    form.setValue("childLname", patient.personal_info?.per_lname || "");
    form.setValue("childMname", patient.personal_info?.per_mname || "");
    form.setValue("childSex", patient.personal_info?.per_sex || "");
    form.setValue("childDob", patient.personal_info?.per_dob || "");
    form.setValue("residenceType", patient.pat_type || "Resident");

    if (!isTransient) {
      // Mother's information
      const motherInfo =
        patient.family_head_info?.family_heads?.mother?.personal_info;
      if (motherInfo) {
        form.setValue("motherFname", motherInfo.per_fname || "");
        form.setValue("motherLname", motherInfo.per_lname || "");
        form.setValue("motherMname", motherInfo.per_mname || "");
        form.setValue("motherdob", motherInfo.per_dob || "");
        form.setValue(
          "motherAge",
          motherInfo.per_dob ? calculateAge(motherInfo.per_dob).toString() : ""
        );
      }

      // Father's information
      const fatherInfo =
        patient.family_head_info?.family_heads?.father?.personal_info;
      if (fatherInfo) {
        form.setValue("fatherFname", fatherInfo.per_fname || "");
        form.setValue("fatherLname", fatherInfo.per_lname || "");
        form.setValue("fatherMname", fatherInfo.per_mname || "");
        form.setValue("fatherdob", fatherInfo.per_dob || "");
        form.setValue(
          "fatherAge",
          fatherInfo.per_dob ? calculateAge(fatherInfo.per_dob).toString() : ""
        );
      }
    }

    form.setValue(
      "address",
      patient.address?.full_address || "No address Provided"
    );
  };

  const handlePatientSelect = (patient: Patient | null, patientId: string) => {
    setSelectedPatient(patient);
    if (patient) {
      populatePatientData(patient);
    } else {
      form.resetField("pat_id");
      setChildAge("");
      form.resetField("childAge");
    }
  };

  // Calculate child age for transient patients
  useEffect(() => {
    if (isTransient && childDob) {
      const age = calculateAge(childDob);
      setChildAge(age);
      form.setValue("childAge", age);
    }
  }, [childDob, isTransient, form]);

  // Calculate mother's age when DOB changes
  useEffect(() => {
    if (motherdob) {
      const age = calculateAge(motherdob);
      form.setValue("motherAge", age.toString());
    } else {
      form.setValue("motherAge", "");
    }
  }, [motherdob, form]);

  // Calculate father's age when DOB changes
  useEffect(() => {
    if (fatherdob) {
      const age = calculateAge(fatherdob);
      form.setValue("fatherAge", age.toString());
    } else {
      form.setValue("fatherAge", "");
    }
  }, [fatherdob, form]);

  const onsubmitForm = (data: BasicInfoType) => {
    console.log("PAGE 1:", data);
    updateFormData(data);
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(PATIENT_STORAGE_KEY);
    onNext2();
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
            onSubmit={form.handleSubmit(onsubmitForm)}
            className="space-y-6 md:p-6 lg:p-8"
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
                  readOnly={!!selectedPatient}
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
                <FormSelect
                  control={form.control}
                  name="childSex"
                  label="Gender"
                  options={[
                    { id: "1", name: "Male" },
                    { id: "2", name: "Female" },
                  ]}
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
                  type="text"
                  readOnly={!isTransient && !!selectedPatient}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-bold text-lg text-darkBlue2 mt-10">
                {isTransient ? "Temporary Address" : "Permanent Address"}
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
              <Button type="submit" className="w-full sm:w-[100px]">
                Next
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
