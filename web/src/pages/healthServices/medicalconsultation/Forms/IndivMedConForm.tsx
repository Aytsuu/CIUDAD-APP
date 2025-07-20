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
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { FormInput } from "@/components/ui/form/form-input";
import { api2 } from "@/api/api";
import { toast } from "sonner";
import axios from "axios";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { Combobox } from "@/components/ui/combobox";
import { calculateBMI, getBMICategory } from "../calculate-bmi";
import { HealthWarnings, useHealthWarnings } from "../health-warnings";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";

export const previousBMI = async (pat_id: string) => {
  try {
    const res = await api2.get(
      `/patientrecords/previous-measurement/${pat_id}/`
    );
    console.log(res);
    return res.data;
  } catch (err) {
    console.error("Error fetching previous BMI:", err);
    throw err;
  }
};

export default function IndivMedicalForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData } = params || {};

  // Use the health warnings hook
  const { vitalWarnings, bmiResult, updateVitalWarnings, updateBMIResult } =
    useHealthWarnings();

  // Initialize form with patient data
  const form = useForm<nonPhilHealthType>({
    resolver: zodResolver(nonPhilHealthSchema),
    defaultValues: {
      pat_id: patientData?.pat_id?.toString() || "",
      bhw_assignment: "Caballes Katrina Shin",
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
    const loadPreviousMeasurements = async () => {
      if (patientData?.pat_id) {
        try {
          const prevMeasurements = await previousBMI(patientData.pat_id);
          if (prevMeasurements) {
            form.setValue("height", prevMeasurements.height);
            form.setValue("weight", prevMeasurements.weight);
          }
        } catch (error) {
          console.error("Error fetching previous measurements:", error);
        }
      }
    };
    loadPreviousMeasurements();
  }, [patientData, form]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Handle BMI calculation
      if (name === "height" || name === "weight") {
        if (value.height && value.weight) {
          const height = Number(value.height);
          const weight = Number(value.weight);

          // Manual age calculation
          let age = 0;
          if (patientData?.personal_info?.per_dob) {
            const birthDate = new Date(patientData.personal_info.per_dob);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (
              monthDiff < 0 ||
              (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ) {
              age--;
            }
          }

          const bmiValue = calculateBMI(height, weight);
          const bmiCategory = getBMICategory(bmiValue, age);

          // Check if BMI is abnormal (not "Normal weight")
          const isAbnormal = bmiCategory !== "Normal weight";

          updateBMIResult({
            value: bmiValue,
            category: bmiCategory,
            isAbnormal: isAbnormal,
          });
        } else {
          updateBMIResult({ value: null, category: null, isAbnormal: false });
        }
      }

      // Handle vital signs warnings using the reusable function
      updateVitalWarnings({
        vital_pulse: value.vital_pulse,
        vital_RR: value.vital_RR,
        vital_temp: value.vital_temp,
        vital_bp_systolic: value.vital_bp_systolic,
        vital_bp_diastolic: value.vital_bp_diastolic,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, patientData, updateVitalWarnings, updateBMIResult]);

  const onSubmit = async (data: nonPhilHealthType) => {
    if (!patientData?.pat_id) {
      toast.error("Patient data is missing");
      return;
    }

    let patrec: string | null = null;
    let vital: string | null = null;
    let bmi: string | null = null;

    try {
      // Manual age calculation for submission
      let age = 0;
      if (patientData?.personal_info?.per_dob) {
        const birthDate = new Date(patientData.personal_info.per_dob);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
      }

      const bmiValue = calculateBMI(
        Number(data.height || 0),
        Number(data.weight || 0)
      );

      const serviceResponse = await api2.post(
        "patientrecords/patient-record/",
        {
          patrec_type: "Medical Consultation",
          pat_id: data.pat_id,
          created_at: new Date().toISOString(),
        }
      );
      patrec = serviceResponse.data.patrec_id;

      const vitalSignsResponse = await api2.post(
        "patientrecords/vital-signs/",
        {
          vital_bp_systolic: data.vital_bp_systolic || "",
          vital_bp_diastolic: data.vital_bp_diastolic || "",
          vital_temp: data.vital_temp || "",
          vital_RR: data.vital_RR || "",
          vital_o2: "N/A",
          vital_pulse: data.vital_pulse || "",
          created_at: new Date().toISOString(),
          patrec: patrec,
        }
      );
      vital = vitalSignsResponse.data.vital_id;

      const bmiResponse = await api2.post("patientrecords/body-measurements/", {
        height: parseFloat(data.height?.toFixed(2)),
        weight: parseFloat(data.weight?.toFixed(2)),
        age: patientData?.age,
        // bmi: parseFloat(bmiValue.toFixed(2)),
        created_at: new Date().toISOString(),
        patrec: patrec,
      });
      bmi = bmiResponse.data.bm_id;

      await api2.post("medical-consultation/medical-consultation-record/", {
        patrec: patrec,
        vital: vital,
        bm: bmi,
        find: null,
        medrec_chief_complaint: data.medrec_chief_complaint,
        created_at: new Date().toISOString(),
        medrec_age: patientData?.age,
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
    <div>
      {/* Header and navigation */}
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
            Medical Consultation Form
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Add new medical consultation and view patient information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      {/* Patient Info Card */}
      {patientData && (
        <div className="mt-4 mb-6">
          <PatientInfoCard patient={patientData} />
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-8 mb-6 mt-5">
            {/* Vital Signs Section */}
            <div className="space-y-4">
              <h2 className="font-semibold text-blue bg-blue-50 rounded-md py-2 px-3">
                Vital Sign
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                <FormInput
                  control={form.control}
                  name="vital_pulse"
                  label="Heart Rate (bpm)"
                  placeholder="Adult normal: 60-100 bpm"
                  type="number"
                  min={1}
                  maxLength={3}
                />
                <FormInput
                  control={form.control}
                  name="vital_RR"
                  label="Respiratory Rate (cpm)"
                  placeholder="12-20 cpm"
                  type="number"
                  min={1}
                  maxLength={2}
                />
                <FormInput
                  control={form.control}
                  name="vital_temp"
                  label="Temperature (℃)"
                  placeholder="36.5-37.5°C (Normal Range)"
                  type="number"
                  min={1}
                  step={0.1}
                  maxLength={5}
                />
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
                  min={1}
                  step={0.1}
                  maxLength={6}
                />
              </div>

              {/* Blood Pressure */}
              <div className="flex flex-col gap-4 pt-3">
                <h2 className="font-semibold text-blue bg-blue-50 rounded-md px-3">
                  Blood Pressure (mmHg)
                </h2>
                <div className="flex gap-2">
                  <FormInput
                    control={form.control}
                    name="vital_bp_systolic"
                    label="Systolic"
                    type="number"
                    min={1}
                    placeholder="range 90-130"
                    maxLength={3}
                  />
                  <FormInput
                    control={form.control}
                    name="vital_bp_diastolic"
                    label="Diastolic"
                    type="number"
                    min={1}
                    placeholder=" range 60-80"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>

            {/* Health Warnings */}
            <HealthWarnings
              vitalWarnings={vitalWarnings}
              bmiResult={bmiResult}
            />

            {/* Chief Complaint */}
            <div className="mb-5 mt-5">
              <FormTextArea
                control={form.control}
                name="medrec_chief_complaint"
                label="Chief Complaint"
                placeholder="Enter chief complaint"
                className="min-h-[100px]"
              />
            </div>

            {/* BHW and Doctor Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
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
              onClick={() => navigate(-1)}
              className="w-full sm:w-[150px]"
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-[150px]"
              disabled={!patientData || form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
