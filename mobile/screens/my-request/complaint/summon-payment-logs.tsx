import PageLayout from "@/screens/_PageLayout";
import { useGetSummonPaymentLogs } from "./queries/summon-relatedFetchQueries";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { LoadingState } from "@/components/ui/loading-state";
import { TouchableOpacity, View, Text } from "react-native";
import {ChevronLeft} from "@/lib/icons/ChevronLeft"


export default function SummonPaymentLogs(){
    const router = useRouter()
    const params = useLocalSearchParams()
    const comp_id = params.comp_id as string
    const {data: summonLogs = [], isLoading, isFetching} = useGetSummonPaymentLogs(comp_id)

    if (isLoading || isFetching) {
        return (
        <View className="flex-1 bg-gradient-to-b from-blue-50 to-white justify-center items-center">
            <View className="h-64 justify-center items-center">
            <LoadingState />
            </View>
        </View>
        );
    }
    return(
        <PageLayout
              leftAction={
                <TouchableOpacity 
                  onPress={() => router.back()} 
                  className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
                >
                  <ChevronLeft size={24} className="text-gray-700" />
                </TouchableOpacity>
              }
              headerTitle={<Text className="text-gray-900 text-[13px]">Summon Payment Logs</Text>}
              wrapScroll={false}
            >
            <View>

            </View>
        
        </PageLayout>
       
    )
}