import {
  Dimensions,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/card";
import { features } from "./features";
import { useRouter } from "expo-router";
import ScreenLayout from "../_ScreenLayout";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingModal } from "@/components/ui/loading-modal";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = screenWidth * 0.75;

export default function HomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingModal visible={true} />;
  }

  console.log("Value",user);

  return (
    <ScreenLayout
      showBackButton={false}
      showExitButton={false}
      headerBetweenAction={<Text className="text-[13px]">Home</Text>}
      backgroundColor="bg-gray-50"
    >
      <View className="flex-1 mb-16">
        {/* Discovery Section */}
        <View className="py-6 bg-primaryBlue">
          <View className="px-5 mb-6">
            <Text className="text-xl font-semibold text-white">Discovery</Text>
            <Text className="text-sm text-white">
              Explore new content and features
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="normal"
            snapToAlignment="start"
            snapToInterval={cardWidth + 12}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            <TouchableOpacity
              className="mr-3 active:opacity-80"
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Featured content card"
            >
              <Card className="w-[200px] h-[120px] border-0 bg-gray-400 justify-center items-center shadow-lg">
                <Text className="text-white font-semibold text-lg">
                  Featured
                </Text>
                <Text className="text-white/80 text-sm mt-1">
                  Discover new content
                </Text>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity
              className="mr-3 active:opacity-80"
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Trending content card"
            >
              <Card className="w-[200px] h-[120px] border-0 bg-gray-400 justify-center items-center shadow-lg">
                <Text className="text-white font-semibold text-lg">
                  Trending
                </Text>
                <Text className="text-white/80 text-sm mt-1">
                  Popular right now
                </Text>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity
              className="active:opacity-80"
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Recommended content card"
            >
              <Card className="w-[200px] h-[120px] border-0 bg-gray-400 justify-center items-center shadow-lg">
                <Text className="text-white font-semibold text-lg">
                  For You
                </Text>
                <Text className="text-white/80 text-sm mt-1">
                  Personalized picks
                </Text>
              </Card>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Features Section */}
        <Card className="p-5 bg-white rounded-none">
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900">
              Features
            </Text>
            <Text className="text-sm text-gray-600">
              Quick access to your tools
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                className="w-[30%] mb-4 active:opacity-70"
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${feature.name} feature`}
                onPress={() => router.push(feature.route as any)}
              >
                <View className="items-center p-3 rounded-xl">
                  <View className="mb-2 p-2 bg-primaryBlue rounded-md">
                    {feature.icon}
                  </View>
                  <Text className="text-xs font-medium text-gray-900 text-center leading-4">
                    {feature.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
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
    </ScreenLayout>
  );
}
