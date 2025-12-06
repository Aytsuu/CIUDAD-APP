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
  Search,
  FileText,
  Info,
  Smartphone,
  ShieldAlert,
  Trash2,
  PenLine,
  Quote,
  Save,
  PackageOpen,
  Archive,
  ArchiveRestore
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import {
  useGetIncidentReport,
  useGetIRInfo,
  useConvertCoordinatesToAddress,
} from "../queries/reportFetch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import TrackerIcon from "@/assets/images/tracker_icon.svg";
import UserIcon from "@/assets/images/user_icon.svg";

export default function SecuradoReports(): JSX.Element {
  // ================ STATE INITIALIZATION ================
  const [currentPage, _setCurrentPage] = React.useState<number>(1);
  const [search, setSearch] = React.useState<string>("");
  const [selectedReport, setSelectedReport] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [showArchive, setShowArchive] = React.useState<boolean>(false);
  const debouncedSearch = useDebounce(search, 300);
  const [toArchive, setToArchive] = React.useState<boolean>(false);

  // State for Remarks
  const [isAddingRemark, setIsAddingRemark] = React.useState<boolean>(false);
  const [remarkToAdd, setRemarkToAdd] = React.useState<string>("");
  const [isRemoving, setIsRemoving] = React.useState<boolean>(false);

  // Report Queries
  const { mutateAsync: updateIR } = useUpdateIR();
  const { data: reportQuery, isLoading } = useGetIncidentReport(
    currentPage,
    20,
    debouncedSearch,
    showArchive,
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

  const data = reportQuery?.results || [];
  const totalCount = reportQuery?.count || 0;
  const hasRemark = !!IRInfo?.ir_remark && IRInfo?.ir_remark.trim() !== "";
  const isArchive = IRInfo?.ir_is_archive;

  // ================ HANDLERS ================
  const handleToggleArchiveView = () => {
    setShowArchive((prev) => !prev);
    setSelectedReport(""); // Clear selection when switching views
  };

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

  const handleSaveRemark = async () => {
    if (!hasRemark && !remarkToAdd.trim()) {
      setIsAddingRemark(false);

      if (toArchive) {
        setToArchive(false);
        showErrorToast("Cannot archive a report without remark");
      }
      return;
    }
    if (isArchive && !remarkToAdd.trim()) {
      showErrorToast("Remark cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateIR({
        data: {
          ...(!hasRemark && { ir_remark: remarkToAdd }),
          ...(toArchive && { ir_is_archive: true }),
        },
        ir_id: IRInfo?.ir_id,
      });
      showSuccessToast(
        toArchive
          ? "Report has been moved archive"
          : "Remark saved successfully"
      );
      setRemarkToAdd("");
      setIsAddingRemark(false);
      setToArchive(false);
      if (toArchive) setSelectedReport(""); 

    } catch (err) {
      showErrorToast(
        toArchive
          ? "Failed to archive report. Please try again."
          : "Failed to save remark. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveRemark = async () => {
    if (isArchive) {
      showErrorToast("Cannot remove remark for archived report");
      return;
    }

    try {
      setIsRemoving(true);
      await updateIR({
        data: {
          ir_remark: null,
        },
        ir_id: IRInfo?.ir_id,
      });
      setRemarkToAdd("");
      setIsAddingRemark(false);
      showSuccessToast("Remark removed successfully");
    } catch (err) {
      showErrorToast("Failed to remove remark. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleArchive = async () => {
    try {
      setToArchive(true);
      setIsSubmitting(true);
      await updateIR({
        data: {
          ir_is_archive: true,
        },
        ir_id: IRInfo?.ir_id,
      });
      showSuccessToast("Report has been moved to archive");
      setSelectedReport(""); // Deselect as it leaves the active list
    } catch (err) {
      showErrorToast("Failed to archive report. Please try again.");
    } finally {
      setIsSubmitting(false);
      setToArchive(false); // Reset this
    }
  };

  const handleRestore = async () => {
    try {
      setIsSubmitting(true);
      await updateIR({
        data: {
          ir_is_archive: false,
        },
        ir_id: IRInfo?.ir_id,
      });
      showSuccessToast("Report restored successfully");
      setSelectedReport(""); // Deselect as it leaves the archive list
    } catch (err) {
      showErrorToast("Failed to restore report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = () => {
    setRemarkToAdd(IRInfo?.ir_remark || "");
    setIsAddingRemark(true);
  };

  const handleCancelEdit = () => {
    setRemarkToAdd("");
    setIsAddingRemark(false);
    if (toArchive) setToArchive(false);
  };

  return (
    <div className="flex w-full h-[calc(100vh-1rem)] bg-slate-100 gap-4 overflow-hidden">
      {/* ---------------- LEFT SIDEBAR ---------------- */}
      <div className="w-[320px] xl:w-[380px] flex-shrink-0 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden z-10">
        {/* Header */}
        <div className="p-5 border-b bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              Securado Reports
            </h2>
            <Badge 
              variant={showArchive ? "outline" : "secondary"} 
              className={showArchive ? "border-amber-500 text-amber-600 bg-amber-50" : "bg-slate-100 text-slate-600"}
            >
              {totalCount} {showArchive ? "Archived" : "Active"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <div className="w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder={showArchive ? "Search archives..." : "Search by name..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-red-500 h-10 text-sm"
              />
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    className={`h-10 px-3 transition-colors ${
                      showArchive 
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200" 
                        : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                    onClick={handleToggleArchiveView}
                    variant="ghost"
                  >
                    {showArchive ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showArchive ? "Switch to Active Reports" : "View Archived Reports"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                  {showArchive ? (
                     <Archive className="w-6 h-6 text-slate-400" />
                  ) : (
                     <Search className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <p className="font-medium text-sm">
                  {showArchive ? "No archived reports found" : "No active reports"}
                </p>
                {search && <p className="text-xs mt-1 text-slate-400">Try adjusting your search</p>}
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
                  } ${showArchive ? "opacity-90 grayscale-[0.3] hover:grayscale-0 hover:opacity-100" : ""}`}
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
                    <AlertTriangle className={`w-3.5 h-3.5 ${showArchive ? "text-slate-400" : "text-red-400"}`} />
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
      {selectedReport && (
        <div className="w-[350px] xl:w-[420px] flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {isLoadingIRInfo || isLoadingDeviceLoc || isLoadingUserLoc ? (
            <div className="flex items-center justify-center h-full">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Details Header */}
              <div className="p-6 border-b">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    {isArchive && (
                        <Badge variant="outline" className="mb-2 border-amber-200 bg-amber-50 text-amber-700">Archived</Badge>
                    )}
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
                  <LoadButton className="w-full">Processing...</LoadButton>
                ) : (
                    <>
                    {!isArchive ? (
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
                    ) : (
                         <ConfirmationModal
                            title="Restore Report"
                            description="This will restore the report to the active list. Do you want to proceed?"
                            trigger={
                                <Button className="w-full" variant="outline">
                                    <ArchiveRestore className="w-4 h-4 mr-2" /> Restore Report
                                </Button>
                            }
                            onClick={handleRestore}
                         />
                    )}
                    </>
                )}

                <div className="mt-4">
                  {isAddingRemark ? (
                    <div className="animate-in fade-in zoom-in-95 duration-200 space-y-2">
                      <Label className="text-xs text-gray-500 font-medium">
                        Remark
                      </Label>
                      <Textarea
                        value={remarkToAdd}
                        onChange={(e) => setRemarkToAdd(e.target.value)}
                        placeholder="Enter your remark here..."
                        className="text-sm bg-white"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-gray-500 hover:text-gray-700"
                          onClick={handleCancelEdit}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        {!toArchive ? (
                          <Button
                            size="sm"
                            className="h-8 text-xs gap-1"
                            onClick={handleSaveRemark}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <Spinner size="sm" />
                            ) : (
                              <>
                                <Save className="mr-2" /> Save
                              </>
                            )}
                          </Button>
                        ) : (
                          <ConfirmationModal
                            trigger={
                              <Button
                                size="sm"
                                className="h-8 text-xs gap-1"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <>
                                    <Save className="mr-2" /> Save
                                  </>
                                )}
                              </Button>
                            }
                            title="Archive Report"
                            description="Are you sure you want to archive this report? It will be moved to the archived list and removed from your active view."
                            onClick={handleSaveRemark}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Case B: Display Existing Remark OR Show Add Button */
                    <>
                      <div className="flex gap-3">
                        {!hasRemark && (
                          <Button
                            variant="secondary"
                            className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                            onClick={() => setIsAddingRemark(true)}
                          >
                            <PenLine className="w-4 h-4 mr-2" /> Add Remark
                          </Button>
                        )}

                        {!isArchive &&
                          !isAddingRemark &&
                          (!hasRemark ? (
                            <Button
                              variant="secondary"
                              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                              onClick={() => {
                                setToArchive(true);
                                setIsAddingRemark(true);
                              }}
                            >
                              <PackageOpen className="w-4 h-4 mr-2" /> Archive
                            </Button>
                          ) : isSubmitting && toArchive ? (
                            <LoadButton className="w-full">
                              Archiving Report...
                            </LoadButton>
                          ) : (
                            <ConfirmationModal
                              trigger={
                                <Button
                                  variant="secondary"
                                  className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                                >
                                  <PackageOpen className="w-4 h-4 mr-2" />{" "}
                                  Archive
                                </Button>
                              }
                              title="Archive Report"
                              description="Are you sure you want to archive this report? It will be moved to the archived list and removed from your active view."
                              onClick={handleArchive}
                            />
                          ))}
                      </div>

                      {hasRemark && (
                        <div className="relative mt-3 space-y-2">
                          <Label className="text-xs text-gray-500 font-medium">
                            Remark
                          </Label>
                          <div className="relative bg-gray-50 border border-gray-200 rounded-md p-3 pr-8 shadow-sm transition-all hover:border-gray-300 group">
                            <Quote className="absolute top-2 left-2 w-3 h-3 text-gray-300 transform scale-x-[-1]" />

                            <p className="text-sm text-gray-700 leading-relaxed pl-4 font-medium">
                              {IRInfo?.ir_remark}
                            </p>

                            <div
                              className={`absolute bottom-1 right-1 flex gap-1 transition-opacity duration-200 bg-gray-50/80 backdrop-blur-sm rounded-md p-1 ${
                                isRemoving
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:opacity-100"
                              }`}
                            >
                              {/* Edit Button - Disable during submit */}
                              <button
                                onClick={handleStartEdit}
                                disabled={isRemoving}
                                className={`p-1.5 rounded-md transition-colors ${
                                  isRemoving
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                }`}
                                title="Edit Remark"
                              >
                                <PenLine className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button / Spinner Swap */}
                              {isRemoving ? (
                                <div className="p-1.5 flex items-center justify-center">
                                  <Spinner
                                    size="sm"
                                    className="border-t-red-500"
                                  />
                                </div>
                              ) : (
                                <ConfirmationModal
                                  title="Delete Remark"
                                  description="Are you sure you want to remove this remark?"
                                  trigger={
                                    <button
                                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                      title="Delete Remark"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  }
                                  onClick={handleRemoveRemark}
                                  variant="destructive"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
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
                    {/* User Location */}
                    <Card className="flex gap-4 bg-blue-50 border shadow-sm overflow-hidden p-5 mt-4">
                      <img src={UserIcon} className="w-[40px] h-[35px]" />
                      <div className="flex flex-col gap-2 text-white">
                        <h4 className="font-semibold text-md text-primary">
                          User Location
                        </h4>
                        <p className="text-sm text-gray-900 leading-relaxed">
                          {userLocation?.display_name || "Location unavailable"}
                        </p>
                      </div>
                    </Card>

                    {/* Device Location */}
                    <Card className="flex gap-4 bg-blue-50 border shadow-sm overflow-hidden p-5 mt-4">
                      <img src={TrackerIcon} className="w-[40px] h-[35px]" />
                      <div className="flex flex-col gap-2 text-white">
                        <h4 className="font-semibold text-md text-primary">
                          Device Location
                        </h4>
                        <p className="text-sm text-gray-900 leading-relaxed">
                          {deviceLocation?.display_name ||
                            "Location unavailable"}
                        </p>
                      </div>
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