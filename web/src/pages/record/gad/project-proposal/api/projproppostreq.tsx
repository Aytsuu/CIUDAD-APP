import { api } from "@/api/api";
import { SupportDocInput, ProjectProposalInput, prepareProposalPayload } from "../projprop-types";


// export const postProjectProposal = async (proposalData: ProjectProposalInput) => {
//   const cleanedPayload = prepareProposalPayload(proposalData);
  
//   const response = await api.post('/gad/project-proposals/', cleanedPayload, {
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
//   return response.data;
// };

export const postProjectProposal = async (proposalData: ProjectProposalInput) => {
  const cleanedPayload = prepareProposalPayload(proposalData);
  
  console.log("=== API Request Debug ===");
  console.log("Original payload:", proposalData);
  console.log("Cleaned payload:", cleanedPayload);
  console.log("Request URL:", '/gad/project-proposals/');
  
  try {
    const response = await api.post('/gad/project-proposals/', cleanedPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log("Response success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("=== API Request Error ===");
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    console.error("Error headers:", error.response?.headers);
    console.error("Full error:", error);
    throw error;
  }
};

export const addSupportDocuments = async (fileData: SupportDocInput) => {
  if (!fileData.gpr_id) {
    throw new Error("Project proposal ID is required");
  }
  const response = await api.post(
    `/gad/project-proposals/${fileData.gpr_id}/support-docs/`, 
    fileData
  );
  return response.data;
};