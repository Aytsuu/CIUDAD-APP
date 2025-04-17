import React from "react";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button/button";
import { Plus } from "lucide-react";

export default function NonComDiseaseForm({
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
  prefix: "ncdRecords";
  title: string;
}) {
  const filteredResidents = React.useMemo(() => {
    return residents.formatted.filter((resident: any) => {
      const residentId = resident.id.split(" ")[0];
      return residentId !== selectedResidentId;
    });
  }, [residents.formatted, selectedResidentId]);

  // Get the current value for the new NCD record
  const newNcdRecord = form.watch(`${prefix}.new`);

  React.useEffect(() => {
    if (!newNcdRecord || !newNcdRecord.id) return;
    
    const fullIdWithName = newNcdRecord.id;
    const residentIdPart = newNcdRecord.id.split(" ")[0];

    const searchResident =
      residents.default?.find((value: any) => value.rp_id === residentIdPart) ||
      residents.formatted?.find(
        (resident: any) => resident.id.split(" ")[0] === residentIdPart
      );

    if (searchResident) {
      const residentData = searchResident.per || searchResident;
      form.setValue(`${prefix}.new`, {
        ...newNcdRecord,
        // id: residentIdPart,
        lastName: residentData.per_lname || residentData.lastName || "",
        firstName: residentData.per_fname || residentData.firstName || "",
        middleName: residentData.per_mname || residentData.middleName || "",
        suffix: residentData.per_suffix || residentData.suffix || "",
        sex: residentData.per_sex || residentData.sex || "",
        dateOfBirth: residentData.per_dob || residentData.dateOfBirth || "",
        contact: residentData.per_contact || residentData.contact || "",
        ncdFormSchema: newNcdRecord.ncdFormSchema || {
          riskClassAgeGroup: "",
          comorbidities: "",
          lifestyleRisk: "",
          inMaintenance: ""
        }
      });
    }
  }, [newNcdRecord?.id, residents, prefix, form]);
  
  const { append } = useFieldArray({
    control: form.control,
    name: `${prefix}.list`,
  });

  const handleAddPatient = () => {
    const newPatient = form.getValues(`${prefix}.new`);
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
      ncdFormSchema: {
        riskClassAgeGroup: "",
        comorbidities: "",
        lifestyleRisk: "",
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
          <div className="mb-2">
            <Combobox
              options={filteredResidents}
              value={newNcdRecord?.id || ""}
              onChange={(value) => form.setValue(`${prefix}.new.id`, value)}
              placeholder="Search for resident..."
              contentClassName="w-[28rem]"
              triggerClassName="w-1/3"
              emptyMessage="No resident found"
            />
          </div>

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
            <FormSelect
              control={form.control}
              name={`${prefix}.new.sex`}
              label="Sex"
              options={[
                { id: "male", name: "Male" },
                { id: "female", name: "Female" },
              ]}
            />
            <FormSelect
              control={form.control}
              name={`${prefix}.new.ncdFormSchema.riskClassAgeGroup`}
              label="Risk class by age/group"
              options={[
                { id: "newborn", name: "Newborn (0-28 days)" },
                { id: "infant", name: "Infant (20 days - 11 months)" },
                { id: "underfive", name: "Under five (1-4 years old)" },
                { id: "schoolaged", name: "School-aged (5-9 years old)" },
                { id: "adolecent", name: "Adolecent (10-19 years old)" },
                { id: "adult", name: "Adult (20-59 years old)" },
                { id: "seniorcitizen", name: "Senior Citizen (60+ years old)" },
              ]}
            />
            <FormSelect
              control={form.control}
              name={`${prefix}.new.ncdFormSchema.comorbidities`}
              label="Comorbidities/Sakit Balation"
              options={[
                { id: "hypertension", name: "HPN - Hypertension" },
                { id: "diabetes", name: "Diabetes" },
                { id: "asthma", name: "Bronchial Asthma" },
                { id: "dyslipidemia", name: "Dyslipedemia" },
                { id: "ckd", name: "Chronic Kidney Disease" },
                { id: "cancer", name: "Cancer" },
                { id: "mhi", name: "Mental Health Illness" },
              ]}
            />
            <FormSelect
              control={form.control}
              name={`${prefix}.new.ncdFormSchema.lifestyleRisk`}
              label="Lifestyle Risk"
              options={[
                { id: "smoker", name: "Smoker" },
                { id: "alcoholic", name: "Alcoholic Beverage Drinking" },
                { id: "others", name: "Others" },
              ]}
            />
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
        </form>
      </Form>
    </div>
  );
}