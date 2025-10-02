// Environmental validation utilities

/**
 * Validates environmental form data
 */
export function validateEnvironmentalForm(environmentalData: any) {
  const errors: string[] = [];

  if (!environmentalData) {
    errors.push('Environmental data is required');
    return { isValid: false, errors };
  }

  // Water supply validation
  if (!environmentalData.waterSupply) {
    errors.push('Water supply type is required');
  } else {
    const validWaterSupplies = ['level1', 'level2', 'level3'];
    if (!validWaterSupplies.includes(environmentalData.waterSupply)) {
      errors.push('Invalid water supply type selected');
    }
  }

  // Sanitary facility validation
  if (!environmentalData.facilityType) {
    errors.push('Sanitary facility type is required');
  }

  if (!environmentalData.toiletFacilityType) {
    errors.push('Toilet facility type is required');
  }

  // Waste management validation
  if (!environmentalData.wasteManagement) {
    errors.push('Waste management type is required');
  } else if (environmentalData.wasteManagement === 'others') {
    if (!environmentalData.wasteManagementOthers || environmentalData.wasteManagementOthers.trim() === '') {
      errors.push('Please specify the other waste management type');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Prepares environmental data for submission
 */
export function prepareEnvironmentalDataForSubmission(environmentalData: any, householdId: string) {
  if (!environmentalData || !householdId) {
    console.warn('Invalid environmental data: missing data or household ID');
    return null;
  }

  const payload = {
    household_id: householdId,
    
    // Water supply information
    water_supply: environmentalData.waterSupply ? {
      type: environmentalData.waterSupply
    } : undefined,
    
    // Sanitary facility information
    sanitary_facility: (environmentalData.facilityType || environmentalData.toiletFacilityType) ? {
      facility_type: environmentalData.facilityType || '',
      toilet_facility_type: environmentalData.toiletFacilityType || ''
    } : undefined,
    
    // Waste management information
    waste_management: environmentalData.wasteManagement ? {
      waste_management_type: environmentalData.wasteManagement === "others"
        ? environmentalData.wasteManagementOthers || ""
        : environmentalData.wasteManagement,
      description: environmentalData.wasteManagement === "others" 
        ? environmentalData.wasteManagementOthers 
        : undefined
    } : undefined
  };

  // Remove undefined properties
  Object.keys(payload).forEach(key => {
    if (payload[key as keyof typeof payload] === undefined) {
      delete payload[key as keyof typeof payload];
    }
  });

  return payload;
}
