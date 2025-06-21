import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // Use react-router-dom for Link
import { toast } from "sonner"; // Assuming sonner is your toast library
import { z } from "zod"; // Import z from zod for schema inference

// UI Components
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button/button";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Label } from "@radix-ui/react-dropdown-menu"; // Use appropriate Label component
import { Combobox } from "@/components/ui/combobox";

// API and Schema
import { api2 } from "@/api/api"; // Assuming api2 is correctly configured
import { page1Schema, FormData } from "@/form-schema/FamilyPlanningSchema"; // Assuming FormData type is exported from here


type Page1Props = {
  onNext2: () => void;
  updateFormData: (data: Partial<FormData>) => void;
  formData: FormData;
  mode?: "create" | "edit" | "view";
};

// Helper function to calculate age
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birthDateObj = new Date(birthDate);

  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }

  return age;
};

// Helper function to map education value
const mapEducationValue = (value: string): string | undefined => {
  if (!value) return undefined;

  switch (value.toLowerCase()) {
    case "elementary":
      return "elementary";
    case "high school":
      return "highschool";
    case "senior high school":
    case "shs":
      return "shs";
    case "college":
    case "college level":
      return "collegelevel";
    case "college graduate":
      return "collegegrad";
    default:
      return undefined;
  }
};

const normalizeRpId = (id: any): string | null => {
  if (id === undefined || id === null) {
    return null;
  }
  const actualId = typeof id === 'object' && id !== null && 'rp_id' in id
                   ? id.rp_id
                   : id;
  
  // Convert to string and remove any leading zeros for consistent comparison
  return String(actualId).replace(/^0+/, '') || null;
};


