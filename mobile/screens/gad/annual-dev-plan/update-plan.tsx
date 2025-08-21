import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { updateAnnualDevPlan } from './restful-api/annualDevPlanPutAPI';
import { getAnnualDevPlanById } from './restful-api/annualDevPlanGetAPI';

const UpdatePlan = () => {
  const { planId } = useLocalSearchParams();
  const [formData, setFormData] = useState({
    month: '',
    genderIssue: '',
    clientFocused: '',
    gadProgram: '',
    performanceIndicator: '',
    budgetName: '',
    pax: '',
    price: '',
    responsiblePerson: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch existing plan data
  useEffect(() => {
    const fetchPlanData = async () => {
      if (!planId) return;
      
      try {
        const data = await getAnnualDevPlanById(Array.isArray(planId) ? planId[0] : planId);
        setFormData({
          month: data.dev_date || '',
          genderIssue: data.dev_issue || '',
          clientFocused: data.dev_client || '',
          gadProgram: data.dev_project || '',
          performanceIndicator: data.dev_indicator || '',
          budgetName: data.budgets?.[0]?.gdb_name || '',
          pax: data.budgets?.[0]?.gdb_pax?.toString() || '',
          price: data.budgets?.[0]?.gdb_price?.toString() || '',
          responsiblePerson: data.dev_res_person || '',
        });
      } catch (error) {
        console.error('Error fetching plan data:', error);
        Alert.alert('Error', 'Failed to load plan data');
      } finally {
        setIsFetching(false);
      }
    };

    fetchPlanData();
  }, [planId]);

  const handleUpdate = async () => {
    // Validate required fields
    if (!formData.month || !formData.genderIssue || !formData.clientFocused || 
        !formData.gadProgram || !formData.performanceIndicator || !formData.responsiblePerson) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!planId) {
      Alert.alert('Error', 'Plan ID not found');
      return;
    }

    setIsLoading(true);
    try {
      await updateAnnualDevPlan(Array.isArray(planId) ? planId[0] : planId, formData);
      Alert.alert('Success', 'Annual development plan updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      console.error('Error updating plan:', error);
      Alert.alert('Error', 'Failed to update annual development plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-blue-50">
      <View className="p-6">
        {/* Header */}
        <View className="items-center mb-10 pt-4">
          <Text className="text-3xl font-bold text-gray-800 mb-3">
            Update Activity
          </Text>
          <Text className="text-lg text-gray-600">
            Annual Development Plan 2025
          </Text>
        </View>

        {/* Form Fields */}
        <View className="space-y-10">
          {/* Month */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-3">Month</Text>
            <View className="flex-row items-center bg-white rounded-xl p-4 shadow-sm">
              <TextInput
                className="flex-1 text-gray-800"
                placeholder="Month"
                value={formData.month}
                onChangeText={(text) => setFormData({...formData, month: text})}
              />
              <Ionicons name="calendar" size={20} color="#6B7280" />
            </View>
          </View>

          {/* Gender Issue */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-3">
              Gender Issue or GAD Mandate:
            </Text>
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <TextInput
                className="text-gray-800"
                placeholder="Title"
                value={formData.genderIssue}
                onChangeText={(text) => setFormData({...formData, genderIssue: text})}
              />
            </View>
          </View>

          {/* Client Focused */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-3">Client Focused</Text>
            <View className="flex-row items-center bg-white rounded-xl p-4 shadow-sm">
              <TextInput
                className="flex-1 text-gray-800"
                placeholder="Select option"
                value={formData.clientFocused}
                onChangeText={(text) => setFormData({...formData, clientFocused: text})}
              />
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </View>
          </View>

          {/* GAD Program */}
          <View className="mt-2">
            <Text className="text-sm font-medium text-gray-700 mb-3">
              GAD Program/Project/Activity:
            </Text>
            <View className="bg-white rounded-xl p-5 shadow-sm">
              <TextInput
                className="text-gray-800 min-h-[100px]"
                placeholder="Enter details..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={formData.gadProgram}
                onChangeText={(text) => setFormData({...formData, gadProgram: text})}
              />
            </View>
          </View>

          {/* Performance Indicator */}
          <View className="mt-2">
            <Text className="text-sm font-medium text-gray-700 mb-3">
              Performance Indicator and Target:
            </Text>
            <View className="bg-white rounded-xl p-5 shadow-sm">
              <TextInput
                className="text-gray-800 min-h-[100px]"
                placeholder="Enter details..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={formData.performanceIndicator}
                onChangeText={(text) => setFormData({...formData, performanceIndicator: text})}
              />
            </View>
          </View>

          {/* GAD Budget Section */}
          <View className="mt-4">
            <Text className="text-xl font-bold text-gray-800 mb-6">GAD Budget</Text>
            
            <View className="space-y-6">
              {/* Name */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-3">Name</Text>
                <View className="flex-row items-center bg-white rounded-xl p-4 shadow-sm">
                  <TextInput
                    className="flex-1 text-gray-800"
                    placeholder="Select name"
                    value={formData.budgetName}
                    onChangeText={(text) => setFormData({...formData, budgetName: text})}
                  />
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </View>
              </View>

              {/* Pax */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-3">Pax</Text>
                <View className="flex-row items-center bg-white rounded-xl p-4 shadow-sm">
                  <TextInput
                    className="flex-1 text-gray-800"
                    placeholder="0"
                    keyboardType="numeric"
                    value={formData.pax}
                    onChangeText={(text) => setFormData({...formData, pax: text})}
                  />
                  <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-1">
                    <Text className="text-sm text-gray-600 mr-1">pc/s</Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                  </View>
                </View>
              </View>

              {/* Price */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-3">Price</Text>
                <View className="bg-white rounded-xl p-4 shadow-sm">
                  <TextInput
                    className="text-gray-800"
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={formData.price}
                    onChangeText={(text) => setFormData({...formData, price: text})}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Responsible Person Section */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-3">Responsible Person</Text>
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <TextInput
                className="text-gray-800"
                placeholder="Enter responsible person name"
                value={formData.responsiblePerson}
                onChangeText={(text) => setFormData({...formData, responsiblePerson: text})}
              />
            </View>
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          className={`rounded-xl py-5 mt-12 shadow-lg ${isLoading ? 'bg-gray-400' : 'bg-orange-500'}`}
          onPress={handleUpdate}
          activeOpacity={0.8}
          disabled={isLoading || isFetching}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {isLoading ? 'Updating...' : isFetching ? 'Loading...' : 'Update Plan'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default UpdatePlan;
