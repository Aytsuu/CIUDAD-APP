
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
import { useLocation, useNavigate } from "react-router-dom";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Label } from "@/components/ui/label";
import { CircleAlert, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { fetchVaccinesWithStockVacID } from "./restful-api/FetchVaccination";
import { format } from "date-fns";
import { calculateNextVisitDate } from "./Calculatenextvisit";
import {
  useSubmitStep1,
  useSubmitStep2,
} from "./queries/UpdateVaccinationQueries";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";



export default function UpdateVaccinationForm() {
  const navigate = useNavigate();
  const [assignmentOption, setAssignmentOption] = useState<"self" | "other">(
    "self"
  );
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData, Vaccination } = params || {};
  const vacId = Number(Vaccination?.vaccine_stock?.vaccinelist?.vac_id); // Convert to number

  console.log("Vac_id:", vacId);

  const { vaccineStocksOptions, isLoading } = fetchVaccinesWithStockVacID(vacId);

  interface OrdinalNumberProps {
    number: number;
    className?: string;
  }

  const OrdinalNumber: React.FC<OrdinalNumberProps> = ({
    number,
    className,
  }) => {
    const suffix = ["th", "st", "nd", "rd"][
      number % 100 >= 11 && number % 100 <= 13 ? 0 : Math.min(number % 10, 4)
    ];
    return (
      <span className={className}>
        {number}
        {suffix} Dose
      </span>
    );
  };

  let displayDoses = Vaccination.vachist_doseNo + 1;

  const renderDoseLabel = (className?: string) => {
    if (Vaccination.vaccine_details.vac_type === "routine") {
      return <span className={className}>Routine</span>;
    } else {
      return <OrdinalNumber number={displayDoses} className={className} />;
    }
  };

  const form = useForm<VaccineSchemaType>({
    resolver: zodResolver(VaccineSchema),
    defaultValues: {
      pat_id: patientData.pat_id || "",
      vaccinetype: "", // Will be set dynamically in useEffect
      datevaccinated: new Date().toISOString().split("T")[0],
      age: patientData.age || "", // Ensure age is set correctly
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
    console.log("Form errors:", form.formState.errors);
  }, [form.formState.errors]);

  useEffect(() => {
    form.setValue("datevaccinated", format(new Date(), "yyyy-MM-dd"));
  }, [form]);

  // Set default vaccinetype based on vacId
  useEffect(() => {
    if (vacId && !isLoading && vaccineStocksOptions.length > 0) {
      const selectedVaccine = vaccineStocksOptions[0]; // Only one vaccine expected
      if (selectedVaccine && selectedVaccine.available) {
        form.setValue("vaccinetype", selectedVaccine.id);
      } else {
        console.warn(`Vaccine with vac_id ${vacId} is not available.`);
        form.setValue("vaccinetype", "");
        let errorMessage = "Selected vaccine is unavailable";
        if (selectedVaccine.isExpired && selectedVaccine.expiryDate) {
          errorMessage += ` (expired on ${format(new Date(selectedVaccine.expiryDate), "MMM dd, yyyy")}).`;
        } else if (selectedVaccine.isOutOfStock) {
          errorMessage += " (out of stock).";
        }
        toast.error(errorMessage, {
          icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
        });
      }
    } else if (vacId && !isLoading && vaccineStocksOptions.length === 0) {
      console.warn(`Vaccine with vac_id ${vacId} not found or archived.`);
      form.setValue("vaccinetype", "");
      toast.error("Vaccine not found or archived.", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
    }
  }, [vacId, vaccineStocksOptions, isLoading, form]);

  // Check if the selected vaccine is available
  const selectedVaccineId = form.watch("vaccinetype");
  const selectedVaccine = vaccineStocksOptions.find(
    (vaccine) => vaccine.id === selectedVaccineId
  );
  const isVaccineAvailable = selectedVaccine?.available ?? false;

  // Format option label with name, expiration date, and stock status
  const formatOptionLabel = (vaccine: typeof vaccineStocksOptions[0]) => {
    let label = vaccine.name;
    if (vaccine.isOutOfStock) {
      label += " (Out of Stock)";
    } else if (vaccine.isExpired && vaccine.expiryDate) {
      label += ` (Expired: ${format(new Date(vaccine.expiryDate), "MMM dd, yyyy")})`;
    } else if (vaccine.expiryDate) {
      label += ` (Expires: ${format(new Date(vaccine.expiryDate), "MMM dd, yyyy")})`;
    }
    return label;
  };

  
  const submitStep1 = useSubmitStep1();
  const submitStep2 = useSubmitStep2();
  const onSubmitStep1 = (data: VaccineSchemaType) => {
    if (!isVaccineAvailable) {
      let errorMessage = "Cannot submit: Selected vaccine is unavailable";
      if (selectedVaccine?.isExpired && selectedVaccine?.expiryDate) {
        errorMessage += ` (expired on ${format(new Date(selectedVaccine.expiryDate), "MMM dd, yyyy")}).`;
      } else if (selectedVaccine?.isOutOfStock) {
        errorMessage += " (out of stock).";
      }
      toast.error(errorMessage, {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
      return;
    }
    submitStep1.mutate({
      data,
      assignmentOption,
      form: {
        setError: form.setError,
        getValues: form.getValues,
        reset: form.reset,
      },
    });
  };

  const onSubmitStep2 = (data: VitalSignsType) => {
    if (!isVaccineAvailable) {
      let errorMessage = "Cannot submit: Selected vaccine is unavailable";
      if (selectedVaccine?.isExpired && selectedVaccine?.expiryDate) {
        errorMessage += ` (expired on ${format(new Date(selectedVaccine.expiryDate), "MMM dd, yyyy")}).`;
      } else if (selectedVaccine?.isOutOfStock) {
        errorMessage += " (out of stock).";
      }
      toast.error(errorMessage, {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
      return;
    }
    submitStep2.mutate({
      data,
      patientId: patientData.pat_id,
      vaccinationData: Vaccination,
      form: {
        setError: form.setError,
        getValues: form.getValues,
        reset: form.reset,
      },
      form2: { reset: form2.reset },
      setAssignmentOption,
      calculateNextVisitDate,
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            {renderDoseLabel()} Vaccination Form
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Please fill up all required fields
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
              <div>
                <FormSelect
                  control={form.control}
                  name="vaccinetype"
                  label="Vaccine Type"
                  options={vaccineStocksOptions.map((vaccine) => ({
                    id: vaccine.id,
                    name: formatOptionLabel(vaccine), // Include expiry and stock status
                    disabled: !vaccine.available, // Disable unavailable vaccines
                  }))}
                  emptyMessage={isLoading ? "Loading..." : "Vaccine unavailable or not found"}
                />
              </div>
              <FormDateTimeInput
                control={form.control}
                name="datevaccinated"
                label="Date Vaccinated"
                type="date"
                readOnly
              />
            </div>

            
 {/* Patient Information Card */}
        <div className="mb-4 bg-white">
          <PatientInfoCard patient={patientData} />
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
                  disabled={submitStep1.isPending || !isVaccineAvailable}
                >
                  {submitStep1.isPending ? "Submitting..." : "Save & Assign"}
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
                  disabled={submitStep2.isPending || !isVaccineAvailable}
                >
                  {submitStep2.isPending ? "Submitting..." : "Complete"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}