"use client";
import { useForm } from "react-hook-form";
import { nonPhilHealthSchema } from "@/form-schema/medicalConsultation/nonPhilhealthSchema";
import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "react-router-dom";
import { BriefcaseMedical, FilesIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { FormInput } from "@/components/ui/form/form-input";
import { PatientSearch } from "@/components/ui/patientSearch";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { Combobox } from "@/components/ui/combobox";
import CardLayout from "@/components/ui/card/card-layout";
import { MdBloodtype, MdPregnantWoman, MdSmokingRooms, MdLocalBar } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";
import { useLatestVitals } from "../../vaccination/queries/fetch";
import { usePreviousBMI } from "../queries/fetch";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { useSubmitMedicalConsultation } from "../queries/post";
import { nonPhilHealthType } from "@/form-schema/medicalConsultation/nonPhilhealthSchema";
import { showErrorToast } from "@/components/ui/toast";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { fetchStaffWithPositions } from "@/pages/healthServices/reports/firstaid-report/queries/fetch";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form/form";
import { Checkbox } from "@/components/ui/checkbox";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { ttStatusOptions } from "./options";
import { usePrenatalPatientObsHistory } from "../../maternal/queries/maternalFetchQueries";

export const civilStatusOptions = [
  { id: "SINGLE", name: "Single" },
  { id: "MARRIEED", name: "Married" },
  { id: "WIDOWED", name: "Widowed" },
  { id: "SEPARATED", name: "Separated" },
  { id: "DIVORCED", name: "Divorced" }

];

export default function MedicalConsultationForm() {
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData, mode } = params || {};
  const { user } = useAuth();
  const staff = user?.staff?.staff_id || null;
  const name = `${user?.personal?.per_fname || ""} ${user?.personal?.per_mname || ""} ${user?.personal?.per_lname || ""}`.trim();
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPatientData, setSelectedPatientData] = useState<any>(patientData || null);
  const pat_id = selectedPatientId.split(",")[0].trim() || patientData?.pat_id || "";
  const { data: staffOptions, isLoading: staffLoading } = fetchStaffWithPositions();
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const { data: latestVitals, isLoading: isVitalsLoading, error: vitalsError } = useLatestVitals(pat_id);
  const { data: previousMeasurements, isLoading: isMeasurementsLoading, error: measurementsError } = usePreviousBMI(pat_id);
  const { data: obsHistoryData, isLoading: obsLoading } = usePrenatalPatientObsHistory(pat_id); //obstetric history
  const non_membersubmit = useSubmitMedicalConsultation();

  const form = useForm<nonPhilHealthType>({
    resolver: zodResolver(nonPhilHealthSchema),
    defaultValues: {
      pat_id: patientData?.pat_id?.toString() || "",
      bhw_assignment: name,
      vital_pulse: undefined,
      vital_temp: undefined,
      vital_bp_systolic: undefined,
      vital_bp_diastolic: undefined,
      vital_RR: undefined,
      vital_o2:undefined,
      height: undefined,
      weight: undefined,
      medrec_chief_complaint: "",
      staff: staff || null,
      is_phrecord: false, // Default to false
      phil_pin: undefined,
      civil_status: "",

      iswith_atc: false,
      dependent_or_member: "",
      obs_abortions: 0,
      obs_ch_born_alive: 0,
      obs_fullterm: 0,
      obs_gravida: 0,
      obs_id: "",
      obs_lg_babies: "",
      obs_lg_babies_str: "",
      obs_para: 0,
      obs_preterm: 0,
      obs_still_birth: 0,
      obs_lmp: "",
      tts_status: "",
      tts_date_given: "",
      ogtt_result: "",
      contraceptive_used: "",
      smk_sticks_per_day: "",
      smk_years: "",
      is_passive_smoker: false,
      alcohol_bottles_per_day: "",
      selectedDoctorStaffId: ""
    }
  });

  const { setValue, control, watch } = form;
  const isPhilhealthRecord = watch("is_phrecord"); // Watch the checkbox value

  useEffect(() => {

    console.log(patientData,"---------------------")
    if (latestVitals) {
      form.setValue("vital_pulse", latestVitals.pulse?.toString() ?? "");
      form.setValue("vital_temp", latestVitals.temperature?.toString() ?? "");
      form.setValue("vital_bp_systolic", latestVitals.bp_systolic?.toString() ?? "");
      form.setValue("vital_bp_diastolic", latestVitals.bp_diastolic?.toString() ?? "");
      form.setValue("vital_RR", latestVitals.respiratory_rate?.toString() ?? "");
      form.setValue("vital_o2", latestVitals.oxygen_saturation?.toString() ?? "");
    }
    if (previousMeasurements) {
      form.setValue("height", previousMeasurements.height ?? 0);
      form.setValue("weight", previousMeasurements.weight ?? 0);
    }
    if (selectedPatientData) {
      // Corrected line - removed the duplicate fallback that doesn't exist
      form.setValue("phil_pin", selectedPatientData?.additional_info?.philhealth_id || "");
      form.setValue("civil_status", selectedPatientData?.personal_info?.per_status || "");
      form.setValue("tts_status", selectedPatientData?.additional_info?.mother_tt_status || "");
      form.setValue("tts_date_given",selectedPatientData?.additional_info?.mother_tt_date_given ? format(new Date(selectedPatientData?.additional_info?.mother_tt_date_given), "yyyy-MM-dd") : "");
      console.log("Selected Patient Data:", selectedPatientData);
      console.log("PhilHealth ID:", selectedPatientData?.additional_info?.philhealth_id); // Debug log
    }
    if (obsHistoryData) {
      form.setValue("obs_lmp", obsHistoryData?.obstetrical_history?.obs_lmp ? format(new Date(obsHistoryData?.obstetrical_history?.obs_lmp), "yyyy-MM-dd") : "");
      form.setValue("obs_gravida", obsHistoryData?.obstetrical_history?.obs_gravida ?? 0);
      form.setValue("obs_para", obsHistoryData?.obstetrical_history?.obs_para ?? 0);
      form.setValue("obs_id", obsHistoryData?.obstetrical_history?.obs_id ?? "");
      form.setValue("obs_fullterm", obsHistoryData?.obstetrical_history?.obs_fullterm ?? 0);
      form.setValue("obs_preterm", obsHistoryData?.obstetrical_history?.obs_preterm ?? 0);
      form.setValue("obs_abortions", obsHistoryData?.obstetrical_history?.obs_abortions ?? 0);
      form.setValue("obs_living_ch", obsHistoryData?.obstetrical_history?.obs_living_ch ?? 0);
      form.setValue("obs_ch_born_alive", obsHistoryData?.obstetrical_history?.obs_ch_born_alive ?? 0);
      form.setValue("obs_still_birth", obsHistoryData?.obstetrical_history?.obs_still_birth ?? 0);
      form.setValue("obs_lg_babies", obsHistoryData?.obstetrical_history?.obs_lg_babies ?? 0);
      form.setValue("obs_lg_babies_str", obsHistoryData?.obstetrical_history?.obs_lg_babies_str ?? "");

    }
  }, [latestVitals, previousMeasurements, form, selectedPatientData, obsHistoryData]);
