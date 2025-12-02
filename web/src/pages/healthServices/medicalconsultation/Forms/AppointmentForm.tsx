"use client";
import { useForm } from "react-hook-form";
import { nonPhilHealthSchema } from "@/form-schema/medicalConsultation/nonPhilhealthSchema";
import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "react-router-dom";
import { BriefcaseMedical, FilesIcon, HeartPulse, Users, AlertCircle, Loader2 } from "lucide-react";
import { MdBloodtype, MdPregnantWoman, MdSmokingRooms, MdLocalBar } from "react-icons/md";
import { useEffect, useState, useCallback } from "react";
import { FormInput } from "@/components/ui/form/form-input";
import { PersonalInfoCard } from "./personal-info-card";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { Combobox } from "@/components/ui/combobox";
import CardLayout from "@/components/ui/card/card-layout";
import { IllnessComponent } from "@/components/ui/add-search-illness";
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
import { ttStatusOptions, civilStatusOptions, TabButton } from "./options";
import { usePrenatalPatientObsHistory } from "../../maternal/queries/maternalFetchQueries";
import { MedicalHistoryTab } from "../tables/medical-history-card";
import { FamilyHistoryTab } from "../tables/family-history-card";
import { useFamHistory } from "../queries/fetch";
import { usePrenatalPatientMedHistory } from "../../maternal/queries/maternalFetchQueries";
import { useCheckPatientExists } from "@/pages/record/health/patientsRecord/queries/fetch";
import { registerPatient } from "@/pages/record/health/patientsRecord/restful-api/post";
import { toast } from "sonner";

