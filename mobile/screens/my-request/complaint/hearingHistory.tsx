import { Text, View, TouchableOpacity } from "react-native";
import PageLayout from "@/screens/_PageLayout";
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { useRouter } from "expo-router";

export default function HearingHistory(){
    const router = useRouter()

    return(
        <PageLayout
            leftAction={
              <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                <ChevronLeft size={24} className="text-gray-700" />
              </TouchableOpacity>
            }
            
            headerTitle={<Text className="text-gray-900 text-[13px]">Hearing Schedule History</Text>}
            rightAction={
                <Text className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center" > </Text>
            }          
        >
            <View></View>
          

          
       </PageLayout>
    )
}