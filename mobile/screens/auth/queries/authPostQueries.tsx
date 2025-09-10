import { useMutation } from "@tanstack/react-query";
import { addAccount, addAddress, addPersonal, addPersonalAddress, addRequest } from "../rest-api/authPostAPI";
import { api } from "@/api/api";
import { useRouter } from "expo-router";
import { useToastContext } from "@/components/ui/toast";

export const useAddAddress = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>[]) => addAddress(data)
  })
}

export const useAddPerAddress = () => {
  return useMutation({
    mutationFn: ({data, staff_id, history_id} : {
      data: Record<string, any>[], 
      staff_id?: string,
      history_id?: string
    }) => addPersonalAddress(data, staff_id, history_id)
  })
}

export const useAddPersonal = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>) => addPersonal(data),
    onSuccess: () => {}
  })
}

export const useAddRequest = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>) => addRequest(data),
    onSuccess: () => {}
  })
}

export const useValidateResident = () => {
  const { toast } = useToastContext();
  return useMutation({
    mutationFn: async ({rp_id, personal_info} : {
      rp_id?: string
      personal_info?: Record<string, any>
    }) => {
      try {
        const res = await api.post('profiling/request/link/registration/', {
          rp_id: rp_id,
          personal_info: personal_info,
        });
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    onError: (error: any) => {
      if (error?.response?.status === 404) {
        toast.error("Resident Profile not found.");
      } else if (error?.response?.status === 409) {
        toast.error("An account already exists for this profile.");
      }
    }
  });
};

export const useAddAccount = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: Record<string, any>) => addAccount(data)
  })
}

export const useAddBusinessRespondent = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      try {
        const res = await api.post('profiling/business/respondent/create/', data);
        return res.data;
      } catch (err ) {
        throw err;
      }
    }
  })
}

// export const useVerifyBusinessRespondent = () => {
//   const { toast } = useToastContext();
//   return useMutation({
//     mutationFn: async ({br_id, personal_info} : {
//       br_id?: string 
//       personal_info?: Record<string, any>
//     }) => {
//       try {
//         const res = await api.post("profiling/business/verify/account-creation/", {
//           br_id: br_id,
//           personal_info: personal_info
//         });

//         return res.data;
//       } catch (err) {
//         throw err;
//       }
//     },
//     onError: (error: any) => {
//       if (error?.response?.status === 404) {
//         toast.error("Business Respondent not found.");
//       } else if (error?.response?.status === 409) {
//         toast.error("An account already exists for this profile.");
//       }
//     }
//   })
// }

export const useVerifyFamily = () => {
  const { toast } = useToastContext();
  return useMutation({
    mutationFn: async (fam_id: string) => {
      try {
        const res = await api.post("profiling/family/verify/account-creation/", {
          fam_id: fam_id
        })
      } catch (err) {
        throw err;
      }
    },
    onError: (error: any) => {
      if (error?.response?.status === 404) {
        toast.error("Family with this ID does not exist.");
      }
    }
  })
}

export const useSendOTP = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      try {
        const res = await api.post("account/phone-verification", data)
        return res.data
      } catch (err) {
        console.error(err);
        throw err
      }
    }
  })
}