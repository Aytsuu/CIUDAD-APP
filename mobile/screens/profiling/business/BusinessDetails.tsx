import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  Linking,
} from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import { Card } from "@/components/ui/card";
import { Building } from "@/lib/icons/Building";
import { Calendar } from "@/lib/icons/Calendar";
import { MapPin } from "@/lib/icons/MapPin";
import { UserRound } from "@/lib/icons/UserRound";
import { Edit } from "@/lib/icons/Edit";
import { Phone } from "@/lib/icons/Phone";
import { Mail } from "@/lib/icons/Mail";
import { DollarSign } from "@/lib/icons/DollarSign";
import { FileText } from "@/lib/icons/FileText";
import { Download } from "@/lib/icons/Download";
import { Eye } from "@/lib/icons/Eye";
import { Briefcase } from "@/lib/icons/Briefcase";
import PageLayout from "@/screens/_PageLayout";
import { UsersRound } from "@/lib/icons/UsersRound";

export default function BusinessDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse the business data from params
  const business = React.useMemo(() => {
    try {
      return JSON.parse(params.business as string);
    } catch (error) {
      console.error('Error parsing business data:', error);
      return null;
    }
  }, [params.business]);

  React.useEffect(() => {
    if (!business) {
      Alert.alert('Error', 'Business data not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [business]);

  if (!business) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={
          <Text className="text-gray-900 text-[13px]">
            Business Details
          </Text>
        }
      >
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      </PageLayout>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getBusinessInitial = (businessName: string) => {
    return businessName ? businessName.charAt(0).toUpperCase() : 'B';
  };

  const handleEdit = () => {
    Alert.alert('Edit Business', 'Edit functionality will be implemented here');
  };

  const handleCallContact = (phoneNumber: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleEmailContact = (email: string) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const handleViewDocument = (document: any) => {
    Alert.alert('View Document', `Document: ${document.name || 'Unnamed Document'}`);
  };

  const InfoRow = ({ icon: Icon, label, value, valueColor = "text-gray-900", onPress }: { 
    icon: any, 
    label: string, 
    value: string | number,
    valueColor?: string,
    onPress?: () => void
  }) => (
    <TouchableOpacity 
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center py-3 border-b border-gray-100"
    >
      <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
        <Icon size={18} className="text-gray-600" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-sm">{label}</Text>
        <Text className={`text-base font-medium ${valueColor} ${onPress ? 'text-blue-600' : ''}`}>
          {value}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const businessName = business.bus_name || 'Unnamed Business';
  const respondentName = `${business.bus_respondentFname || ''} ${business.bus_respondentMname ? business.bus_respondentMname + ' ' : ''}${business.bus_respondentLname || ''}`.trim();
  const businessAddress = `${business.bus_street || ''}, ${business.sitio || ''}`.replace(/^,\s*|,\s*$/g, '');
  const registeredDate = formatDate(business.bus_date_registered);
  const registeredBy = business.bus_registered_by || 'N/A';
  const businessFiles = business.files || [];

  const renderDocumentCard = ({ item, index }: { item: any; index: number }) => {
    return (
      <TouchableOpacity
        onPress={() => handleViewDocument(item)}
        className="mb-3"
        activeOpacity={0.7}
      >
        <Card className="p-3 bg-gray-50 border border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <FileText size={18} className="text-blue-600" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-medium text-sm" numberOfLines={1}>
                  {item.name || `Document ${index + 1}`}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  {item.type || 'Unknown type'} • {item.size || 'Unknown size'}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity className="p-2">
                <Eye size={16} className="text-gray-600" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2 ml-1">
                <Download size={16} className="text-gray-600" />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="text-gray-900 text-[13px]">
          Business Details
        </Text>
      }
      rightAction={
        <TouchableOpacity
          onPress={handleEdit}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Edit size={20} className="text-gray-700" />
        </TouchableOpacity>
      }
    >
      <ScrollView className="flex-1 bg-gray-50">
        {/* Business Header */}
        <Card className="mx-5 mt-4 p-6 bg-white shadow-sm border border-gray-100">
          <View className="items-center">
            <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
              <Text className="text-blue-600 font-bold text-3xl">
                {getBusinessInitial(businessName)}
              </Text>
            </View>
            <Text className="text-gray-900 font-bold text-xl text-center mb-2">
              {businessName}
            </Text>
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-600 font-medium text-sm">
                ID: {business.bus_id}
              </Text>
            </View>
          </View>
        </Card>

        {/* Business Overview */}
        <Card className="mx-5 mt-4 p-4 bg-white shadow-sm border border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-4">
            Business Overview
          </Text>
          
          <InfoRow 
            icon={Building} 
            label="Business Name" 
            value={businessName} 
          />
          
          <InfoRow 
            icon={Briefcase} 
            label="Business ID" 
            value={business.bus_id} 
          />
          
          {business.bus_type && (
            <InfoRow 
              icon={Building} 
              label="Business Type" 
              value={business.bus_type} 
            />
          )}
          
          {business.bus_category && (
            <InfoRow 
              icon={Briefcase} 
              label="Category" 
              value={business.bus_category} 
            />
          )}
          
          <InfoRow 
            icon={MapPin} 
            label="Address" 
            value={businessAddress || 'Not specified'} 
          />
          
          <InfoRow 
            icon={Calendar} 
            label="Date Registered" 
            value={registeredDate} 
          />
          
          <View className="flex-row items-center py-3">
            <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
              <UserRound size={18} className="text-gray-600" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-sm">Registered By</Text>
              <Text className="text-gray-900 text-base font-medium">{registeredBy}</Text>
            </View>
          </View>
        </Card>

        {/* Financial Information */}
        {business.bus_gross_sales && (
          <Card className="mx-5 mt-4 p-4 bg-white shadow-sm border border-gray-100">
            <Text className="text-gray-900 font-semibold text-lg mb-4">
              Financial Information
            </Text>
            
            <InfoRow 
              icon={DollarSign} 
              label="Gross Sales" 
              value={formatCurrency(business.bus_gross_sales)}
              valueColor="text-green-600"
            />
            
            {business.bus_net_income && (
              <InfoRow 
                icon={DollarSign} 
                label="Net Income" 
                value={formatCurrency(business.bus_net_income)}
                valueColor="text-green-600"
              />
            )}
            
            {business.bus_capital && (
              <InfoRow 
                icon={DollarSign} 
                label="Capital" 
                value={formatCurrency(business.bus_capital)}
                valueColor="text-blue-600"
              />
            )}
          </Card>
        )}

        {/* Contact Information */}
        {(respondentName || business.bus_respondentContact || business.bus_email) && (
          <Card className="mx-5 mt-4 p-4 bg-white shadow-sm border border-gray-100">
            <Text className="text-gray-900 font-semibold text-lg mb-4">
              Contact Information
            </Text>
            
            {respondentName && (
              <InfoRow 
                icon={UserRound} 
                label="Contact Person" 
                value={respondentName} 
              />
            )}
            
            {business.bus_respondentContact && (
              <InfoRow 
                icon={Phone} 
                label="Phone Number" 
                value={business.bus_respondentContact}
                onPress={() => handleCallContact(business.bus_respondentContact)}
              />
            )}
            
            {business.bus_email && (
              <InfoRow 
                icon={Mail} 
                label="Email Address" 
                value={business.bus_email}
                onPress={() => handleEmailContact(business.bus_email)}
              />
            )}
          </Card>
        )}

        {/* Business Operations */}
        <Card className="mx-5 mt-4 p-4 bg-white shadow-sm border border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-4">
            Business Operations
          </Text>
          
          {business.bus_employees && (
            <InfoRow 
              icon={UsersRound} 
              label="Number of Employees" 
              value={`${business.bus_employees} ${business.bus_employees === 1 ? 'Employee' : 'Employees'}`} 
            />
          )}
          
          {business.bus_operating_hours && (
            <InfoRow 
              icon={Calendar} 
              label="Operating Hours" 
              value={business.bus_operating_hours} 
            />
          )}
          
          {business.bus_status && (
            <InfoRow 
              icon={Building} 
              label="Business Status" 
              value={business.bus_status} 
            />
          )}
          
          {business.bus_permit_number && (
            <InfoRow 
              icon={FileText} 
              label="Permit Number" 
              value={business.bus_permit_number} 
            />
          )}
        </Card>

        {/* Documents */}
        {businessFiles.length > 0 && (
          <Card className="mx-5 mt-4 p-4 bg-white shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 font-semibold text-lg">
                Documents
              </Text>
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-blue-600 text-xs font-medium">
                  {businessFiles.length} {businessFiles.length === 1 ? 'Document' : 'Documents'}
                </Text>
              </View>
            </View>
            
            <FlatList
              data={businessFiles}
              renderItem={renderDocumentCard}
              keyExtractor={(item, index) => `doc-${index}`}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </Card>
        )}

        {/* Additional Information */}
        <Card className="mx-5 mt-4 mb-6 p-4 bg-white shadow-sm border border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-4">
            Additional Information
          </Text>
          
          {business.bus_description && (
            <View className="mb-4">
              <Text className="text-gray-500 text-sm mb-2">Business Description</Text>
              <Text className="text-gray-900 text-sm leading-5">
                {business.bus_description}
              </Text>
            </View>
          )}
          
          {business.bus_products_services && (
            <View className="mb-4">
              <Text className="text-gray-500 text-sm mb-2">Products/Services</Text>
              <Text className="text-gray-900 text-sm leading-5">
                {business.bus_products_services}
              </Text>
            </View>
          )}
          
          {business.bus_target_market && (
            <InfoRow 
              icon={UsersRound} 
              label="Target Market" 
              value={business.bus_target_market} 
            />
          )}
          
          {business.bus_years_operation && (
            <InfoRow 
              icon={Calendar} 
              label="Years in Operation" 
              value={`${business.bus_years_operation} ${business.bus_years_operation === 1 ? 'Year' : 'Years'}`} 
            />
          )}
          
          {business.remarks && (
            <View className="pt-3 border-t border-gray-100">
              <Text className="text-gray-500 text-sm mb-2">Remarks</Text>
              <Text className="text-gray-900 text-sm leading-5">
                {business.remarks}
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </PageLayout>
  );
}