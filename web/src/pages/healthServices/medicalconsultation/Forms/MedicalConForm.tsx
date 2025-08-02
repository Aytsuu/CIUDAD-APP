"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  nonPhilHealthSchema,
  nonPhilHealthType,
} from "@/form-schema/medicalConsultation/nonPhilhealthSchema";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { BriefcaseMedical, ChevronLeft, FilesIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { FormInput } from "@/components/ui/form/form-input";
import { api2 } from "@/api/api";
import { toast } from "sonner";
import { fetchPatientRecords } from "@/pages/healthServices/restful-api-patient/FetchPatient";
import { PatientSearch } from "@/components/ui/patientSearch";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import axios from "axios";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { Combobox } from "@/components/ui/combobox";
import { calculateAge } from "@/helpers/ageCalculator";
import { previousBMI } from "../restful-api/get";
import CardLayout from "@/components/ui/card/card-layout";
import { MdBloodtype } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";
import { createPatientRecord } from "../../restful-api-patient/createPatientRecord";
import { createVitalSigns } from "../../vaccination/restful-api/post";
import { createBodyMeasurement } from "../../childservices/forms/restful-api/createAPI";
import { createMedicalConsultation } from "../restful-api/post";

export default function MedicalConsultationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData, mode } = params || {};
  const { user } = useAuth();

  const staff_id = user?.staff?.staff_id || null;
  const name = `${user?.resident?.per?.per_fname || ""} ${
    user?.resident?.per?.per_mname || ""
  } ${user?.resident?.per?.per_lname || ""}`.trim();

  const [patients, setPatients] = useState({
    default: [] as any[],
    formatted: [] as { id: string; name: string }[],
  });
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedPatientData, setSelectedPatientData] = useState<any>(
    patientData || null
  );
  const [previousMeasurements, setPreviousMeasurements] = useState<{
    height?: number;
    weight?: number;
    created_at?: string;
  } | null>(null);

  // Initialize form
  const form = useForm<nonPhilHealthType>({
    resolver: zodResolver(nonPhilHealthSchema),
    defaultValues: {
      pat_id: patientData?.pat_id?.toString() || "",
      bhw_assignment: name,
      vital_pulse: undefined,
      vital_temp: undefined,
      vital_bp_systolic: undefined,
      vital_bp_diastolic: undefined,
      vital_RR: undefined,
      height: undefined,
      weight: undefined,
      medrec_chief_complaint: "",
      doctor: "",
    },
  });

  useEffect(() => {
    if (mode === "fromallrecordtable") {
      const loadPatients = async () => {
        setLoading(true);
        try {
          const data = await fetchPatientRecords();
          setPatients(data);
        } catch (error) {
          toast.error("Failed to load patients");
        } finally {
          setLoading(false);
        }
      };
      loadPatients();
    }
  }, [mode]);

  useEffect(() => {
    const loadPreviousMeasurements = async () => {
      const patientId =
        mode === "fromindivrecord"
          ? patientData?.pat_id
          : selectedPatientId.split(",")[0].trim();

      if (patientId) {
        try {
          const prevMeasurements = await previousBMI(patientId);
          if (prevMeasurements) {
            form.setValue("height", prevMeasurements.height);
            form.setValue("weight", prevMeasurements.weight);
            setPreviousMeasurements(prevMeasurements);
          } else {
            setPreviousMeasurements(null);
          }
        } catch (error) {
          console.error("Error fetching previous measurements:", error);
          setPreviousMeasurements(null);
        }
      }
    };
    loadPreviousMeasurements();
  }, [patientData, selectedPatientId, mode, form]);

  // Handle vital signs warnings using the reusable function

  const handlePatientSelect = async (patient: any, patientId: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientData(patient);
    form.setValue("pat_id", patient?.pat_id || "");
  };

  const onSubmit = async (data: nonPhilHealthType) => {
    if (
      (mode === "fromallrecordtable" && !selectedPatientId) ||
      (mode === "fromindivrecord" && !patientData)
    ) {
      toast.error("Please select a patient first");
      return;
    }

    const currentPatient =
      mode === "fromindivrecord" ? patientData : selectedPatientData;
    if (!currentPatient) return;

    let patrec: string | null = null;
    let vital: string | null = null;
    let bmi: string | null = null;

    try {
      // Calculate age properly (as number)
      const dob = currentPatient?.personal_info?.per_dob
        ? new Date(currentPatient.personal_info.per_dob)
        : null;

      let age = 0;
      if (dob) {
        const today = new Date();
        age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < dob.getDate())
        ) {
          age--;
        }
      }

      const serviceResponse = await createPatientRecord(
        data.pat_id,
        "Medical Consultation",
        staff_id
      );

      patrec = serviceResponse.patrec_id;

      const vitalSignsResponse = await createVitalSigns({
        vital_bp_systolic: data.vital_bp_systolic || "",
        vital_bp_diastolic: data.vital_bp_diastolic || "",
        vital_temp: data.vital_temp || "",
        vital_RR: data.vital_RR || "",
        vital_o2: "N/A",
        vital_pulse: data.vital_pulse || "",
        patrec: patrec,
        staff: staff_id || null,
      });
      vital = vitalSignsResponse.vital_id;

      const bmiResponse = await createBodyMeasurement({
        height: parseFloat(data.height?.toFixed(2)),
        weight: parseFloat(data.weight?.toFixed(2)),
        age: calculateAge(currentPatient?.personal_info?.per_dob),
        patrec: patrec,
        staff: staff_id || null,
      });
      bmi = bmiResponse.bm_id;

      await createMedicalConsultation({
        patrec: patrec,
        vital: vital,
        bm: bmi,
        find: null,
        medrec_chief_complaint: data.medrec_chief_complaint,
        created_at: new Date().toISOString(),
        medrec_age: calculateAge(currentPatient?.personal_info?.per_dob),
        staff:staff_id
      });

  
      toast.success("Medical record created successfully");
      navigate(-1);
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(
          `Error: ${error.response.data.message || "Something went wrong"}`
        );
      } else {
        toast.error("Error setting up request.");
      }
    }
  };

  const doctors = [
    { id: "1", name: "Kimmy Mo Ma Chung" },
    { id: "2", name: "Chi Chung" },
  ];

  return (
    <>
      {/* Header and navigation */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant={"outline"}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Medical Consultation
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            {mode === "fromindivrecord"
              ? "Add new medical consultation and view patient information"
              : "Manage and view patients information"}
          </p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <CardLayout
        title=""
        cardClassName="px-4 py-6"
        content={
          <>
            {/* Patient Search (only shown in fromallrecordtable mode) */}
            {mode === "fromallrecordtable" && (
              <PatientSearch
                value={selectedPatientId}
                onChange={setSelectedPatientId}
                onPatientSelect={handlePatientSelect}
              />
            )}

            {/* Patient Info Card */}
            {(mode === "fromindivrecord"
              ? patientData
              : selectedPatientData) && (
              <div className="mt-4 ">
                <PatientInfoCard
                  patient={
                    mode === "fromindivrecord"
                      ? patientData
                      : selectedPatientData
                  }
                />
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div>
                  {/* Vital Signs Section */}
                  <div className="space-y-4">
                    <h2 className="font-semibold text-darkBlue1 rounded-md py-2 mt-8 flex gap-2">
                      <BriefcaseMedical /> Vital Sign
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                      <FormInput
                        control={form.control}
                        name="vital_pulse"
                        label="Heart Rate (bpm)"
                        placeholder="Adult normal: 60-100 bpm"
                        type="number"
                        step={1}
                        maxLength={3}
                      />
                      <FormInput
                        control={form.control}
                        name="vital_RR"
                        label="Respiratory Rate (cpm)"
                        placeholder="12-20 cpm"
                        type="number"
                        step={1}
                        maxLength={2}
                      />
                      <FormInput
                        control={form.control}
                        name="vital_temp"
                        label="Temperature (℃)"
                        placeholder="36.5-37.5°C (Normal Range)"
                        type="number"
                        step={0.1}
                        maxLength={5}
                      />
                    </div>

                    <div>
                      {previousMeasurements?.created_at && (
                        <div className="text-sm text-yellow-600 italic mb-2">
                          Note* Previous measurements from:{" "}
                          {new Date(
                            previousMeasurements.created_at
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                          control={form.control}
                          name="height"
                          label="Height (cm)"
                          placeholder="Enter Height"
                          type="number"
                          step={0.1}
                          maxLength={6}
                        />
                        <FormInput
                          control={form.control}
                          name="weight"
                          label="Weight (kg)"
                          placeholder="Enter Weight"
                          type="number"
                          step={0.1}
                          maxLength={6}
                        />
                      </div>
                    </div>

                    {/* Blood Pressure */}
                    <div className="flex flex-col gap-4 pt-3">
                      <h2 className="font-semibold text-darkBlue1 rounded-md py-2  flex gap-2">
                        <MdBloodtype size={24} className="text-red-400" /> Blood
                        Pressure
                      </h2>
                      <div className="flex gap-2">
                        <FormInput
                          control={form.control}
                          name="vital_bp_systolic"
                          label="Systolic"
                          type="number"
                          placeholder="range 90-130"
                          maxLength={3}
                        />
                        <FormInput
                          control={form.control}
                          name="vital_bp_diastolic"
                          label="Diastolic"
                          type="number"
                          placeholder=" range 60-80"
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Chief Complaint */}
                  <div className="mb-5 mt-5">
                    <h2 className="font-semibold text-darkBlue1 rounded-md py-2 mt-8 flex gap-2">
                      <FilesIcon size={24} className="text-sky-500" /> Chief
                      Complaint
                    </h2>
                    <FormTextArea
                      control={form.control}
                      name="medrec_chief_complaint"
                      label=""
                      placeholder="Enter chief complaint"
                      className="min-h-[100px]"
                      rows={5}
                    />
                  </div>

                  {/* BHW and Doctor Selection */}
                  <div className=" flex gap-5 flex-col">
                    <FormField
                      control={form.control}
                      name="bhw_assignment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-black/65">
                            BHW Assigned:
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="BHW Assigned" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <Label className="font-medium text-black/65 mb-2 block">
                        Forward to Doctor
                      </Label>
                      <Combobox
                        options={doctors}
                        value={form.watch("doctor")}
                        onChange={(value) => form.setValue("doctor", value)}
                        placeholder="Select doctor"
                        triggerClassName="font-normal w-full"
                        emptyMessage={
                          <div className="flex gap-2 justify-center items-center">
                            <Label className="font-normal text-[13px]">
                              No doctors available
                            </Label>
                          </div>
                        }
                      />
                      {form.formState.errors.doctor && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.doctor.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => form.reset()}
                    className="w-full sm:w-[150px]"
                  >
                    Reset Form
                  </Button>
                  <Button
                    type="submit"
                    className="w-full sm:w-[150px]"
                    disabled={
                      (mode === "fromallrecordtable" && !selectedPatientId) ||
                      (mode === "fromindivrecord" && !patientData) ||
                      form.formState.isSubmitting
                    }
                  >
                    {form.formState.isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        }
      />
    </>
  );
}
