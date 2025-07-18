import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PendingDisplayChildHealthRecord from "./ChildhealthHistory";
import Immunization from "./Immunization";
import { Button } from "@/components/ui/button/button";
import CardLayout from "@/components/ui/card/card-layout";
import { ChevronLeft } from "lucide-react";
import { api2 } from "@/api/api";
import z from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { ChildHealthHistoryRecord } from "../../childservices/viewrecords/types";
import{VitalSignType, FormData} from "./ImmunizationSchema";
const fetchChildHealthHistory = async (chrec: string) => {
  const response = await api2.get(`/child-health/history/${chrec}/`);
  return response.data;
};

export default function ChildImmunization() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { ChildHealthRecord } = location.state || {};
  const [historicalVitalSigns, setHistoricalVitalSigns] = useState<VitalSignType[]>([]);
  const [historicalNotes, setHistoricalNotes] = useState<any[]>([]);
  const [fullHistoryData, setFullHistoryData] = useState<ChildHealthHistoryRecord[]>([]);

  const {
    data: historyData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["childHealthHistory", ChildHealthRecord?.chrec],
    queryFn: () => fetchChildHealthHistory(ChildHealthRecord?.chrec),
    enabled: !!ChildHealthRecord?.chrec,
    staleTime: 1000 * 60 * 5,
  });

  const [formData, setFormData] = useState<FormData>({
    date: "",
    age: "",
    ht: "",
    wt: "",
    temp: "",
    follov_description: undefined,
    notes: undefined,
    followUpVisit: undefined,
    followv_id: undefined,
    chvital_id: undefined,
    bm_id: undefined,
    chnotes_id: undefined,
    followv_status: undefined,
    vaccines: [] as { vacStck_id: string, vaccineName: string; dose: string; dateAdministered: string }[],
    // hasExistingVaccination: false,
    existingVaccines: [] as { vac_id: string, vaccineName: string; dose: string; dateAdministered: string }[],
  });

  useEffect(() => {
    if (historyData) {
      const sortedHistory = (historyData[0]?.child_health_histories || []).sort(
        (a: ChildHealthHistoryRecord, b: ChildHealthHistoryRecord) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setFullHistoryData(sortedHistory);

      const allVitalSigns: VitalSignType[] = [];
      const allNotes: any[] = [];

      sortedHistory.forEach((history: any) => {
        const vitalSigns = history.child_health_vital_signs?.map((vital: any) => ({
          date: vital.created_at
            ? new Date(vital.created_at).toISOString().split("T")[0]
            : "",
          temp: vital.temp ? vital.temp.toString() : undefined,
          wt: vital.bm_details?.weight
            ? vital.bm_details.weight.toString()
            : undefined,
          ht: vital.bm_details?.height
            ? vital.bm_details.height.toString()
            : undefined,
          age: vital.bm_details?.age || "",
          notes: "",
          follov_description: "",
          followUpVisit: "",
          followv_status: "pending",
          chvital_id: vital.chvital_id,
          bm_id: vital.bm_id,
          followv_id: vital.followv_id,
        })) || [];
        allVitalSigns.push(...vitalSigns);

        if (history.child_health_notes) {
          allNotes.push({
            date: history.created_at,
            notes: history.child_health_notes?.[0]?.chn_notes || "",
            follov_description:
              history.child_health_notes?.[0]?.followv_details
                ?.followv_description || "",
            followUpVisit:
              history.child_health_notes?.[0]?.followv_details?.followv_date ||
              "",
            followv_status:
              history.child_health_notes?.[0]?.followv_details
                ?.followv_status || "pending",
            chnotes_id: history.child_health_notes?.[0]?.chnotes_id,
          });
        }
      });

      setHistoricalVitalSigns(allVitalSigns);
      setHistoricalNotes(allNotes);
    }
  }, [historyData]);

  const nextStep = useCallback(() => {
    setCurrentStep(2);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(1);
  }, []);

  const handleUpdateVitalSigns = useCallback(
    (updatedVitalSigns: VitalSignType[]) => {
      setHistoricalVitalSigns(updatedVitalSigns);
    },
    []
  );

  return (
    <>
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-darkGray p-2 bg-white hover:bg-gray-100 rounded-md border border-gray-200"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="font-semibold text-lg sm:text-xl md:text-2xl text-darkBlue2">
            Child Immunization Record
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            View immunization details and child information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-4 sm:mb-6" />

      {isLoading || !ChildHealthRecord ? (
        <div className="w-full h-full p-6">
          <Skeleton className="h-10 w-1/6 mb-3" />
          <Skeleton className="h-7 w-1/4 mb-6" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-4/5 w-full mb-4" />
          {isError && (
            <div className="flex justify-center mt-4">
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          )}
        </div>
      ) : (
        <CardLayout
          cardClassName="px-6"
          title=""
          content={
            <>
              {currentStep === 1 && (
                <PendingDisplayChildHealthRecord
                  ChildHealthRecord={ChildHealthRecord}
                  onNext={nextStep}
                  fullHistoryData={fullHistoryData}
                />
              )}
              {currentStep === 2 && (
                <Immunization
                  ChildHealthRecord={ChildHealthRecord}
                  historicalVitalSigns={historicalVitalSigns}
                  historicalNotes={historicalNotes}
                  onUpdateVitalSigns={handleUpdateVitalSigns}
                  onBack={prevStep}
                />
              )}
            </>
          }
        />
      )}
    </>
  );
}