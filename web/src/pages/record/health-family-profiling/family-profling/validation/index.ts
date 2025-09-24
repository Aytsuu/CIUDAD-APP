// Main validation functions for family profiling form

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  errorMessages: string[];
}

export interface Step4ValidationResult {
  isValid: boolean;
  environmental: ValidationResult;
  ncd: ValidationResult;
  tb: ValidationResult;
  allErrors: string[];
}

export interface Step5ValidationResult {
  isValid: boolean;
  survey: ValidationResult;
  allErrors: string[];
}

export interface FullValidationResult {
  isValid: boolean;
  step4: Step4ValidationResult;
  step5: Step5ValidationResult;
  allErrors: string[];
}

export interface GroupedValidationErrors {
  environmentalCount: number;
  ncdCount: number;
  tbCount: number;
  surveyCount: number;
  totalCount: number;
}

/**
 * Validates Step 4 (Environmental, NCD, TB forms)
 */
export function validateStep4(formData: any): Step4ValidationResult {
  const environmentalErrors: string[] = [];
  const ncdErrors: string[] = [];
  const tbErrors: string[] = [];
  
  // Debug logging for form data structure
  console.log('=== VALIDATION DEBUG START ===');
  console.log('Full form data:', formData);
  console.log('NCD Records:', formData?.ncdRecords);
  console.log('TB Records:', formData?.tbRecords);
  console.log('Environmental Form:', formData?.environmentalForm);
  
  // Validate environmental form
  const envForm = formData?.environmentalForm;
  if (!envForm?.waterSupply) {
    environmentalErrors.push("Water supply selection is required");
  }
  if (!envForm?.facilityType) {
    environmentalErrors.push("Sanitary facility type is required");
  }
  if (!envForm?.wasteManagement) {
    environmentalErrors.push("Waste management type is required");
  }
  if (envForm?.wasteManagement === "others" && !envForm?.wasteManagementOthers) {
    environmentalErrors.push("Please specify other waste management type");
  }
  
  // Validate NCD records (optional - only validate if records exist)
  const ncdRecords = formData?.ncdRecords?.list || [];
  if (ncdRecords.length > 0) {
    ncdRecords.forEach((record: any, index: number) => {
      // Check if record has a resident ID (could be resident_id or id field)
      const hasResidentId = record?.resident_id || record?.id || record?.rp_id;
      if (!hasResidentId) {
        ncdErrors.push(`NCD record ${index + 1}: Resident selection is required`);
      }
      
      // Check if record has at least some NCD data
      const hasNCDData = record?.ncdFormSchema || 
                        record?.ncd_riskclass_age || 
                        record?.ncd_comorbidities || 
                        record?.ncd_lifestyle_risk || 
                        record?.ncd_maintenance_status;
      
      if (hasResidentId && !hasNCDData) {
        ncdErrors.push(`NCD record ${index + 1}: At least one NCD field must be filled`);
      }
    });
  }
  
  // Validate TB records (optional - only validate if records exist)  
  const tbRecords = formData?.tbRecords?.list || [];
  if (tbRecords.length > 0) {
    tbRecords.forEach((record: any, index: number) => {
      // Check if record has a resident ID (could be resident_id or id field)
      const hasResidentId = record?.resident_id || record?.id || record?.rp_id;
      if (!hasResidentId) {
        tbErrors.push(`TB record ${index + 1}: Resident selection is required`);
      }
      
      // Check if record has at least some TB data
      const hasTBData = record?.tbSurveilanceSchema || 
                       record?.tb_meds_source || 
                       record?.tb_days_taking_meds || 
                       record?.tb_status;
      
      if (hasResidentId && !hasTBData) {
        tbErrors.push(`TB record ${index + 1}: At least one TB field must be filled`);
      }
    });
  }
  
  const allErrors = [...environmentalErrors, ...ncdErrors, ...tbErrors];
  
  // Debug logging for validation results
  console.log('=== VALIDATION RESULTS ===');
  console.log('Environmental errors:', environmentalErrors);
  console.log('NCD errors:', ncdErrors);
  console.log('TB errors:', tbErrors);
  console.log('All errors:', allErrors);
  console.log('=== VALIDATION DEBUG END ===');
  
  return {
    isValid: allErrors.length === 0,
    environmental: {
      isValid: environmentalErrors.length === 0,
      errors: environmentalErrors,
      errorMessages: environmentalErrors
    },
    ncd: {
      isValid: ncdErrors.length === 0,
      errors: ncdErrors,
      errorMessages: ncdErrors
    },
    tb: {
      isValid: tbErrors.length === 0,
      errors: tbErrors,
      errorMessages: tbErrors
    },
    allErrors
  };
}

/**
 * Validates Step 5 (Survey form)
 */
export function validateStep5(surveyData: any): Step5ValidationResult {
  const surveyErrors: string[] = [];
  
  // Basic survey validation - check if required fields exist
  if (!surveyData) {
    surveyErrors.push("Survey data is required");
  } else {
    // Check for informant (required field)
    if (!surveyData.si_informant && !surveyData.informant) {
      surveyErrors.push("Informant name is required");
    }
    
    // Check for checked by (required field)
    if (!surveyData.si_checked_by && !surveyData.checkedBy) {
      surveyErrors.push("Checked by field is required");
    }
    
    // Check for date (required field)
    if (!surveyData.si_date && !surveyData.date) {
      surveyErrors.push("Survey date is required");
    }
  }
  
  return {
    isValid: surveyErrors.length === 0,
    survey: {
      isValid: surveyErrors.length === 0,
      errors: surveyErrors,
      errorMessages: surveyErrors
    },
    allErrors: surveyErrors
  };
}

/**
 * Validates all form data before final submission
 */
export function validateForSubmission(formData: any, surveyData: any): FullValidationResult {
  const step4Result = validateStep4(formData);
  const step5Result = validateStep5(surveyData);
  
  const allErrors = [...step4Result.allErrors, ...step5Result.allErrors];
  
  return {
    isValid: step4Result.isValid && step5Result.isValid,
    step4: step4Result,
    step5: step5Result,
    allErrors
  };
}

/**
 * Groups validation errors by category for better user feedback
 */
export function groupValidationErrors(validationResult: FullValidationResult): GroupedValidationErrors {
  const environmentalCount = validationResult.step4?.environmental?.errors?.length || 0;
  const ncdCount = validationResult.step4?.ncd?.errors?.length || 0;
  const tbCount = validationResult.step4?.tb?.errors?.length || 0;
  const surveyCount = validationResult.step5?.survey?.errors?.length || 0;
  
  return {
    environmentalCount,
    ncdCount,
    tbCount,
    surveyCount,
    totalCount: environmentalCount + ncdCount + tbCount + surveyCount
  };
}
