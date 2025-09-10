import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, ScrollView,} from 'react-native';
import { Edit3, History, CheckCircle, XCircle} from 'lucide-react-native';
import { useGetPurposeAndRate, type PurposeAndRate } from './queries/ratesFetchQueries';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRouter } from 'expo-router';
import { useDeletePurposeAndRate } from './queries/ratesDeleteQueries';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function RatesPage4() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'active' | 'archive'>('active');
  const [searchQuery, setSearchQuery] = React.useState('');
  const { data: fetchedData = [], isLoading } = useGetPurposeAndRate();
  const { mutate: deletePermit} = useDeletePurposeAndRate();

  const filteredData = fetchedData.filter(item => {
    const matchesSearch = item.pr_purpose.toLowerCase().includes(searchQuery.toLowerCase());

    const isCorrectCategory = item.pr_category === 'Business Permit';

    if (activeTab === 'active') {
      return item.pr_is_archive !== true && matchesSearch && isCorrectCategory;
    }

    return matchesSearch && isCorrectCategory;
  });

  const handleCreate = () => {
     router.push({
      pathname: '/(treasurer)/rates/purpose-and-rate-create',
      params: {
        category: 'Business Permit'
      }
    });
  }

  const handleDelete = (prId: string) => {
    deletePermit(Number(prId))
  }

  const handleEdit = (item: PurposeAndRate) => {
    router.push({
      pathname: '/(treasurer)/rates/purpose-and-rate-edit',
      params: {
        pr_id: item.pr_id.toString(),
        pr_purpose: item.pr_purpose,
        pr_amount: item.pr_rate.toString(),
        category: 'Business Permit',
      },
    });
   };

  const renderRateCard = (item: PurposeAndRate, showStatus: boolean = false, showActions: boolean = false) => (
    <Card
      key={item.pr_id}
      className="mb-3 border-2 border-gray-200 shadow-sm bg-white"
    >
      <CardHeader className="pb-3">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-3">
            <Text className="font-semibold text-lg text-[#1a2332] mb-1">
              {item.pr_purpose}
            </Text>

            {showStatus && (
              <View className="flex-row items-center mb-2">
                {item.pr_is_archive ? (
                   <View className="flex-row items-center bg-red-50 px-2 py-1 rounded-full">
                    <XCircle size={12} color="#ef4444" />
                    <Text className="text-red-600 text-xs font-medium ml-1">Inactive</Text>
                  </View>
                ) : (
                   <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
                    <CheckCircle size={12} color="#22c55e" />
                    <Text className="text-green-600 text-xs font-medium ml-1">Active</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {showActions && (
            <View className="flex-row space-x-2 gap-2">
              <TouchableOpacity className="bg-blue-50 p-2 rounded-lg" onPress={() => handleEdit(item)}>
                <Edit3 size={16} color="#3b82f6" />
              </TouchableOpacity>
              {/* <ConfirmationModal
                trigger={ 
                  <TouchableOpacity className="bg-red-50 p-2 rounded-lg">
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                }
                title="Confirm Delete"
                description="Are you sure you want to delete this record? This action will set the record to inactive state and cannot be undone."
                actionLabel='Confirm'
                onPress={() => handleDelete(item.pr_id)}
              /> */}
            </View>
          )}
        </View>
      </CardHeader>

      <CardContent className="pt-3 border-t border-gray-200">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-[#2a3a61]">₱{item.pr_rate}</Text>
            <Text className="text-xs text-gray-500 mt-1">
              Date Added/ Updated: {new Date(item.pr_date).toLocaleString()}
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );

   if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2a3a61" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      {/* Search and Add */}
      {/* <View className="mb-4">
        <View className="relative mb-3">
          <Input placeholder="Search..." value={searchQuery} onChangeText={setSearchQuery} className="bg-white text-black rounded-lg p-2 border border-gray-300 pl-10"/>
        </View> */}

        {/* <Button onPress={handleCreate} className="bg-primaryBlue px-4 py-3 rounded-xl flex-row items-center justify-center shadow-md">
          <Plus size={20} color="white" />
          <Text className="text-white ml-2 font-semibold">Add</Text>
        </Button> */}
      {/* </View> */}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'active' | 'archive')} className="flex-1">
        <TabsList className="bg-blue-50 mb-5 flex-row justify-between">
          <TabsTrigger value="active" className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}>
            <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
              Active
            </Text>
          </TabsTrigger>
          <TabsTrigger value="archive" className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}>
            <View className="flex-row items-center justify-center">
              <History size={16} className="mr-1" color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'}/>
              <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
                History
              </Text>
            </View>
          </TabsTrigger>
        </TabsList>

        {/* Active Tab */}
        <TabsContent value="active" className="flex-1">
          <ScrollView  className="flex-1" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false} >
            <FlatList
              data={filteredData}
              renderItem={({ item }) => renderRateCard(item, false, true)}
              keyExtractor={item => item.pr_id.toString()}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text className="text-center text-gray-500 py-4">No rates found</Text>
              }
            />
          </ScrollView>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="archive" className="flex-1">
          <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false} >
            <FlatList
              data={filteredData}
              renderItem={({ item }) => renderRateCard(item, true, false)}
              keyExtractor={item => item.pr_id.toString()}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text className="text-center text-gray-500 py-4">No rates found</Text>
              }
            />
          </ScrollView>
        </TabsContent>
      </Tabs>
    </View>
  );
}