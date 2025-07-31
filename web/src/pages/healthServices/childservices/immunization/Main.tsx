import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PendingDisplayChildHealthRecord from "./Step1";
import Immunization from "./Step2";
import { Button } from "@/components/ui/button/button";
import CardLayout from "@/components/ui/card/card-layout";
import { ChevronLeft } from "lucide-react";
import { api2 } from "@/api/api";
import z from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { ChildHealthHistoryRecord } from "../../childservices/viewrecords/types";
import { VitalSignType, FormData, VaccineRecord, ExistingVaccineRecord } from "../../../../form-schema/ImmunizationSchema";
import { useVaccinesListImmunization } from "./queries/fetchQueries";
import { fetchVaccinesWithStock } from "../../vaccination/restful-api/fetch";
import { getVaccinationRecordById } from "../../vaccination/restful-api/get";
import { useChildHealthHistory } from "../forms/queries/fetchQueries";


export default function ChildImmunization() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { ChildHealthRecord } = location.state || {};
  const [historicalVitalSigns, setHistoricalVitalSigns] = useState<VitalSignType[]>([]);
  const [historicalNotes, setHistoricalNotes] = useState<any[]>([]);
  const [fullHistoryData, setFullHistoryData] = useState<ChildHealthHistoryRecord[]>([]);
  const { data: vaccinesData, isLoading: isVaccinesLoading } = fetchVaccinesWithStock();
  const { data: vaccinesListData, isLoading: isVaccinesListLoading } = useVaccinesListImmunization();
  const [showVaccineList, setShowVaccineList] = useState<boolean>(false);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [existingVaccines, setExistingVaccines] = useState<ExistingVaccineRecord[]>([]);
  const [vaccineHistory, setVaccineHistory] = useState<any[]>([]);

  const { 
    data: historyData, 
    isLoading: isChildLoading, 
    isError, 
    refetch 
  } = useChildHealthHistory(ChildHealthRecord?.chrec);


  const isLoading = isChildLoading || isVaccinesLoading || isVaccinesListLoading;



  useEffect(() => {
    const fetchVaccineHistory = async () => {
      try {
        if (ChildHealthRecord?.chrec_details?.patrec_details?.pat_id) {
          const pat_id = ChildHealthRecord.chrec_details.patrec_details.pat_id.toString();
          const response = await getVaccinationRecordById(pat_id);
          setVaccineHistory(response);
        }
      } catch (error) {
        console.error("Error fetching vaccine history:", error);
      }
    };
    
    fetchVaccineHistory();
  }, [ChildHealthRecord]);

  
  useEffect(() => {
    if (historyData) {
      const sortedHistory = (historyData[0]?.child_health_histories || []).sort(
        (a: ChildHealthHistoryRecord, b: ChildHealthHistoryRecord) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  
      setFullHistoryData(sortedHistory);
  
      const allVitalSigns: VitalSignType[] = [];
      const filteredNotes: any[] = [];
  
      sortedHistory.forEach((history: any) => {
        // Process vital signs (unchanged)
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
        })) || [];
        allVitalSigns.push(...vitalSigns);
  
        // Only process notes that match the history record's creation date
        if (history.child_health_notes) {
          history.child_health_notes.forEach((note: any) => {
            const noteDate = new Date(note.created_at).toISOString().split("T")[0];
            const recordDate = new Date(history.created_at).toISOString().split("T")[0];
            
            if (noteDate === recordDate) {
              filteredNotes.push({
                date: history.created_at,
                notes: note.chn_notes || "",
                follov_description: note.followv_details?.followv_description || "",
                followUpVisit: note.followv_details?.followv_date || "",
                followv_status: note.followv_details?.followv_status || "pending",
                chnotes_id: note.chnotes_id,
              });
            }
          });
        }
      });
  
      setHistoricalVitalSigns(allVitalSigns);
      setHistoricalNotes(filteredNotes); // Now only contains same-day notes
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

      {isLoading ? (
        <div className="w-full h-full px-6">
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
                  vaccines={vaccines}
                  existingVaccines={existingVaccines}
                  setVaccines={setVaccines}
                  setExistingVaccines={setExistingVaccines}
                  showVaccineList={showVaccineList}
                  setShowVaccineList={setShowVaccineList}
                  vaccinesData={vaccinesData}
                  vaccinesListData={vaccinesListData}
                  isLoading={isLoading}
                  vaccineHistory={vaccineHistory} // Pass the vaccine history

                />
              )}
            </>
          }
        />
      )}
    </>
  );
}