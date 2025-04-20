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
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Combobox } from "@/components/ui/combobox";
import {api} from "@/api/api";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Label } from "@/components/ui/label";
import { CircleAlert,ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { fetchVaccinesWithStock  } from "./restful-api/FetchVaccination";
import { format } from "date-fns";

export default function VaccinationForm() {
  const navigate = useNavigate();
  const [assignmentOption, setAssignmentOption] = useState<"self" | "other">(
    "self"
  );
  const [vaccineLoading, setVaccineLoading] = useState(false);
  const location = useLocation();
  const { params } = location.state || {};
  const {patientData} = params || {};

  console.log("Vaccination Form Data:", patientData);
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

  const onSubmitStep1 = async (data: VaccineSchemaType) => {
    try {
      console.log("Submitting Step 1:", data);
      if (assignmentOption === "other") {
        const serviceResponse = await api.post(
          "patientrecords/patient-record/",
          {
            patrec_type: "Vaccination",
            pat_id: data.pat_id,
            created_at: new Date().toISOString(),
          }
        );

        const patrec_id = serviceResponse.data.patrec_id;

        const vaccinationRecordResponse = await api.post(
          "vaccination/vaccination-record/",
          {
            patrec_id: patrec_id,
          }
        );
        const vacrec_id = vaccinationRecordResponse.data.vacrec_id;
        const staff_id = 1;

        await api.post("vaccination/vaccination-history/", {
          vachist_doseNo: "1st dose",
          vachist_status: "forwarded",
          vachist_age: data.age,
          staff_id: staff_id,
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
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Form submission failed. Please check the fields.");
    }
  };

  const onSubmitStep2 = async (data: VitalSignsType) => {
    try {
      const serviceResponse = await api.post(  "patientrecords/patient-record/",{
        patrec_type: "Vaccination",
        pat_id: patientData.pat_id,
        created_at: new Date().toISOString(),
      });

      const patrec_id = serviceResponse.data.patrec_id;

      console.log("Submitting Step 2:", patrec_id);
      const vaccinationRecordResponse = await api.post(
        "vaccination/vaccination-record/",
        {
          patrec_id: patrec_id,
        }
      );

      const vacrec_id = vaccinationRecordResponse.data.vacrec_id;

      const vitalSignsResponse = await api.post("vaccination/vital-signs/", {
        vital_bp_systolic: data.bpsystolic?.toString() || "",
        vital_bp_diastolic: data.bpdiastolic?.toString() || "",
        vital_temp: data.temp?.toString() || "",
        vital_RR: "",
        vital_o2: data.o2?.toString() || "",
        created_at: new Date().toISOString(),
      });

      const vital_id = vitalSignsResponse.data.vital_id;

      await api.post("vaccination/vaccination-history/", {
        vachist_doseNo: "1st dose",
        vachist_status: "completed",
        vachist_age: form.getValues("age"),
        staff_id: 1,
        serv_id: patrec_id,
        vacrec_id: vacrec_id,
        vital_id: vital_id,
        vacStck_id: form.getValues("vaccinetype"),
        updated_at: new Date().toISOString(),
        assigned_to: null,
      });

      toast.success("Vaccination record created successfully!");
      form.reset();
      form2.reset();
      setAssignmentOption("self");
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Form submission failed. Please check the form for errors.", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
    }
  };

  const { options, isLoading } = fetchVaccinesWithStock();
  useEffect(() => {
    form.setValue("datevaccinated", format(new Date(), "yyyy-MM-dd"));
  }, [form]);

  return (
    <div >
       <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant={"outline"}
          onClick={() => {
           navigate(-1);
          }}
        >
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Medical Consultation
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view patients information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <div className="bg-white p-6 sm:p-8 rounded-sm shadow-sm  border-gray-100 ">

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitStep1)} className="space-y-6">
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
              label="Date Vaccinated"
              type="date"
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
            />
            <FormInput
              control={form.control}
              name="fname"
              label="First Name"
            />
            <FormInput
              control={form.control}
              name="mname"
              label="Middle Name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormDateTimeInput
              control={form.control}
              name="dob"
              label="Date of Birth"
              type="date"
            />
            <FormInput
              control={form.control}
              name="age"
              label="Age"
              type="number"
            />
            <FormSelect
              control={form.control}
              name="sex"
              label="Sex"
              options={[
                { id: "female", name: "Female" },
                { id: "male", name: "Male" },
              ]}
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
            />
            <FormInput
              control={form.control}
              name="street"
              label="Street"
            />
            <FormInput
              control={form.control}
              name="sitio"
              label="Sitio"
            />
            <FormInput
              control={form.control}
              name="barangay"
              label="Barangay"
            />
            <FormInput
              control={form.control}
              name="city"
              label="City"
            />
            <FormInput
              control={form.control}
              name="province"
              label="Province"
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
                onClick={() => form.reset()}
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
    </div>
  );
}