export default function FamilyPlanningForm({ onNext2, updateFormData, formData, mode = "create" }: Page1Props) {
  const isReadOnly = mode === "view";
  const navigate = useNavigate();

  // Create proper default values to ensure no undefined values
  const getDefaultValues = (data: FormData) => ({
    // Personal Information
    clientID: data.clientID || "",
    philhealthNo: data.philhealthNo || "",
    nhts_status: data.nhts_status ?? false, // Use nullish coalescing for boolean
    pantawid_4ps: data.pantawid_4ps ?? false,
    isTransient: (data as any).isTransient || "resident",
    lastName: data.lastName || "",
    givenName: data.givenName || "",
    middleInitial: data.middleInitial || "",
    dateOfBirth: data.dateOfBirth || "",
    age: data.age || 0,
    educationalAttainment: data.educationalAttainment || "",
    occupation: data.occupation || "",

    // Address
    address: {
      houseNumber: data.address?.houseNumber || "",
      street: data.address?.street || "",
      barangay: data.address?.barangay || "",
      municipality: data.address?.municipality || "",
      province: data.address?.province || "",
    },

    // Spouse Information
    spouse: {
      s_lastName: data.spouse?.s_lastName || "",
      s_givenName: data.spouse?.s_givenName || "",
      s_middleInitial: data.spouse?.s_middleInitial || "",
      s_dateOfBirth: data.spouse?.s_dateOfBirth || "",
      s_age: data.spouse?.s_age || 0,
      s_occupation: data.spouse?.s_occupation || "",
    },

    // Children and Income
    numOfLivingChildren: data.numOfLivingChildren ?? 0, // Ensure number default
    planToHaveMoreChildren: data.planToHaveMoreChildren ?? false,
    averageMonthlyIncome: data.averageMonthlyIncome || "",

    // Client Type and Methods
    typeOfClient: data.typeOfClient || "",
    subTypeOfClient: data.subTypeOfClient || "",
    reasonForFP: data.reasonForFP || "",
    otherReasonForFP: data.otherReasonForFP || "",
    reason: data.reason || "",
    fpt_other_reason_fp: data.fpt_other_reason_fp || "",
    methodCurrentlyUsed: data.methodCurrentlyUsed || "",
    otherMethod: data.otherMethod || "",

    // Acknowledgement (ensure nested objects are initialized)
    acknowledgement: {
      clientName: data.acknowledgement?.clientName || "",
      clientSignature: data.acknowledgement?.clientSignature || "",
      clientSignatureDate: data.acknowledgement?.clientSignatureDate || "",
      guardianName: data.acknowledgement?.guardianName || "",
      guardianSignature: data.acknowledgement?.guardianSignature || "",
      guardianSignatureDate: data.acknowledgement?.guardianSignatureDate || "",
    },

    // Other fields
    pat_id: data.pat_id || "",
    weight: data.weight ?? 0,
    height: data.height ?? 0,
    bmi: data.bmi ?? 0,
    bmi_category: data.bmi_category || "",

    // Obstetrical History
    obstetricalHistory: {
      g_pregnancies: data.obstetricalHistory?.g_pregnancies ?? 0,
      p_pregnancies: data.obstetricalHistory?.p_pregnancies ?? 0,
      fullTerm: data.obstetricalHistory?.fullTerm ?? 0,
      premature: data.obstetricalHistory?.premature ?? 0,
      abortion: data.obstetricalHistory?.abortion ?? 0,
      livingChildren: data.obstetricalHistory?.livingChildren ?? 0,
      lastDeliveryDate: data.obstetricalHistory?.lastDeliveryDate || "",
      typeOfLastDelivery: data.obstetricalHistory?.typeOfLastDelivery || "",
      lastMenstrualPeriod: data.obstetricalHistory?.lastMenstrualPeriod || "",
      previousMenstrualPeriod: data.obstetricalHistory?.previousMenstrualPeriod || "",
      menstrualFlow: data.obstetricalHistory?.menstrualFlow || "Scanty",
      dysmenorrhea: data.obstetricalHistory?.dysmenorrhea ?? false,
      hydatidiformMole: data.obstetricalHistory?.hydatidiformMole ?? false,
      ectopicPregnancyHistory: data.obstetricalHistory?.ectopicPregnancyHistory ?? false,
    }
  });

  const form = useForm<FormData>({
    // resolver: zodResolver(page1Schema),
    defaultValues: getDefaultValues(formData),
    values: getDefaultValues(formData), // Use values to keep form in sync with external formData
    mode: "onBlur", // Validate on blur for better UX
  });

  // Patient data types for fetched data
  interface PatientRecord {
    personal_info: {
      per_lname?: string;
      per_fname?: string;
      per_mname?: string;
      per_dob?: string;
      per_age?: string;
      per_sex?: string;
      per_address?: string; // This might need parsing if it's a combined string
      per_edAttainment?: string;
      per_religion?: string;
      per_occupation?: string;
      per_city?: string;
      per_province?: string;
      spouse_lname?: string; // These are patient's spouse info
      spouse_fname?: string;
      spouse_mname?: string;
    } | undefined;
    clientID?: string;
    pat_id: string;
    patrec_id?: string; // Optional as it might not be on all patient records
    nhts_status_from_household?: boolean;
    philhealth_id_from_hrd?: string;
    rp_id?: { rp_id: string; per?: any; rp_date_registered?: string; staff?: any }; // Updated to reflect nested object
    address?: {
        add_street?: string;
        houseNumber?: string;
        add_barangay?: string;
        add_city?: string;
        add_province?: string;
    };
  }

  interface FormattedPatient {
    id: string;
    name: string;
  }

  interface SpouseRecord {
    spouse_id: number;
    spouse_type: string;
    spouse_lname: string;
    spouse_fname: string;
    spouse_mname: string;
    spouse_occupation: string;
    spouse_dob: string; // Date string
    rp_id: string | number; // This should match ResidentProfile's PK type, could be string or number
  }

  interface BodyMeasurementRecord {
    bmi: number;
    bmi_category: string;
    height: number;
    pat: string; // patient id
    weight: number;
  }

  interface ObstetricalHistoryRecord {
    obs_id: number;
    obs_gravida: number;
    obs_para: number;
    obs_fullterm: number;
    obs_preterm: number;
    obs_abortion: number;
    obs_living_ch: number;
    obs_last_delivery: string;
    obs_type_last_delivery: string;
    obs_last_period: string;
    obs_previous_period: string;
    obs_mens_flow: string;
    obs_dysme: boolean;
    obs_hydatidiform: boolean;
    obs_ectopic_pregnancy: boolean;
    patrec_id: string; // foreign key to patient record
  }


  const [patients, setPatients] = useState<{
    default: PatientRecord[];
    formatted: FormattedPatient[];
  }>({ default: [], formatted: [] });
  const [loading, setLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [spouses, setSpouses] = useState<SpouseRecord[]>([]); // Renamed from 'spouse' to 'spouses' for clarity
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurementRecord[]>([]);
  const [obstetricalHistory, setObstetricalHistory] = useState<ObstetricalHistoryRecord[]>([]);
  const [healthDetails, setHealthDetails] = useState<any[]>([]);

  useEffect(() => {
    const fetchPatientsAndRelatedData = async () => {
      setLoading(true);
      try {
        const [patientsRes, spouseRes, measurementsRes, obstetricalRes, hrdRes] = await Promise.all([
          api2.get("patientrecords/patient/"),
          api2.get("patientrecords/spouse/"),
          api2.get("patientrecords/body-measurements/"),
          api2.get("patientrecords/obstetrical_history"),
          api2.get("health-profiling/healthrelateddetails"), 
        ]);

        const patientData = patientsRes.data;
        const spouseData = spouseRes.data;
        const measurementsData = measurementsRes.data;
        const obstetricalData = obstetricalRes.data;
        const healthData = hrdRes.data;
        const formattedPatients = patientData.map((patient: PatientRecord) => ({
          id: patient.pat_id?.toString() || "",
          name: `${patient.personal_info?.per_lname || ""}, ${patient.personal_info?.per_fname || ""} ${patient.personal_info?.per_mname || ""}`.trim(),
        }));
        
        setPatients({ default: patientData, formatted: formattedPatients });
        setSpouses(spouseData);
        setBodyMeasurements(measurementsData);
        setObstetricalHistory(obstetricalData);
        setHealthDetails(healthData);

        // console.log("✅ Patients fetched:", patientData);
        // console.log("✅ Spouses fetched:", spouseData);
        // console.log("✅ Body Measurements fetched:", measurementsData);
        // console.log("✅ Obstetrical History fetched:", obstetricalData);

      } catch (error) {
        console.error("❌ Error fetching data:", error);
        toast.error("Failed to load patient or spouse data");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientsAndRelatedData();
  }, []); // Empty dependency array means this runs once on mount

  const handlePatientSelection = (id: string) => {
    setSelectedPatientId(id);
    const selectedPatient = patients.default.find((p) => p.pat_id?.toString() === id);

    const normalizedPatientRpId = normalizeRpId(selectedPatient?.rp_id);

    const selectedSpouse = spouses.find((s) =>
      selectedPatient && normalizedPatientRpId && normalizeRpId(s.rp_id) === normalizedPatientRpId
    );
    console.log(selectedPatient)

    const patientMeasurements = bodyMeasurements.find((m) => m.pat?.toString() === id);
    const per_id = selectedPatient?.rp_id?.per?.per_id || selectedPatient?.personal_info?.per_id || null;
    
    const obsPatient = obstetricalHistory.find((obs) =>
        selectedPatient && obs.patrec_id === selectedPatient.patrec_id
    ) || null;

    if (per_id) {
    const matchingHRD = healthDetails.find((hrd) => hrd.per_id === per_id);
    if (matchingHRD?.hrd_philhealth_id) {
      form.setValue("philhealthNo", matchingHRD.hrd_philhealth_id);
    }
  }

    if (!selectedPatient?.personal_info) {
      // Reset form to default if no patient info is found
      form.reset(getDefaultValues(formData));
      updateFormData(getDefaultValues(formData));
      return;
    }

    const info = selectedPatient.personal_info;

    const patientData = {
      pat_id: selectedPatient.pat_id,
      clientID: selectedPatient.clientID || "",
      nhts_status: selectedPatient.nhts_status_from_household ?? false,
      // philhealthNo: selectedPatient.philhealth_id_from_hrd || "",

      lastName: info.per_lname || "",
      givenName: info.per_fname || "",
      middleInitial: (info.per_mname ? info.per_mname.charAt(0) : "") || "",
      dateOfBirth: info.per_dob || "",
      age: info.per_dob ? calculateAge(info.per_dob) : 0,
      educationalAttainment: mapEducationValue(info.per_edAttainment || "") || "",
      address: {
        houseNumber: selectedPatient.address?.houseNumber || formData.address?.houseNumber || "", // Prefer patient's address if available
        street: selectedPatient.address?.add_street || info.per_address || "",
        barangay: selectedPatient.address?.add_barangay || formData.address?.barangay || "",
        municipality: selectedPatient.address?.add_city || info.per_city || formData.address?.municipality || "",
        province: selectedPatient.address?.add_province || info.per_province || formData.address?.province || "",
      },
      occupation: info.per_occupation || "",
      weight: patientMeasurements?.weight ?? 0,
      height: patientMeasurements?.height ?? 0,
      bmi: patientMeasurements?.bmi ?? 0,
      bmi_category: patientMeasurements?.bmi_category || "",
      acknowledgement: {
        clientName: `${info.per_lname || ""}, ${info.per_fname || ""} ${info.per_mname || ""}`.trim(),
      },
      spouse: {
        s_lastName: selectedSpouse?.spouse_lname || "",
        s_givenName: selectedSpouse?.spouse_fname || "",
        s_middleInitial: selectedSpouse?.spouse_mname || "",
        s_dateOfBirth: selectedSpouse?.spouse_dob || "",
        s_age: selectedSpouse?.spouse_dob ? calculateAge(selectedSpouse.spouse_dob) : 0,
        s_occupation: selectedSpouse?.spouse_occupation || "",
      },
    };

    form.reset({
      ...getDefaultValues(formData), // Start with original form defaults
      ...patientData, // Overlay with selected patient data
    });

    if (obsPatient) {
      form.setValue("obstetricalHistory.g_pregnancies", obsPatient.obs_gravida ?? 0);
      form.setValue("obstetricalHistory.p_pregnancies", obsPatient.obs_para ?? 0);
      form.setValue("obstetricalHistory.fullTerm", obsPatient.obs_fullterm ?? 0);
      form.setValue("obstetricalHistory.premature", obsPatient.obs_preterm ?? 0);
      form.setValue("obstetricalHistory.abortion", obsPatient.obs_abortion ?? 0);
      form.setValue("obstetricalHistory.livingChildren", obsPatient.obs_living_ch ?? 0);
      form.setValue("obstetricalHistory.lastDeliveryDate", obsPatient.obs_last_delivery || "");
      form.setValue("obstetricalHistory.typeOfLastDelivery", obsPatient.obs_type_last_delivery || "");
      form.setValue("obstetricalHistory.lastMenstrualPeriod", obsPatient.obs_last_period || "");
      form.setValue("obstetricalHistory.previousMenstrualPeriod", obsPatient.obs_previous_period || "");
      form.setValue("obstetricalHistory.menstrualFlow", obsPatient.obs_mens_flow || "Scanty");
      form.setValue("obstetricalHistory.dysmenorrhea", obsPatient.obs_dysme ?? false);
      form.setValue("obstetricalHistory.hydatidiformMole", obsPatient.obs_hydatidiform ?? false);
      form.setValue("obstetricalHistory.ectopicPregnancyHistory", obsPatient.obs_ectopic_pregnancy ?? false);
    } else {
      // If no obstetrical history, ensure it's reset to defaults for `obstetricalHistory` object
      form.setValue("obstetricalHistory", getDefaultValues(formData).obstetricalHistory);
    }

    // Update the parent formData
    updateFormData({
      ...formData,
      ...patientData,
      obstetricalHistory: form.getValues("obstetricalHistory"), // Ensure updated obstetrical history is passed
    });
  };

  // Track date of birth and compute age
  const dateOfBirth = form.watch("dateOfBirth");
  const spouseDOB = form.watch("spouse.s_dateOfBirth");
  const typeOfClient = form.watch("typeOfClient");
  const subTypeOfClient = form.watch("subTypeOfClient");
  const isNewAcceptor = typeOfClient === "newacceptor";
  const isCurrentUser = typeOfClient === "currentuser";
  const isChangingMethod = isCurrentUser && subTypeOfClient === "changingmethod";


  // Effect for patient's age calculation
  useEffect(() => {
    if (dateOfBirth) {
      form.setValue("age", calculateAge(dateOfBirth));
    } else {
      form.setValue("age", 0);
    }
  }, [dateOfBirth, form]);

  // Effect for spouse's age calculation
  useEffect(() => {
    if (spouseDOB) {
      form.setValue("spouse.s_age", calculateAge(spouseDOB));
    } else {
      form.setValue("spouse.s_age", 0);
    }
  }, [spouseDOB, form]);

  // Effect to handle data loading and form population when selectedPatientId changes
  useEffect(() => {
    const selectedPatient = patients.default.find((patient) => patient.pat_id?.toString() === selectedPatientId);

    // Correctly access and normalize the nested rp_id for the patient
    const normalizedPatientRpId = normalizeRpId(selectedPatient?.rp_id);
    const selectedSpouse = spouses.find((s) =>
      selectedPatient && normalizedPatientRpId && normalizeRpId(s.rp_id) === normalizedPatientRpId
    );

    // Corrected: Finding obstetrical history linked to the selected PatientRecord's patrec_id
    const obstetricalpatient = obstetricalHistory.find((obs) =>
        selectedPatient && obs.patrec_id === selectedPatient.patrec_id
    ) || null;

    if (selectedPatient?.address) {
      form.setValue("address.houseNumber", selectedPatient.address.houseNumber || "");
      form.setValue("address.street", selectedPatient.address.add_street || "");
      form.setValue("address.barangay", selectedPatient.address.add_barangay || "");
      form.setValue("address.municipality", selectedPatient.address.add_city || "");
      form.setValue("address.province", selectedPatient.address.add_province || "");
    } else if (selectedPatient?.personal_info) {
        // Fallback to personal_info for address if dedicated address object is not present
        form.setValue("address.street", selectedPatient.personal_info.per_address || "");
        form.setValue("address.municipality", selectedPatient.personal_info.per_city || "");
        form.setValue("address.province", selectedPatient.personal_info.per_province || "");
    }


    if (selectedPatient?.personal_info?.per_edAttainment) {
      const mapped = mapEducationValue(selectedPatient.personal_info?.per_edAttainment);
      if (mapped) {
        form.setValue("educationalAttainment", mapped);
      }
    }

    if (selectedPatient) {
      form.setValue(
        "acknowledgement.clientName",
        `${selectedPatient.personal_info?.per_lname || ""}, ${selectedPatient.personal_info?.per_fname || ""} ${selectedPatient.personal_info?.per_mname || ""}`.trim(),
      );
    }

    if (selectedSpouse) {
      form.setValue("spouse.s_lastName", selectedSpouse.spouse_lname || "");
      form.setValue("spouse.s_givenName", selectedSpouse.spouse_fname || "");
      form.setValue("spouse.s_middleInitial", selectedSpouse.spouse_mname || "");
      form.setValue("spouse.s_occupation", selectedSpouse.spouse_occupation || "");
      form.setValue("spouse.s_dateOfBirth", selectedSpouse.spouse_dob || "");

      if (selectedSpouse.spouse_dob) {
        form.setValue("spouse.s_age", calculateAge(selectedSpouse.spouse_dob));
      }
    }

    if (obstetricalpatient) {
        form.setValue("obstetricalHistory.g_pregnancies", obstetricalpatient.obs_gravida ?? 0);
        form.setValue("obstetricalHistory.p_pregnancies", obstetricalpatient.obs_para ?? 0);
        form.setValue("obstetricalHistory.fullTerm", obstetricalpatient.obs_fullterm ?? 0);
        form.setValue("obstetricalHistory.premature", obstetricalpatient.obs_preterm ?? 0);
        form.setValue("obstetricalHistory.abortion", obstetricalpatient.obs_abortion ?? 0);
        form.setValue("obstetricalHistory.livingChildren", obstetricalpatient.obs_living_ch ?? 0);
        form.setValue("obstetricalHistory.lastDeliveryDate", obstetricalpatient.obs_last_delivery || "");
        form.setValue("obstetricalHistory.typeOfLastDelivery", obstetricalpatient.obs_type_last_delivery || "");
        form.setValue("obstetricalHistory.lastMenstrualPeriod", obstetricalpatient.obs_last_period || "");
        form.setValue("obstetricalHistory.previousMenstrualPeriod", obstetricalpatient.obs_previous_period || "");
        form.setValue("obstetricalHistory.menstrualFlow", obstetricalpatient.obs_mens_flow || "Scanty");
        form.setValue("obstetricalHistory.dysmenorrhea", obstetricalpatient.obs_dysme ?? false);
        form.setValue("obstetricalHistory.hydatidiformMole", obstetricalpatient.obs_hydatidiform ?? false);
        form.setValue("obstetricalHistory.ectopicPregnancyHistory", obstetricalpatient.obs_ectopic_pregnancy ?? false);
    } else {
        form.setValue("obstetricalHistory", getDefaultValues(formData).obstetricalHistory);
    }

  }, [selectedPatientId, patients.default, spouses, form, obstetricalHistory, formData]); // Added formData to dependencies for getDefaultValues

  // CRITICAL FIX: Ensure all non-applicable form values are cleared
  useEffect(() => {
    if (typeOfClient === "newacceptor") {
      form.setValue("subTypeOfClient", "");
      form.setValue("reason", ""); // "Reason (Current User)"
      form.setValue("fpt_other_reason_fp", ""); // "Specify Side Effects" for current user
    } else if (typeOfClient === "currentuser") {
      form.setValue("reasonForFP", ""); // "Reason for Family Planning"
      form.setValue("otherReasonForFP", ""); // "Specify Reason" for new acceptor

      if (subTypeOfClient === "changingclinic" || subTypeOfClient === "dropoutrestart") {
        form.setValue("reason", "");
        form.setValue("fpt_other_reason_fp", "");
        form.setValue("methodCurrentlyUsed", "");
        form.setValue("otherMethod", "");
      } else if (subTypeOfClient === "changingmethod") {
        if (form.getValues("methodCurrentlyUsed") !== "others") {
            form.setValue("otherMethod", "");
        }
      }
    } else { // When no typeOfClient is selected (e.g., initial state or cleared)
        form.setValue("subTypeOfClient", "");
        form.setValue("reasonForFP", "");
        form.setValue("otherReasonForFP", "");
        form.setValue("reason", "");
        form.setValue("fpt_other_reason_fp", "");
        form.setValue("methodCurrentlyUsed", "");
        form.setValue("otherMethod", "");
    }
    form.trigger(); // Trigger validation to reflect changes immediately
  }, [typeOfClient, subTypeOfClient, form]);


  const onSubmit = async (data: FormData) => {
    try {
      const validatedData = page1Schema.parse(data);
      // console.log("✅ Page 1 validation passed:", validatedData);

      updateFormData(validatedData);
      onNext2();
    } catch (error) {
      console.error("❌ Page 1 validation failed:", error);
      let errorMessage = "Please fill in all required fields correctly.";
      if (error instanceof z.ZodError) {
          const fieldErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
          errorMessage = `Validation failed:\n${fieldErrors}`;
          // console.error("Zod Validation Errors:", error.errors);
      }
      toast.error(errorMessage);
    }
  };

  // Input properties for read-only mode
  const inputProps = {
    disabled: isReadOnly,
    readOnly: isReadOnly,
  };

  // Options for form selects
  const CLIENT_TYPES = [
    { id: "newacceptor", name: "New Acceptor" },
    { id: "currentuser", name: "Current User" },
  ];

  const SUB_CLIENT_TYPES = [
    { id: "changingmethod", name: "Changing Method" },
    { id: "changingclinic", name: "Changing Clinic" },
    { id: "dropoutrestart", name: "Dropout/Restart" },
  ];

  const REASON_FOR_FP_OPTIONS = [
    { id: "spacing", name: "Spacing" },
    { id: "limiting", name: "Limiting" },
    { id: "fp_others", name: "Others" },
  ];

  const REASON_OPTIONS = [
    { id: "medicalcondition", name: "Medical Condition" },
    { id: "sideeffects", name: "Side Effects" },
  ];

  const METHOD_OPTIONS = [
    { id: "coc", name: "COC" },
    { id: "pop", name: "POP" },
    { id: "pills", name: "Pills" },
    { id: "injectable", name: "Injectable" },
    { id: "implant", name: "Implant" },
    { id: "iud-interval", name: "IUD-Interval" },
    { id: "iud-postpartum", name: "IUD-Post Partum" },
    { id: "condom", name: "Condom" },
    { id: "bom/cmm", name: "BOM/CMM" },
    { id: "bbt", name: "BBT" },
    { id: "stm", name: "STM" },
    { id: "sdm", name: "SDM" },
    { id: "lam", name: "LAM" },
    { id: "others", name: "Others" },
  ];

  const NEW_ACCEPTOR_METHOD_OPTIONS = [
    { id: "pills", name: "Pills" },
    { id: "dmpa", name: "DMPA" },
    { id: "condom", name: "Condom" },
    { id: "iud-interval", name: "IUD-Interval" },
    { id: "iud-postpartum", name: "IUD-Post Partum" },
    { id: "implant", name: "Implant" },
    { id: "lactating", name: "Lactating Amenorrhea" },
    { id: "bilateral", name: "Bilateral Tubal Ligation" },
    { id: "vasectomy", name: "Vasectomy" },
    { id: "others", name: "Others" },
  ];

  const EDUCATION_OPTIONS = [
    { id: "elementary", name: "Elementary" },
    { id: "highschool", name: "High School" },
    { id: "shs", name: "Senior High School" },
    { id: "collegelevel", name: "College Level" },
    { id: "collegegrad", name: "College Graduate" },
  ];

  const INCOME_OPTIONS = [
    { id: "lower", name: "Lower than 5,000" },
    { id: "5,000-10,000", name: "5,000-10,000" },
    { id: "10,000-30,000", name: "10,000-30,000" },
    { id: "30,000-50,000", name: "30,000-50,000" },
    { id: "50,000-80,000", name: "50,000-80,000" },
    { id: "80,000-100,000", name: "80,000-100,000" },
    { id: "100,000-200,000", name: "100,000-200,000" },
    { id: "higher", name: "Higher than 200,000" },
  ];


  return (
    <div className="bg-white min-h-screen w-full overflow-x-hidden">
      <div className="rounded-lg w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button className="text-black p-2 self-start" variant="outline" onClick={() => navigate(-1)} type="button">
          <ChevronLeft />
        </Button>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 p-4 text-center">Family Planning (FP) Form 1</h2>
        <h5 className="text-lg text-right font-semibold mb-2">Page 1</h5>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <strong className="text-lg">FAMILY PLANNING CLIENT ASSESSMENT RECORD</strong>
              <p className="mt-2">
                Instructions for Physicians, Nurses, and Midwives.{" "}
                <strong>Make sure that the client is not pregnant by using the questions listed in SIDE B.</strong>{" "}
                Completely fill out or check the required information. Refer accordingly for any abnormal
                history/findings for further medical evaluation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between w-full">
              <div className="grid gap-2">
                <Combobox
                  options={patients.formatted}
                  value={selectedPatientId}
                  onChange={handlePatientSelection} // Directly pass the handler
                  placeholder={loading ? "Loading patients..." : "Select a patient"}
                  triggerClassName="font-normal w-[30rem]"
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

            {/* Personal Information Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <FormInput control={form.control} name="clientID" label="CLIENT ID:" {...inputProps} />
              <FormInput control={form.control} name="philhealthNo" label="PHILHEALTH NO:" {...inputProps} />

              {/* NHTS Checkbox */}
              <FormField
                control={form.control}
                name="nhts_status"
                render={({ field }) => (
                  <FormItem className="ml-5 mt-2 flex flex-col">
                    <FormLabel className="mb-2">NHTS?</FormLabel>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value === true}
                          onCheckedChange={() => field.onChange(true)}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <Label>Yes</Label>
                      <FormControl>
                        <Checkbox
                          className="ml-4"
                          checked={field.value === false}
                          onCheckedChange={() => field.onChange(false)}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <Label>No</Label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 4Ps Checkbox */}
              <FormField
                control={form.control}
                name="pantawid_4ps"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-2 mt-2">Pantawid Pamilya Pilipino (4Ps)</FormLabel>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value === true}
                          onCheckedChange={() => field.onChange(true)}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <Label>Yes</Label>
                      <FormControl>
                        <Checkbox
                          className="ml-4"
                          checked={field.value === false}
                          onCheckedChange={() => field.onChange(false)}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <Label>No</Label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Name and Basic Info Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-6">
              <FormInput
                control={form.control}
                name="lastName"
                label="NAME OF CLIENT"
                placeholder="Last name"
                className="col-span-1"
                {...inputProps}
              />
              <FormInput
                control={form.control}
                label=""
                name="givenName"
                placeholder="Given name"
                className="col-span-1 m-4"
                {...inputProps}
              />
              <FormInput
                control={form.control}
                name="middleInitial"
                label=""
                placeholder="Middle Initial"
                className="col-span-1 m-4"
                {...inputProps}
              />
              <FormDateTimeInput
                control={form.control}
                type="date"
                name="dateOfBirth"
                label="Date of Birth:"
                {...inputProps}
              />
              <FormInput
                control={form.control}
                name="age"
                label="Age"
                type="number"
                readOnly
                className="col-span-1" // Age is set by effect, so readOnly is appropriate
                {...inputProps}
              />
              <FormSelect
                control={form.control}
                name="educationalAttainment"
                label="Education Attainment"
                options={EDUCATION_OPTIONS}
                {...inputProps}
              />
              <FormInput
                control={form.control}
                name="occupation"
                label="Occupation"
                placeholder="Occupation"
                className="col-span-1 sm:col-span-2 md:col-span-1"
                {...inputProps}
              />
            </div>

            {/* Address Section */}
            <div className="grid grid-cols-1 gap-2 mt-3">
              <FormLabel className="text-sm font-medium text-muted-foreground">
                ADDRESS (No. Street, Brgy, Municipality/City, Province)
              </FormLabel>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <FormInput
                  control={form.control}
                  name="address.houseNumber"
                  label=""
                  placeholder="No."
                  className="col-span-1"
                  {...inputProps}
                />
                <FormInput
                  control={form.control}
                  name="address.street"
                  label=""
                  placeholder="Street"
                  className="col-span-1"
                  {...inputProps}
                />
                <FormInput
                  control={form.control}
                  name="address.barangay"
                  label=""
                  placeholder="Barangay"
                  className="col-span-1"
                  {...inputProps}
                />
                <FormInput
                  control={form.control}
                  name="address.municipality"
                  label=""
                  placeholder="Municipality/City"
                  className="col-span-1"
                  {...inputProps}
                />
                <FormInput
                  control={form.control}
                  name="address.province"
                  label=""
                  placeholder="Province"
                  className="col-span-1"
                  {...inputProps}
                />
              </div>
            </div>

            {/* Spouse Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
              <FormInput
                control={form.control}
                name="spouse.s_lastName"
                label="NAME OF SPOUSE"
                placeholder="Last name"
                className="col-span-1"
                {...inputProps}
              />
              <FormInput
                control={form.control}
                name="spouse.s_givenName"
                label=""
                placeholder="Given name"
                className="col-span-1 mt-4"
                {...inputProps}
              />
              <FormInput
                control={form.control}
                name="spouse.s_middleInitial"
                label=""
                placeholder="Middle Initial"
                className="col-span-1 mt-4"
                {...inputProps}
              />
              <FormDateTimeInput
                control={form.control}
                type="date"
                name="spouse.s_dateOfBirth"
                label="Date of Birth"
                {...inputProps}
              />
              <FormInput
                control={form.control}
                name="spouse.s_age"
                label="Age"
                type="number"
                readOnly
                className="col-span-1" // Age is set by effect, so readOnly is appropriate
                {...inputProps}
              />
              <FormInput
                control={form.control}
                name="spouse.s_occupation"
                label="Occupation"
                placeholder="Occupation"
                className="col-span-1"
                {...inputProps}
              />
            </div>

            {/* Children and Income */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <FormInput
                control={form.control}
                name="numOfLivingChildren"
                label="NO. OF LIVING CHILDREN"
                type="number"
                {...inputProps}
              />
              <FormField
                control={form.control}
                name="planToHaveMoreChildren"
                render={({ field }) => (
                  <FormItem className="flex flex-col mt-3 ml-5">
                    <FormLabel className="mb-2">PLAN TO HAVE MORE CHILDREN?</FormLabel>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          className="border"
                          checked={field.value === true}
                          onCheckedChange={() => field.onChange(true)}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <Label>Yes</Label>
                      <FormControl>
                        <Checkbox
                          className="border ml-4"
                          checked={field.value === false}
                          onCheckedChange={() => field.onChange(false)}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <Label>No</Label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormSelect
                control={form.control}
                name="averageMonthlyIncome"
                label="AVERAGE MONTHLY INCOME"
                options={INCOME_OPTIONS}
                {...inputProps}
              />
            </div>

            {/* Client Type and Methods Section */}
            <div className="border border-t-black w-full p-4 rounded-md mt-6">
              <div className="grid grid-cols-12 gap-6">
                {/* Type of Client Section */}
                <div className="col-span-3">
                  <h3 className="font-semibold mb-3">
                    Type of Client<span className="text-red-500 ml-1">*</span>
                  </h3>
                  <FormSelect control={form.control} name="typeOfClient" options={CLIENT_TYPES} {...inputProps} />

                  {isCurrentUser && (
                    <div className="mt-4">
                      <FormSelect
                        control={form.control}
                        name="subTypeOfClient"
                        label="Sub Type of Client"
                        options={SUB_CLIENT_TYPES}
                        {...inputProps}
                      />
                    </div>
                  )}
                </div>

                {/* Middle Column - Reasons */}
                <div className="col-span-4 space-y-6">
                  {/* Reason for FP Section - only show for New Acceptor */}
                  {isNewAcceptor && (
                    <FormSelect
                      control={form.control}
                      name="reasonForFP"
                      label="Reason for Family Planning"
                      options={REASON_FOR_FP_OPTIONS}
                      {...inputProps}
                    />
                  )}

                  {/* Show specify reason field when "Others" is selected as reason for FP */}
                  {isNewAcceptor && form.watch("reasonForFP") === "fp_others" && (
                    <FormInput control={form.control} name="otherReasonForFP" label="Specify Reason:" {...inputProps} />
                  )}

                  {isChangingMethod && (
                    <FormSelect
                      control={form.control}
                      name="reason"
                      label="Reason (Current User)"
                      options={REASON_OPTIONS}
                      {...inputProps}
                    />
                  )}

                  {/* Show specify side effects field when "Side Effects" is selected as reason */}
                  {isChangingMethod && form.watch("reason") === "sideeffects" && (
                    <FormInput
                      control={form.control}
                      name="otherReason"
                      label="Specify Side Effects:"
                      {...inputProps}
                    />
                  )}
                </div>

                {/* Right Column - Methods */}
                <div className="col-span-5">
                  {isChangingMethod && (
                    <FormSelect
                      control={form.control}
                      name="methodCurrentlyUsed"
                      label="Method currently used (for Changing Method):"
                      options={METHOD_OPTIONS}
                      {...inputProps}
                    />
                  )}

                  {isNewAcceptor && (
                    <FormSelect
                      control={form.control}
                      name="methodCurrentlyUsed"
                      label="Method Accepted (New Acceptor)"
                      options={NEW_ACCEPTOR_METHOD_OPTIONS}
                      {...inputProps}
                    />
                  )}

                  {form.watch("methodCurrentlyUsed") === "others" && (
                    <FormInput
                      control={form.control}
                      name="otherMethod"
                      className="mt-6"
                      label="Specify other method:"
                      {...inputProps}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button" // Important for non-submit buttons
                onClick={async () => {
                  const isValid = await form.trigger();
                  if (isValid) {
                    const currentValues = form.getValues();
                    updateFormData(currentValues);
                    onNext2();
                  }
                }}
                disabled={isReadOnly}
              >
                Next
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}






















// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { ChevronLeft } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom"; // Use react-router-dom for Link
// import { toast } from "sonner"; // Assuming sonner is your toast library
// import { z } from "zod"; // Import z from zod for schema inference

// // UI Components
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button/button";
// import { FormInput } from "@/components/ui/form/form-input";
// import { FormSelect } from "@/components/ui/form/form-select";
// import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
// import { Label } from "@radix-ui/react-dropdown-menu"; // Use appropriate Label component
// import { Combobox } from "@/components/ui/combobox";

// // API and Schema
// import { api2 } from "@/api/api"; // Assuming api2 is correctly configured
// import { page1Schema, FormData } from "@/form-schema/FamilyPlanningSchema"; // Assuming FormData type is exported from here


// type Page1Props = {
//   onNext2: () => void;
//   updateFormData: (data: Partial<FormData>) => void;
//   formData: FormData;
//   mode?: "create" | "edit" | "view";
// };

// // Helper function to calculate age
// const calculateAge = (birthDate: string): number => {
//   const today = new Date();
//   const birthDateObj = new Date(birthDate);

//   let age = today.getFullYear() - birthDateObj.getFullYear();
//   const monthDiff = today.getMonth() - birthDateObj.getMonth();

//   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
//     age--;
//   }

//   return age;
// };

// // Helper function to map education value
// const mapEducationValue = (value: string): string | undefined => {
//   if (!value) return undefined;

//   switch (value.toLowerCase()) {
//     case "elementary":
//       return "elementary";
//     case "high school":
//       return "highschool";
//     case "senior high school":
//     case "shs":
//       return "shs";
//     case "college":
//     case "college level":
//       return "collegelevel";
//     case "college graduate":
//       return "collegegrad";
//     default:
//       return undefined;
//   }
// };

// const normalizeRpId = (id: any): string | null => {
//   if (id === undefined || id === null) {
//     return null;
//   }
//   const actualId = typeof id === 'object' && id !== null && 'rp_id' in id
//                    ? id.rp_id
//                    : id;
  
//   // Convert to string and remove any leading zeros for consistent comparison
//   return String(actualId).replace(/^0+/, '') || null;
// };


// export default function FamilyPlanningForm({ onNext2, updateFormData, formData, mode = "create" }: Page1Props) {
//   const isReadOnly = mode === "view";
//   const navigate = useNavigate();

//   // Create proper default values to ensure no undefined values
//   const getDefaultValues = (data: FormData) => ({
//     // Personal Information
//     clientID: data.clientID || "",
//     philhealthNo: data.philhealthNo || "",
//     nhts_status: data.nhts_status ?? false, // Use nullish coalescing for boolean
//     pantawid_4ps: data.pantawid_4ps ?? false,
//     isTransient: (data as any).isTransient || "resident",
//     lastName: data.lastName || "",
//     givenName: data.givenName || "",
//     middleInitial: data.middleInitial || "",
//     dateOfBirth: data.dateOfBirth || "",
//     age: data.age || 0,
//     educationalAttainment: data.educationalAttainment || "",
//     occupation: data.occupation || "",

//     // Address
//     address: {
//       houseNumber: data.address?.houseNumber || "",
//       street: data.address?.street || "",
//       barangay: data.address?.barangay || "",
//       municipality: data.address?.municipality || "",
//       province: data.address?.province || "",
//     },

//     // Spouse Information
//     spouse: {
//       s_lastName: data.spouse?.s_lastName || "",
//       s_givenName: data.spouse?.s_givenName || "",
//       s_middleInitial: data.spouse?.s_middleInitial || "",
//       s_dateOfBirth: data.spouse?.s_dateOfBirth || "",
//       s_age: data.spouse?.s_age || 0,
//       s_occupation: data.spouse?.s_occupation || "",
//     },

//     // Children and Income
//     numOfLivingChildren: data.numOfLivingChildren ?? 0, // Ensure number default
//     planToHaveMoreChildren: data.planToHaveMoreChildren ?? false,
//     averageMonthlyIncome: data.averageMonthlyIncome || "",

//     // Client Type and Methods
//     typeOfClient: data.typeOfClient || "",
//     subTypeOfClient: data.subTypeOfClient || "",
//     reasonForFP: data.reasonForFP || "",
//     otherReasonForFP: data.otherReasonForFP || "",
//     reason: data.reason || "",
//     fpt_other_reason_fp: data.fpt_other_reason_fp || "",
//     methodCurrentlyUsed: data.methodCurrentlyUsed || "",
//     otherMethod: data.otherMethod || "",

//     // Acknowledgement (ensure nested objects are initialized)
//     acknowledgement: {
//       clientName: data.acknowledgement?.clientName || "",
//       clientSignature: data.acknowledgement?.clientSignature || "",
//       clientSignatureDate: data.acknowledgement?.clientSignatureDate || "",
//       guardianName: data.acknowledgement?.guardianName || "",
//       guardianSignature: data.acknowledgement?.guardianSignature || "",
//       guardianSignatureDate: data.acknowledgement?.guardianSignatureDate || "",
//     },

//     // Other fields
//     pat_id: data.pat_id || "",
//     weight: data.weight ?? 0,
//     height: data.height ?? 0,
//     bmi: data.bmi ?? 0,
//     bmi_category: data.bmi_category || "",

//     // Obstetrical History
//     obstetricalHistory: {
//       g_pregnancies: data.obstetricalHistory?.g_pregnancies ?? 0,
//       p_pregnancies: data.obstetricalHistory?.p_pregnancies ?? 0,
//       fullTerm: data.obstetricalHistory?.fullTerm ?? 0,
//       premature: data.obstetricalHistory?.premature ?? 0,
//       abortion: data.obstetricalHistory?.abortion ?? 0,
//       livingChildren: data.obstetricalHistory?.livingChildren ?? 0,
//       lastDeliveryDate: data.obstetricalHistory?.lastDeliveryDate || "",
//       typeOfLastDelivery: data.obstetricalHistory?.typeOfLastDelivery || "",
//       lastMenstrualPeriod: data.obstetricalHistory?.lastMenstrualPeriod || "",
//       previousMenstrualPeriod: data.obstetricalHistory?.previousMenstrualPeriod || "",
//       menstrualFlow: data.obstetricalHistory?.menstrualFlow || "Scanty",
//       dysmenorrhea: data.obstetricalHistory?.dysmenorrhea ?? false,
//       hydatidiformMole: data.obstetricalHistory?.hydatidiformMole ?? false,
//       ectopicPregnancyHistory: data.obstetricalHistory?.ectopicPregnancyHistory ?? false,
//     }
//   });

//   const form = useForm<FormData>({
//     // resolver: zodResolver(page1Schema),
//     defaultValues: getDefaultValues(formData),
//     values: getDefaultValues(formData), // Use values to keep form in sync with external formData
//     mode: "onBlur", // Validate on blur for better UX
//   });

//   // Patient data types for fetched data
//   interface PatientRecord {
//     personal_info: {
//       per_lname?: string;
//       per_fname?: string;
//       per_mname?: string;
//       per_dob?: string;
//       per_age?: string;
//       per_sex?: string;
//       per_address?: string; // This might need parsing if it's a combined string
//       per_edAttainment?: string;
//       per_religion?: string;
//       per_occupation?: string;
//       per_city?: string;
//       per_id?: string;
//       per_province?: string;
//       spouse_lname?: string; // These are patient's spouse info
//       spouse_fname?: string;
//       spouse_mname?: string;
//     } | undefined;
//     clientID?: string;
//     pat_id: string;
//     patrec_id?: string; // Optional as it might not be on all patient records
//     nhts_status_from_household?: boolean;
//     philhealth_id_from_hrd?: string;
//     rp_id?: { rp_id: string; per?: any; rp_date_registered?: string; staff?: any }; // Updated to reflect nested object
//     address?: {
//         add_street?: string;
//         houseNumber?: string;
//         add_barangay?: string;
//         add_city?: string;
//         add_province?: string;
//     };
//   }

//   interface FormattedPatient {
//     id: string;
//     name: string;
//   }

//   interface SpouseRecord {
//     spouse_id: number;
//     spouse_type: string;
//     spouse_lname: string;
//     spouse_fname: string;
//     spouse_mname: string;
//     spouse_occupation: string;
//     spouse_dob: string; // Date string
//     rp_id: string | number; // This should match ResidentProfile's PK type, could be string or number
//   }

//   interface BodyMeasurementRecord {
//     bmi: number;
//     bmi_category: string;
//     height: number;
//     pat: string; // patient id
//     weight: number;
//   }

//   interface ObstetricalHistoryRecord {
//     obs_id: number;
//     obs_gravida: number;
//     obs_para: number;
//     obs_fullterm: number;
//     obs_preterm: number;
//     obs_abortion: number;
//     obs_living_ch: number;
//     obs_last_delivery: string;
//     obs_type_last_delivery: string;
//     obs_last_period: string;
//     obs_previous_period: string;
//     obs_mens_flow: string;
//     obs_dysme: boolean;
//     obs_hydatidiform: boolean;
//     obs_ectopic_pregnancy: boolean;
//     patrec_id: string; // foreign key to patient record
//   }


//   const [patients, setPatients] = useState<{
//     default: PatientRecord[];
//     formatted: FormattedPatient[];
//   }>({ default: [], formatted: [] });
//   const [loading, setLoading] = useState(false);
//   const [selectedPatientId, setSelectedPatientId] = useState("");
//   const [spouses, setSpouses] = useState<SpouseRecord[]>([]); // Renamed from 'spouse' to 'spouses' for clarity
//   const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurementRecord[]>([]);
//   const [obstetricalHistory, setObstetricalHistory] = useState<ObstetricalHistoryRecord[]>([]);
//   const [healthDetails, setHealthDetails] = useState<any[]>([]);

//   useEffect(() => {
//     const fetchPatientsAndRelatedData = async () => {
//       setLoading(true);
//       try {
//         const [patientsRes, spouseRes, measurementsRes, obstetricalRes, hrdRes] = await Promise.all([
//           api2.get("patientrecords/patient/"),
//           api2.get("patientrecords/spouse/"),
//           api2.get("patientrecords/body-measurements/"),
//           api2.get("patientrecords/obstetrical_history"),
//           api2.get("health-profiling/healthrelateddetails"), 
//         ]);

//         const patientData = patientsRes.data;
//         const spouseData = spouseRes.data;
//         const measurementsData = measurementsRes.data;
//         const obstetricalData = obstetricalRes.data;
//         const healthData = hrdRes.data;
//         const formattedPatients = patientData.map((patient: PatientRecord) => ({
//           id: patient.pat_id?.toString() || "",
//           name: `${patient.personal_info?.per_lname || ""}, ${patient.personal_info?.per_fname || ""} ${patient.personal_info?.per_mname || ""}`.trim(),
//         }));
        
//         setPatients({ default: patientData, formatted: formattedPatients });
//         setSpouses(spouseData);
//         setBodyMeasurements(measurementsData);
//         setObstetricalHistory(obstetricalData);
//         setHealthDetails(healthData);

//       } catch (error) {
//         console.error("❌ Error fetching data:", error);
//         toast.error("Failed to load patient or spouse data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPatientsAndRelatedData();
//   }, []);

//   const handlePatientSelection = (id: string) => {
//     setSelectedPatientId(id);
//     const selectedPatient = patients.default.find((p) => p.pat_id?.toString() === id);
//     const normalizedPatientRpId = normalizeRpId(selectedPatient?.rp_id);
//     const selectedSpouse = spouses.find((s) => selectedPatient && normalizedPatientRpId && normalizeRpId(s.rp_id) === normalizedPatientRpId );
//     const obsPatient = obstetricalHistory.find((obs) => selectedPatient && obs.patrec_id === selectedPatient.patrec_id) || null;    
//     const patientMeasurements = bodyMeasurements.find((m) => m.pat?.toString() === id);
//     const per_id = selectedPatient?.rp_id?.per?.per_id || selectedPatient?.personal_info?.per_id || null;

//     console.log("per Id",per_id)
//     console.log(selectedPatient)


//     if (per_id) {
//     const matchingHRD = healthDetails.find((hrd) => hrd.per_id === per_id);
//     console.log("Match",hrd.per_id)
    
//     if (matchingHRD?.hrd_philhealth_id) {
//       form.setValue("philhealthNo", matchingHRD.hrd_philhealth_id);
//     }
//   }

//     if (!selectedPatient?.personal_info) {
//       // Reset form to default if no patient info is found
//       form.reset(getDefaultValues(formData));
//       updateFormData(getDefaultValues(formData));
//       return;
//     }

//     const info = selectedPatient.personal_info;

//     const patientData = {
//       pat_id: selectedPatient.pat_id,
//       clientID: selectedPatient.clientID || "",
//       nhts_status: selectedPatient.nhts_status_from_household ?? false,
//       // philhealthNo: selectedPatient.philhealth_id_from_hrd || "",

//       lastName: info.per_lname || "",
//       givenName: info.per_fname || "",
//       middleInitial: (info.per_mname ? info.per_mname.charAt(0) : "") || "",
//       dateOfBirth: info.per_dob || "",
//       age: info.per_dob ? calculateAge(info.per_dob) : 0,
//       educationalAttainment: mapEducationValue(info.per_edAttainment || "") || "",
//       address: {
//         houseNumber: selectedPatient.address?.houseNumber || formData.address?.houseNumber || "", // Prefer patient's address if available
//         street: selectedPatient.address?.add_street || info.per_address || "",
//         barangay: selectedPatient.address?.add_barangay || formData.address?.barangay || "",
//         municipality: selectedPatient.address?.add_city || info.per_city || formData.address?.municipality || "",
//         province: selectedPatient.address?.add_province || info.per_province || formData.address?.province || "",
//       },
//       occupation: info.per_occupation || "",
//       weight: patientMeasurements?.weight ?? 0,
//       height: patientMeasurements?.height ?? 0,
//       bmi: patientMeasurements?.bmi ?? 0,
//       bmi_category: patientMeasurements?.bmi_category || "",
//       acknowledgement: {
//         clientName: `${info.per_lname || ""}, ${info.per_fname || ""} ${info.per_mname || ""}`.trim(),
//       },
//       spouse: {
//         s_lastName: selectedSpouse?.spouse_lname || "",
//         s_givenName: selectedSpouse?.spouse_fname || "",
//         s_middleInitial: selectedSpouse?.spouse_mname || "",
//         s_dateOfBirth: selectedSpouse?.spouse_dob || "",
//         s_age: selectedSpouse?.spouse_dob ? calculateAge(selectedSpouse.spouse_dob) : 0,
//         s_occupation: selectedSpouse?.spouse_occupation || "",
//       },
//     };

//     form.reset({
//       ...getDefaultValues(formData), // Start with original form defaults
//       ...patientData, // Overlay with selected patient data
//     });

//     if (obsPatient) {
//       form.setValue("obstetricalHistory.g_pregnancies", obsPatient.obs_gravida ?? 0);
//       form.setValue("obstetricalHistory.p_pregnancies", obsPatient.obs_para ?? 0);
//       form.setValue("obstetricalHistory.fullTerm", obsPatient.obs_fullterm ?? 0);
//       form.setValue("obstetricalHistory.premature", obsPatient.obs_preterm ?? 0);
//       form.setValue("obstetricalHistory.abortion", obsPatient.obs_abortion ?? 0);
//       form.setValue("obstetricalHistory.livingChildren", obsPatient.obs_living_ch ?? 0);
//       form.setValue("obstetricalHistory.lastDeliveryDate", obsPatient.obs_last_delivery || "");
//       form.setValue("obstetricalHistory.typeOfLastDelivery", obsPatient.obs_type_last_delivery || "");
//       form.setValue("obstetricalHistory.lastMenstrualPeriod", obsPatient.obs_last_period || "");
//       form.setValue("obstetricalHistory.previousMenstrualPeriod", obsPatient.obs_previous_period || "");
//       form.setValue("obstetricalHistory.menstrualFlow", obsPatient.obs_mens_flow || "Scanty");
//       form.setValue("obstetricalHistory.dysmenorrhea", obsPatient.obs_dysme ?? false);
//       form.setValue("obstetricalHistory.hydatidiformMole", obsPatient.obs_hydatidiform ?? false);
//       form.setValue("obstetricalHistory.ectopicPregnancyHistory", obsPatient.obs_ectopic_pregnancy ?? false);
//     } else {
//       // If no obstetrical history, ensure it's reset to defaults for `obstetricalHistory` object
//       form.setValue("obstetricalHistory", getDefaultValues(formData).obstetricalHistory);
//     }

//     // Update the parent formData
//     updateFormData({
//       ...formData,
//       ...patientData,
//       obstetricalHistory: form.getValues("obstetricalHistory"), // Ensure updated obstetrical history is passed
//     });
//   };

//   // Track date of birth and compute age
//   const dateOfBirth = form.watch("dateOfBirth");
//   const spouseDOB = form.watch("spouse.s_dateOfBirth");
//   const typeOfClient = form.watch("typeOfClient");
//   const subTypeOfClient = form.watch("subTypeOfClient");
//   const isNewAcceptor = typeOfClient === "newacceptor";
//   const isCurrentUser = typeOfClient === "currentuser";
//   const isChangingMethod = isCurrentUser && subTypeOfClient === "changingmethod";


//   // Effect for patient's age calculation
//   useEffect(() => {
//     if (dateOfBirth) {
//       form.setValue("age", calculateAge(dateOfBirth));
//     } else {
//       form.setValue("age", 0);
//     }
//   }, [dateOfBirth, form]);

//   // Effect for spouse's age calculation
//   useEffect(() => {
//     if (spouseDOB) {
//       form.setValue("spouse.s_age", calculateAge(spouseDOB));
//     } else {
//       form.setValue("spouse.s_age", 0);
//     }
//   }, [spouseDOB, form]);

//   // Effect to handle data loading and form population when selectedPatientId changes
//   useEffect(() => {
//     const selectedPatient = patients.default.find((patient) => patient.pat_id?.toString() === selectedPatientId);

//     // Correctly access and normalize the nested rp_id for the patient
//     const normalizedPatientRpId = normalizeRpId(selectedPatient?.rp_id);
//     const selectedSpouse = spouses.find((s) =>
//       selectedPatient && normalizedPatientRpId && normalizeRpId(s.rp_id) === normalizedPatientRpId
//     );

//     // Corrected: Finding obstetrical history linked to the selected PatientRecord's patrec_id
//     const obstetricalpatient = obstetricalHistory.find((obs) =>
//         selectedPatient && obs.patrec_id === selectedPatient.patrec_id
//     ) || null;

//     if (selectedPatient?.address) {
//       form.setValue("address.houseNumber", selectedPatient.address.houseNumber || "");
//       form.setValue("address.street", selectedPatient.address.add_street || "");
//       form.setValue("address.barangay", selectedPatient.address.add_barangay || "");
//       form.setValue("address.municipality", selectedPatient.address.add_city || "");
//       form.setValue("address.province", selectedPatient.address.add_province || "");
//     } else if (selectedPatient?.personal_info) {
//         // Fallback to personal_info for address if dedicated address object is not present
//         form.setValue("address.street", selectedPatient.personal_info.per_address || "");
//         form.setValue("address.municipality", selectedPatient.personal_info.per_city || "");
//         form.setValue("address.province", selectedPatient.personal_info.per_province || "");
//     }


//     if (selectedPatient?.personal_info?.per_edAttainment) {
//       const mapped = mapEducationValue(selectedPatient.personal_info?.per_edAttainment);
//       if (mapped) {
//         form.setValue("educationalAttainment", mapped);
//       }
//     }

//     if (selectedPatient) {
//       form.setValue(
//         "acknowledgement.clientName",
//         `${selectedPatient.personal_info?.per_lname || ""}, ${selectedPatient.personal_info?.per_fname || ""} ${selectedPatient.personal_info?.per_mname || ""}`.trim(),
//       );
//     }

//     if (selectedSpouse) {
//       form.setValue("spouse.s_lastName", selectedSpouse.spouse_lname || "");
//       form.setValue("spouse.s_givenName", selectedSpouse.spouse_fname || "");
//       form.setValue("spouse.s_middleInitial", selectedSpouse.spouse_mname || "");
//       form.setValue("spouse.s_occupation", selectedSpouse.spouse_occupation || "");
//       form.setValue("spouse.s_dateOfBirth", selectedSpouse.spouse_dob || "");

//       if (selectedSpouse.spouse_dob) {
//         form.setValue("spouse.s_age", calculateAge(selectedSpouse.spouse_dob));
//       }
//     }

//     if (obstetricalpatient) {
//         form.setValue("obstetricalHistory.g_pregnancies", obstetricalpatient.obs_gravida ?? 0);
//         form.setValue("obstetricalHistory.p_pregnancies", obstetricalpatient.obs_para ?? 0);
//         form.setValue("obstetricalHistory.fullTerm", obstetricalpatient.obs_fullterm ?? 0);
//         form.setValue("obstetricalHistory.premature", obstetricalpatient.obs_preterm ?? 0);
//         form.setValue("obstetricalHistory.abortion", obstetricalpatient.obs_abortion ?? 0);
//         form.setValue("obstetricalHistory.livingChildren", obstetricalpatient.obs_living_ch ?? 0);
//         form.setValue("obstetricalHistory.lastDeliveryDate", obstetricalpatient.obs_last_delivery || "");
//         form.setValue("obstetricalHistory.typeOfLastDelivery", obstetricalpatient.obs_type_last_delivery || "");
//         form.setValue("obstetricalHistory.lastMenstrualPeriod", obstetricalpatient.obs_last_period || "");
//         form.setValue("obstetricalHistory.previousMenstrualPeriod", obstetricalpatient.obs_previous_period || "");
//         form.setValue("obstetricalHistory.menstrualFlow", obstetricalpatient.obs_mens_flow || "Scanty");
//         form.setValue("obstetricalHistory.dysmenorrhea", obstetricalpatient.obs_dysme ?? false);
//         form.setValue("obstetricalHistory.hydatidiformMole", obstetricalpatient.obs_hydatidiform ?? false);
//         form.setValue("obstetricalHistory.ectopicPregnancyHistory", obstetricalpatient.obs_ectopic_pregnancy ?? false);
//     } else {
//         form.setValue("obstetricalHistory", getDefaultValues(formData).obstetricalHistory);
//     }

//   }, [selectedPatientId, patients.default, spouses, form, obstetricalHistory, formData]); // Added formData to dependencies for getDefaultValues

//   // CRITICAL FIX: Ensure all non-applicable form values are cleared
//   useEffect(() => {
//     if (typeOfClient === "newacceptor") {
//       form.setValue("subTypeOfClient", "");
//       form.setValue("reason", ""); // "Reason (Current User)"
//       form.setValue("fpt_other_reason_fp", ""); // "Specify Side Effects" for current user
//     } else if (typeOfClient === "currentuser") {
//       form.setValue("reasonForFP", ""); // "Reason for Family Planning"
//       form.setValue("otherReasonForFP", ""); // "Specify Reason" for new acceptor

//       if (subTypeOfClient === "changingclinic" || subTypeOfClient === "dropoutrestart") {
//         form.setValue("reason", "");
//         form.setValue("fpt_other_reason_fp", "");
//         form.setValue("methodCurrentlyUsed", "");
//         form.setValue("otherMethod", "");
//       } else if (subTypeOfClient === "changingmethod") {
//         if (form.getValues("methodCurrentlyUsed") !== "others") {
//             form.setValue("otherMethod", "");
//         }
//       }
//     } else { // When no typeOfClient is selected (e.g., initial state or cleared)
//         form.setValue("subTypeOfClient", "");
//         form.setValue("reasonForFP", "");
//         form.setValue("otherReasonForFP", "");
//         form.setValue("reason", "");
//         form.setValue("fpt_other_reason_fp", "");
//         form.setValue("methodCurrentlyUsed", "");
//         form.setValue("otherMethod", "");
//     }
//     form.trigger(); // Trigger validation to reflect changes immediately
//   }, [typeOfClient, subTypeOfClient, form]);


//   const onSubmit = async (data: FormData) => {
//     try {
//       const validatedData = page1Schema.parse(data);
//       // console.log("✅ Page 1 validation passed:", validatedData);

//       updateFormData(validatedData);
//       onNext2();
//     } catch (error) {
//       console.error("❌ Page 1 validation failed:", error);
//       let errorMessage = "Please fill in all required fields correctly.";
//       if (error instanceof z.ZodError) {
//           const fieldErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
//           errorMessage = `Validation failed:\n${fieldErrors}`;
//           // console.error("Zod Validation Errors:", error.errors);
//       }
//       toast.error(errorMessage);
//     }
//   };

//   // Input properties for read-only mode
//   const inputProps = {
//     disabled: isReadOnly,
//     readOnly: isReadOnly,
//   };

//   // Options for form selects
//   const CLIENT_TYPES = [
//     { id: "newacceptor", name: "New Acceptor" },
//     { id: "currentuser", name: "Current User" },
//   ];

//   const SUB_CLIENT_TYPES = [
//     { id: "changingmethod", name: "Changing Method" },
//     { id: "changingclinic", name: "Changing Clinic" },
//     { id: "dropoutrestart", name: "Dropout/Restart" },
//   ];

//   const REASON_FOR_FP_OPTIONS = [
//     { id: "spacing", name: "Spacing" },
//     { id: "limiting", name: "Limiting" },
//     { id: "fp_others", name: "Others" },
//   ];

//   const REASON_OPTIONS = [
//     { id: "medicalcondition", name: "Medical Condition" },
//     { id: "sideeffects", name: "Side Effects" },
//   ];

//   const METHOD_OPTIONS = [
//     { id: "coc", name: "COC" },
//     { id: "pop", name: "POP" },
//     { id: "pills", name: "Pills" },
//     { id: "injectable", name: "Injectable" },
//     { id: "implant", name: "Implant" },
//     { id: "iud-interval", name: "IUD-Interval" },
//     { id: "iud-postpartum", name: "IUD-Post Partum" },
//     { id: "condom", name: "Condom" },
//     { id: "bom/cmm", name: "BOM/CMM" },
//     { id: "bbt", name: "BBT" },
//     { id: "stm", name: "STM" },
//     { id: "sdm", name: "SDM" },
//     { id: "lam", name: "LAM" },
//     { id: "others", name: "Others" },
//   ];

//   const NEW_ACCEPTOR_METHOD_OPTIONS = [
//     { id: "pills", name: "Pills" },
//     { id: "dmpa", name: "DMPA" },
//     { id: "condom", name: "Condom" },
//     { id: "iud-interval", name: "IUD-Interval" },
//     { id: "iud-postpartum", name: "IUD-Post Partum" },
//     { id: "implant", name: "Implant" },
//     { id: "lactating", name: "Lactating Amenorrhea" },
//     { id: "bilateral", name: "Bilateral Tubal Ligation" },
//     { id: "vasectomy", name: "Vasectomy" },
//     { id: "others", name: "Others" },
//   ];

//   const EDUCATION_OPTIONS = [
//     { id: "elementary", name: "Elementary" },
//     { id: "highschool", name: "High School" },
//     { id: "shs", name: "Senior High School" },
//     { id: "collegelevel", name: "College Level" },
//     { id: "collegegrad", name: "College Graduate" },
//   ];

//   const INCOME_OPTIONS = [
//     { id: "lower", name: "Lower than 5,000" },
//     { id: "5,000-10,000", name: "5,000-10,000" },
//     { id: "10,000-30,000", name: "10,000-30,000" },
//     { id: "30,000-50,000", name: "30,000-50,000" },
//     { id: "50,000-80,000", name: "50,000-80,000" },
//     { id: "80,000-100,000", name: "80,000-100,000" },
//     { id: "100,000-200,000", name: "100,000-200,000" },
//     { id: "higher", name: "Higher than 200,000" },
//   ];


//   return (
//     <div className="bg-white min-h-screen w-full overflow-x-hidden">
//       <div className="rounded-lg w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <Button className="text-black p-2 self-start" variant="outline" onClick={() => navigate(-1)} type="button">
//           <ChevronLeft />
//         </Button>
//         <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 p-4 text-center">Family Planning (FP) Form 1</h2>
//         <h5 className="text-lg text-right font-semibold mb-2">Page 1</h5>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
//             <div className="bg-gray-50 p-4 rounded-md">
//               <strong className="text-lg">FAMILY PLANNING CLIENT ASSESSMENT RECORD</strong>
//               <p className="mt-2">
//                 Instructions for Physicians, Nurses, and Midwives.{" "}
//                 <strong>Make sure that the client is not pregnant by using the questions listed in SIDE B.</strong>{" "}
//                 Completely fill out or check the required information. Refer accordingly for any abnormal
//                 history/findings for further medical evaluation.
//               </p>
//             </div>

//             <div className="flex flex-col sm:flex-row items-center justify-between w-full">
//               <div className="grid gap-2">
//                 <Combobox
//                   options={patients.formatted}
//                   value={selectedPatientId}
//                   onChange={handlePatientSelection} // Directly pass the handler
//                   placeholder={loading ? "Loading patients..." : "Select a patient"}
//                   triggerClassName="font-normal w-[30rem]"
//                   emptyMessage={
//                     <div className="flex gap-2 justify-center items-center">
//                       <Label className="font-normal text-[13px]">
//                         {loading ? "Loading..." : "No patient found."}
//                       </Label>
//                       <Link to="/patient-records/new">
//                         <Label className="font-normal text-[13px] text-teal cursor-pointer hover:underline">
//                           Register New Patient
//                         </Label>
//                       </Link>
//                     </div>
//                   }
//                 />
//               </div>
//             </div>

//             {/* Personal Information Section */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//               <FormInput control={form.control} name="clientID" label="CLIENT ID:" {...inputProps} />
//               <FormInput control={form.control} name="philhealthNo" label="PHILHEALTH NO:" {...inputProps} />

//               {/* NHTS Checkbox */}
//               <FormField
//                 control={form.control}
//                 name="nhts_status"
//                 render={({ field }) => (
//                   <FormItem className="ml-5 mt-2 flex flex-col">
//                     <FormLabel className="mb-2">NHTS?</FormLabel>
//                     <div className="flex items-center space-x-2">
//                       <FormControl>
//                         <Checkbox
//                           checked={field.value === true}
//                           onCheckedChange={() => field.onChange(true)}
//                           disabled={isReadOnly}
//                         />
//                       </FormControl>
//                       <Label>Yes</Label>
//                       <FormControl>
//                         <Checkbox
//                           className="ml-4"
//                           checked={field.value === false}
//                           onCheckedChange={() => field.onChange(false)}
//                           disabled={isReadOnly}
//                         />
//                       </FormControl>
//                       <Label>No</Label>
//                     </div>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* 4Ps Checkbox */}
//               <FormField
//                 control={form.control}
//                 name="pantawid_4ps"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col">
//                     <FormLabel className="mb-2 mt-2">Pantawid Pamilya Pilipino (4Ps)</FormLabel>
//                     <div className="flex items-center space-x-2">
//                       <FormControl>
//                         <Checkbox
//                           checked={field.value === true}
//                           onCheckedChange={() => field.onChange(true)}
//                           disabled={isReadOnly}
//                         />
//                       </FormControl>
//                       <Label>Yes</Label>
//                       <FormControl>
//                         <Checkbox
//                           className="ml-4"
//                           checked={field.value === false}
//                           onCheckedChange={() => field.onChange(false)}
//                           disabled={isReadOnly}
//                         />
//                       </FormControl>
//                       <Label>No</Label>
//                     </div>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* Name and Basic Info Section */}
//             <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-6">
//               <FormInput
//                 control={form.control}
//                 name="lastName"
//                 label="NAME OF CLIENT"
//                 placeholder="Last name"
//                 className="col-span-1"
//                 {...inputProps}
//               />
//               <FormInput
//                 control={form.control}
//                 label=""
//                 name="givenName"
//                 placeholder="Given name"
//                 className="col-span-1 m-4"
//                 {...inputProps}
//               />
//               <FormInput
//                 control={form.control}
//                 name="middleInitial"
//                 label=""
//                 placeholder="Middle Initial"
//                 className="col-span-1 m-4"
//                 {...inputProps}
//               />
//               <FormDateTimeInput
//                 control={form.control}
//                 type="date"
//                 name="dateOfBirth"
//                 label="Date of Birth:"
//                 {...inputProps}
//               />
//               <FormInput
//                 control={form.control}
//                 name="age"
//                 label="Age"
//                 type="number"
//                 readOnly
//                 className="col-span-1" // Age is set by effect, so readOnly is appropriate
//                 {...inputProps}
//               />
//               <FormSelect
//                 control={form.control}
//                 name="educationalAttainment"
//                 label="Education Attainment"
//                 options={EDUCATION_OPTIONS}
//                 {...inputProps}
//               />
//               <FormInput
//                 control={form.control}
//                 name="occupation"
//                 label="Occupation"
//                 placeholder="Occupation"
//                 className="col-span-1 sm:col-span-2 md:col-span-1"
//                 {...inputProps}
//               />
//             </div>

//             {/* Address Section */}
//             <div className="grid grid-cols-1 gap-2 mt-3">
//               <FormLabel className="text-sm font-medium text-muted-foreground">
//                 ADDRESS (No. Street, Brgy, Municipality/City, Province)
//               </FormLabel>

//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
//                 <FormInput
//                   control={form.control}
//                   name="address.houseNumber"
//                   label=""
//                   placeholder="No."
//                   className="col-span-1"
//                   {...inputProps}
//                 />
//                 <FormInput
//                   control={form.control}
//                   name="address.street"
//                   label=""
//                   placeholder="Street"
//                   className="col-span-1"
//                   {...inputProps}
//                 />
//                 <FormInput
//                   control={form.control}
//                   name="address.barangay"
//                   label=""
//                   placeholder="Barangay"
//                   className="col-span-1"
//                   {...inputProps}
//                 />
//                 <FormInput
//                   control={form.control}
//                   name="address.municipality"
//                   label=""
//                   placeholder="Municipality/City"
//                   className="col-span-1"
//                   {...inputProps}
//                 />
//                 <FormInput
//                   control={form.control}
//                   name="address.province"
//                   label=""
//                   placeholder="Province"
//                   className="col-span-1"
//                   {...inputProps}
//                 />
//               </div>
//             </div>

//             {/* Spouse Information */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
//               <FormInput
//                 control={form.control}
//                 name="spouse.s_lastName"
//                 label="NAME OF SPOUSE"
//                 placeholder="Last name"
//                 className="col-span-1"
//                 {...inputProps}
//               />
//               <FormInput
//                 control={form.control}
//                 name="spouse.s_givenName"
//                 label=""
//                 placeholder="Given name"
//                 className="col-span-1 mt-4"
//                 {...inputProps}
//               />
//               <FormInput
//                 control={form.control}
//                 name="spouse.s_middleInitial"
//                 label=""
//                 placeholder="Middle Initial"
//                 className="col-span-1 mt-4"
//                 {...inputProps}
//               />
//               <FormDateTimeInput
//                 control={form.control}
//                 type="date"
//                 name="spouse.s_dateOfBirth"
//                 label="Date of Birth"
//                 {...inputProps}
//               />
//               <FormInput
//                 control={form.control}
//                 name="spouse.s_age"
//                 label="Age"
//                 type="number"
//                 readOnly
//                 className="col-span-1" // Age is set by effect, so readOnly is appropriate
//                 {...inputProps}
//               />
//               <FormInput
//                 control={form.control}
//                 name="spouse.s_occupation"
//                 label="Occupation"
//                 placeholder="Occupation"
//                 className="col-span-1"
//                 {...inputProps}
//               />
//             </div>

//             {/* Children and Income */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
//               <FormInput
//                 control={form.control}
//                 name="numOfLivingChildren"
//                 label="NO. OF LIVING CHILDREN"
//                 type="number"
//                 {...inputProps}
//               />
//               <FormField
//                 control={form.control}
//                 name="planToHaveMoreChildren"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col mt-3 ml-5">
//                     <FormLabel className="mb-2">PLAN TO HAVE MORE CHILDREN?</FormLabel>
//                     <div className="flex items-center space-x-2">
//                       <FormControl>
//                         <Checkbox
//                           className="border"
//                           checked={field.value === true}
//                           onCheckedChange={() => field.onChange(true)}
//                           disabled={isReadOnly}
//                         />
//                       </FormControl>
//                       <Label>Yes</Label>
//                       <FormControl>
//                         <Checkbox
//                           className="border ml-4"
//                           checked={field.value === false}
//                           onCheckedChange={() => field.onChange(false)}
//                           disabled={isReadOnly}
//                         />
//                       </FormControl>
//                       <Label>No</Label>
//                     </div>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormSelect
//                 control={form.control}
//                 name="averageMonthlyIncome"
//                 label="AVERAGE MONTHLY INCOME"
//                 options={INCOME_OPTIONS}
//                 {...inputProps}
//               />
//             </div>

//             {/* Client Type and Methods Section */}
//             <div className="border border-t-black w-full p-4 rounded-md mt-6">
//               <div className="grid grid-cols-12 gap-6">
//                 {/* Type of Client Section */}
//                 <div className="col-span-3">
//                   <h3 className="font-semibold mb-3">
//                     Type of Client<span className="text-red-500 ml-1">*</span>
//                   </h3>
//                   <FormSelect control={form.control} name="typeOfClient" options={CLIENT_TYPES} {...inputProps} />

//                   {isCurrentUser && (
//                     <div className="mt-4">
//                       <FormSelect
//                         control={form.control}
//                         name="subTypeOfClient"
//                         label="Sub Type of Client"
//                         options={SUB_CLIENT_TYPES}
//                         {...inputProps}
//                       />
//                     </div>
//                   )}
//                 </div>

//                 {/* Middle Column - Reasons */}
//                 <div className="col-span-4 space-y-6">
//                   {/* Reason for FP Section - only show for New Acceptor */}
//                   {isNewAcceptor && (
//                     <FormSelect
//                       control={form.control}
//                       name="reasonForFP"
//                       label="Reason for Family Planning"
//                       options={REASON_FOR_FP_OPTIONS}
//                       {...inputProps}
//                     />
//                   )}

//                   {/* Show specify reason field when "Others" is selected as reason for FP */}
//                   {isNewAcceptor && form.watch("reasonForFP") === "fp_others" && (
//                     <FormInput control={form.control} name="otherReasonForFP" label="Specify Reason:" {...inputProps} />
//                   )}

//                   {isChangingMethod && (
//                     <FormSelect
//                       control={form.control}
//                       name="reason"
//                       label="Reason (Current User)"
//                       options={REASON_OPTIONS}
//                       {...inputProps}
//                     />
//                   )}

//                   {/* Show specify side effects field when "Side Effects" is selected as reason */}
//                   {isChangingMethod && form.watch("reason") === "sideeffects" && (
//                     <FormInput
//                       control={form.control}
//                       name="otherReason"
//                       label="Specify Side Effects:"
//                       {...inputProps}
//                     />
//                   )}
//                 </div>

//                 {/* Right Column - Methods */}
//                 <div className="col-span-5">
//                   {isChangingMethod && (
//                     <FormSelect
//                       control={form.control}
//                       name="methodCurrentlyUsed"
//                       label="Method currently used (for Changing Method):"
//                       options={METHOD_OPTIONS}
//                       {...inputProps}
//                     />
//                   )}

//                   {isNewAcceptor && (
//                     <FormSelect
//                       control={form.control}
//                       name="methodCurrentlyUsed"
//                       label="Method Accepted (New Acceptor)"
//                       options={NEW_ACCEPTOR_METHOD_OPTIONS}
//                       {...inputProps}
//                     />
//                   )}

//                   {form.watch("methodCurrentlyUsed") === "others" && (
//                     <FormInput
//                       control={form.control}
//                       name="otherMethod"
//                       className="mt-6"
//                       label="Specify other method:"
//                       {...inputProps}
//                     />
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-end space-x-4">
//               <Button
//                 type="button" // Important for non-submit buttons
//                 onClick={async () => {
//                   const isValid = await form.trigger();
//                   if (isValid) {
//                     const currentValues = form.getValues();
//                     updateFormData(currentValues);
//                     onNext2();
//                   }
//                 }}
//                 disabled={isReadOnly}
//               >
//                 Next
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </div>
//     </div>
//   );
// }