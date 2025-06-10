//MEDICAL CON

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  nonPhilHealthSchema,
  nonPhilHealthType,
} from "@/form-schema/medicalConsultation/nonPhilhealthSchema";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { ArrowLeft, UserPlus, ChevronLeft, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { api } from "@/api/api";

import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { fetchPatientRecords } from "@/pages/healthServices/vaccination//restful-api/FetchPatient";
import { calculateAge } from "@/helpers/ageCalculator";
import { Combobox } from "@/components/ui/combobox";
import { create } from "domain";
import axios from "axios";
// Define the physical exam schema with arrays for multiple selections
// const physicalExamSchema = z.object({
//   skin: z
//     .object({
//       status: z
//         .array(
//           z.enum([
//             "normal",
//             "edema",
//             "rash",
//             "pallor",
//             "cyanosis",
//             "jaundice",
//             "other",
//           ])
//         )

//     })
//     .optional(),
//   eyes: z
//     .object({
//       status: z
//         .array(
//           z.enum([
//             "normal",
//             "yellowish",
//             "redness",
//             "discharge",
//             "swelling",
//             "other",
//           ])
//         )

//     })
//     .optional(),
//   ears: z.object({
//     status: z
//       .array(z.enum(["normal", "discharge", "redness", "swelling", "other"]))

//   }),
//   nose: z
//     .object({
//       status: z
//         .array(
//           z.enum(["normal", "discharge", "congestion", "bleeding", "other"])
//         )

//     })
//     .optional(),
//   throat: z
//     .object({
//       status: z
//         .array(z.enum(["normal", "redness", "swelling", "exudate", "other"]))

//     })
//     .optional(),
//   chest: z
//     .object({
//       status: z
//         .array(
//           z.enum([
//             "normal",
//             "wheezing",
//             "crackles",
//             "decreased breath sounds",
//             "other",
//           ])
//         )

//     })
//     .optional(),
//   heart: z
//     .object({
//       status: z
//         .array(
//           z.enum([
//             "normal",
//             "murmur",
//             "irregular rhythm",
//             "tachycardia",
//             "bradycardia",
//             "other",
//           ])
//         )

//     })
//     .optional(),
//   abdomen: z
//     .object({
//       status: z
//         .array(z.enum(["normal", "tender", "distended", "mass", "other"]))

//     })
//     .optional(),
//   extremities: z
//     .object({
//       status: z
//         .array(
//           z.enum([
//             "normal",
//             "edema",
//             "deformity",
//             "limited range of motion",
//             "other",
//           ])
//         )

//     })
//     .optional(),
//   neurological: z
//     .object({
//       status: z
//         .array(
//           z.enum([
//             "normal",
//             "weakness",
//             "numbness",
//             "altered mental status",
//             "other",
//           ])
//         )

//     })
//     .optional(),
// });

// Combine both schemas

// Define CombinedFormType globally
// type CombinedFormType = nonPhilHealthType & z.infer<typeof physicalExamSchema>;

export default function NonPHMedicalForm() {
  // const combinedSchema = nonPhilHealthSchema.merge(physicalExamSchema);

  // Add these state variables at the top of your component
  const [patients, setPatients] = useState({
    default: [] as any[],
    formatted: [] as { id: string; name: string }[],
  });
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedPatientData, setSelectedPatientData] = useState<any>(null);

  // Add this useEffect hook to fetch patients
  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      try {
        const data = await fetchPatientRecords();
        setPatients(data);
      } catch (error) {
        toast.error("Failed to load patients");
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, []);

  const form = useForm<nonPhilHealthType>({
    resolver: zodResolver(nonPhilHealthSchema),
    defaultValues: {
      pat_id: undefined,
      bhw_assignment: "Caballes Katrina Shin",
      vital_pulse: undefined,
      vital_temp: undefined,
      vital_bp_systolic: undefined,
      vital_bp_diastolic: undefined,
      vital_RR: undefined,
      height: undefined,
      weight: undefined,
      medrec_chief_complaint: "",
      // doctor: "",
      // skin: { status: ["normal"] },
      // eyes: { status: ["normal"] },
      // ears: { status: ["normal"] },
      // nose: { status: ["normal"] },
      // throat: { status: ["normal"] },
      // chest: { status: ["normal"] },
      // heart: { status: ["normal"] },
      // abdomen: { status: ["normal"] },
      // extremities: { status: ["normal"] },
      // neurological: { status: ["normal"] },
    },
  });

  console.log("Patients:", patients);

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
      form.setValue("pat_id", selectedPatient.pat_id);
    }
  };

  const onSubmit = async (data: nonPhilHealthType) => {
    console.log(data);
    console.log(form.formState.errors);
    if (!selectedPatientId) {
      toast.error("Please select a patient first");
      return;
    }

    let patrec: string | null = null;
    let vital: string | null = null;
    let bmi: string | null = null;
    let medrec_id: string | null = null;

    try {
      const serviceResponse = await api.post("patientrecords/patient-record/", {
        patrec_type: "Medical Consultation",
        pat_id: selectedPatientId,
        created_at: new Date().toISOString(),
      });
      patrec= serviceResponse.data.patrec_id;

      console.log("Service Response:", serviceResponse.data);

      const vitalSignsResponse = await api.post("patientrecords/vital-signs/", {
        vital_bp_systolic: data.vital_bp_systolic?.toString() || "",
        vital_bp_diastolic: data.vital_bp_diastolic?.toString() || "",
        vital_temp: data.vital_pulse?.toString() || "",
        vital_RR: data.vital_RR?.toString() || "",
        vital_o2: "N/A",
        vital_pulse: data.vital_pulse?.toString() || "",

        created_at: new Date().toISOString(),
      });
      vital = vitalSignsResponse.data.vital_id;
      console.log("Vital Signs Response:", vitalSignsResponse.data);

      const bmiResponse = await api.post("patientrecords/body-measurements/", {
        height: data.height,
        weight: data.weight,
        age: calculateAge(
          selectedPatientData?.personal_info?.per_dob || ""
        ).toString(),
        bmi: 23.3,
        bmi_category: "N/A",
        created_at: new Date().toISOString(),
        patrec: patrec,
      });
      bmi = bmiResponse.data.bm_id;
      console.log("BMI Response:", bmi);


      const medicalRecordResponse = await api.post(
        "medical-consultation/medical-consultation-record/",
        {
          patrec: patrec,
          vital: vital,
          bm: bmi,
          find:null,
          bhw_assignment: 1,
          medrec_chief_complaint: data.medrec_chief_complaint,
          doc_id: 1,
          created_at: new Date().toISOString(),
        }
      );

      medrec_id = medicalRecordResponse.data.medrec_id;
      console.log("Medical Record Response:", medicalRecordResponse.data);
      toast.success("Medical record created successfully");



    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        // Server responded with a status outside 2xx
        console.error("Error Response Data:", error.response.data); // <-- DRF validation errors here
        console.error("Status:", error.response.status);
        console.error("Headers:", error.response.headers);
        toast.error("Something went wrong. Check console for details.");
      } 
        toast.error("Error setting up request.");
      
      return;
    }
  };

  const formFields = {
    nameFields: [
      { name: "lname", label: "Last Name", placeholder: "Enter Last Name" },
      { name: "fname", label: "First Name", placeholder: "Enter First Name" },
      { name: "mname", label: "Middle Name", placeholder: "Enter Middle Name" },
    ],
    addressFields: [
      {
        name: "houseno",
        label: "House No.",
        placeholder: "Enter house number",
      },
      { name: "street", label: "Street", placeholder: "Enter street" },
      { name: "sitio", label: "Sitio", placeholder: "Enter sitio" },
      { name: "barangay", label: "Barangay", placeholder: "Enter barangay" },
      { name: "city", label: "City", placeholder: "Enter city" },
      { name: "province", label: "Province", placeholder: "Enter province" },
    ],
    vitalSignsFields: [
      { name: "hr", label: "Heart Rate", placeholder: "Enter Heart Rate" },
      { name: "temp", label: "Temp", placeholder: "Enter Temperature" },
      {
        name: "rrc",
        label: "Respiratory Rate",
        placeholder: "Enter Respiratory Count",
      },
      { name: "ht", label: "Height", placeholder: "height" },
      { name: "wt", label: "Weight", placeholder: "weight" },
    ],
  };

  const location = useLocation();
  const recordType = location.state?.recordType || "nonExistingPatient";
  const navigate = useNavigate();
  const doctor = [
    { id: "Kimmy Mo Ma Chung", name: "Kimmy Mo Ma Chung" },
    { id: "Chi Chung", name: "Chi Chung" },
  ];

  const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  // // Define the body parts and their options for physical exam
  // const bodyParts = [
  //   {
  //     id: "skin",
  //     name: "Skin",
  //     options: [
  //       "normal",
  //       "edema",
  //       "rash",
  //       "pallor",
  //       "cyanosis",
  //       "jaundice",
  //       "other",
  //     ],
  //   },
  //   {
  //     id: "eyes",
  //     name: "Eyes",
  //     options: [
  //       "normal",
  //       "yellowish",
  //       "redness",
  //       "discharge",
  //       "swelling",
  //       "other",
  //     ],
  //   },
  //   {
  //     id: "ears",
  //     name: "Ears",
  //     options: ["normal", "discharge", "redness", "swelling", "other"],
  //   },
  //   {
  //     id: "nose",
  //     name: "Nose",
  //     options: ["normal", "discharge", "congestion", "bleeding", "other"],
  //   },
  //   {
  //     id: "throat",
  //     name: "Throat",
  //     options: ["normal", "redness", "swelling", "exudate", "other"],
  //   },
  //   {
  //     id: "chest",
  //     name: "Chest",
  //     options: [
  //       "normal",
  //       "wheezing",
  //       "crackles",
  //       "decreased breath sounds",
  //       "other",
  //     ],
  //   },
  //   {
  //     id: "heart",
  //     name: "Heart",
  //     options: [
  //       "normal",
  //       "murmur",
  //       "irregular rhythm",
  //       "tachycardia",
  //       "bradycardia",
  //       "other",
  //     ],
  //   },
  //   {
  //     id: "abdomen",
  //     name: "Abdomen",
  //     options: ["normal", "tender", "distended", "mass", "other"],
  //   },
  //   {
  //     id: "extremities",
  //     name: "Extremities",
  //     options: [
  //       "normal",
  //       "edema",
  //       "deformity",
  //       "limited range of motion",
  //       "other",
  //     ],
  //   },
  //   {
  //     id: "neurological",
  //     name: "Neurological",
  //     options: [
  //       "normal",
  //       "weakness",
  //       "numbness",
  //       "altered mental status",
  //       "other",
  //     ],
  //   },
  // ];

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant={"outline"}
          onClick={() => {
            if (recordType === "nonExistingPatient") {
              navigate("/allMedRecords");
            } else {
              navigate("/invMedRecords");
            }
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient Information Section */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-8 mb-6">
            {/* Search and Add Resident Section */}

            <div className="w-full mb-5">
              {selectedPatientData && (
                <div className="space-y-4">
                  <h2 className="font-semibold text-blue bg-blue-50 rounded-md">
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-black/65">Full Name</Label>
                      <p className="font-medium">
                        {`${
                          selectedPatientData.personal_info?.per_lname || ""
                        }, 
                    ${selectedPatientData.personal_info?.per_fname || ""} 
                    ${selectedPatientData.personal_info?.per_mname || ""}`}
                      </p>
                    </div>

                    <div>
                      <Label className="text-black/65">Date of Birth</Label>
                      <p className="font-medium">
                        {selectedPatientData.personal_info?.per_dob}
                      </p>
                    </div>
                    <div>
                      <Label className="text-black/65">Age</Label>
                      <p className="font-medium">
                        {calculateAge(
                          selectedPatientData.personal_info?.per_dob
                        )}
                      </p>
                    </div>

                    <div>
                      <Label className="text-black/65">Sex</Label>
                      <p className="font-medium">
                        {selectedPatientData.personal_info?.per_sex}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-black/65">Address.</Label>

                    <div>
                      <p className="font-medium">
                        {selectedPatientData.households?.[0]?.hh_id || "1242"}{" "}
                        {selectedPatientData.households?.[0]?.hh_street ||
                          "Kamunggay"}
                        ,{" "}
                        {selectedPatientData.households?.[0]?.barangay ||
                          "San Rouque"}{" "}
                        {selectedPatientData.households?.[0]?.sitio || "Lomboy"}{" "}
                        {selectedPatientData.households?.[0]?.city ||
                          "Kamunggay"}
                        {selectedPatientData.households?.[0]?.province ||
                          "Cebu"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Demographics Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>

            {/* Vital Signs Section */}
            <div className="space-y-4">
              <h2 className="font-semibold text-blue bg-blue-50 rounded-md">
                Vital Sign
              </h2>{" "}
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {formFields.vitalSignsFields.slice(0, 3).map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name as keyof nonPhilHealthType}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-black/65">
                          {field.label}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={formField.value || ""}
                            placeholder={field.placeholder}
                            onChange={(e) =>
                              formField.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div> */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                <FormInput
                  control={form.control}
                  name="vital_pulse"
                  label="Heart Rate"
                  placeholder="Enter Heart Rate"
                  type="number"
                />
                <FormInput
                  control={form.control}
                  name="vital_RR"
                  label="Respiratory Rate"
                  placeholder="Enter Respiratory Rate"
                  type="number"
                />
                <FormInput
                  control={form.control}
                  name="vital_temp"
                  label="Temperature"
                  placeholder="Enter Temperature"
                  type="number"
                />
                <FormInput
                  control={form.control}
                  name="height"
                  label="Height"
                  placeholder="Enter Height"
                  type="number"
                />
                <FormInput
                  control={form.control}
                  name="weight"
                  label="Weight"
                  placeholder="Enter Weight"
                  type="number"
                />
              </div>
              {/* Blood Pressure */}
              <div className="flex flex-col sm:flex-row gap-4 items-center pt-3 mb-5">
                <h2 className="font-semibold text-blue bg-blue-50 rounded-md">
                  Blood Pressure
                </h2>
                <div className="flex gap-2">
                  <FormInput
                    control={form.control}
                    name="vital_bp_systolic"
                    label="Systolic Blood Pressure"
                    type="number"
                    placeholder="Systolic"
                  />
                  <FormInput
                    control={form.control}
                    name="vital_bp_diastolic"
                    label="Diastolic Blood Pressure"
                    type="number"
                    placeholder="Diastolic"
                  />
                </div>
              </div>
            </div>

            {/* Chief Complaint */}

            <div className="mb-5">
              <FormField
                control={form.control}
                name="medrec_chief_complaint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-black/65">
                      Chief Complaint
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter chief complaint"
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bhw_assignment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-black/65">
                      BHW Assigned:
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="BHW Assigned" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doctor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-black/65">
                      Forward to Doctor
                    </FormLabel>
                    <FormControl>
                      <SelectLayout
                        className="w-[250px] min-w-full"
                        label=""
                        options={doctor}
                        placeholder="select"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Physical Exam Section */}
          {/* <Card className="w-full">
            <CardHeader>
              <CardTitle>Physical Examination</CardTitle>
              <CardDescription>
                Complete the physical examination form by selecting the
                appropriate findings for each body system. You can select
                multiple options for each body part.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <Accordion type="multiple" className="w-full">
                  {bodyParts.map((bodyPart) => (
                    <AccordionItem key={bodyPart.id} value={bodyPart.id}>
                      <AccordionTrigger className="text-lg font-semibold">
                        {bodyPart.name}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`${bodyPart.id}.status` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                                  {bodyPart.options.map((option) => (
                                    <FormItem
                                      key={option}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(
                                            option
                                          )}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([
                                                  ...(field.value as string[]),
                                                  option,
                                                ])
                                              : field.onChange(
                                                  (
                                                    field.value as string[]
                                                  )?.filter(
                                                    (value) => value !== option
                                                  )
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal capitalize">
                                        {option}
                                      </FormLabel>
                                    </FormItem>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </CardContent>
          </Card> */}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => form.reset()}
              className="w-full sm:w-[150px]"
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-[150px]"
              disabled={!selectedPatientId}
            >
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// Removed conflicting local useState declaration
