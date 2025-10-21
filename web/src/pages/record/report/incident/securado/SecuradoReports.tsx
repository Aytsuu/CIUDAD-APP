import React from "react";
import {
  useConvertCoordinatesToAddress,
  useGetIncidentReport,
  useGetIRInfo,
} from "../../queries/reportFetch";
import { useDebounce } from "@/hooks/use-debounce";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
// import { Card } from "@/components/ui/card";
import { formatTimeAgo, getDateTimeFormat } from "@/helpers/dateHelper";
import ReportMapLocation from "./ReportMapLocation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { capitalize } from "@/helpers/capitalize";
import {
  Phone,
  AlertTriangle,
  Clock,
  CircleAlert,
  UserRound,
  FileText,
  Search,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import TrackerIcon from "@/assets/images/tracker_icon.svg";
import UserIcon from "@/assets/images/user_icon.svg";
import { Button } from "@/components/ui/button/button";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";

export default function SecuradoReports(): JSX.Element {
  const navigate = useNavigate();
  const [currentPage, _setCurrentPage] = React.useState<number>(1);
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
  const { data: userLocation, isLoading: isLoadingUserLoc } =
    useConvertCoordinatesToAddress(
      IRInfo?.ir_track_user_lat,
      IRInfo?.ir_track_user_lng
    );

  const { data: deviceLocation, isLoading: isLoadingDeviceLoc } =
    useConvertCoordinatesToAddress(IRInfo?.ir_track_lat, IRInfo?.ir_track_lng);

  const data = activeIRs?.results || [];
  const totalCount = activeIRs?.count || 0;
  // const totalPages = Math.ceil(totalCount / 20);

  return (
    <div className="w-full h-[85vh] flex justify-start relative gap-6">
      {/* Reports List Panel */}
      <div className="w-full max-w-[360px] rounded-lg bg-white border border-red-200 shadow-sm flex flex-col">
        <div className="px-5 py-3 flex justify-between items-center bg-red-600 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Label className="text-white text-lg font-semibold">
              Securado Reports
            </Label>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-white font-bold text-sm">{totalCount}</span>
          </div>
        </div>
        <div className="px-5 mt-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={`Search reports...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col p-4 gap-2">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Spinner size="lg" />
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="mx-auto mb-2" size={48} />
                <p>No active reports</p>
              </div>
            ) : (
              data?.map((report: any) => (
                <div
                  className={`flex justify-between gap-5 items-center px-2 ${
                    selectedReport == report.ir_id
                      ? "text-red-600"
                      : "text-red-400"
                  }`}
                >
                  <Button
                    variant={"link"}
                    className={`justify-start p-0 cursor-pointer text-red-400 ${
                      selectedReport == report.ir_id
                        ? "text-red-600"
                        : "text-red-400"
                    }`}
                    onClick={() => setSelectedReport(report.ir_id)}
                  >
                    <AlertTriangle />
                    <p className="text-sm truncate">
                      Report of {capitalize(report.ir_track_user_name)}
                    </p>
                  </Button>
                  <p className="text-sm">
                    {formatTimeAgo(report.ir_created_at)}
                  </p>
                </div>
                // <Card
                //   key={report.ir_id}
                //   className={`p-4 cursor-pointer transition-color duration-200 ${
                //     selectedReport === report.ir_id
                //       ? "bg-red-50 border-2 border-red-500"
                //       : "bg-gradient-to-br from-red-100 to-red-50 border-red-200 hover:border-red-300"
                //   }`}
                //   onClick={() => {
                //     if (report.ir_id !== selectedReport) {
                //       setSelectedReport(report.ir_id);
                //     }
                //   }}
                // >
                //   <div className="flex items-start justify-between mb-3">
                //     <div className="flex items-center gap-2">
                //       <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                //       <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                //         Device Report
                //       </span>
                //     </div>
                //     <Clock className="text-red-600" size={14} />
                //   </div>

                //   <div className="flex flex-col gap-2">
                //     <div className="flex items-center gap-2">
                //       <UserRound className="text-gray-600" size={16} />
                //       <p className="text-sm font-semibold text-gray-900">
                //         {capitalize(report.ir_track_user_name)}
                //       </p>
                //     </div>
                //     <div className="flex items-center gap-2">
                //       <Phone className="text-gray-600" size={14} />
                //       <p className="text-sm font-medium text-gray-700">
                //         {report.ir_track_user_contact}
                //       </p>
                //     </div>
                //   </div>

                //   <div className="mt-3 pt-3 border-t border-red-200">
                //     <p className="text-xs text-gray-600 text-end font-medium">
                //       {formatTimeAgo(report.ir_created_at)}
                //     </p>
                //   </div>
                // </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Map Section */}
      <ReportMapLocation IRInfo={IRInfo} selectedReport={selectedReport} />

      {/* Report Details Panel */}
      {selectedReport && (
        <div className="w-full max-w-sm flex flex-col gap-4">
          {isLoadingIRInfo ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="rounded-lg bg-white border border-red-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-5 py-3">
                <div className="flex items-center gap-2 text-white">
                  <h3 className="font-semibold text-lg">Report Details</h3>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <UserRound
                    className="text-red-600 mt-1 flex-shrink-0"
                    size={18}
                  />
                  <div>
                    <p className="text-xs text-gray-500 tracking-wide font-medium mb-1">
                      REPORTED BY
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {capitalize(IRInfo?.ir_track_user_name)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Phone
                    className="text-red-600 mt-1 flex-shrink-0"
                    size={18}
                  />
                  <div>
                    <p className="text-xs text-gray-500 tracking-wide font-medium mb-1">
                      CONTACT
                    </p>
                    <p className="text-sm text-gray-900 font-medium leading-relaxed">
                      {IRInfo?.ir_track_user_contact || "No contact provided"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className="text-red-600 mt-1 flex-shrink-0"
                    size={18}
                  />
                  <div>
                    <p className="text-xs text-gray-500 tracking-wide font-medium mb-1">
                      ADDITIONAL DETAILS
                    </p>
                    <p className="text-sm text-gray-900 font-medium leading-relaxed">
                      {IRInfo?.ir_add_details ||
                        "No additional details provided"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Clock
                    className="text-red-600 mt-1 flex-shrink-0"
                    size={18}
                  />
                  <div>
                    <p className="text-xs text-gray-500 tracking-wide font-medium mb-1">
                      REPORTED AT
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {getDateTimeFormat(IRInfo?.ir_created_at)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      navigate("/report/acknowledgement/form", {
                        state: {
                          params: {
                            data: IRInfo,
                          },
                        },
                      });
                    }}
                  >
                    <FileText className="w-4 h-4" />
                    Create AR
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isLoadingUserLoc ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="flex gap-4 rounded-lg bg-blue-50 border border-primary shadow-sm overflow-hidden p-5">
              <img src={UserIcon} className="w-[40px] h-[35px]" />
              <div className="flex flex-col gap-2 text-white">
                <h4 className="font-semibold text-md text-primary">
                  User Location
                </h4>
                <p className="text-sm text-gray-900 leading-relaxed">
                  {userLocation?.display_name || "Location unavailable"}
                </p>
              </div>
            </div>
          )}

          {isLoadingDeviceLoc ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="flex gap-4 rounded-lg bg-blue-50 border border-primary shadow-sm overflow-hidden p-5">
              <img src={TrackerIcon} className="w-[40px] h-[35px]" />
              <div className="flex flex-col gap-2 text-white">
                <h4 className="font-semibold text-md text-primary">
                  Device Location
                </h4>
                <p className="text-sm text-gray-900 leading-relaxed">
                  {deviceLocation?.display_name || "Location unavailable"}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3  text-gray-600">
            <CircleAlert className="w-8 h-8" />
            <p className="text-sm">
              The user and device location shown is not live, it's at the time
              the user reported the device as stolen.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
