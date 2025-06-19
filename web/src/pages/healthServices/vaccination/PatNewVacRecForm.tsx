"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  VaccineSchema,
  type VaccineSchemaType,
} from "@/form-schema/vaccineSchema";
import {
  VitalSignsSchema,
  type VitalSignsType,
} from "@/form-schema/vaccineSchema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useNavigate } from "react-router-dom";
import { Combobox } from "@/components/ui/combobox";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchVaccinesWithStock } from "./restful-api/FetchVaccination";
import { format } from "date-fns";
import { calculateAge } from "@/helpers/ageCalculator";
import { fetchPatientRecords } from "../restful-api-patient/FetchPatient";
import { useSubmitStep1, useSubmitStep2 } from "./queries/PatnewrecQueries";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { ValidationAlert } from "./vac-required-alert";
import { checkVaccineStatus } from "./restful-api/FetchVaccination";
interface Patient {
  pat_id: number;
  pat_type: string;
  name?: string;
  personal_info?: {
    per_fname?: string;
    per_mname?: string;
    per_lname?: string;
    per_dob?: string;
    per_sex?: string;
  };
  households?: { hh_id: string }[];
  address?: {
    add_street?: string;
    add_barangay?: string;
    add_city?: string;
    add_province?: string;
    add_external_sitio?: string;
  };
}

