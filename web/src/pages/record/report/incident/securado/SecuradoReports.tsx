import React from "react";
import {
  useConvertCoordinatesToAddress,
  useGetIncidentReport,
  useGetIRInfo,
} from "../../queries/reportFetch";
import { useDebounce } from "@/hooks/use-debounce";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { formatTimeAgo, getDateTimeFormat } from "@/helpers/dateHelper";
import ReportMapLocation from "./ReportMapLocation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { capitalize } from "@/helpers/capitalize";
import { Phone } from "lucide-react";

export default function SecuradoReports(): JSX.Element {
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [search, setSearch] = React.useState<string>("");
  const [selectedReport, setSelectedReport] = React.useState<string>("");

  const debouncedSearch = useDebounce(search, 300);

  const { data: activeIRs, isLoading } = useGetIncidentReport(
    currentPage,
    20,
    debouncedSearch,
    false,
    true
  );
  const { data: IRInfo, isLoading: isLoadingIRInfo } =
    useGetIRInfo(selectedReport);
  const { data: userLocation, isLoading: isLoadingUserLoc } = useConvertCoordinatesToAddress(
    IRInfo?.ir_track_user_lat,
    IRInfo?.ir_track_user_lng
  );

  const { data: deviceLocation, isLoading: isLoadingDeviceLoc } = useConvertCoordinatesToAddress(
    IRInfo?.ir_track_lat,
    IRInfo?.ir_track_lng
  );

  const data = activeIRs?.results || [];
  const totalCount = activeIRs?.count || 0;
  const totalPages = Math.ceil(totalCount / 20);

  return (
    <div className="w-full h-[85vh] flex justify-start relative gap-6">
      <div className="w-[700px] h-full rounded-lg bg-white border border-gray-200 shadow-sm">
        <div className="p-4 flex justify-between items-center">
          <Label className="text-black text-lg">Reports</Label>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          <div className="flex flex-col p-4 gap-4">
            {data?.map((report: any) => (
              <Card
                className={`p-4 cursor-pointer transition-colors ease-in duration-500 ${
                  selectedReport == report.ir_id
                    ? "bg-blue-100 border-2 border-primary"
                    : "bg-gray-100"
                }`}
                onClick={() => {
                  if (report.ir_id != selectedReport) {
                    setSelectedReport(report.ir_id);
                  }
                }}
              >
                <div className="flex flex-col">
                  <p className="text-md font-medium">
                    Reported by {capitalize(report.ir_track_user_name)}
                  </p>
                  <p className="font-normal flex items-center gap-2">
                    <Phone size={14} />
                    {report.ir_track_user_contact}
                  </p>
                </div>
                <p className="text-end text-sm">
                  {formatTimeAgo(report.ir_created_at)}
                </p>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
      <ReportMapLocation IRInfo={IRInfo} selectedReport={selectedReport} />
      <div className="w-1/2 h-full rounded-lg bg-white border border-gray-200 shadow-sm">
        {selectedReport ? (
          <div className="flex flex-col p-4">
            <p>{IRInfo?.ir_track_user_name}</p>
            <p>{IRInfo?.ir_add_details}</p>
            <p>User location: {userLocation?.display_name}</p>
            <p>Device location: {deviceLocation?.display_name}</p>
            <p>{getDateTimeFormat(IRInfo?.ir_created_at)}</p>
          </div>
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <p>No selected report</p>
          </div>
        )}
      </div>
    </div>
  );
}
