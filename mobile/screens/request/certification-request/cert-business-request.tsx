import React, { useState, useEffect } from "react";
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
import _ScreenLayout from '@/screens/_ScreenLayout';

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

  const addBusinessPermit = useAddBusinessPermit();
  const { data: purposeAndRates = [], isLoading: isLoadingPurposes } = usePurposeAndRates();
  const { data: annualGrossSales = [], isLoading: isLoadingGrossSales } = useAnnualGrossSales();
  const rp = (user as any)?.rp ?? "";
  const { data: businessResponse = { results: [] }, isLoading: isLoadingBusiness, error: businessError } = useBusinessByResidentId(
    rp
  );
  const businessData = businessResponse?.results || [];

  
    useEffect(() => {
    if (businessData && businessData.length > 0) {
      const business = businessData[0]; 
      
      setBusinessName(business.bus_name || "");
      
      const addressParts = [
        business.bus_street,
        business.sitio
      ].filter(Boolean); 
      
      const fullAddress = addressParts.join(", ");
      setBusinessAddress(fullAddress || "Address not available");
      
      setGrossSales(business.bus_gross_sales?.toString() || "");
      
      setIsBusinessOld(!!business.bus_date_verified);
    }
  }, [businessData, isLoadingBusiness]);

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

  
  // Filter options based on business existence
  const permitTypeOptions: DropdownOption[] = (() => {
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
  })();

  // Convert gross sales data to dropdown options for residents without business
  const grossSalesOptions: DropdownOption[] = annualGrossSales
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

  
  const handleSubmit = () => {
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

    // Validate required images (only for non-Business Clearance)
    if (permitType !== 'Business Clearance') {
      if (isBusinessOld && !previousPermitImage) {
        setError("Previous permit image is required for existing businesses");
        return;
      }
      if (!assessmentImage) {
        setError("Assessment image is required");
        return;
      }
    }
    

    
    const result = CertificationRequestSchema.safeParse({
      cert_type: "permit",
      business_name: businessName || "",
      business_address: businessAddress || "",
      gross_sales: businessData.length === 0 ? (selectedGrossSalesRange || "") : (grossSales || ""),
      rp_id: rp,
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

    addBusinessPermit.mutate({
      cert_type: "permit",
      business_name: businessName,
      business_address: businessAddress,
      gross_sales: businessData.length === 0 ? selectedGrossSalesRange : grossSales,
      business_id: businessData.length > 0 ? businessData[0]?.bus_id : undefined, 
      pr_id: selectedPurpose?.pr_id, // Add the purpose and rates ID
      rp_id: rp,
      req_amount: reqAmount, // Add the required amount field
      ags_id: agsId || undefined, // Add the annual gross sales ID
      previous_permit_image: previousPermitImage || undefined,
      assessment_image: assessmentImage || undefined,
    });
  };

  // Show loading screen while auth is loading
  if (isLoading) {
    return (
      <_ScreenLayout
        customLeftAction={
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
        }
        headerBetweenAction={<Text className="text-[13px]">Submit a Request</Text>}
        customRightAction={<View className="w-10 h-10" />}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00AFFF" />
          <Text className="text-gray-600 text-base mt-4">Loading...</Text>
        </View>
      </_ScreenLayout>
    );
  }

  return (
    <_ScreenLayout
      customLeftAction={
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Submit a Request</Text>}
      customRightAction={<View className="w-10 h-10" />}
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

        <ScrollView showsVerticalScrollIndicator={false}>
        
        
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
              onChangeText={
                permitType === 'Business Clearance' && businessData.length === 0 
                  ? setBusinessName 
                  : undefined
              }
              editable={permitType === 'Business Clearance' && businessData.length === 0}
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
              onChangeText={
                permitType === 'Business Clearance' && businessData.length === 0 
                  ? setBusinessAddress 
                  : undefined
              }
              editable={permitType === 'Business Clearance' && businessData.length === 0}
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

            {/* Image Upload Section - Only show for non-Business Clearance */}
            {permitType !== 'Business Clearance' && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-3">Required Documents</Text>
                
                {/* Business Status Indicator */}
                <View className={`rounded-lg p-3 mb-3 ${isBusinessOld ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'}`}>
                  <Text className={`text-sm font-medium ${isBusinessOld ? 'text-blue-800' : 'text-green-800'}`}>
                    {isBusinessOld ? 'Existing Business' : 'New Business'}
                  </Text>
                  <Text className={`text-xs ${isBusinessOld ? 'text-blue-600' : 'text-green-600'} mt-1`}>
                    {isBusinessOld ? 'Previous permit and assessment required' : 'Assessment only required'}
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
                      <Text className="text-gray-400 text-xs mt-1">Required for all businesses</Text>
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

            {/* Submit Button */}
            {!isLoadingBusiness && !Boolean(isLoading) && (businessData.length > 0 || permitType === 'Business Clearance') ? (
              <TouchableOpacity
                className={`bg-[#00AFFF] rounded-xl py-4 items-center mt-2 mb-8 ${addBusinessPermit.status === 'pending' ? 'opacity-50' : ''}`}
                activeOpacity={0.85}
                onPress={handleSubmit}
                disabled={addBusinessPermit.status === 'pending'}
              >
                <Text className="text-white font-semibold text-base">
                  {addBusinessPermit.status === 'pending' ? 'Submitting...' : 'Submit'}
                </Text>
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
    </_ScreenLayout>
  );
};

export default CertPermit;
