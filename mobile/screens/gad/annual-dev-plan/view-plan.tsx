import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { getAnnualDevPlansByYear } from './restful-api/annualDevPlanGetAPI';

interface BudgetItem {
  gdb_id?: number;
  gdb_name: string;
  gdb_pax: string;
  gdb_price: string;
}

interface DevelopmentPlan {
  dev_id: number;
  dev_date: string;
  dev_client: string;
  dev_issue: string;
  dev_project: string;
  dev_indicator: string;
  dev_gad_budget: string;
  dev_res_person: string;
  staff: string;
  budgets?: BudgetItem[];
}

const ViewPlan = () => {
  const { year } = useLocalSearchParams();
  const [plans, setPlans] = useState<DevelopmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (year) {
      fetchPlans();
    }
  }, [year]);

  const fetchPlans = async () => {
    try {
      const yearValue = Array.isArray(year) ? year[0] : year;
      const data = await getAnnualDevPlansByYear(yearValue);
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      Alert.alert('Error', 'Failed to fetch annual development plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (devId: number) => {
    router.push({
      pathname: '/gad/annual-dev-plan/update-plan',
      params: { planId: devId.toString() }
    });
  };

  const handleCreate = () => {
    router.push('/gad/annual-dev-plan/create-plan');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const calculateTotal = () => {
    return plans.reduce((sum, plan) => sum + parseFloat(plan.dev_gad_budget), 0).toFixed(2);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-blue-50 justify-center items-center">
        <Text className="text-gray-600 text-lg">Loading data...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-blue-50">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-center mb-4 pt-12">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-3 p-2"
          >
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800">
              Annual Development Plan
            </Text>
            <Text className="text-lg font-semibold text-blue-600">
              Year {year}
            </Text>
          </View>
        </View>

        {/* Create Button */}
        <View className="mb-4">
          <TouchableOpacity
            className="bg-orange-500 rounded-xl py-3 px-4 shadow-sm"
            onPress={handleCreate}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Create New Plan</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Plans List */}
        {plans.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="document-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg mt-4 text-center">
              No development plans found for this year.
            </Text>
          </View>
        ) : (
          <View className="space-y-4">
            {plans.map((plan, index) => (
              <View key={plan.dev_id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                {/* Plan Header */}
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-blue-900 underline">
                      {plan.dev_client}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      {formatDate(plan.dev_date)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleEdit(plan.dev_id)}
                    className="bg-blue-500 rounded-lg p-2 ml-2"
                  >
                    <Ionicons name="create-outline" size={16} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Gender Issue */}
                <View className="mb-3">
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Gender Issue or GAD Mandate:
                  </Text>
                  <Text className="text-sm text-gray-800 bg-gray-50 p-2 rounded-lg">
                    {plan.dev_issue}
                  </Text>
                </View>

                {/* GAD Program */}
                <View className="mb-3">
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    GAD Program/Project/Activity:
                  </Text>
                  <Text className="text-sm text-gray-800 bg-gray-50 p-2 rounded-lg">
                    {plan.dev_project}
                  </Text>
                </View>

                {/* Performance Indicator */}
                <View className="mb-3">
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Performance Indicator and Target:
                  </Text>
                  <Text className="text-sm text-gray-800 bg-gray-50 p-2 rounded-lg">
                    {plan.dev_indicator}
                  </Text>
                </View>

                {/* Budget Section */}
                <View className="mb-3">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    GAD Budget:
                  </Text>
                  {plan.budgets && plan.budgets.length > 0 ? (
                    plan.budgets.map((item, idx) => (
                      <View key={item.gdb_id || idx} className="bg-blue-50 p-3 rounded-lg mb-2">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-sm font-medium text-gray-800">
                            {item.gdb_name}
                          </Text>
                          <Text className="text-sm font-bold text-green-600">
                            ₱{item.gdb_price}
                          </Text>
                        </View>
                        <Text className="text-xs text-gray-600">
                          Quantity: {item.gdb_pax} pcs
                        </Text>
                      </View>
                    ))
                  ) : (
                    <View className="bg-blue-50 p-3 rounded-lg">
                      <Text className="text-sm font-bold text-green-600">
                        Total Budget: ₱{plan.dev_gad_budget}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Responsible Person */}
                <View className="border-t border-gray-200 pt-3">
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Responsible Person:
                  </Text>
                  <Text className="text-sm text-gray-800 bg-gray-50 p-2 rounded-lg">
                    {plan.dev_res_person}
                  </Text>
                </View>
              </View>
            ))}

            {/* Total Summary */}
            <View className="bg-gray-100 rounded-xl p-4 mt-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-bold text-gray-800">
                  Total Budget
                </Text>
                <Text className="text-xl font-bold text-green-600">
                  ₱{calculateTotal()}
                </Text>
              </View>
              <Text className="text-sm text-gray-600 mt-1">
                {plans.length} plan{plans.length !== 1 ? 's' : ''} for Year {year}
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ViewPlan;
