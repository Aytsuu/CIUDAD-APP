import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addAccount } from "../restful-api/accountPostAPI";
import { addAccountHealth } from "../restful-api/accountHealthPostAPI";
import { CircleCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// export const useAddAccount = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({accountInfo, residentId} : {
//       accountInfo: Record<string, string>
//       residentId: string
//     }) => addAccount(accountInfo, residentId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({queryKey: ["residents"]});
//       toast("Account created successfully", {
//         icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
//       });
//     }
//   })
// }
// export const useAddAccountHealth = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({accountInfo, residentId} : {
//       accountInfo: Record<string, string>
//       residentId: string
//     }) => addAccountHealth(accountInfo, residentId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({queryKey: ["residents"]});
//       toast("Account created successfully", {
//         icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
//       });
//     }
//   })
// }
export const useAddAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({accountInfo, residentId} : {
      accountInfo: Record<string, string>
      residentId: string
    }) => {
      // Add logging to debug the payload
      console.log('Sending account data:', { accountInfo, residentId });
      return addAccount(accountInfo, residentId);
    },
    onSuccess: (data) => {
      console.log('Account creation successful:', data);
      queryClient.invalidateQueries({queryKey: ["residents"]});
      toast("Account created successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
      });
    },
    onError: (error: any) => {
      console.error('Account creation failed:', error);
      
      // Enhanced error handling
      let errorMessage = "Failed to create account";
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            errorMessage = `Invalid data: ${data?.message || 'Please check your input'}`;
            console.error('Validation errors:', data);
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          case 404:
            errorMessage = "API endpoint not found";
            break;
          default:
            errorMessage = `Server error (${status})`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Cannot connect to server. Please check if the server is running.";
      }
      
      toast(errorMessage, {
        icon: <AlertCircle size={24} className="fill-red-500 stroke-white" />
      });
    }
  });
};

export const useAddAccountHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({accountInfo, residentId} : {
      accountInfo: Record<string, string>
      residentId: string
    }) => {
      // Add logging to debug the payload
      console.log('Sending health account data:', { accountInfo, residentId });
      return addAccountHealth(accountInfo, residentId);
    },
    onSuccess: (data) => {
      console.log('Health account creation successful:', data);
      queryClient.invalidateQueries({queryKey: ["residents"]});
      toast("Health account created successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
      });
    },
    onError: (error: any) => {
      console.error('Health account creation failed:', error);
      
      // Enhanced error handling
      let errorMessage = "Failed to create health account";
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            errorMessage = `Invalid data: ${data?.message || 'Please check your input'}`;
            console.error('Validation errors:', data);
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          case 404:
            errorMessage = "API endpoint not found";
            break;
          default:
            errorMessage = `Server error (${status})`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Cannot connect to server. Please check if the server is running.";
      }
      
      toast(errorMessage, {
        icon: <AlertCircle size={24} className="fill-red-500 stroke-white" />
      });
    }
  });
};

// Utility function to check server connectivity
export const checkServerStatus = async () => {
  const servers = [
    'http://localhost:8000',
    'http://localhost:8001'
  ];
  
  const results = await Promise.allSettled(
    servers.map(async (url) => {
      try {
        const response = await fetch(`${url}/health`, { 
          method: 'GET',
          // Removed unsupported timeout property
        });
        return { url, status: 'online', statusCode: response.status };
      } catch (error) {
        return { url, status: 'offline', error: (error as Error).message };
      }
    })
  );
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`Server ${servers[index]}:`, result.value);
    } else {
      console.error(`Failed to check ${servers[index]}:`, result.reason);
    }
  });
  
  return results;
};