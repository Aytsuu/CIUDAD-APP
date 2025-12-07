import PageLayout from "@/screens/_PageLayout"
import { View, TouchableOpacity } from "react-native"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { Search } from "@/lib/icons/Search"
import { Archive } from "lucide-react-native"
import { useRouter } from "expo-router"
import React from "react"
import { SearchInput } from "@/components/ui/search-input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react-native"
import ActiveMOMScreen from "./mom-active"
import InactiveMOMScreen from "./mom-inactive"
import { Text } from "react-native"

export default function MinutesOfMeetingMain() {
  const router = useRouter()
  
  // State management
  const [searchInputVal, setSearchInputVal] = React.useState<string>("")
  const [showSearch, setShowSearch] = React.useState<boolean>(false)
  const [activeTab, setActiveTab] = React.useState<'active' | 'archive'>('active')
  const [searchQuery, setSearchQuery] = React.useState<string>("")

  // Handle search
  const handleSearch = React.useCallback(() => {
    setSearchQuery(searchInputVal)
  }, [searchInputVal])

  // Handle tab change
  const handleTabChange = (tab: 'active' | 'archive') => {
    setActiveTab(tab)
    setSearchQuery('')
    setSearchInputVal('')
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      wrapScroll={false}
      headerTitle={<Text className="text-gray-900 text-[13px]">Minutes Of Meeting Records</Text>}
      rightAction={
        <TouchableOpacity onPress={() => setShowSearch(!showSearch)} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
    >
      <View className="flex-1 bg-gray-50">
        {/* Search Bar */}
        {showSearch && (
          <View className="pb-3">
            <SearchInput 
              value={searchInputVal}
              onChange={setSearchInputVal}
              onSubmit={handleSearch} 
            />
          </View>
        )}

        {/* Tabs */}
        <View className="flex-1 px-6">
          <Tabs value={activeTab} onValueChange={val => handleTabChange(val as 'active' | 'archive')} className="flex-1">
            <TabsList className="bg-blue-50 flex-row justify-between">
              <TabsTrigger 
                value="active" 
                className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
              >
                <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                  Active
                </Text>
              </TabsTrigger>
              <TabsTrigger 
                value="archive" 
                className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
              >
                <View className="flex-row items-center justify-center">
                  <Archive size={16} className="mr-1" color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'}/>
                  <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
                    Archive
                  </Text>
                </View>
              </TabsTrigger>
            </TabsList>

            {/* Add Button */}
            <View className="pb-4 pt-4">
              <Button
                className="bg-primaryBlue px-4 py-3 rounded-xl flex-row items-center justify-center shadow-md"
                onPress={() => router.push('/(council)/minutes-of-meeting/mom-create')}
              >
                <Plus size={20} color="white" />
                <Text className="text-white ml-2 font-semibold">Add</Text>
              </Button>
            </View>

            {/* Active Tab Content */}
            <TabsContent value="active" className="flex-1">
              <ActiveMOMScreen 
                searchQuery={searchQuery}
                key={activeTab === 'active' ? 'active' : ''}
              />
            </TabsContent>

            {/* Archive Tab Content */}
            <TabsContent value="archive" className="flex-1">
              <InactiveMOMScreen 
                searchQuery={searchQuery}
                key={activeTab === 'archive' ? 'archive' : ''}
              />
            </TabsContent>
          </Tabs>
        </View>
      </View>
    </PageLayout>
  )
}