import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Search, ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select-layout";
import { useGetAllProposalLogs } from "./queries/fetchqueries";
import PageLayout from "@/screens/_PageLayout";

const ProjectProposalLogTable = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize] = useState(5); // Fixed page size for mobile
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const { data: logs = [], error, refetch } = useGetAllProposalLogs();

  const statusOptions = [
    { label: "All Status", value: "all" },
    { label: "Pending", value: "Pending" },
    { label: "Amend", value: "Amend" },
    { label: "Resubmitted", value: "Resubmitted" },
    { label: "Approved", value: "Approved" },
    { label: "Rejected", value: "Rejected" },
    { label: "Viewed", value: "Viewed" },
  ];

  const sortedData = useMemo(() => {
    return [...logs].sort((a, b) => {
      if (!a.gprl_date_approved_rejected) return 1;
      if (!b.gprl_date_approved_rejected) return -1;
      return (
        new Date(b.gprl_date_approved_rejected).getTime() -
        new Date(a.gprl_date_approved_rejected).getTime()
      );
    });
  }, [logs]);

  const filteredData = sortedData.filter((log) => {
    const searchString = `${log.gprl_id} ${log.gpr_title} ${log.gprl_status} ${log.gprl_date_submitted}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.gprl_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-green-500";
      case "Rejected":
        return "text-red-500";
      case "Pending":
        return "text-blue-800";
      case "Viewed":
        return "text-darkGray";
      case "Amend":
        return "text-yellow-500";
      case "Resubmitted":
        return "text-indigo-600";
      default:
        return "text-gray-500";
    }
  };

  if (error) {
    return (
      <PageLayout>
        <View className="p-4">
          <Text className="text-red-500 text-center">
            Error loading proposal logs
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-primaryBlue p-3 rounded-lg mt-4 items-center"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" />
        </TouchableOpacity>
      }
      headerTitle={<Text>Project Proposal Logs</Text>}
      rightAction={<View />}
    >
      <View className="p-4">
        <View className="flex-row gap-2 mb-4">
          <View className="relative flex-1">
            <Input
              placeholder="Search..."
              className="flex-row items-center justify-between px-3 py-3 border rounded-md bg-white min-h-[45px]"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <SelectLayout
            className="w-32"
            options={statusOptions}
            selectedValue={statusFilter}
            onSelect={(option) => {
              setStatusFilter(option.value);
              setCurrentPage(1);
            }}
            placeholder="Filter"
          />
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {paginatedData.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-gray-500">Loading logs...</Text>
            </View>
          ) : (
            paginatedData.map((log) => (
              <View
                key={log.gprl_id}
                className="bg-white rounded-lg p-4 mb-3 border border-gray-200"
              >
                <View className="flex-row justify-between mb-2">
                  <Text className="font-semibold text-gray-900">
                    {log.gpr_title || "Untitled Proposal"}
                  </Text>
                  <Text className={`${getStatusColor(log.gprl_status)}`}>
                    {log.gprl_status}
                  </Text>
                </View>

                <View className="mb-2">
                  <Text className="text-sm text-gray-600">
                    Actioned:{" "}
                    {log.gprl_date_approved_rejected
                      ? new Date(log.gprl_date_approved_rejected).toLocaleDateString()
                      : "-"}
                  </Text>
                </View>

                <View className="mb-2">
                  <Text className="text-sm text-gray-600">
                    Staff: {log.staff_details?.full_name || "Unassigned"}
                  </Text>
                  {log.staff_details?.position && (
                    <Text className="text-xs text-gray-500">
                      {log.staff_details.position}
                    </Text>
                  )}
                </View>

                 <View className="mb-2">
                  <Text className="text-sm text-blue-500">
                    Remark(s): {log.gprl_reason || "No reason/remarks provided"}
                  </Text>
                </View>

              </View>
            ))
          )}

          {/* Pagination Controls */}
          {filteredData.length > pageSize && (
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
                disabled={currentPage === totalPages}
                className={`p-2 ${
                  currentPage === totalPages ? "opacity-50" : ""
                }`}
              >
                <Text className="text-primaryBlue font-bold">Next →</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </PageLayout>
  );
};

export default ProjectProposalLogTable;