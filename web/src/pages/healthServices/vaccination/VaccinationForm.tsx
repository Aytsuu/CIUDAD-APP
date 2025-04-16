"use client";

import React from "react";
import { Button } from "@/components/ui/button/button";
import { Form, FormLabel } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VaccineSchema, type VaccineSchemaType } from "@/form-schema/vaccineSchema";
import { VitalSignsSchema, type VitalSignsType } from "@/form-schema/vaccineSchema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link } from "react-router-dom";
import { Combobox } from "@/components/ui/combobox";
import api from "@/api/api";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateInput } from "@/components/ui/form/form-date-input";
import { Label } from "@/components/ui/label";
import { CircleAlert } from "lucide-react";
import { toast } from "sonner";

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

export default function VaccinationForm() {
  const [assignmentOption, setAssignmentOption] = React.useState<"self" | "other">("self");
  const [patients, setPatients] = React.useState<{
    default: PatientRecord[];
    formatted: FormattedPatient[];
  }>({ default: [], formatted: [] });
  const [loading, setLoading] = React.useState(false);
  const [selectedPatientId, setSelectedPatientId] = React.useState("");

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
      bpsystolic: 0,
      bpdiastolic: 0,
    },
  });

  // Fetch patient records on component mount
  React.useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const response = await api.get("/vaccination/patient-record/");
        const patientData = response.data;
        
        const formatted = patientData.map((patient: PatientRecord) => ({
          id: patient.pat_id.toString(),
          name: `${patient.lname}, ${patient.fname} ${patient.mname || ''}`.trim()
        }));
        
        setPatients({
          default: patientData,
          formatted
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
    const selectedPatient = patients.default.find(patient => patient.pat_id.toString() === id);
    
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
      patientType: "Regular",
      assignto: form.getValues("assignto"),
    });
    setSelectedPatientId("");
  };

  const onSubmitStep1 = async (data: VaccineSchemaType) => {
    try {
      const validatedData = VaccineSchema.parse(data);
      if (assignmentOption === "other") {
        toast.success(`Form assigned to ${data.assignto} for Step 2 completion!`);
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
      const validatedData = VitalSignsSchema.parse(data);
      const completeData = {
        patient: {
          ...form.getValues(),
        },
        vital_signs: validatedData,
        vaccine_type: form.getValues("vaccinetype"),
        date_vaccinated: form.getValues("datevaccinated")
      };

      await api.post("/vaccinations", completeData);

      form.reset();
      form2.reset();
      setAssignmentOption("self");
      setSelectedPatientId("");

      toast.success("Vaccination record created successfully!");
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Form submission failed. Please check the form for errors.", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
    }
  };

  return (
    <div className="bg-white p-10 rounded-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitStep1)} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full m-1">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
              <div className="w-full sm:w-[400px]">
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

            <div className="flex justify-end w-full sm:w-auto sm:ml-auto">
              <FormInput
                control={form.control}
                name="patientType"
                label="Patient Type"
                placeholder="Patient Type"
                readOnly
              />
            </div>
          </div>

          <h1 className="font-extrabold text-darkBlue1">STEP 1</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="vaccinetype"
              label="Vaccine Type"
              options={[
                { id: "flu", name: "Flu" },
                { id: "covid", name: "Covid" },
                { id: "pneumonia", name: "Pneumonia" },
                { id: "hepatitis", name: "Hepatitis" },
              ]}
            />

            <FormDateInput
              control={form.control}
              name="datevaccinated"
              label="Date Vaccinated"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <FormInput
              control={form.control}
              name="age"
              label="Age"
              type="number"
              readOnly
            />
            <FormDateInput
              control={form.control}
              name="dob"
              label="Date of Birth"
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

          <h2 className="font-bold text-blue">Address</h2>

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

          <div className="space-y-4 border p-4 rounded-md">
            <h2 className="font-bold text-darkBlue1">Step 2 Options</h2>
            <RadioGroup
              defaultValue="self"
              value={assignmentOption}
              onValueChange={(value) => setAssignmentOption(value as "self" | "other")}
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
            <div className="flex justify-end gap-3 pt-4 bg-white pb-2">
              <Button
                variant="outline"
                className="w-[120px]"
                type="button"
                onClick={resetPatientFields}
              >
                Cancel
              </Button>
              <Button type="submit" className="w-[120px]">
                Save & Assign
              </Button>
            </div>
          )}
        </form>
      </Form>

      {assignmentOption === "self" && (
        <Form {...form2}>
          <form onSubmit={form2.handleSubmit(onSubmitStep2)} className="space-y-6 mt-8">
            <div className="flex justify-between items-center">
              <h1 className="font-extrabold text-darkBlue1">STEP 2: Vital Signs</h1>
              <div className="text-sm text-muted-foreground">
                Patient: {form.watch("fname")} {form.watch("lname")}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormInput
                control={form2.control}
                name="pr"
                label="Pulse Rate (bpm)"
                placeholder="Enter pulse rate"
              />
              <FormInput
                control={form2.control}
                name="temp"
                label="Temperature (°C)"
                placeholder="Enter temperature"
              />
              <FormInput
                control={form2.control}
                name="o2"
                label="Oxygen Saturation (%)"
                placeholder="Enter SpO2 level"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center pt-3">
              <FormLabel className="font-medium text-black/65">Blood Pressure</FormLabel>
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
            </div>

            <div className="flex justify-end gap-3 pt-4 bg-white pb-2">
              <Button
                type="button"
                variant="outline"
                className="w-[120px]"
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