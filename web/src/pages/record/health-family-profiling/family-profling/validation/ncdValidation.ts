// NCD (Non-Communicable Disease) validation utilities

/**
 * Prepares NCD record data for submission to the API
 */
export function prepareNCDRecordForSubmission(ncdRecord: any) {
  if (!ncdRecord || !ncdRecord.resident_id) {
    console.warn('Invalid NCD record: missing resident_id');
    return null;
  }

  // Transform the record to match backend API expectations
  const payload: Record<string, any> = {
    rp_id: ncdRecord.resident_id, // Map resident_id to rp_id for backend
    
    // Map form field names to backend model field names
    ncd_riskclass_age: ncdRecord.ncd_riskclass_age || ncdRecord.risk_class_age || '',
    ncd_comorbidities: ncdRecord.ncd_comorbidities || ncdRecord.comorbidities || '',
    ncd_lifestyle_risk: ncdRecord.ncd_lifestyle_risk || ncdRecord.lifestyle_risk || '',
    ncd_maintenance_status: ncdRecord.ncd_maintenance_status || ncdRecord.maintenance_status || 'NO'
  };

  // Remove empty string values to prevent validation errors
  Object.keys(payload).forEach(key => {
    if (payload[key] === '' && key !== 'rp_id') {
      delete payload[key];
    }
  });

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

  if (!ncdRecord.resident_id) {
    errors.push('Resident selection is required');
  }

  // Check if at least one NCD field has meaningful data
  const hasRiskClassAge = ncdRecord.ncd_riskclass_age || ncdRecord.risk_class_age;
  const hasComorbidities = ncdRecord.ncd_comorbidities || ncdRecord.comorbidities;
  const hasLifestyleRisk = ncdRecord.ncd_lifestyle_risk || ncdRecord.lifestyle_risk;
  const hasMaintenanceStatus = ncdRecord.ncd_maintenance_status || ncdRecord.maintenance_status;

  if (!hasRiskClassAge && !hasComorbidities && !hasLifestyleRisk && !hasMaintenanceStatus) {
    errors.push('At least one NCD field must be provided');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
