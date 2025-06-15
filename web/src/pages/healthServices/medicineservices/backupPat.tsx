"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Combobox } from "@/components/ui/combobox";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { calculateAge } from "@/helpers/ageCalculator";
import { fetchPatientRecords } from "../restful-api-patient/FetchPatient";
import { MedicineRequestSchema, MedicineRequestType } from "@/form-schema/medicineRequest";
import {fetchMedicinesWithStock} from "./restful-api/fetchAPI";

export default function PatNewMedRecForm() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState({
    default: [] as any[],
    formatted: [] as { id: string; name: string }[],
  });
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedPatientData, setSelectedPatientData] = useState<any>(null);
  const { medicineStocksOptions, isLoading } = fetchMedicinesWithStock();
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>("");

  useEffect(() => {
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
  }, []);

  const handlePatientSelection = (id: string) => {
    setSelectedPatientId(id);
    const selectedPatient = patients.default.find(
      (patient) => patient.pat_id.toString() === id
    );

    if (selectedPatient) {
      setSelectedPatientData(selectedPatient);
      form.setValue("pat_id", selectedPatient.pat_id);
    }
  };

  const handleMedicineSelection = (id: string) => {
    setSelectedMedicineId(id);
    form.setValue("minv_id", id);
  };

  const form = useForm<MedicineRequestType>({
    resolver: zodResolver(MedicineRequestSchema),
    defaultValues: {
      pat_id: "",
      minv_id: "",
      medrec_qty: undefined,
      reason: "",
    },
  });

  const onSubmit = (data: MedicineRequestType) => {
    // Handle form submission
    console.log(data);
    toast.success("Medicine request submitted successfully");
    navigate("/medicine-records");
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
            Medicine Request Form
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage patient medicine requests
          </p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      {/* Patient Selection Section */}
      <div className="bg-white p-6 sm:p-8 rounded-sm shadow-sm border-gray-100 mb-6">
        <h2 className="font-semibold text-blue bg-blue-50 rounded-md mb-4 p-2">
          Patient Information
        </h2>
        <div className="grid gap-2">
          <Combobox
            options={patients.formatted}
            value={selectedPatientId}
            onChange={handlePatientSelection}
            placeholder={loading ? "Loading patients..." : "Select a patient"}
            triggerClassName="font-normal w-full"
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
      </div>

      {/* Medicine Form Section */}
      <div className="bg-white p-6 sm:p-8 rounded-sm shadow-sm border-gray-100">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-2 mb-4 pb-2">
              <h1 className="font-bold text-xl text-darkBlue1">STEP 1</h1>
            </div>

            <h2 className="font-semibold text-blue bg-blue-50 rounded-md">
              Medicine Details
            </h2>

            <div className="grid grid-cols-1 gap-4 medicine-form-section">
              <div className="grid gap-2">
                <Label className="text-sm font-medium text-gray-700">Select Medicine</Label>
                <Combobox
                  options={medicineStocksOptions.map((medicines) => ({
                    id: medicines.id,
                    name: `${medicines.name} (${medicines.dosage}, ${medicines.form}) - Expiry: ${medicines.expiry ? format(new Date(medicines.expiry), 'MM/dd/yyyy') : 'N/A'}`,
                  }))}
                  value={selectedMedicineId}
                  onChange={handleMedicineSelection}
                  placeholder={isLoading ? "Loading medicines..." : "Select medicine"}
                  triggerClassName="font-normal w-full"
                  emptyMessage={
                    <Label className="font-normal text-[13px]">
                      {isLoading ? "Loading..." : "No medicines found."}
                    </Label>
                  }
                />
                 {!selectedMedicineId && (
            <Label className="text-red-500 text-sm mt-1">
              Please select a medicine before submitting the form.
            </Label>
          )}
              </div>
              
              <FormInput
                control={form.control}
                name="medrec_qty"
                label="Quantity"
                type="number"
              />
              
              <FormInput
                control={form.control}
                name="reason"
                label="Reason (Optional)"
                placeholder="Enter reason for medication"
              />
            </div>

            {/* Rest of your form remains the same */}
            {selectedPatientData && (
              <>
                <h2 className="font-semibold text-blue bg-blue-50 rounded-md mt-6">
                  Patient Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <div className="flex flex-col">
                    <Label className="text-sm font-medium text-gray-700">Patient Type</Label>
                    <div className="border rounded-md p-1 bg-gray-100 text-gray-700 h-[36px]">
                      {selectedPatientData?.pat_type || ""}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-sm font-medium text-gray-700">Last Name</Label>
                    <div className="border rounded-md p-1 bg-gray-100 text-gray-700 h-[36px]">
                      {selectedPatientData?.personal_info?.per_lname || ""}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-sm font-medium text-gray-700">First Name</Label>
                    <div className="border rounded-md p-1 bg-gray-100 text-gray-700 h-[36px]">
                      {selectedPatientData?.personal_info?.per_fname || ""}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-sm font-medium text-gray-700">Middle Name</Label>
                    <div className="border rounded-md p-1 bg-gray-100 text-gray-700 h-[36px]">
                      {selectedPatientData?.personal_info?.per_mname || ""}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <div className="flex flex-col">
                    <Label className="text-sm font-medium text-gray-700">Date of Birth</Label>
                    <div className="border rounded-md p-1 bg-gray-100 text-gray-700 h-[36px]">
                      {selectedPatientData?.personal_info?.per_dob 
                        ? format(new Date(selectedPatientData.personal_info.per_dob), 'MM/dd/yyyy')
                        : ""}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-sm font-medium text-gray-700">Age</Label>
                    <div className="border rounded-md p-1 bg-gray-100 text-gray-700 h-[36px]">
                      {selectedPatientData?.personal_info?.per_dob 
                        ? calculateAge(selectedPatientData.personal_info.per_dob) 
                        : ""}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-sm font-medium text-gray-700">Sex</Label>
                    <div className="border rounded-md p-1 bg-gray-100 text-gray-700 h-[36px]">
                      {selectedPatientData?.personal_info?.per_sex || ""}
                    </div>
                  </div>
                </div>

                <h2 className="font-semibold text-blue py-2 bg-blue-50 rounded-md mb-3 mt-6">
                  Address Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <Label className="text-sm font-medium text-gray-700">Street</Label>
                    <div className="border rounded-md p-1 bg-gray-100 text-gray-700 h-[36px]">
                      {selectedPatientData?.address?.add_street || ""}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-sm font-medium text-gray-700">Sitio</Label>
                    <div className="border rounded-md p-1 bg-gray-100 text-gray-700 h-[36px]">
                      {selectedPatientData?.address?.sitio || ""}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-sm font-medium text-gray-700">Barangay</Label>
                    <div className="border rounded-md p-1 bg-gray-100 text-gray-700 h-[36px]">
                      {selectedPatientData?.address?.add_barangay || ""}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-sm font-medium text-gray-700">City</Label>
                    <div className="border rounded-md p-1 bg-gray-100 text-gray-700 h-[36px]">
                      {selectedPatientData?.address?.add_city || ""}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-sm font-medium text-gray-700">Province</Label>
                    <div className="border rounded-md p-1 bg-gray-100 text-gray-700 h-[36px]">
                      {selectedPatientData?.address?.add_province || ""}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-sm font-medium text-gray-700">Household No.</Label>
                    <div className="border rounded-md p-1 bg-gray-100 text-gray-700 h-[36px]">
                      {selectedPatientData?.households?.[0]?.hh_id || ""}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!selectedPatientId || isLoading}
              >
                Submit Request
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}