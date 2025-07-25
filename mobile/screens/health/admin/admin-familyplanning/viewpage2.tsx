import React from "react";
import { View, Text, Button } from "react-native";
import { useParams, useNavigate } from "react-router-dom"; // Use useParams and useNavigate
import { useQuery } from "@tanstack/react-query";
import { getFPCompleteRecord } from "./GetRequest"; // Adjust path
export default function FpRecordViewPage2() {
  const { fprecordId } = useParams<{ fprecordId: string }>();
  const navigate = useNavigate();
  const { data: recordData, isLoading, isError, error } = useQuery({
    queryKey: ["fpCompleteRecordView", fprecordId],
    queryFn: () => getFPCompleteRecord(Number(fprecordId)),
    enabled: !!fprecordId,
  });
  if (isLoading) {
    return <Text>Loading record details...</Text>;
  }
  if (isError) {
    return <Text>Error loading record: {error?.message}</Text>;
  }
  if (!recordData) {
    return <Text>No record found for ID: {fprecordId}</Text>;
  }
  return (
    <View className="p-4">
      <Text className="text-lg font-bold">Family Planning Record - Additional Details</Text>
      {/* Display additional fields from recordData */}
      <Text>Weight: {recordData.weight}</Text>
      <Text>Height: {recordData.height}</Text>
      <Text>Blood Pressure: {recordData.bloodPressure}</Text>
      {/* Add more fields as necessary */}
      <Button title="Back" onPress={() => navigate(-1)} />
    </View>
  );
}