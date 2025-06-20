"use client";

import { useState, useMemo, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Edit, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientRecordSchema } from "@/pages/record/health/patientsRecord/patients-record-schema";
import { useParams } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePatientDetails } from "../queries/patientsFetchQueries";
import { useMedicineCount } from "@/pages/healthServices/medicineservices/queries/MedCountQueries";
import { useVaccinationCount } from "@/pages/healthServices/vaccination/queries/VacCount";
import { useFirstAidCount } from "@/pages/healthServices/firstaidservices/queries/FirstAidCountQueries";
import { useCompletedFollowUpVisits, usePendingFollowUpVisits } from "../queries/followv";
import { toast } from "sonner";
import { useUpdatePatient } from "../queries/patientsUpdateQueries";
import CardLayout from "@/components/ui/card/card-layout";
import PersonalInfoTab from "./PersonalInfoTab";
import Records from "./Records";
import VisitHistoryTab from "./VisitHistoryTab";

interface PatientData {
  pat_id: string;
  pat_type: string;
  trans_id?: string;
  households: { hh_id: string }[];
  personal_info: {
    per_fname: string;
    per_mname: string;
    per_lname: string;
    per_sex: string;
    per_contact: string;
    per_dob: string;
  };
  address: {
    add_street: string;
    add_barangay: string;
    add_city: string;
    add_province: string;
    sitio: string;
  };
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
  lastVisit?: string;
  visits?: Array<{ date: string; reason: string; doctor: string }>;
}

