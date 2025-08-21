import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import {
  addAddressHealth,
  addFamilyHealth,
  addFamilyCompositionHealth, 
  addHouseholdHealth,
  addPersonalAddressHealth,
  addResidentAndPersonalHealth,
  addResidentProfileHealth,
  addRespondentHealth,
  addPerAdditionalDetailsHealth,
  addMotherHealthInfo,
  addWaterSupply,
  addSanitaryFacility,
  addSolidWaste,
  submitEnvironmentalForm,
  createSurveyIdentification,
  submitSurveyIdentificationForm,
  createNCDRecord,
  createTBRecord
} from "../restful-api/profiingPostAPI";


export const useAddAddressHealth = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>[]) => addAddressHealth(data)
  })
}
export const useAddPerAddressHealth = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>[]) => addPersonalAddressHealth(data)
  })
}
export const useAddResidentProfileHealth = () => { // For registration request
  return useMutation({
    mutationFn: ({
      personalId,
      staffId,
    }: {
      personalId: string;
      staffId: string;
    }) => addResidentProfileHealth(personalId, staffId)
  });
};

export const useAddResidentAndPersonalHealth = () => { // For registration from the web
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({personalInfo, staffId} : {
      personalInfo: Record<string, any>;
      staffId?: string;
    }) => addResidentAndPersonalHealth(personalInfo, staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['residentsTableDataHealth'],
      });
    }
  })
}

// Environmental create hooks
export const useAddWaterSupply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { hh: string; water_sup_type: string; water_conn_type: string; water_sup_desc: string; water_sup_id?: string; }) => addWaterSupply(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waterSupplyList'] });
      queryClient.invalidateQueries({ queryKey: ['environmentalData'] });
      toast("Water supply saved", { icon: <CircleCheck size={24} className="fill-green-500 stroke-white" /> });
    }
  })
}

export const useAddSanitaryFacility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { hh: string; sf_type: string; sf_toilet_type: string; sf_id?: string; }) => addSanitaryFacility(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sanitaryFacilityList'] });
      queryClient.invalidateQueries({ queryKey: ['environmentalData'] });
      toast("Sanitary facility saved", { icon: <CircleCheck size={24} className="fill-green-500 stroke-white" /> });
    }
  })
}

export const useAddSolidWaste = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { hh: string; swn_desposal_type: string; swm_desc?: string; swm_id?: string; }) => addSolidWaste(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solidWasteList'] });
      queryClient.invalidateQueries({ queryKey: ['environmentalData'] });
      toast("Solid waste saved", { icon: <CircleCheck size={24} className="fill-green-500 stroke-white" /> });
    }
  })
}

export const useSubmitEnvironmentalForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      household_id: string;
      water_supply?: { type: 'level1' | 'level2' | 'level3' };
      sanitary_facility?: { facility_type: string; toilet_facility_type: string };
      waste_management?: { waste_management_type: string; description?: string };
    }) => submitEnvironmentalForm(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environmentalData'] });
      toast("Environmental form submitted", { icon: <CircleCheck size={24} className="fill-green-500 stroke-white" /> });
    }
  })
}


// export const useAddPersonalHealth = (values: z.infer<typeof personalInfoSchema>) => {
//   return useMutation({
//     mutationFn: () => addPersonalHealth(values),
//   });
// };



export const useAddFamilyHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({demographicInfo, staffId}: {
      demographicInfo: Record<string, string>;
      staffId: string;
    }) => addFamilyHealth(demographicInfo, staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
    },
  });
};

export const useAddFamilyCompositionHealth = () => {
  const queryClient = useQueryClient();
    
  return useMutation({
    mutationFn: (data: Record<string, any>[]) => addFamilyCompositionHealth(data),
    onSuccess: () => {

      // Invalidate queries to ensure fresh data is fetched if needed
      queryClient.invalidateQueries({queryKey: ['familyCompositions']});
      queryClient.invalidateQueries({ queryKey: ["families"] });
      queryClient.invalidateQueries({queryKey: ['residents']});

      toast("Record added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });

      }
  });
};

export const useAddHouseholdHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      householdInfo,
      staffId,
    }: {
      householdInfo: Record<string, string>;
      staffId: string;
    }) => addHouseholdHealth(householdInfo, staffId),
    onSuccess: (newData) => {
      queryClient.setQueryData(["householdsHealth"], (old: any) => {
        // Handle case where old data doesn't exist or is not an array
        if (!old || !Array.isArray(old)) {
          return [newData];
        }
        return [...old, newData];
      });

      queryClient.invalidateQueries({ queryKey: ["householdsHealth"] });

      toast("Record added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });
    },
  });
};

export const useAddRespondentHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => addRespondentHealth(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["respondentsHealth"] });
      toast("Respondent added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });
    },
  });
};

export const useAddPerAdditionalDetailsHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => addPerAdditionalDetailsHealth(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perAdditionalDetailsHealth"] });
      toast("Health details added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });
    },
  });
};

export const useAddMotherHealthInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => addMotherHealthInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motherHealthInfo"] });
      toast("Mother's health info added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });
    },
  });
};

// ================ SURVEY IDENTIFICATION ================ (Status: Completed)
export const useCreateSurveyIdentification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => createSurveyIdentification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveyIdentificationList"] });
      queryClient.invalidateQueries({ queryKey: ["surveyIdentificationByFamily"] });
      toast("Survey identification created successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });
    },
  });
};

export const useSubmitSurveyIdentificationForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => submitSurveyIdentificationForm(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["surveyIdentificationList"] });
      queryClient.invalidateQueries({ queryKey: ["surveyIdentificationByFamily"] });
      queryClient.invalidateQueries({ queryKey: ["surveyIdentificationFormData"] });
      
      const action = data?.action || 'created';
      toast(`Survey identification ${action} successfully`, {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });
    },
  });
};

// ================ NCD SURVEILLANCE ================ (Status: New)
export const useSubmitNCDRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => createNCDRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ncdRecordsList"] });
      queryClient.invalidateQueries({ queryKey: ["ncdRecordsByFamily"] });
      toast("NCD record submitted successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });
    },
  });
};

// ================ TB SURVEILLANCE ================ (Status: New)
export const useSubmitTBRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => createTBRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tbRecordsList"] });
      queryClient.invalidateQueries({ queryKey: ["tbRecordsByFamily"] });
      toast("TB surveillance record submitted successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });
    },
  });
};