"use client";
import { useEffect } from "react";
import type React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { FormInput } from "@/components/ui/form/form-input";
import { PatientSearch } from "@/components/ui/patientSearch";
import type { FormData } from "@/form-schema/chr-schema/chr-schema";
import { BasicInfoSchema } from "@/form-schema/chr-schema/chr-schema";
import { ChevronRight } from "lucide-react";
import type { Page1Props } from "./types";
import { ChildInfoSection } from "../sections/child-info-section";
import { MotherInfoSection } from "../sections/mother-info-section";
import { FatherInfoSection } from "../sections/father-info-section";
import { AddressSection } from "../sections/address-section";
import { populatePatientData, updateAgeFields } from "../sections/child-info-utils";
import { useNextufcno } from "../queries/fetchQueries";
import MaternalIndivRecords from "@/pages/healthServices/maternal/maternal-tabs/maternal-indiv-records";
import { useLocalStorage } from "@/helpers/useLocalStorage";

export default function ChildHRPage1({
  onNext,
  updateFormData,
  formData,
  mode,
  // Remove selectedPatient, setSelectedPatient, selectedPatientId, setSelectedPatientId from props
}: Page1Props) {
  const isAddNewMode = mode === "addnewchildhealthrecord";

  // Use localStorage for formData, maternal checkbox, selected patient, and selected patient ID
  const [localFormData, setLocalFormData] = useLocalStorage<FormData>("childHRFormData", formData);
  const [linkMother, setLinkMother] = useLocalStorage<boolean>("childHRLinkMother", false);
  const [selectedPatient, setSelectedPatient] = useLocalStorage<any | null>("childHRSelectedPatient", null);
  const [selectedPatientId, setSelectedPatientId] = useLocalStorage<string>("childHRSelectedPatientId", "");

  const form = useForm<FormData>({
    resolver: zodResolver(BasicInfoSchema),
    mode: "onChange",
    defaultValues: localFormData,
  });

  const { handleSubmit, watch, setValue, reset, control, formState, setError, clearErrors } = form;
  const { data: nextUfcData } = useNextufcno();

  const { isSubmitting } = formState;
  const residenceType = watch("residenceType");
  const isTransient = residenceType === "Transient";
  const childDob = watch("childDob");
  const motherdob = watch("motherdob");
  const fatherdob = watch("fatherdob");
  const placeOfDeliveryType = watch("placeOfDeliveryType");
  const placeOfDeliveryLocation = watch("placeOfDeliveryLocation");

  // Handle age calculations
  useEffect(() => {
    updateAgeFields(childDob, motherdob, fatherdob, setValue);
  }, [childDob, motherdob, fatherdob, setValue]);

  // Add validation for HC location
  useEffect(() => {
    if (placeOfDeliveryType === "HC") {
      if (!placeOfDeliveryLocation || placeOfDeliveryLocation.trim() === "") {
        setError("placeOfDeliveryLocation", {
          type: "required",
          message: "Location is required when HC is selected",
        });
      } else {
        clearErrors("placeOfDeliveryLocation");
      }
    } else {
      clearErrors("placeOfDeliveryLocation");
    }
  }, [placeOfDeliveryType, placeOfDeliveryLocation, setError, clearErrors]);

  // Update parent form data and localStorage on change
  useEffect(() => {
    const subscription = watch((value) => {
      updateFormData(value as Partial<FormData>);
      setLocalFormData(value as FormData);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateFormData, setLocalFormData]);

  // Handle patient select and unselect
  const handlePatientSelect = (patient: any | null, patientId: string) => {
    if (patient) {
      setSelectedPatient(patient);
      setSelectedPatientId(patientId);
      const populated = populatePatientData(patient);
      reset(populated);
      updateFormData(populated);
      setLocalFormData({ ...form.getValues(), ...populated });
      form.setValue("ufcNo", nextUfcData || "");
    } else {
      // If unselected, clear everything
      setSelectedPatient(null);
      setSelectedPatientId("");
      reset({});
      updateFormData({});
      setLocalFormData({} as FormData);
      setLinkMother(false);
    }
  };

  const onSubmitForm = async (data: FormData) => {
    try {
      if (data.placeOfDeliveryType === "HC" && !data.placeOfDeliveryLocation?.trim()) {
        setError("placeOfDeliveryLocation", {
          type: "required",
          message: "Location is required when HC is selected",
        });
        return;
      }
      updateFormData(data);
      setLocalFormData(data);
      onNext();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(onSubmitForm, (errors) => {
      console.error("Form validation errors:", errors);
    })(e);
  };

  // --- Maternal Info Logic ---
  const motherLatestPregnancy = selectedPatient?.additional_info?.mother_latest_pregnancy;
  const motherFamilyHead = selectedPatient?.family_head_info?.family_heads?.mother || selectedPatient?.family_head_info?.mother || {};
  const motherPersonalInfo = motherFamilyHead?.personal_info || {};
  const motherAddress = motherFamilyHead?.address || selectedPatient?.address || {};
  const hasPregnancyId = !isAddNewMode && !!motherLatestPregnancy?.pregnancy_id;

  // Prepare params for MaternalIndivRecords
  const maternalParams = {
    patientData: {
      pat_id: motherLatestPregnancy?.mother_pat_id || "",
      pat_type: "Resident",
      address: motherAddress,
      personal_info: {
        per_fname: motherPersonalInfo.per_fname || "",
        per_lname: motherPersonalInfo.per_lname || "",
        per_mname: motherPersonalInfo.per_mname || "",
        per_sex: "FEMALE",
        per_dob: motherPersonalInfo.per_dob || "",
      },
      pregnancy_id: motherLatestPregnancy?.pregnancy_id || "",
      rp_id: motherFamilyHead?.rp_id || "",
      mode: "maternal",
    },
  };

  // Autofill/clear pregnancy_id in form when checkbox changes
  useEffect(() => {
    if (linkMother && hasPregnancyId) {
      setValue("pregnancy_id", motherLatestPregnancy.pregnancy_id);
      updateFormData({ pregnancy_id: motherLatestPregnancy.pregnancy_id });
      setLocalFormData({ ...form.getValues(), pregnancy_id: motherLatestPregnancy.pregnancy_id });
    } else if (!linkMother) {
      setValue("pregnancy_id", "");
      updateFormData({ pregnancy_id: "" });
      setLocalFormData({ ...form.getValues(), pregnancy_id: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkMother, hasPregnancyId]);

  return (
    <>
      <Form {...form}>
        {!isAddNewMode && (
          <div className="flex items-center justify-between gap-3 mb-10 w-full">
            <div className="flex-1">
              <PatientSearch
                onPatientSelect={handlePatientSelect}
                className="w-full"
                value={selectedPatientId}
                onChange={(id) => {
                  if (!id) {
                    handlePatientSelect(null, "");
                  } else {
                    setSelectedPatientId(id);
                  }
                }}
                ischildren={true}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
          <div className="flex w-full flex-wrap gap-4">
            <div className="flex justify-end gap-4 w-full">
              <FormInput control={control} name="residenceType" label="Residence Type" type="text" readOnly={isAddNewMode || !!selectedPatient} className="w-[200px]" />
            </div>
            <div className="flex justify-end gap-4 w-full">
              <FormInput control={control} name="familyNo" label="Family No:" type="text" className="w-[200px]" />
              <FormInput control={control} name="ufcNo" label="UFC No:" type="text" className="w-[200px]" />
            </div>
          </div>

          {/* Checkbox to link mother and show maternal record */}
          {hasPregnancyId && (
            <div className="mb-4 flex flex-col gap-2 border border-pink-200 bg-pink-50 rounded-md p-4">
              <label className="flex items-center gap-2 text-pink-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={linkMother}
                  onChange={(e) => setLinkMother(e.target.checked)}
                  className="accent-pink-500"
                />
                Link Mother: {motherPersonalInfo.per_lname}, {motherPersonalInfo.per_fname}
                {motherPersonalInfo.per_mname ? ` ${motherPersonalInfo.per_mname}` : ""}
                <span className="ml-2 font-normal text-xs">
                  Pregnancy ID: <span className="font-mono">{motherLatestPregnancy.pregnancy_id}</span>
                </span>
              </label>
              {linkMother && (
                <div className="mt-2">
                  <MaternalIndivRecords patientDataProps={maternalParams} />
                </div>
              )}
            </div>
          )}

          <ChildInfoSection control={control} isAddNewMode={isAddNewMode} selectedPatient={selectedPatient} isTransient={isTransient} placeOfDeliveryType={placeOfDeliveryType} />
          <MotherInfoSection control={control} isAddNewMode={isAddNewMode} selectedPatient={selectedPatient} isTransient={isTransient} />
          <FatherInfoSection control={control} isAddNewMode={isAddNewMode} selectedPatient={selectedPatient} isTransient={isTransient} />
          <AddressSection control={control} isAddNewMode={isAddNewMode} selectedPatient={selectedPatient} isTransient={isTransient} />

          <div className="flex justify-end">
            <Button type="submit" className="flex items-center gap-2 px-6">
              {isSubmitting ? "Loading..." : "Next"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}