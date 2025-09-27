// import { SafeAreaView, Text, ScrollView, View, TouchableOpacity, Alert } from "react-native"
// import { Info, User, Calendar } from "lucide-react-native"
// import { Card, CardContent, CardHeader } from "@/components/ui/card"
// import type { BudgetPlan } from "@/screens/treasurer/budget-plan/budgetPlanInterfaces"
// import { formatDate } from "@/helpers/dateHelpers"

// const formatNumber = (num: number) => {
//   return `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
// }

// export default function MobileBudgetPlanView({ budgetData }: { budgetData: BudgetPlan }) {
//   const availableResources =
//     Number(budgetData?.plan_balance || 0) +
//     Number(budgetData?.plan_tax_share || 0) +
//     Number(budgetData?.plan_tax_allotment || 0) +
//     Number(budgetData?.plan_cert_fees || 0) +
//     Number(budgetData?.plan_other_income || 0)

//   const showResourcesBreakdown = () => {
//     Alert.alert(
//       "NET Available Resources Breakdown",
//       `Balance: ${formatNumber(budgetData?.plan_balance ?? 0)}\n` +
//         `Tax Share: ${formatNumber(budgetData?.plan_tax_share ?? 0)}\n` +
//         `Tax Allotment: ${formatNumber(budgetData?.plan_tax_allotment ?? 0)}\n` +
//         `Cert Fees: ${formatNumber(budgetData?.plan_cert_fees ?? 0)}\n` +
//         `Other Income: ${formatNumber(budgetData?.plan_other_income ?? 0)}\n\n` +
//         `Total: ${formatNumber(availableResources)}`,
//     )
//   }

//   const renderBudgetCard = (
//     title: string,
//     value: number,
//     subtitle?: string,
//     isNegative?: boolean,
//     isHighlight?: boolean,
//   ) => (
//     <Card
//       className={`mb-4 ${isHighlight ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg" : "bg-white border-gray-100 shadow-sm"}`}
//     >
//       <CardContent className="p-5">
//         <View className="space-y-3">
//           <Text
//             className={`text-sm font-semibold ${isHighlight ? "text-blue-700" : "text-gray-600"} uppercase tracking-wide`}
//           >
//             {title}
//           </Text>
//           {subtitle && <Text className="text-xs text-gray-500 leading-relaxed">{subtitle}</Text>}
//           <Text
//             className={`text-2xl font-bold ${
//               isNegative ? "text-red-600" : isHighlight ? "text-blue-800" : "text-gray-900"
//             }`}
//           >
//             {formatNumber(value)}
//           </Text>
//         </View>
//       </CardContent>
//     </Card>
//   )

//   const renderBudgetItems = () => {
//     return (
//       <Card className="mb-6 bg-white border-gray-100 shadow-sm">
//         <CardHeader className="pb-4 border-b border-gray-50">
//           <Text className="text-xl font-bold text-gray-900">Budget Items</Text>
//           <Text className="text-sm text-gray-500 mt-1">Detailed breakdown of budget allocations</Text>
//         </CardHeader>
//         <CardContent className="pt-4">
//           <View className="space-y-4">
//             {budgetData?.details?.map((item, index) => (
//               <View key={index} className="border-b border-gray-50 pb-4 last:border-b-0 last:pb-0">
//                 <View className="flex-row justify-between items-start">
//                   <View className="flex-1 pr-4">
//                     <Text className="text-base text-gray-800 leading-6 font-medium" numberOfLines={0}>
//                       {item.dtl_budget_item}
//                     </Text>
//                   </View>
//                   <View className="min-w-[140px] items-end">
//                     <Text className="text-lg font-bold text-gray-900 text-right" numberOfLines={1} adjustsFontSizeToFit>
//                       {formatNumber(item.dtl_proposed_budget)}
//                     </Text>
//                   </View>
//                 </View>
//               </View>
//             ))}
//           </View>
//         </CardContent>
//       </Card>
//     )
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-gray-50">
//       <ScrollView className="flex-1 px-4 py-6">
//         {(budgetData?.staff_name || budgetData?.plan_issue_date) && (
//           <Card className="mb-6 bg-white border-gray-100 shadow-sm">
//             <CardContent className="p-5">
//               <View className="flex-row items-center space-x-3">
//                 <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
//                   <User size={20} color="#3B82F6" />
//                 </View>
//                 <View className="flex-1">
//                   <Text className="text-sm font-medium text-gray-600 mb-1">Created By:</Text>
//                   <Text className="text-base font-semibold text-gray-900">
//                     {budgetData?.staff_name || "Unknown"}
//                     {budgetData?.plan_issue_date && (
//                       <Text className="font-normal text-gray-600"> on {formatDate(budgetData.plan_issue_date, "long")}</Text>
//                     )}
//                   </Text>
//                 </View>
//                 {budgetData?.plan_issue_date && (
//                   <View className="items-center">
//                     <Calendar size={18} color="#6B7280" />
//                   </View>
//                 )}
//               </View>
//             </CardContent>
//           </Card>
//         )}

