import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAddBusinessPermit } from "./queries/certificationReqInsertQueries";
import { CertificationRequestSchema } from "@/form-schema/certificates/certification-request-schema";
import { usePurposeAndRates, useAnnualGrossSales, useBusinessByResidentId, type PurposeAndRate, type AnnualGrossSales, type Business } from "./queries/certificationReqFetchQueries";
import { SelectLayout, DropdownOption } from "@/components/ui/select-layout";
import PageLayout from '@/screens/_PageLayout';
import { uploadMultipleFiles, prepareFileForUpload, type FileUploadData } from "@/helpers/fileUpload";

const CertPermit: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  const [permitType, setPermitType] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [grossSales, setGrossSales] = useState("");
  const [selectedGrossSalesRange, setSelectedGrossSalesRange] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Image upload states
  const [previousPermitImage, setPreviousPermitImage] = useState<string | null>(null);
  const [assessmentImage, setAssessmentImage] = useState<string | null>(null);
  const [isBusinessOld, setIsBusinessOld] = useState(false);
  
  // File upload progress states
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const addBusinessPermit = useAddBusinessPermit();
  const { data: purposeAndRates = [], isLoading: isLoadingPurposes } = usePurposeAndRates();
  const { data: annualGrossSales = [], isLoading: isLoadingGrossSales } = useAnnualGrossSales();
  const { data: businessResponse = { results: [] }, isLoading: isLoadingBusiness, error: businessError } = useBusinessByResidentId(
    user?.rp || ""
  );
  const businessData = businessResponse?.results || [];

  
    useEffect(() => {
    if (businessData && businessData.length > 0) {
      const business = businessData[0];

      setBusinessName(prev => prev || business.bus_name || "");
      setBusinessAddress(prev => prev || business.bus_location || "Address not available");
      setGrossSales(prev => prev || business.bus_gross_sales?.toString() || "");
      setIsBusinessOld(!!business.bus_date_verified);
    }
  }, [businessData]);

  const pickImage = async (type: 'permit' | 'assessment') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, 
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === 'permit') {
          setPreviousPermitImage(result.assets[0].uri);
        } else {
          setAssessmentImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = (type: 'permit' | 'assessment') => {
    if (type === 'permit') {
      setPreviousPermitImage(null);
    } else {
      setAssessmentImage(null);
    }
  };

   


  
  const permitPurposes = purposeAndRates.filter(purpose => 
    purpose.pr_category.toLowerCase().includes('permit') || 
    purpose.pr_purpose.toLowerCase().includes('permit')
  );

  
  // Memoize permit type options to prevent re-renders
  const permitTypeOptions: DropdownOption[] = useMemo(() => {
    if (isLoadingBusiness) {
      return [{ label: 'Loading...', value: '' }];
    }
    
    if (businessData.length === 0) {
      // No business - only allow Business Clearance
      return [{ label: 'Business Clearance', value: 'Business Clearance' }];
    } else {
      // Has business - allow both Business Clearance (for renewal) and permit types
      // Remove duplicates by using a Set to track unique values
      const uniquePurposes = permitPurposes.filter((purpose, index, self) => 
        index === self.findIndex(p => p.pr_purpose === purpose.pr_purpose)
      );
      
      return [
        { label: 'Business Clearance', value: 'Business Clearance' },
        ...uniquePurposes.map(purpose => ({
          label: `${purpose.pr_purpose}`,
          value: purpose.pr_purpose
        }))
      ];
    }
  }, [isLoadingBusiness, businessData.length, permitPurposes]);

  // Memoize gross sales options to prevent re-renders
  const grossSalesOptions: DropdownOption[] = useMemo(() => {
    return annualGrossSales
      .filter(sales => sales.ags_is_archive === false)
      .filter((sales, index, self) => 
        index === self.findIndex(s => 
          s.ags_minimum === sales.ags_minimum && s.ags_maximum === sales.ags_maximum
        )
      )
      .map(sales => ({
        label: `₱${sales.ags_minimum} - ₱${sales.ags_maximum}`,
        value: `${sales.ags_minimum} - ${sales.ags_maximum}`
      }));
  }, [annualGrossSales]);

  // Text input handlers
  const handleBusinessNameChange = (text: string) => {
    if (permitType === 'Business Clearance' && businessData.length === 0) {
      setBusinessName(text);
    }
  };

  const handleBusinessAddressChange = (text: string) => {
    if (permitType === 'Business Clearance' && businessData.length === 0) {
      setBusinessAddress(text);
    }
  };

  // Memoize editable state
  const isBusinessNameEditable = useMemo(() => {
    return permitType === 'Business Clearance' && businessData.length === 0;
  }, [permitType, businessData.length]);

  const isBusinessAddressEditable = useMemo(() => {
    return permitType === 'Business Clearance' && businessData.length === 0;
  }, [permitType, businessData.length]);

  
  const handleSubmit = async () => {
    setError(null);
    
    // Prevent submission if no business exists (except for Business Clearance)
    if (businessData.length === 0 && permitType !== 'Business Clearance') {
      setError("Cannot submit request: No business registered under this resident");
      return;
    }
    
    // Validate required fields
    if (!businessName.trim()) {
      setError("Business name is required");
      return;
    }
    if (!businessAddress.trim()) {
      setError("Business address is required");
      return;
    }
    if (businessData.length === 0 && !selectedGrossSalesRange) {
      setError("Please select a gross sales range");
      return;
    }
    if (businessData.length > 0 && !grossSales) {
      setError("Gross sales information is missing");
      return;
    }

    // Validate required images
    if (permitType !== 'Business Clearance') {
      // For other permit types
      if (isBusinessOld && !previousPermitImage) {
        setError("Previous permit image is required for existing businesses");
        return;
      }
      if (!assessmentImage) {
        setError("Assessment image is required");
        return;
      }
    } else if (permitType === 'Business Clearance' && businessData.length === 0) {
      // For Business Clearance with new businesses
      if (!assessmentImage) {
        setError("Assessment document is required for new businesses");
        return;
      }
    }
    
    const result = CertificationRequestSchema.safeParse({
      cert_type: "permit",
      business_name: businessName || "",
      business_address: businessAddress || "",
      gross_sales: businessData.length === 0 ? (selectedGrossSalesRange || "") : (grossSales || ""),
      rp_id: user?.rp || "",
      previous_permit_image: previousPermitImage || undefined,
      assessment_image: assessmentImage || undefined,
    });
    
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    
    // Find the selected purpose and rates ID
    const selectedPurpose = purposeAndRates.find(p => p.pr_purpose === permitType);
    
    // Calculate the amount to be paid and get the annual gross sales ID
    let reqAmount = 0;
    let agsId = null;
    
    if (permitType === 'Business Clearance') {
      if (businessData.length === 0) {
        // For residents without business, use rate from selected gross sales range
        const selectedGrossSales = annualGrossSales.find(sales => 
          `${sales.ags_minimum} - ${sales.ags_maximum}` === selectedGrossSalesRange
        );
        reqAmount = selectedGrossSales?.ags_rate || 0;
        agsId = selectedGrossSales?.ags_id || null;
      } else {
        // For residents with business, find rate based on gross sales amount
        const grossSalesAmount = parseFloat(grossSales);
        const matchingGrossSales = annualGrossSales.find(sales => 
          grossSalesAmount >= sales.ags_minimum && grossSalesAmount <= sales.ags_maximum
        );
        reqAmount = matchingGrossSales?.ags_rate || 0;
        agsId = matchingGrossSales?.ags_id || null;
      }
    } else {
      // For other permit types, use rate from purpose and rates
      reqAmount = selectedPurpose?.pr_rate || 0;
    }

    // Prepare payload
    let payload: any = {
      cert_type: "permit",
      business_name: businessName,
      business_address: businessAddress,
      gross_sales: businessData.length === 0 ? selectedGrossSalesRange : grossSales,
      business_id: businessData.length > 0 ? businessData[0]?.bus_id : undefined, 
      pr_id: selectedPurpose?.pr_id,
      rp_id: user?.rp || "",
      req_amount: reqAmount,
      ags_id: agsId || undefined,
    };

    // Handle file uploads if images are provided
    if ((previousPermitImage || assessmentImage) && (permitType !== 'Business Clearance' || (permitType === 'Business Clearance' && businessData.length === 0))) {
      try {
        setIsUploadingFiles(true);
        setUploadProgress("Preparing files for upload...");
        
        const filesToUpload: FileUploadData[] = [];
        
        // Add previous permit image if exists
        if (previousPermitImage && isBusinessOld) {
          filesToUpload.push(prepareFileForUpload(previousPermitImage, 'permit', businessName));
        }
        
        // Add assessment image if exists
        if (assessmentImage) {
          filesToUpload.push(prepareFileForUpload(assessmentImage, 'assessment', businessName));
        }
        
        if (filesToUpload.length > 0) {
          setUploadProgress(`Uploading ${filesToUpload.length} file(s)...`);
          
          const uploadedFiles = await uploadMultipleFiles(filesToUpload);
          
          // Add uploaded file URLs to payload
          const previousPermitFile = uploadedFiles.find(file => file.file_name.includes('permit'));
          const assessmentFile = uploadedFiles.find(file => file.file_name.includes('assessment'));
          
          payload.previous_permit_image = previousPermitFile?.file_url || null;
          payload.assessment_image = assessmentFile?.file_url || null;
          
          setUploadProgress("Files uploaded successfully!");
        }
        
      } catch (uploadError) {
        console.error("File upload failed:", uploadError);
        setError("Failed to upload files. Please try again.");
        setIsUploadingFiles(false);
        setUploadProgress("");
        return;
      } finally {
        setIsUploadingFiles(false);
        setUploadProgress("");
      }
    }

    // Submit the form
    addBusinessPermit.mutate(payload);
  };

  // Show loading screen while auth is loading
  if (isLoading) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-[13px]">Submit a Request</Text>}
        rightAction={<View className="w-10 h-10" />}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00AFFF" />
          <Text className="text-gray-600 text-base mt-4">Loading...</Text>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-[13px]">Submit a Request</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 px-5">
        {/* Loading Overlay */}
        {addBusinessPermit.status === 'pending' && (
          <View className="absolute inset-0 bg-black bg-opacity-50 z-50 items-center justify-center">
            <View className="bg-white rounded-xl p-6 items-center shadow-lg">
              <ActivityIndicator size="large" color="#00AFFF" />
              <Text className="text-gray-800 font-semibold text-lg mt-4">Submitting...</Text>
              <Text className="text-gray-600 text-sm mt-2 text-center">
                Please wait while we process your request
              </Text>
            </View>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        
        {error && (
          <Text className="text-red-500 mb-2 text-sm">{error}</Text>
        )}
                 {addBusinessPermit.status === 'error' && (
           <Text className="text-red-500 mb-2 text-sm">Failed to submit request.</Text>
         )}
         


        {/* Business Status Info */}
        {!isLoadingBusiness && (
          <View className={`rounded-lg p-3 mb-3 ${
            businessData.length === 0 
              ? 'bg-blue-50 border border-blue-200' 
              : 'bg-green-50 border border-green-200'
          }`}>
            <View className="flex-row items-center mb-1">
              <Ionicons 
                name={businessData.length === 0 ? "information-circle" : "checkmark-circle"} 
                size={16} 
                color={businessData.length === 0 ? "#2563EB" : "#059669"} 
              />
              <Text className={`text-sm font-medium ml-2 ${
                businessData.length === 0 ? 'text-blue-800' : 'text-green-800'
              }`}>
                {businessData.length === 0 ? 'No Registered Business' : 'Business Registered'}
              </Text>
            </View>
            <Text className={`text-xs ${
              businessData.length === 0 ? 'text-blue-600' : 'text-green-600'
            }`}>
              {businessData.length === 0 
                ? 'You can only request Business Clearance' 
                : 'You can request Business Clearance (renewal) or various permit types for your business'
              }
            </Text>
          </View>
        )}

        {/* Permit Type Dropdown */}
        <SelectLayout
          label="Type of Clearance"
          options={permitTypeOptions}
          selectedValue={permitType}
          onSelect={(option) => setPermitType(option.value)}
          placeholder={
            isLoadingBusiness || !!isLoading
              ? "Loading business information..." 
              : businessData.length === 0 
                ? "Business Clearance available" 
                : "Select permit type"
          }
          disabled={isLoadingBusiness || isLoadingPurposes || !!isLoading}
          className="mb-3"
        />

        {/* Show rest of form only when permit type is selected */}
        {permitType && (
          <>
            {/* Business Name */}
            <Text className="text-sm font-medium text-gray-700 mb-2">Business Name</Text>
            <TextInput
              className={`rounded-lg px-3 py-3 mb-3 border border-gray-200 text-base ${
                permitType === 'Business Clearance' 
                  ? (businessData.length > 0 ? 'bg-gray-100 text-gray-600' : 'bg-white text-gray-900')
                  : 'bg-gray-100 text-gray-600'
              }`}
              placeholder={
                permitType === 'Business Clearance' 
                  ? (businessData.length > 0 ? "Business name from records" : "Enter business name")
                  : (isLoadingBusiness ? "Loading business details..." : "No business found")
              }
              placeholderTextColor="#888"
              value={businessName}
              onChangeText={handleBusinessNameChange}
              editable={isBusinessNameEditable}
              autoCapitalize="words"
              autoCorrect={false}
            />

            {/* Business Address */}
            <Text className="text-sm font-medium text-gray-700 mb-2">Business Address</Text>
            <TextInput
              className={`rounded-lg px-3 py-3 mb-3 border border-gray-200 text-base ${
                permitType === 'Business Clearance' 
                  ? (businessData.length > 0 ? 'bg-gray-100 text-gray-600' : 'bg-white text-gray-900')
                  : 'bg-gray-100 text-gray-600'
              }`}
              placeholder={
                permitType === 'Business Clearance' 
                  ? (businessData.length > 0 ? "Business address from records" : "Enter business address")
                  : (isLoadingBusiness ? "Loading business details..." : "No business found")
              }
              placeholderTextColor="#888"
              value={businessAddress}
              onChangeText={handleBusinessAddressChange}
              editable={isBusinessAddressEditable}
              autoCapitalize="words"
              autoCorrect={false}
            />

            {/* Annual Gross Sales */}
            <Text className="text-sm font-medium text-gray-700 mb-2">Annual Gross Sales</Text>
            {businessData.length === 0 ? (
              // Dropdown for residents without business
              <SelectLayout
                options={grossSalesOptions}
                selectedValue={selectedGrossSalesRange}
                onSelect={(option) => setSelectedGrossSalesRange(option.value)}
                placeholder={isLoadingGrossSales ? "Loading..." : "Select gross sales range"}
                disabled={isLoadingGrossSales}
                className="mb-3"
              />
            ) : (
              // Read-only for residents with business
              <TextInput
                className="rounded-lg bg-gray-100 px-3 py-3 mb-3 border border-gray-200 text-base text-gray-600"
                placeholder={isLoadingBusiness ? "Loading business details..." : "No business found"}
                placeholderTextColor="#888"
                value={grossSales ? `₱${parseFloat(grossSales).toLocaleString()}` : ""}
                editable={false}
              />
            )}

            {/* Claim Date removed */}

            {/* Image Upload Section - Show for non-Business Clearance OR Business Clearance for new businesses */}
            {(permitType !== 'Business Clearance' || (permitType === 'Business Clearance' && businessData.length === 0)) && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-3">Required Documents</Text>
                
                {/* Business Status Indicator */}
                <View className={`rounded-lg p-3 mb-3 ${isBusinessOld ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'}`}>
                  <Text className={`text-sm font-medium ${isBusinessOld ? 'text-blue-800' : 'text-green-800'}`}>
                    {isBusinessOld ? 'Existing Business' : 'New Business'}
                  </Text>
                  <Text className={`text-xs ${isBusinessOld ? 'text-blue-600' : 'text-green-600'} mt-1`}>
                    {isBusinessOld ? 'Previous permit and assessment required' : 'Assessment document required for new businesses'}
                  </Text>
                </View>

                {/* Previous Permit Upload (Only for old businesses) */}
                {isBusinessOld && (
                  <View className="mb-3">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Previous Permit <Text className="text-red-500">*</Text>
                    </Text>
                    {previousPermitImage ? (
                      <View className="relative">
                        <Image source={{ uri: previousPermitImage }} className="w-full h-40 rounded-lg mb-2" resizeMode="cover" />
                        <TouchableOpacity
                          onPress={() => removeImage('permit')}
                          className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
                        >
                          <Ionicons name="close" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => pickImage('permit')}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center"
                        activeOpacity={0.7}
                      >
                        <Ionicons name="camera-outline" size={32} color="#888" />
                        <Text className="text-gray-600 text-sm mt-2">Upload Previous Permit</Text>
                        <Text className="text-gray-400 text-xs mt-1">Required for existing businesses</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Assessment Upload (Required for all) */}
                <View className="mb-3">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Assessment Document <Text className="text-red-500">*</Text>
                  </Text>
                  {assessmentImage ? (
                    <View className="relative">
                      <Image source={{ uri: assessmentImage }} className="w-full h-40 rounded-lg mb-2" resizeMode="cover" />
                      <TouchableOpacity
                        onPress={() => removeImage('assessment')}
                        className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
                      >
                        <Ionicons name="close" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => pickImage('assessment')}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="document-outline" size={32} color="#888" />
                      <Text className="text-gray-600 text-sm mt-2">Upload Assessment</Text>
                      <Text className="text-gray-400 text-xs mt-1">
                        {permitType === 'Business Clearance' && businessData.length === 0 
                          ? 'Required for new businesses' 
                          : 'Required for all businesses'
                        }
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Amount to be Paid */}
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
              <Text className="text-green-800 text-sm font-medium mb-1">Amount to be Paid:</Text>
              <Text className="text-green-700 text-lg font-bold">
                {(() => {
                  if (permitType === 'Business Clearance') {
                    if (businessData.length === 0) {
                      // For residents without business, use rate from selected gross sales range
                      const selectedGrossSales = annualGrossSales.find(sales => 
                        `${sales.ags_minimum} - ${sales.ags_maximum}` === selectedGrossSalesRange
                      );
                      return selectedGrossSales ? `₱${selectedGrossSales.ags_rate.toLocaleString()}` : '₱0';
                    } else {
                      // For residents with business, find rate based on gross sales amount
                      const grossSalesAmount = parseFloat(grossSales);
                      const matchingGrossSales = annualGrossSales.find(sales => 
                        grossSalesAmount >= sales.ags_minimum && grossSalesAmount <= sales.ags_maximum
                      );
                      return matchingGrossSales ? `₱${matchingGrossSales.ags_rate.toLocaleString()}` : '₱0';
                    }
                  } else {
                    // For other permit types, use rate from purpose and rates
                    const selectedPurpose = purposeAndRates.find(p => p.pr_purpose === permitType);
                    return selectedPurpose ? `₱${selectedPurpose.pr_rate.toLocaleString()}` : '₱0';
                  }
                })()}
              </Text>
            </View>

            {/* Upload Progress */}
            {isUploadingFiles && (
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="#00AFFF" />
                  <Text className="text-blue-700 text-sm font-medium ml-2">
                    {uploadProgress}
                  </Text>
                </View>
              </View>
            )}

            {/* Submit Button */}
            {!isLoadingBusiness && !Boolean(isLoading) && (businessData.length > 0 || permitType === 'Business Clearance') ? (
              <TouchableOpacity
                className={`rounded-xl py-4 items-center mt-2 mb-8 ${
                  (addBusinessPermit.status === 'pending' || isUploadingFiles) 
                    ? 'bg-gray-400 opacity-50' 
                    : 'bg-[#00AFFF]'
                }`}
                activeOpacity={0.85}
                onPress={handleSubmit}
                disabled={addBusinessPermit.status === 'pending' || isUploadingFiles}
              >
                {(addBusinessPermit.status === 'pending' || isUploadingFiles) ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-semibold text-base ml-2">
                      {isUploadingFiles ? 'Uploading...' : 'Submitting...'}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Submit
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <View className="bg-gray-100 rounded-xl py-4 items-center mt-2 mb-8">
                <Text className="text-gray-500 font-semibold text-base">
                  {Boolean(isLoading) ? 'Loading user data...' : 'Cannot Request Business Permit'}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      </View>
    </PageLayout>
  );
};

export default CertPermit;
