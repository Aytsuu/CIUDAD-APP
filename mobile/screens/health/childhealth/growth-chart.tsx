import React, { useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { TrendingUp, AlertCircle } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';

interface NutritionalStatusData {
  bm_id: number;
  height: string;
  weight: string;
  patrec: number;
  staff: null;
  wfa: string;
  lhfa: string;
  wfl: string;
  muac: string;
  created_at: string;
  edemaSeverity: string;
  muac_status: string;
  bm: number;
  pat: string;
}

interface GrowthChartProps {
  data: NutritionalStatusData[];
  isLoading?: boolean;
  error?: any;
}

export function GrowthChart({ data = [], isLoading, error }: GrowthChartProps) {
  const [selectedMetrics, setSelectedMetrics] = useState({
    height: true,
    weight: true
  });

  // Transform data for the chart
  const chartData = data
    .map((item) => ({
      date: format(parseISO(item.created_at), "MMM dd"),
      fullDate: item.created_at,
      height: Number.parseFloat(item.height),
      weight: Number.parseFloat(item.weight),
      wfa: item.wfa,
      lhfa: item.lhfa,
      wfl: item.wfl,
      edemaSeverity: item.edemaSeverity
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  const screenWidth = Dimensions.get('window').width - 64; // Account for padding

  const toggleMetric = (metric: "height" | "weight") => {
    setSelectedMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  // Prepare data for LineChart
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
    },
  };

  const heightData = {
    labels: chartData.map(item => item.date),
    datasets: [
      {
        data: chartData.map(item => item.height),
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Height (cm)'],
  };

  const weightData = {
    labels: chartData.map(item => item.date),
    datasets: [
      {
        data: chartData.map(item => item.weight),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Weight (kg)'],
  };

  const combinedData = {
    labels: chartData.map(item => item.date),
    datasets: [
      {
        data: chartData.map(item => item.height),
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: chartData.map(item => item.weight),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Height (cm)', 'Weight (kg)'],
  };

  const getDisplayData = () => {
    if (selectedMetrics.height && selectedMetrics.weight) {
      return combinedData;
    } else if (selectedMetrics.height) {
      return heightData;
    } else if (selectedMetrics.weight) {
      return weightData;
    }
    return { labels: [], datasets: [], legend: [] };
  };

  if (error) {
    return (
      <View className="bg-white rounded-xl p-4 mt-4 border border-gray-200 shadow-sm">
        <View className="flex-row items-center mb-4">
          <TrendingUp size={20} color="#6b7280" />
          <Text className="text-gray-900 text-lg font-semibold ml-2">
            Growth Chart
          </Text>
        </View>
        <View className="bg-red-50 border border-red-200 rounded-lg p-4 flex-row items-center">
          <AlertCircle size={20} color="#dc2626" />
          <Text className="text-red-800 text-sm ml-2">
            Failed to load growth data. Please try again later.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-xl p-4 mt-4 border border-gray-200 shadow-sm">
      {/* Header */}
      <View className="border-b border-gray-200 pb-4 mb-4">
        <View className="flex-row items-center">
          <TrendingUp size={20} color="#6b7280" />
          <Text className="text-gray-900 text-lg font-semibold ml-2">
            Growth Chart
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={() => toggleMetric("height")}
            className={`flex-row items-center px-3 py-2 rounded-lg ${
              selectedMetrics.height 
                ? 'bg-blue-100 border border-blue-200' 
                : 'bg-gray-100 border border-gray-200'
            }`}
          >
            <View className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
            <Text className={`text-sm font-medium ${
              selectedMetrics.height ? 'text-blue-700' : 'text-gray-600'
            }`}>
              Height
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => toggleMetric("weight")}
            className={`flex-row items-center px-3 py-2 rounded-lg ${
              selectedMetrics.weight 
                ? 'bg-green-100 border border-green-200' 
                : 'bg-gray-100 border border-gray-200'
            }`}
          >
            <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <Text className={`text-sm font-medium ${
              selectedMetrics.weight ? 'text-green-700' : 'text-gray-600'
            }`}>
              Weight
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text className="text-gray-500 text-sm">
          {chartData.length} measurements
        </Text>
      </View>

      {/* Chart Content */}
      {isLoading ? (
        <View className="items-center justify-center h-80">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-500 mt-2">Loading growth data...</Text>
        </View>
      ) : chartData.length === 0 ? (
        <View className="items-center justify-center py-12 h-80">
          <TrendingUp size={48} color="#9ca3af" />
          <Text className="text-gray-700 text-lg font-semibold mt-4 mb-2">
            No Growth Data Available
          </Text>
          <Text className="text-gray-500 text-sm text-center px-8">
            No measurements have been recorded for this patient yet.
          </Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View className="pb-4">
            <LineChart
              data={getDisplayData()}
              width={Math.max(screenWidth, chartData.length * 60)} // Minimum width with spacing
              height={320}
              chartConfig={chartConfig}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
                paddingRight: 16,
              }}
              withVerticalLines={true}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={false}
              segments={5}
            />
            
            {/* Legend */}
            <View className="flex-row justify-center space-x-6 mt-4">
              {selectedMetrics.height && (
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                  <Text className="text-gray-600 text-sm">Height (cm)</Text>
                </View>
              )}
              {selectedMetrics.weight && (
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                  <Text className="text-gray-600 text-sm">Weight (kg)</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Summary Stats */}
      {chartData.length > 0 && (
        <View className="border-t border-gray-200 pt-4 mt-4">
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-gray-500 text-sm">Latest Height</Text>
              <Text className="text-blue-600 text-lg font-semibold">
                {chartData[chartData.length - 1]?.height} cm
              </Text>
            </View>
            <View className="items-center flex-1 border-l border-r border-gray-200">
              <Text className="text-gray-500 text-sm">Latest Weight</Text>
              <Text className="text-green-600 text-lg font-semibold">
                {chartData[chartData.length - 1]?.weight} kg
              </Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-gray-500 text-sm">Growth Period</Text>
              <Text className="text-gray-700 text-sm font-semibold text-center">
                {chartData.length > 1 
                  ? `${format(parseISO(chartData[0].fullDate), "MMM yyyy")} - ${format(parseISO(chartData[chartData.length - 1].fullDate), "MMM yyyy")}`
                  : format(parseISO(chartData[0].fullDate), "MMM yyyy")
                }
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}