//         <View className="mb-8">
//           <Text className="text-2xl font-bold text-gray-900 mb-6">Financial Summary</Text>

//           {/* NET Available Resources Card - Enhanced as primary highlight */}
//           <Card className="mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
//             <CardContent className="p-6">
//               <View className="flex-row justify-between items-center">
//                 <View className="flex-1">
//                   <Text className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-2">
//                     NET Available Resources
//                   </Text>
//                   <Text className="text-3xl font-bold text-emerald-800">{formatNumber(availableResources)}</Text>
//                 </View>
//                 <TouchableOpacity
//                   onPress={showResourcesBreakdown}
//                   className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center"
//                 >
//                   <Info size={24} color="#059669" />
//                 </TouchableOpacity>
//               </View>
//             </CardContent>
//           </Card>

//           {renderBudgetCard(
//             "Total Budgetary Obligation",
//             budgetData?.plan_budgetaryObligations ?? 0,
//             "Total allocated budget",
//             true,
//           )}
//           {renderBudgetCard(
//             "Balance Unappropriated",
//             budgetData?.plan_balUnappropriated ?? 0,
//             "Remaining unallocated funds",
//           )}
//           {renderBudgetCard("Actual Income", budgetData?.plan_actual_income ?? 0, "Confirmed revenue")}
//           {renderBudgetCard("Actual RPT Income", budgetData?.plan_rpt_income ?? 0, "Real Property Tax revenue")}
//         </View>

//         <View className="mb-6">
//           <Text className="text-2xl font-bold text-gray-900 mb-6">Budget Allocation</Text>
//           {budgetData?.details && budgetData.details.length > 0 && renderBudgetItems()}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   )
// }


import { SafeAreaView, Text, ScrollView, View, TouchableOpacity, Alert } from "react-native"
import { Info, User, Calendar, TrendingUp, DollarSign, PieChart } from "lucide-react-native"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { BudgetPlan } from "@/screens/treasurer/budget-plan/budgetPlanInterfaces"
import { formatDate } from "@/helpers/dateHelpers"

