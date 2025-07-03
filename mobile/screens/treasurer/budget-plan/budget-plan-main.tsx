import { SafeAreaView, Text, ScrollView, View, FlatList, TextInput, Pressable, TouchableOpacity } from "react-native";
import { Search, Archive, Trash2, ArchiveRestore } from "lucide-react-native";
import React from "react";
import { usegetBudgetPlan } from "./queries/budgetPlanFetchQueries"
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BudgetPlanType } from "./queries/budgetPlanFetchQueries";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { useArchiveBudgetPlan, useRestoreBudgetPlan } from "./queries/budgetPlanUpdateQueries";
import { useDeleteBudgetPlan } from "./queries/budgetPlanDeleteQueries";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "expo-router";


export default function BudgetPlanMain() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const router = useRouter();
    const {data: fetchedData = [], isLoading} = usegetBudgetPlan();
    const [activeTab, setActiveTab] = React.useState<'active' | 'archive'>('active');
    const {mutate: archivePlan} = useArchiveBudgetPlan()
    const {mutate: restorePlan} = useRestoreBudgetPlan()
    const {mutate: deletePlan} = useDeleteBudgetPlan();
    const filteredData = fetchedData.filter(item => {
        const query = searchQuery.trim().toLowerCase();

        const matchesSearch =
        item.plan_year?.toString().includes(searchQuery.toLowerCase()) ||
        item.plan_budgetaryObligations?.toString().includes(searchQuery.toLowerCase())
        if (activeTab === 'active') {
        return item.plan_is_archive !== true && matchesSearch;
        }

        return item && matchesSearch;
    });

    const handleArchive = (planId: number) => {
        archivePlan(planId)
    };

    const handleRestore = (planId: number) => {
        restorePlan(planId)
    }

    const handleDelete = (planId: number) => {
        deletePlan(planId)
    }

    const handleOpenPlan = (plan_id: number) => {
        router.push({
           pathname: "/(treasurer)/budgetPlan/budget-plan-view",
           params: {
            plan_id: plan_id
           }
        })
    }

   // Update the renderBudgetPlanCard function to wrap the card in a TouchableOpacity
