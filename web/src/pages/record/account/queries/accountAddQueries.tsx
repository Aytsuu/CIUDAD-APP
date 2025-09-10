import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addAccount } from "../restful-api/accountPostAPI";

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
    }
  })
}
