// Survey validation utilities

/**
 * Prepares survey data for submission to the API
 */
export function prepareSurveyDataForSubmission(surveyData: any, familyId: string) {
  if (!surveyData || !familyId) {
    console.warn('Invalid survey data: missing survey data or family ID');
    return null;
  }

  // Transform the survey data to match backend API expectations
  // The backend expects frontend field names, not backend model field names
  const payload: Record<string, any> = {
    fam_id: familyId, // Use fam_id as expected by backend
    
    // Map frontend fields to what the backend view expects
    filledBy: surveyData.filledBy || surveyData.si_filled_by || '',
    informant: surveyData.informant || surveyData.si_informant || '',
    checkedBy: surveyData.checkedBy || surveyData.si_checked_by || '',
    date: surveyData.date || surveyData.si_date || new Date().toISOString().split('T')[0],
    signature: surveyData.signature || surveyData.si_signature || ''
  };

  // Validate that required fields are not empty
  if (!payload.informant) {
    console.error('Survey validation error: informant is required');
    return null;
  }
  
  if (!payload.checkedBy) {
    console.error('Survey validation error: checkedBy is required');
    return null;
  }
  
  if (!payload.date) {
    console.error('Survey validation error: date is required');
    return null;
  }
  
  if (!payload.signature) {
    console.error('Survey validation error: signature is required');
    return null;
  }

  console.log('Prepared survey payload:', payload);

  return payload;
}

/**
 * Validates survey data
 */
export function validateSurveyData(surveyData: any) {
  const errors: string[] = [];

  if (!surveyData) {
    errors.push('Survey data is required');
    return { isValid: false, errors };
  }

  // Required fields validation based on frontend form fields
  if (!surveyData.informant && !surveyData.si_informant) {
    errors.push('Informant name is required');
  }

  if (!surveyData.checkedBy && !surveyData.si_checked_by) {
    errors.push('Checked by field is required');
  }

  if (!surveyData.date && !surveyData.si_date) {
    errors.push('Survey date is required');
  } else {
    // Validate date format and range
    const dateValue = surveyData.date || surveyData.si_date;
    const date = new Date(dateValue);
    const today = new Date();
    
    if (date > today) {
      errors.push('Survey date cannot be in the future');
    }
  }

  if (!surveyData.signature && !surveyData.si_signature) {
    errors.push('Signature is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
