import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAddBusinessPermit } from "./queries/certificationReqInsertQueries";
import { CertificationRequestSchema } from "@/form-schema/certificates/certification-request-schema";
import { usePurposeAndRates, useAnnualGrossSales, useBusinessByResidentId, type PurposeAndRate, type AnnualGrossSales, type Business } from "./queries/certificationReqFetchQueries";
import { SelectLayout, DropdownOption } from "@/components/ui/select-layout";

const CertPermit: React.FC = () => {
  const router = useRouter();

  // naay business
  const RESIDENT_ID = "00001250821"; 
  // walay business
  // const RESIDENT_ID = "00038250827";
  
  const [permitType, setPermitType] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [grossSales, setGrossSales] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Image upload states
  const [previousPermitImage, setPreviousPermitImage] = useState<string | null>(null);
  const [assessmentImage, setAssessmentImage] = useState<string | null>(null);
  const [isBusinessOld, setIsBusinessOld] = useState(false);

  const addBusinessPermit = useAddBusinessPermit();
  const { data: purposeAndRates = [], isLoading: isLoadingPurposes } = usePurposeAndRates();
  const { data: annualGrossSales = [], isLoading: isLoadingGrossSales } = useAnnualGrossSales();
  const { data: businessResponse = { results: [] }, isLoading: isLoadingBusiness, error: businessError } = useBusinessByResidentId(RESIDENT_ID);
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

  
  const permitTypeOptions: DropdownOption[] = permitPurposes.map(purpose => ({
    label: `${purpose.pr_purpose}`,
    value: purpose.pr_purpose
  }));

  // Convert gross sales data to dropdown options like in web
  const grossSalesOptions: DropdownOption[] = annualGrossSales
    .filter(sales => sales.ags_is_archive === false)
    .map(sales => ({
      label: `₱${sales.ags_minimum} - ₱${sales.ags_maximum}`,
      value: `${sales.ags_minimum} - ${sales.ags_maximum}`
    }));

  
  const handleSubmit = () => {
    setError(null);
    
    // Prevent submission if no business exists
    if (businessData.length === 0) {
      setError("Cannot submit request: No business registered under this resident");
      return;
    }
    
    // Validate required images
    if (isBusinessOld && !previousPermitImage) {
      setError("Previous permit image is required for existing businesses");
      return;
    }
    if (!assessmentImage) {
      setError("Assessment image is required");
      return;
    }
    
    const result = CertificationRequestSchema.safeParse({
      cert_type: "permit",
      business_name: businessName,
      business_address: businessAddress,
      gross_sales: grossSales,
      rp_id: RESIDENT_ID,
      previous_permit_image: previousPermitImage,
      assessment_image: assessmentImage,
    });
    
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    
    addBusinessPermit.mutate({
      cert_type: "permit",
      business_name: businessName,
      business_address: businessAddress,
      gross_sales: grossSales,
      rp_id: RESIDENT_ID,
      previous_permit_image: previousPermitImage || undefined,
      assessment_image: assessmentImage || undefined,
    });
  };

  return (
    <View className="flex-1  px-4 pt-8">
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
        {/* Back Button */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="bg-white rounded-full w-10 h-10 items-center justify-center shadow-sm border border-gray-100"
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 ml-3">Clearance for Permit</Text>
        </View>
        
        
        {error && (
          <Text className="text-red-500 mb-2 text-sm">{error}</Text>
        )}
                 {addBusinessPermit.status === 'error' && (
           <Text className="text-red-500 mb-2 text-sm">Failed to submit request.</Text>
         )}
         
                   {/* No Business Message */}
         {!isLoadingBusiness && businessData.length === 0 && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text className="text-red-800 text-base font-semibold ml-2">
                Cannot Request Business Permit
              </Text>
            </View>
            <Text className="text-red-700 text-sm leading-5">
              You cannot request a business permit because no business is registered under your name. 
              Please register a business first before applying for a permit.
            </Text>
          </View>
        )}

        {/* Permit Type Dropdown */}
        <SelectLayout
          label="Type of Clearance"
          options={permitTypeOptions}
          selectedValue={permitType}
          onSelect={(option) => setPermitType(option.value)}
          placeholder={isLoadingPurposes ? "Loading..." : "Select clearance type"}
          disabled={isLoadingPurposes}
          className="mb-3"
        />

      
        {/* Business Name */}
        <Text className="text-sm font-medium text-gray-700 mb-2">Business Name</Text>
        <TextInput
          className="rounded-lg bg-gray-100 px-3 py-3 mb-3 border border-gray-200 text-base text-gray-600"
          placeholder={isLoadingBusiness ? "Loading business details..." : "No business found"}
          placeholderTextColor="#888"
          value={businessName}
          editable={false}
        />

        {/* Business Address */}
        <Text className="text-sm font-medium text-gray-700 mb-2">Business Address</Text>
        <TextInput
          className="rounded-lg bg-gray-100 px-3 py-3 mb-3 border border-gray-200 text-base text-gray-600"
          placeholder={isLoadingBusiness ? "Loading business details..." : "No business found"}
          placeholderTextColor="#888"
          value={businessAddress}
          editable={false}
        />

        {/* Annual Gross Sales */}
        <Text className="text-sm font-medium text-gray-700 mb-2">Annual Gross Sales</Text>
        <TextInput
          className="rounded-lg bg-gray-100 px-3 py-3 mb-3 border border-gray-200 text-base text-gray-600"
          placeholder={isLoadingBusiness ? "Loading business details..." : "No business found"}
          placeholderTextColor="#888"
          value={grossSales ? `₱${parseFloat(grossSales).toLocaleString()}` : ""}
          editable={false}
        />

        {/* Claim Date removed */}

        {/* Image Upload Section */}
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

        {/* Amount to be Paid */}
        {permitType && (
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
            <Text className="text-green-800 text-sm font-medium mb-1">Amount to be Paid:</Text>
            <Text className="text-green-700 text-lg font-bold">
              {(() => {
                const selectedPurpose = purposeAndRates.find(p => p.pr_purpose === permitType);
                return selectedPurpose ? `₱${selectedPurpose.pr_rate.toLocaleString()}` : '₱0';
              })()}
            </Text>
          </View>
        )}

        {/* Submit Button */}
        {!isLoadingBusiness && businessData.length > 0 ? (
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
              Cannot Request Business Permit
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default CertPermit;
