import React from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Separator } from "@/components/ui/separator";
import { formatTimeAgo, getDateTimeFormat } from "@/helpers/dateHelper";
import ReportMapLocation from "./ReportMapLocation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { capitalize } from "@/helpers/capitalize";
import {
  Phone,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  Search,
  FileText,
  Info,
  Smartphone,
  ShieldAlert,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button/button";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import {
  useGetIncidentReport,
  useGetIRInfo,
  useConvertCoordinatesToAddress,
} from "../queries/reportFetch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LoadButton } from "@/components/ui/button/load-button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useUpdateIR } from "../queries/reportUpdate";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export default function SecuradoReports(): JSX.Element {
  // ================ STATE INITIALIZATION ================
  const navigate = useNavigate();
  const [currentPage, _setCurrentPage] = React.useState<number>(1);
  const [search, setSearch] = React.useState<string>("");
  const [selectedReport, setSelectedReport] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const debouncedSearch = useDebounce(search, 300);

  // Queries
  const { mutateAsync: updateIR } = useUpdateIR();
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

  // ================ HANDLERS ================
  const handleCreateIR = async () => {
    try {
      setIsSubmitting(true);
      await updateIR({
        data: {
          ir_is_verified: true,
        },
        ir_id: IRInfo?.ir_id,
      });
      showSuccessToast("Incident Report Created");
      setSelectedReport("");
    } catch (err) {
      showErrorToast("Failed to create incident report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // MAIN CONTAINER: Added p-4 for outer spacing and bg-slate-100 for contrast
    <div className="flex w-full h-[calc(100vh-1rem)] bg-slate-100 p-4 gap-4 overflow-hidden">
      {/* ---------------- LEFT SIDEBAR ---------------- */}
      {/* Responsive Width: 320px on laptop, 380px on larger screens */}
      <div className="w-[320px] xl:w-[380px] flex-shrink-0 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden z-10">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              Securado Reports
            </h2>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
              {totalCount} Active
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-red-500 h-10 text-sm"
            />
          </div>
        </div>

        {/* List Content */}
        <ScrollArea className="flex-1 bg-slate-50/50">
          <div className="flex flex-col p-4 gap-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <Spinner size="md" />
                <span className="text-sm text-slate-400">
                  Loading reports...
                </span>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                <div className="bg-slate-100 p-3 rounded-full mb-3">
                  <Search className="w-6 h-6 text-slate-400" />
                </div>
                <p className="font-medium text-sm">No active reports</p>
              </div>
            ) : (
              data.map((report: any) => (
                <button
                  key={report.ir_id}
                  onClick={() => setSelectedReport(report.ir_id)}
                  className={`group flex flex-col items-start p-4 rounded-lg border transition-all duration-200 text-left hover:shadow-md ${
                    selectedReport === report.ir_id
                      ? "bg-white border-red-200 shadow-sm ring-1 ring-red-100"
                      : "bg-white border-slate-200 hover:border-red-100"
                  }`}
                >
                  <div className="flex justify-between w-full items-start mb-2">
                    <span
                      className={`font-semibold text-sm truncate ${
                        selectedReport === report.ir_id
                          ? "text-red-700"
                          : "text-slate-800"
                      }`}
                    >
                      {capitalize(report.ir_track_user_name)}
                    </span>
                    <span className="text-xs text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded">
                      {formatTimeAgo(report.ir_created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span className="truncate font-medium">
                      Device Reported Stolen
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ---------------- MIDDLE: MAP ---------------- */}
      {/* Added rounded-xl and border to match sidebars */}
      <div className="flex-1 relative bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {!selectedReport ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
              <MapPin className="w-10 h-10 text-slate-300" />
            </div>
            <p className="font-medium text-lg text-slate-500">
              Select a report to view location
            </p>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <ReportMapLocation
              IRInfo={IRInfo}
              selectedReport={selectedReport}
            />

            {/* Disclaimer - Floating Box */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-center pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm border border-amber-200 p-4 rounded-lg shadow-lg flex gap-4 items-start max-w-lg pointer-events-auto">
                <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800">
                    Snapshot Location
                  </p>
                  <p className="text-sm text-slate-600 leading-snug">
                    Locations shown are historical snapshots from the time of
                    the report. They are not live real-time updates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- RIGHT SIDEBAR: DETAILS ---------------- */}
      {/* Responsive Width: 350px on laptop, 420px on larger screens */}
      {selectedReport && (
        <div className="w-[350px] xl:w-[420px] flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col z-20">
          {isLoadingIRInfo ? (
            <div className="flex items-center justify-center h-full">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Details Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="font-bold text-2xl text-slate-800">
                      {capitalize(IRInfo?.ir_track_user_name)}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-slate-500">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {IRInfo?.ir_track_user_contact || "No contact"}
                      </span>
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-red-50 text-red-600 p-2.5 rounded-full cursor-help">
                          <Smartphone className="w-6 h-6" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Device Tracking Report</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {isSubmitting ? (
                  <LoadButton className="w-full">Creating Report...</LoadButton>
                ) : (
                  <ConfirmationModal
                    title="Generate Official Incident Report"
                    description="This will formally document the incident in the system and initiate the resolution workflow. Do you want to proceed?"
                    trigger={
                      <Button className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        Create Incident Report
                      </Button>
                    }
                    onClick={handleCreateIR}
                  />
                )}
              </div>

              {/* Details Content */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-8">
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">
                        Date
                      </p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700">
                          {
                            getDateTimeFormat(IRInfo?.ir_created_at).split(
                              ","
                            )[0]
                          }
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">
                        Time
                      </p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700">
                          {
                            getDateTimeFormat(IRInfo?.ir_created_at).split(
                              ","
                            )[1]
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location Comparison */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Location Analysis
                    </h4>

                    {/* User Location */}
                    <Card className="shadow-sm border-blue-100 overflow-hidden">
                      <div className="bg-blue-50/50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
                        <span className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                          <User className="w-4 h-4" /> User Position
                        </span>
                        {isLoadingUserLoc && <Spinner size="sm" />}
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                          {userLocation?.display_name || "Address unavailable"}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Device Location */}
                    <Card className="shadow-sm border-red-100 overflow-hidden">
                      <div className="bg-red-50/50 px-4 py-3 border-b border-red-100 flex justify-between items-center">
                        <span className="text-sm font-semibold text-red-700 flex items-center gap-2">
                          <Smartphone className="w-4 h-4" /> Device Position
                        </span>
                        {isLoadingDeviceLoc && <Spinner size="sm" />}
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                          {deviceLocation?.display_name ||
                            "Address unavailable"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  {/* Additional Notes */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Additional Information
                    </h4>
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                      <p className="text-sm text-slate-600 italic leading-relaxed">
                        "
                        {IRInfo?.ir_add_details ||
                          "No additional notes provided by the user."}
                        "
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      )}
    </div>
  );
}