const formatNumber = (num: number) => {
  return `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function MobileBudgetPlanView({ budgetData }: { budgetData: BudgetPlan }) {
  const availableResources =
    Number(budgetData?.plan_balance || 0) +
    Number(budgetData?.plan_tax_share || 0) +
    Number(budgetData?.plan_tax_allotment || 0) +
    Number(budgetData?.plan_cert_fees || 0) +
    Number(budgetData?.plan_other_income || 0)

  const showResourcesBreakdown = () => {
    Alert.alert(
      "Available Resources Breakdown",
      `Balance: ${formatNumber(budgetData?.plan_balance ?? 0)}\n` +
        `Tax Share: ${formatNumber(budgetData?.plan_tax_share ?? 0)}\n` +
        `Tax Allotment: ${formatNumber(budgetData?.plan_tax_allotment ?? 0)}\n` +
        `Cert Fees: ${formatNumber(budgetData?.plan_cert_fees ?? 0)}\n` +
        `Other Income: ${formatNumber(budgetData?.plan_other_income ?? 0)}\n\n` +
        `Total: ${formatNumber(availableResources)}`,
    )
  }

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
  }: {
    title: string
    value: number
    subtitle?: string
    icon: any
  }) => {
    return (
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center">
                  <Icon size={20} color="#64748b" />
                </View>
                <Text className="text-sm font-medium text-gray-600 font-poppins">{title}</Text>
              </View>
              {subtitle && <Text className="text-xs text-gray-500 mb-3 leading-relaxed font-poppins">{subtitle}</Text>}
              <Text className="text-2xl font-semibold text-gray-900 font-poppins">{formatNumber(value)}</Text>
            </View>
          </View>
        </CardContent>
      </Card>
    )
  }

  const AvailableResourcesCard = () => (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-12 h-12 bg-blue-100 rounded-lg items-center justify-center">
                <TrendingUp size={24} color="#2563eb" />
              </View>
              <Text className="text-sm font-medium text-blue-700 font-poppins">AVAILABLE RESOURCES</Text>
            </View>
            <Text className="text-3xl font-bold text-blue-900 mb-2 font-poppins">
              {formatNumber(availableResources)}
            </Text>
            <Text className="text-sm text-blue-600 font-poppins">Total funds available for allocation</Text>
          </View>
          <TouchableOpacity
            onPress={showResourcesBreakdown}
            className="w-12 h-12 bg-blue-100 rounded-lg items-center justify-center"
          >
            <Info size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </CardContent>
    </Card>
  )

  const BudgetItemsCard = () => (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="pb-4 border-b border-gray-200">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center">
            <PieChart size={20} color="#64748b" />
          </View>
          <View>
            <Text className="text-xl font-semibold text-gray-900 font-poppins">Budget Allocation</Text>
            <Text className="text-sm text-gray-500 mt-1 font-poppins">Detailed breakdown of budget items</Text>
          </View>
        </View>
      </CardHeader>
      <CardContent className="pt-6">
        <View className="space-y-4">
          {budgetData?.details?.map((item, index) => (
            <View key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-4">
                  <Text className="text-base font-medium text-gray-900 leading-6 font-poppins" numberOfLines={0}>
                    {item.dtl_budget_item}
                  </Text>
                </View>
                <View className="min-w-[140px] items-end">
                  <Text
                    className="text-lg font-semibold text-gray-900 font-poppins"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {formatNumber(item.dtl_proposed_budget)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </CardContent>
    </Card>
  )

  const StaffInfoCard = () => (
    <Card className="bg-gray-50 border-gray-200">
      <CardContent className="p-6">
        <View className="flex-row items-center gap-4">
          <View className="w-12 h-12 bg-gray-200 rounded-lg items-center justify-center">
            <User size={24} color="#64748b" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-500 mb-1 font-poppins">Prepared by</Text>
            <Text className="text-sm font-semibold text-gray-900 font-poppins">
              {budgetData?.staff_name || "Unknown"}
            </Text>
            {budgetData?.plan_issue_date && (
              <View className="flex-row items-center gap-2 mt-2">
                <Calendar size={14} color="#64748b" />
                <Text className="text-sm text-gray-500 font-poppins">
                  {formatDate(budgetData.plan_issue_date, "long")}
                </Text>
              </View>
            )}
          </View>
        </View>
      </CardContent>
    </Card>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Financial Overview */}
        <View className="mb-8">
          <View className="space-y-4">
            <AvailableResourcesCard />

            <MetricCard
              title="Budget Obligations"
              value={budgetData?.plan_budgetaryObligations ?? 0}
              subtitle="Total allocated budget commitments"
              icon={DollarSign}
            />

            <MetricCard
              title="Unappropriated Balance"
              value={budgetData?.plan_balUnappropriated ?? 0}
              subtitle="Remaining unallocated funds"
              icon={TrendingUp}
            />

            <View className="grid grid-cols-2 gap-4">
              <MetricCard
                title="Actual Income"
                value={budgetData?.plan_actual_income ?? 0}
                subtitle="Confirmed revenue"
                icon={DollarSign}
              />

              <MetricCard
                title="RPT Income"
                value={budgetData?.plan_rpt_income ?? 0}
                subtitle="Property tax revenue"
                icon={DollarSign}
              />
            </View>
          </View>
        </View>

        {/* Budget Items */}
        {budgetData?.details && budgetData.details.length > 0 && (
          <View className="mb-8">
            <BudgetItemsCard />
          </View>
        )}

        {(budgetData?.staff_name || budgetData?.plan_issue_date) && (
          <View className="mb-4">
            <StaffInfoCard />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
