import PageLayout from "@/screens/_PageLayout";
import { useRouter } from "expo-router";
import { TouchableOpacity, View, Text, ActivityIndicator, ScrollView,
} from "react-native";
import { useGetWeeklyAR } from "../queries/reportFetch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { getAllWeeksInMonth,  getDateTimeFormat,  getMonthName, getMonths, getWeekNumber, hasWeekPassed } from "@/helpers/dateHelpers";
import React from "react";
import { Calendar } from "@/lib/icons/Calendar";
import { FileText } from "@/lib/icons/FileText";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { Search } from "@/lib/icons/Search";
import { Paperclip } from "@/lib/icons/PaperClip";
import { Badge } from "@/components/ui/badge";
import { SelectLayout } from "@/components/ui/select-layout";

export default () => {
  const router = useRouter();
  const { data: weeklyAR, isLoading, error } = useGetWeeklyAR();

  // Year selection state
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);

  const getYearOptions = () => {
    if (!weeklyAR || weeklyAR.length === 0) {
      // If no data, only show current year
      return [currentYear];
    }

    // Find the earliest year in the data
    const earliestDate = weeklyAR.reduce((earliest: any, war: any) => {
      const warDate = new Date(war.created_for);
      return warDate < earliest ? warDate : earliest;
    }, new Date(weeklyAR[0].created_for));

    const earliestYear = earliestDate.getFullYear();

    // Generate array from earliest year to current year
    const yearRange = currentYear - earliestYear + 1;
    return Array.from(
      { length: yearRange },
      (_, i) => earliestYear + i
    ).reverse();
  };

  const yearOptions = getYearOptions();
  const formattedYearOpts = yearOptions?.map((year) => ({
    label: year.toString(),
    value: year.toString()
  }))

  const months = getMonths;

  // Filter data by selected year
  const filteredWeeklyAR =
    weeklyAR?.filter((war: any) => {
      const warYear = new Date(war.created_for).getFullYear();
      return warYear === selectedYear;
    }) || [];

  // Group data by month and week for better organization
  const organizedData = months
    .map((month) => {
      const monthData =
        filteredWeeklyAR?.filter(
          (war: any) => month === getMonthName(war.created_for)
        ) || [];

      // Group by week within the month
      const weekGroups = monthData.reduce((acc: any, war: any) => {
        const weekNo = getWeekNumber(war.created_for);
        if (!acc[weekNo]) {
          acc[weekNo] = [];
        }
        acc[weekNo].push(war);
        return acc;
      }, {});

      // Get all possible weeks for this month
      const allWeeksInMonth = getAllWeeksInMonth(month, selectedYear);
      const existingWeeks = Object.keys(weekGroups).map(Number);
      const missingWeeks = allWeeksInMonth.filter(
        (week) => !existingWeeks.includes(week)
      );

      // Calculate missed weeks (only those that have passed)
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
      <TouchableOpacity className="bg-white rounded-lg p-4 mb-3 border border-gray-100">
        <View className="flex-row justify-between items-start mb-3">
          <View className="">
            <Text className="text-gray-900 font-semibold text-base mb-1">
              Week {weekNo}
            </Text>
            <Badge className={`${getStatusColor(item.status)}`}>
              <Text
                className={`text-xs font-medium ${
                  item.status === "Signed"
                    ? "text-green-700"
                    : "text-yellow-700"
                }`}
              >
                {item.status}
              </Text>
            </Badge>
          </View>
          <View className="items-end">
            <Text className="text-gray-500 text-xs">Created</Text>
            <Text className="text-gray-900 text-sm font-medium">
              {getDateTimeFormat(item.created_at)}
            </Text>
          </View>
        </View>

        <View className="border-t border-gray-100 pt-3">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center">
              <Calendar size={16} className="text-gray-400 mr-2" />
              <Text className="text-gray-600 text-sm">
                For: {getDateTimeFormat(item.created_for)}
              </Text>
            </View>
            {item.war_files && item.war_files.length > 0 && (
              <View className="flex-row items-center">
                <Paperclip size={14} className="text-gray-400 mr-1" />
                <Text className="text-gray-500 text-xs">
                  {item.war_files.length} file
                  {item.war_files.length !== 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>
          {item.war_composition && item.war_composition.length > 0 && (
            <View className="flex-row items-center">
              <FileText size={16} className="text-gray-400 mr-2" />
              <Text className="text-gray-500 text-sm">
                {item.war_composition.length} Acknowledgment Report
                {item.war_composition.length !== 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View className="flex-1 justify-center items-center py-16">
      <FileText size={48} className="text-gray-300 mb-4" />
      <Text className="text-gray-500 text-lg font-medium mb-2">
        No Reports Found
      </Text>
      <Text className="text-gray-400 text-sm text-center px-8">
        There are no weekly acknowledgement reports available at the moment.
      </Text>
    </View>
  );

  const LoadingState = () => (
    <View className="flex-1 justify-center items-center py-16">
      <ActivityIndicator size="large" className="text-blue-600 mb-4" />
      <Text className="text-gray-500 text-base">Loading reports...</Text>
    </View>
  );

  if (error) {
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
        headerTitle={
          <Text className="text-gray-900 text-[13px]">
            Acknowledgement Reports
          </Text>
        }
      >
        <View className="flex-1 justify-center items-center py-16">
          <Text className="text-red-500 text-lg font-medium mb-2">
            Error Loading Reports
          </Text>
          <Text className="text-gray-500 text-sm text-center px-8">
            Unable to load weekly acknowledgement reports. Please try again.
          </Text>
        </View>
      </PageLayout>
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
      headerTitle={
        <View className="flex justify-center items-center">
          <Text className="text-gray-900 text-[13px]">Weekly</Text>
          <Text className="text-gray-900 text-[13px]">
            Accomplishment Reports
          </Text>
        </View>
      }
      rightAction={<View className="w-10 h-10"/>}
    >
      <View className="flex-1 bg-white">
        <View className="flex-1">
          {isLoading ? (
            <LoadingState />
          ) : !weeklyAR || weeklyAR.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <View className="px-5">
                <SelectLayout 
                  selectedValue={selectedYear.toString()}
                  onSelect={(value) => setSelectedYear(Number.parseInt(value.value))}
                  options={formattedYearOpts}
                />
              </View>
              <ScrollView
                className="flex-grow"
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
              >
                <Accordion type="single" className="px-5 pt-4">
                  {organizedData.map(({ month, weeks }) => (
                    <AccordionItem key={month} value={month} className="border-0">
                      <AccordionTrigger className="px-2">
                        <View className="flex-row justify-between items-center flex-1">
                          <Text className="text-gray-900 font-semibold text-sm">
                            {month} {selectedYear}
                          </Text>
                          <View className="bg-blue-100 px-2 py-1 rounded-full mr-4">
                            <Text className="text-blue-800 text-xs font-medium">
                              {weeks.length}{" "}
                              {weeks.length === 1 ? "Week" : "Weeks"}
                            </Text>
                          </View>
                        </View>
                      </AccordionTrigger>
                      <AccordionContent className="p-4">
                        {weeks.map(({ weekNo, data }) => (
                          <WARCard key={weekNo} item={data[0]} weekNo={weekNo} />
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </PageLayout>
  );
};
