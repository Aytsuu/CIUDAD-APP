import { TouchableOpacity, View, Text, ScrollView } from "react-native";
import PageLayout from "../_PageLayout";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { router } from "expo-router";
import Ciudad from '@/assets/icons/essentials/ciudad_logo.svg'

export default function About() {
  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-black text-[13px]">About</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="px-6 space-y-6">
        {/* About Section */}
        <View>
          <View className="mb-3">
            <Ciudad width={80} height={30}/>
          </View>
          <Text
            className="text-sm text-gray-700 leading-relaxed"
            style={{ textAlign: "justify" }}
          >
            Official digital platform developed for{" "}
            <Text className="font-medium">
              Barangay San Roque (Ciudad), Cebu City
            </Text>
            , with the objective of enhancing public service delivery through
            technology. The application is designed to improve efficiency,
            reduce manual workload, and provide residents with faster and more
            reliable access to barangay services.
          </Text>

          <Text
            className="text-sm text-gray-700 leading-relaxed mt-3"
            style={{ textAlign: "justify" }}
          >
            Through this system, residents are able to:
          </Text>

          <View className="mt-2 ml-4 space-y-1">
            <Text
              className="text-sm text-gray-700 font-medium"
              style={{ textAlign: "justify" }}
            >
              • Secure certificates and clearances online;
            </Text>
            <Text
              className="text-sm text-gray-700 font-medium"
              style={{ textAlign: "justify" }}
            >
              • Report incidents and submit blotter reports;
            </Text>
            <Text
              className="text-sm text-gray-700 font-medium"
              style={{ textAlign: "justify" }}
            >
              • Request for medicine online;
            </Text>
            <Text
              className="text-sm text-gray-700 font-medium"
              style={{ textAlign: "justify" }}
            >
              • Schedule for health consultation; and etc.
            </Text>
          </View>

          <Text
            className="text-sm text-gray-700 leading-relaxed mt-3"
            style={{ textAlign: "justify" }}
          >
            By transitioning these services to a digital platform, Ciudad
            ensures that transactions which previously required significant time
            and effort are now processed more efficiently and transparently.
          </Text>

          <Text
            className="text-sm text-gray-700 leading-relaxed mt-3"
            style={{ textAlign: "justify" }}
          >
            This initiative strengthens the connection between residents and
            barangay personnel, fostering better communication, accountability,
            and responsiveness. <Text className="font-medium">Ciudad</Text>{" "}
            stands as part of Barangay San Roque’s commitment to modernize
            governance and deliver services that are accessible, timely, and
            citizen-focused.
          </Text>
        </View>

        {/* Mission */}
        <View className="mt-4">
          <Text className="text-xl font-bold text-primaryBlue mb-2">
            Mission
          </Text>
          <Text
            className="text-sm text-gray-700 leading-relaxed"
            style={{ textAlign: "justify" }}
          >
            To provide the residents of{" "}
            <Text className="font-medium">Barangay San Roque (Ciudad)</Text>{" "}
            with a secure, reliable, and efficient digital platform that
            streamlines access to essential services, promotes transparency, and
            strengthens the partnership between the community and local
            government.
          </Text>
        </View>

        {/* Vision */}
        <View className="mt-4">
          <Text className="text-xl font-bold text-primaryBlue mb-2">
            Vision
          </Text>
          <Text
            className="text-sm text-gray-700 leading-relaxed"
            style={{ textAlign: "justify" }}
          >
            A connected and progressive{" "}
            <Text className="font-medium">Barangay San Roque (Ciudad)</Text>{" "}
            where digital innovation enhances governance, empowers residents,
            and ensures that public services are delivered with efficiency,
            integrity, and accountability.
          </Text>
        </View>
      </View>
    </PageLayout>
  );
}
