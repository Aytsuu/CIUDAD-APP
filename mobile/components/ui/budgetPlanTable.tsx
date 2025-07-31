import { SafeAreaView, Text, ScrollView, View, TouchableOpacity, Alert } from "react-native"
import { Info } from "lucide-react-native"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { BudgetPlanDetail, BudgetPlan } from "@/screens/treasurer/budget-plan/budgetPlanInterfaces"

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

  const personalServiceTotal =
    budgetData?.details
      ?.filter((d) => d.dtl_budget_category === "Personal Service")
      ?.reduce((sum, d) => sum + Number(d.dtl_proposed_budget || 0), 0) || 0

  const otherExpenseTotal =
    budgetData?.details
      ?.filter((d) => d.dtl_budget_category === "Other Expense")
      ?.reduce((sum, d) => sum + Number(d.dtl_proposed_budget || 0), 0) || 0

  const capitalOutlaysTotal =
    budgetData?.details
      ?.filter((d) => d.dtl_budget_category === "Capital Outlays")
      ?.reduce((sum, d) => sum + Number(d.dtl_proposed_budget || 0), 0) || 0

  const nonOfficeTotal =
    budgetData?.details
      ?.filter((d) => d.dtl_budget_category === "Non-Office")
      ?.reduce((sum, d) => sum + Number(d.dtl_proposed_budget || 0), 0) || 0

  const calamityFundTotal =
    budgetData?.details
      ?.filter((d) => d.dtl_budget_category === "LDRRM Fund")
      ?.reduce((sum, d) => sum + Number(d.dtl_proposed_budget || 0), 0) || 0

  const personalServiceLimit =
    (budgetData?.plan_actual_income ?? 0) * ((budgetData?.plan_personalService_limit ?? 0) / 100)
  const miscExpenseLimit = (budgetData?.plan_rpt_income ?? 0) * ((budgetData?.plan_miscExpense_limit ?? 0) / 100)
  const nonOfficeLimit = (budgetData?.plan_tax_allotment ?? 0) * ((budgetData?.plan_localDev_limit ?? 0) / 100)
  const skfundLimit = availableResources * ((budgetData?.plan_skFund_limit ?? 0) / 100)
  const calamityfundLimit = availableResources * ((budgetData?.plan_calamityFund_limit ?? 0) / 100)

  const showResourcesBreakdown = () => {
    Alert.alert(
      "NET Available Resources Breakdown",
      `Balance: ${formatNumber(budgetData?.plan_balance ?? 0)}\n` +
        `Tax Share: ${formatNumber(budgetData?.plan_tax_share ?? 0)}\n` +
        `Tax Allotment: ${formatNumber(budgetData?.plan_tax_allotment ?? 0)}\n` +
        `Cert Fees: ${formatNumber(budgetData?.plan_cert_fees ?? 0)}\n` +
        `Other Income: ${formatNumber(budgetData?.plan_other_income ?? 0)}\n\n` +
        `Total: ${formatNumber(availableResources)}`,
    )
  }

  const renderBudgetCard = (title: string, value: number, subtitle?: string, isNegative?: boolean) => (
    <Card className="mb-3 bg-white border-gray-200">
      <CardContent className="p-4">
        <View className="space-y-2">
          <Text className="text-sm font-medium text-gray-600">{title}</Text>
          {subtitle && <Text className="text-xs text-gray-500">{subtitle}</Text>}
          <Text className={`text-lg font-bold ${isNegative ? "text-red-600" : "text-gray-900"}`}>
            {formatNumber(value)}
          </Text>
        </View>
      </CardContent>
    </Card>
  )

  const renderCategorySection = (
    title: string,
    items: BudgetPlanDetail[],
    total: number,
    limit?: number,
    percentage?: number,
    isMiscExpense?: boolean,
    isSKFund?: boolean,
    isCalamityFund?: boolean,
  ) => {
    const calculatedLimit = isMiscExpense
      ? miscExpenseLimit
      : isSKFund
        ? skfundLimit
        : isCalamityFund
          ? calamityfundLimit
          : limit || 0
    const calculatedBalance = calculatedLimit - total

    return (
      <Card className="mb-4 bg-white border-gray-200">
        <CardHeader className="pb-3">
          <Text className="text-lg font-bold text-primaryBlue">
            {title} {percentage !== undefined && `(${percentage}%)`}
          </Text>
        </CardHeader>
        <CardContent className="pt-0">
          <View className="space-y-3">
            {items.map((item, index) => {
              const itemTitle =
                item.dtl_budget_item === "Extraordinary & Miscellaneous Expense" && isMiscExpense
                  ? `${item.dtl_budget_item} (${budgetData?.plan_miscExpense_limit}%)`
                  : item.dtl_budget_item === "Subsidy to Sangguniang Kabataan (SK) Fund" && isSKFund
                    ? `${item.dtl_budget_item} (${budgetData?.plan_skFund_limit}%)`
                    : item.dtl_budget_item

              const indentedItems = [
                "GAD Program",
                "Senior Citizen/ PWD Program",
                "BCPC (Juvenile Justice System)",
                "BADAC Program",
                "Nutrition Program",
                "Combating AIDS Program",
                "Barangay Assembly Expenses",
                "Disaster Response Program",
              ]
              const isIndented = indentedItems.includes(item.dtl_budget_item)

              return (
                <View key={index} className={`${isIndented ? "ml-4 pl-3 border-l-2 border-gray-200" : ""}`}>
                  <View className="flex-row justify-between items-start py-2">
                    <View className="flex-1 pr-4">
                      <Text className="text-sm text-gray-700 leading-5" numberOfLines={0}>
                        {itemTitle}
                      </Text>
                    </View>
                    <View className="min-w-[120px] items-end">
                      <Text
                        className="text-sm font-semibold text-gray-900 text-right"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {formatNumber(item.dtl_proposed_budget)}
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })}

            {/* Total Section */}
            <View className="border-t border-gray-200 pt-3 mt-3">
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-base font-bold text-gray-900">Total:</Text>
                <Text className="text-base font-bold text-gray-900 min-w-[120px] text-right">
                  {formatNumber(total)}
                </Text>
              </View>
            </View>

            {/* Limit and Balance Section */}
            {(limit !== undefined || isMiscExpense || isSKFund || isCalamityFund) && (
              <View className="bg-white border border-gray-200 p-3 rounded-lg space-y-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm font-medium text-gray-600">Limit:</Text>
                  <Text className="text-sm font-semibold text-gray-900 min-w-[120px] text-right">
                    {formatNumber(calculatedLimit)}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm font-medium text-gray-600">Balance:</Text>
                  <Text
                    className={`text-sm font-bold min-w-[120px] text-right ${calculatedBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatNumber(calculatedBalance)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </CardContent>
      </Card>
    )
  }

  const personalServiceItems = budgetData?.details?.filter((d) => d.dtl_budget_category === "Personal Service") || []
  const otherExpenseItems = budgetData?.details?.filter((d) => d.dtl_budget_category === "Other Expense") || []
  const capitalOutlayItems = budgetData?.details?.filter((d) => d.dtl_budget_category === "Capital Outlays") || []
  const nonOfficeItems = budgetData?.details?.filter((d) => d.dtl_budget_category === "Non-Office") || []
  const calamityFundItems = budgetData?.details?.filter((d) => d.dtl_budget_category === "LDRRM Fund") || []

  const hasMiscExpense = otherExpenseItems.some(
    (item) => item.dtl_budget_item === "Extraordinary & Miscellaneous Expense",
  )
  const hasSKFund = otherExpenseItems.some(
    (item) => item.dtl_budget_item === "Subsidy to Sangguniang Kabataan (SK) Fund",
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 ">
        {/* Summary Cards */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Budget Summary</Text>

          {/* NET Available Resources Card */}
          <Card className="mb-4 bg-white border-gray-200">
            <CardContent className="p-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">NET Available Resources</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-lg font-bold text-gray-900 mr-2 min-w-[140px] text-right">
                    {formatNumber(availableResources)}
                  </Text>
                  <TouchableOpacity onPress={showResourcesBreakdown}>
                    <Info size={20} color="#374151" />
                  </TouchableOpacity>
                </View>
              </View>
            </CardContent>
          </Card>

          {renderBudgetCard("Total Budgetary Obligation", budgetData?.plan_budgetaryObligations ?? 0, undefined, true)}
          {renderBudgetCard("Balance Unappropriated", budgetData?.plan_balUnappropriated ?? 0)}
          {renderBudgetCard("Actual Income", budgetData?.plan_actual_income ?? 0)}
          {renderBudgetCard("Actual RPT Income", budgetData?.plan_rpt_income ?? 0)}
        </View>

        {/* Budget Categories */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Current Operating Expenditures</Text>

          {personalServiceItems.length > 0 &&
            renderCategorySection(
              "Personal Services",
              personalServiceItems,
              personalServiceTotal,
              personalServiceLimit,
              budgetData?.plan_personalService_limit,
            )}

          {/* Maintenance & Other Operating Expenses */}
          {otherExpenseItems.length > 0 &&
            (() => {
              const miscItem = otherExpenseItems.find(
                (item) => item.dtl_budget_item === "Extraordinary & Miscellaneous Expense",
              )
              const miscTotal = miscItem?.dtl_proposed_budget ?? 0
              const miscLimit = miscExpenseLimit
              const miscBalance = miscLimit - miscTotal

              return (
                <Card className="mb-4 bg-white border-gray-200">
                  <CardHeader className="pb-3">
                    <Text className="text-lg font-bold text-primaryBlue">Maintenance & Other Operating Expenses</Text>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <View className="space-y-3">
                      {otherExpenseItems.map((item, index) => (
                        <View key={index}>
                          <View className="flex-row justify-between items-start py-2">
                            <View className="flex-1 pr-4">
                              <Text className="text-sm text-gray-700 leading-5" numberOfLines={0}>
                                {item.dtl_budget_item}
                              </Text>
                            </View>
                            <View className="min-w-[120px] items-end">
                              <Text
                                className="text-sm font-semibold text-gray-900 text-right"
                                numberOfLines={1}
                                adjustsFontSizeToFit
                              >
                                {formatNumber(item.dtl_proposed_budget)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}

                      {/* Total Section */}
                      <View className="border-t border-gray-200 pt-3 mt-3">
                        <View className="flex-row justify-between items-center py-2">
                          <Text className="text-base font-bold text-gray-900">Total:</Text>
                          <Text className="text-base font-bold text-gray-900 min-w-[120px] text-right">
                            {formatNumber(otherExpenseTotal)}
                          </Text>
                        </View>
                      </View>

                      {miscItem && (
                        <View className="bg-white border border-gray-200 p-4 rounded-lg mt-4">
                          <View className="space-y-4">
                            <View>
                              <View className="flex-row justify-between items-start mb-1">
                                <View className="flex-1 pr-3">
                                  <Text className="text-sm font-medium text-gray-700">
                                    Extraordinary Expense Limit ({budgetData.plan_miscExpense_limit}%):
                                  </Text>
                                </View>
                                <Text className="text-sm font-semibold text-gray-900 min-w-[120px] text-right">
                                  {formatNumber(miscLimit)}
                                </Text>
                              </View>
                            </View>

                            <View>
                              <View className="flex-row justify-between items-center">
                                <Text className="text-sm font-medium text-gray-700">Used:</Text>
                                <Text className="text-sm font-semibold text-gray-900 min-w-[120px] text-right">
                                  {formatNumber(miscTotal)}
                                </Text>
                              </View>
                            </View>

                            <View className="border-t border-gray-200 pt-3">
                              <View className="flex-row justify-between items-center">
                                <Text className="text-base font-semibold text-gray-700">Remaining Balance:</Text>
                                <Text
                                  className={`text-base font-bold min-w-[120px] text-right ${miscBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {formatNumber(miscBalance)}
                                </Text>
                              </View>
                            </View>

                            <View className="mt-3 pt-2 border-t border-gray-200">
                              <Text className="text-xs text-gray-600 italic leading-4">
                                * Limit applies only to "Extraordinary & Miscellaneous Expense".
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  </CardContent>
                </Card>
              )
            })()}

          <Text className="text-xl font-bold text-gray-900 mb-4 mt-6">Capital Outlays</Text>
          {capitalOutlayItems.length > 0 &&
            renderCategorySection("Capital Outlays", capitalOutlayItems, capitalOutlaysTotal)}

          <Text className="text-xl font-bold text-gray-900 mb-4 mt-6">Non-Office</Text>
          {nonOfficeItems.length > 0 &&
            renderCategorySection(
              "Local Development Fund",
              nonOfficeItems,
              nonOfficeTotal,
              nonOfficeLimit,
              budgetData?.plan_localDev_limit,
            )}

          {calamityFundItems.length > 0 &&
            renderCategorySection(
              "LDRRM Fund / Calamity Fund",
              calamityFundItems,
              calamityFundTotal,
              undefined,
              budgetData?.plan_calamityFund_limit,
              false,
              false,
              true,
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
