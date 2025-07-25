import {
  useCHimmunizationCount,
  usePendingMedicalConCount,
  useForwardedVaccinationCount,
  useForwardedChildMedRecordCount,
  useScheduledVaccinationCount,
} from "./restful-api/count";
import { SyringeIcon, Pill, Baby, Frown } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function MainForwardedRecord() {
  const { data: CHimmunizationcount, isLoading: isLoadingCH } =
    useCHimmunizationCount();
  const { data: pendingMedicalConCount, isLoading: isLoadingPending } =
    usePendingMedicalConCount();
  const { data: forwardedVaccinationCount, isLoading: isLoadingVacc } =
    useForwardedVaccinationCount();
  const { data: forwardedChildMedRecordCount, isLoading: isLoadingChildMed } =
    useForwardedChildMedRecordCount();
  const { data: scheduledVaccinationCount } = useScheduledVaccinationCount();
  

  console.log("Vaccination Count Data:",scheduledVaccinationCount );



  const CHimmunizationcountData = CHimmunizationcount?.count || 0;
  const pendingMedicalConCountData = pendingMedicalConCount?.count || 0;
  const forwardedVaccinationCountData = forwardedVaccinationCount?.count || 0;
  const forwardedChildMedRecordCountData = forwardedChildMedRecordCount?.count || 0;
  const scheduledVaccinationCountData = scheduledVaccinationCount?.count || 0;

  const totalconsultationCount =
    forwardedChildMedRecordCountData + pendingMedicalConCountData;

  const isLoading =
    isLoadingCH || isLoadingPending || isLoadingVacc || isLoadingChildMed;

  const hasNoRecords =
    CHimmunizationcountData === 0 &&
    pendingMedicalConCountData === 0 &&
    forwardedVaccinationCountData === 0 &&
    scheduledVaccinationCountData === 0 ;

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
        <div className="bg-white p-8 rounded-md shadow-md flex justify-center flex-col items-center text-center">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <Frown className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No Forwarded Records
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            There are currently no forwarded records to display.
          </p>
          <Link to="/main-forwarded-records">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-6 bg-white border-blue-300 text-blue-700 font-medium"
            >
              Refresh Records
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white p-8 rounded-md shadow-md">
            {CHimmunizationcountData > 0 && (
              <div className="p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg">
                      <Pill className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Child Health Immunization
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600 bg-purple-200 px-2 py-1 rounded-md">
                          {CHimmunizationcountData} Records forwarded
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link to="/main-forwarded-records/forwarded-chimmunization">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-6 bg-white border-purple-300 text-purple-700 font-medium"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {forwardedVaccinationCountData > 0 && (
              <div className="p-4 rounded-lg border border-green-200 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg">
                      <Baby className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Forwarded Vaccination Records
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600 bg-green-200 px-2 py-1 rounded-md">
                          {forwardedVaccinationCountData} Records forwarded
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link to="/main-forwarded-records/forwarded-vaccination-form">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-6 bg-white border-green-300 text-green-700 font-medium"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {totalconsultationCount > 0 && (
              <div className="p-4 rounded-lg border border-orange-200 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg">
                      <SyringeIcon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Total Consultation Records
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600 bg-orange-200 px-2 py-1 rounded-md">
                          {totalconsultationCount} Records forwarded
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link to="/main-forwarded-records/combined-health-records">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-6 bg-white border-orange-300 text-orange-700 font-medium"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            {scheduledVaccinationCountData > 0 && (
              <div className="p-4 rounded-lg border border-blue-200 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg">
                      <Pill className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Scheduled Vaccination Records
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600 bg-blue-200 px-2 py-1 rounded-md">
                          {scheduledVaccinationCountData} Records scheduled
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link to="/main-forwarded-records/scheduled-vaccinations">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-6 bg-white border-blue-300 text-blue-700 font-medium"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            )}


            
          </div>
        </>
      )}
    </>
  );
}
