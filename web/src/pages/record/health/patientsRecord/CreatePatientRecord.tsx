"use client";

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"

import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button/button"
import { Save, CircleAlert } from "lucide-react"
import { toast } from "sonner"
import CardLayout from "@/components/ui/card/card-layout"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { patientRecordSchema } from "@/pages/record/health/patientsRecord/patients-record-schema"
import { Form } from "@/components/ui/form/form"

import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { Combobox } from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { showErrorToast, showSuccessToast } from "@/components/ui/toast"

import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { capitalize } from "@/helpers/capitalize"

import { useResidents, useAllTransientAddresses } from "./queries/fetch"
import { useAddPatient } from "./queries/add"


// specialize capitalizeAllFields to handle nested objects and skip IDs capitalization
export const capitalizeAllFields = (data: any): any => {
    if (Array.isArray(data)) {
        return data.map(capitalizeAllFields);
    } else if (data && typeof data === "object") {
        const newObj: any = {};
        for (const key in data) {
            if (key === "pat_id" || key === "rp_id" || key === "tradd_id") {
                newObj[key] = data[key];
            } else if (typeof data[key] === "string") {
                newObj[key] = capitalize(data[key]);
            } else {
                newObj[key] = capitalizeAllFields(data[key]);
            }
        }
        return newObj;
    }
    return data;
};

// typescript interfaces
interface ResidentProfile {
  rp_id: string;
  households: {
    hh_id: string;
  };
  personal_info: {
    per_lname: string;
    per_fname: string;
    per_mname: string;
    per_sex: string;
    per_contact: string;
    per_dob: string;
    per_addresses: Array<{
      add_street: string
      add_barangay: string
      add_city: string
      add_province: string
      sitio?: string
    }>
  }
  per_add_philhealth_id?: string
  mhi_immun_status?: string
}

interface PatientCreationData {
  pat_type: string;
  rp_id?: string;
  transient_data?: {
    tran_lname: string;
    tran_fname: string;
    tran_mname?: string;
    tran_dob: string;
    tran_sex: string;
    tran_contact: string;
    tran_ed_attainment?: string;
    tran_religion?: string;
    tran_status?: string;
    tradd_id?: number;
    address?: {
      tradd_street?: string
      tradd_sitio?: string
      tradd_barangay?: string
      tradd_city?: string
      tradd_province?: string
    }
    philhealth_id?: string
  }
}

