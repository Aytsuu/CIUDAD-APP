"use client";

import { useState, useMemo, useEffect } from "react";
import React from "react";
import { ChevronLeft, Edit, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "react-router";
import { toast } from "sonner";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";

import CardLayout from "@/components/ui/card/card-layout";
import { Button } from "@/components/ui/button/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { calculateAge } from "@/helpers/ageCalculator";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { patientRecordSchema } from "@/pages/record/health/patientsRecord/patients-record-schema";
import { PatientData } from "./types";
import PersonalInfoTab from "./PersonalInfoTab";
import Records from "./Records";
import VisitHistoryTab from "./VisitHistoryTab";
import TableLoading from "@/components/ui/table-loading";

// fetch queries
import { useUpdatePatient } from "../queries/update";
import { useQueryClient } from "@tanstack/react-query";
import { usePatientDetails, useChildData, useResidents } from "../queries/fetch";
import { useMedConCount, useChildHealthRecordCount, useFamplanCount, useAnimalbitesCount } from "../queries/count";
import { useMedicineCount } from "@/pages/healthServices/medicineservices/queries/MedCountQueries";
import { useVaccinationCount } from "@/pages/healthServices/vaccination/queries/VacCount";
import { useFirstAidCount } from "@/pages/healthServices/firstaidservices/queries/FirstAidCountQueries";
import { useCompletedFollowUpVisits, usePendingFollowUpVisits, useMissedFollowUpVisits } from "../queries/followv";
import { usePatientPostpartumCount, usePatientPrenatalCount } from "../../../../healthServices/maternal/queries/maternalFetchQueries";
import { ProtectedComponent} from "@/ProtectedComponent";

export default function ViewPatientRecord() {
  const [activeTab, setActiveTab] = useState<"personal" | "medical" | "visits">("personal");
  const [isEditable, setIsEditable] = useState(false);
  const [selectedResidentId, setSelectedResidentId] = useState<string>("");
  const [showResidentSelector, setShowResidentSelector] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [hasTransferred, setHasTransferred] = useState<string>("no");
  const [transferLocation, setTransferLocation] = useState({
    sitio: "",
    barangay: "",
    city: ""
  });
  
  const location = useLocation();
  const { patientId } = location.state || {};

  const { data: patientsData, error, isError, isLoading } = usePatientDetails(patientId ?? "");
  const { data: rawChildHealthRecords } = useChildData(patientId ?? "");
  const { data: residentsData } = useResidents();

  const { data: medicineCountData } = useMedicineCount(patientId ?? "");
  const medicineCount = medicineCountData?.medicinerecord_count;

  const { data: vaccinationCountData } = useVaccinationCount(patientId ?? "");
  const vaccinationCount = vaccinationCountData?.vaccination_count;

  const { data: firstAidCountData } = useFirstAidCount(patientId ?? "");
  const firstAidCount = firstAidCountData?.firstaidrecord_count;

  const { data: childHealthCount, isLoading: childHistoryLoading } = useChildHealthRecordCount(patientId ?? "");
  const childHealthCountData = childHealthCount?.childhealthrecord_count;

  const { data: medconCountData } = useMedConCount(patientId ?? "");
  const medconCount = medconCountData?.medcon_count;

  const { data: famplanCount  } = useFamplanCount(patientId ?? "");

  const { data: animalbitesCountData } = useAnimalbitesCount(patientId ?? "");
  const animalbitesCount = animalbitesCountData?.count;

  const { data: completedData } = useCompletedFollowUpVisits(patientId ?? "");
  const { data: pendingData } = usePendingFollowUpVisits(patientId ?? "");
  const { data: missedData } = useMissedFollowUpVisits(patientId ?? "");

  const { data: postpartumCountData } = usePatientPostpartumCount(patientId ?? "");
  const postpartumCount = postpartumCountData;

  const { data: prenatalCountData } = usePatientPrenatalCount(patientId ?? "");
  const prenatalCount = prenatalCountData;

  const updatePatientData = useUpdatePatient();
  const queryClient = useQueryClient();

  const currentPatient = useMemo(() => {
    if (!patientsData || !patientId) return null;
    if ("pat_id" in patientsData && patientsData.pat_id === patientId) {
      return patientsData as PatientData;
    }
    const patientArray = Array.isArray(patientsData) ? patientsData : patientsData.results ?? patientsData.data ?? [];
    return patientArray.find((patient: PatientData) => patient.pat_id === patientId) ?? null;
  }, [patientsData, patientId]);

  // useEffect(() => {
  //   if (currentPatient) {
  //     console.log("Individual Address Fields:", {
  //       street: currentPatient.address?.add_street,
  //       barangay: currentPatient.address?.add_barangay,
  //       city: currentPatient.address?.add_city,
  //       province: currentPatient.address?.add_province,
  //       sitio: currentPatient.address?.add_sitio,
  //     });
  //   }
  // }, [currentPatient]);

  const patientData = useMemo(() => {
    if (!currentPatient) return null;
    // Prefer personal_info.philhealth_id, fallback to additional_info.per_add_philhealth_id
    let philhealthId = "";
    if (currentPatient.personal_info && currentPatient.personal_info.philhealth_id) {
      philhealthId = currentPatient.personal_info.philhealth_id;
    } else if (currentPatient.additional_info && currentPatient.additional_info.per_add_philhealth_id) {
      philhealthId = currentPatient.additional_info.per_add_philhealth_id;
    }
    
    // Parse location string (format: "Sitio, Barangay, City")
    const parseLocation = (locationStr: string | undefined | null) => {
      if (!locationStr) return { sitio: "", brgy: "", city: "" };
      const parts = locationStr.split(',').map(s => s.trim());
      return {
        sitio: parts[0] || "",
        brgy: parts[1] || "",
        city: parts[2] || "",
      };
    };
    
    return {
      patientStatus: currentPatient.pat_status || "",
      isTransferredFrom: currentPatient.is_transferred_from || false,
      location: parseLocation(currentPatient.location),
      lastName: currentPatient.personal_info.per_lname,
      firstName: currentPatient.personal_info.per_fname,
      middleName: currentPatient.personal_info.per_mname,
      sex: currentPatient.personal_info.per_sex?.toLowerCase() || "",
      contact: currentPatient.personal_info.per_contact,
      dateOfBirth: currentPatient.personal_info.per_dob,
      patientType: currentPatient.pat_type,
      houseNo: currentPatient.households[0]?.hh_id ?? "N/A",
      address: {
        street: currentPatient.address?.add_street || "",
        sitio: currentPatient.address?.add_sitio || "",
        barangay: currentPatient.address?.add_barangay || "",
        city: currentPatient.address?.add_city || "",
        province: currentPatient.address?.add_province || "",
      },
      philhealthId,
      bloodType: currentPatient.bloodType ?? "N/A",
      allergies: currentPatient.allergies ?? "N/A",
      chronicConditions: currentPatient.chronicConditions ?? "N/A",
      lastVisit: currentPatient.lastVisit ?? "",
      visits: currentPatient.visits ?? [],
    };
  }, [currentPatient]);
  // console.log("Transformed Patient Data:", patientData);

  const form = useForm({
    resolver: zodResolver(patientRecordSchema),
    defaultValues: patientData ?? {
      isTransferredFrom: false,
      location: { sitio: "", brgy: "", city: "" },
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

  // Watch for patient type changes
  const currentPatientType = form.watch("patientType");
  const originalPatientType = currentPatient?.pat_type;

  useEffect(() => {
    // Show resident selector when changing from Transient to Resident
    if (isEditable && originalPatientType === "Transient" && currentPatientType === "Resident") {
      setShowResidentSelector(true);
    } else {
      setShowResidentSelector(false);
      setSelectedResidentId("");
    }
  }, [currentPatientType, isEditable, originalPatientType]);

  // Format residents for combobox
  const residentsOptions = useMemo(() => {
    if (!residentsData) return [];
    return residentsData.map((personal: any) => {
      const fullName = `${personal.personal_info?.per_lname || ""}, ${personal.personal_info?.per_fname || ""} ${personal.personal_info?.per_mname || ""}`.trim();
      const searchableValue = `${personal.rp_id} ${fullName}`;
      
      return {
        id: searchableValue,
        name: (
          <>
            <span className="rounded-md px-2 py-1 font-poppins mr-2 bg-green-500 text-white">#{personal.rp_id}</span>
            {personal.personal_info?.per_lname || ""}, {personal.personal_info?.per_fname || ""} {personal.personal_info?.per_mname || ""}
          </>
        )
      };
    }).sort((a: any, b: any) => {
      const aName = a.id.split(' ').slice(1).join(' ');
      const bName = b.id.split(' ').slice(1).join(' ');
      return aName.localeCompare(bName);
    });
  }, [residentsData]);

  const handleResidentSelect = (id: string | undefined) => {
    if (!id) {
      setSelectedResidentId("");
      return;
    }
    
    // Store the full searchable value for the combobox
    setSelectedResidentId(id);
    
    // Extract the actual resident ID from the searchable value
    const actualId = id.split(' ')[0];
    
    // Find the selected resident and populate form fields
    const selectedResident = residentsData?.find((r: any) => r.rp_id.toString() === actualId);
    
    if (selectedResident && selectedResident.personal_info) {
      const personalInfo = selectedResident.personal_info;
      
      // Populate all form fields with resident data
      form.setValue("lastName", personalInfo.per_lname || "");
      form.setValue("firstName", personalInfo.per_fname || "");
      form.setValue("middleName", personalInfo.per_mname || "");
      form.setValue("sex", personalInfo.per_sex?.toLowerCase() || "");
      form.setValue("contact", personalInfo.per_contact || "");
      form.setValue("dateOfBirth", personalInfo.per_dob || "");
      form.setValue("philhealthId", selectedResident.per_add_philhealth_id || "");
      
      // Populate address fields
      if (personalInfo.per_addresses && personalInfo.per_addresses.length > 0) {
        const address = personalInfo.per_addresses[0];
        form.setValue("address.street", address.add_street || "");
        form.setValue("address.sitio", address.sitio || "");
        form.setValue("address.barangay", address.add_barangay || "");
        form.setValue("address.city", address.add_city || "");
        form.setValue("address.province", address.add_province || "");
      }
    }
  };

  const getInitials = () => (patientData ? `${patientData.firstName[0] ?? ""}${patientData.lastName[0] ?? ""}` : "");

  const getFullAddress = () => {
    if (!currentPatient || !currentPatient.address) return "No address provided";
    const addressParts = [
      currentPatient.address.add_street,
      currentPatient.address.add_sitio,
      currentPatient.address.add_barangay,
      currentPatient.address.add_city,
      currentPatient.address.add_province,
    ].filter((part) => part && part.trim() !== "" && part.toLowerCase() !== "n/a");
    return addressParts.length > 0 ? addressParts.join(", ") : "No address provided";
  };

  const getAddressField = (field: string | undefined | null): string => {
    if (!field || field.trim() === "" || field.toLowerCase() === "n/a") {
      return "";
    }
    return field.trim();
  };

  const patientLinkData = useMemo(() => {
    const linkData = {
      pat_id: currentPatient?.pat_id ?? patientId ?? "",
      pat_type: currentPatient?.pat_type ?? patientData?.patientType ?? "",
      age: patientData ? calculateAge(patientData.dateOfBirth).toString() : "0",
      addressFull: getFullAddress(),
      address: {
        add_street: getAddressField(currentPatient?.address?.add_street),
        add_barangay: getAddressField(currentPatient?.address?.add_barangay),
        add_city: getAddressField(currentPatient?.address?.add_city),
        add_province: getAddressField(currentPatient?.address?.add_province),
        add_sitio: getAddressField(currentPatient?.address?.add_sitio),
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
        philhealth_id: currentPatient?.personal_info.philhealth_id ?? patientData?.philhealthId ?? "",
      },
    };

    return linkData;
  }, [currentPatient, patientData, patientId]);

  const formatFullAddressForChildHealth = (address: any): string => {
    if (!address) return "No address provided";
    const addressParts = [address.add_street, address.add_sitio, address.add_barangay, address.add_city, address.add_province].filter(
      (part) => part && part.trim() !== "" && part.toLowerCase() !== "n/a"
    );
    return addressParts.length > 0 ? addressParts.join(", ") : "No address provided";
  };

  const formatChildHealthData = React.useCallback((): any[] => {
    if (!rawChildHealthRecords || !rawChildHealthRecords.child_health_histories) return [];

    return rawChildHealthRecords.child_health_histories.map((record: any) => {
      const chrecDetails = record.chrec_details || {};
      const patrecDetails = chrecDetails.patrec_details || {};
      const patDetails = patrecDetails.pat_details || {};
      const childInfo = patDetails.personal_info || {}; // Ensure this is never null
      const addressInfo = patDetails.address || {};
      const familyHeadInfo = patDetails.family_head_info || {};
      const motherInfo = familyHeadInfo.family_heads?.mother?.personal_info || {};
      const fatherInfo = familyHeadInfo.family_heads?.father?.personal_info || {};
      const vitalSigns = record.child_health_vital_signs?.[0]?.bm_details || {};

      // Add null checks for critical properties
      const dob = childInfo?.per_dob || "";
      const age = dob ? calculateAge(dob).toString() : "";

      return {
        chrec_id: chrecDetails.chrec_id || 0,
        pat_id: patDetails.pat_id || "",
        fname: childInfo?.per_fname || "",
        lname: childInfo?.per_lname || "",
        mname: childInfo?.per_mname || "",
        sex: childInfo?.per_sex || "",
        age: age,
        dob: dob,
        householdno: patDetails.households?.[0]?.hh_id || "",
        street: addressInfo.add_street || "",
        sitio: addressInfo.add_sitio || "",
        barangay: addressInfo.add_barangay || "",
        city: addressInfo.add_city || "",
        province: addressInfo.add_province || "",
        landmarks: addressInfo.add_landmarks || "",
        pat_type: patDetails.pat_type || "",
        address: formatFullAddressForChildHealth(addressInfo),
        mother_fname: motherInfo.per_fname || "",
        mother_lname: motherInfo.per_lname || "",
        mother_mname: motherInfo.per_mname || "",
        mother_contact: motherInfo.per_contact || "",
        mother_occupation: motherInfo.per_occupation || chrecDetails.mother_occupation || "",
        father_fname: fatherInfo.per_fname || "",
        father_lname: fatherInfo.per_lname || "",
        father_mname: fatherInfo.per_mname || "",
        father_contact: fatherInfo.per_contact || "",
        father_occupation: fatherInfo.per_occupation || chrecDetails.father_occupation || "",
        family_no: chrecDetails.family_no || "",
        birth_weight: Number.parseFloat(vitalSigns.weight) || 0,
        birth_height: Number.parseFloat(vitalSigns.height) || 0,
        type_of_feeding: chrecDetails.type_of_feeding || "Unknown",
        delivery_type: chrecDetails.place_of_delivery_type || "",
        place_of_delivery_type: chrecDetails.place_of_delivery_type || "",
        pod_location: chrecDetails.pod_location || "",
        birth_order: chrecDetails.birth_order || 0,
        tt_status: record.tt_status || "",
      };
    });
  }, [rawChildHealthRecords]);
  // console.log("Formatted Child Health Records:", formatChildHealthData());

  const formattedChildHealthData = formatChildHealthData();

  const handleEdit = () => {
    setIsEditable(true);
  };

  const handleSaveEdit = async () => {
    try {
      const formData = form.getValues();
      
      // Handle conversion from Transient to Resident
      if (originalPatientType === "Transient" && formData.patientType === "Resident") {
        if (!selectedResidentId) {
          showErrorToast("Please select a resident to link with this patient record");
          return;
        }
        
        // Extract the actual resident ID from the searchable value
        const actualResidentId = selectedResidentId.split(' ')[0];
        
        const updatedData = {
          pat_type: "Resident",
          rp_id: actualResidentId,
          staff_id: (window as any)?.__AUTH__?.user?.staff?.staff_id
        };
        
        await updatePatientData.mutateAsync({
          patientId: currentPatient.pat_id,
          patientData: updatedData,
        }, {
          onSuccess: () => {
            // Immediately refresh patient history for this patient
            queryClient.invalidateQueries({ queryKey: ['patientHistory', currentPatient.pat_id] });
          }
        });
        
        setIsEditable(false);
        setShowResidentSelector(false);
        setSelectedResidentId("");
        showSuccessToast("Patient converted to resident successfully!");
        return;
      }
      
      // Handle regular transient update
      if (!currentPatient?.trans_id) {
        showErrorToast("Cannot update: Missing transient ID.");
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
          tran_status: "ACTIVE",
          tran_ed_attainment: "NOT SPECIFIED",
          tran_religion: "NOT SPECIFIED",
          philhealth_id: formData.philhealthId,
          address: {
            tradd_street: formData.address.street,
            tradd_sitio: formData.address.sitio,
            tradd_barangay: formData.address.barangay,
            tradd_city: formData.address.city,
            tradd_province: formData.address.province,
          },
        },
        staff_id: (window as any)?.__AUTH__?.user?.staff?.staff_id
      };
      await updatePatientData.mutateAsync({
        patientId: currentPatient.pat_id,
        patientData: updatedData,
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['patientHistory', currentPatient.pat_id] });
        }
      });
      setIsEditable(false);
      showSuccessToast("Patient data updated successfully!");
    } catch (error) {
      // console.error("Error saving patient data: ", error);
      showErrorToast("Failed to update patient data. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    if (patientData) form.reset(patientData);
    setIsEditable(false);
    toast("Edit cancelled. No changes were made.");
  };

  const handleStatusEditClick = () => {
    setShowStatusDialog(true);
    // Check if patient has Transfer of Residency status
    setHasTransferred(currentPatient?.pat_status === "Transfer of Residency" ? "yes" : "no");
    if (currentPatient?.location) {
      const locationParts = currentPatient.location.split(',').map((s: string) => s.trim());
      setTransferLocation({
        sitio: locationParts[0] || "",
        barangay: locationParts[1] || "",
        city: locationParts[2] || ""
      });
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const updatedData: any = {
        staff_id: (window as any)?.__AUTH__?.user?.staff?.staff_id
      };

      if (hasTransferred === "yes") {
        // Validate location fields
        if (!transferLocation.sitio || !transferLocation.barangay || !transferLocation.city) {
          showErrorToast("Please fill in all location fields (Sitio, Barangay, City)");
          return;
        }
        
        updatedData.pat_status = "Transfer of Residency";
        updatedData.location = `${transferLocation.sitio}, ${transferLocation.barangay}, ${transferLocation.city}`;
      } else {
        updatedData.pat_status = "Active";
        updatedData.location = "";
      }

      await updatePatientData.mutateAsync({
        patientId: currentPatient.pat_id,
        patientData: updatedData,
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['patientHistory', currentPatient.pat_id] });
        }
      });

      setShowStatusDialog(false);
      showSuccessToast("Patient status updated successfully!");
    } catch (error) {
      showErrorToast("Failed to update patient status. Please try again.");
    }
  };

  const handleCancelStatusUpdate = () => {
    setShowStatusDialog(false);
    setHasTransferred("no");
    setTransferLocation({ sitio: "", barangay: "", city: "" });
  };

  if (isLoading) {
    return (
      <LayoutWithBack title="Patient Information and Records" description="View patient information, medical records, and follow-up visits">
        <TableLoading />
      </LayoutWithBack>
    );
  }

  if (isError && !patientId) {
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

  const isTransient = patientData?.patientType?.toLowerCase() === "transient";
  const transferredFrom = patientData?.isTransferredFrom === true;
  const isTransferredFrom  = () => {
    if (patientData?.isTransferredFrom) {
      return "Transferred from: " + patientData.location.sitio + ", " + patientData.location.brgy + ", " + patientData.location.city;
    } else {
      return "";
    }
  }

  return (
    <LayoutWithBack title="Patient Information and Records" description="View patient information, medical records, and follow-up visits  ">
      <div className="w-full">
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
                  <h2 className="text-xl font-semibold">{`${patientData?.firstName} ${patientData?.middleName ? patientData.middleName + " " : ""}${patientData?.lastName}`}</h2>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span>
                      ID: <span className="font-medium text-foreground">{patientId}</span>
                    </span>
                    <span>•</span>
                    <span>{calculateAge(patientData?.dateOfBirth)}</span>
                    <span>•</span>
                    <span>{patientData?.sex.toLowerCase() === "male" ? "Male" : "Female"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant={patientData?.patientType === "Resident" ? "default" : "secondary"}>{patientData?.patientType}</Badge>
                    <div className={`flex gap-2 items-center border rounded-md shadow-md text-xs text-semibold p-1 px-3 ${
                      patientData?.patientStatus === "Transfer of Residency" 
                        ? "bg-black text-white" 
                        : "bg-green-500 text-white"
                    }`}>
                      {patientData?.patientStatus} 
                      {patientData?.patientStatus !== "Transfer of Residency" && (
                        <Edit size={15} className="hover:text-green-600 cursor-pointer" onClick={handleStatusEditClick}/>
                      )}
                    </div>
                    {transferredFrom && (
                      <div className="border rounded-md bg-white shadow-md text-xs p-1">{isTransferredFrom()}</div>
                    )}
                  </div>
                </div>

                <ProtectedComponent exclude={["DOCTOR"]}>
                  <div className="flex gap-2 sm:ml-auto">
                    {isTransient && activeTab === "personal" && isEditable == false && (
                      <Button onClick={handleEdit} className="gap-1 bg-buttonBlue hover:bg-buttonBlue/90">
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    )}
                  </div>
                </ProtectedComponent>
              </div>
            }
            cardClassName="border shadow-sm rounded-lg"
            headerClassName="hidden"
            contentClassName="p-4"
          />
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "personal" | "medical" | "visits")} className="ml-2">
          <TabsList className="mb-4 bg-background border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            <TabsTrigger value="personal" className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent ml-6">
              Personal Information
            </TabsTrigger>
            <TabsTrigger value="medical" className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent">
              Records
            </TabsTrigger>
            <TabsTrigger value="visits" className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent">
              Follow up Visits
            </TabsTrigger>
          </TabsList>

          {activeTab === "personal" && (
            <PersonalInfoTab 
              form={form} 
              isEditable={isEditable} 
              isTransient={isTransient} 
              patientData={patientData} 
              patientId={patientId}
              handleSaveEdit={handleSaveEdit} 
              handleCancelEdit={handleCancelEdit}
              residentsOptions={residentsOptions}
              selectedResidentId={selectedResidentId}
              onResidentSelect={handleResidentSelect}
              showResidentSelector={showResidentSelector}
            />
          )}

          {activeTab === "medical" && (
            <Records
              vaccinationCount={vaccinationCount}
              medicineCount={medicineCount}
              firstAidCount={firstAidCount}
              postpartumCount={postpartumCount}
              patientLinkData={patientLinkData}
              medicalconCount={medconCount}
              childHealthCount={childHealthCountData}
              childHealthRecords={formattedChildHealthData}
              prenatalCount={prenatalCount}
              childHistoryLoading={childHistoryLoading}
              famplanCount={famplanCount}
              animalbitesCount={animalbitesCount}
            />
          )}

          {activeTab === "visits" && <VisitHistoryTab completedData={completedData} pendingData={pendingData} missedData={missedData} />}
        </Tabs>

        {/* Status Update Dialog */}
        <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Update Patient Status</AlertDialogTitle>
              <AlertDialogDescription>
                Is this patient transferring to another barangay/location?
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-4 py-4">
              <RadioGroup value={hasTransferred} onValueChange={setHasTransferred}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="font-normal cursor-pointer">
                    No, patient is still residing here
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="font-normal cursor-pointer">
                    Yes, patient is transferring to another location
                  </Label>
                </div>
              </RadioGroup>

              {hasTransferred === "yes" && (
                <div className="space-y-3 mt-4 p-4 border rounded-md bg-gray-50">
                  <p className="text-sm font-medium text-gray-700">New Location Information (Where they're moving to)</p>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="sitio" className="text-sm">Sitio *</Label>
                      <Input
                        id="sitio"
                        placeholder="Enter sitio"
                        value={transferLocation.sitio}
                        onChange={(e) => setTransferLocation(prev => ({ ...prev, sitio: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="barangay" className="text-sm">Barangay *</Label>
                      <Input
                        id="barangay"
                        placeholder="Enter barangay"
                        value={transferLocation.barangay}
                        onChange={(e) => setTransferLocation(prev => ({ ...prev, barangay: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-sm">City *</Label>
                      <Input
                        id="city"
                        placeholder="Enter city"
                        value={transferLocation.city}
                        onChange={(e) => setTransferLocation(prev => ({ ...prev, city: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelStatusUpdate}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleStatusUpdate} className="bg-green-500 hover:bg-green-600">
                Update
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </LayoutWithBack>
  );
}