const renderBudgetPlanCard = (item: BudgetPlanType, isArchived: boolean = false) => (
    <TouchableOpacity 
        onPress={() => handleOpenPlan(item.plan_id|| 0)}
        // onPress={() => alert(item.plan_id)}
        activeOpacity={0.8}
    >
        <Card
            key={item.plan_id || ''}
            className="mb-3 border-2 border-gray-200 shadow-sm bg-white"
        >
            <CardHeader className="pb-3">
                <View className="flex-row justify-between items-start">
                     <View className="flex-1">
                         <Text className="font-semibold text-lg text-[#1a2332] mb-1">
                             Budget Plan {item.plan_year}
                         </Text>
                         <Text className="text-sm text-gray-500">
                             Issue Date: {item.plan_issue_date ? new Date(item.plan_issue_date).toLocaleDateString() : 'N/A'}
                         </Text>
                     </View>
                    
                    {isArchived ? (
                        <View className="flex-row">
                            <ConfirmationModal
                                trigger={
                                    <Pressable className="bg-green-50 p-2 rounded-lg ml-2">
                                        <ArchiveRestore size={16} color="#10b981" />
                                    </Pressable>
                                }
                                title="Restore Budget Plan"
                                description="This budget plan will be restored to active plans."
                                actionLabel="Restore"
                                onPress={() => handleRestore(Number(item.plan_id) || 0)}
                            />
                            <ConfirmationModal
                                trigger={
                                    <Pressable className="bg-red-50 p-2 rounded-lg ml-2">
                                        <Trash2 size={16} color="#ef4444" />
                                    </Pressable>
                                }
                                title="Delete Budget Plan"
                                description="This action cannot be undone. The budget plan will be permanently deleted."
                                actionLabel="Delete"
                                onPress={() => handleDelete(Number(item.plan_id) || 0)}
                            />
                        </View>
                    ) : (
                        <ConfirmationModal
                            trigger={
                                <Pressable className="bg-red-50 p-2 rounded-lg ml-2">
                                    <Archive size={16} color="#ef4444" />
                                </Pressable>
                            }
                            title="Archive Budget Plan"
                            description="This budget plan will be moved to archive. You can restore it later if needed."
                            actionLabel="Archive"
                            onPress={() => handleArchive(Number(item.plan_id) || 0)}
                        />
                    )}
                </View>
            </CardHeader>

            <CardContent className="pt-3 border-t border-gray-200">
                 <View className="space-y-3">
                     <View className="flex-row justify-between items-center">
                         <Text className="text-sm text-gray-600">Budgetary Obligations:</Text>
                         <Text className="text-lg font-bold text-[#2a3a61]">
                             ₱{item.plan_budgetaryObligations?.toLocaleString() || '0'}
                         </Text>
                     </View>
                    
                     <View className="flex-row justify-between items-center">
                         <Text className="text-sm text-gray-600">Balance Unappropriated:</Text>
                         <Text className="text-lg font-bold text-[#2a3a61]">
                             ₱{item.plan_balUnappropriated?.toLocaleString() || '0'}
                         </Text>
                     </View>
                 </View>
             </CardContent>
        </Card>
    </TouchableOpacity>
);


    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-500">Loading budget plans...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <View className="px-4 py-4 mt-4">
                    <Text className="font-semibold text-xl text-[#2a3a61] mt-5">
                        Budget Plan
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                        Efficiently oversee and allocate your budget to optimize financial planning and sustainability.
                    </Text>
                </View>

                <View className="px-4">
                    <View className="relative mb-3">
                        <Search className="absolute left-3 top-3 text-gray-500" size={17}/>
                        <TextInput 
                            placeholder="Search by year or budget amount..." 
                            value={searchQuery} 
                            onChangeText={setSearchQuery} 
                            className="pl-10 w-full h-10 bg-white text-base rounded-lg p-2 border border-gray-300" 
                        />
                    </View>
                </View>

                <View className="px-4">
                    <Tabs value={activeTab} onValueChange={val => setActiveTab(val as 'active' | 'archive')}>
                        <TabsList className="bg-blue-50 mb-5 mt-5 flex-row justify-between">
                            <TabsTrigger value="active" className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}>
                                <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                                    Active
                                </Text>
                            </TabsTrigger>
                            <TabsTrigger value="archive" className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}>
                                <View className="flex-row items-center justify-center">
                                <Archive size={16} className="mr-1" color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'}/>
                                <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
                                    Archive
                                </Text>
                                </View>
                            </TabsTrigger>
                        </TabsList>

                        {/* Active Tab */}
                    <TabsContent value="active">
                            <View>
                                <FlatList
                                    data={filteredData.filter(item => !item.plan_is_archive)}
                                    renderItem={({ item }) => renderBudgetPlanCard(item)}
                                    keyExtractor={item => item.plan_id?.toString() ?? ''}
                                    scrollEnabled={false}
                                    ListEmptyComponent={
                                        <Text className="text-center text-gray-500 py-4">No active budget plans found</Text>
                                    }
                                />
                            </View>
                        </TabsContent>

                        {/* History Tab */}
                        <TabsContent value="archive">
                            <View>
                                <FlatList
                                    data={filteredData.filter(item => item.plan_is_archive)}
                                    renderItem={({ item }) => renderBudgetPlanCard(item, true)}
                                    keyExtractor={item => item.plan_id?.toString() ?? ''}
                                    scrollEnabled={false}
                                    ListEmptyComponent={
                                        <Text className="text-center text-gray-500 py-4">No archived budget plans found</Text>
                                    }
                                />
                            </View>
                        </TabsContent>
                    </Tabs>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}