// main component
export default function CreatePatientRecord() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const defaultValues = generateDefaultValues(patientRecordSchema);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResidentId, setSelectedResidentId] = useState<string>("");
  const [selectedTrAddtId, setSelectedTrAddId] = useState<number>(0);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof patientRecordSchema>>({
    resolver: zodResolver(patientRecordSchema),
    defaultValues,
  })

  const { data: residentsData, isLoading: residentLoading } = useResidents()
  const { data: transAddress, isLoading: transAddressLoading } = useAllTransientAddresses()

  const patientType = form.watch("patientType")
  const phId = form.watch("philhealthId")

  useEffect(() => {
    if(phId && phId.length != 12) {
      form.setError("philhealthId", {
        type: "manual",
        message: "PhilHealth ID must be 12 digits.",
      })
    } else if (phId && phId.length === 12) {
      form.clearErrors("philhealthId")
    }
  }, [phId, form])

  const transientAddressOpt = (transAddress && Array.isArray(transAddress)) ? transAddress?.map((tradd: any) => ({
    id: tradd.tradd_id.toString(),
    name: `${tradd.tradd_street || ""}, ${tradd.tradd_sitio || ""}, ${tradd.tradd_barangay || ""}, ${tradd.tradd_city || ""}, ${tradd.tradd_province || ""}`.trim(),
  })) : []

  const handleTransientAddressSelection = (selectedValue: string | undefined) => {
    if (!selectedValue) {
      setSelectedTrAddId(0)
      form.setValue("address.street", "")
      form.setValue("address.sitio", "")
      form.setValue("address.barangay", "")
      form.setValue("address.city", "")
      form.setValue("address.province", "")
      return
    }
    const id = Number(selectedValue)
    setSelectedTrAddId(id)
    console.log("Selected Transient Address ID: ", id)

    const selectedAddress = transAddress?.find((address: any) => address.tradd_id === id);

    if (selectedAddress) {
      form.setValue("address.street", selectedAddress.tradd_street || "")
      form.setValue("address.sitio", capitalize(selectedAddress.tradd_sitio) || "")
      form.setValue("address.barangay", selectedAddress.tradd_barangay || "")
      form.setValue("address.city", selectedAddress.tradd_city || "")
      form.setValue("address.province", selectedAddress.tradd_province || "")
    } else {
      form.setValue("address.street", "");
      form.setValue("address.sitio", "");
      form.setValue("address.barangay", "");
      form.setValue("address.city", "");
      form.setValue("address.province", "");
    }
  };

  const persons = {
    default: residentsData || [],
    formatted:
      residentsData?.map((personal: any) => ({
        id: personal.rp_id.toString(),
        name: (
          <>
            <span className="rounded-md px-2 py-1 font-poppins mr-2 bg-green-500 text-white">#{personal.rp_id} </span>
            {personal.personal_info?.per_lname || ""}, {personal.personal_info?.per_fname || ""} {personal.personal_info?.per_mname || ""}
            
          </>
        )
      })) || [],
  }

  const handlePatientSelection = (id: string | undefined) => {
    if (!id) {
      setSelectedResidentId("");

      form.setValue("lastName", "");
      form.setValue("firstName", "");
      form.setValue("middleName", "");
      form.setValue("sex", "");
      form.setValue("contact", "");
      form.setValue("dateOfBirth", "");
      form.setValue("patientType", "resident");
      form.setValue("philhealthId", "");
      form.setValue("address.street", "");
      form.setValue("address.sitio", "");
      form.setValue("address.barangay", "");
      form.setValue("address.city", "");
      form.setValue("address.province", "");
      
      return;
    }
    setSelectedResidentId(id);
    console.log("Selected Resident ID:", id);
    const selectedPatient: ResidentProfile | undefined = persons.default.find(
      (p: ResidentProfile) => p.rp_id.toString() === id,
    );

    if (selectedPatient && selectedPatient.personal_info) {

      const personalInfo = selectedPatient.personal_info;

      if (Array.isArray(selectedPatient?.households)) {
        console.log(
          "Household Nos:",
          selectedPatient.households.map((h) => h.hh_id),
        );
      }

      form.setValue("lastName", personalInfo.per_lname || "");
      form.setValue("firstName", personalInfo.per_fname || "");
      form.setValue("middleName", personalInfo.per_mname || "");
      form.setValue("sex", personalInfo.per_sex || "");
      form.setValue("contact", personalInfo.per_contact || "");
      form.setValue("dateOfBirth", personalInfo.per_dob || "");
      form.setValue("patientType", "resident");
      form.setValue("philhealthId", selectedPatient?.per_add_philhealth_id || "");

      if (selectedPatient.personal_info.per_addresses && selectedPatient.personal_info.per_addresses.length > 0) {
        const address = selectedPatient.personal_info.per_addresses[0]; 

        form.setValue("address.street", address.add_street || "");
        form.setValue("address.sitio", address.sitio || ""); // to be added capitalize helper
        form.setValue("address.barangay", address.add_barangay || "");
        form.setValue("address.city", address.add_city || "");
        form.setValue("address.province", address.add_province || "");
      } else {
        form.setValue("address.street", "");
        form.setValue("address.sitio", "");
        form.setValue("address.barangay", "");
        form.setValue("address.city", "");
        form.setValue("address.province", "");
        form.setValue("address.street", "");
        form.setValue("address.sitio", "");
        form.setValue("address.barangay", "");
        form.setValue("address.city", "");
        form.setValue("address.province", "");
      }
    } else {
      form.setValue("lastName", "");
      form.setValue("firstName", "");
      form.setValue("middleName", "");
      form.setValue("sex", "");
      form.setValue("contact", "");
      form.setValue("dateOfBirth", "");
      form.setValue("patientType", "resident");
      form.setValue("philhealthId", "");
    }
  }

  const createNewPatient = useAddPatient();
  const handleCreatePatientId = async (patientData: PatientCreationData) => {
    try {
      const result = await createNewPatient.mutateAsync(patientData);

      if (result) {
        showSuccessToast("Patient record has been created successfully")
        return true
      } else {
        toast("Patient record may have been created. Please refresh to verify.");
        return false;
      }
    } catch (error) {
      console.error("Error creating patient record:", error)
      showErrorToast("An error occurred while creating the patient record. Please check the details and try again.")
      return false
    }
  }
  

  // handles the form validation and opens the confirmation dialog
  const handleFormSubmit = async () => {
    const formData = form.getValues();

    if (formData.patientType === "resident" && !selectedResidentId) {
      toast("Please select a resident first");
      return;
    }

    if (formData.patientType === "transient") {
      const requiredFields = ["lastName", "firstName", "dateOfBirth", "sex", "contact"];
      const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]);

      if (missingFields.length > 0) {
        toast.error(`Please fill in the following required fields: ${missingFields.join(", ")}`);
        return;
      }
    }

    setIsDialogOpen(true);
  };

  const confirmSubmit = async () => {
    const formData = form.getValues();

    setIsDialogOpen(false)
    setIsSubmitting(true)
    
    try {
      const patientType = formData.patientType === "resident" ? "Resident" : formData.patientType === "transient" ? "Transient" : "Resident";
      const sexType = formData.sex === "female" ? "Female" : "Male";
      form.setValue("houseNo", "N/A");

      let patientData: PatientCreationData;

      if (patientType === "Resident") {
        patientData = {
          pat_type: patientType,
          rp_id: selectedResidentId
        };
      } else {
        const trPatientData: PatientCreationData["transient_data"] = {
          tran_lname: formData.lastName,
          tran_fname: formData.firstName,
          tran_mname: formData.middleName,
          tran_dob: formData.dateOfBirth,
          tran_sex: sexType,
          tran_contact: formData.contact,
          tran_status: "Active",
          tran_ed_attainment: "Not Specified",
          tran_religion: "Not Specified",
          philhealth_id: formData.philhealthId || "",
        }
        if(selectedTrAddtId !== 0) {
          trPatientData.tradd_id = selectedTrAddtId
        } else {
          trPatientData.address = {
            tradd_street: formData.address?.street || "",
            tradd_sitio: formData.address?.sitio || "",
            tradd_barangay: formData.address?.barangay || "",
            tradd_city: formData.address?.city || "",
            tradd_province: formData.address?.province || ""
          };
        }

        patientData = {
          pat_type: patientType,
          transient_data: trPatientData
        };
      }

      const capitalizedData = capitalizeAllFields(patientData)

      console.log("Creating patient with data:", capitalizedData)

      const success = await handleCreatePatientId(capitalizedData)

      if (success) {
        form.reset(defaultValues);
        setSelectedResidentId("");
        setSelectedTrAddId(0);
        navigate(-1);
      }
    } catch (error) {
      toast("Failed to create patient record. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }
  };

  const isResident = () => {
    return patientType === "resident";
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <LayoutWithBack
      title='Create Patient Record'
      description="Create a new patient record by filling out the form below."
    >
    <div className="w-full">
        <div className="w-full mx-auto border-none">
          <div>
            <Form {...form}>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleFormSubmit()
                }}
                className="space-y-4"
              >
                

                <CardLayout
                  title=""
                  description=""
                  content={
                  <>
                    <div className="mb-5">
                      <Label className="text-xl text-black">Patient Information</Label>
                      <p className="text-sm text-black/70 mb-2">Review the patient information before saving.</p>
                      <Separator className="w-full bg-gray" />
                    </div>

                    <div className="grid grid-cols-2 gap-6 rounded-lg bg-white mb-8">
                      <div className="">
                        <FormSelect
                          control={form.control}
                          name="patientType"
                          label="Patient Type"
                          options={[
                            { id: "resident", name: "Resident" },
                            { id: "transient", name: "Transient" },
                          ]}
                          readOnly={false}
                        />
                      </div>

                      {patientType === "resident" && (
                        <div>
                          <Label className="text-black/70">Resident</Label>
                          <div className="grid mt-[6.5px] ">
                            <Combobox
                              options={persons.formatted }
                              value={selectedResidentId}
                              onChange={handlePatientSelection}
                              placeholder={residentLoading ? "Loading residents..." : "Select a resident"}
                              triggerClassName="font-normal w-full"
                              emptyMessage={
                                <div className="flex flex-col gap-2 justify-center items-center">
                                  <Label className="font-normal text-[13px]">
                                    {residentLoading
                                      ? "Loading..."
                                      : "No residents were found."}
                                  </Label>
                                  <Link to="/residents/new">
                                    <Label className="font-normal text-[13px] text-teal cursor-pointer hover:underline">
                                      Register New Resident
                                    </Label>
                                  </Link>
                                </div>
                              }
                            />
                          </div>
                        </div>
                      )}

                      {patientType === 'transient' && (
                        <div className="flex w-[600px] items-end">
                          <label className="flex items-center text-[15px] font-poppins p-[9px] w-full gap-1"> <CircleAlert size={15}/> For <b>TRANSIENT</b> please fill in the needed details below.</label>
                        </div>
                      )}
                    </div>

                    {/* personal information section - read Only if RESIDENT */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-5">
                      <FormInput control={form.control} name="lastName" label="Last Name" placeholder="Enter last name" readOnly={isResident() ? true : false} />
                      
                      <FormInput control={form.control} name="firstName" label="First Name" placeholder="Enter first name" readOnly={isResident() ? true : false} />
                      
                      <FormInput control={form.control} name="middleName" label="Middle Name" placeholder="Enter middle name" readOnly={isResident() ? true : false} />
                      
                      <FormInput control={form.control} name="philhealthId" label="PhilHealth ID" placeholder="Enter PhilHealth ID (optional)" readOnly={isResident() ? true : false} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <FormSelect
                        control={form.control}
                        name="sex"
                        label="Sex"
                        options={[
                          { id: "female", name: "Female" },
                          { id: "male", name: "Male" },
                        ]}
                        readOnly={isResident() ? true : false}
                      />

                      <FormInput control={form.control} name="contact" label="Contact" placeholder="Enter contact" readOnly={isResident() ? true : false} />
                      
                      <FormDateTimeInput control={form.control} name="dateOfBirth" label="Date of Birth" type="date" readOnly={isResident() ? true : false} />
                    </div>

                    {/* address section - read Only if RESIDENT */}
                    {patientType === 'transient' && (
                      <>
                        <Label className="flex text-black/70">Address Selection <p className="text-xs italic text-black/50 ml-2"> (Transient only)</p></Label>
                        <div className="relative mb-4 mt-2">
                          <Combobox
                            options={transientAddressOpt}
                            value={selectedTrAddtId ? selectedTrAddtId.toString() : ""}
                            onChange={handleTransientAddressSelection || ""}
                            placeholder={transAddressLoading ? "Loading addresses..." : "Select an address for the transient patient"}
                            triggerClassName="font-normal w-full"
                            emptyMessage={
                              <div className="flex flex-col gap-2 justify-center items-center">
                                <Label className="font-normal text-[13px]">{transAddressLoading ? "Loading..." : "No Address was found. Please fill in the address details below."}</Label>
                              </div>
                            }
                          />
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                      <FormInput control={form.control} name="address.street" label="Street" placeholder="Enter street" readOnly={isResident() ? true : false} />
                      
                      <FormInput control={form.control} name="address.sitio" label="Sitio" placeholder="Enter sitio " readOnly={isResident() ? true : false} />

                      <FormInput control={form.control} name="address.barangay" label="Barangay" placeholder="Enter barangay " readOnly={isResident() ? true : false} />

                      <FormInput control={form.control} name="address.city" label="City" placeholder="Enter city " readOnly={isResident() ? true : false} />

                      <FormInput control={form.control} name="address.province" label="Province" placeholder="Enter province " readOnly={isResident() ? true : false} />
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4 pt-4">
                      <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={isSubmitting}>Cancel</Button>
                      
                      <Button type="submit" className="bg-buttonBlue hover:bg-buttonBlue/90 text-white" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Creating Patient Record...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Save className="mr-2 h-4 w-4" />
                            Save Patient
                          </div>
                        )}
                      </Button>
                    </div>
                  </>
                  }
                  cardClassName="border-none pb-2 p-3 rounded-lg"
                  headerClassName="pb-2 bt-2 text-xl"
                  contentClassName="pt-0"
                />
              </form>
            </Form>
          </div>
        </div>
          
        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isDialogOpen}
          onOpenChange={handleDialogClose}
          onConfirm={confirmSubmit}
          title="Confirm Patient Registration"
        />
      </div>
    </LayoutWithBack>
  )
}
