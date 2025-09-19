"use client";
import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { nonPhilHealthSchema } from "@/form-schema/medicalConsultation/nonPhilhealthSchema";
import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "react-router-dom";
import { BriefcaseMedical, FilesIcon } from "lucide-react";
import { useEffect } from "react";
import { FormInput } from "@/components/ui/form/form-input";
import { PatientSearch } from "@/components/ui/patientSearch";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { Combobox } from "@/components/ui/combobox";
import CardLayout from "@/components/ui/card/card-layout";
import { MdBloodtype } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";
import { useLatestVitals } from "../../vaccination/queries/fetch";
import { usePreviousBMI } from "../queries/fetchQueries";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { useSubmitMedicalConsultation } from "../queries/postQueries";
import { useState } from "react";
import { nonPhilHealthType } from "@/form-schema/medicalConsultation/nonPhilhealthSchema";
import { showErrorToast } from "@/components/ui/toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormSelect } from "@/components/ui/form/form-select";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { ttStatusOptions,doctors,contraceptiveOptions,maritalStatusOptions } from "./options";


export default function MedicalConsultationForm() {
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData, mode } = params || {};
  const { user } = useAuth();
  const staff = user?.staff?.staff_id || null;
  const name = `${user?.resident?.per?.per_fname || ""} ${user?.resident?.per?.per_mname || ""} ${user?.resident?.per?.per_lname || ""}`.trim();
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPatientData, setSelectedPatientData] = useState<any>(patientData || null);
  const pat_id = selectedPatientId.split(",")[0].trim() || patientData?.pat_id || "";
  const { data: latestVitals, isLoading: isVitalsLoading, error: vitalsError } = useLatestVitals(pat_id);
  const { data: previousMeasurements, isLoading: isMeasurementsLoading, error: measurementsError } = usePreviousBMI(pat_id);
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
      height: undefined,
      weight: undefined,
      medrec_chief_complaint: "",
      doctor: "",
      staff: staff || null,
      is_philhealthmember: false,
      is_withatch: false,
      marital_status: "N/A",
      is_dependent: false,
      lmp: "N/A",
      obscore_g: "0",
      obscore_p: "0",
      tpal: "0-0-0-0",
      tt_status: "N/A",
      ogtt_result: "N/A",
      contraceptive_used: "N/A",
      smk_stickused_aday: "N/A",
      smk_yrs: "N/A",
      is_passive: false,
      alchl_bottleused_aday: "N/A"
    }
  });

  // Watch for PhilHealth membership status to conditionally show fields
  const isPhilHealthMember = form.watch("is_philhealthmember");

  useEffect(() => {
    if (latestVitals) {
      form.setValue("vital_pulse", latestVitals.pulse?.toString() ?? "");
      form.setValue("vital_temp", latestVitals.temperature?.toString() ?? "");
      form.setValue("vital_bp_systolic", latestVitals.bp_systolic?.toString() ?? "");
      form.setValue("vital_bp_diastolic", latestVitals.bp_diastolic?.toString() ?? "");
      form.setValue("vital_RR", latestVitals.respiratory_rate?.toString() ?? "");
    }
    if (previousMeasurements) {
      form.setValue("height", previousMeasurements.height ?? 0);
      form.setValue("weight", previousMeasurements.weight ?? 0);
    }
  }, [latestVitals, previousMeasurements, form]);

  const handlePatientSelect = async (patient: any, patientId: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientData(patient);
    form.setValue("pat_id", patient?.pat_id || "");
  };

  const onSubmit = async (data: nonPhilHealthType) => {
    if ((mode === "fromallrecordtable" && !selectedPatientId) || (mode === "fromindivrecord" && !patientData)) {
      showErrorToast("Please select a patient first");
      return;
    }
    if (!data.is_philhealthmember) {
      non_membersubmit.mutate({ data });
    } else {
    }
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
                <fieldset disabled={non_membersubmit.isPending} className="space-y-6">
                  {/* PhilHealth Membership Section */}
                  <div className="space-y-4">
                    <div className="space-y-3 mt-6">
                      <Label className="font-medium text-black/65">PhilHealth Membership Status</Label>
                      <RadioGroup
                        value={isPhilHealthMember ? "member" : "non-member"}
                        onValueChange={(value) => {
                          form.setValue("is_philhealthmember", value === "member");
                        }}
                        className="flex flex-row gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="non-member" id="non-member" />
                          <Label htmlFor="non-member" className="font-normal cursor-pointer">
                            Non-Member
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="member" id="member" />
                          <Label htmlFor="member" className="font-normal cursor-pointer">
                            PhilHealth Member
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Vital Signs Section */}
                  <div className="space-y-4">
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
                  <div className="mb-5 mt-5">
                    <h2 className="font-semibold text-darkBlue1 rounded-md py-2 mt-8 flex gap-2">
                      <FilesIcon size={24} className="text-sky-500" /> Chief Complaint
                    </h2>
                    <FormTextArea control={form.control} name="medrec_chief_complaint" label="" placeholder="Enter chief complaint" className="min-h-[100px]" rows={5} />
                  </div>

                  {/* Conditional PhilHealth Member Fields */}
                  {isPhilHealthMember && (
                    <div className="space-y-4 p-4  rounded-lg border border-green-500">
                      <h3 className="font-medium text-green-800 mb-6">Additional PhilHealth Information</h3>

                      <div className="flex gap-4">
                        {" "}
                        {/* With ATCH */}
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="is_withatch" checked={form.watch("is_withatch")} onChange={(e) => form.setValue("is_withatch", e.target.checked)} className="rounded border-gray-300" />
                          <Label htmlFor="is_withatch" className="font-normal cursor-pointer">
                            WALK IN WITH ATC
                          </Label>
                        </div>
                        {/* Is Dependent */}
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="is_dependent" checked={form.watch("is_dependent")} onChange={(e) => form.setValue("is_dependent", e.target.checked)} className="rounded border-gray-300" />
                          <Label htmlFor="is_dependent" className="font-normal cursor-pointer">
                            Dependent
                          </Label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Marital Status */}
                        <div>
                          <Label className="font-medium text-black/65 mb-2 mt-2 block">Marital Status</Label>
                          <FormSelect control={form.control} name="marital_status" options={maritalStatusOptions} placeholder="Select marital status" />
                        </div>

                        {/* LMP */}
                        <FormInput control={form.control} name="lmp" label="Last Menstrual Period (LMP)" placeholder="Enter LMP date" type="date" />

                        {/* OB Score G */}
                        <FormInput control={form.control} name="obscore_g" label="OB Score G (Gravida)" placeholder="0" type="number" />

                        {/* OB Score P */}
                        <FormInput control={form.control} name="obscore_p" label="OB Score P (Para)" placeholder="0" type="number" />

                        {/* TPAL */}
                        <FormInput control={form.control} name="tpal" label="TPAL (T-P-A-L)" placeholder="0-0-0-0" />

                        {/* TT Status */}
                        <div>
                          <Label className="font-medium text-black/65 mb-2 block">TT Status</Label>
                          <FormSelect control={form.control} name="tt_status" options={ttStatusOptions} placeholder="Select TT status" />
                        </div>

                        {/* OGTT Result */}
                        <FormInput control={form.control} name="ogtt_result" label="OGTT Result" placeholder="Enter OGTT result" />

                        {/* Contraceptive Used */}
                        <div>
                          <Label className="font-medium text-black/65 mb-2 mt-2 block">Contraceptive Used</Label>
                          <Combobox options={contraceptiveOptions} value={form.watch("contraceptive_used")} onChange={(value: any) => form.setValue("contraceptive_used", value)} placeholder="Select contraceptive method" triggerClassName="font-normal w-full" />
                        </div>

                        {/* Smoking Information */}
                        <FormInput control={form.control} name="smk_stickused_aday" label="Cigarette Sticks per Day" placeholder="Enter number of sticks" type="number" />

                        <FormInput control={form.control} name="smk_yrs" label="Smoking Years" placeholder="Enter years of smoking" type="number" />

                        {/* Passive Smoking */}
                        <div className="flex items-center space-x-2 mt-8">
                          <input type="checkbox" id="is_passive" checked={form.watch("is_passive")} onChange={(e) => form.setValue("is_passive", e.target.checked)} className="rounded border-gray-300" />
                          <Label htmlFor="is_passive" className="font-normal cursor-pointer">
                            Passive Smoker
                          </Label>
                        </div>

                        {/* Alcohol Consumption */}
                        <FormInput control={form.control} name="alchl_bottleused_aday" label="Alcohol Bottles per Day" placeholder="Enter number of bottles" type="number" />
                      </div>
                    </div>
                  )}
                  {/* BHW and Doctor Section */}
                  <div className="flex gap-5 flex-col">
                    <FormInput control={form.control} name="bhw_assignment" label="BHW Assigned:" placeholder="BHW Assigned" />
                    <div>
                      <Label className="font-medium text-black/65 mb-2 block">Forward to Doctor</Label>
                      <Combobox
                        options={doctors}
                        value={form.watch("doctor") || ""}
                        onChange={(value) => form.setValue("doctor", value || "")}
                        placeholder="Select doctor"
                        triggerClassName="font-normal w-full"
                        emptyMessage={
                          <div className="flex gap-2 justify-center items-center">
                            <Label className="font-normal text-[13px]">No doctors available</Label>
                          </div>
                        }
                      />
                      {form.formState.errors.doctor && <p className="text-red-500 text-sm mt-1">{form.formState.errors.doctor.message}</p>}
                    </div>
                  </div>
                </fieldset>

                {/* Form Actions */}
                <div className="flex justify-end gap-4">
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
