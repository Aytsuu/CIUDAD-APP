"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  VaccineSchema,
  type VaccineSchemaType,
  VitalSignsSchema,
  type VitalSignsType,
} from "@/form-schema/vaccineSchema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLocation, useNavigate } from "react-router-dom";
import { Combobox } from "@/components/ui/combobox";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchVaccinesWithStock } from "../restful-api/fetch";
import { format } from "date-fns";
import { calculateAge } from "@/helpers/ageCalculator";
import { useSubmitStep2 } from "../queries/AddVacrecord";
import { ValidationAlert } from "../../../../components/ui/vac-required-alert";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { PatientSearch, type Patient } from "@/components/ui/patientSearch";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { useAuth } from "@/contexts/AuthContext";
import CardLayout from "@/components/ui/card/card-layout";
import { calculateNextVisitDate } from "@/helpers/Calculatenextvisit";
import {
  useUnvaccinatedVaccines,
  useFollowupVaccines,
  usePatientVaccinationDetails,
} from "../queries/fetch";
import { useIndivPatientVaccinationRecords } from "../queries/fetch";
import { VaccinationRecord } from "../tables/columns/types";
import { FollowUpsCard } from "@/components/ui/ch-vac-followup";
import { VaccinationStatusCards } from "@/components/ui/vaccination-status";
import { VaccinationStatusCardsSkeleton } from "../../skeleton/vaccinationstatus-skeleton";

