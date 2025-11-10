import PageLayout from "@/screens/_PageLayout";
import { useGetFileActionPaymentLogs } from "./queries/summon-relatedFetchQueries";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { LoadingState } from "@/components/ui/loading-state";
import { TouchableOpacity, View, Text, ScrollView } from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/helpers/dateHelpers";
import { formatTimestamp } from "@/helpers/timestampformatter";

export default function FileActionPaymentLogs() {
    const router = useRouter()
    const params = useLocalSearchParams()
    const comp_id = params.comp_id
    const { data: fileActionLogs = [], isLoading } = useGetFileActionPaymentLogs(String(comp_id))

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return "bg-green-100 border-green-200 text-green-700";
            case 'unpaid':
                return "bg-red-100 border-red-200 text-red-700";
            default:
                return "bg-gray-100 border-gray-200 text-gray-700";
        }
    };

    const getRequestStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return "bg-green-100 border-green-200 text-green-700";
            case 'rejected':
                return "bg-red-100 border-red-200 text-red-700";
            case 'pending':
                return "bg-amber-100 border-amber-200 text-amber-700";
            default:
                return "bg-gray-100 border-gray-200 text-gray-700";
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-gradient-to-b from-blue-50 to-white justify-center items-center">
                <View className="h-64 justify-center items-center">
                    <LoadingState />
                </View>
            </View>
        );
    }

    return (
        <PageLayout
            leftAction={
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
                >
                    <ChevronLeft size={24} className="text-gray-700" />
                </TouchableOpacity>
            }
            headerTitle={<Text className="text-gray-900 text-[13px]">File Action Payment Logs</Text>}
            wrapScroll={false}
        >
            <View className="flex-1 bg-gray-50">
                {/* Empty State */}
                {fileActionLogs.length === 0 && (
                    <View className="flex-1 justify-center items-center p-6">
                        <Text className="text-gray-500 text-center text-md font-medium mb-2">
                            No Payment Records
                        </Text>
                        <Text className="text-gray-400 text-center text-sm">
                            No payment records found for this file action.
                        </Text>
                    </View>
                )}

                {/* Payment Logs List */}
                {fileActionLogs.length > 0 && (
                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        <View className="p-6 gap-4">
                            {fileActionLogs.map((payment: any, index: number) => {
                                const isPaid = payment.pay_status?.toLowerCase() === "paid";
                                const amount = payment.pay_amount?.toLocaleString() ?? "0";

                                return (
                                  <Card
                                    key={payment.pay_id ?? index}
                                    className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                                  >
                                    <CardContent className="p-0">
                                      {/* Header – status + amount */}
                                      <View className="flex-row items-center justify-between p-5 pb-4">
                                        <View className="flex-row gap-2">
                                          {/* Payment status */}
                                          {payment.pay_status && (
                                            <View
                                              className={`px-3 py-1.5 rounded-full border ${getStatusColor(payment.pay_status)}`}
                                            >
                                              <Text className="text-xs font-semibold capitalize">
                                                {payment.pay_status}
                                              </Text>
                                            </View>
                                          )}

                                          {/* Request status */}
                                          {payment.pay_req_status && (
                                            <View
                                              className={`px-3 py-1.5 rounded-full border ${getRequestStatusColor(payment.pay_req_status)}`}
                                            >
                                              <Text className="text-xs font-semibold capitalize">
                                                {payment.pay_req_status}
                                              </Text>
                                            </View>
                                          )}
                                        </View>

                                        <Text className="text-xl font-bold text-gray-900">
                                          ₱{amount}
                                        </Text>
                                      </View>

                                      {/* Divider */}
                                      <View className="mx-5 h-px bg-gray-100" />

                                      {/* Details – grid style */}
                                      <View className="p-5 pt-4 space-y-3">
                                        {/* Request date */}
                                        {payment.pay_date_req && (
                                          <View className="flex-row justify-between">
                                            <Text className="text-sm text-gray-500">Requested</Text>
                                            <Text className="text-sm font-medium text-gray-900">
                                              {formatTimestamp(payment.pay_date_req)}
                                            </Text>
                                          </View>
                                        )}

                                        {/* Due date */}
                                        {payment.pay_due_date && (
                                          <View className="flex-row justify-between">
                                            <Text className="text-sm text-gray-500">Due</Text>
                                            <Text className="text-sm font-medium text-gray-900">
                                              {formatDate(payment.pay_due_date, "long")}
                                            </Text>
                                          </View>
                                        )}

                                        {/* Paid date – only when paid */}
                                        {isPaid && payment.pay_date_paid && (
                                          <View className="flex-row justify-between">
                                            <Text className="text-sm text-gray-500">Paid on</Text>
                                            <Text className="text-sm font-medium text-green-600">
                                              {formatTimestamp(payment.pay_date_paid)}
                                            </Text>
                                          </View>
                                        )}
                                      </View>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                        </View>
                    </ScrollView>
                )}
            </View>
        </PageLayout>
    )
}