import { Text, TouchableOpacity, View, ScrollView, Dimensions, Platform, Image, InteractionManager} from "react-native"
import { router, useRouter } from "expo-router"
import React from "react"
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


export default () => {
  // ============== STATE INITIALIZATION ==============
  const { user } = useAuth()
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [showDrawer, setShowDrawer] = React.useState<boolean>(false);
  const [drawerContent, setDrawerContent] = React.useState<"records" | "history">();
  const scrollViewRef = React.useRef<ScrollView>(null)
  const screenWidth = Dimensions.get('window').width
  const cardWidth = screenWidth - 40 // Account for padding (20px on each side)
  
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
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} className="text-white" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-white font-medium text-[13px]">Report</Text>}
      rightAction={<View className="w-10 h-10" />}
      backgroundColor="bg-primaryBlue"
      wrapScroll={false}
    >
      <View className="flex-1">
        {/* Top section with cards */}
        <View className="pb-8">
          {/* Header */}
          <View className="pt-6 px-6 pb-6">
            <Text className="text-xl font-medium text-white">File a Report</Text>
            <Text className="text-sm text-white/90">Share your concern to the barangay San Roque (CIUDAD)</Text>
          </View>
          {/* Horizontal ScrollView with Cards */}
          <View className="relative">
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              contentContainerStyle={{ paddingHorizontal: 0 }}
              overScrollMode="never"
            >
              {fileReportItem.map((item: any, index: number) => (
                <View 
                  key={index} 
                  style={{ width: cardWidth }} 
                  className={`pr-4 ${index == 0 && "pl-6"} ${index == fileReportItem.length - 1 && "pr-6"}`}
                >
                  {/* Add padding and overflow visible to prevent shadow clipping */}
                  <View className="py-2" style={{ overflow: 'visible' }}>
                    <TouchableOpacity
                      className="bg-white rounded-3xl"
                      style={[
                        cardShadowStyle,
                        { 
                          height: 280, // Use style prop for height instead of className
                          overflow: 'visible' // Ensure shadow isn't clipped
                        }
                      ]}
                      activeOpacity={1}
                      onPress={() => router.push(item.route)}
                    >
                      {/* Optimized Image section with JPG */}
                      <View className="h-48 bg-black rounded-t-3xl overflow-hidden">
                        <Image
                          source={item.image}
                          style={{ width: "100%", height: 250, marginBottom: 16, opacity: 0.8 }}
                          resizeMode="cover"
                        />
                      </View>
                      
                      {/* Text section - Remove bg-transparent and use bg-white */}
                      <View className="p-4 flex-1 bg-white rounded-3xl">
                        <Text className="text-gray-700 font-medium text-lg mb-2">{item.title}</Text>
                        <Text className="text-gray-500 text-sm">{item.description}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            {/* Navigation Arrows */}
            {currentIndex > 0 && (
              <TouchableOpacity
                className="absolute left-0 top-1/2 -translate-y-6 w-12 h-12 rounded-full bg-black/30 items-center justify-center"
                onPress={() => scrollToIndex(currentIndex - 1)}
                activeOpacity={0.7}
              >
                <ChevronLeft size={20} className="text-white" />
              </TouchableOpacity>
            )}
            
            {currentIndex < fileReportItem.length - 1 && (
              <TouchableOpacity
                className="absolute right-0 top-1/2 -translate-y-6 w-12 h-12 rounded-full bg-black/30 items-center justify-center"
                onPress={() => scrollToIndex(currentIndex + 1)}
                activeOpacity={0.7}
              >
                <ChevronRight size={20} className="text-white" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Page Indicators */}
          <View className="flex-row justify-center mt-6 gap-2">
            {fileReportItem.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => scrollToIndex(index)}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-gray-400'
                }`}
              />
            ))}
          </View>
        </View>

        {/* Bottom white section with rounded top corners */}
        <View className="flex-1 flex-row items-center justify-center pt-6 px-6" style={{gap: 60}}>
          {user?.staff?.staff_id && 
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleDrawer('records')}
            >
              <View className="flex items-center justify-center gap-3">
                <View className="flex-row bg-white p-4 rounded-full shadow-lg elevation-sm">
                  <Grid  width={25} height={25}/>
                </View>
                <Text className="text-sm text-white font-medium">Records</Text>
              </View>
            </TouchableOpacity>
          }
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleDrawer('history')}
          >
            <View className="flex items-center justify-center gap-3">
              <View className="flex-row bg-white p-4 rounded-full shadow-lg elevation-sm">
                <File  width={25} height={25}/>
              </View>
              <Text className="text-sm text-white font-medium">History</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Drawer 
          header={drawerContent === "records" ? "Report Records" : "Report History"}
          description={drawerContent === "records" ? "View all reports record" : "Your report submission history"}
          children={
            <View className="flex-1">
              {
                drawerContent == "records" ? (
                  <ReportRecord />
                ) : (
                  <ReportHistory />
                )
              }
            </View>
          }
          visible={showDrawer}
          onClose={() => setShowDrawer(false)}
        />
      </View>
    </PageLayout>
  )
}