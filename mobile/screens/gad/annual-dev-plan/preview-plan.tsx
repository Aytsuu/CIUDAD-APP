import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { getAnnualDevPlanById } from './restful-api/annualDevPlanGetAPI';
import PageLayout from '@/screens/_PageLayout';
import { LoadingState } from '@/components/ui/loading-state';
import { ChevronLeft } from 'lucide-react-native';
import { useResolution } from '@/screens/council/resolution/queries/resolution-fetch-queries';
import { useGetApprovedProposals } from './queries/annualDevPlanQueries';

interface BudgetItem {
  gdb_id?: number;
  gdb_name: string;
  gdb_pax: string;
  gdb_price: string;
}

interface DevBudgetItem {
  name: string;
  pax?: string | number;
  quantity?: string | number;
  amount?: string | number;
  price?: string | number;
}

interface DevelopmentPlan {
  dev_id: number;
  dev_date: string;
  dev_client: string;
  dev_issue: string;
  dev_project: string;
  dev_activity: string;
  dev_indicator: string;
  dev_gad_budget: string;
  dev_res_person: string;
  staff: string;
  budgets?: BudgetItem[];
  dev_budget_items?: DevBudgetItem[] | string;
  dev_mandated?: boolean;
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

const PreviewPlan = () => {
  const { devId, year } = useLocalSearchParams();
  const [plan, setPlan] = useState<DevelopmentPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch GAD Project Proposals and Resolutions to determine status
  const { data: proposalsRaw = [] } = useGetApprovedProposals();

  const { data: resolutionData = { results: [], count: 0 } } = useResolution();

  // Build quick lookup maps for status determination
  const proposalByDevId = useMemo(() => {
    const map = new Map<number, any>();
    const proposalsList = Array.isArray(proposalsRaw) ? proposalsRaw : [];
    proposalsList.forEach((p: any) => {
      let devId: number | null = null;
      if (p?.dev_id !== undefined) {
        devId = typeof p.dev_id === 'number' ? p.dev_id : Number(p.dev_id);
      } else if (p?.dev !== undefined) {
        if (typeof p.dev === 'object' && p.dev !== null) {
          devId = typeof p.dev.dev_id === 'number' ? p.dev.dev_id : Number(p.dev.dev_id);
        } else if (typeof p.dev === 'number') {
          devId = p.dev;
        } else if (typeof p.dev === 'string') {
          devId = Number(p.dev);
        }
      }
      if (devId && p?.gpr_id) {
        map.set(devId, p);
      }
    });
    return map;
  }, [proposalsRaw]);

  const resolutionByGprId = useMemo(() => {
    const map = new Map<number, any>();
    const resolutionsList = Array.isArray(resolutionData) ? resolutionData : Array.isArray(resolutionData?.results) ? resolutionData.results : [];
    resolutionsList.forEach((r: any) => {
      if (r && typeof r.gpr_id === 'number') {
        map.set(r.gpr_id, r);
      }
    });
    return map;
  }, [resolutionData]);

  const getStatusBadges = (plan: DevelopmentPlan) => {
    const badges: React.ReactElement[] = [];
    const proposal = proposalByDevId.get(plan.dev_id);
    const hasProposal = Boolean(proposal && proposal.gpr_id);
    const hasResolution = hasProposal && resolutionByGprId.has(proposal.gpr_id);

    if (plan.dev_mandated) {
      badges.push(
        <View key="mandated" className="bg-green-100 px-2 py-1 rounded-full mr-1 mb-1">
          <Text className="text-xs font-medium text-green-800">Mandated</Text>
        </View>
      );
    }

    if (hasProposal) {
      badges.push(
        <View key="with-proposal" className="bg-yellow-100 px-2 py-1 rounded-full mr-1 mb-1">
          <Text className="text-xs font-medium text-yellow-800">With Project Proposal</Text>
        </View>
      );
    }

    if (hasResolution) {
      badges.push(
        <View key="with-resolution" className="bg-blue-100 px-2 py-1 rounded-full mr-1 mb-1">
          <Text className="text-xs font-medium text-blue-800">With Resolution</Text>
        </View>
      );
    }
    
    if (badges.length === 0) {
      return (
        <Text className="text-sm text-gray-500">-</Text>
      );
    }

    return (
      <View className="flex-row flex-wrap">
        {badges}
      </View>
    );
  };

  useEffect(() => {
    if (devId) {
      fetchPlan();
    }
  }, [devId]);

  const fetchPlan = async () => {
    try {
      setIsLoading(true);
      const devIdValue = Array.isArray(devId) ? devId[0] : devId;
      const data = await getAnnualDevPlanById(devIdValue);
      setPlan(data);
    } catch (error) {
      console.error('Error fetching plan:', error);
      Alert.alert('Error', 'Failed to fetch development plan');
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
      const parsed = JSON.parse(indicator);
      
      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => {
          if (typeof item === 'object' && item !== null) {
            const entries = Object.entries(item);
            const meaningfulPairs = entries.filter(([key, val]) => val !== null && val !== undefined && val !== '');
            
            if (meaningfulPairs.length > 0) {
              const formattedPairs = meaningfulPairs.map(([key, val]) => `${key}: ${val}`).join(' - ');
              return `${index + 1}. ${formattedPairs}`;
            }
            return `${index + 1}. ${JSON.stringify(item)}`;
          }
          return `${index + 1}. ${item}`;
        }).join('\n');
      }
      
      if (typeof parsed === 'object' && parsed !== null) {
        const values = Object.values(parsed).filter(val => val && typeof val === 'string');
        return values.length > 0 ? values.join('\n• ') : JSON.stringify(parsed, null, 2);
      }
      
      return String(parsed);
    } catch {
      return indicator;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (!plan) {
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
        headerTitle={<Text className="text-gray-900 text-[13px]">Preview Plan</Text>}
        rightAction={<View className="w-10 h-10" />}
      >
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-gray-700 text-lg font-medium mb-2 text-center">
            Plan not found
          </Text>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="items-center justify-center"
        >
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Preview Plan</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-6">
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
              {/* Plan Header */}
              <View className="flex-row justify-between items-start mb-5">
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xl font-bold text-gray-900 mb-2 flex-1">
                      {plan.dev_client}
                    </Text>
                  </View>
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
                <View className="bg-red-50 p-4 rounded-xl">
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
                <View className="bg-green-50 p-4 rounded-xl">
                  <Text className="text-sm text-gray-800 leading-6">
                    {plan.dev_project}
                  </Text>
                </View>
              </View>

              {/* GAD Activity */}
              {plan.dev_activity && (
                <View className="mb-5">
                  <Text className="text-base font-bold text-gray-800 mb-3">
                    GAD Activity Details
                  </Text>
                  <View className="bg-blue-50 p-4 rounded-xl">
                    {(() => {
                      try {
                        const activities = typeof plan.dev_activity === 'string' 
                          ? JSON.parse(plan.dev_activity) 
                          : plan.dev_activity;
                        if (Array.isArray(activities)) {
                          return (
                            <View>
                              {activities.map((activity: any, idx: number) => (
                                <Text key={idx} className="text-sm text-gray-800 leading-6 mb-2">
                                  • {activity.activity || activity} {activity.participants ? `(${activity.participants} participants)` : ''}
                                </Text>
                              ))}
                            </View>
                          );
                        }
                        return <Text className="text-sm text-gray-800 leading-6">{plan.dev_activity}</Text>;
                      } catch {
                        return <Text className="text-sm text-gray-800 leading-6">{plan.dev_activity}</Text>;
                      }
                    })()}
                  </View>
                </View>
              )}

              {/* Performance Indicator */}
              <View className="mb-5">
                <Text className="text-base font-bold text-gray-800 mb-3">
                  Performance Indicator and Target
                </Text>
                <View className="bg-yellow-50 p-4 rounded-xl">
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
                {(() => {
                  let budgetItems: DevBudgetItem[] = [];
                  try {
                    if (plan.dev_budget_items) {
                      if (Array.isArray(plan.dev_budget_items)) {
                        budgetItems = plan.dev_budget_items;
                      } else if (typeof plan.dev_budget_items === 'string') {
                        const parsed = JSON.parse(plan.dev_budget_items);
                        budgetItems = Array.isArray(parsed) ? parsed : [];
                      }
                    }
                  } catch (error) {
                    console.error('Error parsing budget items:', error);
                  }

                  if (budgetItems.length === 0 && plan.budgets && plan.budgets.length > 0) {
                    return (
                      <View>
                        {plan.budgets.map((item, idx) => (
                          <View key={item.gdb_id || idx} className="bg-purple-50 p-4 rounded-xl mb-3">
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
                        ))}
                      </View>
                    );
                  }

                  if (budgetItems.length > 0) {
                    const grandTotal = budgetItems.reduce((sum, item) => {
                      const quantity = Number(item.quantity || item.pax || 0);
                      const price = Number(item.price || item.amount || 0);
                      return sum + (quantity * price);
                    }, 0);

                    return (
                      <View className="space-y-3">
                        {budgetItems.map((item, idx) => {
                          const quantity = Number(item.quantity || item.pax || 0);
                          const price = Number(item.price || item.amount || 0);
                          const total = quantity * price;
                          
                          return (
                            <View key={idx} className="bg-white p-4 rounded-lg border border-purple-200 mb-3">
                              <View className="mb-3">
                                <Text className="text-xs font-semibold text-purple-700 mb-1">CLIENT FOCUSED</Text>
                                <Text className="text-sm font-medium text-gray-900" numberOfLines={3}>
                                  {item.name}
                                </Text>
                              </View>

                              <View className="flex-row flex-wrap gap-3">
                                <View className="flex-1 min-w-[100px]">
                                  <Text className="text-xs font-semibold text-purple-700 mb-1">pax/quantity</Text>
                                  <Text className="text-sm text-gray-800">{quantity}</Text>
                                </View>

                                <View className="flex-1 min-w-[100px]">
                                  <Text className="text-xs font-semibold text-purple-700 mb-1">amount (PHP)</Text>
                                  <Text className="text-sm text-gray-800">₱{isFinite(price) ? price.toFixed(2) : '0.00'}</Text>
                                </View>

                                <View className="flex-1 min-w-[100px]">
                                  <Text className="text-xs font-semibold text-purple-700 mb-1">total</Text>
                                  <Text className="text-sm font-bold text-green-700">₱{isFinite(total) ? total.toFixed(2) : '0.00'}</Text>
                                </View>
                              </View>
                            </View>
                          );
                        })}

                        <View className="bg-purple-100 p-4 rounded-lg border-2 border-purple-300">
                          <View className="flex-row justify-between items-center">
                            <Text className="text-base font-bold text-purple-900">Total Budget</Text>
                            <Text className="text-lg font-bold text-purple-900">
                              ₱{grandTotal.toFixed(2)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  }

                  return (
                    <View className="bg-purple-50 p-4 rounded-xl">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-medium text-gray-700">Total Budget</Text>
                        <View className="bg-green-100 px-3 py-1 rounded-full">
                          <Text className="text-sm font-bold text-green-700">
                            ₱{plan.dev_gad_budget || '0.00'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })()}
              </View>

              {/* Project Proposal & Resolution */}
              {(plan.project_proposal || plan.resolution) && (
                <View className="mb-5">
                  <Text className="text-base font-bold text-gray-800 mb-3">
                    Documents
                  </Text>
                  <View className="bg-yellow-50 p-4 rounded-xl">
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
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </PageLayout>
  );
};

export default PreviewPlan;

