import React, { useMemo, useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView 
} from "react-native";
import { ChevronLeft, ChevronRight, History, Baby } from "lucide-react-native";
import { useChildHealthHistory } from "../forms/queries/fetchQueries";
import { ChildHealthHistoryRecord } from "./types";
import { getSupplementStatusesFields } from "./config";
import { PatientSummarySection } from "./currenthistory";
import { router } from "expo-router";

interface Props {
  route: {
    params: {
      chrecId: string;
      chhistId: string;
    };
  };
  navigation: any;
}

// TT Status Section
const TTStatusSection = ({ records }: { records: ChildHealthHistoryRecord[] }) => {
  return (
    <View className="mb-6">
      <Text className="font-semibold text-lg mb-2">TT Status (Mother)</Text>
      <View className="border border-gray-200 rounded-lg p-4">
        {records.map((record, index) => (
          <View key={`tt-${index}`} className="mb-3 last:mb-0">
            <View className="flex-row justify-between">
              <Text className="font-medium">
                {new Date(record.created_at).toLocaleDateString()}
              </Text>
              <Text className="text-blue-600">{record.tt_status}</Text>
            </View>
            {index < records.length - 1 && <View className="h-px bg-gray-200 my-2" />}
          </View>
        ))}
      </View>
    </View>
  );
};

// Exclusive Breastfeeding Section
const ExclusiveBFSection = ({ records }: { records: ChildHealthHistoryRecord[] }) => {
  return (
    <View className="mb-6">
      <Text className="font-semibold text-lg mb-2">Exclusive Breastfeeding Checks</Text>
      <View className="border border-gray-200 rounded-lg p-4">
        {records.map((record, index) => (
          <View key={`ebf-${index}`} className="mb-3 last:mb-0">
            {record.exclusive_bf_checks.map((ebf, ebfIndex) => (
              <View key={`ebf-item-${ebfIndex}`}>
                <View className="flex-row justify-between">
                  <Text className="font-medium">
                    {new Date(record.created_at).toLocaleDateString()}
                  </Text>
                  <Text className="text-blue-600">{ebf.ebf_date}</Text>
                </View>
                {ebfIndex < record.exclusive_bf_checks.length - 1 && (
                  <View className="h-px bg-gray-200 my-2" />
                )}
              </View>
            ))}
            {index < records.length - 1 && <View className="h-px bg-gray-200 my-2" />}
          </View>
        ))}
      </View>
    </View>
  );
};

// Findings Section
const FindingsSection = ({ records }: { records: ChildHealthHistoryRecord[] }) => {
  return (
    <View className="mb-6">
      <Text className="font-semibold text-lg mb-2">Findings Details</Text>
      <View className="border border-gray-200 rounded-lg p-4">
        {records.map((record, index) => (
          <View key={`findings-${index}`} className="mb-3 last:mb-0">
            {record.child_health_vital_signs.map((vital, vitalIndex) => (
              vital.find_details && (
                <View key={`vital-${vitalIndex}`}>
                  <Text className="font-medium mb-1">
                    {new Date(record.created_at).toLocaleDateString()}
                  </Text>
                  <Text className="font-medium text-blue-600 mb-1">Assessment Summary:</Text>
                  <Text className="mb-2">{vital.find_details.assessment_summary || 'N/A'}</Text>
                  
                  <Text className="font-medium text-blue-600 mb-1">Objective Findings:</Text>
                  <Text className="mb-2">{vital.find_details.obj_summary || 'N/A'}</Text>
                  
                  <Text className="font-medium text-blue-600 mb-1">Subjective Findings:</Text>
                  <Text className="mb-2">{vital.find_details.subj_summary || 'N/A'}</Text>
                  
                  <Text className="font-medium text-blue-600 mb-1">Plan/Treatment:</Text>
                  <Text>{vital.find_details.plantreatment_summary || 'N/A'}</Text>
                  
                  {vitalIndex < record.child_health_vital_signs.length - 1 && (
                    <View className="h-px bg-gray-200 my-2" />
                  )}
                </View>
              )
            ))}
            {index < records.length - 1 && <View className="h-px bg-gray-200 my-2" />}
          </View>
        ))}
      </View>
    </View>
  );
};

