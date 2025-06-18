"use client";

import { useState, useEffect } from "react";
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
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Combobox } from "@/components/ui/combobox";
import { api } from "@/api/api";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Label } from "@/components/ui/label";
import { CircleAlert, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { calculateAge } from "@/helpers/ageCalculator";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { AlertCircle } from "lucide-react";
import { createVitalSigns,updateVacRecord } from "./restful-api/vitalsignsAPI";
export interface Patient {
  pat_id: number;
  name: string;
  pat_type: string;
  [key: string]: any;
}

export default function ForwardedVaccinationForm() {
  const navigate = useNavigate();

  const location = useLocation();
  const { params } = location.state || {};
  const { patientData, vaccineName, vaccineType, vaccineDose, vachist_id } =
    params || {};

  // Form for Step 2 (Vital Signs)
  const form = useForm<VitalSignsType>({
    resolver: zodResolver(VitalSignsSchema),
    defaultValues: {
      pr: "",
      temp: "",
      o2: "",
      bpsystolic: "",
      bpdiastolic: "",
    },
  });

  const [selectedPatientData, setSelectedPatientData] =
    useState<Patient | null>(null);

  useEffect(() => {
    // Get patient data from route state
    if (location.state?.params?.patientData) {
      const patientData = location.state.params.patientData;
      setSelectedPatientData(patientData);
    }
  }, [location.state]);

  // Submit handler for Step 1

  // Submit handler for Step 2
  const submit = async (data: VitalSignsType) => {
    try {
      if (!vachist_id) {
        throw new Error("No vaccination record ID provided");
      }

      // First create vital signs
      const vitalSigns = await createVitalSigns({
        vital_bp_systolic: data.bpsystolic,
        vital_bp_diastolic: data.bpdiastolic,
        vital_temp: data.temp,
        vital_o2: data.o2,
        vital_pulse: data.pr,
      });
      

      // Then update vaccination record with vitals reference
      await updateVacRecord(vachist_id);

      toast.success("Vital signs saved successfully");
      navigate(-1); // Navigate back after successful submission
    } catch (error) {
      toast.error("Failed to save vital signs");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant={"outline"}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Vaccination Form
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view patients information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <div className="bg-white p-6 sm:p-8 rounded-sm shadow-sm border-gray-100">
        {/* Step 1: Vaccination Details */}

        <div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 mb-4 pb-2">
              <h1 className="font-bold text-xl text-darkBlue1">STEP</h1>
              <div className="bg-darkBlue1 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                1
              </div>
            </div>
          </div>

          {selectedPatientData ? (
            <div className="mb-4">
              <PatientInfoCard patient={selectedPatientData} />
              <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-3">
                  Vaccine Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">
                      Vaccine Name
                    </p>
                    <p className="font-semibold text-gray-800">
                      {vaccineName || "-"}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">
                      Vaccine Type
                    </p>
                    <p className="font-semibold text-gray-800">
                      {vaccineType || "-"}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">Dose</p>
                    <p className="font-semibold text-gray-800">
                      {vaccineDose
                        ? `${vaccineDose}${
                            ["st", "nd", "rd"][(vaccineDose % 10) - 1] || "th"
                          } Dose`
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <Label className="text-base font-semibold text-yellow-500">
                  No patient selected
                </Label>
              </div>
              <p className="text-sm text-gray-700">
                Please select a patient from the medicine records page first.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 my-8"></div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-6 mt-8">
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
                control={form.control}
                name="pr"
                label="Pulse Rate (bpm)"
                placeholder="Enter pulse rate"
                type="number"
              />
              <FormInput
                control={form.control}
                name="temp"
                label="Temperature (°C)"
                placeholder="Enter temperature"
                type="number"
              />
              <FormInput
                control={form.control}
                name="o2"
                label="Oxygen Saturation (%)"
                placeholder="Enter SpO2 level"
                type="number"
              />
            </div>
            <h2 className="font-semibold text-blue bg-blue-50 rounded-md py-2 px-3">
              Blood Pressure
            </h2>
            <div className="flex gap-2">
              <FormInput
                control={form.control}
                name="bpsystolic"
                label="Systolic Blood Pressure"
                type="number"
                placeholder="Systolic"
              />
              <FormInput
                control={form.control}
                name="bpdiastolic"
                label="Diastolic Blood Pressure"
                type="number"
                placeholder="Diastolic"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 pb-2">
              <Button
                type="button"
                variant="outline"
                className="w-[120px] border-gray-300 hover:bg-gray-50"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" className="w-[120px]">
                Complete
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
