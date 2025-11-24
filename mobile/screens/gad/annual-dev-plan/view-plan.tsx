import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { getAnnualDevPlansByYear } from './restful-api/annualDevPlanGetAPI';
import PageLayout from '@/screens/_PageLayout';
import { LoadingState } from '@/components/ui/loading-state';
import { ChevronLeft } from 'lucide-react-native';
import { useResolution } from '@/screens/council/resolution/queries/resolution-fetch-queries';
import { useGetApprovedProposals } from './queries/annualDevPlanQueries';

interface DevelopmentPlan {
  dev_id: number;
  dev_issue: string;
  dev_project: string;
  dev_res_person: string;
  dev_mandated?: boolean;
}

const ViewPlan = () => {
  const { year } = useLocalSearchParams();
  const [plans, setPlans] = useState<DevelopmentPlan[]>([]);
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

  const handlePreview = (plan: DevelopmentPlan) => {
    router.push({
      pathname: '/(gad)/annual-dev-plan/preview-plan',
      params: { devId: plan.dev_id.toString(), year: year || '' }
    });
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
      
      const plansData = Array.isArray(data) 
        ? data 
        : Array.isArray(data?.results) 
        ? data.results 
        : Array.isArray(data?.data) 
        ? data.data 
        : [];
      
      setPlans(plansData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch annual development plans');
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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
          className="items-center justify-center"
        >
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Year {year}</Text>}
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
    >
      <View className="flex-1 border-t border-gray-200 bg-gray-50">
        {plans.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20 px-6">
            <Text className="text-gray-700 text-lg font-medium mb-2 text-center">
              No development plans found for Year {year}
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              Development plans will appear here when available
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="p-6">
              {plans.map((plan) => (
                <View 
                  key={plan.dev_id} 
                  className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-200"
                >
                  {/* GAD Mandate */}
                  <View className="mb-3">
                    <Text className="text-xs font-semibold text-gray-600 mb-1">
                      GAD Mandate
                    </Text>
                    <Text className="text-sm text-gray-800" numberOfLines={2}>
                      {plan.dev_issue || '—'}
                    </Text>
                  </View>

                  {/* Program/Project */}
                  <View className="mb-3">
                    <Text className="text-xs font-semibold text-gray-600 mb-1">
                      Program/Project
                    </Text>
                    <Text className="text-sm text-gray-800" numberOfLines={2}>
                      {plan.dev_project || '—'}
                    </Text>
                  </View>

                  {/* Responsible Person */}
                  <View className="mb-3">
                    <Text className="text-xs font-semibold text-gray-600 mb-1">
                      Responsible Person
                    </Text>
                    <Text className="text-sm text-gray-800">
                      {plan.dev_res_person || '—'}
                    </Text>
                  </View>

                  {/* Status Badges */}
                  <View className="mb-4">
                    <Text className="text-xs font-semibold text-gray-600 mb-2">
                      Status
                    </Text>
                    {getStatusBadges(plan)}
                  </View>

                  {/* Preview Button */}
                  <TouchableOpacity
                    onPress={() => handlePreview(plan)}
                    className="bg-blue-600 py-3 rounded-lg items-center"
                    activeOpacity={0.7}
                  >
                    <Text className="text-white font-semibold text-sm">
                      View
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </PageLayout>
  );
};

export default ViewPlan;