// Disabilities Section
const DisabilitiesSection = ({ records }: { records: ChildHealthHistoryRecord[] }) => {
  return (
    <View className="mb-6">
      <Text className="font-semibold text-lg mb-2">Disabilities</Text>
      <View className="border border-gray-200 rounded-lg p-4">
        {records.map((record, index) => (
          <View key={`disabilities-${index}`} className="mb-3 last:mb-0">
            <Text className="font-medium mb-1">
              {new Date(record.created_at).toLocaleDateString()}
            </Text>
            {record.disabilities.length > 0 ? (
              record.disabilities.map((disability, dIndex) => (
                <Text key={`disability-${dIndex}`}>- {disability}</Text>
              ))
            ) : (
              <Text>No disabilities recorded</Text>
            )}
            {index < records.length - 1 && <View className="h-px bg-gray-200 my-2" />}
          </View>
        ))}
      </View>
    </View>
  );
};

// Vital Signs & Notes Section
const VitalSignsNotesSection = ({ records }: { records: ChildHealthHistoryRecord[] }) => {
  return (
    <View className="mb-6">
      <Text className="font-semibold text-lg mb-2">Vital Signs & Notes</Text>
      <View className="border border-gray-200 rounded-lg p-4">
        {records.map((record, index) => (
          <View key={`vitals-${index}`} className="mb-3 last:mb-0">
            <Text className="font-medium mb-1">
              {new Date(record.created_at).toLocaleDateString()}
            </Text>
            
            {record.child_health_vital_signs.map((vital, vitalIndex) => (
              <View key={`vital-detail-${vitalIndex}`} className="mb-2">
                <Text>Age: {vital.bm_details?.age || 'N/A'}</Text>
                <Text>Weight: {vital.bm_details?.weight || 'N/A'} kg</Text>
                <Text>Height: {vital.bm_details?.height || 'N/A'} cm</Text>
                <Text>Temperature: {vital.temp || 'N/A'} °C</Text>
                
                {vitalIndex < record.child_health_vital_signs.length - 1 && (
                  <View className="h-px bg-gray-200 my-2" />
                )}
              </View>
            ))}
            
            {record.child_health_notes.length > 0 && (
              <>
                <Text className="font-medium text-blue-600 mt-2">Clinical Notes:</Text>
                {record.child_health_notes.map((note, noteIndex) => (
                  <View key={`note-${noteIndex}`} className="mb-1">
                    <Text>{note.chn_notes || 'No notes recorded'}</Text>
                    {/* Add follow-up information if available */}
                    {note.followv_details && (
                      <View className="mt-2 pl-2 border-l-2 border-blue-200">
                        <Text className="font-medium text-blue-600">Follow-up:</Text>
                        <Text>Date: {note.followv_details.followv_date || 'N/A'}</Text>
                        <Text>Status: {note.followv_details.followv_status || 'N/A'}</Text>
                        <Text>Description: {note.followv_details.followv_description || 'N/A'}</Text>
                        {note.followv_details.completed_at && (
                          <Text>Completed At: {note.followv_details.completed_at}</Text>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </>
            )}
            
            {index < records.length - 1 && <View className="h-px bg-gray-200 my-2" />}
          </View>
        ))}
      </View>
    </View>
  );
};

// Nutritional Status Section
const NutritionalStatusSection = ({ records }: { records: ChildHealthHistoryRecord[] }) => {
  return (
    <View className="mb-6">
      <Text className="font-semibold text-lg mb-2">Nutritional Status</Text>
      <View className="border border-gray-200 rounded-lg p-4">
        {records.map((record, index) => (
          <View key={`nutrition-${index}`} className="mb-3 last:mb-0">
            <Text className="font-medium mb-1">
              {new Date(record.created_at).toLocaleDateString()}
            </Text>
            
            {record.nutrition_statuses.map((status, statusIndex) => (
              <View key={`status-${statusIndex}`} className="mb-2">
                <Text>Weight for Age (WFA): {status.wfa || 'N/A'}</Text>
                <Text>Length/Height for Age (LHFA): {status.lhfa || 'N/A'}</Text>
                <Text>MUAC: {status.muac || 'N/A'}</Text>
                <Text>MUAC Status: {status.muac_status || 'N/A'}</Text>
                <Text>Edema Severity: {status.edemaSeverity || 'N/A'}</Text>
                
                {statusIndex < record.nutrition_statuses.length - 1 && (
                  <View className="h-px bg-gray-200 my-2" />
                )}
              </View>
            ))}
            
            {index < records.length - 1 && <View className="h-px bg-gray-200 my-2" />}
          </View>
        ))}
      </View>
    </View>
  );
};

// Immunization Section
const ImmunizationSection = ({ records }: { records: ChildHealthHistoryRecord[] }) => {
  return (
    <View className="mb-6">
      <Text className="font-semibold text-lg mb-2">Immunization Tracking</Text>
      <View className="border border-gray-200 rounded-lg p-4">
        {records.map((record, index) => (
          <View key={`immunization-${index}`} className="mb-3 last:mb-0">
            <Text className="font-medium mb-1">
              {new Date(record.created_at).toLocaleDateString()}
            </Text>
            
            {record.immunization_tracking.length > 0 ? (
              record.immunization_tracking.map((imt, imtIndex) => (
                <View key={`imt-${imtIndex}`} className="mb-2">
                  <Text>Vaccine: {imt.vachist_details?.vaccine_stock?.vaccinelist?.vac_name || 'N/A'}</Text>
                  <Text>Dose Number: {imt.vachist_details?.vachist_doseNo || 'N/A'}</Text>
                  <Text>Date Administered: {imt.vachist_details?.date_administered || 'N/A'}</Text>
                  <Text>Status: {imt.vachist_details?.vachist_status || 'N/A'}</Text>
                  <Text>Age at Administration: {imt.vachist_details?.vachist_age || 'N/A'}</Text>
                  
                  {imt.vachist_details?.follow_up_visit && (
                    <>
                      <Text className="font-medium text-blue-600 mt-1">Follow-up:</Text>
                      <Text>Date: {imt.vachist_details.follow_up_visit.followv_date}</Text>
                      <Text>Description: {imt.vachist_details.follow_up_visit.followv_description}</Text>
                      <Text>Status: {imt.vachist_details.follow_up_visit.followv_status}</Text>
                    </>
                  )}
                  
                  {imtIndex < record.immunization_tracking.length - 1 && (
                    <View className="h-px bg-gray-200 my-2" />
                  )}
                </View>
              ))
            ) : (
              <Text>No immunizations recorded</Text>
            )}
            
            {index < records.length - 1 && <View className="h-px bg-gray-200 my-2" />}
          </View>
        ))}
      </View>
    </View>
  );
};

// Supplements Section
const SupplementsSection = ({ records }: { records: ChildHealthHistoryRecord[] }) => {
  return (
    <View className="mb-6">
      <Text className="font-semibold text-lg mb-2">Supplements & Status</Text>
      <View className="border border-gray-200 rounded-lg p-4">
        {records.map((record, index) => (
          <View key={`supplements-${index}`} className="mb-3 last:mb-0">
            <Text className="font-medium mb-1">
              {new Date(record.created_at).toLocaleDateString()}
            </Text>
            
            {/* Supplements */}
            {record.child_health_supplements.length > 0 && (
              <>
                <Text className="font-medium text-blue-600">Supplements:</Text>
                {record.child_health_supplements.map((supplement, suppIndex) => (
                  <View key={`supplement-${suppIndex}`} className="mb-2">
                    <Text>Medicine: {supplement.medrec_details?.minv_details?.med_detail?.med_name || 'N/A'}</Text>
                    <Text>Dosage: {supplement.medrec_details?.minv_details?.minv_dsg || 'N/A'} {supplement.medrec_details?.minv_details?.minv_dsg_unit || ''}</Text>
                    <Text>Quantity: {supplement.medrec_details?.medrec_qty || 'N/A'}</Text>
                    
                    {suppIndex < record.child_health_supplements.length - 1 && (
                      <View className="h-px bg-gray-200 my-2" />
                    )}
                  </View>
                ))}
              </>
            )}
            
            {/* Supplement Statuses */}
            {record.supplements_statuses.length > 0 && (
              <>
                <Text className="font-medium text-blue-600 mt-2">Supplement Statuses:</Text>
                {record.supplements_statuses.map((status, statusIndex) => (
                  <View key={`status-${statusIndex}`} className="mb-2">
                    <Text>Status Type: {status.status_type || 'N/A'}</Text>
                    <Text>Birth Weight: {status.birthwt || 'N/A'} kg</Text>
                    <Text>Date Seen: {status.date_seen || 'N/A'}</Text>
                    <Text>Date Given Iron: {status.date_given_iron || 'N/A'}</Text>
                    <Text>Date Completed: {status.date_completed || 'N/A'}</Text>
                    
                    {statusIndex < record.supplements_statuses.length - 1 && (
                      <View className="h-px bg-gray-200 my-2" />
                    )}
                  </View>
                ))}
              </>
            )}
            
            {record.child_health_supplements.length === 0 && record.supplements_statuses.length === 0 && (
              <Text>No supplements or statuses recorded</Text>
            )}
            
            {index < records.length - 1 && <View className="h-px bg-gray-200 my-2" />}
          </View>
        ))}
      </View>
    </View>
  );
};

// Health History Sections component
const HealthHistorySections = ({
  recordsToDisplay,
  chhistId,
  supplementStatusesFields,
}: {
  recordsToDisplay: ChildHealthHistoryRecord[];
  chhistId: string;
  supplementStatusesFields: any;
}) => {
  return (
    <>
      <TTStatusSection records={recordsToDisplay} />
      <ExclusiveBFSection records={recordsToDisplay} />
      <FindingsSection records={recordsToDisplay} />
      <DisabilitiesSection records={recordsToDisplay} />
      <VitalSignsNotesSection records={recordsToDisplay} />
      <NutritionalStatusSection records={recordsToDisplay} />
      <ImmunizationSection records={recordsToDisplay} />
      <SupplementsSection records={recordsToDisplay} />
    </>
  );
};

export default function ChildHealthHistoryDetail({ route, navigation }: Props) {
  // Navigation and routing
  const { chrecId, chhistId } = route.params || {};
  console.log('ChildHealthHistoryDetail: Received params:', { chrecId, chhistId });

  // State management
  const [fullHistoryData, setFullHistoryData] = useState<ChildHealthHistoryRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(2);
  const [activeTab, setActiveTab] = useState("current"); // 'current' or 'history'

  const supplementStatusesFields = useMemo(
    () => getSupplementStatusesFields(fullHistoryData),
    [fullHistoryData]
  );

  const { 
    data: historyData, 
    isLoading, 
  } = useChildHealthHistory(chrecId);

  useEffect(() => {
    console.log('ChildHealthHistoryDetail: historyData:', historyData);
    if (historyData) {
      const sortedHistory = (historyData[0]?.child_health_histories || [])
        .sort((a: ChildHealthHistoryRecord, b: ChildHealthHistoryRecord) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      
      setFullHistoryData(sortedHistory);
      console.log('ChildHealthHistoryDetail: sortedHistory:', sortedHistory);

      // Set initial index to the selected record
      const initialIndex = sortedHistory.findIndex(
        (record: ChildHealthHistoryRecord) => record.chhist_id === chhistId
      );
      setCurrentIndex(initialIndex !== -1 ? initialIndex : 0);
    }
  }, [historyData, chhistId]);

  const recordsToDisplay = useMemo(() => {
    if (fullHistoryData.length === 0) return [];
    const records = fullHistoryData.slice(currentIndex, currentIndex + recordsPerPage);
    console.log('ChildHealthHistoryDetail: recordsToDisplay:', records);
    return records;
  }, [fullHistoryData, currentIndex, recordsPerPage]);

  // Navigation handlers
  const handleSwipeLeft = () => {
    if (currentIndex < fullHistoryData.length - recordsPerPage) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Set default value for recordsPerPage
  useEffect(() => {
    setRecordsPerPage(3);
  }, []);

  // Loading component
  const LoadingComponent = () => (
    <View className="flex-1 justify-center items-center p-6">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-gray-500 mt-4">Loading health history...</Text>
    </View>
  );

  // Tab button component
  const TabButton = ({ value, label, icon, isActive, onPress }: any) => (
    <TouchableOpacity
      className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg ${
        isActive ? 'bg-blue-100' : 'bg-gray-100'
      }`}
      onPress={() => onPress(value)}
    >
      {icon}
      <Text className={`font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Pagination controls component
  const PaginationControls = ({ showRecordCount = true }: { showRecordCount?: boolean }) => (
    <View className="flex-col gap-4">
      {showRecordCount && (
        <Text className="text-sm text-gray-500 font-medium text-center">
          Showing records {currentIndex + 1}-
          {Math.min(currentIndex + recordsPerPage, fullHistoryData.length)}{" "}
          of {fullHistoryData.length}
        </Text>
      )}
      <View className="flex-row justify-center gap-2">
        <TouchableOpacity
          className={`p-3 rounded-lg border border-gray-300 ${
            currentIndex === 0 ? 'opacity-50' : 'bg-white'
          }`}
          onPress={handleSwipeRight}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={16} color={currentIndex === 0 ? "#9CA3AF" : "#374151"} />
        </TouchableOpacity>
        <TouchableOpacity
          className={`p-3 rounded-lg border border-gray-300 ${
            currentIndex >= fullHistoryData.length - recordsPerPage ? 'opacity-50' : 'bg-white'
          }`}
          onPress={handleSwipeLeft}
          disabled={currentIndex >= fullHistoryData.length - recordsPerPage}
        >
          <ChevronRight size={16} color={
            currentIndex >= fullHistoryData.length - recordsPerPage ? "#9CA3AF" : "#374151"
          } />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <LoadingComponent />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 mt-10">
        {/* Header Section */}
        <View className="px-6 pt-4">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              className=" rounded-lg mr-4"
              onPress={() => router.back()}
            >
              <ChevronLeft size={20} color="#374151" />
            </TouchableOpacity>
            <View className="flex-1 ">
              <Text className="font-semibold text-xl text-gray-800">
                Child Health History Records
              </Text>
              <Text className="text-sm text-gray-600">
                View and compare child's health history
              </Text>
            </View>
          </View>
          
          <View className="h-px bg-gray-200 mb-6" />
        </View>

        {/* Main Content */}
        <View className="px-6">
          {/* Tab Navigation */}
          <View className="flex-row gap-2 mb-6">
            <TabButton
              value="current"
              label="Current Record"
              icon={<Baby size={16} color={activeTab === "current" ? "#2563EB" : "#6B7280"} />}
              isActive={activeTab === "current"}
              onPress={setActiveTab}
            />
            <TabButton
              value="history"
              label="View History"
              icon={<History size={16} color={activeTab === "history" ? "#2563EB" : "#6B7280"} />}
              isActive={activeTab === "history"}
              onPress={setActiveTab}
            />
          </View>

          {/* Tab Content */}
          {activeTab === "current" && (
            <PatientSummarySection
              recordsToDisplay={[fullHistoryData[currentIndex]]}
              fullHistoryData={fullHistoryData}
              chhistId={chhistId}
            />
          )}

          {activeTab === "history" && (
            <>
              {recordsToDisplay.length === 0 ? (
                <View className="p-6 items-center">
                  <Text className="text-gray-600 text-center">
                    No health history found for this child.
                  </Text>
                </View>
              ) : (
                <View className="border border-gray-200 rounded-lg bg-white">
                  <View className="p-6">
                    {/* Pagination Controls with Record Count */}
                    <PaginationControls />

                    {/* Divider */}
                    <View className="h-px bg-gray-200 my-6" />

                    {/* Accordion Sections */}
                    <View className="space-y-4">
                      <HealthHistorySections
                        recordsToDisplay={recordsToDisplay}
                        chhistId={chhistId}
                        supplementStatusesFields={supplementStatusesFields}
                      />
                    </View>

                    {/* Bottom Pagination Controls (mobile-friendly) */}
                    <View className="mt-6 pt-4">
                      <PaginationControls showRecordCount={false} />
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}