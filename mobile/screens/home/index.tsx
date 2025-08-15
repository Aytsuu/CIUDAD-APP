import {
  Dimensions,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  FlatList,
  RefreshControl,
} from "react-native";
import { Card } from "@/components/ui/card";
import { features } from "./features";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingModal } from "@/components/ui/loading-modal";
import PageLayout from "../_PageLayout";
import React from "react";
import ShowMore from '@/assets/icons/features/showmore.svg'
import ShowLess from '@/assets/icons/features/showless.svg'
import Ciudad from '@/assets/icons/essentials/ciudad_logo.svg'

export default function HomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [showMoreFeatures, setShowMoreFeatures] = React.useState<boolean>(false);

  if (isLoading) {
    return <LoadingModal visible={true} />;
  }

  console.log("User Data:", user);

  // Optimized feature rendering logic
  const renderFeatureItem = (item: any, index: number, isToggleButton = false) => (
    <TouchableOpacity
      key={isToggleButton ? `toggle-${index}` : `feature-${index}`}
      className="w-[30%] mb-4 active:opacity-70"
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={isToggleButton ? 
        (showMoreFeatures ? "Show Less features" : "Show More features") : 
        `${item.name} feature`
      }
      onPress={isToggleButton ? 
        () => setShowMoreFeatures(!showMoreFeatures) : 
        () => router.push(item.route as any)
      }
    >
      <View className="items-center p-3 rounded-xl">
        <View className={`mb-2 p-2 ${
          item.name === 'Securado' ? "bg-blue-950" : "bg-blue-50"
        } rounded-full`}>
          {isToggleButton ? 
            (showMoreFeatures ? 
              <ShowLess width={30} height={30}/> : 
              <ShowMore width={30} height={30}/>
            ) : 
            item.icon
          }
        </View>
        <Text className="text-xs font-medium text-gray-900 text-center leading-4">
          {isToggleButton ? 
            (showMoreFeatures ? "Show Less" : "Show More") : 
            item.name
          }
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFeatures = () => {
    const INITIAL_FEATURES_COUNT = 5;
    
    if (!showMoreFeatures) {
      // Show first 5 features + Show More button
      const visibleFeatures = features.slice(0, INITIAL_FEATURES_COUNT);
      const items = [
        ...visibleFeatures.map((feature, index) => renderFeatureItem(feature, index)),
        renderFeatureItem({}, INITIAL_FEATURES_COUNT, true) // Show More button
      ];
      
      return items;
    } else {
      // Show all features + Show Less button
      const allFeatureItems = features.map((feature, index) => 
        renderFeatureItem(feature, index)
      );
      
      // Add Show Less button
      allFeatureItems.push(renderFeatureItem({}, features.length, true));
      
      return allFeatureItems;
    }
  };

  const RenderPage = React.memo(() => (
    <View className="flex-1 mb-16">
      <View className="px-5 flex-1 justify-center">
        {/* <Text className="font-PoppinsSemiBold text-lg text-blue-500"></Text> */}
        <Ciudad width={80} height={70}/>
      </View>
      
      {/* Header Card Section */}
      <ScrollView
        className="flex-1"
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <TouchableOpacity
          className="active:opacity-80 w-screen"
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Featured content card"
        >
          <Card className="h-[140px] border-0 bg-gray-400 justify-center items-center shadow-lg rounded-none">
            <Text className="text-white font-semibold text-lg">
              Featured
            </Text>
            <Text className="text-white/80 text-sm mt-1">
              Discover new content 
            </Text>
          </Card>
        </TouchableOpacity>
      </ScrollView>

      {/* Features Section */}
      <Card className="p-5 bg-white rounded-none border-b border-border">
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900">
            Features
          </Text>
          <Text className="text-sm text-gray-600">
            Quick access to your tools
          </Text>
        </View> 

        {/* FIXED: Changed from justify-between to justify-start with consistent spacing */}
        <View className="flex-row flex-wrap justify-start space-x-4 gap-x-4">
          {renderFeatures()}
        </View>
      </Card>

      {/* What's New Section */}
      <View className="px-5 py-6">
        <View className="mb-6">
          <Text className="text-xl font-semibold text-gray-900">
            What's New For You
          </Text>
          <Text className="text-sm text-gray-600">
            Latest updates and recommendations
          </Text>
        </View>

        <View className="gap-3">
          <TouchableOpacity className="active:opacity-80" activeOpacity={0.8}>
            <Card className="p-4 bg-white shadow-sm border border-gray-100">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-blue-600 font-semibold">🎉</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 mb-1">
                    New Feature Available
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Check out our latest update with improved performance
                  </Text>
                </View>
                <View className="w-2 h-2 bg-green-500 rounded-full" />
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity className="active:opacity-80" activeOpacity={0.8}>
            <Card className="p-4 bg-white shadow-sm border border-gray-100">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-green-600 font-semibold">📱</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 mb-1">
                    App Update
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Version 2.1 is now available with bug fixes
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity className="active:opacity-80" activeOpacity={0.8}>
            <Card className="p-4 bg-white shadow-sm border border-gray-100">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-purple-600 font-semibold">⭐</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 mb-1">
                    Recommended for You
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Based on your activity, you might like this
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ))  

  return (
    <PageLayout showHeader={false}>
      <FlatList 
        maxToRenderPerBatch={1}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        data={[{}]}
        renderItem={({index}) => <RenderPage />}
        refreshControl={
          <RefreshControl 
            refreshing={false}
            onRefresh={() => {}}
            colors={['#0084f0']}
          />
        }
        windowSize={5}
        removeClippedSubviews={true}
      />
    </PageLayout>
  );
}