export default function VaccinationRecordForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, params } = location.state || {};
  const patientDataFromLocation = params?.patientData;

  const shouldShowPatientSearch = mode === "newvaccination_record";
  const [assignmentOption, setAssignmentOption] = useState<"self" | "other">(
    "self"
  );
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPatientData, setSelectedPatientData] =
    useState<Patient | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isStep1ConfirmOpen, setIsStep1ConfirmOpen] = useState(false);
  const [isStep2ConfirmOpen, setIsStep2ConfirmOpen] = useState(false);
  const [, setNextVisitDate] = useState<string | null>(null);
  const [nextVisitDescription, setNextVisitDescription] = useState<
    string | null
  >(null);
  const [selectedVaccineType, setSelectedVaccineType] = useState<string | null>(
    null
  );
  const [vaccineHistory, setVaccineHistory] = useState<VaccinationRecord[]>([]);
  const [isVaccineCompleted, setIsVaccineCompleted] = useState(false);
  const { user } = useAuth();
  const staff_id = user?.staff?.staff_id || null;
  const patientToUse = shouldShowPatientSearch
    ? selectedPatientData
    : patientDataFromLocation;
  const { data: patientVaccinationRecords } = useIndivPatientVaccinationRecords(
    patientToUse?.pat_id
  );
  const { data: vaccinations = [] } =
    usePatientVaccinationDetails(patientToUse?.pat_id);
  const { data: unvaccinatedVaccines = [] } = useUnvaccinatedVaccines(
    patientToUse?.pat_id,
    patientToUse?.personal_info?.per_dob
  );
  const { data: followupVaccines = [], isLoading: isFollowVacLoading } =
    useFollowupVaccines(patientToUse?.pat_id);

  const { data: vaccinesData, isLoading: isVacstckLoading } =
    fetchVaccinesWithStock();

  const isLoading = unvaccinatedVaccines && isFollowVacLoading;

  const form = useForm<VaccineSchemaType>({
    resolver: zodResolver(VaccineSchema),
    defaultValues: {
      pat_id: patientToUse?.pat_id?.toString() || "",
      vaccinetype: "",
      datevaccinated: new Date().toISOString().split("T")[0],
      assignto: "",
      age: patientToUse?.age || "",
      followv_date: "",
      vachist_doseNo: 1,
      vacrec_totaldose: "",
    },
  });

  const form2 = useForm<VitalSignsType>({
    resolver: zodResolver(VitalSignsSchema),
    defaultValues: {
      pr: "",
      temp: "",
      o2: "",
      bpsystolic: "",
      bpdiastolic: "",
    },
  });

  useEffect(() => {
    form.setValue("datevaccinated", format(new Date(), "yyyy-MM-dd"));
    if (patientToUse?.personal_info?.per_dob) {
      form.setValue("age", calculateAge(patientToUse.personal_info.per_dob));
    } else if (patientToUse?.age) {
      form.setValue("age", patientToUse.age);
    }
    if (shouldShowPatientSearch && selectedPatientData) {
      form.setValue("pat_id", selectedPatientData.pat_id.toString());
    } else if (!shouldShowPatientSearch && patientDataFromLocation) {
      form.setValue("pat_id", patientDataFromLocation.pat_id.toString());
    }
  }, [
    form,
    patientToUse,
    shouldShowPatientSearch,
    selectedPatientData,
    patientDataFromLocation,
  ]);

  const handlePatientSelect = (patient: Patient | null, patientId: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientData(patient);
    if (patient) {
      form.setValue("pat_id", patient.pat_id.toString());
      const age = calculateAge(patient.personal_info?.per_dob || "");
      form.setValue("age", age);
      form.setValue("datevaccinated", format(new Date(), "yyyy-MM-dd"));
      form.setValue("vachist_doseNo", 1);
    } else {
      form.setValue("pat_id", "");
      form.setValue("age", "");
      form.setValue("vachist_doseNo", 1);
    }
  };

  const handleVaccineChange = (value: string) => {
    form.setValue("vaccinetype", value);
    setNextVisitDate(null);
    setNextVisitDescription(null);
    form.setValue("followv_date", "");
    form.setValue("vacrec_totaldose", "");
    setIsVaccineCompleted(false);

    if (value) {
      const [vacStck_id, vac_id, vac_name] = value.split(",");
      const selectedVaccine = vaccinesData?.default?.find(
        (v: any) => v.vacStck_id === parseInt(vacStck_id, 10)
      );

      if (selectedVaccine) {
        const { vaccinelist } = selectedVaccine;
        setSelectedVaccineType(vaccinelist.vac_type_choices);

        const currentVaccineHistory =
          patientVaccinationRecords?.filter(
            (record) =>
              record.vaccine_stock?.vaccinelist?.vac_id === Number(vac_id)
          ) || [];
        setVaccineHistory(currentVaccineHistory);

        let doseNumber = 1;

        if (vaccinelist.vac_type_choices !== "routine") {
          const latestDose =
            currentVaccineHistory.length > 0
              ? Math.max(
                  ...currentVaccineHistory.map(
                    (r) => Number(r.vachist_doseNo) || 0
                  )
                )
              : 0;
          doseNumber = latestDose + 1;
        }

        form.setValue("vachist_doseNo", doseNumber);

        // Set vacrec_totaldose for all vaccines
        if (vaccinelist.no_of_doses) {
          form.setValue("vacrec_totaldose", vaccinelist.no_of_doses.toString());
        }

        // Check if vaccine is already completed
        const isCompleted =
          currentVaccineHistory.some((record) => {
            const recordTotalDose = record.vacrec_details?.vacrec_totaldose
              ? Number(record.vacrec_details.vacrec_totaldose)
              : 0;
            const currentDose = Number(doseNumber);

            // Check if current dose is equal to or exceeds total doses
            return currentDose > recordTotalDose && recordTotalDose > 0;
          }) && vaccinelist.vac_type_choices !== "routine";

        setIsVaccineCompleted(isCompleted);

        if (isCompleted && vaccinelist.vac_type_choices !== "routine") {
          toast.warning(
            `${vac_name} vaccine is already completed (Dose ${doseNumber} of ${vaccinelist.no_of_doses})`
          );
          return;
        }

        if (doseNumber < vaccinelist.no_of_doses) {
          if (vaccinelist.vac_type_choices === "routine") {
            const { interval, time_unit } = vaccinelist.routine_frequency;
            const nextDate = calculateNextVisitDate(
              interval,
              time_unit,
              new Date().toISOString()
            );
            setNextVisitDate(nextDate.toISOString().split("T")[0]);
            setNextVisitDescription(`Vaccination for ${vaccinelist.vac_name}`);
            form.setValue("followv_date", nextDate.toISOString().split("T")[0]);
          } else if (vaccinelist.vac_type_choices === "primary") {
            if (vaccinelist.no_of_doses >= 2) {
              const nextDoseInterval = vaccinelist.intervals.find(
                (interval: any) => interval.dose_number === doseNumber + 1
              );
              if (nextDoseInterval) {
                const nextDate = calculateNextVisitDate(
                  nextDoseInterval.interval,
                  nextDoseInterval.time_unit,
                  new Date().toISOString()
                );
                setNextVisitDate(nextDate.toISOString().split("T")[0]);
                setNextVisitDescription(
                  `Vaccination for ${vaccinelist.vac_name}`
                );
                form.setValue(
                  "followv_date",
                  nextDate.toISOString().split("T")[0]
                );
              }
            }
          }
        } else {
          // If current dose equals total dose, clear follow-up date
          setNextVisitDate(null);
          setNextVisitDescription(null);
          form.setValue("followv_date", "");
        }
      }
    }
  };

  const onSubmitStep1 = async (data: VaccineSchemaType) => {
    setSubmitting(true);
    if (assignmentOption === "other" && !data.assignto) {
      form.setError("assignto", { message: "Please select an assignee" });
      toast.error("Please select an assignee");
      return;
    }
    try {
      const formData = form.getValues();
      const [vacStck_id, vac_id, vac_name, expiry_date] =
        formData.vaccinetype.split(",");

      const followUpData = formData.followv_date
        ? {
            followv_date: formData.followv_date,
            followv_status: "pending",
            followv_description:
              selectedVaccineType === "conditional"
                ? `Conditional vaccination follow-up for ${vac_name}`
                : nextVisitDescription || `Follow-up for ${vac_name}`,
          }
        : undefined;

      await submitStep2.mutateAsync({
        assignmentOption,
        data,
        vacStck_id: vacStck_id.trim(),
        vac_id: vac_id.trim(),
        vac_name: vac_name.trim(),
        expiry_date: expiry_date.trim(),
        pat_id: form.getValues("pat_id"),
        form: {
          setError: form.setError,
          getValues: form.getValues,
          reset: form.reset,
        },
        form2: { reset: form2.reset, getValues: form2.getValues },
        staff_id: staff_id,
        followUpData,
        vaccinationHistory: vaccineHistory,
      });
    } finally {
      setSubmitting(false);
      setIsStep2ConfirmOpen(false);
    }
  };

  const submitStep2 = useSubmitStep2();
  const onSubmitStep2 = async (data: VitalSignsType) => {
    setSubmitting(true);
    try {
      const formData = form.getValues();
      const [vacStck_id, vac_id, vac_name, expiry_date] =
        formData.vaccinetype.split(",");

      const followUpData = formData.followv_date
        ? {
            followv_date: formData.followv_date,
            followv_status: "pending",
            followv_description:
              selectedVaccineType === "conditional"
                ? `Conditional vaccination follow-up for ${vac_name}`
                : nextVisitDescription || `Follow-up for ${vac_name}`,
          }
        : undefined;

      await submitStep2.mutateAsync({
        assignmentOption,
        data,
        vacStck_id: vacStck_id.trim(),
        vac_id: vac_id.trim(),
        vac_name: vac_name.trim(),
        expiry_date: expiry_date.trim(),
        pat_id: form.getValues("pat_id"),
        form: {
          setError: form.setError,
          getValues: form.getValues,
          reset: form.reset,
        },
        form2: { reset: form2.reset, getValues: form2.getValues },
        staff_id: staff_id,
        followUpData,
        vaccinationHistory: vaccineHistory,
      });
    } finally {
      setSubmitting(false);
      setIsStep2ConfirmOpen(false);
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await form.trigger();
    if (isValid && !hasInvalidStep1Fields) {
      setIsStep1ConfirmOpen(true);
    } else {
      toast.error("Please complete all required fields correctly");
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await form2.trigger();
    if (isValid && !hasInvalidStep1Fields && !hasInvalidStep2Fields) {
      setIsStep2ConfirmOpen(true);
    } else {
      toast.error("Please complete all required fields correctly");
    }
  };

  const handleStep1Confirm = () => {
    setIsStep1ConfirmOpen(false);
    setSubmitting(true);
    form.handleSubmit(onSubmitStep1)();
  };

  const handleStep2Confirm = () => {
    setIsStep2ConfirmOpen(false);
    setSubmitting(true);
    form2.handleSubmit(onSubmitStep2)();
  };

  const hasInvalidStep1Fields =
    (shouldShowPatientSearch && !selectedPatientId) ||
    !form.watch("vaccinetype") ||
    (assignmentOption === "other" && !form.watch("assignto")) ||
    !form.watch("vachist_doseNo") ||
    (selectedVaccineType === "conditional" && !form.watch("vacrec_totaldose"));

  const hasInvalidStep2Fields =
    assignmentOption === "self" &&
    selectedVaccineType === "conditional" &&
    !form.watch("followv_date");

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant={"outline"}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft />
        </Button>
        <div className="flex flex-col items-center">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Vaccination Form
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage patient vaccinations
          </p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <CardLayout
        content={
          <>
            {shouldShowPatientSearch && (
              <PatientSearch
                value={selectedPatientId}
                onChange={(value) => setSelectedPatientId(value)}
                onPatientSelect={handlePatientSelect}
                className="mb-4"
              />
            )}

            <div className="mb-4 bg-white">
              <PatientInfoCard patient={patientToUse} />
            </div>

            {patientToUse?.pat_id && (
              <>
                {isLoading ? (
                  <VaccinationStatusCardsSkeleton />
                ) : (
                  <CardLayout
                    cardClassName="mb-6"
                    content={
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="w-full">
                          <VaccinationStatusCards
                            unvaccinatedVaccines={unvaccinatedVaccines}
                            vaccinations={vaccinations}
                          />
                        </div>

                        <div className="w-full">
                          <FollowUpsCard followupVaccines={followupVaccines} />
                        </div>
                      </div>
                    }
                  />
                )}
              </>
            )}
            <div className="bg-white p-6 sm:p-8 rounded-sm shadow-sm border-gray-100">
              <Form {...form}>
                <form onSubmit={handleStep1Submit} className="space-y-6">
                  <div className="flex items-center gap-2 mb-4 pb-2">
                    <h1 className="font-bold text-xl text-darkBlue1">STEP</h1>
                    <div className="bg-darkBlue1 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                  </div>
                  <h2 className="font-semibold py-2  text-darkBlue2 ">
                    Vaccination Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col mt-2">
                      <Label className="mb-3 text-darkGray">Vaccine Name</Label>
                      <Combobox
                        options={vaccinesData?.formatted ?? []}
                        value={form.watch("vaccinetype") || ""}
                        onChange={(value) => handleVaccineChange(value)}
                        placeholder={
                          isVacstckLoading
                            ? "Loading vaccines..."
                            : "Search and select a vaccine"
                        }
                        triggerClassName="font-normal w-full"
                        emptyMessage={
                          <div className="flex gap-2 justify-center items-center">
                            <Label className="font-normal text-xs">
                              {isVacstckLoading
                                ? "Loading..."
                                : "No available vaccines in stock."}
                            </Label>
                          </div>
                        }
                      />
                      {form.watch("vaccinetype") && (
                        <>
                          <div className="mt-4  flex flex-col sm:flex-row sm:space-x-4">
                            <FormInput
                              control={form.control}
                              name="vacrec_totaldose"
                              label="Total Doses Required"
                              placeholder="Enter total doses"
                              type="number"
                              readOnly={selectedVaccineType !== "conditional"}
                            />
                            <FormDateTimeInput
                              control={form.control}
                              name="followv_date"
                              label="Next Follow-up Visit Date"
                              type="date"
                            />
                          </div>

                         
                        </>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormDateTimeInput
                        control={form.control}
                        name="datevaccinated"
                        label="Date Vaccinated"
                        type="date"
                        readOnly
                      />
                      <FormInput
                        control={form.control}
                        name="vachist_doseNo"
                        label="Dose Number"
                        placeholder="Enter dose number"
                        type="number"
                        readOnly={mode !== "newvaccination_record"}
                      />
                    </div>
                  </div>
                  <div className="space-y-4 border p-5 rounded-md bg-gray-50 shadow-sm">
                    <h2 className="font-bold text-darkBlue1 mb-3">
                      Step 2 Assignment
                    </h2>
                    <RadioGroup
                      defaultValue="self"
                      value={assignmentOption}
                      onValueChange={(value) =>
                        setAssignmentOption(value as "self" | "other")
                      }
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="self" id="self" />
                        <Label htmlFor="self">
                          I will complete Step 2 myself
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">
                          Assign Step 2 to someone else
                        </Label>
                      </div>
                    </RadioGroup>
                    {assignmentOption === "other" && (
                      <div className="mt-4">
                        <Combobox
                          options={[
                            { id: "1", name: "Keneme" },
                            { id: "2", name: "Dr. Smith" },
                            { id: "3", name: "Nurse Johnson" },
                          ]}
                          value={form.watch("assignto") || ""}
                          onChange={(value) =>
                            form.setValue("assignto", value || "")
                          }
                          placeholder="Select a person to assign"
                          triggerClassName="font-normal w-full"
                          emptyMessage={
                            <div className="flex gap-2 justify-center items-center">
                              <Label className="font-normal text-[13px]">
                                No assignees available
                              </Label>
                            </div>
                          }
                        />
                      </div>
                    )}
                  </div>
                  {assignmentOption === "other" && (
                    <ValidationAlert
                      patientError={
                        shouldShowPatientSearch && !selectedPatientId
                      }
                      vaccineError={!form.watch("vaccinetype")}
                      assigneeError={
                        !!form.watch("vaccinetype") &&
                        assignmentOption === "other" &&
                        !form.watch("assignto")
                      }
                    />
                  )}
                  {assignmentOption === "other" && (
                    <div className="flex justify-end gap-3 pt-6 pb-2">
                      <Button
                        variant="outline"
                        className="w-[120px] border-gray-300 hover:bg-gray-50 bg-transparent"
                        type="button"
                        onClick={() => form.reset()}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="w-[120px]"
                        disabled={hasInvalidStep1Fields || submitting}
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Save & Assign"
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
              <div className="border-t border-gray-200 my-8"></div>
              {assignmentOption === "self" && (
                <Form {...form2}>
                  <form onSubmit={handleStep2Submit} className="space-y-6 mt-8">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 mb-4 pb-2">
                        <h1 className="font-bold text-xl text-darkBlue1">
                          STEP
                        </h1>
                        <div className="bg-darkBlue1 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                          2
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white">
                      <FormInput
                        control={form2.control}
                        name="pr"
                        label="Pulse Rate (bpm)"
                        placeholder="Enter pulse rate"
                        type="number"
                      />
                      <FormInput
                        control={form2.control}
                        name="temp"
                        label="Temperature (°C)"
                        placeholder="Enter temperature"
                        type="number"
                      />
                      <FormInput
                        control={form2.control}
                        name="o2"
                        label="Oxygen Saturation (%)"
                        placeholder="Enter SpO2 level"
                        type="number"
                      />
                    </div>
                    <h2 className="font-semibold text-darkBlue2 py-2">
                      Blood Pressure
                    </h2>
                    <div className="flex gap-2 ">
                      <FormInput
                        control={form2.control}
                        name="bpsystolic"
                        label="Systolic Blood Pressure"
                        type="number"
                        placeholder="Systolic"
                      />
                      <FormInput
                        control={form2.control}
                        name="bpdiastolic"
                        label="Diastolic Blood Pressure"
                        type="number"
                        placeholder="Diastolic"
                      />
                    </div>
                    <ValidationAlert
                      patientError={
                        shouldShowPatientSearch && !selectedPatientId
                      }
                    />
                    <div className="flex justify-end gap-3 pt-6 ">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-[120px] border-gray-300 hover:bg-gray-50 bg-transparent"
                        onClick={() => setAssignmentOption("other")}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="w-[120px]"
                        disabled={
                          hasInvalidStep1Fields ||
                          submitting ||
                          isVaccineCompleted
                        }
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Complete"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
              <ConfirmationDialog
                isOpen={isStep1ConfirmOpen}
                onOpenChange={setIsStep1ConfirmOpen}
                onConfirm={handleStep1Confirm}
                title="Confirm Save & Assign"
                description="Are you sure you want to save this vaccination record and assign Step 2 to another person? This action will update the system and notify the assignee."
              />
              <ConfirmationDialog
                isOpen={isStep2ConfirmOpen}
                onOpenChange={setIsStep2ConfirmOpen}
                onConfirm={handleStep2Confirm}
                title="Confirm Vaccination Submission"
                description="Are you sure you want to submit this vaccination record? This action will update the inventory and patient records."
              />
            </div>
          </>
        }
      />
    </>
  );
}
