// NCD (Non-Communicable Disease) validation utilities

/**
 * Prepares NCD record data for submission to the API
 */
export function prepareNCDRecordForSubmission(ncdRecord: any) {
  if (!ncdRecord || !ncdRecord.id) {
    console.warn('Invalid NCD record: missing id (resident ID)');
    console.log('NCD record received:', ncdRecord);
    return null;
  }

  // Extract the nested ncdFormSchema data
  const ncdData = ncdRecord.ncdFormSchema;
  if (!ncdData) {
    console.warn('Invalid NCD record: missing ncdFormSchema');
    console.log('NCD record received:', ncdRecord);
    return null;
  }

  // Transform the record to match backend API expectations
  const payload: Record<string, any> = {
    rp_id: ncdRecord.id, // Use the resident ID from the form
    
    // Map form field names to backend model field names
    ncd_riskclass_age: ncdData.riskClassAgeGroup || '',
    ncd_comorbidities: ncdData.comorbidities || '', // Direct value from combobox (from DB or custom)
    ncd_lifestyle_risk: ncdData.lifestyleRisk === "Others" && ncdData.lifestyleRiskOthers
      ? ncdData.lifestyleRiskOthers
      : ncdData.lifestyleRisk || '',
    ncd_maintenance_status: ncdData.inMaintenance || 'no'
  };

  console.log('Prepared NCD payload:', payload);

  // Don't remove empty values as the backend handles optional fields
  return payload;
}

/**
 * Validates NCD record data
 */
export function validateNCDRecord(ncdRecord: any) {
  const errors: string[] = [];

  if (!ncdRecord) {
    errors.push('NCD record is required');
    return { isValid: false, errors };
  }

  if (!ncdRecord.id) {
    errors.push('Resident selection is required');
  }

  const ncdData = ncdRecord.ncdFormSchema;
  if (!ncdData) {
    errors.push('NCD form data is missing');
    return { isValid: false, errors };
  }

  // Check if at least one NCD field has meaningful data
  const hasRiskClassAge = ncdData.riskClassAgeGroup;
  const hasComorbidities = ncdData.comorbidities;
  const hasLifestyleRisk = ncdData.lifestyleRisk;
  const hasMaintenanceStatus = ncdData.inMaintenance;

  if (!hasRiskClassAge && !hasComorbidities && !hasLifestyleRisk && !hasMaintenanceStatus) {
    errors.push('At least one NCD field must be provided');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
