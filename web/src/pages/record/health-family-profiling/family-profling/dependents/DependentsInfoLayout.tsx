import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button/button";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import DependentForm from "./DependentForm";
import { DataTable } from "@/components/ui/table/data-table";
import { DependentRecord } from "../../../profiling/ProfilingTypes";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { CircleAlert, Trash } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useAuth } from "@/context/AuthContext";
import { 
  useAddFamily, 
  useAddFamilyComposition,
} from "../../../profiling/queries/profilingAddQueries";
import {
  addRespondentHealth, 
  addPerAdditionalDetailsHealth, 
  addMotherHealthInfo 
} from "../restful-api/profiingPostAPI";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoadButton } from "@/components/ui/button/load-button";

export default function DependentsInfoLayout({
  form,
  residents,
  selectedParents,
  dependentsList,
  setDependentsList,
  back,
  setFamId,
  nextStep
}: {
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  residents: any;
  selectedParents: string[];
  dependentsList: DependentRecord[];
  setDependentsList: React.Dispatch<React.SetStateAction<DependentRecord[]>>;
  back: () => void;
  setFamId: React.Dispatch<React.SetStateAction<string>>;
  nextStep: () => void;
}) {

  const PARENT_ROLES = ["Mother", "Father", "Guardian"];
  const { user } = useAuth();
  
  // Main database hooks
  const { mutateAsync: addFamily } = useAddFamily();
  const { mutateAsync: addFamilyComposition } = useAddFamilyComposition();
  
  // Health database hooks for parent data (without automatic toasts)
  const queryClient = useQueryClient();
  
  const { mutateAsync: addRespondent } = useMutation({
    mutationFn: (data: Record<string, any>) => addRespondentHealth(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["respondentsHealth"] });
      // No toast here - we'll show one combined toast
    },
  });
  
  const { mutateAsync: addPerAdditionalDetails } = useMutation({
    mutationFn: (data: Record<string, any>) => addPerAdditionalDetailsHealth(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perAdditionalDetailsHealth"] });
      // No toast here - we'll show one combined toast
    },
  });
  
  const { mutateAsync: addMotherHealthInfoMutation } = useMutation({
    mutationFn: (data: Record<string, any>) => addMotherHealthInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motherHealthInfo"] });
      // No toast here - we'll show one combined toast
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Function to submit parent health-related data and respondents info
  const submitParentHealthData = React.useCallback(async (formData: any, famId: string) => {
    const parents = [
      { type: 'respondentInfo', data: formData.respondentInfo, isRespondent: true },
      { type: 'motherInfo', data: formData.motherInfo, isRespondent: false },
      { type: 'fatherInfo', data: formData.fatherInfo, isRespondent: false }
    ];
    
    for (const parent of parents) {
      const parentData = parent.data;
      
      if (parentData && parentData.id) {
        const residentId = parentData.id.split(' ')[0]; // Extract resident ID
        
        // Submit RespondentsInfo if it's the respondent
        if (parent.isRespondent) {
          const respondentPayload = {
            rp: residentId,
            fam: famId
          };
          
          console.log(`Submitting respondent info:`, respondentPayload);
          await addRespondent(respondentPayload);
        }
        
        // Submit HealthRelatedDetails if perAddDetails exists
        if (parentData.perAddDetails && (
          parentData.perAddDetails.bloodType || 
          parentData.perAddDetails.philHealthId || 
          parentData.perAddDetails.covidVaxStatus
        )) {
          const healthDetailsPayload = {
            per_add_bloodType: parentData.perAddDetails.bloodType || null,
            per_add_philhealth_id: parentData.perAddDetails.philHealthId || null,
            per_add_covid_vax_status: parentData.perAddDetails.covidVaxStatus || null,
            rp: residentId
          };
          
          console.log(`Submitting health details for ${parent.type}:`, healthDetailsPayload);
          await addPerAdditionalDetails(healthDetailsPayload);
        }
        
        // Submit Mother Health Info if it's mother and motherHealthInfo exists
        if (parent.type === 'motherInfo' && parentData.motherHealthInfo && (
          parentData.motherHealthInfo.healthRiskClass ||
          parentData.motherHealthInfo.immunizationStatus ||
          parentData.motherHealthInfo.method?.length > 0 ||
          parentData.motherHealthInfo.source
        )) {
          const motherHealthPayload = {
            mhi_healthRisk_class: parentData.motherHealthInfo.healthRiskClass || null,
            mhi_immun_status: parentData.motherHealthInfo.immunizationStatus || null,
            mhi_famPlan_method: parentData.motherHealthInfo.method ? 
              parentData.motherHealthInfo.method.join(', ') : null,
            mhi_famPlan_source: parentData.motherHealthInfo.source || null,
            rp: residentId,
            fam: famId
          };
          
          console.log('Submitting mother health info:', motherHealthPayload);
          await addMotherHealthInfoMutation(motherHealthPayload);
        }
      }
    }
    
    console.log("Parent health information and respondent data submitted successfully!");
  }, [addRespondent, addPerAdditionalDetails, addMotherHealthInfoMutation]);

  React.useEffect(() => {
    const dependents = form.getValues("dependentsInfo.list");

    if (Array.isArray(dependents)) {
      // Transform the list into an array of Dependent objects
      const transformedData = dependents.map((value) => ({
        id: value.id?.split(" ")[0] as string,
        lname: value.lastName,
        fname: value.firstName,
        mname: value.middleName,
        suffix: value.suffix,
        sex: value.sex,
        dateOfBirth: value.dateOfBirth,
      }));

      // Update the state with the transformed data
      if(transformedData.length > 0) {
        setDependentsList(transformedData);
      }
    }
  }, [form.watch("dependentsInfo.list")]); // Watch for changes in dependentsInfo.list

  const dependentColumns: ColumnDef<DependentRecord>[] = [
    { accessorKey: "id", header: "#" },
    { accessorKey: "lname", header: "Last Name" },
    { accessorKey: "fname", header: "First Name" },
    { accessorKey: "mname", header: "Middle Name" },
    { accessorKey: "suffix", header: "Suffix" },
    { accessorKey: "sex", header: "Sex" },
    { accessorKey: "dateOfBirth", header: "Birthday" },
    {
      accessorKey: "action",
      header: "",
      cell: ({ row }) => (
        <TooltipLayout
          trigger={
            <Trash
              size={17}
              className="fill-red-500 stroke-red-500 cursor-pointer"
              onClick={() => {
                handleDelete(row.original.id);
              }}
            />
          }
          content={"Remove"}
        />
      ),
    },
  ];

  const handleDelete = (id: string) => {
    setDependentsList((prevData) => {
      const newData = prevData.filter((dependent) => dependent.id !== id);

      // Update the form state with the new list of dependents
      form.setValue(
        "dependentsInfo.list",
        newData.map((dependent) => ({
          id: dependent.id,
          lastName: dependent.lname,
          firstName: dependent.fname,
          middleName: dependent.mname,
          suffix: dependent.suffix,
          sex: dependent.sex,
          dateOfBirth: dependent.dateOfBirth,
        }))
      );

      return newData;
    });
  };

  const submit = async () => { 
    setIsSubmitting(true);

    if(dependentsList.length === 0){
      setIsSubmitting(false);
      toast('Must have atleast one dependent.', {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
        style: {
          border: '1px solid rgb(225, 193, 193)',
          padding: '16px',
          color: '#b91c1c',
          background: '#fef2f2',
        },
      });
      return;
    }

    try {
      const demographicInfo = form.getValues().demographicInfo;
      // Create family and retrieve new fam_id
      const newFamily = await addFamily({
        demographicInfo: demographicInfo, 
        staffId: user?.staff?.staff_id || ""
      });
      // Store fam_id for subsequent queries
      setFamId(newFamily.fam_id);

      // Create family compositions for parents first
      const parentCompositions = selectedParents
        .filter(parentId => parentId) // Filter out empty parent IDs
        .map((parentId, index) => ({
          fam: newFamily.fam_id,
          rp: parentId,
          fc_role: PARENT_ROLES[index], // "Mother", "Father", "Guardian"
        }));

      // Create family compositions for dependents
      const dependentCompositions = dependentsList.map(dep => ({
        fam: newFamily.fam_id,
        rp: dep.id,
        fc_role: 'Dependent',
      }));

      // Combine all compositions
      const allCompositions = [...parentCompositions, ...dependentCompositions];
      
      await addFamilyComposition(allCompositions);

      // Submit parent health data and respondents info
      const formData = form.getValues();
      await submitParentHealthData(formData, newFamily.fam_id);

      toast("Record added successfully", {
        icon: <CircleAlert size={24} className="fill-green-500 stroke-white" />,
        style: {
          border: '1px solid rgb(187, 222, 251)',
          padding: '16px',
          color: '#1e3a8a',
          background: '#eff6ff',
        },
      });

      setIsSubmitting(false);
      // Proceed to next step
      nextStep();
    } catch (error) {
      console.error('Family registration failed:', error);
      setIsSubmitting(false);
      toast('Family Registration Failed', {
        description: "Registration failed. Please try again.",
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
        style: {
          border: '1px solid rgb(225, 193, 193)',
          padding: '16px',
          color: '#b91c1c',
          background: '#fef2f2',
        },
      });
    }
  }

  return (
    <div className="flex flex-col min-h-0 h-auto gap-10 md:p-10 rounded-lg overflow-auto">
      <div className="mt-8 flex flex-col justify-end gap-2 sm:gap-3">
        <DependentForm
          form={form}
          residents={residents}
          selectedParents={selectedParents}
          dependents={dependentsList}
        />
        <DataTable data={dependentsList} columns={dependentColumns} />
      </div>
      <div className="flex justify-end gap-3">
        {!isSubmitting ? (<>
          <Button variant="outline" className="w-full sm:w-32" onClick={back}>
            Prev
          </Button>
          <ConfirmationModal 
          trigger={
            <Button className="w-full sm:w-32">
              Register
            </Button>
          }
          title="Confirm Registration"
          description="Do you wish to proceed with the registration?"
          actionLabel="Confirm"
          onClick={submit}
          />
        </>) : (
          <LoadButton>Registering...</LoadButton>
        )}
      </div>
    </div>
  );
}