// Add proper date formatting and validation
useEffect(() => {
  if (obsHistoryData?.obstetrical_history?.obs_lmp) {
    // Ensure the date is properly formatted for HTML date input
    const lmpDate = new Date(obsHistoryData.obstetrical_history.obs_lmp);
    const formattedDate = format(lmpDate, "yyyy-MM-dd");
    form.setValue("obs_lmp", formattedDate);
  }
}, [obsHistoryData, form]);


// Add this to your component to see real-time validation errors
useEffect(() => {
  console.log('Form Errors:', form.formState.errors);
  console.log('Is Form Valid:', form.formState.isValid);
  console.log('Form Values:', form.getValues());
}, [form.formState.errors, form.formState.isValid]);


  const handlePatientSelect = async (patient: any, patientId: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientData(patient);
    form.setValue("pat_id", patient?.pat_id || "");

    // Debug logs
    console.log("Patient selected:", patient);
    console.log("PhilHealth ID from patient:", patient?.additional_info?.philhealth_id);
    console.log("TT Status from patient:", patient?.additional_info?.mother_tt_status);
  };


  // Update your onSubmit to log more details
const onSubmit = async (data: nonPhilHealthType) => {
  console.log('🟢 Attempting submission with data:', data);
  
  if ((mode === "fromallrecordtable" && !selectedPatientId) || (mode === "fromindivrecord" && !patientData)) {
    showErrorToast("Please select a patient first");
    return;
  }
  
  // Check if form is valid before submitting
  if (!form.formState.isValid) {
    console.log('🔴 Form is invalid, cannot submit');
    showErrorToast("Please fix form errors before submitting");
    return;
  }
  
  non_membersubmit.mutate({ data });
};

  return (
    <LayoutWithBack title="Medical Consultation" description="Fill out the medical consultation details">
      {/* Main form content */}
      <CardLayout
        title=""
        cardClassName="px-4 py-6"
        content={
          <>
            {/* Patient search section */}
            {mode === "fromallrecordtable" && <PatientSearch value={selectedPatientId} onChange={setSelectedPatientId} onPatientSelect={handlePatientSelect} />}

            {/* Patient info card */}
            {(mode === "fromindivrecord" ? patientData : selectedPatientData) && (
              <div className="mt-4">
                <PatientInfoCard patient={mode === "fromindivrecord" ? patientData : selectedPatientData} />
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* PhilHealth Section Header */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4 ">
                  <FormField
                    control={control}
                    name="is_phrecord"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 ">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" disabled={mode === "addnewchildhealthrecord"} />
                          </FormControl>
                          <FormLabel className="text-lg font-semibold text-blue-800 cursor-pointer">PhilHealth Consultation</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {isPhilhealthRecord && <div className="mt-2 text-sm text-blue-600">PhilHealth section is enabled.</div>}
                </div>

                {/* Conditionally render Philhealth form section */}
                {isPhilhealthRecord && (
                  <div className="space-y-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white px-4 border py-4  rounded-lg">
                      <div className="md:col-span-1 flex items-center">
                        <FormField
                          control={control}
                          name="iswith_atc"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                              </FormControl>
                              <FormLabel className="text-sm font-medium text-gray-700">With ATC Walk-in?</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-1">
                        <FormInput
                          control={form.control}
                          name="phil_pin"
                          label="PhilHealth PIN"
                          placeholder="Enter 12-digit PIN"
                          // maxLength={12}
                          className="w-full"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <FormSelect
                          control={form.control}
                          name="dependent_or_member"
                          label="Member Type"
                          options={[
                            { id: "member", name: "Member" },
                            { id: "dependent", name: "Dependent" }
                          ]}
                          placeholder="Select type"
                        />
                      </div>

                      <div className="md:col-span-1">
                        <FormSelect
                          control={form.control}
                          name="civil_status"
                          label="Civil Status"
                          options={civilStatusOptions}
                          placeholder="Select type"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Pregnancy Information Card */}
                      <div className="p-5 flex flex-col gap-4 border rounded-lg shadow-sm bg-white border-green-300">
                        <div className="flex items-center gap-2 mb-2 border-b pb-2">
                          <MdPregnantWoman className="text-green-600" size={24} />
                          <Label className="text-lg font-semibold text-gray-700">Pregnancy Information</Label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormDateTimeInput control={form.control} name="obs_lmp" label="Last Menstrual Period (LMP)" type="date" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormInput control={form.control} name="obs_gravida" label="Gravida (G)" placeholder="G" type="number" step={1} maxLength={2} />
                          <FormInput control={form.control} name="obs_para" label="Para (P)" placeholder="P" type="number" step={1} maxLength={2} />
                        </div>

                        <Label>TPAL</Label>
                        <div className="grid grid-cols-4 gap-4">
                          <FormInput control={form.control} name="obs_fullterm" label="Full Term"  type="number" step={1} maxLength={2}  placeholder="No. of full term pregnancies" />
                          <FormInput control={form.control} name="obs_preterm" label="Preterm"  type="number" step={1} maxLength={2}   placeholder="No. of preterm pregnancies" />
                          <FormInput control={form.control} name="obs_abortions" label="Abortions"  type="number" step={1} maxLength={2}   placeholder="No. of abortions" />
                          <FormInput control={form.control} name="obs_living_ch" label="Living Children"  type="number" step={1} maxLength={2}  placeholder="No. of living children" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormSelect control={form.control} name="tts_status" label="Tetanus Toxoid Status" options={ttStatusOptions} placeholder="Select status" />
                          <FormDateTimeInput control={form.control} name="tts_date_given" label="TT date given" type="date" />
                        </div>
                        <FormInput control={form.control} name="ogtt_result" label="OGTT Result" placeholder="Result" />


                        <FormInput control={form.control} name="contraceptive_used" label="Contraceptive Used" placeholder="Method used" />
                      </div>

                      {/* Lifestyle Information Card */}
                      <div className="p-5 flex flex-col gap-4 border rounded-lg shadow-sm bg-white border-blue-300">
                        <div className="flex items-center gap-2 mb-2 border-b pb-2">
                          <MdSmokingRooms className="text-blue-600" size={24} />
                          <Label className="text-lg font-semibold text-gray-700">Lifestyle Information</Label>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">Smoking History</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <FormInput control={form.control} name="smk_sticks_per_day" label="Sticks/Day" placeholder="0" type="number" step={1} maxLength={2} />
                              <FormInput control={form.control} name="smk_years" label="Years" placeholder="0" type="number" step={1} maxLength={2} />
                              <div className="flex items-end">
                                <FormField
                                  control={control}
                                  name="is_passive_smoker"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                                      <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>Passive Smoker</FormLabel>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t">
                            <MdLocalBar className="text-blue-600" size={20} />
                            <Label className="text-sm font-medium text-gray-700">Alcohol Consumption</Label>
                          </div>
                          <FormInput control={form.control} name="alcohol_bottles_per_day" label="Bottles per Day" placeholder="0" type="number" step={1} maxLength={2} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vital Signs Section */}
                <div className="space-y-4 px-4">
                  <h2 className="font-semibold text-darkBlue1 rounded-md py-2 mt-8 flex gap-2">
                    <BriefcaseMedical /> Vital Sign
                  </h2>
                  {isVitalsLoading ? <div className="text-sm text-gray-500 italic">Loading vitals...</div> : latestVitals?.created_at ? <div className="text-sm text-yellow-600 italic">Latest vitals recorded on: {format(new Date(latestVitals.created_at), "MMMM d, yyyy")}</div> : null}
                  {vitalsError && <div className="text-sm text-red-500 italic">Error loading vitals: {vitalsError.message}</div>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                    <FormInput control={form.control} name="vital_pulse" label="Heart Rate (bpm)" placeholder="Adult normal: 60-100 bpm" type="number" step={1} maxLength={3} />
                    <FormInput control={form.control} name="vital_RR" label="Respiratory Rate (cpm)" placeholder="12-20 cpm" type="number" step={1} maxLength={2} />
                    <FormInput control={form.control} name="vital_temp" label="Temperature (℃)" placeholder="36.5-37.5°C (Normal Range)" type="number" step={0.1} maxLength={5} />
                  </div>

                  {/* Blood Pressure Section */}
                  <div className="flex flex-col gap-4 pt-3">
                    <h2 className="font-semibold text-darkBlue1 rounded-md py-2 flex gap-2">
                      <MdBloodtype size={24} className="text-red-400" /> Blood Pressure
                    </h2>
                    <div className="flex gap-2">
                      <FormInput control={form.control} name="vital_bp_systolic" label="Systolic" type="number" placeholder="range 90-130" maxLength={3} />
                      <FormInput control={form.control} name="vital_bp_diastolic" label="Diastolic" type="number" placeholder="range 60-80" maxLength={3} />
                    </div>
                  </div>

                  {/* Measurements Section */}
                  <div>
                    {isMeasurementsLoading ? (
                      <div className="text-sm text-gray-500 italic">Loading measurements...</div>
                    ) : measurementsError ? (
                      <div className="text-sm text-red-500 italic">Error loading measurements: {measurementsError.message}</div>
                    ) : previousMeasurements?.created_at ? (
                      <div className="text-sm text-yellow-600 italic mb-2">Previous measurements recorded on: {format(new Date(previousMeasurements.created_at), "MMMM d, yyyy")}</div>
                    ) : null}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput control={form.control} name="height" label="Height (cm)" placeholder="Enter Height" type="number" step={0.1} maxLength={6} />
                      <FormInput control={form.control} name="weight" label="Weight (kg)" placeholder="Enter Weight" type="number" step={0.1} maxLength={6} />
                    </div>
                  </div>
                </div>

                {/* Chief Complaint Section */}
                <div className="mb-5 mt-5 px-4">
                  <h2 className="font-semibold text-darkBlue1 rounded-md py-2 mt-8 flex gap-2">
                    <FilesIcon size={24} className="text-sky-500" /> Chief Complaint
                  </h2>
                  <FormTextArea control={form.control} name="medrec_chief_complaint" label="" placeholder="Enter chief complaint" className="min-h-[100px]" rows={5} />
                </div>

                {/* BHW and Doctor Section */}
                <div className="flex gap-5 flex-col px-4">
                  <FormInput control={form.control} name="bhw_assignment" label="BHW Assigned:" placeholder="BHW Assigned" />
                  <div>
                    <div className="mt-6">
                      <Label className="block mb-2">Forward To</Label>
                      <div className="relative">
                        <Combobox
                          options={staffOptions?.formatted || []}
                          value={selectedStaffId}
                          onChange={(value) => {
                            setSelectedStaffId(value || "");
                            setValue("selectedDoctorStaffId", value || ""); // Also set the form value
                          }}
                          placeholder={staffLoading ? "Loading staff..." : "Select staff member"}
                          emptyMessage="No available staff members"
                          triggerClassName="w-full"
                        />
                      </div>
                    </div>
                    {form.formState.errors.selectedDoctorStaffId && <p className="text-red-500 text-sm mt-1">{form.formState.errors.selectedDoctorStaffId.message}</p>}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 px-4">
                  <Button variant="outline" type="button" onClick={() => form.reset()} className="w-full sm:w-[150px]" disabled={non_membersubmit.isPending}>
                    Reset Form
                  </Button>
                  <Button type="submit" className="w-full sm:w-[150px]" disabled={(mode === "fromallrecordtable" && !selectedPatientId) || (mode === "fromindivrecord" && !patientData) || non_membersubmit.isPending}>
                    {non_membersubmit.isPending ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </div>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        }
      />
    </LayoutWithBack>
  );
}
