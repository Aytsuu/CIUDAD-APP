import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useAddBusinessPermit } from "./queries/certificationReqInsertQueries";
import { CertificationRequestSchema } from "@/form-schema/certificates/certification-request-schema";
import { usePurposeAndRates, useAnnualGrossSales, useBusinessRespondentById } from "./queries/certificationReqFetchQueries";
import { useQueryClient } from "@tanstack/react-query";
import { SelectLayout, DropdownOption } from "@/components/ui/select-layout";
import PageLayout from '@/screens/_PageLayout';
import { uploadMultipleBusinessPermitFiles, prepareBusinessPermitFileForUpload, type BusinessPermitFileData } from "@/helpers/businessPermitUpload";
import { LoadingState } from "@/components/ui/loading-state";
import { LoadingModal } from "@/components/ui/loading-modal";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import { useOwnedBusinesses } from "@/screens/business/queries/businessGetQueries";

const CertPermit: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  const [permitType, setPermitType] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [grossSales, setGrossSales] = useState("");
  const [inputtedGrossSales, setInputtedGrossSales] = useState("");
  const [selectedGrossSalesRange, setSelectedGrossSalesRange] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Image upload states - using MediaPicker format
  const [previousPermitImages, setPreviousPermitImages] = useState<MediaItem[]>([]);
  const [assessmentImages, setAssessmentImages] = useState<MediaItem[]>([]);
  const [isBusinessOld, setIsBusinessOld] = useState(false);
  
  // File upload progress states
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const queryClient = useQueryClient();
  const addBusinessPermit = useAddBusinessPermit();
  const { data: purposeAndRates = [], isLoading: isLoadingPurposes } = usePurposeAndRates();
  const { data: annualGrossSales = [], isLoading: isLoadingGrossSales } = useAnnualGrossSales();
  // Fetch owned businesses using the same query/params as the business module
  const ownershipParams = useMemo(() => {
    if (user?.br) {
      // Prefer br_id for business accounts
      return { page: 1, page_size: 20, search: "", br: user.br };
    }
    if (user?.rp) {
      return { page: 1, page_size: 20, search: "", rp: user.rp };
    }
    return { page: 1, page_size: 20, search: "" };
  }, [user?.br, user?.rp]);

  const { data: ownedBusinesses, isLoading: isLoadingOwnedBusinesses } = useOwnedBusinesses(ownershipParams);

  // Use all businesses returned for this user
  const businessData = useMemo(() => {
    console.log("[CertPermit] ownedBusinesses from API:", ownedBusinesses);
    const results = (ownedBusinesses as any)?.results || [];
    console.log("[CertPermit] businessData derived from ownedBusinesses.results:", results);
    return results;
  }, [ownedBusinesses]);

  const isLoadingBusiness = isLoadingOwnedBusinesses;

  // Get unique br_ids from businessData to fetch business respondent details
  const uniqueBrIds = useMemo(() => {
    const brIds = businessData
      .map(business => business.br_id)
      .filter((brId): brId is string => brId !== null && brId !== undefined);
    return [...new Set(brIds)];
  }, [businessData]);

  // Fetch business respondent details for the first br_id found (or user's br_id if available)
  const brIdToFetch = uniqueBrIds.length > 0 ? uniqueBrIds[0] : user?.br;
  const { data: businessRespondent, isLoading: isLoadingBusinessRespondent } = useBusinessRespondentById(brIdToFetch);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Invalidate and refetch all relevant queries
      const brIdToInvalidate = uniqueBrIds.length > 0 ? uniqueBrIds[0] : user?.br;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["purpose-and-rates"] }),
        queryClient.invalidateQueries({ queryKey: ["annual-gross-sales"] }),
        queryClient.invalidateQueries({ queryKey: ["business-by-resident", user?.rp, user?.br] }),
        ...(brIdToInvalidate ? [queryClient.invalidateQueries({ queryKey: ["business-respondent", brIdToInvalidate] })] : []),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  
    useEffect(() => {
    console.log("[CertPermit] businessData in useEffect:", businessData);
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
    purpose.pr_category === 'Barangay Permit'
  );
  
  const barangayClearancePurposes = purposeAndRates.filter(purpose => 
    purpose.pr_category === 'Barangay Clearance'
  );

  // Treat users with either a linked business record OR a br_id as "having a business"
  const hasBusinessProfile = useMemo(() => {
    return businessData.length > 0 || !!user?.br;
  }, [businessData.length, user?.br]);

  // Memoize permit type options to prevent re-renders
  const permitTypeOptions: DropdownOption[] = useMemo(() => {
    if (isLoadingBusiness) {
      return [{ label: 'Loading...', value: '' }];
    }
    
    if (!hasBusinessProfile) {
      // No business profile - only allow Barangay Clearance
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
  }, [isLoadingBusiness, hasBusinessProfile, permitPurposes, barangayClearancePurposes]);

  const findMatchingGrossSalesRate = (inputValue: string) => {
    // Handle empty input
    if (!inputValue || inputValue.trim() === '') return null;
    
    // Clean input and convert to number (same as web)
    const cleanInput = inputValue.replace(/,/g, '').trim();
    const numericValue = parseFloat(cleanInput);
    if (isNaN(numericValue) || numericValue < 0) return null;
    
    // Ensure annualGrossSales is an array
    if (!Array.isArray(annualGrossSales) || annualGrossSales.length === 0) {
      return null;
    }
    
    // Filter only active (non-archived) rates (same as web)
    const activeRates = annualGrossSales.filter((sales) => !sales.ags_is_archive);
    
    if (activeRates.length === 0) return null;
    
    // Sort rates by minimum value to ensure proper matching (EXACTLY like web)
    const sortedRates = [...activeRates].sort((a, b) => 
      Number(a.ags_minimum) - Number(b.ags_minimum)
    );
    
    // Find exact match within a range (EXACTLY like web - using find, not for loop)
    const exactMatch = sortedRates.find((sales) => 
      numericValue >= Number(sales.ags_minimum) && 
      numericValue <= Number(sales.ags_maximum)
    );
    
    if (exactMatch) {
      return exactMatch;
    }
    
    // If value is below lowest range, use lowest range (same as web)
    const lowestRate = sortedRates[0];
    if (lowestRate && numericValue < Number(lowestRate.ags_minimum)) {
      return lowestRate;
    }
    
    // If exceeds highest range, use highest available (same as web)
    const highestRate = sortedRates[sortedRates.length - 1];
    if (highestRate && numericValue > Number(highestRate.ags_maximum)) {
      return highestRate;
    }
    
    return null;
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
      // Auto-match gross sales range when input changes
      if (text.trim()) {
        const matchingRate = findMatchingGrossSalesRate(text);
        if (matchingRate) {
          setSelectedGrossSalesRange(matchingRate.ags_id.toString());
        }
      }
    }
  };

  // Create dropdown options for annual gross sales ranges
  const grossSalesDropdownOptions: DropdownOption[] = useMemo(() => {
    if (!Array.isArray(annualGrossSales) || annualGrossSales.length === 0) {
      return [];
    }
    
    // Filter only active (non-archived) rates
    const activeRates = annualGrossSales.filter((sales) => !sales.ags_is_archive);
    
    // Sort rates by minimum value
    const sortedRates = [...activeRates].sort((a, b) => 
      Number(a.ags_minimum) - Number(b.ags_minimum)
    );
    
    return sortedRates.map((sales) => {
      // Handle both string and number types from API
      const min = typeof sales.ags_minimum === 'string' ? parseFloat(sales.ags_minimum) : Number(sales.ags_minimum);
      const max = typeof sales.ags_maximum === 'string' ? parseFloat(sales.ags_maximum) : Number(sales.ags_maximum);
      
      return {
        label: `₱${min.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - ₱${max.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        value: sales.ags_id.toString()
      };
    });
  }, [annualGrossSales]);

  // Handler for gross sales dropdown selection
  const handleGrossSalesRangeSelect = (agsId: string) => {
    setSelectedGrossSalesRange(agsId);
    
    // For registered businesses, auto-populate input with minimum value of selected range
    if (businessData.length > 0) {
      const selectedRange = annualGrossSales.find(
        (sales) => sales.ags_id.toString() === agsId && !sales.ags_is_archive
      );
      if (selectedRange) {
        const minValue = typeof selectedRange.ags_minimum === 'string' 
          ? parseFloat(selectedRange.ags_minimum) 
          : Number(selectedRange.ags_minimum);
        if (!isNaN(minValue)) {
          setInputtedGrossSales(minValue.toString());
        }
      }
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
    if (!hasBusinessProfile && !isBarangayClearance) {
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
    // Validate gross sales based on business type
    if (isBarangayClearance) {
      if (businessData.length === 0) {
        // New business: require dropdown selection
        if (!selectedGrossSalesRange) {
          setError("Please select an annual gross sales range");
          return;
        }
      } else {
        // Registered business: require both dropdown and input
        if (!selectedGrossSalesRange) {
          setError("Please select an annual gross sales range");
          return;
        }
        if (!inputtedGrossSales.trim()) {
          setError("Please enter your annual gross sales amount");
          return;
        }
        // Validate that inputted gross sales can find a closest range
        const matchingRate = findMatchingGrossSalesRate(inputtedGrossSales);
        if (!matchingRate) {
          setError("No valid gross sales range found for the entered amount");
          return;
        }
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
    
    // For new businesses, use the minimum value of selected range if no input
    let grossSalesValue = "";
    if (isBarangayClearance) {
      if (businessData.length === 0) {
        // New business: use minimum of selected range
        if (selectedGrossSalesRange) {
          const selectedRange = annualGrossSales.find(
            (sales) => sales.ags_id.toString() === selectedGrossSalesRange && !sales.ags_is_archive
          );
          grossSalesValue = selectedRange ? selectedRange.ags_minimum.toString() : "";
        }
      } else {
        // Registered business: use inputted value
        grossSalesValue = inputtedGrossSales || "";
      }
    } else {
      grossSalesValue = "N/A";
    }
    
    // Prepare schema validation data - include rp_id or br_id based on account type
    const schemaData: any = {
      cert_type: "permit",
      business_name: businessName || "",
      business_address: businessAddress || "",
      gross_sales: grossSalesValue,
      permit_image: isBarangayClearance ? (getPreviousPermitImageUri() || undefined) : undefined,
      assessment_image: isBarangayClearance ? (getAssessmentImageUri() || undefined) : undefined,
    };

    // Include rp_id if account has rp_id, otherwise include br_id
    if (user?.rp) {
      schemaData.rp_id = user.rp;
    } else if (user?.br) {
      schemaData.br_id = user.br;
    }

    const result = CertificationRequestSchema.safeParse(schemaData);
    
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
      let matchingGrossSales = null;
      
      if (businessData.length === 0) {
        // New business: use selected dropdown value
        if (selectedGrossSalesRange) {
          matchingGrossSales = annualGrossSales.find(
            (sales) => sales.ags_id.toString() === selectedGrossSalesRange && !sales.ags_is_archive
          );
        }
      } else {
        // Registered business: use inputted gross sales to find matching rate
        if (inputtedGrossSales.trim()) {
          matchingGrossSales = findMatchingGrossSalesRate(inputtedGrossSales);
        }
      }
      
      if (matchingGrossSales) {
        // Handle both string and number types from API (same as display logic)
        const rateValue = matchingGrossSales.ags_rate;
        reqAmount = typeof rateValue === 'string' ? parseFloat(rateValue) : Number(rateValue);
        if (isNaN(reqAmount)) reqAmount = 0;
        agsId = matchingGrossSales.ags_id;
      }
    } else {
      // For permit types, use rate from purpose and rates
      if (selectedPurpose?.pr_rate) {
        // Match web form: use Number() conversion consistently
        reqAmount = Number(selectedPurpose.pr_rate);
      }
    }

    // Prepare payload
    let payload: any = {
      cert_type: "permit",
      business_name: businessName,
      business_address: businessAddress,
      gross_sales: isBarangayClearance 
        ? (businessData.length === 0 
          ? (selectedGrossSalesRange 
            ? (annualGrossSales.find(s => s.ags_id.toString() === selectedGrossSalesRange && !s.ags_is_archive)?.ags_minimum.toString() || "")
            : "")
          : (inputtedGrossSales || ""))
        : "N/A",
      business_id: businessData.length > 0 ? businessData[0]?.bus_id : null, 
      pr_id: prId || null,
      req_amount: reqAmount || 0,
      ags_id: agsId || null,
      bus_clearance_gross_sales: isBarangayClearance 
        ? (businessData.length === 0
          ? (selectedGrossSalesRange
            ? (() => {
                const selectedRange = annualGrossSales.find(s => s.ags_id.toString() === selectedGrossSalesRange && !s.ags_is_archive);
                return selectedRange ? parseFloat(selectedRange.ags_minimum.toString()) : null;
              })()
            : null)
          : (inputtedGrossSales ? parseFloat(inputtedGrossSales) : null))
        : null,
    };

    // Include rp_id if account has rp_id, otherwise include br_id
    if (user?.rp) {
      payload.rp_id = user.rp;
    } else if (user?.br) {
      payload.br_id = user.br;
    }

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

  if (isLoading || isLoadingPurposes || isLoadingBusiness) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <LoadingState />
      </SafeAreaView>
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
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {error && (
              <Text className="text-red-500 mb-2 text-sm">{error}</Text>
            )}
            {addBusinessPermit.status === 'error' && (
              <Text className="text-red-500 mb-2 text-sm">Failed to submit request.</Text>
            )}

            {/* Business Status Info */}
            {!isLoadingBusiness && (
              <View className={`rounded-lg p-3 mb-3 ${
                !hasBusinessProfile 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                <View className="flex-row items-center mb-1">
                  <Ionicons 
                  name={!hasBusinessProfile ? "information-circle" : "checkmark-circle"} 
                    size={16} 
                  color={!hasBusinessProfile ? "#2563EB" : "#059669"} 
                  />
                  <Text className={`text-sm font-medium ml-2 ${
                    !hasBusinessProfile ? 'text-blue-800' : 'text-green-800'
                  }`}>
                    {!hasBusinessProfile ? 'No Registered Business' : 'Business Registered'}
                  </Text>
                </View>
                <Text className={`text-xs ${
                  !hasBusinessProfile ? 'text-blue-600' : 'text-green-600'
                }`}>
                  {!hasBusinessProfile 
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
                !hasBusinessProfile 
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
                    {/* Dropdown - Only show for residents WITHOUT a registered business */}
                    {businessData.length === 0 && (
                      <>
                        <Text className="text-sm font-medium text-gray-700 mb-2">Annual Gross Sales Range</Text>
                        <SelectLayout
                          label=""
                          options={grossSalesDropdownOptions}
                          selectedValue={selectedGrossSalesRange}
                          onSelect={(option) => handleGrossSalesRangeSelect(option.value)}
                          placeholder="Select annual gross sales range"
                          disabled={false}
                          className="mb-3"
                        />
                      </>
                    )}
                    
                    {/* Input field - Only show for residents WITH a registered business */}
                    {businessData.length > 0 && (
                      <>
                        <Text className="text-sm font-medium text-gray-700 mb-2">Annual Gross Sales Amount</Text>
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
                          allowCrop={false}
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
                        allowCrop={false}
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
                        let matchingGrossSales = null;
                        
                        if (!hasBusinessProfile) {
                          // New business profile: use selected dropdown value
                          if (selectedGrossSalesRange) {
                            matchingGrossSales = annualGrossSales.find(
                              (sales) => sales.ags_id.toString() === selectedGrossSalesRange && !sales.ags_is_archive
                            );
                          }
                        } else {
                          // Registered business profile: use inputted gross sales to find matching rate
                          if (inputtedGrossSales.trim()) {
                            matchingGrossSales = findMatchingGrossSalesRate(inputtedGrossSales);
                          }
                        }
                        
                        if (matchingGrossSales) {
                          // Match web form: use Number() conversion consistently
                          // Handle both string and number types from API
                          const rateValue = matchingGrossSales.ags_rate;
                          const rate = typeof rateValue === 'string' ? parseFloat(rateValue) : Number(rateValue);
                          if (isNaN(rate)) return '₱0.00';
                          return `₱${rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        }
                        return '₱0.00';
                      } else {
                        // For permit types, use rate from purpose and rates
                        const selectedPurpose = purposeAndRates.find(p => p.pr_purpose === permitType);
                        if (selectedPurpose) {
                          // Match web form: use Number() conversion consistently
                          const rate = Number(selectedPurpose.pr_rate);
                          return `₱${rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        }
                        return '₱0.00';
                      }
                    })()}
                  </Text>
                </View>

                {/* Submit Button */}
                {!isLoadingBusiness && !Boolean(isLoading) && (hasBusinessProfile || isBarangayClearance) ? (
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
                          Submitting...
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