export default function ViewPatientRecord() {
  const [activeTab, setActiveTab] = useState<"personal" | "medical" | "visits">("personal");
  const [isEditable, setIsEditable] = useState(false);
  const { patientId } = useParams<{ patientId: string }>();
  const { data: patientsData, isLoading, error, isError } = usePatientDetails(patientId ?? "");
  const { data: medicineCountData } = useMedicineCount(patientId ?? "");
  const medicineCount = medicineCountData?.medicinerecord_count;
  const { data: vaccinationCountData } = useVaccinationCount(patientId ?? "");
  const vaccinationCount = vaccinationCountData?.vaccination_count;
  const { data: firstAidCountData } = useFirstAidCount(patientId ?? "");
  const firstAidCount = firstAidCountData?.firstaidrecord_count;
  const { data: completedData } = useCompletedFollowUpVisits(patientId ?? "");
  const { data: pendingData } = usePendingFollowUpVisits(patientId ?? "");
  const updatePatientData = useUpdatePatient();

  const currentPatient = useMemo(() => {
    if (!patientsData || !patientId) return null;
    if ("pat_id" in patientsData && patientsData.pat_id === patientId) {
      return patientsData as PatientData;
    }
    const patientArray = Array.isArray(patientsData)
      ? patientsData
      : patientsData.results ?? patientsData.data ?? [];
    return patientArray.find((patient: PatientData) => patient.pat_id === patientId) ?? null;
  }, [patientsData, patientId]);

  const patientData = useMemo(() => {
    if (!currentPatient) return null;
    return {
      lastName: currentPatient.personal_info.per_lname,
      firstName: currentPatient.personal_info.per_fname,
      middleName: currentPatient.personal_info.per_mname,
      sex: currentPatient.personal_info.per_sex,
      contact: currentPatient.personal_info.per_contact,
      dateOfBirth: currentPatient.personal_info.per_dob,
      patientType: currentPatient.pat_type,
      houseNo: currentPatient.households[0]?.hh_id ?? "N/A",
      address: {
        street: currentPatient.address.add_street || "",
        sitio: currentPatient.address.sitio,
        barangay: currentPatient.address.add_barangay,
        city: currentPatient.address.add_city,
        province: currentPatient.address.add_province,
      },
      bloodType: currentPatient.bloodType ?? "N/A",
      allergies: currentPatient.allergies ?? "N/A",
      chronicConditions: currentPatient.chronicConditions ?? "N/A",
      lastVisit: currentPatient.lastVisit ?? "",
      visits: currentPatient.visits ?? [],
    };
  }, [currentPatient]);

  const form = useForm({
    resolver: zodResolver(patientRecordSchema),
    defaultValues: patientData ?? {
      lastName: "",
      firstName: "",
      middleName: "",
      sex: "",
      contact: "",
      dateOfBirth: "",
      patientType: "",
      houseNo: "",
      address: { street: "", sitio: "", barangay: "", city: "", province: "" },
    },
  });

  useEffect(() => {
    if (patientData) form.reset(patientData);
  }, [patientData, form]);

  const getInitials = () =>
    patientData ? `${patientData.firstName[0] ?? ""}${patientData.lastName[0] ?? ""}` : "";

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getFullAddress = () =>
    patientData
      ? [
          currentPatient.address.add_street,
          currentPatient.address.sitio,
          currentPatient.address.add_barangay,
          currentPatient.address.add_city,
          currentPatient.address.add_province,
        ]
          .filter(Boolean)
          .join(", ")
      : "";

  const patientLinkData = useMemo(
    () => ({
      pat_id: currentPatient?.pat_id ?? patientId ?? "",
      pat_type: currentPatient?.pat_type ?? patientData?.patientType ?? "",
      age: patientData ? calculateAge(patientData.dateOfBirth) : 0,
      addressFull: getFullAddress(),
      address: {
        add_street: currentPatient?.address.add_street ?? "",
        add_barangay: currentPatient?.address.add_barangay ?? "",
        add_city: currentPatient?.address.add_city ?? "",
        add_province: currentPatient?.address.add_province ?? "",
        add_external_sitio: currentPatient?.address.sitio ?? "",
      },
      households: [
        {
          hh_id: currentPatient?.households[0]?.hh_id ?? patientData?.houseNo ?? "",
        },
      ],
      personal_info: {
        per_fname: currentPatient?.personal_info.per_fname ?? patientData?.firstName ?? "",
        per_mname: currentPatient?.personal_info.per_mname ?? patientData?.middleName ?? "",
        per_lname: currentPatient?.personal_info.per_lname ?? patientData?.lastName ?? "",
        per_dob: currentPatient?.personal_info.per_dob ?? patientData?.dateOfBirth ?? "",
        per_sex: currentPatient?.personal_info.per_sex ?? patientData?.sex ?? "",
      },
    }),
    [currentPatient, patientData, patientId]
  );
  

  const handleEdit = () => {
    setIsEditable(true);
  };

  const handleSaveEdit = async () => {
    try {
      const formData = form.getValues();
      if (!currentPatient?.trans_id) {
        toast.error("Cannot update: Missing transient ID.");
        return;
      }
      const updatedData = {
        pat_type: formData.patientType,
        transient_data: {
          trans_id: currentPatient?.trans_id,
          tran_lname: formData.lastName,
          tran_fname: formData.firstName,
          tran_mname: formData.middleName,
          tran_dob: formData.dateOfBirth,
          tran_sex: formData.sex,
          tran_contact: formData.contact,
          tran_status: "Active",
          tran_ed_attainment: "N/A",
          tran_religion: "N/A",
          address: {
            tradd_street: formData.address.street,
            tradd_sitio: formData.address.sitio,
            tradd_barangay: formData.address.barangay,
            tradd_city: formData.address.city,
            tradd_province: formData.address.province,
          },
        },
      };
      await updatePatientData.mutateAsync(updatedData);
      setIsEditable(false);
      toast.success("Patient data updated successfully!");
    } catch (error) {
      console.error("Error saving patient data: ", error);
      toast.error("Failed to update patient data. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    if (patientData) form.reset(patientData);
    setIsEditable(false);
    toast("Edit cancelled. No changes were made.");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Loading patient details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Patient Not Found</strong>
            <br />
            {error instanceof Error ? error.message : "The requested patient could not be found."}
            <br />
            <span className="text-sm">Patient ID: {patientId}</span>
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.history.back()} variant="outline" className="mt-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">No patient data available</p>
      </div>
    );
  }

  const isTransient = patientData?.patientType?.toLowerCase() === "transient";

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Patient Record</h1>
          <p className="text-xs sm:text-sm text-darkGray">View patient information</p>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          {isTransient && activeTab === "personal" && (
            <Button onClick={handleEdit} className="gap-1 bg-buttonBlue hover:bg-buttonBlue/90">
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          )}
        </div>
      </div>
      <Separator className="bg-gray mb-4 sm:mb-6" />

      <div className="mb-6">
        <CardLayout
          title=""
          description=""
          content={
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Avatar className="h-16 w-16 border-2 border-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">
                  {`${patientData.firstName} ${patientData.middleName ? patientData.middleName + " " : ""}${patientData.lastName}`}
                </h2>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span>ID: <span className="font-medium text-foreground">{patientId}</span></span>
                  <span>•</span>
                  <span>{calculateAge(patientData.dateOfBirth)} years old</span>
                  <span>•</span>
                  <span>{patientData.sex.toLowerCase() === "male" ? "Male" : "Female"}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge variant={patientData.patientType === "Resident" ? "default" : "secondary"}>
                    {patientData.patientType}
                  </Badge>
                </div>
              </div>
            </div>
          }
          cardClassName="border shadow-sm rounded-lg"
          headerClassName="hidden"
          contentClassName="p-4"
        />
      </div>

      <Tabs defaultValue="personal" className="ml-2" onValueChange={(value) => setActiveTab(value as "personal" | "medical" | "visits")}>
        <TabsList className="mb-4 bg-background border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
          <TabsTrigger
            value="personal"
            className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent ml-6"
          >
            Personal Information
          </TabsTrigger>
          <TabsTrigger
            value="medical"
            className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent"
          >
            Records
          </TabsTrigger>
          <TabsTrigger
            value="visits"
            className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent"
          >
            Follow up Visits
          </TabsTrigger>
        </TabsList>
        <PersonalInfoTab
          form={form}
          isEditable={isEditable}
          isTransient={isTransient}
          patientData={patientData}
          handleSaveEdit={handleSaveEdit}
          handleCancelEdit={handleCancelEdit}
        />
        <Records
          vaccinationCount={vaccinationCount}
          medicineCount={medicineCount}
          firstAidCount={firstAidCount}
          patientLinkData={patientLinkData}
        />
        <VisitHistoryTab completedData={completedData} pendingData={pendingData} />
      </Tabs>
    </div>
  );
}