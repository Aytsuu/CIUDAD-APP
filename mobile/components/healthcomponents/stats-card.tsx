import { Heart } from "lucide-react-native";
import { View,Text } from "react-native";
import { Card, CardContent } from "../ui/card";

export const StatsCard = ({ count }: { count: number }) => (
  <Card className="mx-4 mb-4 bg- border-slate-200">
    <CardContent className="p-4">
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-red-100 rounded-lg items-center justify-center mr-3">
          <Heart size={20} color="#DC2626" />
        </View>
        <View>
          <Text className="text-slate-600 text-sm">Total Records</Text>
          <Text className="text-2xl font-bold text-slate-900">{count}</Text>
        </View>
      </View>
    </CardContent>
  </Card>
);