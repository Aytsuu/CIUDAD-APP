import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  VitalSignsSchema,
  type VitalSignsType,
} from "@/form-schema/vaccineSchema";
import { useLocation, useNavigate } from "react-router-dom";
import { api2 } from "@/api/api";
import { FormInput } from "@/components/ui/form/form-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { AlertCircle, ChevronLeft, Loader2 } from "lucide-react";
import {
  createVitalSigns,
} from "../../forwardedrecord/restful-api/vitalsignsAPI";
import { updateVaccinationHistory } from "../restful-api/update";
import { deleteVitalSigns } from "@/pages/healthServices/vaccination/restful-api/delete";
import { getVaccineStock } from "@/pages/healthServices/vaccination/restful-api/get";
import { format } from "date-fns";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import CardLayout from "@/components/ui/card/card-layout";
import { useStep2VaccinationMutation } from "../queries/Step2Vaccination";
import { Patient } from "../../restful-api-patient/type";


export default function ForwardedVaccinationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { params } = location.state || {};
  const {
    vaccineName,
    vaccineType,
    vaccineDose,
    maxDoses,
    follow_up_visit,
  } = params || {};

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

  const mutation = useStep2VaccinationMutation();
  const [selectedPatientData, setSelectedPatientData] =
    useState<Patient | null>(null);
  const [isSubmitConfirmationOpen, setIsSubmitConfirmationOpen] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.params?.patientData) {
      const patientData = location.state.params.patientData;
      setSelectedPatientData(patientData);
    }
  }, [location.state]);

  const submit = async (data: VitalSignsType) => {
    setIsSubmitting(true);
    try {
      await mutation.mutateAsync({ data, params });
      navigate(-1);
    } catch (error) {
      console.error("Error during submission:", error);
    } finally {
      setIsSubmitting(false);
      setIsSubmitConfirmationOpen(false);
    }
  };


  const handleConfirmSubmit = () => {
    setIsSubmitConfirmationOpen(false);
    form.handleSubmit(submit)();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await form.trigger();
    if (isValid) {
      setIsSubmitConfirmationOpen(true);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 ">
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

        <CardLayout
          content={
            <>
              <h3 className="font-semibold text-lg text-blue-800 mb-4">
                Vaccination Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vaccine Information */}
                <div className="">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Vaccine Name</p>
                      <p className="font-medium text-gray-800">
                        {vaccineName || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vaccine Type</p>
                      <p className="font-medium text-gray-800">
                        {vaccineType || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dose</p>
                      <p className="font-medium text-gray-800">
                        {vaccineDose
                          ? `${vaccineDose}${
                              ["st", "nd", "rd"][(vaccineDose % 10) - 1] || "th"
                            } Dose`
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Doses Required
                    </p>
                    <p className="font-medium text-gray-800">
                      {maxDoses || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Next Follow-up Visit
                    </p>
                    <p className="font-medium text-gray-800">
                      {follow_up_visit?.followv_date
                        ? format(
                            new Date(follow_up_visit.followv_date),
                            "MMM dd, yyyy"
                          )
                        : "No follow-up scheduled"}
                    </p>
                  </div>
                  {/* <div>
                    <p className="text-xs text-gray-500">Follow-up Status</p>
                    <p className="font-medium text-gray-800">
                      {follow_up_visit?.followv_status
                        ? follow_up_visit.followv_status
                            .charAt(0)
                            .toUpperCase() +
                          follow_up_visit.followv_status.slice(1)
                        : "N/A"}
                    </p>
                  </div> */}
                </div>
              </div>
            </>
          }
        />

        {/* Combined Vaccination Details Section */}

        <div className="border-t border-gray-200 my-8"></div>

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-6 mt-8">
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
            <h2 className="font-semibold text-blue  rounded-md py-2 px-3">
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
              <Button
                type="submit"
                className="w-[120px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete"
                )}
              </Button>
            </div>
          </form>
        </Form>

        <ConfirmationDialog
          isOpen={isSubmitConfirmationOpen}
          onOpenChange={setIsSubmitConfirmationOpen}
          onConfirm={handleConfirmSubmit}
          title="Confirm Vaccination Submission"
          description="Are you sure you want to submit this vaccination record? This action will update the inventory and schedule any necessary follow-up visits."
        />
      </div>
    </div>
  );
}
