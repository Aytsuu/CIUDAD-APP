import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { getAnnualDevPlansByYear } from './restful-api/annualDevPlanGetAPI';
import PageLayout from '@/screens/_PageLayout';
import { LoadingState } from '@/components/ui/loading-state';
import { ChevronLeft } from 'lucide-react-native';
import { useApprovedProposals } from '@/screens/council/resolution/queries/resolution-fetch-queries';
import { useResolution } from '@/screens/council/resolution/queries/resolution-fetch-queries';

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
  dev_mandated?: boolean;
  // Additional GAD fields
  status?: string;
  client_focused?: string;
  pax?: number;
  amount?: number;
  total?: number;
  project_proposal?: string;
  resolution?: string;
  participants?: string;
  date_created?: string;
  description?: string;
}

const ViewPlan = () => {
  const { year } = useLocalSearchParams();
  const [plans, setPlans] = useState<DevelopmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch GAD Project Proposals and Resolutions to determine status
  const { data: proposals = [] } = useApprovedProposals();
  const { data: resolutionData = { results: [], count: 0 } } = useResolution();

  // Build quick lookup maps for status determination
  const proposalByDevId = useMemo(() => {
    const map = new Map<number, any>();
    const proposalsList = Array.isArray(proposals) ? proposals : [];
    // Note: Mobile proposals don't have devId field, so we can't link them to development plans
    // This means "With Project Proposal" badge won't show in mobile version
    return map;
  }, [proposals]);

  const resolutionByGprId = useMemo(() => {
    const set = new Set<number>();
    const resolutionsList = resolutionData.results || [];
    resolutionsList.forEach((r: any) => {
      const gprId = r?.gpr_id;
      if (gprId && typeof gprId === 'number') {
        set.add(gprId);
      }
    });
    return set;
  }, [resolutionData]);

  // Function to get status badges for a plan
  const getStatusBadges = (plan: DevelopmentPlan) => {
    const badges: React.ReactElement[] = [];

    if (plan.dev_mandated) {
      badges.push(
        <View key="mandated" className="bg-green-100 px-2 py-1 rounded-full mr-1 mb-1">
          <Text className="text-xs font-medium text-green-800">Mandated</Text>
        </View>
      );
    }

    // Note: Mobile API doesn't support linking proposals and resolutions to development plans
    // So we can only show the mandated status
    
    if (badges.length === 0) {
      badges.push(
        <View key="no-status" className="bg-gray-100 px-2 py-1 rounded-full mr-1 mb-1">
          <Text className="text-xs font-medium text-gray-600">No Status</Text>
        </View>
      );
    }

    return badges;
  };

  useEffect(() => {
    if (year) {
      fetchPlans();
    }
  }, [year]);

  const fetchPlans = async () => {
    try {
      const yearValue = Array.isArray(year) ? year[0] : year;
      const data = await getAnnualDevPlansByYear(yearValue);
      
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setPlans(data);
      } else if (data && Array.isArray(data.results)) {
        setPlans(data.results);
      } else if (data && Array.isArray(data.data)) {
        setPlans(data.data);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      Alert.alert('Error', 'Failed to fetch annual development plans');
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatIndicator = (indicator: string) => {
    if (!indicator) return '';
    
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(indicator);
      
      // Handle arrays
      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => {
          // If array contains objects, extract meaningful values
          if (typeof item === 'object' && item !== null) {
            const entries = Object.entries(item);
            const meaningfulPairs = entries.filter(([key, val]) => val !== null && val !== undefined && val !== '');
            
            if (meaningfulPairs.length > 0) {
              const formattedPairs = meaningfulPairs.map(([key, val]) => `${key}: ${val}`).join(' - ');
              return `${index + 1}. ${formattedPairs}`;
            }
            return `${index + 1}. ${JSON.stringify(item)}`;
          }
          // If array contains strings or primitives
          return `${index + 1}. ${item}`;
        }).join('\n');
      }
      
      // Handle objects
      if (typeof parsed === 'object' && parsed !== null) {
        const values = Object.values(parsed).filter(val => val && typeof val === 'string');
        return values.length > 0 ? values.join('\n• ') : JSON.stringify(parsed, null, 2);
      }
      
      return String(parsed);
    } catch {
      // If not JSON, return as is
      return indicator;
    }
  };

  const calculateTotal = () => {
    if (!plans || !Array.isArray(plans)) return "0.00";
    return plans.reduce((sum, plan) => sum + parseFloat(String(plan.dev_gad_budget || 0)), 0).toFixed(2);
  };

  if (isLoading) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={20} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Annual Development Plan</Text>}
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
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Year {year}</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-gray-50">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-6">

        {/* Plans List */}
        {(!plans || !Array.isArray(plans) || plans.length === 0) ? (
          <View className="flex-1 justify-center items-center py-20">
            <View className="bg-gray-100 rounded-full p-4 mb-4">
              <Ionicons name="document-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-gray-700 text-lg font-medium mb-2 text-center">
              No development plans found for this year
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              Development plans for Year {year} will appear here
            </Text>
          </View>
        ) : (
          <View className="space-y-8">
            {plans.map((plan, index) => (
              <View key={plan.dev_id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
                {/* Plan Header */}
                <View className="flex-row justify-between items-start mb-5">
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900 mb-2">
                      {plan.dev_client}
                    </Text>
                    <View className="bg-blue-50 px-3 py-2 rounded-lg">
                      <Text className="text-sm font-medium text-blue-700">
                        {formatDate(plan.dev_date)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Status Badges */}
                <View className="flex-row flex-wrap mb-5">
                  {getStatusBadges(plan)}
                </View>

                {/* Quick Info Row */}
                <View className="bg-gray-50 p-4 rounded-xl mb-5">
                  <View className="flex-row flex-wrap justify-between">
                    {/* Client Focused */}
                    {plan.client_focused && (
                      <View className="w-1/2 mb-3">
                        <Text className="text-xs font-semibold text-gray-600 mb-1">Client Focused</Text>
                        <Text className="text-sm text-gray-800">{plan.client_focused}</Text>
                      </View>
                    )}
                    
                    {/* Pax */}
                    {plan.pax && (
                      <View className="w-1/2 mb-3">
                        <Text className="text-xs font-semibold text-gray-600 mb-1">Pax</Text>
                        <Text className="text-sm text-gray-800">{plan.pax}</Text>
                      </View>
                    )}
                    
                    {/* Amount */}
                    {plan.amount && (
                      <View className="w-1/2 mb-3">
                        <Text className="text-xs font-semibold text-gray-600 mb-1">Amount (PHP)</Text>
                        <Text className="text-sm font-bold text-green-600">₱{plan.amount.toLocaleString()}</Text>
                      </View>
                    )}
                    
                    {/* Total */}
                    {plan.total && (
                      <View className="w-1/2 mb-3">
                        <Text className="text-xs font-semibold text-gray-600 mb-1">Total</Text>
                        <Text className="text-sm font-bold text-green-600">₱{plan.total.toLocaleString()}</Text>
                      </View>
                    )}
                    
                    {/* Status */}
                    {plan.status && (
                      <View className="w-1/2 mb-3">
                        <Text className="text-xs font-semibold text-gray-600 mb-1">Status</Text>
                        <View className="bg-green-100 px-2 py-1 rounded-full">
                          <Text className="text-[10px] font-medium text-green-700">{plan.status}</Text>
                        </View>
                      </View>
                    )}
                    
                    {/* Responsible Person */}
                    <View className="w-full">
                      <Text className="text-xs font-semibold text-gray-600 mb-1">Responsible Person</Text>
                      <Text className="text-sm text-gray-800">{plan.dev_res_person}</Text>
                    </View>
                  </View>
                </View>

                {/* Gender Issue */}
                <View className="mb-5">
                  <Text className="text-base font-bold text-gray-800 mb-3">
                    Gender Issue or GAD Mandate
                  </Text>
                  <View className="bg-red-50 p-4 rounded-xl border-l-4 border-red-400">
                    <Text className="text-sm text-gray-800 leading-6">
                      {plan.dev_issue}
                    </Text>
                  </View>
                </View>

                {/* GAD Program */}
                <View className="mb-5">
                  <Text className="text-base font-bold text-gray-800 mb-3">
                    GAD Program/Project/Activity
                  </Text>
                  <View className="bg-green-50 p-4 rounded-xl border-l-4 border-green-400">
                    <Text className="text-sm text-gray-800 leading-6">
                      {plan.dev_project}
                    </Text>
                  </View>
                </View>

                {/* Performance Indicator */}
                <View className="mb-5">
                  <Text className="text-base font-bold text-gray-800 mb-3">
                    Performance Indicator and Target
                  </Text>
                  <View className="bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-400">
                    <Text className="text-sm text-gray-800 leading-6">
                      {formatIndicator(plan.dev_indicator)}
                    </Text>
                  </View>
                </View>

                {/* Budget Section */}
                <View className="mb-5">
                  <Text className="text-base font-bold text-gray-800 mb-3">
                    GAD Budget
                  </Text>
                  {plan.budgets && plan.budgets.length > 0 ? (
                    plan.budgets.map((item, idx) => (
                      <View key={item.gdb_id || idx} className="bg-purple-50 p-4 rounded-xl mb-3 border-l-4 border-purple-400">
                        <View className="flex-row justify-between items-center mb-2">
                          <Text className="text-sm font-semibold text-gray-800">
                            {item.gdb_name}
                          </Text>
                          <View className="bg-green-100 px-3 py-1 rounded-full">
                            <Text className="text-sm font-bold text-green-700">
                              ₱{item.gdb_price}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row items-center">
                          <Text className="text-xs text-gray-600">
                            Quantity: {item.gdb_pax} pcs
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View className="bg-purple-50 p-4 rounded-xl border-l-4 border-purple-400">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-medium text-gray-700">Total Budget</Text>
                        <View className="bg-green-100 px-3 py-1 rounded-full">
                          <Text className="text-sm font-bold text-green-700">
                            ₱{plan.dev_gad_budget}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>


                {/* Project Proposal & Resolution */}
                {(plan.project_proposal || plan.resolution) && (
                  <View className="mb-5">
                    <Text className="text-base font-bold text-gray-800 mb-3">
                      Documents
                    </Text>
                    <View className="bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-400">
                      {plan.project_proposal && (
                        <View className="mb-2">
                          <Text className="text-xs font-semibold text-gray-600 mb-1">Project Proposal:</Text>
                          <Text className="text-sm text-gray-800">{plan.project_proposal}</Text>
                        </View>
                      )}
                      {plan.resolution && (
                        <View>
                          <Text className="text-xs font-semibold text-gray-600 mb-1">Resolution:</Text>
                          <Text className="text-sm text-gray-800">{plan.resolution}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Date Created */}
                {plan.date_created && (
                  <View className="mb-5">
                    <Text className="text-base font-bold text-gray-800 mb-3">
                      Date Created
                    </Text>
                    <View className="bg-red-50 p-4 rounded-xl border-l-4 border-red-400">
                      <Text className="text-sm text-gray-800">
                        {new Date(plan.date_created).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Description */}
                {plan.description && (
                  <View className="mb-5">
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
                      <Text className="text-base font-bold text-gray-800 ml-2">
                        Description
                      </Text>
                    </View>
                    <View className="bg-gray-50 p-4 rounded-xl border-l-4 border-gray-400">
                      <Text className="text-sm text-gray-800">
                        {plan.description}
                      </Text>
                    </View>
                  </View>
                )}

              </View>
            ))}

            {/* Total Summary */}
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mt-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-bold text-gray-900">
                  Total Budget
                </Text>
                <View className="bg-blue-50 px-3 py-2 rounded-lg">
                  <Text className="text-lg font-bold text-blue-600">
                    ₱{calculateTotal()}
                  </Text>
                </View>
              </View>
              <View className="bg-gray-50 px-3 py-2 rounded-lg">
                <Text className="text-sm font-medium text-gray-600">
                  {plans.length} plan{plans.length !== 1 ? 's' : ''} for Year {year}
                </Text>
              </View>
            </View>
          </View>
        )}
          </View>
        </ScrollView>
      </View>
    </PageLayout>
  );
};

export default ViewPlan;
