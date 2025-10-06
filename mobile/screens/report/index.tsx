import { Text, TouchableOpacity, View, ScrollView, Dimensions, Platform, Image, InteractionManager} from "react-native"
import { router, useRouter } from "expo-router"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { ChevronRight } from "@/lib/icons/ChevronRight"
import PageLayout from "../_PageLayout"
import { User } from "../_Enums"
import { useAuth } from "@/contexts/AuthContext"
import Grid from "@/assets/icons/essentials/grid.svg"
import File from "@/assets/icons/essentials/file.svg"
import { Drawer } from "@/components/ui/drawer"
import ReportRecord from "./ReportRecord"
import ReportHistory from "./ReportHistory"
import { NoAccessScreen } from "@/components/ui/feedback-screen"
import { LoadingState } from "@/components/ui/loading-state"


export default () => {
  // ============== STATE INITIALIZATION ==============
  const { user } = useAuth()
  const [currentIndex, setCurrentIndex] = React.useState<number>(0)
  const [showDrawer, setShowDrawer] = React.useState<boolean>(false);
  const [isReady, setIsReady] = React.useState<boolean>(false);
  const [drawerContent, setDrawerContent] = React.useState<"records" | "history">();
  const scrollViewRef = React.useRef<ScrollView>(null)
  const screenWidth = Dimensions.get('window').width
  const cardWidth = screenWidth - 40 
  
  const fileReportItem = [
    {
      title: "Incident",
      description: "File a report for incidents or emergencies in your area.",
      route: "/(report)/incident/form",
      image: require("@/assets/images/report/incident.jpg"),
      user: [User.resident]
    },
    {
      title: "Waste",
      description: "File a report for illegal dumping in your area.",
      route: "/(waste)/illegal-dumping/resident/illegal-dump-res-create",
      image: require("@/assets/images/report/illegal_dump.jpg"),
      user: [User.resident]
    },
  ]

  // ============== SIDE EFFECTS ==============
  React.useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });

    return () => task.cancel();
  }, [user]);

  // ============== HANDLERS ==============
  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * cardWidth,
      animated: true,
    })
    setCurrentIndex(index)
  }

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x
    const index = Math.round(contentOffsetX / cardWidth)
    setCurrentIndex(index)
  }

  const handleDrawer = (selected: "records" | "history") => {
    setShowDrawer(true)
    setDrawerContent(selected)
  }

  // Shadow styles for different platforms
  const cardShadowStyle = Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.10,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
  })

  // ============== MAIN RENDER ==============
  if(!user?.rp) {
    return (isReady && <NoAccessScreen 
        title="Resident Access Required"
        description="The report feature is only available to registered residents."/>
    )
  }

  return (
    <ScreenLayout
      customLeftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Report</Text>}
      customRightAction={<View className="w-10 h-10"/>}
    >
      <View className="flex-1 px-5">
        <Text className="text-sm text-center text-gray-600 leading-6 px-5 mb-4">
          Monitor barangay reports. Select a category below to view records.
        </Text> 
        {
          menuItem.map((item: any, index: number) => (
            <TouchableOpacity
              key={index}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
              activeOpacity={0.7}
              onPress={() => router.push(item.route)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">

                  {/* Add Visual Image */}

                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold text-base">
                      {item.title}
                    </Text>

                    <Text className="text-gray-500 text-sm mt-1">
                      {item.description}
                    </Text>
                  </View>
                </View>

                <View className="ml-2">
                  <ChevronRight className="text-gray-400" size={20} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        }
      </View>
    </ScreenLayout>
  )
}