// TB (Tuberculosis) validation utilities

/**
 * Prepares TB record data for submission to the API
 */
export function prepareTBRecordForSubmission(tbRecord: any) {
  if (!tbRecord || !tbRecord.resident_id) {
    console.warn('Invalid TB record: missing resident_id');
    return null;
  }

  // Transform the record to match backend API expectations
  const payload: Record<string, any> = {
    rp_id: tbRecord.resident_id, // Map resident_id to rp_id for backend
    
    // Map form field names to backend model field names
    tb_meds_source: tbRecord.tb_meds_source || tbRecord.meds_source || '',
    tb_days_taking_meds: tbRecord.tb_days_taking_meds || tbRecord.days_taking_meds || 0,
    tb_status: tbRecord.tb_status || tbRecord.status || ''
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
 * Validates TB record data
 */
export function validateTBRecord(tbRecord: any) {
  const errors: string[] = [];

  if (!tbRecord) {
    errors.push('TB record is required');
    return { isValid: false, errors };
  }

  if (!tbRecord.resident_id) {
    errors.push('Resident selection is required');
  }

  // Basic validation for required TB fields
  if (!tbRecord.tb_status && !tbRecord.status) {
    errors.push('TB status is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
