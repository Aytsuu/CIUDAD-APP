import { ScrollView, TouchableOpacity, Text, View, Image } from "react-native";
import PageLayout from "../_PageLayout";
import React from "react";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { DEFAULT_REGION } from "./configs";
import { DrawerView } from "@/components/ui/drawer";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  useConvertCoordinatesToAddress,
  useGetIncidentReport,
} from "../report/queries/reportFetch";
import { capitalize } from "@/helpers/capitalize";
import { CustomMarker } from "./marker";
import { formatTimeAgo } from "@/helpers/dateHelpers";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { Phone } from "@/lib/icons/Phone";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default () => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(15);
  const [region, setRegion] = React.useState<Region | null>(DEFAULT_REGION);
  const [deviceRegion, setDeviceRegion] = React.useState<any>(null);
  const [userRegion, setUserRegion] = React.useState<any>(null);
  const [report, setReport] = React.useState<any>(null);
  const mapRef = React.useRef<MapView>(null);
  const sheetRef = React.useRef<BottomSheet>(null);

  const {
    data: incidentReportData,
    isLoading,
    refetch,
    isFetching,
  } = useGetIncidentReport(currentPage, pageSize, search, false, true);

  const { data: deviceLocation, isLoading: isLoadingDevLoc } =
    useConvertCoordinatesToAddress(
      deviceRegion?.latitude,
      deviceRegion?.longitude
    );
  const { data: userLocation, isLoading: isLoadingUserLoc } =
    useConvertCoordinatesToAddress(userRegion?.latitude, userRegion?.longitude);

  console.log(deviceLocation);

  const reports = incidentReportData?.results || [];
  const totalCount = incidentReportData?.count || 0;
  const hasNext = incidentReportData?.next;

  const goToDevice = (report: Record<string, any>) => {
    const deviceRegion = {
      latitude: report.ir_track_lat,
      longitude: report.ir_track_lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    const userRegion = {
      latitude: report.ir_track_user_lat,
      longitude: report.ir_track_user_lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setDeviceRegion(deviceRegion);
    setUserRegion(userRegion);
    setReport(report);
    mapRef.current?.animateToRegion(deviceRegion, 500);
    sheetRef.current?.snapToIndex(1);
  };

  const handleDeselect = () => {
    setReport(null);
    setDeviceRegion(null);
    setUserRegion(null);
    setRegion(DEFAULT_REGION);
    mapRef.current?.animateToRegion(DEFAULT_REGION, 500);
    sheetRef.current?.snapToIndex(0);
  };

  return (
    <>
      <PageLayout showHeader={false} wrapScroll={false}>
        <MapView
          ref={mapRef}
          initialRegion={DEFAULT_REGION}
          region={region ?? undefined}
          style={{ flex: 1 }}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {deviceRegion && (
            <CustomMarker
              lat={deviceRegion?.latitude as number}
              lng={deviceRegion?.longitude as number}
              iconUri={require("@/assets/images/report/tracker_icon.png")}
              circleColor="255, 100, 100"
            />
          )}

          {userRegion && (
            <CustomMarker
              lat={userRegion?.latitude as number}
              lng={userRegion?.longitude as number}
              iconUri={require("@/assets/images/report/user_icon.png")}
              circleColor="59, 130, 246"
            />
          )}
        </MapView>

        {/* Floating Back Button */}
        <View 
          style={{
            position: 'absolute',
            top: insets.top + 16,
            left: 16,
            zIndex: 999,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-lg"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 4,
            }}
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        </View>
      </PageLayout>

      <DrawerView
        bottomSheetRef={sheetRef}
        index={0}
        removeBackdrop={true}
        enablePanDownToClose={false}
        title={"Reports"}
        description={"View all reports"}
        snapPoints={["10%", "75%"]}
        customHeader
      >
        <View className="flex-1">
          {report ? (
            <>
              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center gap-2 flex-shrink">
                  <TouchableOpacity onPress={handleDeselect}>
                    <ChevronLeft size={24} className="text-gray-700" />
                  </TouchableOpacity>
                  <Text
                    className="text-lg text-gray-700 font-medium"
                    numberOfLines={1}
                  >
                    Viewing Report
                  </Text>
                </View>
                <Text className="text-sm text-muted-foreground flex-shrink-0">
                  {formatTimeAgo(report.ir_created_at)}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View className="mb-6">
                <Text className="text-lg text-gray-700 font-medium">
                  Securado Reports
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Drag to view or hide all tracker reports
                </Text>
              </View>
            </>
          )}

          <BottomSheetScrollView
            contentContainerStyle={{
              paddingBottom: 10,
              gap: 10,
            }}
            showsVerticalScrollIndicator={false}
          >
            {report ? (
              <>
                <View className="mb-4">
                  <Text
                    className="text-xl text-primaryBlue font-medium"
                    numberOfLines={2}
                  >
                    {report?.ir_track_user_name}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Phone size={14} className="text-gray-600" />
                    <Text className="text-sm text-gray-600" numberOfLines={1}>
                      {report?.ir_track_user_contact}
                    </Text>
                  </View>
                  <View className="flex-1 mt-4">
                    <Text className="text-sm text-gray-400 flex-shrink-0">
                      description:
                    </Text>
                    <Text className="text-sm flex-1 flex-wrap">
                      {report?.ir_add_details}
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-3 p-4 rounded-lg bg-blue-50 mb-2">
                  <Image
                    source={require("@/assets/images/report/tracker_icon.png")}
                    style={{
                      width: 26,
                      height: 32,
                    }}
                  />

                  <View className="flex-1 gap-1 flex-shrink">
                    <Text className="text-primaryBlue font-medium text-base">
                      Device Location
                    </Text>
                    <Text className="text-sm text-gray-800 flex-wrap">
                      {deviceLocation?.display_name || "Loading..."}
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-3 p-4 rounded-lg bg-blue-50">
                  <Image
                    source={require("@/assets/images/report/user_icon.png")}
                    style={{
                      width: 26,
                      height: 32,
                    }}
                  />

                  <View className="flex-1 gap-1 flex-shrink">
                    <Text className="text-primaryBlue font-medium text-base">
                      User Location
                    </Text>
                    <Text className="text-sm text-gray-800 flex-wrap">
                      {userLocation?.display_name || "Loading..."}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              reports?.map((report: any, index: number) => (
                <TouchableOpacity
                  key={report.id || index}
                  activeOpacity={0.7}
                  onPress={() => goToDevice(report)}
                  className="flex-1"
                >
                  <Text className="text-md text-red-500" numberOfLines={2}>
                    Report of {capitalize(report.ir_track_user_name)}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </BottomSheetScrollView>
        </View>
      </DrawerView>
    </>
  );
};