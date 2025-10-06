import { api } from "@/api/api";

// Fetch permit clearances
export const getPermitClearances = async () => {
    try {
        const response = await api.get('/clerk/permit-clearances/');
        return response.data;
    } catch (error: any) {
        console.error("Failed to fetch permit clearances:", error);
        throw new Error(error.response?.data?.detail || "Failed to fetch permit clearances");
    }
};

export const getResidents = async () => {
  try {
    const response = await api.get('/treasurer/resident-names/');
    return response.data;
  } catch (error) {
    console.error("Failed to search residents:", error);
    throw new Error("Failed to search residents");
  }
};

export const getGrossSales = async () => {
  try {
    const response = await api.get('treasurer/annual-gross-sales-active/');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch gross sales:", error);
    throw new Error("Failed to fetch gross sales");
  }
};

export const getBusinesses = async () => {
  try {
    const response = await api.get('/profiling/business/active/list/table/', {
      params: {
        page: 1,
        page_size: 1000, // Get all businesses
        search: ''
      }
    });
    
    const businesses = response.data.results || response.data;
    console.log("Fetched businesses:", businesses);
    
    // The business table already has address data through the 'add' relationship
    // We'll construct addresses directly from the business data
    console.log("Using business table address data dynamically");
    
    // Fetch business respondents and personal data
    let requestorMapping: { [key: number]: any } = {};
    
    try {
      // Fetch business respondents
      const respondentResponse = await api.get('/profiling/business/respondent/list/table/');
      const businessRespondents = respondentResponse.data.results || respondentResponse.data;
      
      // Fetch personal data for all per_ids
      const personalIds = businessRespondents.map((br: any) => br.per_id).filter(Boolean);
      
      if (personalIds.length > 0) {
        const personalResponse = await api.get('/profiling/personal/', {
          params: {
            per_ids: personalIds.join(',')
          }
        });
        const personalData = personalResponse.data.results || personalResponse.data;
        
        // Create mapping of per_id to personal data
        const personalMapping: { [key: number]: any } = {};
        personalData.forEach((person: any) => {
          personalMapping[person.per_id] = person;
        });
        
        // Create mapping of br_id to requestor data
        businessRespondents.forEach((br: any) => {
          if (br.per_id && personalMapping[br.per_id]) {
            const person = personalMapping[br.per_id];
            requestorMapping[br.br_id] = {
              per_id: br.per_id,
              per_fname: person.per_fname,
              per_lname: person.per_lname,
              per_mname: person.per_mname,
              full_name: `${person.per_fname} ${person.per_lname}`.trim()
            };
          }
        });
      }
      
      console.log("Fetched requestor mapping:", requestorMapping);
    } catch (requestorError) {
      console.warn("Could not fetch requestor data:", requestorError);
    }
    
    const businessesWithAddresses = businesses.map((business: any) => {
      console.log("Processing business:", business.bus_name, "with add_id:", business.add_id, "br_id:", business.br_id);
      
      // Prefer backend-provided business location if available
      const fullAddress = business.bus_location || '';
      if (!fullAddress) {
        console.log("No bus_location available for:", business.bus_name);
      }
      
      // Get requestor data
      let requestor = '';
      if (business.br_id && requestorMapping[business.br_id]) {
        requestor = requestorMapping[business.br_id].full_name;
        console.log("Using dynamic requestor data:", requestor);
      }
      
      return {
        ...business,
        address: fullAddress,
        requestor: requestor
      };
    });
    
    console.log("Final businesses with addresses and requestors:", businessesWithAddresses);
    return businessesWithAddresses;
  } catch (error) {
    console.error("Failed to search businesses:", error);
    throw new Error("Failed to search businesses");
  }
};

export const getPermitPurposes = async () => {
  try {
    const response = await api.get('/treasurer/purpose-and-rate/');
    return response.data;
  } catch (error) {
    console.error("Failed to search permit purposes:", error);
    throw new Error("Failed to search permit purposes");
  }
};

// Fetch annual gross sales data (moved from component)
export const getAnnualGrossSalesForPermit = async () => {
  try {
    const response = await api.get('treasurer/annual-gross-sales-active/');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch annual gross sales:", error);
    throw new Error("Failed to fetch annual gross sales");
  }
};

// Fetch purposes and rates data (moved from component)
export const getPurposesAndRates = async () => {
  try {
    const response = await api.get('treasurer/purpose-and-rate/');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch purposes and rates:", error);
    throw new Error("Failed to fetch purposes and rates");
  }
};

// Fetch business permit files by bpr_id
export const getBusinessPermitFiles = async (bprId: string) => {
  try {
    const response = await api.get(`/clerk/business-permit-files/${bprId}/`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch business permit files:", error);
    throw new Error("Failed to fetch business permit files");
  }
};
