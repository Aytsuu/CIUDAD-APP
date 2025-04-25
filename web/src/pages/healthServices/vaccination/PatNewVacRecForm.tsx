"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodError } from "zod";
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
import { api } from "@/api/api";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Label } from "@/components/ui/label";
import { CircleAlert, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { fetchVaccinesWithStock } from "./restful-api/FetchVaccination";
import { format } from "date-fns";
import { calculateNextVisitDate } from "./FunctionHelpers";
import { calculateAge } from "@/helpers/ageCalculator";
import {fetchPatientRecords} from "./restful-api/FetchPatient";

export default function PatNewVacRecForm() {
  const navigate = useNavigate();
  const [assignmentOption, setAssignmentOption] = useState<"self" | "other">(
    "self"
  );
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
      const residentProfile = selectedPatient.resident_profile?.[0];
      const household = selectedPatient.households?.[0];

      // Update form values
      form.setValue("pat_id", selectedPatient.pat_id);
      form.setValue("lname", personalInfo?.per_lname || "");
      form.setValue("fname", personalInfo?.per_fname || "");
      form.setValue("mname", personalInfo?.per_mname || "");
      form.setValue("sex", personalInfo?.per_sex || "");
      form.setValue("dob", personalInfo?.per_dob || "");
      form.setValue("age", `${calculateAge(personalInfo?.per_dob)} old`);
      form.setValue("patientType", selectedPatient.pat_type || "Resident");

      // Set address information if available
      if (household) {
        form.setValue("householdno", household.hh_id || "");
        form.setValue("street", household.hh_street || "");
        form.setValue("barangay", household.hh_barangay || "");
        form.setValue("city", household.hh_city || "");
        form.setValue("province", household.hh_province || "");
      }
    }
  };


  

  const form = useForm<VaccineSchemaType>({
    resolver: zodResolver(VaccineSchema),
    defaultValues: {
      pat_id: undefined,
      vaccinetype: "",
      datevaccinated: new Date().toISOString().split("T")[0],
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
      patientType: "Resident",
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

  useEffect(() => {
    form.setValue("datevaccinated", format(new Date(), "yyyy-MM-dd"));
  }, [form]);

  const deductVaccineStock = async (vacStck_id: number) => {
    try {
      const inventoryList = await api.get("inventory/vaccine_stocks/");

      const existingItem = inventoryList.data.find(
        (item: any) => item.vacStck_id === vacStck_id
      );
      if (!existingItem) {
        throw new Error("Vaccine item not found. Please check the ID.");
      }

      const currentQtyAvail = existingItem.vacStck_qty_avail;
      const existingUsedItem = existingItem.vacStck_used;

      if (currentQtyAvail < 1) {
        throw new Error("Insufficient vaccine stock available.");
      }

      const updatePayload = {
        vacStck_qty_avail: currentQtyAvail - 1,
        vacStck_used: existingUsedItem + 1,
      };

      await api.put(`inventory/vaccine_stocks/${vacStck_id}/`, updatePayload);

      const transactionPayload = {
        antt_qty: "1 dose",
        antt_action: "Used from TT",
        staff: 1,
        vacStck_id: vacStck_id,
      };

      await api.post("inventory/antigens_stocks/", transactionPayload);
      return true;
    } catch (error) {
      console.error("Vaccine stock update failed:", error);
      throw error;
    }
  };

  const onSubmitStep1 = async (data: VaccineSchemaType) => {
    if (!selectedPatientId) {
      toast.error("Please select a patient first");
      return;
    }
    // Add this validation
    if (!data.vaccinetype) {
      form.setError("vaccinetype", {
        type: "manual",
        message: "Please select a vaccine type",
      });
      toast.error("Please select a vaccine type");
      return;
    }

    try {
      if (assignmentOption === "other") {
        let patrec_id: string | null = null;
        let vacrec_id: string | null = null;

        const vacStck = form.getValues("vaccinetype");
        const vacStck_id = parseInt(vacStck, 10);
        const vacStckResponse = await api.get(
          `inventory/vaccine_stocks/${vacStck_id}/`
        );
        // const vaccineData = vacStckResponse.data;

        const { no_of_doses: maxDoses } = vacStckResponse.data.vaccinelist;
        console.log("Max doses allowed:", maxDoses);

        try {
          const serviceResponse = await api.post(
            "patientrecords/patient-record/",
            {
              patrec_type: "Vaccination",
              pat_id: form.getValues("pat_id"),
              created_at: new Date().toISOString(),
            }
          );
          patrec_id = serviceResponse.data.patrec_id;

          const vaccinationRecordResponse = await api.post(
            "vaccination/vaccination-record/",
            {
              patrec_id: patrec_id,
              vacrec_status: "forwarded",
              vacrec_totaldose: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          );
          vacrec_id = vaccinationRecordResponse.data.vacrec_id;

          await api.post("vaccination/vaccination-history/", {
            vachist_doseNo: 0,
            vachist_status: "forwarded",
            vachist_age: data.age,

            staff_id: 1,
            vacrec: vacrec_id,
            vital: null,
            created_at: new Date().toISOString(),
            vacStck: data.vaccinetype,
            assigned_to: parseInt(data.assignto, 10),
          });

          toast.success(
            `Form assigned to ${data.assignto} for Step 2 completion!`
          );
          form.reset();
        } catch (error) {
          console.error("Error during submission:", error);

          try {
            if (vacrec_id) {
              await api.delete(`vaccination/vaccination-record/${vacrec_id}/`);
            }
          } catch (deleteError) {
            console.error(
              "Error rolling back vaccination record:",
              deleteError
            );
          }

          try {
            if (patrec_id) {
              await api.delete(`patientrecords/patient-record/${patrec_id}/`);
            }
          } catch (deleteError) {
            console.error("Error rolling back patient record:", deleteError);
          }

          throw error;
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Form submission failed. Please check the fields.", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
    }
  };

  const onSubmitStep2 = async (data: VitalSignsType) => {
    // First check if form2 (Step 2) is valid
    const vaccineType = form.getValues("vaccinetype");

    // Check if vaccine type is selected
    if (!vaccineType) {
      form.setError("vaccinetype", {
        type: "manual",
        message: "Please select a vaccine type",
      });
      toast.error("Please select a vaccine type");
      return;
    }

    let patrec_id: string | null = null;
    let vacrec_id: string | null = null;
    let vital_id: string | null = null;
    let vachist_id: string | null = null;
    let followv_id: string | null = null;

    try {
      // Step 1: Create patient record
      const vacStck = form.getValues("vaccinetype");
      const vacStck_id = parseInt(vacStck, 10);
      const vacStckResponse = await api.get(
        `inventory/vaccine_stocks/${vacStck_id}/`
      );
      const vaccineData = vacStckResponse.data;

      const maxDoses  = vacStckResponse.data.vaccinelist.no_of_doses;
      console.log("Max doses allowed:", maxDoses);

      // Step 1: Create patient record
      const serviceResponse = await api.post("patientrecords/patient-record/", {
        patrec_type: "Vaccination",
        pat_id: selectedPatientId,
        created_at: new Date().toISOString(),
      });
      patrec_id = serviceResponse.data.patrec_id;

      let vaccinationRecordResponse;
      // Step 2: Create vaccination record
      // const vaccinationRecordResponse = await api.post( "vaccination/vaccination-record/",
      //   {

      //     patrec_id: patrec_id,
      //     vacrec_status: "processing",
      //     varec_total_doses: maxDoses,

      //    }

      // );

      if (maxDoses === 1) {
        vaccinationRecordResponse = await api.post(
          "vaccination/vaccination-record/",
          {
            patrec_id: patrec_id,
            vacrec_status: "completed",
            vacrec_totaldose: maxDoses,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        );
        vacrec_id = vaccinationRecordResponse.data.vacrec_id;
      } else {
        vaccinationRecordResponse = await api.post(
          "vaccination/vaccination-record/",
          {
            patrec_id: patrec_id,
            vacrec_status: "partially vaccinated",
            vacrec_totaldose: maxDoses,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        );
        vacrec_id = vaccinationRecordResponse.data.vacrec_id;
      }

      // Step 3: Create vital signs record
      const vitalSignsResponse = await api.post("patientrecords/vital-signs/", {
        vital_bp_systolic: data.bpsystolic?.toString() || "",
        vital_bp_diastolic: data.bpdiastolic?.toString() || "",
        vital_temp: data.temp?.toString() || "",
        vital_RR: "N/A",
        vital_o2: data.o2?.toString() || "",
        vital_pulse: data.pr?.toString() || "",

        created_at: new Date().toISOString(),
      });
      vital_id = vitalSignsResponse.data.vital_id;

      // Step 4: Deduct vaccine from stock
      await deductVaccineStock(vacStck_id);

      let vac_type_choices = vaccineData.vaccinelist.vac_type_choices;

      if (vac_type_choices === "routine") {
        let interval = vaccineData.vaccinelist.routine_frequency.interval;
        let time_unit = vaccineData.vaccinelist.routine_frequency.time_unit;

        console.log("Interval:", interval);
        console.log("Time unit:", time_unit);
        const nextVisitDate = calculateNextVisitDate(
          interval,
          time_unit,
          new Date().toISOString()
        );

        console.log("Next visit should be on:", nextVisitDate.toISOString());
        const followUpVisitResponse = await api.post(
          "patientrecords/follow-up-visit/",
          {
            followv_date: nextVisitDate.toISOString().split("T")[0], // Ensure date format matches 'datefield'
            patrec: patrec_id,
            followv_status: "pending",
            created_at: new Date().toISOString(),
          }
        );
        followv_id = followUpVisitResponse.data.followv_id;

      } else {
        if (vaccineData.vaccinelist.no_of_doses >= 2) {
          const dose2Interval = vaccineData.vaccinelist.intervals.find(
            (interval: {
              dose_number: number;
              interval: number;
              time_unit: string;
            }) => interval.dose_number === 2
          );

          if (dose2Interval) {
            const nextVisitDate = calculateNextVisitDate(
              dose2Interval.interval,
              dose2Interval.time_unit,
              new Date().toISOString()
            );

            console.log(
              "Next visit should be on:",
              nextVisitDate.toISOString()
            );
            const followUpVisitResponse = await api.post(
              "patientrecords/follow-up-visit/",
              {
                followv_date: nextVisitDate.toISOString().split("T")[0], // Ensure date format matches 'datefield'
                patrec: patrec_id,
                followv_status: "pending",
                created_at: new Date().toISOString(),
              }
            );
            followv_id = followUpVisitResponse.data.followv_id;
          }
        }
      }

      if (maxDoses === 1) {
        // Step 5: Create vaccination history with partial status
        await api.post("vaccination/vaccination-history/", {
          vachist_doseNo: 1,
          vachist_age: form.getValues("age"),
          vachist_status: "completed",

          created_at: new Date().toISOString(),
          staff_id: 1,
          vital: vital_id,
          vacStck: vacStck_id,
          assigned_to: null,
          vacrec: vacrec_id,
          followv: followv_id,
        });
      } else {
        // Step 5: Create vaccination history with partial status
        await api.post("vaccination/vaccination-history/", {
          vachist_doseNo: 1,
          vachist_age: form.getValues("age"),
          vachist_status: "partially Vaccinated",

          created_at: new Date().toISOString(),
          staff_id: 1,
          vital: vital_id,
          vacStck: vacStck_id,
          assigned_to: null,
          vacrec: vacrec_id,
          followv: followv_id,
        });
      }

      // vachist_id = vaccinationhistResponse.data.vachist_id;
      // console.log("Vaccination history ID:", vachist_id);

      // //  Step 4: Get previous dose number for this vaccine and patient
      // const previousDoses = await api.get(`vaccination/vaccination-history/${vachist_id}/`);
      // const doseCount = Array.isArray(previousDoses.data)? previousDoses.data.length: 0;
      // const doseNumber = doseCount + 1;

      // if (maxDoses === 1) {
      //   await api.put(`vaccination/vaccination-history/${vachist_id}/`, {
      //     vachist_doseNo: doseNumber,
      //     vachist_status: "completed",
      //   });
      //   console.log("Vaccination max dose 1 updated successfully");
      //   toast.success(`Vaccination record created successfully! `);
      //   return;
      // } else if (maxDoses > doseNumber) {
      //   await api.put(`vaccination/vaccination-history/${vachist_id}/`, {
      //     vachist_doseNo: doseNumber,
      //     vachist_status: "Partially Vaccinated",
      //     followv: followv_id,
      //   });

      //   return;
      // }

      toast.success(`Vaccination record created successfully!`);

      form.reset();
      form2.reset();
      setAssignmentOption("self");
    } catch (error) {
      console.error("Form submission error:", error);

      // Rollback in reverse order of creation
      try {
        if (vital_id) {
          await api.delete(`patientrecords/vital-signs/${vital_id}/`);
        }
      } catch (deleteError) {
        console.error("Error rolling back vital signs:", deleteError);
      }

      try {
        if (vacrec_id) {
          await api.delete(`vaccination/vaccination-record/${vacrec_id}/`);
        }
      } catch (deleteError) {
        console.error("Error rolling back vaccination record:", deleteError);
      }

      try {
        if (patrec_id) {
          await api.delete(`patientrecords/patient-record/${patrec_id}/`);
        }
      } catch (deleteError) {
        console.error("Error rolling back patient record:", deleteError);
      }

      try {
        if (followv_id) {
          await api.delete(`patientrecords/follow-up-visit/${followv_id}/`);
        }
      } catch (deleteError) {
        console.error("Error rolling back follow-up visit:", deleteError);
      }

      try {
        if (vachist_id) {
          await api.delete(`vaccination/vaccination-history/${vachist_id}/`);
        }
      } catch (deleteError) {
        console.error("Error rolling back vaccination history:", deleteError);
      }
      toast.error("Form submission failed. Please check the form for errors.", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
    }
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
              <FormSelect
                control={form.control}
                name="patientType"
                label="Patient Type"
                options={[
                  { id: "Resident", name: "Resident" },
                  { id: "Transient", name: "Transient" },
                  { id: "Regular", name: "Regular" },
                ]}
                readOnly
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

            <h2 className="font-semibold text-blue py-2 bg-blue-50 rounded-md mb-3">
              Address Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormInput
                control={form.control}
                name="householdno"
                label="Household No."
              />
              <FormInput control={form.control} name="street" label="Street" />
              <FormInput control={form.control} name="sitio" label="Sitio" />
              <FormInput
                control={form.control}
                name="barangay"
                label="Barangay"
              />
              <FormInput control={form.control} name="city" label="City" />
              <FormInput
                control={form.control}
                name="province"
                label="Province"
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
