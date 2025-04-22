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
import { api } from "@/api/api";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Label } from "@/components/ui/label";
import { CircleAlert, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { fetchVaccinesWithStock } from "./restful-api/FetchVaccination";
import { format } from "date-fns";
import { patient } from "@/pages/animalbites/postrequest";
import {calculateNextVisitDate} from "./FunctionHelpers";


export default function VaccinationForm() {
  const navigate = useNavigate();
  const [assignmentOption, setAssignmentOption] = useState<"self" | "other">(
    "self"
  );

  const location = useLocation();
  const { params } = location.state || {};
  const { patientData } = params || {};

  const form = useForm<VaccineSchemaType>({
    resolver: zodResolver(VaccineSchema),
    defaultValues: {
      pat_id: patientData.pat_id || "",
      vaccinetype: "",
      datevaccinated: new Date().toISOString().split("T")[0],
      lname: patientData.lname || "",
      fname: patientData.fname || "",
      mname: patientData.mname || "",
      age: patientData.age || "",
      sex: patientData.sex || "",
      dob: patientData.dob || "",
      householdno: patientData.householdno || "",
      street: patientData.street || "",
      sitio: patientData.sitio || "",
      barangay: patientData.barangay || "",
      city: patientData.city || "",
      province: patientData.province || "",
      assignto: "",
      patientType: patientData.patientType || "Resident",
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
    console.log("Form errors:", form.formState.errors);
  }, [form.formState.errors]);

  const deductVaccineStock = async (vaccineId: number) => {
    try {
      // Get current vaccine stock
      const inventoryList = await api.get("inventory/vaccine_stocks/");

      const existingItem = inventoryList.data.find(
        (item: any) => item.vacStck_id === vaccineId
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

      await api.put(`inventory/vaccine_stocks/${vaccineId}/`, updatePayload);

      // Record the transaction
      const transactionPayload = {
        antt_qty: "1 dose",
        antt_action: "Used from TT",
        staff: 1, // Replace with actual staff ID
        vacStck_id: vaccineId,
      };

      await api.post("inventory/antigens_stocks/", transactionPayload);
      return true;
    } catch (error) {
      console.error("Vaccine stock update failed:", error);
      throw error;
    }
  };





  const onSubmitStep1 = async (data: VaccineSchemaType) => {
    try {
      if (assignmentOption === "other") {
        let patrec_id: string | null = null;
        let vacrec_id: string | null = null;

        try {
          // Step 1: Create patient record
          const serviceResponse = await api.post(
            "patientrecords/patient-record/",
            {
              patrec_type: "Vaccination",
              pat_id: data.pat_id,
              created_at: new Date().toISOString(),
            }
          );
          patrec_id = serviceResponse.data.patrec_id;

          // Step 2: Create vaccination record
          const vaccinationRecordResponse = await api.post(
            "vaccination/vaccination-record/",
            {
              patrec_id: patrec_id,
            }
          );
          vacrec_id = vaccinationRecordResponse.data.vacrec_id;


          // Step 4: Create vaccination history
          await api.post("vaccination/vaccination-history/", {
            vachist_doseNo: 1,
            vachist_status: "forwarded",
            vachist_age: data.age,
            staff_id: 1,
            vacrec: vacrec_id,
            vital: null,
            updated_at: new Date().toISOString(),
            vacStck: data.vaccinetype,
            assigned_to: parseInt(data.assignto, 10),
          });

          toast.success(
            `Form assigned to ${data.assignto} for Step 2 completion!`
          );
          form.reset();
        } catch (error) {
          console.error("Error during submission:", error);

          // Rollback in reverse order of creation
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
      const serviceResponse = await api.post("patientrecords/patient-record/", {
        patrec_type: "Vaccination",
        pat_id: patientData.pat_id,
        created_at: new Date().toISOString(),
      });
      patrec_id = serviceResponse.data.patrec_id;

      // Step 2: Create vaccination record
      const vaccinationRecordResponse = await api.post( "vaccination/vaccination-record/",
        { patrec_id: patrec_id }
      );
      vacrec_id = vaccinationRecordResponse.data.vacrec_id;

      // Step 3: Create vital signs record
      const vitalSignsResponse = await api.post("patientrecords/vital-signs/", {
        vital_bp_systolic: data.bpsystolic?.toString() || "",
        vital_bp_diastolic: data.bpdiastolic?.toString() || "",
        vital_temp: data.temp?.toString() || "",
        vital_RR: "N/A",
        vital_o2: data.o2?.toString() || "",
        created_at: new Date().toISOString(),
      });
      vital_id = vitalSignsResponse.data.vital_id;

      const vacStck = form.getValues("vaccinetype");
      const vacStck_id = parseInt(vacStck, 10);

      // Step 4: Deduct vaccine from stock
      await deductVaccineStock(vacStck_id);

      // Step 5: Create vaccination history with partial status
      const vaccinationhistResponse = await api.post(
        "vaccination/vaccination-history/",
        {
          vachist_doseNo: 0,
          vachist_status: "processing",
          vachist_age: form.getValues("age"),
          staff_id: 1,
          serv_id: patrec_id,
          vacrec: vacrec_id,
          vital: vital_id,
          vacStck: vacStck_id,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          assigned_to: null,
        }
      );
      const vacStckResponse = await api.get( `inventory/vaccine_stocks/${vacStck_id}/`);

      const vaccineData = vacStckResponse.data;

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

          console.log("Next visit should be on:", nextVisitDate.toISOString());
            const followUpVisitResponse = await api.post("patientrecords/follow-up-visit/",
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
    

      vachist_id = vaccinationhistResponse.data.vachist_id;
      console.log("Vaccination history ID:", vachist_id);

      //  Step 4: Get previous dose number for this vaccine and patient
      const previousDoses = await api.get(
        `vaccination/vaccination-history/${vachist_id}/`
      );
      const doseCount = Array.isArray(previousDoses.data)
        ? previousDoses.data.length
        : 0;
      const doseNumber = doseCount + 1;

      const inventoryResponse = await api.get(`inventory/vaccine_stocks/${vacStck}/`);

      const { no_of_doses: maxDoses } = inventoryResponse.data.vaccinelist;
      console.log("Max doses allowed:", maxDoses);

      if (maxDoses === 1) {
        await api.put(`vaccination/vaccination-history/${vachist_id}/`, {
          vachist_doseNo: doseNumber,
          vachist_status: "completed",
        });
        console.log("Vaccination max dose 1 updated successfully");
        toast.success(`Vaccination record created successfully! `);
        return;
      } else if (maxDoses > doseNumber) {
        await api.put(`vaccination/vaccination-history/${vachist_id}/`, {
          vachist_doseNo: doseNumber,
          vachist_status: "Partially Vaccinated",
          followv: followv_id,
        });
        toast.success(`Vaccination record created successfully! `);

        return;
      }

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
  useEffect(() => {
    form.setValue("datevaccinated", format(new Date(), "yyyy-MM-dd"));
  }, [form]);

  return (
    <div>
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

            <h2 className="font-semibold text-blue py-2 bg-blue-50 rounded-md mb-3">
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
                <Button type="submit" className="w-[120px]">
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
