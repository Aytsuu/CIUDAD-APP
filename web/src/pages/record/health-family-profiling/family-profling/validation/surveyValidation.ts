// Survey validation utilities

// Helper function to format date to YYYY-MM-DD format expected by Django DateField
function formatDateForBackend(dateValue: any): string {
  if (!dateValue) return new Date().toISOString().split('T')[0];
  
  // If it's already a string in YYYY-MM-DD format, return as is
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }
  
  // Convert to Date object and format to YYYY-MM-DD
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) {
    // If invalid date, use current date
    return new Date().toISOString().split('T')[0];
  }
  
  return date.toISOString().split('T')[0];
}

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
    date: formatDateForBackend(surveyData.date || surveyData.si_date || new Date()),
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
  console.log('Formatted date for backend:', payload.date);

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
