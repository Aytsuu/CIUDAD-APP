"use client";

import { useState, useEffect } from "react";
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
import { Link } from "react-router-dom";
import { Combobox } from "@/components/ui/combobox";
import { api } from "@/api/api";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Label } from "@/components/ui/label";
import { CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { fetchVaccinesWithStock } from "./restful-api/FetchVaccinnation";
import { format } from "date-fns";
interface PatientRecord {
  pat_id: string;
  fname: string;
  lname: string;
  mname: string;
  dob: string;
  age: string;
  sex: string;
  householdno: string;
  street: string;
  sitio: string;
  barangay: string;
  city: string;
  province: string;
  pat_type: string;
}

interface FormattedPatient {
  id: string;
  name: string;
}

interface VaccineOption {
  id: string;
  name: string;
}

export default function VaccinationForm() {
  const [assignmentOption, setAssignmentOption] = useState<"self" | "other">(
    "self"
  );
  const [patients, setPatients] = useState<{
    default: PatientRecord[];
    formatted: FormattedPatient[];
  }>({ default: [], formatted: [] });
  const [loading, setLoading] = useState(false);
  const [vaccineLoading, setVaccineLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [vaccineOptions, setVaccineOptions] = useState<VaccineOption[]>([]);

  const form = useForm<VaccineSchemaType>({
    resolver: zodResolver(VaccineSchema),
    defaultValues: {
      pat_id: "",
      vaccinetype: "",
      datevaccinated: "",
      lname: "",
      fname: "",
      mname: "",
      age: "",
      sex: "",
      dob: "",
      householdno: "",
      street: "",
      sitio: "",
      barangay: "",
      city: "",
      province: "",
      assignto: "",
      patientType: "",
    },
  });

  const form2 = useForm<VitalSignsType>({
    resolver: zodResolver(VitalSignsSchema),
    defaultValues: {
      pr: "",
      temp: "",
      o2: "",
      bpsystolic: undefined,
      bpdiastolic: undefined,
    },
  });

  // Fetch patient records
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const response = await api.get("/vaccination/patient-record/");
        const patientData = response.data;
        const formatted = patientData.map((patient: PatientRecord) => ({
          id: patient.pat_id.toString(),
          name: `${patient.lname}, ${patient.fname} ${
            patient.mname || ""
          }`.trim(),
        }));

        setPatients({
          default: patientData,
          formatted,
        });
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error("Failed to load patient records");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handlePatientSelection = (id: string) => {
    setSelectedPatientId(id);
    const selectedPatient = patients.default.find(
      (patient) => patient.pat_id.toString() === id
    );

    if (selectedPatient) {
      form.setValue("pat_id", id);
      form.setValue("lname", selectedPatient.lname);
      form.setValue("fname", selectedPatient.fname);
      form.setValue("mname", selectedPatient.mname || "");
      form.setValue("sex", selectedPatient.sex);
      form.setValue("dob", selectedPatient.dob);
      form.setValue("age", selectedPatient.age);
      form.setValue("householdno", selectedPatient.householdno);
      form.setValue("street", selectedPatient.street);
      form.setValue("sitio", selectedPatient.sitio);
      form.setValue("barangay", selectedPatient.barangay);
      form.setValue("city", selectedPatient.city);
      form.setValue("province", selectedPatient.province);
      form.setValue("patientType", selectedPatient.pat_type || "Regular");
    }
  };

  const resetPatientFields = () => {
    form.reset({
      pat_id: "",
      vaccinetype: form.getValues("vaccinetype"),
      datevaccinated: form.getValues("datevaccinated"),
      lname: "",
      fname: "",
      mname: "",
      sex: "",
      dob: "",
      age: "",
      householdno: "",
      street: "",
      sitio: "",
      barangay: "",
      city: "",
      province: "",
      patientType: "",
      assignto: form.getValues("assignto"),
    });
    setSelectedPatientId("");
  };

  const onSubmitStep1 = async (data: VaccineSchemaType) => {
    try {
      // const validatedData = VaccineSchema.parse(data);
      console.log("Submitting Step 1:", data);
      if (assignmentOption === "other") {
        // 1. First create ServicesRecord with "Vaccination" as service name
        const serviceResponse = await api.post(
          "vaccination/services-records/",
          {
            serv_name: "Vaccination",
            pat_id: data.pat_id,
            created_at: new Date().toISOString(),
          }
        );

        const serv_id = serviceResponse.data.serv_id;

        // 2. Create VaccinationRecord with the generated serv_id
        const vaccinationRecordResponse = await api.post(
          "vaccination/vaccination-record/",
          {
            serv_id: serv_id,
          }
        );

        const vacrec_id = vaccinationRecordResponse.data.vacrec_id;
        const staff_id = 1;
        // 3. Create VaccinationHistory with default values
        await api.post("vaccination/vaccination-history/", {
          vachist_doseNo: "1st dose",
          vachist_status: "forwarded",
          vachist_age: data.age,
          staff_id: staff_id,
          serv_id: serv_id,
          vacrec_id: vacrec_id,
          vital_id: null,
          updated_at: new Date().toISOString(),
          vacStck_id: data.vaccinetype,
          assigned_to: parseInt(data.assignto, 10),
        });

        toast.success(
          `Form assigned to ${data.assignto} for Step 2 completion!`
        );
        form.reset();
        setSelectedPatientId("");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Form submission failed. Please check the fields.");
    }
  };

  const onSubmitStep2 = async (data: VitalSignsType) => {
    try {
      // 1. First create ServicesRecord with "Vaccination" as service name
      const serviceResponse = await api.post("vaccination/services-records/", {
        serv_name: "Vaccination",
        pat_id: form.getValues("pat_id"),
        created_at: new Date().toISOString(),
      });

      const serv_id = serviceResponse.data.serv_id;

      // 2. Create VaccinationRecord with the generated serv_id
      const vaccinationRecordResponse = await api.post(
        "vaccination/vaccination-record/",
        {
          serv_id: serv_id,
        }
      );

      const vacrec_id = vaccinationRecordResponse.data.vacrec_id;

      // 3. Create Vital Signs first
      const vitalSignsResponse = await api.post("vaccination/vital-signs/", {
        vital_bp_systolic: data.bpsystolic?.toString() || "",
        vital_bp_diastolic: data.bpdiastolic?.toString() || "",
        vital_temp: data.temp?.toString() || "",
        vital_RR: "", // Add respiratory rate if available
        vital_o2: data.o2?.toString() || "",
        created_at: new Date().toISOString(),
      });

      const vital_id = vitalSignsResponse.data.vital_id;

      // 4. Create VaccinationHistory with vital signs reference
      await api.post("vaccination/vaccination-history/", {
        vachist_doseNo: "1st dose",
        vachist_status: "completed",
        vachist_age: form.getValues("age"),
        staff_id: 1, // Or get from session/user context
        serv_id: serv_id,
        vacrec_id: vacrec_id,
        vital_id: vital_id, // Link to vital signs
        vacStck_id: form.getValues("vaccinetype"),
        updated_at: new Date().toISOString(),
        assigned_to: null,
      });

      toast.success("Vaccination record created successfully!");
      form.reset();
      form2.reset();
      setSelectedPatientId("");
      setAssignmentOption("self");
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Form submission failed. Please check the form for errors.", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
    }
  };

  // Usage in your component
  const { options, isLoading } = fetchVaccinesWithStock();
  useEffect(() => {
    form.setValue("datevaccinated", format(new Date(), "yyyy-MM-dd"));
  }, [form]);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Vaccination Records
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view patients information
        </p>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitStep1)} className="space-y-6">
          <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label className="text-black/70">Patients</Label>
          </div>


          <div  className="grid gap-2 grid-cols-1 sm:grid-cols-2 ">
          <Combobox
              options={patients.formatted}
              value={selectedPatientId}
              onChange={handlePatientSelection}
              placeholder={loading ? "Loading patients..." : "Select a patient"}
              triggerClassName="font-normal"
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
          <div className="flex items-center gap-2 mb-4 pb-2">
            <h1 className="font-bold text-xl text-darkBlue1">STEP</h1>

            <div className="bg-darkBlue1 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
              1
            </div>
          </div>
          <h2 className="font-semibold text-blue   bg-blue-50 rounded-md ">
            Vaccination Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormSelect
              control={form.control}
              name="vaccinetype"
              label="Vaccine Type"
              options={options}
              isLoading={isLoading}
              emptyMessage="No vaccine stocks available. Please check inventory."
            />

            <FormDateTimeInput
              control={form.control}
              name="datevaccinated"
              type="date"
              label="Date Vaccinated"
            />
          </div>

          <h2 className="font-semibold text-blue   bg-blue-50 rounded-md ">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormSelect
              control={form.control}
              name="patientType"
              label="Patient Type"
              options={[
                { id: "Resident", name: "Resident" },
                { id: "Transient", name: "Transient" },
                { id: "Regular", name: "Regular" },
              ]}
            />
            <FormInput
              control={form.control}
              name="lname"
              label="Last Name"
              readOnly
            />
            <FormInput
              control={form.control}
              name="fname"
              label="First Name"
              readOnly
            />
            <FormInput
              control={form.control}
              name="mname"
              label="Middle Name"
              readOnly
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormDateTimeInput
              control={form.control}
              name="dob"
              label="Date of Birth"
              type="date"
              readOnly
            />
            <FormInput
              control={form.control}
              name="age"
              label="Age"
              type="number"
              readOnly
            />
            <FormSelect
              control={form.control}
              name="sex"
              label="Sex"
              options={[
                { id: "female", name: "Female" },
                { id: "male", name: "Male" },
              ]}
              readOnly
            />
          </div>

          <h2 className="font-semibold text-blue py-2  bg-blue-50 rounded-md mb-3">
            Address Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput
              control={form.control}
              name="householdno"
              label="Household No."
              readOnly
            />
            <FormInput
              control={form.control}
              name="street"
              label="Street"
              readOnly
            />
            <FormInput
              control={form.control}
              name="sitio"
              label="Sitio"
              readOnly
            />
            <FormInput
              control={form.control}
              name="barangay"
              label="Barangay"
              readOnly
            />
            <FormInput
              control={form.control}
              name="city"
              label="City"
              readOnly
            />
            <FormInput
              control={form.control}
              name="province"
              label="Province"
              readOnly
            />
          </div>

          <div className="space-y-4 border p-5 rounded-md bg-gray-50 shadow-sm">
            <h2 className="font-bold text-darkBlue1 mb-3">Step 2 Assignment</h2>
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
                onClick={resetPatientFields}
              >
                Cancel
              </Button>
              <Button type="submit" className="w-[120px] ">
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
              <div className="flex items-center gap-2 mb-4 pb-2 ">
                <h1 className="font-bold text-xl text-darkBlue1">STEP</h1>

                <div className="bg-darkBlue1 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4  bg-white  ">
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
            <h2 className="font-semibold text-blue   bg-blue-50 rounded-md ">
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

            <div className="flex justify-end gap-3 pt-6 pb-2">
              <Button
                type="button"
                variant="outline"
                className="w-[120px] border-gray-300 hover:bg-gray-50"
                onClick={() => setAssignmentOption("other")}
              >
                Back
              </Button>
              <Button type="submit" className="w-[120px]">
                Complete
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
