import { View, Text } from "react-native";
import { router } from "expo-router";
import React from "react";
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from "@/components/ui/button";
import { formatDate } from "@/helpers/dateHelpers";
import { Card } from "@/components/ui/card";
import { CircleCheck } from "@/lib/icons/CircleCheck";

export default function BusinessDetails({ business, modReq = [] }: {
  business: Record<string, any>,
  modReq: Record<string, any>[]
}) {

  // =========== STATE INITIALIZATION ===========
  const pending = modReq.filter(req => !req.bm_status);
  const approved = modReq.filter(req => req.bm_status.toLowerCase() == "approved")
  const rejected = modReq.filter(req => req.bm_status.toLowerCase() == "rejected")

  // =========== RENDER ===========
  return (
    <Card className="rounded-2xl shadow-xl overflow-hidden">
      <LinearGradient
        colors={['#0035b1', '#0054db', '#0036b4']} // Enhanced gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        {/* Header Card */}
        <View className="px-6 pt-6">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-gray-300 bg-[#0035b1] text-xs font-medium">
                No. {business?.bus_id}
              </Text>
              <Text className="text-white text-2xl font-PoppinsSemiBold mt-1">
                {business?.bus_name}
              </Text>
            </View>

            {/* Verification Status */}
            <View className="flex-row gap-2 mb-6 items-center bg-green-100 rounded-full pr-2 shadow-md">
              <CircleCheck className="" fill={"#22c553"} stroke={"#dcfce7"} />
              <Text className="text-green-500 text-sm font-medium">
                {formatDate(business?.bus_date_verified, "short" as any)}
              </Text>
            </View>
          </View>
        </View>

        {/* Business Info Section */}
        <View className="px-6 pb-6">
          {/* Gross Sales */}
          <View className="flex-row justify-center mb-4">
            <Text className="text-white text-[36px] font-PoppinsSemiBold">
              ₱ {business?.bus_gross_sales?.toLocaleString() || "0"}
            </Text>
          </View>

          {/* Action Button or Info */}
          <View>
            {pending.length > 0 ? (
              <View className="mb-4">
                <Text className="text-center text-sm text-blue-500 font-PoppinsMedium">
                  Pending Update Request
                </Text>
              </View>
            ) : (
              <Button
                className="bg-white border border-blue-200/30 rounded-full mb-3"
                onPress={() =>
                  router.push({
                    pathname: "/(business)/edit-business",
                    params: {
                      business: JSON.stringify(business),
                    },
                  })
                }
              >
                <Text className="text-gray-700 text-[13px] font-medium">
                  Update Information
                </Text>
              </Button>
            )}
          </View>
        </View>
      </LinearGradient>
    </Card>
  );
}
