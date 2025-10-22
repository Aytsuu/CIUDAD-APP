// TB (Tuberculosis) validation utilities

/**
 * Prepares TB record data for submission to the API
 */
export function prepareTBRecordForSubmission(tbRecord: any) {
  if (!tbRecord || !tbRecord.id) {
    console.warn('Invalid TB record: missing id (resident ID)');
    console.log('TB record received:', tbRecord);
    return null;
  }

  // Extract the nested tbSurveilanceSchema data
  const tbData = tbRecord.tbSurveilanceSchema;
  if (!tbData) {
    console.warn('Invalid TB record: missing tbSurveilanceSchema');
    console.log('TB record received:', tbRecord);
    return null;
  }

  // Transform the record to match backend API expectations
  const payload: Record<string, any> = {
    rp_id: tbRecord.id, // Use the resident ID from the form
    
    // Map form field names to backend model field names
    tb_meds_source: tbData.srcAntiTBmeds === "Others" && tbData.srcAntiTBmedsOthers 
      ? tbData.srcAntiTBmedsOthers 
      : tbData.srcAntiTBmeds || '',
    tb_days_taking_meds: parseInt(tbData.noOfDaysTakingMeds) || 0,
    tb_status: tbData.tbStatus || ''
  };

  console.log('Prepared TB payload:', payload);

  // Don't remove empty values as the backend handles optional fields
  return payload;
}

/**
 * Validates TB record data
 */
export function validateTBRecord(tbRecord: any) {
  const errors: string[] = [];

  if (!tbRecord) {
    errors.push('TB record is required');
    return { isValid: false, errors };
  }

  if (!tbRecord.id) {
    errors.push('Resident selection is required');
  }

  const tbData = tbRecord.tbSurveilanceSchema;
  if (!tbData) {
    errors.push('TB form data is missing');
    return { isValid: false, errors };
  }

  // Basic validation for required TB fields
  if (!tbData.tbStatus) {
    errors.push('TB status is required');
  }

  if (!tbData.srcAntiTBmeds) {
    errors.push('Source of anti-TB medication is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
