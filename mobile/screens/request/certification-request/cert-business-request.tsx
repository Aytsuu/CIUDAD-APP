import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useAddBusinessPermit } from "./queries/certificationReqInsertQueries";
import { CertificationRequestSchema } from "@/form-schema/certificates/certification-request-schema";
import { usePurposeAndRates, useAnnualGrossSales, useBusinessByResidentId } from "./queries/certificationReqFetchQueries";
import { SelectLayout, DropdownOption } from "@/components/ui/select-layout";
import PageLayout from '@/screens/_PageLayout';
import { uploadMultipleBusinessPermitFiles, prepareBusinessPermitFileForUpload, type BusinessPermitFileData } from "@/helpers/businessPermitUpload";
import { LoadingState } from "@/components/ui/loading-state";
import { LoadingModal } from "@/components/ui/loading-modal";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";

const CertPermit: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  const [permitType, setPermitType] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [grossSales, setGrossSales] = useState("");
  const [inputtedGrossSales, setInputtedGrossSales] = useState("");

  const [error, setError] = useState<string | null>(null);
  
  // Image upload states - using MediaPicker format
  const [previousPermitImages, setPreviousPermitImages] = useState<MediaItem[]>([]);
  const [assessmentImages, setAssessmentImages] = useState<MediaItem[]>([]);
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

  // Helper functions to get image URIs from MediaPicker format
  const getPreviousPermitImageUri = () => {
    return previousPermitImages.length > 0 ? previousPermitImages[0].uri : null;
  };

  const getAssessmentImageUri = () => {
    return assessmentImages.length > 0 ? assessmentImages[0].uri : null;
  };

   


  
  // Separate permit purposes and barangay clearance
  const permitPurposes = purposeAndRates.filter(purpose => 
    purpose.pr_category.toLowerCase().includes('permit') &&
    !purpose.pr_purpose.toLowerCase().includes('clearance') &&
    !purpose.pr_category.toLowerCase().includes('clearance')
  );
  
  const barangayClearancePurposes = purposeAndRates.filter(purpose => 
    purpose.pr_purpose.toLowerCase().includes('clearance') ||
    purpose.pr_category.toLowerCase().includes('clearance')
  );


  
  // Memoize permit type options to prevent re-renders
  const permitTypeOptions: DropdownOption[] = useMemo(() => {
    if (isLoadingBusiness) {
      return [{ label: 'Loading...', value: '' }];
    }
    
    if (businessData.length === 0) {
      // No business - only allow Barangay Clearance
      return barangayClearancePurposes.map(purpose => ({
        label: purpose.pr_purpose,
        value: purpose.pr_purpose
      }));
    } else {
      // Has business - allow both Barangay Clearance and permit types
      const allPurposes = [...permitPurposes, ...barangayClearancePurposes];
      const uniquePurposes = allPurposes.filter((purpose, index, self) => 
        index === self.findIndex(p => p.pr_purpose === purpose.pr_purpose)
      );
      
      return uniquePurposes.map(purpose => ({
        label: purpose.pr_purpose,
        value: purpose.pr_purpose
      }));
    }
  }, [isLoadingBusiness, businessData.length, permitPurposes, barangayClearancePurposes]);

  // Helper function to find the closest gross sales range and rate
  const findMatchingGrossSalesRate = (inputValue: string) => {
    const numericValue = parseFloat(inputValue);
    if (isNaN(numericValue)) return null;
    
    // Filter out archived ranges
    const activeRanges = annualGrossSales.filter(sales => sales.ags_is_archive === false);
    
    if (activeRanges.length === 0) return null;
    
    // First, try to find exact match within a range
    const exactMatch = activeRanges.find(sales => 
      numericValue >= sales.ags_minimum && 
      numericValue <= sales.ags_maximum
    );
    
    if (exactMatch) return exactMatch;
    
    // If no exact match, find the closest range
    let closestRange = null;
    let minDistance = Infinity;
    
    activeRanges.forEach(sales => {
      const rangeMin = sales.ags_minimum;
      const rangeMax = sales.ags_maximum;
      const rangeMid = (rangeMin + rangeMax) / 2;
      
      // Calculate distance from input value to range midpoint
      const distance = Math.abs(numericValue - rangeMid);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestRange = sales;
      }
    });
    
    return closestRange;
  };

  // Check if selected type is barangay clearance
  const isBarangayClearance = useMemo(() => {
    return barangayClearancePurposes.some(purpose => purpose.pr_purpose === permitType);
  }, [permitType, barangayClearancePurposes]);

  // Text input handlers
  const handleBusinessNameChange = (text: string) => {
    if (isBarangayClearance && businessData.length === 0) {
      setBusinessName(text);
    }
  };

  const handleBusinessAddressChange = (text: string) => {
    if (isBarangayClearance && businessData.length === 0) {
      setBusinessAddress(text);
    }
  };

  const handleGrossSalesChange = (text: string) => {
    if (isBarangayClearance) {
      setInputtedGrossSales(text);
    }
  };

  // Memoize editable state
  const isBusinessNameEditable = useMemo(() => {
    return isBarangayClearance && businessData.length === 0;
  }, [isBarangayClearance, businessData.length]);

  const isBusinessAddressEditable = useMemo(() => {
    return isBarangayClearance && businessData.length === 0;
  }, [isBarangayClearance, businessData.length]);

  const isGrossSalesEditable = useMemo(() => {
    return isBarangayClearance;
  }, [isBarangayClearance]);

  
  const handleSubmit = async () => {
    setError(null);
    
    // Check if user is deceased
    if (user?.personal?.per_is_deceased) {
      setError("Deceased residents cannot request certificates");
      return;
    }
    
    // Prevent submission if no business exists (except for barangay clearance)
    if (businessData.length === 0 && !isBarangayClearance) {
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
    if (isBarangayClearance && !inputtedGrossSales.trim()) {
      setError("Please enter your annual gross sales amount");
      return;
    }
    
    // Validate that inputted gross sales can find a closest range
    if (isBarangayClearance && inputtedGrossSales.trim()) {
      const matchingRate = findMatchingGrossSalesRate(inputtedGrossSales);
      if (!matchingRate) {
        setError("No valid gross sales range found for the entered amount");
        return;
      }
    }

    // Validate required images - only for barangay clearance
    if (isBarangayClearance) {
      if (isBusinessOld && previousPermitImages.length === 0) {
        setError("Previous permit image is required for existing businesses");
        return;
      }
      if (assessmentImages.length === 0) {
        setError("Assessment image is required");
        return;
      }
    }
    
    const result = CertificationRequestSchema.safeParse({
      cert_type: "permit",
      business_name: businessName || "",
      business_address: businessAddress || "",
      gross_sales: isBarangayClearance ? (inputtedGrossSales || "") : "N/A",
      rp_id: user?.rp || "",
      permit_image: isBarangayClearance ? (getPreviousPermitImageUri() || undefined) : undefined,
      assessment_image: isBarangayClearance ? (getAssessmentImageUri() || undefined) : undefined,
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
    let prId = null;
    
    // Set pr_id for all permit types
    prId = selectedPurpose?.pr_id || null;
    
    if (isBarangayClearance) {
      // For Barangay Clearance, use ags_rate (Annual Gross Sales rate)
      // Use inputted gross sales for all business clearance requests
      const matchingGrossSales = findMatchingGrossSalesRate(inputtedGrossSales);
      reqAmount = matchingGrossSales?.ags_rate || 0;
      agsId = matchingGrossSales?.ags_id || null;
    } else {
      // For permit types, use rate from purpose and rates
      reqAmount = selectedPurpose?.pr_rate || 0;
    }

    // Prepare payload
    let payload: any = {
      cert_type: "permit",
      business_name: businessName,
      business_address: businessAddress,
      gross_sales: isBarangayClearance ? inputtedGrossSales : "N/A",
      business_id: businessData.length > 0 ? businessData[0]?.bus_id : undefined, 
      pr_id: prId,
      rp_id: user?.rp || "",
      req_amount: reqAmount,
      ags_id: agsId || undefined,
      bus_clearance_gross_sales: isBarangayClearance ? parseFloat(inputtedGrossSales) : undefined,
    };

    // Handle file uploads if images are provided - only for barangay clearance
    if ((previousPermitImages.length > 0 || assessmentImages.length > 0) && isBarangayClearance) {
      try {
        setIsUploadingFiles(true);
        setUploadProgress("Preparing business permit files for upload...");
        
        const filesToUpload: BusinessPermitFileData[] = [];
        
        // Add previous permit image if exists
        if (previousPermitImages.length > 0 && isBusinessOld) {
          filesToUpload.push(prepareBusinessPermitFileForUpload(previousPermitImages[0].uri, 'permit', businessName));
        }
        
        // Add assessment image if exists
        if (assessmentImages.length > 0) {
          filesToUpload.push(prepareBusinessPermitFileForUpload(assessmentImages[0].uri, 'assessment', businessName));
        }
        
        if (filesToUpload.length > 0) {
          setUploadProgress(`Uploading...`);
          
          const uploadedFiles = await uploadMultipleBusinessPermitFiles(filesToUpload);
          
          // Add uploaded file URLs to payload
          let previousPermitFile = null;
          let assessmentFile = null;
          
          if (filesToUpload.length === 1) {
            // Only one file uploaded - check if it's permit or assessment
            if (filesToUpload[0].type === 'permit') {
              previousPermitFile = uploadedFiles[0];
            } else {
              assessmentFile = uploadedFiles[0];
            }
          } else if (filesToUpload.length === 2) {
            // Two files uploaded - first is permit, second is assessment
            previousPermitFile = uploadedFiles[0];
            assessmentFile = uploadedFiles[1];
          }
          
          // Store the file URLs in the appropriate fields
          payload.permit_image = previousPermitFile?.file_url;
          payload.assessment_image = assessmentFile?.file_url;
          
          setUploadProgress("Business permit files uploaded successfully to Supabase Storage!");
        }
        
      } catch (uploadError) {
        console.error("Business permit file upload failed:", uploadError);
        setError("Failed to upload business permit files. Please try again.");
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

  // Show loading screen while auth, purposes, or business data is loading
  if (isLoading || isLoadingPurposes || isLoadingBusiness) {
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
        <LoadingState />
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
      <View className="flex-1 p-6">
        {/* Loading Modal */}
        <LoadingModal visible={addBusinessPermit.status === 'pending' || isUploadingFiles} />

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
                ? 'You can only request Barangay Clearance' 
                : 'You can request Barangay Clearance or various permit types for your business'
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
            businessData.length === 0 
              ? "Barangay Clearance available" 
              : "Select permit type"
          }
          disabled={false}
          className="mb-3"
        />

        {/* Show rest of form only when permit type is selected */}
        {permitType && (
          <>
            {/* Business Name */}
            <Text className="text-sm font-medium text-gray-700 mb-2">Business Name</Text>
            <TextInput
              className={`rounded-lg px-3 py-3 mb-3 border border-gray-200 text-base ${
                isBarangayClearance 
                  ? (businessData.length > 0 ? 'bg-gray-100 text-gray-600' : 'bg-white text-gray-900')
                  : 'bg-gray-100 text-gray-600'
              }`}
              placeholder={
                isBarangayClearance 
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
                isBarangayClearance 
                  ? (businessData.length > 0 ? 'bg-gray-100 text-gray-600' : 'bg-white text-gray-900')
                  : 'bg-gray-100 text-gray-600'
              }`}
              placeholder={
                isBarangayClearance 
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

            {/* Annual Gross Sales - Only show for barangay clearance */}
            {isBarangayClearance && (
              <>
                <Text className="text-sm font-medium text-gray-700 mb-2">Annual Gross Sales</Text>
                <TextInput
                  className="rounded-lg px-3 py-3 mb-3 border border-gray-200 text-base bg-white text-gray-900"
                  placeholder="Enter your annual gross sales amount"
                  placeholderTextColor="#888"
                  value={inputtedGrossSales}
                  onChangeText={handleGrossSalesChange}
                  keyboardType="numeric"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </>
            )}

            {/* Claim Date removed */}

            {/* Image Upload Section - Only show for barangay clearance */}
            {isBarangayClearance && (
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
                    <MediaPicker
                      selectedImages={previousPermitImages}
                      setSelectedImages={setPreviousPermitImages}
                      limit={1}
                      editable={true}
                    />
                  </View>
                )}

                {/* Assessment Upload (Required for all) */}
                <View className="mb-3">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Assessment Document <Text className="text-red-500">*</Text>
                  </Text>
                  <MediaPicker
                    selectedImages={assessmentImages}
                    setSelectedImages={setAssessmentImages}
                    limit={1}
                    editable={true}
                  />
                </View>
              </View>
            )}

            {/* Amount to be Paid */}
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
              <Text className="text-green-800 text-sm font-medium mb-1">Amount to be Paid:</Text>
              <Text className="text-green-700 text-lg font-bold">
                {(() => {
                  if (isBarangayClearance) {
                    // For Barangay Clearance, use ags_rate (Annual Gross Sales rate)
                    // Use inputted gross sales for all business clearance requests
                    const matchingGrossSales = findMatchingGrossSalesRate(inputtedGrossSales);
                    return matchingGrossSales ? `₱${matchingGrossSales.ags_rate.toLocaleString()}` : '₱0';
                  } else {
                    // For permit types, use rate from purpose and rates
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
            {!isLoadingBusiness && !Boolean(isLoading) && (businessData.length > 0 || isBarangayClearance) ? (
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
                  {isLoading ? 'Loading user data...' : 'Cannot Request Business Permit'}
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
