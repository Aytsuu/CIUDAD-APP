import {
  useCHimmunizationCount,
  usePendingMedicalConCount,
  useForwardedVaccinationCount,
  useForwardedChildMedRecordCount,
  useScheduledVaccinationCount,
} from "./restful-api/count";
import { Skeleton } from "@/components/ui/skeleton";
import { ChildHealthImmunizationCard } from "./cards/ForwrdedChildHealthImmunizationCard";
import { ForwardedVaccinationCard } from "./cards/ForwardedVaccinationCard";
import { ForwardedConsultationCard } from "./cards/ForwardedConsultationCard";
import { ForwardedScheduledVaccinationCard } from "./cards/ScheduledVaccinationCard";
import { NoRecordsCard } from "./cards/NoRecordsFound";

export default function MainForwardedRecord() {
  const { data: CHimmunizationcount, isLoading: isLoadingCH } =
    useCHimmunizationCount();
  const { data: pendingMedicalConCount, isLoading: isLoadingPending } =
    usePendingMedicalConCount();
  const { data: forwardedVaccinationCount, isLoading: isLoadingVacc } =
    useForwardedVaccinationCount();

  const { data: scheduledVaccinationCount } = useScheduledVaccinationCount();

  const CHimmunizationcountData = CHimmunizationcount?.count || 0;
  const pendingMedicalConCountData = pendingMedicalConCount?.count || 0;
  const forwardedVaccinationCountData = forwardedVaccinationCount?.count || 0;
  const scheduledVaccinationCountData = scheduledVaccinationCount?.count || 0;


  const isLoading =
    isLoadingCH || isLoadingPending || isLoadingVacc ;

  const hasNoRecords =
    CHimmunizationcountData === 0 &&
    pendingMedicalConCountData === 0 &&
    forwardedVaccinationCountData === 0 &&
    scheduledVaccinationCountData === 0;

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-col items-center">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Forwarded Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view forwarded records
          </p>
        </div>
      </div>
      <hr className="border-gray-300 mb-4" />

      {isLoading ? (
        <div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3 " />
            <Skeleton className="h-4 w-2/3 " />
            <Skeleton className="h-4 w-full " />
          </div>
        </div>
      ) : hasNoRecords ? (
        <NoRecordsCard />
      ) : (
        <div className="bg-white p-8 rounded-md shadow-md">
          <ChildHealthImmunizationCard count={CHimmunizationcountData} />
          <ForwardedVaccinationCard count={forwardedVaccinationCountData} />
          <ForwardedConsultationCard count={pendingMedicalConCountData} />
          <ForwardedScheduledVaccinationCard count={scheduledVaccinationCountData} />
        </div>
      )}
    </>
  );
}