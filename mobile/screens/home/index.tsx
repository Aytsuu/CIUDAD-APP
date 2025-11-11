import {
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  RefreshControl,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Card } from "@/components/ui/card";
import { features } from "./features";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "../_PageLayout";
import React from "react";
import ShowMore from '@/assets/icons/features/showmore.svg'
import ShowLess from '@/assets/icons/features/showless.svg'
import Ciudad from '@/assets/icons/essentials/ciudad_logo.svg'
import { SafeAreaView } from "react-native-safe-area-context";
import { capitalize } from "@/helpers/capitalize";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [showMoreFeatures, setShowMoreFeatures] =
    React.useState<boolean>(false);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const toggleFeatures = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
    setShowMoreFeatures(!showMoreFeatures);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Add your refresh logic here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // if (isLoading) {
  //   return <LoadingModal visible={true} />;
  // }

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
      onPress={
        isToggleButton
          ? toggleFeatures
          : () => router.push(item.route as any)
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
    const userStatus: any[] = []

    if(user?.rp) userStatus.push("RESIDENT")
    if(user?.staff) userStatus.push(user?.staff?.pos)

    const INITIAL_FEATURES_COUNT = 5;
    const myFeatures = features.filter((feat: Record<string, any>) => {
      if(feat.users?.length == 0) return feat;
      if(userStatus.some((stat: string) => feat.users.includes(stat))) return feat;
    })

    if (myFeatures.length <= 6) {
      // Show all features, no Show More/Less button
      return myFeatures.map((feature, index) => renderFeatureItem(feature, index));
    }

    if (!showMoreFeatures) {
      // Show first 5 features + Show More button
      const visibleFeatures = myFeatures.slice(0, INITIAL_FEATURES_COUNT);
      const items = [
        ...visibleFeatures.map((feature, index) => renderFeatureItem(feature, index)),
        renderFeatureItem({}, INITIAL_FEATURES_COUNT, true) // Show More button
      ];
      return items;
    } else {
      // Show all features + Show Less button
      const allFeatureItems = myFeatures.map((feature, index) => 
        renderFeatureItem(feature, index)
      );
      // Add Show Less button
      allFeatureItems.push(renderFeatureItem({}, myFeatures.length, true));
      return allFeatureItems;
    }
  };

  return (
    <PageLayout showHeader={false} wrapScroll={false}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0084f0"]}
          />
        }
      >
        <SafeAreaView className="flex-1 mb-16">
          <View className="px-6 flex-1">
            <Ciudad width={80} height={70} />
          </View>
          {/* Header Card Section */}
          <View className="flex-row px-6 mt-2 mb-6 items-center gap-4">
            <Image
              source={
                user?.profile_image
                  ? { uri: user.profile_image }
                  : require("@/assets/images/Logo.png")
              }
              className="w-10 h-10 rounded-full"
              style={{ backgroundColor: "#f3f4f6" }}
            />
            <Text className="text-md text-gray-700 font- mb-2">
              Hi,{" "}
              {capitalize(
                user?.rp || !(user?.rp && user?.br)
                  ? user?.personal?.per_fname
                  : user?.personal?.br_fname
              )}
              ! 👋
            </Text>
          </View>

          <View className="px-6">
            <View className="flex-1 items-end relative bg-blue-100 overflow-hidden rounded-2xl">
              <View className="absolute p-5 z-10 flex-1 left-0">
                <View className="flex-1 mt-4">
                  <Text className="text-sm font-bold text-gray-700">
                    Avail Services of
                  </Text>
                  <Text
                    className="text-lg text-primaryBlue leading-5"
                    style={{ fontWeight: 800 }}
                  >
                    BARANGAY SAN ROQUE
                  </Text>
                </View>
                <Ciudad width={40} height={20} />
              </View>
              <View className="z-10">
                <Image
                  source={require("@/assets/images/home/building.png")}
                  style={{ width: 120, height: 120 }}
                />
              </View>

              <View className="absolute bg-blue-300 w-24 h-24 rounded-full right-0" />
              <View className="absolute bg-blue-400 w-24 h-24 rounded-full right-10 bottom-0 opacity-70" />
            </View>
          </View>

          {/* Features Section */}
          <Card className="p-6 bg-white rounded-none">
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900">Features</Text>
              <Text className="text-sm text-gray-600">
                Quick access to your tools
              </Text>
            </View>

            <View className="flex-row flex-wrap justify-start space-x-4 gap-x-4">
              {renderFeatures()}
            </View>
          </Card>
        </SafeAreaView>
      </ScrollView>
    </PageLayout>
  );
}