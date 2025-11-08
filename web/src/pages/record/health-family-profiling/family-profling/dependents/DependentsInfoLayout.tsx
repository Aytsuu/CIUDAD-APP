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
  addMotherHealthInfo, 
  createDependentUnderFive,
  getFamilyMembersHealth
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
  nextStep,
  existingFamId
}: {
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  residents: any;
  selectedParents: string[];
  dependentsList: DependentRecord[];
  setDependentsList: React.Dispatch<React.SetStateAction<DependentRecord[]>>;
  back: () => void;
  setFamId: React.Dispatch<React.SetStateAction<string>>;
  nextStep: () => void;
  existingFamId?: string | null;
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
          parentData.motherHealthInfo.source ||
          parentData.motherHealthInfo.lmpDate
        )) {
          const motherHealthPayload = {
            mhi_healthRisk_class: parentData.motherHealthInfo.healthRiskClass || null,
            mhi_immun_status: parentData.motherHealthInfo.immunizationStatus || null,
            mhi_famPlan_method: parentData.motherHealthInfo.method ? 
              parentData.motherHealthInfo.method.join(', ') : null,
            mhi_famPlan_source: parentData.motherHealthInfo.source || null,
            mhi_lmp_date: parentData.motherHealthInfo.lmpDate || null,
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
      // Use existing family ID if provided, otherwise create new family
      let familyId: string;
      let existingMembers: any[] = [];
      
      if (existingFamId) {
        // Using existing family - skip family creation
        familyId = existingFamId;
        setFamId(familyId);
        
        // Get existing family members to check for duplicates
        console.log(`Fetching existing family compositions for family ${familyId}...`);
        existingMembers = await getFamilyMembersHealth(familyId);
        console.log('Existing members:', existingMembers);
      } else {
        // Create new family and retrieve fam_id
        const demographicInfo = form.getValues().demographicInfo;
        const newFamily = await addFamily({
          demographicInfo: demographicInfo, 
          staffId: user?.staff?.staff_id || ""
        });
        familyId = newFamily.fam_id;
        setFamId(familyId);
      }

      // Create family compositions for parents first
      const parentCompositions = selectedParents
        .filter(parentId => parentId) // Filter out empty parent IDs
        .map((parentId, index) => ({
          fam: familyId,
          rp: parentId,
          fc_role: PARENT_ROLES[index], // "Mother", "Father", "Guardian"
        }));

      // Create family compositions for dependents
      const dependentCompositions = dependentsList.map(dep => ({
        fam: familyId,
        rp: dep.id,
        fc_role: 'Dependent',
      }));

      // Combine all compositions
      const allCompositions = [...parentCompositions, ...dependentCompositions];
      
      // If updating existing family, only add compositions that don't already exist
      let compositionsToAdd = allCompositions;
      if (existingFamId && existingMembers.length > 0) {
        const existingRpIds = new Set(existingMembers.map((m: any) => m.rp_id));
        compositionsToAdd = allCompositions.filter(comp => !existingRpIds.has(comp.rp));
        
        if (compositionsToAdd.length === 0) {
          console.log('No new family members to add - all members already exist');
        } else {
          console.log(`Adding ${compositionsToAdd.length} new family member(s)`);
        }
      }
      
      // Only add compositions if there are new members
      let createdComps: any = [];
      if (compositionsToAdd.length > 0) {
        createdComps = await addFamilyComposition(compositionsToAdd);
      }

      // Submit parent health data and respondents info
      const formData = form.getValues();
      await submitParentHealthData(formData, familyId);

      // Map created family compositions by rp for easy lookup of fc_id
      const fcByRp: Record<string, any> = {};
      if (Array.isArray(createdComps)) {
        createdComps.forEach((comp: any) => {
          fcByRp[comp.rp_id] = comp;
        });
      }

      // If no fc_id present, fetch from health API which returns fc_id in serializer
      const needFcIds = Object.values(fcByRp).some((c: any) => !c.fc_id);
      if (!Array.isArray(createdComps) || needFcIds) {
        const healthMembers = await getFamilyMembersHealth(familyId);
        healthMembers.forEach((m: any) => {
          if (m?.rp_id) fcByRp[m.rp_id] = m;
        });
      }

      // Submit dependent-specific health data
      for (const dep of dependentsList) {
        const rpId = dep.id;
        const newDep = formData.dependentsInfo.list.find((d: any) => d.id?.split(' ')[0] === rpId || d.id === rpId);
        const age = (() => {
          const dob = newDep?.dateOfBirth;
          if (!dob) return null;
          const birth = new Date(dob);
          if (isNaN(birth.getTime())) return null;
          const today = new Date();
          let years = today.getFullYear() - birth.getFullYear();
          const m = today.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
          return years;
        })();

        if (typeof age === 'number' && age >= 0 && age <= 5) {
          // Create Dependents_Under_Five record - requires fc
          const fc = fcByRp[rpId];
          if (fc?.fc_id) {
            const underFive = newDep?.dependentUnderFiveSchema || {};
            await createDependentUnderFive({
              duf_fic: underFive.fic || null,
              duf_nutritional_status: underFive.nutritionalStatus || null,
              duf_exclusive_bf: underFive.exclusiveBf || null,
              fc: fc.fc_id,
              rp: rpId,
            });
          }
          // Save relationship to household head if provided
          if (newDep?.relationshipToHead) {
            await addPerAdditionalDetails({
              per_add_rel_to_hh_head: newDep.relationshipToHead,
              rp: rpId,
            });
          }
        } else if (typeof age === 'number' && age >= 6) {
          // Combine relationship and additional details in one payload
          const pad = newDep?.perAddDetails || {};
          const payload: Record<string, any> = { rp: rpId };
          if (newDep?.relationshipToHead) payload.per_add_rel_to_hh_head = newDep.relationshipToHead;
          if (pad.bloodType) payload.per_add_bloodType = pad.bloodType;
          if (pad.philHealthId) payload.per_add_philhealth_id = pad.philHealthId;
          if (pad.covidVaxStatus) payload.per_add_covid_vax_status = pad.covidVaxStatus;
          const hasAny = Object.keys(payload).length > 1; // more than just rp
          if (hasAny) await addPerAdditionalDetails(payload);
        } else if (newDep?.relationshipToHead) {
          // Age unknown: still store relationship if provided
          await addPerAdditionalDetails({ per_add_rel_to_hh_head: newDep.relationshipToHead, rp: rpId });
        }
      }

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