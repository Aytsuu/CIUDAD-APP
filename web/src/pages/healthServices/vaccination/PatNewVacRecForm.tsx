"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VaccineSchema, type VaccineSchemaType } from "@/form-schema/vaccineSchema";
import { VitalSignsSchema, type VitalSignsType } from "@/form-schema/vaccineSchema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useNavigate } from "react-router-dom";
import { Combobox } from "@/components/ui/combobox";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Label } from "@/components/ui/label";
import { CircleAlert, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { fetchVaccinesWithStock } from "./restful-api/Vaccination/FetchVaccination";
import { format } from "date-fns";
import { calculateAge } from "@/helpers/ageCalculator";
import { fetchPatientRecords } from "./restful-api/FetchPatient";
import { useSubmitStep1, useSubmitStep2 } from "./queries/PatnewrecQueries";

export default function PatNewVacRecForm() {
  const navigate = useNavigate();
  const [assignmentOption, setAssignmentOption] = useState<"self" | "other">("self");
  const [patients, setPatients] = useState({
    default: [] as any[],
    formatted: [] as { id: string; name: string }[],
  });
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedPatientData, setSelectedPatientData] = useState<any>(null);

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      try {
        const data = await fetchPatientRecords();
        setPatients(data);
      } catch (error) {
        // Error already handled with toast inside fetchPatientRecords
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, []);

  // Handle patient selection
  const handlePatientSelection = (id: string) => {
    setSelectedPatientId(id);
    const selectedPatient = patients.default.find(
      (patient) => patient.pat_id.toString() === id
    );

    if (selectedPatient) {
      setSelectedPatientData(selectedPatient);
      const personalInfo = selectedPatient.personal_info;

      // Update form values
      form.setValue("pat_id", selectedPatient.pat_id);
    }
  };

  const form = useForm<VaccineSchemaType>({
    resolver: zodResolver(VaccineSchema),
    defaultValues: {
      pat_id: undefined,
      vaccinetype: "",
      datevaccinated: new Date().toISOString().split("T")[0],
      assignto: "",
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
  }, [form]);

  const submitStep1 = useSubmitStep1();

  const onSubmitStep1 = (data: VaccineSchemaType) => {
    submitStep1.mutate({
      data,
      selectedPatientId: selectedPatientId, // Your state variable
      assignmentOption: assignmentOption, // Your state variable
      form: {
        setError: form.setError,
        getValues: form.getValues,
        reset: form.reset,
      },
    });
  };

  const submitStep2 = useSubmitStep2();
  const onSubmitStep2 = (data: VitalSignsType) => {
    submitStep2.mutate({
      data,
      selectedPatientId,
      form: { 
        setError: form.setError, // Use form.setError instead of form2.setError
        getValues: form.getValues, // Use form.getValues
        reset: form.reset // Use form.reset
      },
      form2: { reset: form2.reset },
    });
  };

  const { vaccineStocksOptions, isLoading } = fetchVaccinesWithStock();

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
            Manage patient vaccinations
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
              <FormSelect
                control={form.control}
                name="vaccinetype"
                label="Vaccine Type"
                options={vaccineStocksOptions.map((vaccine) => ({
                  id: vaccine.id,
                  name: `${vaccine.name} (Expiry: ${vaccine.expiry})`,
                }))}
                isLoading={isLoading}
                emptyMessage="No vaccine stocks available. Please check inventory."
              />
              <FormDateTimeInput
                control={form.control}
                name="datevaccinated"
                label="Date Vaccinated"
                type="date"
                readOnly
              />
            </div>

            <h2 className="font-semibold text-blue bg-blue-50 rounded-md">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <Label className="text-sm font-medium text-gray-700">Date of Birth</Label>
                <div className="border rounded-md p-1 bg-gray-100 text-gray-700 h-[36px]">
                  {selectedPatientData?.personal_info?.per_dob || ""}
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

            <h2 className="font-semibold text-blue py-2 bg-blue-50 rounded-md mb-3">
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
                  <FormSelect
                    control={form.control}
                    name="assignto"
                    label="Assigned Step 2 to"
                    options={[
                      { id: "1", name: "Keneme" },
                      { id: "2", name: "Dr. Smith" },
                      { id: "3", name: "Nurse Johnson" },
                    ]}
                  />
                </div>
              )}
            </div>

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
                  disabled={!selectedPatientId}
                >
                  Save & Assign
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
                  disabled={!selectedPatientId}
                >
                  Complete
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}