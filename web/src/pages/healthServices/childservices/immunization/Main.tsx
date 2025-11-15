import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Step1 from "./Step1";
import Immunization from "./Step2";
import { Button } from "@/components/ui/button/button";
import CardLayout from "@/components/ui/card/card-layout";
import { VitalSignType, VaccineRecord, ExistingVaccineRecord } from "../../../../form-schema/ImmunizationSchema";
import { useVaccinesListImmunization } from "./queries/fetchQueries";
import { getVaccinationRecordById } from "../../vaccination/restful-api/get";
import { useChildHealthHistory } from "../forms/queries/fetchQueries";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useUnvaccinatedVaccines, usePatientVaccinationDetails } from "../../vaccination/queries/fetch";
import { useFollowupChildHealthandVaccines } from "../../vaccination/queries/fetch";
import { fetchVaccinesWithStock } from "../../vaccination/queries/fetch";
import TableLoading from "../../../../components/ui/table-loading";

export default function ChildImmunization() {
  const location = useLocation();

  const { ChildHealthRecord } = location.state || {};
  const pat_id = ChildHealthRecord?.record?.chrec_details?.patrec_details?.pat_id?.toString() || "";
  const pat_dob = ChildHealthRecord?.record?.chrec_details?.patrec_details?.pat_details?.personal_info?.per_dob || "";
  const [currentStep, setCurrentStep] = useState(1);
  const [historicalVitalSigns, setHistoricalVitalSigns] = useState<VitalSignType[]>([]);
  const [historicalNotes, setHistoricalNotes] = useState<any[]>([]);
  const [fullHistoryData, setFullHistoryData] = useState<any[]>([]);
  const [showVaccineList, setShowVaccineList] = useState<boolean>(false);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [existingVaccines, setExistingVaccines] = useState<ExistingVaccineRecord[]>([]);
  const [vaccineHistory, setVaccineHistory] = useState<any[]>([]);

  // Data fetching hooks
  const { data: vaccinesData, isLoading: isVaccinesLoading } = fetchVaccinesWithStock(pat_dob);
  const { data: vaccinesListData, isLoading: isVaccinesListLoading } = useVaccinesListImmunization();
  const { data: unvaccinatedVaccines = [], isLoading: isUnvaccinatedLoading } = useUnvaccinatedVaccines(pat_id, pat_dob);
  const { data: vaccinations = [], isLoading: isCompleteVaccineLoading } = usePatientVaccinationDetails(pat_id);
  const { data: followUps = [], isLoading: followupLoading } = useFollowupChildHealthandVaccines(pat_id);
  const { data: historyData, isLoading: isChildLoading, isError, refetch } = useChildHealthHistory(ChildHealthRecord?.record?.chrec);
  const isLoading = isChildLoading || isVaccinesLoading || isVaccinesListLoading || isUnvaccinatedLoading || isCompleteVaccineLoading || followupLoading;

  useEffect(() => {
    const fetchVaccineHistory = async () => {
      try {
        if (pat_id) {
          const response = await getVaccinationRecordById(pat_id);
          setVaccineHistory(response);
        }
      } catch (error) {
        console.error("Error fetching vaccine history:", error);
      }
    };

    fetchVaccineHistory();
  }, [pat_id]);

  useEffect(() => {
    if (historyData) {
      // FIX: Get the entire results array, not just the first item
      const histories = historyData?.results || [];

      const sortedHistory = histories.sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setFullHistoryData(sortedHistory);

      const allVitalSigns: VitalSignType[] = [];
      const filteredNotes: any[] = [];

      sortedHistory.forEach((history: any) => {
        // Process vital signs
        const vitalSigns =
          history.child_health_vital_signs?.map((vital: any) => ({
            date: vital.created_at ? new Date(vital.created_at).toISOString().split("T")[0] : "",
            temp: vital.temp ? vital.temp.toString() : undefined,
            wt: vital.bm_details?.weight ? vital.bm_details.weight.toString() : undefined,
            ht: vital.bm_details?.height ? vital.bm_details.height.toString() : undefined,
            age: vital.bm_details?.age || "",
            notes: "",
            follov_description: "",
            followUpVisit: "",
            followv_status: "pending"
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
                chnotes_id: note.chnotes_id
              });
            }
          });
        }
      });

      // Filter for today's vital signs
      const today = new Date().toISOString().split("T")[0];
      const todaysVitalSigns = allVitalSigns.filter((vital) => vital.date === today);

      setHistoricalVitalSigns(todaysVitalSigns.length > 0 ? todaysVitalSigns : allVitalSigns);
      setHistoricalNotes(filteredNotes);
    }
  }, [historyData]);

  const handleUpdateVitalSigns = useCallback((updatedVitalSigns: VitalSignType[]) => {
    setHistoricalVitalSigns(updatedVitalSigns);
  }, []);

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <LayoutWithBack title="Immunization" description="Manage immunization records for the child">
      {isLoading ? (
        <div className="w-full h-full px-6">
          <TableLoading/>
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
              {currentStep === 1 ? (
                <Step1 
                  ChildHealthRecord={ChildHealthRecord}
                  onNext={handleNext}
                  fullHistoryData={fullHistoryData}
                />
              ) : (
                <Immunization
                  ChildHealthRecord={ChildHealthRecord}
                  historicalVitalSigns={historicalVitalSigns}
                  historicalNotes={historicalNotes}
                  onUpdateVitalSigns={handleUpdateVitalSigns}
                  onBack={handleBack}
                  vaccines={vaccines}
                  existingVaccines={existingVaccines}
                  setVaccines={setVaccines}
                  setExistingVaccines={setExistingVaccines}
                  showVaccineList={showVaccineList}
                  setShowVaccineList={setShowVaccineList}
                  vaccinesData={vaccinesData}
                  vaccinesListData={vaccinesListData}
                  isLoading={isLoading}
                  vaccineHistory={vaccineHistory}
                  unvaccinatedVaccines={unvaccinatedVaccines}
                  vaccinations={vaccinations}
                  followUps={followUps}
                />
              )}
            </>
          }
        />
      )}
    </LayoutWithBack>
  );
}