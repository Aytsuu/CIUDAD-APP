import React from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, FlatList, ScrollView,} from 'react-native';
import { Plus, Edit3, Trash2, History, CheckCircle, XCircle, Search,} from 'lucide-react-native';
import { useGetAnnualGrossSales, type AnnualGrossSales } from './queries/ratesFetchQueries';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRouter } from 'expo-router';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { useDeleteAnnualGrossSales } from './queries/ratesDeleteQueries';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function RatesPage1() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'active' | 'archive'>('active');
  const [searchQuery, setSearchQuery] = React.useState('');
  const { data: fetchedData = [], isLoading } = useGetAnnualGrossSales();
  const { mutate: deleteGrossSales, isPending} = useDeleteAnnualGrossSales();

  const filteredData = fetchedData.filter(item => {
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      item.ags_minimum.toString().includes(query) ||
      item.ags_maximum.toString().includes(query) ||
      item.ags_rate.toString().includes(query);

    if (activeTab === 'active') {
      return item.ags_is_archive !== true && matchesSearch;
    }

    return item && matchesSearch;
  });

  const handleCreate = () => {
    const sortedData = [...fetchedData]
      .filter(item => !item.ags_is_archive) // Only active records
      .sort((a, b) => new Date(b.ags_date).getTime() - new Date(a.ags_date).getTime());

    const lastMaxRange = sortedData.length > 0 ? sortedData[0].ags_maximum : 0;

    router.push({
      pathname: '/(treasurer)/rates/annual-gross-sales-create',
      params: {
        lastMaxRange: lastMaxRange.toString(),
      },
    });
  };

  const handleDelete = (agsId: string) => {
    deleteGrossSales(Number(agsId))
  }

   const handleEdit = (item: AnnualGrossSales) => {
      router.push({
        pathname: '/(treasurer)/rates/annual-gross-sales-edit',
        params: {
          ags_id: item.ags_id.toString(),
          ags_minimum: item.ags_minimum,
          ags_maximum: item.ags_maximum.toString(),
          ags_rate: item.ags_rate
        },
      });
    };

  const renderRateCard = (
    item: AnnualGrossSales,
    showStatus: boolean = false,
    showActions: boolean = false
  ) => (
    <Card
      key={item.ags_id}
      className="mb-3 border-2 border-gray-200 shadow-sm bg-white"
    >
      <CardHeader className="pb-3">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-3">
            <Text className="font-semibold text-lg text-[#1a2332] mb-1">
              ₱{item.ags_minimum} - ₱{item.ags_maximum}
            </Text>

            {showStatus && (
              <View className="flex-row items-center mb-2">
                {item.ags_is_archive ? (
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
            <View className="flex-row space-x-4 gap-2">
              <Pressable 
                className="bg-blue-50 p-2 rounded-lg"
                onPress={() => handleEdit(item)}
              >
                <Edit3 size={16} color="#3b82f6" />
              </Pressable>

              <ConfirmationModal
                trigger={ 
                  <Pressable className="bg-red-50 p-2 rounded-lg">
                    <Trash2 size={16} color="#ef4444" />
                  </Pressable>
                }
                title="Confirm Delete"
                description="Are you sure you want to delete this record? This action will set the record to inactive state and cannot be undone."
                actionLabel='Confirm'
                onPress={() => handleDelete(item.ags_id)}
              />
            </View>
          )}
        </View>
      </CardHeader>

      <CardContent className="pt-3 border-t border-gray-200">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-[#2a3a61]">₱{item.ags_rate}</Text>
            <Text className="text-xs text-gray-500 mt-1">
              Date Added/ Updated: {new Date(item.ags_date).toLocaleString()}
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2a3a61" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <Text className="font-bold text-xl text-[#1a2332] text-center mb-1">
          Barangay Clearance For Business Permit Based on Annual Gross Sales For Receipts
        </Text>
        <View className="h-1 bg-gradient-to-r from-[#2a3a61] to-[#4f46e5] rounded-full" />

        {/* Search and Add */}
        <View className="mb-4">
          <View className="relative mb-3">
            <Search className="absolute left-3 top-3 text-gray-500" size={17} />
            <TextInput
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="pl-10 w-full h-10 bg-white text-base rounded-lg p-2 border border-gray-300"
            />
          </View>
          <Pressable
            onPress={handleCreate}
            className="bg-primaryBlue px-4 py-3 rounded-xl flex-row items-center justify-center shadow-md"
          >
            <Plus size={20} color="white" />
            <Text className="text-white ml-2 font-semibold">Add</Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <Tabs  value={activeTab} onValueChange={val => setActiveTab(val as 'active' | 'archive')} >
        <TabsList className="bg-blue-50 mb-5 mt-5 flex-row justify-between">
          <TabsTrigger  value="active"  className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}>
            <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
              Active
            </Text>
          </TabsTrigger>
          <TabsTrigger  value="archive" className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`} >
            <View className="flex-row items-center justify-center">
               <History  size={16} className="mr-1" color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'}/>
                <Text className={`${ activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500' } pl-1`}>
                  History
                </Text>
            </View>
          </TabsTrigger>
        </TabsList>

          {/* Active Tab */}
          <TabsContent value="active">
            <FlatList
              data={filteredData}
              renderItem={({ item }) => renderRateCard(item, false, true)}
              keyExtractor={item => item.ags_id.toString()}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text className="text-center text-gray-500 py-4">No rates found</Text>
              }
            />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="archive">
            <FlatList
              data={filteredData}
              renderItem={({ item }) => renderRateCard(item, true, false)}
              keyExtractor={item => item.ags_id.toString()}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text className="text-center text-gray-500 py-4">No rates found</Text>
              }
            />
          </TabsContent>
        </Tabs>
      </ScrollView>
    </SafeAreaView>
  );
}