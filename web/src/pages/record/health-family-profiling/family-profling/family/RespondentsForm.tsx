import React from "react";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { familyFormSchema } from "@/form-schema/family-form-schema";
import { useResidentsListHealth } from "../../family-profling/queries/profilingFetchQueries";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { formatResidents } from "../../profilingFormats";
import { Combobox } from "@/components/ui/combobox";
import { useLoading } from "@/context/LoadingContext";

export default function RespondentsForm({ residents, form, selectedResidentId, prefix, title }: {
  residents: {
    default: any[];
    formatted: any[];
  };
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  selectedResidentId: string;
  onSelect: React.Dispatch<React.SetStateAction<string>>;
  prefix: 'respondentInfo';
  title: string;
}) {
  const { showLoading, hideLoading } = useLoading();
  
  // Fetch health residents data
  const { data: residentsListHealth, isLoading: isLoadingResidentsHealth } = useResidentsListHealth();
  
  // Format health residents data
  const formattedResidentsHealth = React.useMemo(
    () => formatResidents(residentsListHealth),
    [residentsListHealth]
  );

  // Handle loading state
  React.useEffect(() => {
    if (isLoadingResidentsHealth) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoadingResidentsHealth, showLoading, hideLoading]);

  // Combine regular residents with health residents
  const combinedResidents = React.useMemo(() => {
    const defaultCombined = [
      ...(residents.default || []),
      ...(residentsListHealth || [])
    ];
    
    const formattedCombined = [
      ...(residents.formatted || []),
      ...(formattedResidentsHealth || [])
    ];

    // Remove duplicates based on rp_id
    const uniqueDefault = defaultCombined.filter((resident, index, self) => 
      index === self.findIndex(r => r.rp_id === resident.rp_id)
    );
    
    const uniqueFormatted = formattedCombined.filter((resident, index, self) => 
      index === self.findIndex(r => r.id.split(" ")[0] === resident.id.split(" ")[0])
    );

    return {
      default: uniqueDefault,
      formatted: uniqueFormatted
    };
  }, [residents, residentsListHealth, formattedResidentsHealth]);

  const filteredResidents = React.useMemo(() => {
    return combinedResidents.formatted.filter((resident: any) => {
      const residentId = resident.id.split(" ")[0];
      return residentId !== selectedResidentId;
    });
  }, [combinedResidents.formatted, selectedResidentId]);

  React.useEffect(() => {
    const searchedResidentId = form.watch(`${prefix}.id`);
    const residentIdPart = searchedResidentId?.split(" ")[0];
    
    const searchResident = combinedResidents.default?.find((value: any) => 
      value.rp_id === residentIdPart
    ) || combinedResidents.formatted?.find((resident: any) =>
      resident.id.split(" ")[0] === residentIdPart
    );

    if (searchResident) {
      const residentData = searchResident.per || searchResident;
      form.setValue(`${prefix}`, {
        id: searchedResidentId || '',
        lastName: residentData.per_lname || residentData.lastName || '',
        firstName: residentData.per_fname || residentData.firstName || '',
        middleName: residentData.per_mname || residentData.middleName || '',
        suffix: residentData.per_suffix || residentData.suffix || '',
        sex: residentData.per_sex || residentData.sex || '',
        dateOfBirth: residentData.per_dob || residentData.dateOfBirth || '',
        contact: residentData.per_contact || residentData.contact || '',
      });
    }
  }, [form.watch(`${prefix}.id`), combinedResidents, prefix]);

  return (
    <div className="bg-white rounded-lg">
      <div className="mb-4">
        <h2 className="font-semibold text-lg">{title}</h2>
        <p className="text-xs text-black/50">Review all fields before proceeding</p>
      </div>

      <Form {...form}>
        <form className="grid gap-4">
          <Combobox
            options={filteredResidents}
            value={form.watch(`${prefix}.id`)}
            onChange={(value) => form.setValue(`${prefix}.id`, value)}
            placeholder="Search for resident..."
            contentClassName="w-[28rem]"   
            triggerClassName="w-1/3"
            emptyMessage="No resident found"
          />

          <div className="grid grid-cols-4 gap-4 mb-6">
            <FormInput control={form.control} name={`${prefix}.lastName`} label="Last Name"  readOnly />
            <FormInput control={form.control} name={`${prefix}.firstName`} label="First Name" readOnly />
            <FormInput control={form.control} name={`${prefix}.middleName`} label="Middle Name" readOnly />
            <FormInput control={form.control} name={`${prefix}.suffix`} label="Suffix" readOnly />
            <FormSelect 
              control={form.control} 
              name={`${prefix}.sex`} 
              label="Sex" 
              options={[
                { id: 'male', name: 'Male' },
                { id: 'female', name: 'Female' },
              ]}
            />
            <FormInput control={form.control} name={`${prefix}.contact`} label="Contact Number" readOnly />
          </div>
        </form>
      </Form>
    </div>
  );
}