// Helper function to calculate age
const calculateAge = (dob: string) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function AppointmentForm() {
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData, appointmentData } = params || {};
  const { user } = useAuth();
  const staff = user?.staff?.staff_id || null;
  const name = `${user?.personal?.per_fname || ""} ${user?.personal?.per_mname || ""} ${user?.personal?.per_lname || ""}`.trim();
  const [activeTab, setActiveTab] = useState<"medical" | "family">("medical");
  const [medHistorySearch, setMedHistorySearch] = useState("");
  const [famHistorySearch, setFamHistorySearch] = useState("");
  const [selectedStaffDisplay, setSelectedStaffDisplay] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentPatId, setCurrentPatId] = useState<string | null>(patientData?.pat_id || null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get the rp_id from either appointment data or patient data
  const rp_id = patientData?.rp;

  // Check if patient exists using rp_id
  const { data: patientExists, isLoading: isCheckingPatient, refetch: refetchPatientExists } = useCheckPatientExists(rp_id);

  // Get current patient data
  const currentPatientData =
    patientData ||
    (appointmentData
      ? {
          pat_id: appointmentData.rp?.pat_id || null,
          personal_info: appointmentData.personal_info,
          address: appointmentData.address,
          pat_type: "Resident",
          age: calculateAge(appointmentData.personal_info?.per_dob),
          householdno: appointmentData.rp?.householdno,
          additional_info: appointmentData.rp?.additional_info,
          rp_id: appointmentData.rp?.id || appointmentData.id
        }
      : null);

  const pat_id = currentPatId || currentPatientData?.pat_id || "";

  const { data: staffOptions, isLoading: staffLoading } = fetchStaffWithPositions();
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const { data: latestVitals, isLoading: isVitalsLoading, error: vitalsError, refetch: refetchVitals } = useLatestVitals(pat_id);
  const { data: previousMeasurements, isLoading: isMeasurementsLoading, error: measurementsError, refetch: refetchMeasurements } = usePreviousBMI(pat_id);
  const { data: obsHistoryData } = usePrenatalPatientObsHistory(pat_id);
  const { data: medHistoryData, isLoading: isMedHistoryLoading, error: medHistoryError, isError: isMedHistoryError, refetch: refetchMedHistory } = usePrenatalPatientMedHistory(pat_id, medHistorySearch);
  const { data: famHistoryData, isLoading: isFamHistoryLoading, isError: isFamHistoryError, refetch: refetchFamHistory } = useFamHistory(pat_id, famHistorySearch);

  const non_membersubmit = useSubmitMedicalConsultation();

  // Helper functions to determine patient status
  const shouldShowRegisterButton = () => {
    if (isCheckingPatient) return false;
    if ((patientExists as any)?.exists) return false;
    return true;
  };

  const isPatientRegistered = () => {
    const patientData = patientExists as any;
    return patientData?.exists && patientData?.pat_id;
  };

  // Set currentPatId if patient already exists
  useEffect(() => {
    const patientData = patientExists as any;
    if (patientData?.exists && patientData?.pat_id) {
      setCurrentPatId(patientData.pat_id || currentPatientData?.pat_id || null);
    }
  }, [patientExists, currentPatientData]);

  // Refetch all patient data when patient is registered or pat_id changes
  useEffect(() => {
    if (currentPatId) {
      refetchVitals();
      refetchMeasurements();
      refetchMedHistory();
      refetchFamHistory();
    }
  }, [currentPatId, refreshTrigger]);

  // Handle appointment data transformation
  useEffect(() => {
    if (appointmentData?.chief_complaint) {
      form.setValue("medrec_chief_complaint", appointmentData.chief_complaint);
    }
  }, [appointmentData]);

  const handleMedHistorySearchChange = useCallback((value: string) => {
    setMedHistorySearch(value);
  }, []);

  const clearMedHistorySearch = useCallback(() => {
    setMedHistorySearch("");
  }, []);

  const handleFamHistorySearchChange = useCallback((value: string) => {
    setFamHistorySearch(value);
  }, []);

  const clearFamHistorySearch = useCallback(() => {
    setFamHistorySearch("");
  }, []);

  const handleTabChange = useCallback((tab: "medical" | "family") => {
    setActiveTab(tab);
  }, []);

  const form = useForm<nonPhilHealthType>({
    resolver: zodResolver(nonPhilHealthSchema),
    defaultValues: {
      pat_id: currentPatientData?.pat_id?.toString() || "",
      bhw_assignment: name,
      vital_pulse: undefined,
      vital_temp: undefined,
      vital_bp_systolic: undefined,
      vital_bp_diastolic: undefined,
      vital_RR: undefined,
      vital_o2: undefined,
      height: undefined,
      weight: undefined,
      medrec_chief_complaint: appointmentData?.chief_complaint || "",
      staff: staff || null,
      is_phrecord: false,
      phil_pin: undefined,
      civil_status: "",
      iswith_atc: false,
      dependent_or_member: "",
      obs_abortions: 0,
      obs_ch_born_alive: 0,
      obs_fullterm: 0,
      obs_gravida: 0,
      obs_id: "",
      obs_lg_babies: "0",
      obs_lg_babies_str: false,
      obs_para: 0,
      obs_preterm: 0,
      obs_still_birth: 0,
      obs_lmp: "",
      tts_status: "",
      tts_date_given: "",
      ogtt_result: "",
      contraceptive_used: "",
      smk_sticks_per_day: "0",
      smk_years: "0",
      is_passive_smoker: false,
      alcohol_bottles_per_day: "0",
      selectedDoctorStaffId: "",
      famselectedIllnesses: [],
      myselectedIllnesses: [],
      app_id: appointmentData?.id?.toString() || ""
    }
  });

  const { setValue, control, watch } = form;
  const isPhilhealthRecord = watch("is_phrecord");

  useEffect(() => {
    // Set patient ID in form if patient is registered
    if (currentPatId) {
      form.setValue("pat_id", currentPatId.toString());
      form.setValue("medrec_chief_complaint",appointmentData?.chief_complaint || "")
    }

    // Auto-fill vitals if available
    if (latestVitals) {
      form.setValue("vital_pulse", latestVitals.pulse?.toString() ?? "");
      form.setValue("vital_temp", latestVitals.temperature?.toString() ?? "");
      form.setValue("vital_bp_systolic", latestVitals.bp_systolic?.toString() ?? "");
      form.setValue("vital_bp_diastolic", latestVitals.bp_diastolic?.toString() ?? "");
      form.setValue("vital_RR", latestVitals.respiratory_rate?.toString() ?? "");
      form.setValue("vital_o2", latestVitals.oxygen_saturation?.toString() ?? "");
    }

    // Auto-fill measurements if available
    if (previousMeasurements) {
      form.setValue("height", previousMeasurements.height ?? 0);
      form.setValue("weight", previousMeasurements.weight ?? 0);
    }

    // Auto-fill patient information if available
    if (currentPatientData) {
      form.setValue("phil_pin", currentPatientData?.additional_info?.philhealth_id || "");
      form.setValue("civil_status", currentPatientData?.personal_info?.per_status || "");
      form.setValue("tts_status", currentPatientData?.additional_info?.mother_tt_status?.status || "");
      const ttDateGiven = currentPatientData?.additional_info?.mother_tt_status?.date_given;
      form.setValue("tts_date_given", ttDateGiven ? format(new Date(ttDateGiven), "yyyy-MM-dd") : "");
      form.setValue("contraceptive_used", currentPatientData?.family_planning_method?.toString() || "");
    }

    // Auto-fill obstetric history if available
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
      form.setValue("obs_lg_babies_str", obsHistoryData?.obstetrical_history?.obs_lg_babies_str === true || obsHistoryData?.obstetrical_history?.obs_lg_babies_str === false ? obsHistoryData?.obstetrical_history?.obs_lg_babies_str : false);
      const lmpDate = new Date(obsHistoryData.obstetrical_history.obs_lmp);
      const formattedDate = format(lmpDate, "yyyy-MM-dd");
      form.setValue("obs_lmp", formattedDate);
    }
  }, [latestVitals, previousMeasurements, form, currentPatientData, obsHistoryData, currentPatId]);

  const handleRegisterPatient = async () => {
    if (!currentPatientData) return;
    setIsRegistering(true);
    try {
      const response = await registerPatient({
        pat_status: "Active",
        rp_id: rp_id,
        pat_type: "Resident",
        mode:"consultation"
      });

      if (!response.pat_id) {
        throw new Error("Patient ID not returned from the server");
      }
      setCurrentPatId(response.pat_id);
      refetchPatientExists();
      setRefreshTrigger((prev) => prev + 1);
      toast.success("Successfully registered patient");
    } catch (error) {
      toast.error("Failed to register patient");
      console.error("Registration error:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleFamIllnessSelectionChange = useCallback(
    (ids: number[]) => {
      form.setValue("famselectedIllnesses", ids);
      form.trigger("famselectedIllnesses");
    },
    [form]
  );

  const handleMyIllnessSelectionChange = useCallback(
    (ids: number[]) => {
      form.setValue("myselectedIllnesses", ids);
      form.trigger("myselectedIllnesses");
    },
    [form]
  );

  const onSubmit = async (data: nonPhilHealthType) => {
    if (!selectedStaffId) {
      showErrorToast("Please select a staff member to forward the consultation to.");
      return;
    }
    if (!currentPatientData) {
      showErrorToast("Patient data is not available.");
      return;
    }
    if (!isPatientRegistered()) {
      showErrorToast("Please register the patient first before submitting the consultation.");
      return;
    }
    

    if (data.is_phrecord === true) {
      if (!data.phil_pin || !data.civil_status || !data.dependent_or_member) {
        showErrorToast("Please fill in all required PhilHealth fields.");
        return;
      }
    }
    console.log(data);
    non_membersubmit.mutate({ data: data });
  };

  // Show loading state if no patient data is available
  if (!currentPatientData) {
    return (
      <LayoutWithBack title="Medical Consultation" description="Fill out the medical consultation details">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <Label className="text-base font-semibold text-yellow-500">No patient data</Label>
          </div>
          <p className="text-sm text-gray-700">Patient data is not available. Please go back and select a patient.</p>
        </div>
      </LayoutWithBack>
    );
  }

  if (isCheckingPatient || isRegistering) {
    return (
      <LayoutWithBack title="Medical Consultation" description="Fill out the medical consultation details">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 justify-center items-center h-full flex">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </LayoutWithBack>
    );
  }
  return (
    <LayoutWithBack title="Medical Consultation" description="Fill out the medical consultation details">
      <CardLayout
        title=""
        cardClassName="px-4 py-6"
        content={
          <>
            {/* Appointment info banner */}
            {appointmentData && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <BriefcaseMedical className="h-5 w-5 text-blue-600" />
                  <Label className="text-blue-800 font-semibold">Appointment Consultation</Label>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Scheduled: {appointmentData.scheduled_date ? format(new Date(appointmentData.scheduled_date), "MMMM d, yyyy") : "N/A"} • Status: <span className="font-medium">{appointmentData.status || "N/A"}</span>
                </p>
              </div>
            )}

            {/* Patient info card */}
            <PersonalInfoCard
              personalInfo={currentPatientData.personal_info}
              address={currentPatientData.address}
              currentPatId={currentPatId}
              rp_id={rp_id}
              onPatientRegistered={handleRegisterPatient}
              shouldShowRegisterButton={shouldShowRegisterButton()}
              isPatientRegistered={isPatientRegistered()}
              isCheckingPatient={isCheckingPatient}
              patientExists={patientExists}
            />

            {/* History Section with Tabs */}
            <div className="mb-6 w-full mt-4">
              <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
                <div className="border-b border-gray-200">
                  <div className="flex space-x-4">
                    <TabButton active={activeTab === "medical"} onClick={() => handleTabChange("medical")}>
                      <div className="flex items-center gap-2">
                        <HeartPulse className="h-4 w-4" />
                        Medical History
                      </div>
                    </TabButton>
                    <TabButton active={activeTab === "family"} onClick={() => handleTabChange("family")}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Family History
                      </div>
                    </TabButton>
                  </div>
                </div>

                <div className="p-4">
                  {activeTab === "medical" ? (
                    <MedicalHistoryTab
                      pat_id={pat_id}
                      searchValue={medHistorySearch}
                      onSearchChange={handleMedHistorySearchChange}
                      onClearSearch={clearMedHistorySearch}
                      medHistoryData={medHistoryData}
                      isMedHistoryLoading={isMedHistoryLoading}
                      isMedHistoryError={isMedHistoryError}
                      medHistoryError={medHistoryError}
                    />
                  ) : (
                    <FamilyHistoryTab pat_id={pat_id} searchValue={famHistorySearch} onSearchChange={handleFamHistorySearchChange} onClearSearch={clearFamHistorySearch} famHistoryData={famHistoryData} isFamHistoryLoading={isFamHistoryLoading} isFamHistoryError={isFamHistoryError} />
                  )}
                </div>
              </div>
            </div>

            {/* FORM STARTS HERE */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* PhilHealth Section Header */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <FormField
                    control={control}
                    name="is_phrecord"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          </FormControl>
                          <FormLabel className="text-lg font-semibold text-blue-800 cursor-pointer">PhilHealth Consultation</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  {isPhilhealthRecord && <div className="mt-2 text-sm text-blue-600">PhilHealth section is enabled. Please fill in the required PhilHealth information below.</div>}
                </div>

                {/* Conditionally render Philhealth form section */}
                {isPhilhealthRecord && (
                  <div className="space-y-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white px-4 border py-4 rounded-lg">
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
                        <FormInput control={form.control} name="phil_pin" label="PhilHealth PIN" placeholder="Enter 12-digit PIN" className="w-full" />
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
                        <FormSelect control={form.control} name="civil_status" label="Civil Status" options={civilStatusOptions} placeholder="Select type" />
                      </div>
                    </div>

                    {/* Illness Components */}
                    <div className="flex w-full bg-white p-4 gap-6 rounded-lg border">
                      <div className="w-1/2 border-r-4 pr-4">
                        <Label className="block mb-2 text-sm font-bold text-gray-700">Family Medical History</Label>
                        <IllnessComponent selectedIllnesses={form.watch("famselectedIllnesses") || []} onIllnessSelectionChange={handleFamIllnessSelectionChange} />
                      </div>
                      <div className="w-1/2">
                        <Label className="block mb-2 text-sm font-bold text-gray-700">My Past Medical History</Label>
                        <IllnessComponent selectedIllnesses={form.watch("myselectedIllnesses") || []} onIllnessSelectionChange={handleMyIllnessSelectionChange} />
                      </div>
                    </div>

                    {/* Pregnancy and Lifestyle Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Pregnancy Information Card */}
                      <div className="p-5 flex flex-col gap-4 border rounded-lg shadow-sm bg-white border-green-300">
                        <div className="flex items-center gap-2 mb-2 border-b pb-2">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <MdPregnantWoman className="text-green-600" size={20} />
                          </div>
                          <Label className="text-lg font-semibold text-gray-700">Pregnancy Information</Label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormDateTimeInput control={form.control} name="obs_lmp" label="Last Menstrual Period (LMP)" type="date" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormInput control={form.control} name="obs_gravida" label="Gravida (G)" placeholder="G" type="number" step={1} maxLength={2} />
                          <FormInput control={form.control} name="obs_para" label="Para (P)" placeholder="P" type="number" step={1} maxLength={2} />
                        </div>

                        <Label className="text-sm font-medium text-gray-700">TPAL</Label>
                        <div className="grid grid-cols-4 gap-4">
                          <FormInput control={form.control} name="obs_fullterm" label="Full Term" type="number" step={1} maxLength={2} placeholder="No. of full term pregnancies" />
                          <FormInput control={form.control} name="obs_preterm" label="Preterm" type="number" step={1} maxLength={2} placeholder="No. of preterm pregnancies" />
                          <FormInput control={form.control} name="obs_abortions" label="Abortions" type="number" step={1} maxLength={2} placeholder="No. of abortions" />
                          <FormInput control={form.control} name="obs_living_ch" label="Living Children" type="number" step={1} maxLength={2} placeholder="No. of living children" />
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
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <MdSmokingRooms className="text-blue-600" size={20} />
                          </div>
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
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <MdLocalBar className="text-blue-600" size={16} />
                            </div>
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
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-sky-100 p-2 rounded-lg">
                      <FilesIcon size={20} className="text-sky-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">Chief Complaint</h2>
                  </div>
                  <FormTextArea control={form.control} name="medrec_chief_complaint" label="" placeholder="Enter chief complaint details..." className="min-h-[100px]" rows={5} />
                </div>

                {/* BHW and Doctor Section */}
                <div className="flex gap-5 flex-col px-4">
                  <FormInput control={form.control} name="bhw_assignment" label="BHW Assigned" placeholder="BHW Assigned" />
                  <div>
                    <Label className="block mb-2 text-sm font-medium text-gray-700">Forward To</Label>
                    <div className="relative">
                      <Combobox
                        options={staffOptions?.formatted || []}
                        value={selectedStaffDisplay}
                        onChange={(value) => {
                          if (value) {
                            const staffId = value.split("-")[0];
                            setSelectedStaffDisplay(value);
                            setSelectedStaffId(staffId);
                            setValue("selectedDoctorStaffId", staffId);
                          } else {
                            setSelectedStaffDisplay("");
                            setSelectedStaffId("");
                            setValue("selectedDoctorStaffId", "");
                          }
                        }}
                        placeholder={staffLoading ? "Loading staff..." : "Select staff member"}
                        emptyMessage="No available staff members"
                        triggerClassName="w-full"
                      />
                    </div>
                    {form.formState.errors.selectedDoctorStaffId && <p className="text-red-500 text-sm mt-1">{form.formState.errors.selectedDoctorStaffId.message}</p>}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 px-4 pt-6 border-t border-gray-200">
                  <Button variant="outline" type="button" onClick={() => form.reset()} className="w-full sm:w-[150px]" disabled={non_membersubmit.isPending}>
                    Reset Form
                  </Button>
                  <Button type="submit" className="w-full sm:w-[150px] bg-blue-600 hover:bg-blue-700" disabled={!currentPatientData || non_membersubmit.isPending || !isPatientRegistered() || !selectedStaffId}>
                    {non_membersubmit.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </div>
                    ) : (
                      "Submit Consultation"
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
