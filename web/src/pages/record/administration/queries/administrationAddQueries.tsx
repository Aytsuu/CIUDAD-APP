import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPosition, addStaff, assignFeature, setPermission } from "../restful-api/administrationPostAPI";
import { addPositionHealth, addStaffHealth, assignFeatureHealth, setPermissionHealth } from "../restful-api/administrationPostAPI";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { api } from "@/api/api";
import { api2 } from "@/api/api";

// Adding
export const useAddPosition = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, staffId }: { data: any; staffId: string }) =>
      addPosition(data, staffId),
    onSuccess: (newPosition) => {
      queryClient.setQueryData(["positions"], (old: any[] = []) => [
        ...old,
        newPosition,
      ]);
      toast("New record created successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        action: {
          label: "View",
          onClick: () => navigate(-1),
        },
      });
    },
  });
};

export const useAssignFeature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({positionId, featureId, staffId} : {
      positionId: string;
      featureId: string;
      staffId: string;
    }) => assignFeature(positionId, featureId, staffId),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['allAssignedFeatures']})
  })
}

export const useSetPermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({assi_id} : {assi_id: string}) => setPermission(assi_id),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['allAssignedFeatures']})
  })
}

export const useAddStaff = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({residentId, positionId, staffId} : {
      residentId: string;
      positionId: string;
      staffId: string;
    }) => addStaff(residentId, positionId, staffId),
    onSuccess: (newData) => {

      if(!newData) return;
      
      queryClient.setQueryData(["staffs"], (old: any[] = []) => [ 
        ...old,
        newData,
      ]);

      queryClient.invalidateQueries({queryKey: ['staffs']})

      // Deliver feedback
      toast("Record added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });

      navigate(-1)
    }
  });
}

export const useAddPositionBulk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      try {
        console.log('Payload being sent to bulk create:', data);
        const res = await api.post('administration/position/bulk/create/', data);
        return res.data;
      } catch(err: any) {
        console.error('Bulk position creation error:', err);
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['positions']})
    }
  })
}

//-------------Health Administration Add Queries------------------

export const useAddPositionHealth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, staffId }: { data: any; staffId: string }) =>
      addPositionHealth(data, staffId),
    onSuccess: (newPosition) => {
      queryClient.setQueryData(["positionsHealth"], (old: any[] = []) => [
        ...old,
        newPosition,
      ]);
      toast("New record created successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        action: {
          label: "View",
          onClick: () => navigate(-1),
        },
      });
    },
  });
};

export const useAssignFeatureHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({positionId, featureId, staffId} : {
      positionId: string;
      featureId: string;
      staffId: string;
    }) => assignFeatureHealth(positionId, featureId, staffId),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['allAssignedFeaturesHealth']})
  })
}

export const useSetPermissionHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({assi_id} : {assi_id: string}) => setPermissionHealth(assi_id),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['allAssignedFeaturesHealth']})
  })
}

export const useAddStaffHealth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({residentId, positionId, staffId} : {
      residentId: string;
      positionId: string;
      staffId: string;
    }) => addStaffHealth(residentId, positionId, staffId),
    onSuccess: (newData) => {

      if(!newData) return;
      
      queryClient.setQueryData(["staffsHealth"], (old: any[] = []) => [ 
        ...old,
        newData,
      ]);

      queryClient.invalidateQueries({queryKey: ['staffsHealth']})

      // Deliver feedback
      toast("Record added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });

      navigate(-1)
    }
  });
}
export const useAddPositionBulkHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      try {
        const res = await api2.post('administration/position/bulk/create/', data);
        return res.data;
      } catch(err) {
        console.error(err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['positionsHealth']})
    }
  })
}