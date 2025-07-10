import React from "react";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
// import { familyFormSchema } from "@/form-schema/profiling-schema";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button/button";
import { Plus } from "lucide-react";

export default function TbSurveilanceForm({
  residents,
  form,
  selectedResidentId,
  onSelect,
  prefix,
  title,
}: {
  residents: any;
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  selectedResidentId: string;
  onSelect: React.Dispatch<React.SetStateAction<string>>;
  prefix: "tbRecords";
  title: string;
}) {
  const filteredResidents = React.useMemo(() => {
    if (!residents?.formatted) return [];
    return residents.formatted.filter((resident: any) => {
      const residentId = resident.id.split(" ")[0];
      return residentId !== selectedResidentId;
    });
  }, [residents?.formatted, selectedResidentId]);

  // Get the current value for the new TB record
  const newTbRecord = form.watch(`${prefix}.new`);
  
  // Calculate age based on date of birth
  const calculateAge = (dateOfBirth: string): string => {
    if (!dateOfBirth) return "";
    
    try {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      
      let age = today.getFullYear() - dob.getFullYear();
      const monthDifference = today.getMonth() - dob.getMonth();
      
      // If birthday hasn't occurred this year yet, subtract one year
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      return age.toString();
    } catch (error) {
      console.error("Error calculating age:", error);
      return "";
    }
  };
  
  // State to hold the calculated age
  const [calculatedAge, setCalculatedAge] = React.useState("");
  
  // Update age whenever dateOfBirth changes
  React.useEffect(() => {
    if (newTbRecord?.dateOfBirth) {
      setCalculatedAge(calculateAge(newTbRecord.dateOfBirth));
    } else {
      setCalculatedAge("");
    }
  }, [newTbRecord?.dateOfBirth]);

  React.useEffect(() => {
    if (!newTbRecord || !newTbRecord.id) return;
    
    // Extract just the ID part from the selected value (remove name part if present)
    const fullIdWithName = newTbRecord.id;
    const residentIdPart = fullIdWithName.split(" ")[0];

    const searchResident =
      residents.default?.find((value: any) => value.rp_id === residentIdPart) ||
      residents.formatted?.find(
        (resident: any) => resident.id.split(" ")[0] === residentIdPart
      );

    if (searchResident) {
      const residentData = searchResident.per || searchResident;
      
      // Here we set the ID to just the ID part (without the name)
      form.setValue(`${prefix}.new`, {
        ...newTbRecord,
        id: residentIdPart, // Store only the ID part
        lastName: residentData.per_lname || residentData.lastName || "",
        firstName: residentData.per_fname || residentData.firstName || "",
        middleName: residentData.per_mname || residentData.middleName || "",
        suffix: residentData.per_suffix || residentData.suffix || "",
        sex: residentData.per_sex || residentData.sex || "",
        dateOfBirth: residentData.per_dob || residentData.dateOfBirth || "",
        contact: residentData.per_contact || residentData.contact || "",
        tbSurveilanceSchema: newTbRecord.tbSurveilanceSchema || {
          srcAntiTBmeds: "",
          noOfDaysTakingMeds: "",
          tbStatus: ""
        }
      });
      
      // Update the calculated age when a new resident is selected
      if (residentData.per_dob || residentData.dateOfBirth) {
        setCalculatedAge(calculateAge(residentData.per_dob || residentData.dateOfBirth));
      }
    }
  }, [newTbRecord?.id, residents, prefix, form]);
  
  const { append } = useFieldArray({
    control: form.control,
    name: `${prefix}.list`,
  });

  const handleAddPatient = () => {
    const newPatient = form.getValues(`${prefix}.new`);
    
    // Validate that required fields are filled
    if (!newPatient.id || !newPatient.lastName || !newPatient.firstName) {
      return; // Don't add incomplete records
    }
    
    append(newPatient);
    
    // Reset the form fields for new patient
    form.setValue(`${prefix}.new`, {
      id: '',
      lastName: '',
      firstName: '',
      middleName: '',
      suffix: '',
      sex: '',
      dateOfBirth: '',
      contact: '',
      tbSurveilanceSchema: {
        srcAntiTBmeds: "",
        noOfDaysTakingMeds: "",
        tbStatus: ""
      }
    });
    
    // Reset the calculated age
    setCalculatedAge("");
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="mb-6">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-xs text-black/50">
          Review all fields before proceeding
        </p>
      </div>

      <Form {...form}>
        <form className="grid gap-4">
          <div className="mb-2">
            <Combobox
              options={filteredResidents}
              value={newTbRecord?.id || ""}
              onChange={(value) => form.setValue(`${prefix}.new.id`, value)}
              placeholder="Search for resident..."
              contentClassName="w-[28rem]"
              triggerClassName="w-1/3"
              emptyMessage="No resident found"
            />
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <FormInput control={form.control} name={`${prefix}.new.lastName`} label="Last Name" readOnly/>
            <FormInput control={form.control} name={`${prefix}.new.firstName`} label="First Name" readOnly/>
            <FormInput control={form.control} name={`${prefix}.new.middleName`}label="Middle Name"readOnly/>
            <FormInput control={form.control} name={`${prefix}.new.suffix`} label="Suffix" readOnly />
            
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-3">Age</label>
              <input 
                type="text" 
                value={calculatedAge} 
                className="flex h-9 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                readOnly
              />
            </div>
            
            <FormSelect control={form.control} name={`${prefix}.new.sex`} label="Sex"
              options={[
                { id: "male", name: "Male" },
                { id: "female", name: "Female" },
              ]}
            />
            
            
            
            <FormSelect 
              control={form.control} 
              name={`${prefix}.new.tbSurveilanceSchema.srcAntiTBmeds`} 
              label="Source of Anti TB Meds"
              options={[
                { id: "healthCenter", name: "Health Center" },
                { id: "privateClinic", name: "Private Clinic" },
                { id: "government", name: "Government Hospital" },
                { id: "privateHospital", name: "Private Hospital" },
                { id: "other", name: "Other" },
              ]}
            />
            <FormInput 
              control={form.control} 
              name={`${prefix}.new.tbSurveilanceSchema.noOfDaysTakingMeds`}
              label="No. of Days Taking Meds"
            />
            <FormSelect 
              control={form.control} 
              name={`${prefix}.new.tbSurveilanceSchema.tbStatus`} 
              label="TB Status"
              options={[
                { id: "positive", name: "Positive" },
                { id: "negative", name: "Negative" },
                { id: "underTreatment", name: "Under Treatment" },
                { id: "completed", name: "Treatment Completed" },
                { id: "defaulted", name: "Defaulted" },
              ]}
            />
           
            <div className="flex items-end">
              <Button
                type="button"
                onClick={handleAddPatient}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus /> Add Patient
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}