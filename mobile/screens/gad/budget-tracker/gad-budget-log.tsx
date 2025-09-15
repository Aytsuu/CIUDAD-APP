import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Search, ChevronLeft } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PageLayout from "@/screens/_PageLayout";
import { useGADBudgetLogs } from "./queries/btracker-fetch";
import { BudgetLogTable } from "./gad-btracker-types";

const GADBudgetLogTable = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const year = params.budYear as string;
  if (!year) {
    return <Text className="text-red-500 text-center">Year is required</Text>;
  }

  const { data: logs = [], refetch } = useGADBudgetLogs(year);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [projectFilter, setProjectFilter] = useState("all");

  const projectOptions = useMemo(() => {
    const projects = Array.from(
      new Set(logs.map((log) => log.gbud_exp_project || "N/A"))
    )
      .filter((project) => project !== "N/A")
      .map((project) => ({ label: project, value: project }));
    return [{ label: "All", value: "all" }, ...projects];
  }, [logs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const sortedData = useMemo(() => {
    return [...logs].sort((a, b) => {
      return (
        new Date(b.gbudl_created_at).getTime() -
        new Date(a.gbudl_created_at).getTime()
      );
    });
  }, [logs]);

  const filteredData = sortedData.filter((log) => {
    const matchesYear =
      !year || new Date(log.gbudl_created_at).getFullYear().toString() === year;
    const searchString = `${log.gbudl_id} ${log.gbud_exp_project || ""} ${
      log.gbud_exp_particulars?.map((item) => item.name).join(" ") || ""
    }`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesProject =
      projectFilter === "all" || log.gbud_exp_project === projectFilter;
    return matchesSearch && matchesProject && matchesYear;
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const renderItem = ({ item }: { item: BudgetLogTable }) => (
    <Card className="mb-4 border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg text-[#2a3a61]">
          {item.gbudl_created_at
            ? new Date(item.gbudl_created_at).toLocaleString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "No date"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Project Name:</Text>
          <Text className="font-medium">{item.gbud_exp_project || "N/A"}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Particulars:</Text>
          <Text className="font-medium">
            {item.gbud_exp_particulars && item.gbud_exp_particulars.length > 0
              ? item.gbud_exp_particulars.map((item) => item.name).join(", ")
              : "-"}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Proposed Budget:</Text>
          <Text className="font-medium">
            {item.gbud_proposed_budget !== null
              ? `₱${item.gbud_proposed_budget.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}`
              : "-"}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Actual Expense:</Text>
          <Text className="font-medium">
            {item.gbudl_prev_amount !== null
              ? `₱${item.gbudl_prev_amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}`
              : "-"}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Return/Excess:</Text>
          <Text
            className={`font-medium ${
              item.gbudl_amount_returned && item.gbudl_prev_amount
                ? item.gbudl_amount_returned < 0
                  ? "text-red-500"
                  : "text-green-500"
                : ""
            }`}
          >
            {item.gbudl_amount_returned !== null && item.gbudl_prev_amount
              ? `${item.gbudl_amount_returned < 0 ? "-" : ""}₱${Math.abs(
                  item.gbudl_amount_returned
                ).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}`
              : "-"}
          </Text>
        </View>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#2a3a61" />
        </TouchableOpacity>
      }
      headerTitle={<Text>{year} Budget Logs</Text>}
      rightAction={<View />}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="p-2">
          <View className="mb-4 flex-row gap-2">
            <View className="relative flex-1">
              <Search
                className="absolute left-3 top-3 text-gray-500"
                size={17}
              />
              <Input
                placeholder="Search..."
                className="flex-row items-center justify-between px-6 py-3 min-h-[44px] border-b border-gray-300"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <SelectLayout
              options={projectOptions}
              selectedValue={projectFilter}
              onSelect={(option) => setProjectFilter(option.value)}
              placeholder="Project"
              className="flex-1 bg-white"
            />
          </View>

          <FlatList
            data={paginatedData}
            renderItem={renderItem}
            keyExtractor={(item) =>
              item.gbudl_id?.toString() || Math.random().toString()
            }
            scrollEnabled={false}
            ListEmptyComponent={
              <Text className="text-center text-gray-500 py-4">
                No budget logs found
              </Text>
            }
          />

          <View className="flex-row justify-between items-center mt-4 px-2">
            <TouchableOpacity
              onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 ${currentPage === 1 ? "opacity-50" : ""}`}
            >
              <Text className="text-primaryBlue font-bold">← Previous</Text>
            </TouchableOpacity>

            <Text className="text-gray-500">
              Page {currentPage} of {totalPages}
            </Text>

            <TouchableOpacity
              onPress={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={
                currentPage === totalPages || filteredData.length <= pageSize
              }
              className={`p-2 ${
                currentPage === totalPages ? "opacity-50" : ""
              }`}
            >
              <Text className="text-primaryBlue font-bold">Next →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </PageLayout>
  );
};

export default GADBudgetLogTable;
