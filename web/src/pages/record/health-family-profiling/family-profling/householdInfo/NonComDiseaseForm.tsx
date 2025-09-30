import React from "react";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button/button";
import { Plus, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function NonComDiseaseForm({
  residents,
  form,
  prefix,
  title,
}: {
  residents: any;
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  selectedResidentId: string;
  onSelect: React.Dispatch<React.SetStateAction<string>>;
  prefix: "ncdRecords";
  title: string;
}) {
  const [selectedMember, setSelectedMember] = React.useState<string>(""); // Changed to single selection
  
  // Watch for "others" selections
  const selectedComorbidities = form.watch(`${prefix}.new.ncdFormSchema.comorbidities`);
  const selectedLifestyleRisk = form.watch(`${prefix}.new.ncdFormSchema.lifestyleRisk`);
  
  // Clear "others" fields when selection changes
  React.useEffect(() => {
    if (selectedComorbidities !== "Others") {
      form.setValue(`${prefix}.new.ncdFormSchema.comorbiditiesOthers`, "");
    }
  }, [selectedComorbidities, form, prefix]);

  React.useEffect(() => {
    if (selectedLifestyleRisk !== "Others") {
      form.setValue(`${prefix}.new.ncdFormSchema.lifestyleRiskOthers`, "");
    }
  }, [selectedLifestyleRisk, form, prefix]);
  
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
        ncdFormSchema: {
          riskClassAgeGroup: "",
          comorbidities: "",
          lifestyleRisk: "",
          inMaintenance: ""
        }
      });
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
        
        form.setValue(`${prefix}.new`, {
          id: memberId,
          lastName: personalData.per_lname || personalData.lastName || "",
          firstName: personalData.per_fname || personalData.firstName || "",
          middleName: personalData.per_mname || personalData.middleName || "",
          suffix: personalData.per_suffix || personalData.suffix || "",
          sex: formattedSex,
          dateOfBirth: personalData.per_dob || personalData.dateOfBirth || "",
          contact: personalData.per_contact || personalData.contact || "",
          ncdFormSchema: {
            riskClassAgeGroup: "",
            comorbidities: "",
            lifestyleRisk: "",
            inMaintenance: ""
          }
        });
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
    
    // Validate NCD form fields when resident is selected
    const ncdData = newPatient.ncdFormSchema;
    if (!ncdData?.riskClassAgeGroup || !ncdData?.comorbidities || 
        !ncdData?.lifestyleRisk || !ncdData?.inMaintenance) {
      toast.error("Please fill all required NCD fields");
      return;
    }

    // Validate "others" fields if "Others" is selected
    if (ncdData.comorbidities === "Others" && !ncdData.comorbiditiesOthers?.trim()) {
      toast.error("Please specify comorbidities");
      return;
    }

    if (ncdData.lifestyleRisk === "Others" && !ncdData.lifestyleRiskOthers?.trim()) {
      toast.error("Please specify lifestyle risk");
      return;
    }
    
    // Create properly typed patient object for the list
    const patientForList = {
      ...newPatient,
      ncdFormSchema: {
        riskClassAgeGroup: ncdData.riskClassAgeGroup,
        comorbidities: ncdData.comorbidities,
        comorbiditiesOthers: ncdData.comorbiditiesOthers || "",
        lifestyleRisk: ncdData.lifestyleRisk,
        lifestyleRiskOthers: ncdData.lifestyleRiskOthers || "",
        inMaintenance: ncdData.inMaintenance
      }
    };
    
    append(patientForList);
    
    // Clear selection and reset form
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
      ncdFormSchema: {
        riskClassAgeGroup: "",
        comorbidities: "",
        comorbiditiesOthers: "",
        lifestyleRisk: "",
        lifestyleRiskOthers: "",
        inMaintenance: ""
      }
    });
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="mb-6">
        <h2 className="font-semibold text-lg">{title}</h2>
        <p className="text-xs text-black/50">
          Review all fields before proceeding
        </p>
      </div>

      <Form {...form}>
        <form className="grid gap-4">
          <div className="mb-6">
            <h3 className="font-medium text-base mb-3">Select Family Members</h3>
            {availableMembers.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
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
                        <div className="text-xs text-black">
                          {member.fc_role || 'Family Member'}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>All family members have been added to the records.</p>
                <p className="text-sm">Delete records from the table below to make members available again.</p>
              </div>
            )}
          </div>

          {/* Only show form fields if there are available members */}
          {availableMembers.length > 0 && (

          <div className="grid grid-cols-4 gap-4 mb-6">
            <FormInput
              control={form.control}
              name={`${prefix}.new.lastName`}
              label="Last Name"
              readOnly
            />
            <FormInput
              control={form.control}
              name={`${prefix}.new.firstName`}
              label="First Name"
              readOnly
            />
            <FormInput
              control={form.control}
              name={`${prefix}.new.middleName`}
              label="Middle Name"
              readOnly
            />
            <FormInput
              control={form.control}
              name={`${prefix}.new.suffix`}
              label="Suffix"
              readOnly
            />
            <FormInput
              control={form.control}
              name={`${prefix}.new.sex`}
              label="Sex"
              readOnly
            />
            <FormSelect
              control={form.control}
              name={`${prefix}.new.ncdFormSchema.riskClassAgeGroup`}
              label="Risk class by age/group"
              options={[
                { id: "Newborn", name: "Newborn (0-28 days)" },
                { id: "Infant", name: "Infant (20 days - 11 months)" },
                { id: "Underfive", name: "Under five (1-4 years old)" },
                { id: "Schoolaged", name: "School-aged (5-9 years old)" },
                { id: "Adolecent", name: "Adolecent (10-19 years old)" },
                { id: "Adult", name: "Adult (20-59 years old)" },
                { id: "Seniorcitizen", name: "Senior Citizen (60+ years old)" },
              ]}
            />
            <FormSelect
              control={form.control}
              name={`${prefix}.new.ncdFormSchema.comorbidities`}
              label="Comorbidities/Sakit Balation"
              options={[
                { id: "Hypertension", name: "HPN - Hypertension" },
                { id: "Diabetes", name: "Diabetes" },
                { id: "Asthma", name: "Bronchial Asthma" },
                { id: "Dyslipidemia", name: "Dyslipedemia" },
                { id: "CKD", name: "Chronic Kidney Disease" },
                { id: "Cancer", name: "Cancer" },
                { id: "MHI", name: "Mental Health Illness" },
                { id: "None", name: "None" },
                { id: "Others", name: "Others" },
              ]}
            />
            
            {/* Show "Others" input field when "Others" is selected for comorbidities */}
            {selectedComorbidities === "Others" && (
              <FormInput
                control={form.control}
                name={`${prefix}.new.ncdFormSchema.comorbiditiesOthers`}
                label="Please specify comorbidities"
                placeholder="Enter comorbidities"
              />
            )}
            
            <FormSelect
              control={form.control}
              name={`${prefix}.new.ncdFormSchema.lifestyleRisk`}
              label="Lifestyle Risk"
              options={[
                { id: "Smoker", name: "Smoker" },
                { id: "Alcoholic", name: "Alcoholic Beverage Drinking" },
                { id: "None", name: "None" },
                { id: "Others", name: "Others" },
              ]}
            />
            
            {/* Show "Others" input field when "Others" is selected for lifestyle risk */}
            {selectedLifestyleRisk === "Others" && (
              <FormInput
                control={form.control}
                name={`${prefix}.new.ncdFormSchema.lifestyleRiskOthers`}
                label="Please specify lifestyle risk"
                placeholder="Enter lifestyle risk"
              />
            )}
            <FormSelect
              control={form.control}
              name={`${prefix}.new.ncdFormSchema.inMaintenance`}
              label="Naka Maintenance?"
              options={[
                { id: "yes", name: "Yes" },
                { id: "no", name: "No" },
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
          )}
        </form>
      </Form>
    </div>
  );
}