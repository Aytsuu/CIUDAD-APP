import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { UseFormReturn, Controller } from 'react-hook-form';
import { HealthFamilyProfilingFormData } from '@/form-schema/health-family-profiling-schema';
import { SignatureCanvasComponent } from '@/components/ui/signature-canvas';
import { Calendar, Info, UserCheck, Users, ClipboardCheck } from 'lucide-react-native';
import { useHealthStaffList, useGetFamilyMembers } from '../../queries/healthProfilingQueries';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { ResponsiveFormContainer, useResponsiveForm } from '@/components/healthcomponents/ResponsiveFormContainer';

interface SurveyStepProps {
  form: UseFormReturn<HealthFamilyProfilingFormData>;
  onNext?: () => void;
  onBack?: () => void;
  famId?: string;
  respondentInfo?: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
  };
}

export const SurveyStep: React.FC<SurveyStepProps> = ({ form, onNext, onBack, famId, respondentInfo }) => {
  const responsive = useResponsiveForm();

  // Set current date on mount
  React.useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0];
    if (!form.getValues('surveyForm.date')) {
      form.setValue('surveyForm.date', currentDate);
    }
  }, [form]);

  // Fetch health staff and family members
  const { data: healthStaffData, isLoading: isLoadingStaff } = useHealthStaffList();
  const { data: familyMembersData, isLoading: isLoadingMembers } = useGetFamilyMembers(famId || '');

  // Format health staff for dropdown
  const healthStaffOptions = useMemo(() => {
    if (!healthStaffData) return [];
    return healthStaffData.map((staff: any) => ({
      label: `${staff.staff_id} ${staff.fname} ${staff.lname}`,
      value: `${staff.staff_id} ${staff.fname} ${staff.lname}`,
    }));
  }, [healthStaffData]);

  // Format family members for dropdown - handle paginated response and parse names
  const familyMemberOptions = useMemo(() => {
    console.log('SurveyStep - Raw family members data:', familyMembersData);
    
    // Handle paginated response: {count, next, previous, results: [...]}
    let members = familyMembersData;
    if (familyMembersData && !Array.isArray(familyMembersData)) {
      members = familyMembersData.results || [];
      console.log('SurveyStep - Extracted results from paginated response:', members);
    }
    
    if (!members || !Array.isArray(members)) {
      console.log('SurveyStep - No valid members array');
      return [];
    }
    
    return members.map((member: any) => {
      // Parse the name field: "LASTNAME, FIRSTNAME MIDDLENAME"
      let firstName = '';
      let lastName = '';
      let middleName = '';
      
      if (member.name) {
        const [lastNamePart, ...restParts] = member.name.split(', ');
        lastName = lastNamePart?.trim() || '';
        
        if (restParts.length > 0) {
          const nameParts = restParts.join(', ').trim().split(' ');
          firstName = nameParts[0] || '';
          middleName = nameParts.slice(1).join(' ') || '';
        }
      }
      
      const rpId = member.rp_id || member.id || '';
      const fullName = `${firstName} ${middleName} ${lastName}`.trim();
      
      console.log('SurveyStep - Formatted member:', { rpId, firstName, lastName, middleName, fullName });
      
      return {
        label: `${rpId} - ${fullName}`,
        value: `${rpId} - ${fullName}`,
      };
    });
  }, [familyMembersData]);

  // Auto-populate informant with respondent info (like web version)
  React.useEffect(() => {
    if (respondentInfo && !form.getValues('surveyForm.informant')) {
      const fullName = `${respondentInfo.firstName} ${respondentInfo.middleName || ''} ${respondentInfo.lastName}`.trim();
      const informantValue = `${respondentInfo.id} - ${fullName}`;
      console.log('SurveyStep - Auto-populating informant with respondent:', informantValue);
      form.setValue('surveyForm.informant', informantValue);
    }
  }, [respondentInfo, form]);

  if (isLoadingStaff || isLoadingMembers) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={[styles.loadingText, { fontSize: responsive.fontSize }]}>
          Loading survey form...
        </Text>
      </View>
    );
  }

  return (
    <ResponsiveFormContainer showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={[styles.headerContainer, { marginBottom: responsive.sectionMargin }]}>
        <Text style={[styles.title, { fontSize: responsive.isSmallDevice ? 20 : 24 }]}>
          Survey Identification
        </Text>
        <Text style={[styles.subtitle, { fontSize: responsive.bodyTextSize, marginTop: 8 }]}>
          Provide surveyor information and signature
        </Text>
      </View>

      {/* Staff Information Card */}
      <View style={[styles.card, { padding: responsive.cardPadding, marginBottom: responsive.marginBottom }]}>
        <View style={styles.cardHeader}>
          <UserCheck size={responsive.iconSize} color="#3B82F6" />
          <Text style={[styles.cardTitle, { fontSize: responsive.headingSize, marginLeft: 8 }]}>
            Staff Information
          </Text>
        </View>

        {/* Profiled by (B/CHW) */}
        <View style={[styles.fieldContainer, { marginTop: responsive.marginBottom }]}>
          <Text style={[styles.label, { fontSize: responsive.smallTextSize, marginBottom: 8 }]}>
            Profiled by: <Text style={styles.required}>*</Text>
            <Text style={styles.labelHint}> (B/CHW)</Text>
          </Text>
          <Controller
            control={form.control}
            name="surveyForm.filledBy"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <CustomDropdown
                  data={healthStaffOptions}
                  value={value}
                  onSelect={onChange}
                  placeholder="Select health staff"
                />
                {error && (
                  <Text style={[styles.errorText, { fontSize: responsive.smallTextSize - 1 }]}>
                    {error.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>

        {/* Checked by (RN/RM) */}
        <View style={[styles.fieldContainer, { marginTop: responsive.marginBottom }]}>
          <Text style={[styles.label, { fontSize: responsive.smallTextSize, marginBottom: 8 }]}>
            Checked by (RN/RM): <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={form.control}
            name="surveyForm.checkedBy"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <CustomDropdown
                  data={healthStaffOptions}
                  value={value}
                  onSelect={onChange}
                  placeholder="Select health staff"
                />
                {error && (
                  <Text style={[styles.errorText, { fontSize: responsive.smallTextSize - 1 }]}>
                    {error.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
      </View>

      {/* Family Information Card */}
      <View style={[styles.card, { padding: responsive.cardPadding, marginBottom: responsive.marginBottom }]}>
        <View style={styles.cardHeader}>
          <Users size={responsive.iconSize} color="#10B981" />
          <Text style={[styles.cardTitle, { fontSize: responsive.headingSize, marginLeft: 8 }]}>
            Family Representative
          </Text>
        </View>

        {/* Informant/Conforme */}
        <View style={[styles.fieldContainer, { marginTop: responsive.marginBottom }]}>
          <Text style={[styles.label, { fontSize: responsive.smallTextSize, marginBottom: 8 }]}>
            Informant/Conforme: <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={form.control}
            name="surveyForm.informant"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <CustomDropdown
                  data={familyMemberOptions}
                  value={value}
                  onSelect={onChange}
                  placeholder={familyMemberOptions.length > 0 ? "Select family member" : "No family members found"}
                />
                {familyMemberOptions.length === 0 && (
                  <Text style={[styles.infoText, { fontSize: responsive.smallTextSize - 1, marginTop: 4 }]}>
                    Complete family registration in previous steps to see family members
                  </Text>
                )}
                {error && (
                  <Text style={[styles.errorText, { fontSize: responsive.smallTextSize - 1 }]}>
                    {error.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
      </View>

      {/* Survey Details Card */}
      <View style={[styles.card, { padding: responsive.cardPadding, marginBottom: responsive.marginBottom }]}>
        <View style={styles.cardHeader}>
          <ClipboardCheck size={responsive.iconSize} color="#F59E0B" />
          <Text style={[styles.cardTitle, { fontSize: responsive.headingSize, marginLeft: 8 }]}>
            Survey Details
          </Text>
        </View>

        {/* Survey Date */}
        <View style={[styles.fieldContainer, { marginTop: responsive.marginBottom }]}>
          <Text style={[styles.label, { fontSize: responsive.smallTextSize, marginBottom: 8 }]}>
            Survey Date <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={form.control}
            name="surveyForm.date"
            render={({ field: { value }, fieldState: { error } }) => (
              <View>
                <View
                  style={[styles.dateButtonReadOnly, { minHeight: responsive.inputHeight }]}
                >
                  <Calendar size={responsive.iconSize} color="#6B7280" />
                  <Text style={[styles.dateText, { fontSize: responsive.fontSize, marginLeft: 12 }]}>
                    {value ? new Date(value).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
                
                {error && (
                  <Text style={[styles.errorText, { fontSize: responsive.smallTextSize - 1 }]}>
                    {error.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>

        {/* Resident Signature */}
        <View style={[styles.fieldContainer, { marginTop: responsive.marginBottom + 4 }]}>
          <Text style={[styles.label, { fontSize: responsive.smallTextSize, marginBottom: 8 }]}>
            Resident Signature <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={form.control}
            name="surveyForm.signature"
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              console.log('Signature field - current value:', value);
              console.log('Signature field - has error:', !!error);
              if (error) {
                console.log('Signature field - error message:', error.message);
              }
              
              return (
                <View>
                  <SignatureCanvasComponent
                    onSignatureChange={(sig) => {
                      console.log('Signature changed, new value:', sig);
                      onChange(sig);
                      console.log('After onChange, form value:', form.getValues('surveyForm.signature'));
                    }}
                    value={value}
                  />
                  {error && (
                    <Text style={[styles.errorText, { fontSize: responsive.smallTextSize - 1 }]}>
                      {error.message}
                    </Text>
                  )}
                </View>
              );
            }}
          />
        </View>
      </View>

      {/* Household Definition Note */}
      <View style={[styles.infoCard, { padding: responsive.cardPadding, marginBottom: responsive.sectionMargin }]}>
        <View style={styles.infoHeader}>
          <Info size={responsive.iconSize} color="#3B82F6" />
          <Text style={[styles.infoTitle, { fontSize: responsive.headingSize, marginLeft: 8 }]}>
            Household Definition
          </Text>
        </View>
        <Text style={[styles.infoText, { fontSize: responsive.smallTextSize, marginTop: 8, lineHeight: responsive.smallTextSize * 1.5 }]}>
          A household is a social unit composed of those living together in the same 
          dwelling. Members of the household may or may not be related, either by blood 
          or by marriage.
        </Text>
      </View>

      {/* Navigation Buttons */}
      {onNext && (
        <View style={{ marginTop: responsive.sectionMargin }}>
          <TouchableOpacity
            onPress={onNext}
            style={[styles.submitButton, { 
              minHeight: responsive.minButtonHeight,
              paddingVertical: responsive.buttonPadding 
            }]}
          >
            <Text style={[styles.submitButtonText, { fontSize: responsive.fontSize }]}>
              Submit Survey
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ResponsiveFormContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#6B7280',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardTitle: {
    fontWeight: '600',
    color: '#374151',
  },
  fieldContainer: {
    marginBottom: 4,
  },
  label: {
    fontWeight: '500',
    color: '#374151',
  },
  required: {
    color: '#EF4444',
  },
  labelHint: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '400',
  },
  errorText: {
    color: '#EF4444',
    marginTop: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  dateButtonReadOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  dateText: {
    color: '#111827',
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTitle: {
    fontWeight: '600',
    color: '#1E40AF',
  },
  infoText: {
    color: '#1E40AF',
  },
  submitButton: {
    backgroundColor: '#16A34A',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
