import React from "react";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button/button";
import { Plus, Check } from "lucide-react";
import { Card } from "@/components/ui/card/card";

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
  const [selectedMember, setSelectedMember] = React.useState<string>(""); // Changed to single selection
  
  // Watch the current records list to filter out already added members
  const currentRecords = form.watch(`${prefix}.list`) || [];
  const addedMemberIds = React.useMemo(() => 
    currentRecords.map((record: any) => record.id), 
    [currentRecords]
  );
  
  const availableMembers = React.useMemo(() => {
    if (!residents?.formatted) {
      return [];
    }
    
    const allMembers = residents.formatted.map((resident: any) => ({
      ...resident,
      displayId: resident.id.split(" ")[0], // Extract just the ID part
      displayName: resident.id.split(" - ")[1] || resident.id // Extract name part
    }));
    
    // Filter out members that are already added to the table
    const filteredMembers = allMembers.filter((member: any) => 
      !addedMemberIds.includes(member.displayId)
    );
    
    return filteredMembers;
  }, [residents?.formatted, addedMemberIds]);

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
  
  const handleMemberToggle = (member: any) => {
    const memberId = member.displayId;
    const isSelected = selectedMember === memberId;
    
    if (isSelected) {
      // Unselect member - clear selection
      setSelectedMember("");
      // Clear form
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
      setCalculatedAge("");
    } else {
      // Select member - replace current selection
      setSelectedMember(memberId);
      
      // Find the resident data from the default residents array
      const residentData = residents.default?.find((res: any) => res.rp_id === memberId);
      console.log('Selected resident data:', residentData);
      
      if (residentData) {
        const personalData = residentData.per || residentData;
        // Format sex value to match expected display format
        const sexValue = personalData.per_sex || personalData.sex || "";
        const formattedSex = sexValue.toLowerCase() === 'male' ? 'Male' : 
                           sexValue.toLowerCase() === 'female' ? 'Female' : 
                           sexValue;
        
        console.log('TbSurveilanceForm - Sex value from data:', sexValue);
        console.log('TbSurveilanceForm - Formatted sex:', formattedSex);
        
        const formData = {
          id: memberId,
          lastName: personalData.per_lname || personalData.lastName || "",
          firstName: personalData.per_fname || personalData.firstName || "",
          middleName: personalData.per_mname || personalData.middleName || "",
          suffix: personalData.per_suffix || personalData.suffix || "",
          sex: formattedSex,
          dateOfBirth: personalData.per_dob || personalData.dateOfBirth || "",
          contact: personalData.per_contact || personalData.contact || "",
          tbSurveilanceSchema: {
            srcAntiTBmeds: "",
            noOfDaysTakingMeds: "",
            tbStatus: ""
          }
        };
        
        console.log('TbSurveilanceForm - Setting form data:', formData);
        form.setValue(`${prefix}.new`, formData);
        
        // Update calculated age
        if (personalData.per_dob || personalData.dateOfBirth) {
          setCalculatedAge(calculateAge(personalData.per_dob || personalData.dateOfBirth));
        }
      }
    }
  };
  
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
    
    // Reset selection and form fields for new patient
    setSelectedMember("");
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
          <div className="mb-6">
            <h3 className="font-medium text-base mb-3">Select Family Members</h3>
            {availableMembers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                All family members have been added
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {availableMembers.map((member: any) => {
                  const isSelected = selectedMember === member.displayId;
                  return (
                    <Card 
                      key={member.displayId}
                      className={`p-4 cursor-pointer transition-all duration-200 border-2 ${
                        isSelected 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleMemberToggle(member)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'border-green-500 bg-green-500' 
                              : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{member.displayName}</p>
                            <p className="text-xs text-gray-500">ID: {member.displayId}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {member.fc_role || 'Family Member'}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
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
            
            <FormInput 
              control={form.control} 
              name={`${prefix}.new.sex`} 
              label="Sex" 
              readOnly 
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