export default function PatNewVacRecForm() {
  const navigate = useNavigate();
  const [assignmentOption, setAssignmentOption] = useState<"self" | "other">(
    "self"
  );
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPatientData, setSelectedPatientData] =
    useState<Patient | null>(null);
  const [patients, setPatients] = useState<{
    default: Patient[];
    formatted: { id: string; name: string }[];
  }>({ default: [], formatted: [] });

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      try {
        const data = await fetchPatientRecords();
        setPatients(data);
      } catch (error) {
        toast.error(
          "Failed to load patients: " +
            (error instanceof Error ? error.message : "Unknown error")
        );
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, []);

  const handlePatientSelection = useCallback(
    (id: string) => {
      setSelectedPatientId(id);
      const selectedPatient = patients.default.find(
        (patient) => patient.pat_id.toString() === id.split(",")[0].trim()
      );
  
      if (selectedPatient) {
        setSelectedPatientData(selectedPatient);
        form.setValue("pat_id", selectedPatient.pat_id.toString());
        const age = calculateAge(selectedPatient.personal_info?.per_dob || "");
        form.setValue("age", age);  
        form.setValue("datevaccinated", format(new Date(), "yyyy-MM-dd"));
      }
    },
    [patients.default]
  
  );

  const form = useForm<VaccineSchemaType>({
    resolver: zodResolver(VaccineSchema),
    defaultValues: {
      pat_id: "",
      vaccinetype: "",
      datevaccinated: new Date().toISOString().split("T")[0],
      assignto: "",
      age: "",
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

  // useEffect(() => {
  //   form.setValue("datevaccinated", format(new Date(), "yyyy-MM-dd"));
  //   form.setValue(
  //     "age",
  //     selectedPatientData
  //       ? calculateAge(selectedPatientData.personal_info?.per_dob || "")
  //       : ""
  //   );
  // }, [form, selectedPatientData]);

  const submitStep1 = useSubmitStep1();
  const onSubmitStep1 = async (data: VaccineSchemaType) => {
    if (assignmentOption === "other" && !data.assignto) {
      return;
    }
    setSubmitting(true);
    try {
      const [vacStck_id, vac_id, vac_name, expiry_date] = data.vaccinetype.split(",");

      await submitStep1.mutateAsync({
        data,
        vacStck_id: vacStck_id.trim(),
        vac_id: vac_id.trim(),
        vac_name: vac_name.trim(),
        expiry_date: expiry_date.trim(),
        assignmentOption: assignmentOption,
        form: {
          setError: form.setError,
          getValues: form.getValues,
          reset: form.reset
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitStep2 = useSubmitStep2();
  const onSubmitStep2 = async (data: VitalSignsType) => {
    setSubmitting(true);
    try {
      const formData = form.getValues();
      console.log("age", form.getValues("age"));
      const [vacStck_id, vac_id, vac_name, expiry_date] = formData.vaccinetype.split(",");
      const ageValue = form.getValues("age");
      await submitStep2.mutateAsync({
        data,
        vacStck_id: vacStck_id.trim(),
        vac_id: vac_id.trim(),
        vac_name: vac_name.trim(),
        expiry_date: expiry_date.trim(),
        pat_id: form.getValues("pat_id"),
        age: ageValue || "",
        form: {setError: form.setError, getValues: form.getValues, reset: form.register },
        form2: { reset: form2.reset, getValues: form2.getValues },
      });
    } finally {
      setSubmitting(false);
    }
  };
  useEffect(() => {
    if (selectedPatientData) {
      const age = calculateAge(selectedPatientData.personal_info?.per_dob || "");
      form.setValue("age", age);
      console.log("Updated age in useEffect:", age);
    }
  }, [selectedPatientData, form]);

  const { vaccineStocksOptions, isLoading } = fetchVaccinesWithStock();

  const handleVaccineChange = (value: string) => {
    form.setValue("vaccinetype", value);
  };

  // Check for invalid conditions
  const hasInvalidStep1Fields =
    !selectedPatientId ||
    !form.watch("vaccinetype") ||
    (assignmentOption === "other" && !form.watch("assignto"));
  const hasInvalidStep2Fields =
    assignmentOption === "self" &&
    (!form2.watch("pr") ||
      !form2.watch("temp") ||
      !form2.watch("o2") ||
      !form2.watch("bpsystolic") ||
      !form2.watch("bpdiastolic"));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Button
            className="text-black p-2 mb-2 self-start"
            variant={"outline"}
            onClick={() => navigate(-1)}
          >
            <ChevronLeft />
          </Button>
          <div className="flex-col items-center">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Vaccination Form
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Manage patient vaccinations
            </p>
          </div>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />

        {/* Patient Selection Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-semibold text-base text-darkBlue3">
              Select Patient
            </h2>
          </div>
          <Combobox
            options={patients.formatted}
            value={selectedPatientId}
            onChange={handlePatientSelection}
            placeholder={loading ? "Loading patients..." : "Select a patient"}
            triggerClassName="font-normal  w-full"
            emptyMessage={
              <div className="flex gap-2 justify-center items-center">
                <Label className="font-normal text-[13px]">
                  {loading ? "Loading..." : "No patient found."}
                </Label>
                <Link to="/patient-records/new">
                  <Label className="font-normal text-[13px] text-teal cursor-pointer hover:underline">
                    Register New Patient
                  </Label>
                </Link>
              </div>
            }
          />
        </div>

        {/* Patient Information Card */}
        <div className="mb-4 bg-white">
          <PatientInfoCard patient={selectedPatientData} />
        </div>

        {/* Vaccination Form Section */}
        <div className="bg-white p-6 sm:p-8 rounded-sm shadow-sm border-gray-100">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitStep1)}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4 pb-2">
                <h1 className="font-bold text-xl text-darkBlue1">STEP</h1>
                <div className="bg-darkBlue1 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
              </div>

              <h2 className="font-semibold text-blue bg-blue-50 rounded-md">
                Vaccination Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="flex flex-col mt-2">
                <Label className="mb-3 text-darkGray">Vaccine Name</Label>
              <Combobox
                  options={vaccineStocksOptions.map((vaccine) => ({
                    id: vaccine.id,
                    name: `${vaccine.name} (Expiry: ${
                      vaccine.expiry || "N/A"
                    })`,
                  }))}
                  value={form.watch("vaccinetype")}
                  placeholder={
                    isLoading ? "Loading vaccines..." : "Select a vaccine"
                  }
                  triggerClassName="font-normal w-full"
                  emptyMessage={
                    <div className="flex gap-2 justify-center items-center">
                      <Label className="font-normal text-[13px]">
                        {isLoading
                          ? "Loading..."
                          : "No available vaccines in stock."}
                      </Label>
                    </div>
                  }
                  onChange={handleVaccineChange}
                />
                </div>
             
                <FormDateTimeInput
                  control={form.control}
                  name="datevaccinated"
                  label="Date Vaccinated"
                  type="date"
                  readOnly
                />
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
                    <Label htmlFor="self">I will complete Step 2 myself</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Assign Step 2 to someone else</Label>
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
                      onChange={(value) => form.setValue("assignto", value)}
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
                  patientError={!selectedPatientId}
                  vaccineError={
                    !!selectedPatientId && !form.watch("vaccinetype")
                  }
                  assigneeError={
                    !!selectedPatientId &&
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
                    className="w-[120px] border-gray-300 hover:bg-gray-50"
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
              <form
                onSubmit={form2.handleSubmit(onSubmitStep2)}
                className="space-y-6 mt-8"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 mb-4 pb-2">
                    <h1 className="font-bold text-xl text-darkBlue1">STEP</h1>
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
                <h2 className="font-semibold text-blue bg-blue-50 rounded-md">
                  Blood Pressure
                </h2>
                <div className="flex gap-2">
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
                  patientError={!selectedPatientId}
                  vaccineError={
                    !!selectedPatientId && !form.watch("vaccinetype")
                  }
                  vitalSignsError={
                    !!selectedPatientId &&
                    !!form.watch("vaccinetype") &&
                    hasInvalidStep2Fields
                  }
                />

                <div className="flex justify-end gap-3 pt-6 pb-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-[120px] border-gray-300 hover:bg-gray-50"
                    onClick={() => setAssignmentOption("other")}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="w-[120px]"
                    disabled={
                      hasInvalidStep1Fields ||
                      hasInvalidStep2Fields ||
                      submitting
                    }
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Complete"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
