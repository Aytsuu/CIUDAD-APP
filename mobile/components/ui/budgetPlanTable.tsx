import { SafeAreaView, Text, ScrollView, View, TouchableOpacity, Alert } from "react-native"
import {
  Info,
  User,
  Calendar,
  TrendingUp,
  DollarSign,
  PieChart,
} from "lucide-react-native"
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
    const iconColor = title === "Budget Obligations" ? "#B91C1C" : title === "Unappropriated Balance" ? "#15803D" : title === "Actual Income" ? "#1D4ED8" : "#0D9488";
    return (
      <Card className="bg-white border border-gray-200 rounded-lg">
        <CardContent className="p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-10 h-10 bg-gray-100 rounded-md items-center justify-center">
              <Icon size={20} color={iconColor} />
            </View>
             <Text className="text-sm font-medium text-gray-600 mb-1 font-sans">{title}</Text>
          </View>
          <Text className={`text-xl font-semibold ${title === "Budget Obligations" ? "text-red-600" : "text-gray-900"} mb-1 font-sans`}>{formatNumber(value)}</Text>
          {subtitle && <Text className="text-xs text-gray-500 font-sans">{subtitle}</Text>}
        </CardContent>
      </Card>
    )
  }

  const AvailableResourcesCard = () => (
    <Card className="bg-white border border-gray-200 rounded-lg">
      <CardContent className="p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-10 h-10 bg-gray-100 rounded-md items-center justify-center">
                <TrendingUp size={20} color="#15803D" />
              </View>
              <Text className="text-sm font-medium text-gray-600 font-sans">AVAILABLE RESOURCES</Text>
            </View>
            <Text className="text-2xl font-semibold text-green-800 mb-1 font-sans">{formatNumber(availableResources)}</Text>
            <Text className="text-xs text-gray-500 font-sans">Total funds available for allocation</Text>
          </View>
          <TouchableOpacity
            onPress={showResourcesBreakdown}
            className="w-10 h-10 bg-gray-100 rounded-md items-center justify-center"
          >
            <Info size={18} color="#6D28D9" />
          </TouchableOpacity>
        </View>
      </CardContent>
    </Card>
  )

  const BudgetItemsCard = () => (
    <Card className="bg-white border border-gray-200 rounded-lg">
      <CardHeader className="pb-3 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-gray-100 rounded-md items-center justify-center">
            <PieChart size={20} color="#0D9488" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 font-sans">Budget Allocation</Text>
            <Text className="text-xs text-gray-500 mt-1 font-sans">Detailed breakdown of budget items</Text>
          </View>
        </View>
      </CardHeader>
      <CardContent className="pt-4">
        <View className="space-y-4">
          {budgetData?.details?.map((item, index) => (
            <View
              key={index}
              className="flex-row justify-between items-start py-2 border-b border-gray-100 last:border-b-0"
            >
              <View className="flex-1 pr-4">
                <Text className="text-sm font-medium text-gray-900 font-sans mb-1" numberOfLines={0}>
                  {item.dtl_budget_item}
                </Text>
                <View className="w-6 h-1 bg-gray-200 rounded-full">
                  <View className="w-4 h-1 bg-blue-500 rounded-full" />
                </View>
              </View>
              <View className="min-w-[120px] items-end">
                <Text className="text-base font-semibold text-gray-900 font-sans" numberOfLines={1} adjustsFontSizeToFit>
                  {formatNumber(item.dtl_proposed_budget)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </CardContent>
    </Card>
  )

  const StaffInfoCard = () => (
    <Card className="bg-white border border-gray-200 rounded-lg">
      <CardContent className="p-4">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-gray-100 rounded-md items-center justify-center">
            <User size={20} color="#1D4ED8" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-600 mb-1 font-sans">Prepared by</Text>
            <Text className="text-base font-semibold text-gray-900 font-sans">{budgetData?.staff_name || "Unknown"}</Text>
            {budgetData?.plan_issue_date && (
              <View className="flex-row items-center gap-2 mt-2">
                <Calendar size={12} color="#4B5563" />
                <Text className="text-xs text-gray-500 font-sans">
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
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-gray-900 mb-1 font-sans">Budget Overview</Text>
          <Text className="text-sm text-gray-600 font-sans">Financial planning and resource allocation</Text>
        </View>

        {/* Primary Metric */}
        <View className="mb-6">
          <AvailableResourcesCard />
        </View>

        {/* Key Metrics Grid */}
        <View className="mb-6">
          <View className="space-y-4">
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

            <View className="flex-row gap-4">
              <View className="flex-1">
                <MetricCard
                  title="Actual Income"
                  value={budgetData?.plan_actual_income ?? 0}
                  subtitle="Confirmed revenue"
                  icon={DollarSign}
                />
              </View>

              <View className="flex-1">
                <MetricCard
                  title="RPT Income"
                  value={budgetData?.plan_rpt_income ?? 0}
                  subtitle="Property tax revenue"
                  icon={DollarSign}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Budget Items */}
        {budgetData?.details && budgetData.details.length > 0 && (
          <View className="mb-6">
            <BudgetItemsCard />
          </View>
        )}

        {/* Staff Information */}
        {(budgetData?.staff_name || budgetData?.plan_issue_date) && (
          <View className="mb-6">
            <StaffInfoCard />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}