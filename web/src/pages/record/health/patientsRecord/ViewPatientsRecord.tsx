"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button/button";
import {
  ChevronLeft,
  Edit,
  // Printer,
  // Share2,
  AlertCircle,
  SyringeIcon,
  Pill,
  CheckCircle,
  Clock,
  Calendar,
  // MapPin,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import CardLayout from "@/components/ui/card/card-layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientRecordSchema } from "@/pages/record/health/patientsRecord/patients-record-schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form/form";
import { useParams } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router";
import { Label } from "@/components/ui/label";
import { usePatientDetails } from "./queries/patientsFetchQueries";
import { useMedicineCount } from "@/pages/healthServices/medicineservices/queries/MedCountQueries";
import { useVaccinationCount } from "@/pages/healthServices/vaccination/queries/VacCount";
import {
  useCompletedFollowUpVisits,
  usePendingFollowUpVisits,
} from "./queries/followv";
import { toast } from "sonner";
import { useUpdatePatient } from "./queries/patientsUpdateQueries";

import { useFirstAidCount } from "@/pages/healthServices/firstaidservices/queries/FirstAidCountQueries";
import { Skeleton } from "@/components/ui/skeleton";



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
  const [activeTab, setActiveTab] = useState<"personal" | "medical" | "visits">(
    "personal"
  );

  const [isEditable, setIsEditable] = useState(false);
  // const [isPrintMode, setIsPrintMode] = useState(false);
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

    return (
      patientArray.find(
        (patient: PatientData) => patient.pat_id === patientId
      ) ?? null
    );
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

  // const { data: medicineCountData } = useMedicineCount(patientId ?? "");
  // const medicineCount = medicineCountData?.medicinerecord_count;
  // const { data: vaccinationCountData } = useVaccinationCount(patientId ?? "");
  // const vaccinationCount = vaccinationCountData?.vaccination_count;
  // const { data: firstAidCountData } = useFirstAidCount(patientId ?? "");
  // const firstAidCount = firstAidCountData?.firstaidrecord_count;
  
  
  // const { data: completedData } = useCompletedFollowUpVisits(patientId ?? "");
  // const { data: pendingData } = usePendingFollowUpVisits(patientId ?? "");
  
  
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

  // reset form when data changes
  useEffect(() => {
    if (patientData) form.reset(patientData);
  }, [patientData, form]);

  // get initials for avatar
  const getInitials = () =>
    patientData
      ? `${patientData.firstName[0] ?? ""}${patientData.lastName[0] ?? ""}`
      : "";

  // age calculation
  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  // get full address
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
          hh_id:
            currentPatient?.households[0]?.hh_id ?? patientData?.houseNo ?? "",
        },
      ],
      personal_info: {
        per_fname:
          currentPatient?.personal_info.per_fname ??
          patientData?.firstName ??
          "",
        per_mname:
          currentPatient?.personal_info.per_mname ??
          patientData?.middleName ??
          "",
        per_lname:
          currentPatient?.personal_info.per_lname ??
          patientData?.lastName ??
          "",
        per_dob:
          currentPatient?.personal_info.per_dob ??
          patientData?.dateOfBirth ??
          "",
        per_sex:
          currentPatient?.personal_info.per_sex ?? patientData?.sex ?? "",
      },
    }),
    [currentPatient, patientData, patientId]
  );


  const handleEdit = () => {
    setIsEditable(true);
  }

  // save edited patient data
  const handleSaveEdit = async () => {
    try {
      const formData = form.getValues();
      console.log("Saving patient data;", formData);

      if(!currentPatient?.trans_id) {
        toast.error("Cannot update: Missing transient ID.");
        return;
      }

      // data to be updated
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
          }
        }
      }

      await updatePatientData.mutateAsync(updatedData);
      console.log("Patient data updated successfully:", updatedData);

      setIsEditable(false);
      toast.success("Patient data updated successfully!");
    } catch (error) {
      console.error("Error saving patient daata: ", error);
      toast.error("Failed to update patient data. Please try again.");
    }
  }

  const handleCancelEdit = () => {
    if(patientData) {
      form.reset(patientData);
    }
    setIsEditable(false);
    toast("Edit cancelled. No changes were made.");
  }



  if (isLoading) {
      return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
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
            {error instanceof Error
              ? error.message
              : "The requested patient could not be found."}
            <br />
            <span className="text-sm">Patient ID: {patientId}</span>
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => window.history.back()}
          variant="outline"
          className="mt-4"
        >
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
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Patient Record
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            View patient information
          </p>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          {/* <Button variant="outline" size="sm" className="gap-1">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button> */}
          {/* <Button variant="outline" size="sm" className="gap-1">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button> */}
          {isTransient && (activeTab === "personal") && (
            <Button onClick={handleEdit} className="gap- personally bg-buttonBlue hover:bg-buttonBlue/90">
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
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">
                  {`${patientData.firstName} ${
                    patientData.middleName ? patientData.middleName + " " : ""
                  }${patientData.lastName}`}
                </h2>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span>
                    ID:{" "}
                    <span className="font-medium text-foreground">
                      {patientId}
                    </span>
                  </span>
                  <span>•</span>
                  <span>{calculateAge(patientData.dateOfBirth)} years old</span>
                  <span>•</span>
                  <span>
                    {patientData.sex.toLowerCase() === "male"
                      ? "Male"
                      : "Female"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge
                    variant={
                      patientData.patientType === "Resident"
                        ? "default"
                        : "secondary"
                    }
                  >
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

      <Tabs
        defaultValue="personal"
        className="ml-2"
        onValueChange={(value) =>
          setActiveTab(value as "personal" | "medical" | "visits")
        }
      >
        <TabsList className="mb-4 bg-background border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
          {/* personal active tab */}
          <TabsTrigger
            value="personal"
            className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent ml-6"
          >
            Personal Information
          </TabsTrigger>

          {/* medical active tab */}
          <TabsTrigger
            value="medical"
            className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent"
          >
            Records
          </TabsTrigger>
          
          {/* visits active tab */}
          <TabsTrigger
            value="visits"
            className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent"
          >
            Follow up Visits
          </TabsTrigger>
        </TabsList>
        <TabsContent value="personal" className="mt-0">
          <CardLayout
            title="Personal Information"
            description="Patient's personal and contact details"
            content={
              <div className="mx-auto border-none">
                <Separator className="bg-gray" />
                <div className="pt-4">
                  <Form {...form}>
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium">
                                Last Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditable}
                                  className={!isEditable ? "bg-muted/30" : ""}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium">
                                First Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditable}
                                  className={!isEditable ? "bg-muted/30" : ""}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="middleName"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium">
                                Middle Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditable}
                                  className={!isEditable ? "bg-muted/30" : ""}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <FormField
                          control={form.control}
                          name="sex"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium">
                                Sex
                              </FormLabel>
                              <Select disabled={!isEditable} defaultValue={field.value} onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger className={!isEditable ? "bg-muted/30" : ""}>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="contact"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium">
                                Contact Number
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditable}
                                  className={!isEditable ? "bg-muted/30" : ""}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium">
                                Date of Birth
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  {...field}
                                  disabled={!isEditable}
                                  className={!isEditable ? "bg-muted/30" : ""}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="patientType"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium">
                                Patient Type
                              </FormLabel>
                              <Select disabled defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-muted/30">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Resident">
                                    Resident
                                  </SelectItem>
                                  <SelectItem value="Transient">
                                    Transient
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>

                      <h3 className="text-md font-medium pt-4">
                        Address Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* <FormField
                          control={form.control}
                          name="houseNo"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium">
                                House Number
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditable}
                                  className={!isEditable ? "bg-muted/30" : ""}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        /> */}
                        <FormField
                          control={form.control}
                          name="address.street"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium">
                                Street
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditable}
                                  className={!isEditable ? "bg-muted/30" : ""}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address.sitio"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium">
                                Sitio
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditable}
                                  className={!isEditable ? "bg-muted/30" : ""}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address.barangay"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium">
                                Barangay
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditable}
                                  className={!isEditable ? "bg-muted/30" : ""}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* city and province */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="address.city"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-medium">
                                  City
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={!isEditable}
                                    className={!isEditable ? "bg-muted/30" : ""}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="address.province"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-medium">
                                  Province
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={!isEditable}
                                    className={!isEditable ? "bg-muted/30" : ""}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
            }
            cardClassName="border shadow-sm rounded-lg"
            headerClassName="pb-2"
            contentClassName="pt-0"
          />

          {isTransient && isEditable && (
            <div className="flex justify-end mt-6 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="bg-white text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-buttonBlue hover:bg-buttonBlue/90 text-white"
                onClick={handleSaveEdit}
              >
                Save Changes
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="medical" className="mt-0 ">
          <CardLayout
            title="Medical History"
            description="Patient's medical information and history"
            content={
              <div className="space-y-6">
                {/* Vaccination Record */}
                {vaccinationCount !== 0 && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-sky-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <SyringeIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Vaccination
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600 bg-sky-100 px-2 py-1 rounded-md">
                              {vaccinationCount !== undefined
                                ? vaccinationCount
                                : "0"}{" "}
                              Records
                            </span>
                            <span className="text-sm text-gray-500">
                              Last updated: June 2, 2023
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/invVaccinationRecord"
                        state={{ params: { patientData: patientLinkData } }}
                        className="transition-transform hover:scale-105"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 px-6 bg-white border-sky-300 text-sky-800 font-medium"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
                {medicineCount !== 0 && (
                  <div className="p-4 rounded-lg border border-purple-200 ">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg">
                          <Pill className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Medicine
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600 bg-purple-200 px-2 py-1 rounded-md">
                              {medicineCount !== undefined
                                ? medicineCount
                                : "0"}{" "}
                              Records
                            </span>
                            <span className="text-sm text-gray-500">
                              Last updated: June 2, 2023
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/IndivMedicineRecord"
                        state={{ params: { patientData: patientLinkData } }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 px-6 bg-white border-purple-300 text-purple-700  font-medium"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}{" "}
                {firstAidCount !== 0 && (
                  <div className="p-4 rounded-lg border border-purple-200 ">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg">
                          <Pill className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            First Aid
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600 bg-purple-200 px-2 py-1 rounded-md">
                            {firstAidCount !== undefined ? firstAidCount : "0"}

                              Records
                            </span>
                            <span className="text-sm text-gray-500">
                              Last updated: June 2, 2023
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/indiv-firstaid-records"
                        state={{ params: { patientData: patientLinkData } }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 px-6 bg-white border-purple-300 text-purple-700  font-medium"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}{" "}
              </div>
            }
            cardClassName="border shadow-sm rounded-md"
            headerClassName="pb-3 border-b"
            contentClassName="pt-4"
          />
        </TabsContent>
        <TabsContent value="visits" className="mt-0">
          <CardLayout
            title="Visit History"
            description="Record of patient visits and consultations"
            content={
              <div className="mx-auto border-none">
                <div className="pt-4">
                  <div className="mt-4">
                    <Tabs defaultValue="pending" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 h-full">
                        <TabsTrigger
                          value="pending"
                          className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none bg-transparent font-medium"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Upcoming Follow-up visit
                          </div>
                        </TabsTrigger>
                        <TabsTrigger
                          value="completed"
                          className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none bg-transparent font-medium"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Completed Visits
                          </div>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="pending">
                        <div className="space-y-3 mt-6">
                          {pendingData?.results?.length > 0 ? (
                            pendingData.results.map((visit: any) => (
                              <div
                                key={visit.id}
                                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-gray-900">
                                      {visit.description}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      Scheduled:{" "}
                                      {format(
                                        new Date(visit.date),
                                        "MMM dd, yyyy"
                                      )}
                                    </p>
                                  </div>
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-gray-500">
                                No pending follow-up visits
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="completed">
                        <div className="space-y-3 mt-6">
                          {completedData?.results?.length > 0 ? (
                            completedData.results.map((visit: any) => (
                              <div
                                key={visit.id}
                                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">
                                      {visit.description}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      Date:{" "}
                                      {format(
                                        new Date(visit.date),
                                        "MMM dd, yyyy"
                                      )}
                                    </p>
                                    {visit.updated_at && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Recorded on:{" "}
                                        {format(
                                          new Date(visit.updated_at),
                                          "MMM dd, yyyy HH:mm"
                                        )}
                                      </p>
                                    )}
                                  </div>
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Completed
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-gray-500">
                                No completed follow-up visits
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
            }
            cardClassName="border shadow-sm rounded-md"
            headerClassName="pb-2"
            contentClassName="pt-0"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
