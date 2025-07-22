import PageLayout from "../_PageLayout";
import { View, Text, TouchableOpacity } from "react-native";
import {ChevronLeft} from "@/lib/icons/ChevronLeft"
import { useRouter } from "expo-router";

export default function SummonDetailsVeiw(){
    const router = useRouter();
    
    return(
        <PageLayout
            leftAction={
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center" >
                    <ChevronLeft size={24} className="text-gray-700" />
                </TouchableOpacity>
            }
            headerTitle={<Text className="text-gray-900 text-[13px]">Summon & Case Tracker</Text>}
            rightAction={<View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>}
        >
            <View>

            </View>
        </PageLayout>
    )
}