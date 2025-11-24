import {
  FlatList,
  TouchableOpacity,
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRouter } from "expo-router";
import React from "react";
import { useGetWeeklyAR } from "../queries/reportFetch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  formatDate,
  getAllWeeksInMonth,
  getDateTimeFormat,
  getMonthName,
  getMonths,
  getWeekNumber,
  hasWeekPassed,
} from "@/helpers/dateHelpers";
import { Calendar } from "@/lib/icons/Calendar";
import { FileText } from "@/lib/icons/FileText";
import { Paperclip } from "@/lib/icons/PaperClip";
import { Badge } from "@/components/ui/badge";
import { SelectLayout } from "@/components/ui/select-layout";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { capitalize } from "@/helpers/capitalize";

export default function WeeklyAcknowledgementReports() {
  // ============ STATE INITIALIZATION ============
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [isInitialRender, setIsInitialRender] = React.useState<boolean>(true);

  const { data: weeklyAR, isLoading, refetch, isFetching } = useGetWeeklyAR();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);

  const months = getMonths;

  // ============ SIDE EFFECTS ============
  React.useEffect(() => {
    if (!isFetching && isRefreshing) setIsRefreshing(false);
  }, [isFetching, isRefreshing]);

  React.useEffect(() => {
    if (!isLoading && isInitialRender) setIsInitialRender(false);
  }, [isLoading, isInitialRender]);

  // ============ HANDLERS ============
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // ============ DATA PROCESSING ============
  const getYearOptions = () => {
    if (!weeklyAR || weeklyAR.length === 0) {
      return [currentYear];
    }

    const earliestDate = weeklyAR.reduce((earliest: any, war: any) => {
      const warDate = new Date(war.created_for);
      return warDate < earliest ? warDate : earliest;
    }, new Date(weeklyAR[0].created_for));

    const earliestYear = earliestDate.getFullYear();
    const yearRange = currentYear - earliestYear + 1;
    return Array.from(
      { length: yearRange },
      (_, i) => earliestYear + i
    ).reverse();
  };

  const yearOptions = getYearOptions();
  const formattedYearOpts = yearOptions?.map((year) => ({
    label: year.toString(),
    value: year.toString(),
  }));

  const filteredWeeklyAR =
    weeklyAR?.filter((war: any) => {
      const warYear = new Date(war.created_for).getFullYear();
      return warYear === selectedYear;
    }) || [];

  const organizedData = months
    .map((month) => {
      const monthData =
        filteredWeeklyAR?.filter(
          (war: any) => month === getMonthName(war.created_for)
        ) || [];

      const weekGroups = monthData.reduce((acc: any, war: any) => {
        const weekNo = getWeekNumber(war.created_for);
        if (!acc[weekNo]) {
          acc[weekNo] = [];
        }
        acc[weekNo].push(war);
        return acc;
      }, {});

      const allWeeksInMonth = getAllWeeksInMonth(month, selectedYear);
      const existingWeeks = Object.keys(weekGroups).map(Number);
      const missingWeeks = allWeeksInMonth.filter(
        (week) => !existingWeeks.includes(week)
      );

      const missedWeeksPassed = missingWeeks.filter((weekNo) =>
        hasWeekPassed(month, weekNo, selectedYear)
      );

      return {
        month,
        weeks: Object.entries(weekGroups)
          .map(([weekNo, ars]) => ({
            weekNo: Number.parseInt(weekNo),
            data: ars as any[],
          }))
          .sort((a, b) => a.weekNo - b.weekNo),
        missingWeeks: missingWeeks.sort((a, b) => a - b),
        missedWeeksPassed: missedWeeksPassed.length,
        hasData: monthData.length > 0,
      };
    })
    .filter(
      (monthData) => monthData.hasData || monthData.missingWeeks.length > 0
    );

  const totalReports = filteredWeeklyAR.length;

  // ============ RENDER HELPERS ============
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "signed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const WARCard = ({ item, weekNo }: { item: any; weekNo: number }) => {
    return (
      <TouchableOpacity className="flex-row justify-between rounded-lg p-4 mb-3 border border-gray-200">
        <View className="flex-row justify-between items-start">
          <View className="">
            <Text className="text-gray-700 font-semibold text-base">
              Week {weekNo}
            </Text>
            <Text className="text-muted-foreground text-xs mb-3">
              {formatDate(item.created_at, "long")}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {item.war_composition?.map((comp:any, index: number) => (
                <Text key={index} className="text-primaryBlue text-xs">AR-{comp.ar.id}</Text>
              ))}
            </View>
          </View>
        </View>
        <View>
          <Badge className={`${getStatusColor(item.status)}`}>
              <Text
                className={`text-xs font-medium ${
                  item.status === "Signed"
                    ? "text-green-700"
                    : "text-yellow-700"
                }`}
              >
                {capitalize(item.status)}
              </Text>
            </Badge>
        </View>
      </TouchableOpacity>
    );
  };

  const NoReportsForMonth = ({ month }: { month: string }) => (
    <View className="flex-1 justify-center items-center py-8">
      <FileText size={32} className="text-gray-300 mb-3" />
      <Text className="text-gray-400 text-sm text-center px-4">
        There are no weekly reports available for {month}.
      </Text>
    </View>
  );

  const MonthAccordionItem = React.memo(
    ({ item }: { item: Record<string, any> }) => {
      const { month, weeks } = item;

      return (
        <AccordionItem value={month} className="border-0">
          <AccordionTrigger className="">
            <View className="flex-row justify-between items-center flex-1">
              <Text className="text-gray-700 font-semibold text-sm">
                {month} {selectedYear}
              </Text>
              <View className="bg-blue-100 px-2 py-1 rounded-full mr-4">
                <Text className="text-blue-800 text-xs font-medium">
                  {weeks.length} {weeks.length === 1 ? "Week" : "Weeks"}
                </Text>
              </View>
            </View>
          </AccordionTrigger>
          <AccordionContent className="px-5">
            {weeks.length > 0 ? (
              weeks.map(({ weekNo, data }: any) => (
                <WARCard key={weekNo} item={data[0]} weekNo={weekNo} />
              ))
            ) : (
              <NoReportsForMonth month={month} />
            )}
          </AccordionContent>
        </AccordionItem>
      );
    }
  );

  const renderItem = React.useCallback(
    ({ item }: { item: Record<string, any> }) => (
      <MonthAccordionItem item={item} />
    ),
    [selectedYear]
  );

  if (isLoading && isInitialRender) {
    return <LoadingState />;
  }

  // ============ MAIN RENDER ============
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
      headerTitle={<Text className="text-gray-900 text-[13px]">Weekly</Text>}
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
    >
      <View className="flex-1 px-6">
        <View className="py-2">
          <SelectLayout
            selectedValue={selectedYear.toString()}
            onSelect={(value) => setSelectedYear(Number.parseInt(value.value))}
            options={formattedYearOpts}
          />
        </View>

        {!isRefreshing && (
          <Text className="text-xs text-gray-500 mt-2 mb-3">{`Showing ${totalReports} weekly ${
            totalReports === 1 ? "report" : "reports"
          }`}</Text>
        )}
        {isFetching && isRefreshing && <LoadingState />}

        {!isRefreshing && (
          <Accordion type="single" className="flex-1">
            <FlatList
              maxToRenderPerBatch={10}
              overScrollMode="never"
              initialNumToRender={10}
              contentContainerStyle={{
                paddingTop: 0,
                paddingBottom: 20,
              }}
              windowSize={21}
              removeClippedSubviews
              data={organizedData}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item) => item.month}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={["#00a8f0"]}
                />
              }
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center py-16">
                  <FileText size={48} className="text-gray-300 mb-4" />
                  <Text className="text-gray-500 text-lg font-medium mb-2">
                    No Reports Found
                  </Text>
                  <Text className="text-gray-400 text-sm text-center px-8">
                    There are no weekly acknowledgement reports available for{" "}
                    {selectedYear}.
                  </Text>
                </View>
              }
            />
          </Accordion>
        )}
      </View>
    </PageLayout>
  );
}