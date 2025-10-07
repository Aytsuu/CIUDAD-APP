import { useState, useMemo, useEffect } from "react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Eye, Search, Trash2, Archive, ArchiveRestore } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout.tsx";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  useDeleteAttendanceSheet,
  useArchiveAttendanceSheet,
  useRestoreAttendanceSheet,
} from "../Calendar/queries/councilEventdelqueries";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Spinner } from "@/components/ui/spinner";
// import Attendees from "./Attendees";
import {
  useGetCouncilEvents,
  useGetAttendanceSheets,
  useGetCouncilEventYears,
} from "../Calendar/queries/councilEventfetchqueries";
import {
  CouncilEvent,
  AttendanceSheet,
  AttendanceRecord,
} from "../Calendar/councilEventTypes";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HistoryTable } from "@/components/ui/table/history-table";
import { useLoading } from "@/context/LoadingContext";
import { useDebounce } from "@/hooks/use-debounce";
import { formatTableDate } from "@/helpers/dateHelper";

const ArchiveTabActions = ({
  row,
  refetchEvents,
  refetchSheets,
}: {
  row: { original: AttendanceRecord };
  refetchEvents: () => void;
  refetchSheets: () => void;
}) => {
  const restoreSheet = useRestoreAttendanceSheet();
  const deleteSheet = useDeleteAttendanceSheet();

  return (
    <div className="flex justify-center gap-2">
      <TooltipLayout
        trigger={
          <DialogLayout
            trigger={
              <div className="w-[50px] h-[35px] bg-white border border-gray flex justify-center items-center rounded-[5px] shadow-sm cursor-pointer hover:bg-[#f3f2f2]">
                <Eye size={16} className="text-black" />
              </div>
            }
            className="max-w-[50%] h-2/3 flex flex-col overflow-y-auto"
            title="Archived Attendance Sheets"
            description="Here are the archived files related to the meeting."
            mainContent={
              <div className="w-full h-full">
                {row.original.sheets.length > 0 ? (
                  row.original.sheets.map((sheet, index) => (
                    <div key={sheet.att_id} className="mb-4">
                      {sheet.att_file_url ? (
                        <div className="relative flex flex-row items-end gap-1">
                          <div className="flex-1">
                            <img
                              src={sheet.att_file_url}
                              alt={`Archived Event File ${index + 1}`}
                              className="w-full h-auto max-h-[calc(100vh-200px)] object-contain"
                              onError={(e) =>
                                (e.currentTarget.src = "/placeholder-image.png")
                              }
                            />
                          </div>
                          <TooltipLayout
                            trigger={
                              <ConfirmationModal
                                trigger={
                                  <div className="cursor-pointer rounded text-white bg-green-500 p-1 transition-colors">
                                    <ArchiveRestore size={16} />
                                  </div>
                                }
                                title="Restore Attendance Sheet"
                                description="Would you like to restore this attendance sheet?"
                                actionLabel="Restore"
                                onClick={() =>
                                  restoreSheet.mutate(sheet.att_id, {
                                    onSuccess: () => {
                                      refetchSheets();
                                      refetchEvents();
                                    },
                                  })
                                }
                              />
                            }
                            content="Restore this attendance sheet"
                          />
                          <TooltipLayout
                            trigger={
                              <ConfirmationModal
                                trigger={
                                  <div className="cursor-pointer rounded text-white bg-red-500 p-1 transition-colors">
                                    <Trash2 size={16} />
                                  </div>
                                }
                                title="Permanently Delete"
                                description="This will permanently delete the attendance sheet. Continue?"
                                actionLabel="Delete"
                                onClick={() =>
                                  deleteSheet.mutate(sheet.att_id, {
                                    onSuccess: () => {
                                      refetchSheets();
                                      refetchEvents();
                                    },
                                  })
                                }
                              />
                            }
                            content="Delete this attendance sheet permanently"
                          />
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          No file uploaded for Archived Attendance Sheet #
                          {index + 1}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div>No archived attendance sheets for this meeting.</div>
                )}
              </div>
            }
          />
        }
        content="View"
      />
    </div>
  );
};

export const columns: ColumnDef<AttendanceRecord>[] = [
  {
    accessorKey: "attMeetingDate",
    header: "Date",
    cell: ({ row }) => (
      <div className="whitespace-nowrap overflow-hidden text-ellipsis">
        <div>{formatTableDate(row.getValue("attMeetingDate"))}</div>
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "attMettingTitle",
    header: "Meeting Title",
    cell: ({ row }) => {
      const title = row.getValue("attMettingTitle") as string;
      const lines = title.split("\n");
      const displayText =
        lines.length > 3 ? `${lines.slice(0, 3).join("\n")}\n...` : title;
      return (
        <div className="line-clamp-3 overflow-hidden text-ellipsis">
          {displayText}
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "attMeetingDescription",
    header: "Meeting Description",
    cell: ({ row }) => {
      const desc = row.getValue("attMeetingDescription") as string;
      const lines = desc.split("\n");
      const displayText =
        lines.length > 3 ? `${lines.slice(0, 3).join("\n")}\n...` : desc;
      return (
        <div className="line-clamp-3 overflow-hidden text-ellipsis">
          {displayText}
        </div>
      );
    },
    size: 300,
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const ceId = row.original.ceId;
      const { data: attendanceSheet, refetch: refetchSheets } =
        useGetAttendanceSheets();
      const { refetch: refetchEvents } = useGetCouncilEvents();
      const sheets =
        attendanceSheet?.filter(
          (sheet) => sheet.ce_id === ceId && !sheet.att_is_archive
        ) || [];
      const archiveSheet = useArchiveAttendanceSheet();
      // const [isAttendeesDialogOpen, setIsAttendeesDialogOpen] = useState(false);
      // const [isEditMode, setIsEditMode] = useState(false);

      // const handleSaveSuccess = () => {
      //   setIsEditMode(false);
      // };

      if (row.original.isArchived) {
        return (
          <ArchiveTabActions
            row={row}
            refetchEvents={refetchEvents}
            refetchSheets={refetchSheets}
          />
        );
      }

      return (
        <div className="flex justify-center gap-1">
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="w-[50px] h-[35px] bg-white border border-gray flex justify-center items-center rounded-[5px] shadow-sm cursor-pointer hover:bg-[#f3f2f2]">
                    <Eye size={16} className="text-black" />
                  </div>
                }
                className="max-w-[50%] h-2/3 flex flex-col overflow-y-auto"
                title="Attendance Sheets"
                description="Here are the files related to the meeting."
                mainContent={
                  <div className="w-full h-full">
                    {sheets.length > 0 ? (
                      sheets.map((sheet, index) => (
                        <div key={sheet.att_id} className="mb-4">
                          {sheet.att_file_url ? (
                            <div className="relative flex flex-row items-end gap-2">
                              <div className="flex-1">
                                <img
                                  src={sheet.att_file_url}
                                  alt={`Event File ${index + 1}`}
                                  className="w-full h-auto max-h-[calc(100vh-200px)] object-contain"
                                />
                              </div>
                              <TooltipLayout
                                trigger={
                                  <ConfirmationModal
                                    trigger={
                                      <div className="cursor-pointer rounded text-white bg-red-500 p-1 transition-colors">
                                        <Archive size={16} />
                                      </div>
                                    }
                                    title="Archive Attendance Sheet"
                                    description="Are you sure you want to archive this attendance sheet?"
                                    actionLabel="Archive"
                                    onClick={() =>
                                      archiveSheet.mutate(sheet.att_id, {
                                        onSuccess: () => {
                                          refetchSheets();
                                          refetchEvents();
                                        },
                                      })
                                    }
                                  />
                                }
                                content="Archive this attendance sheet"
                              />
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              No file uploaded for Attendance Sheet #{index + 1}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div>
                        No attendance sheets have been uploaded for this meeting
                        yet.
                      </div>
                    )}
                  </div>
                }
              />
            }
            content="View"
          />
          {/* <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="w-[50px] h-[35px] bg-white border border-gray flex justify-center items-center rounded-[5px] shadow-sm cursor-pointer hover:bg-[#f3f2f2]">
                    <Stamp size={16} className="text-black" />
                  </div>
                }
                className="max-w-[700px] h-[400px] flex flex-col overflow-auto"
                title={isEditMode ? "Edit" : "View"}
                description={
                  isEditMode
                    ? "Edit participants attendance."
                    : "View participants attendance."
                }
                isOpen={isAttendeesDialogOpen}
                onOpenChange={(open) => {
                  setIsAttendeesDialogOpen(open);
                  if (!open) {
                    setIsEditMode(false);
                  }
                }}
                mainContent={ ''
                  <Attendees
                    ceId={ceId}
                    isEditMode={isEditMode}
                    onEditToggle={setIsEditMode}
                    onSave={handleSaveSuccess}
                  />
                }
              />
            }
            content={isEditMode ? "Save" : "Mark"}
          /> */}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 150,
  },
];

function AttendancePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filter, setFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active");
  const { showLoading, hideLoading } = useLoading();

  // Fetch available years
  const { data: availableYears = [] } = useGetCouncilEventYears();

  const {
    data: councilEventsData,
    isLoading: isCouncilEventsLoading,
    error,
  } = useGetCouncilEvents(currentPage, pageSize, debouncedSearchTerm, filter, false);

  const { data: attendanceSheets = [], isLoading: isSheetsLoading } =
    useGetAttendanceSheets(activeTab === "archive");
  const isLoading = isCouncilEventsLoading || isSheetsLoading;

  const councilEvents = councilEventsData?.results || [];
  const totalCount = councilEventsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Build table data from paginated results
  const tableData = useMemo(() => {
    const eventMap = new Map<number, CouncilEvent>();
    councilEvents.forEach((event) => {
      eventMap.set(event.ce_id, event);
    });

    const data: AttendanceRecord[] = [];

    if (activeTab === "active") {
      councilEvents.forEach((event) => {
        const nonArchivedSheets = attendanceSheets.filter(
          (sheet) => sheet.ce_id === event.ce_id && !sheet.att_is_archive
        );
        data.push({
          ceId: event.ce_id,
          attMettingTitle: event.ce_title || "Untitled Meeting",
          attMeetingDate: event.ce_date || "N/A",
          attMeetingDescription: event.ce_description || "No description",
          isArchived: false,
          sheets: nonArchivedSheets,
        });
      });
    } else {
      const archivedSheetsByEvent = new Map<number, AttendanceSheet[]>();
      attendanceSheets
        .filter((sheet) => sheet.att_is_archive)
        .forEach((sheet) => {
          const sheets = archivedSheetsByEvent.get(sheet.ce_id) || [];
          sheets.push(sheet);
          archivedSheetsByEvent.set(sheet.ce_id, sheets);
        });

      archivedSheetsByEvent.forEach((sheets, ce_id) => {
        const event = eventMap.get(ce_id);
        if (event) {
          data.push({
            ceId: event.ce_id,
            attMettingTitle: event.ce_title || "Untitled Meeting",
            attMeetingDate: event.ce_date || "N/A",
            attMeetingDescription: event.ce_description || "No description",
            isArchived: true,
            sheets,
          });
        }
      });
    }

    return data;
  }, [councilEvents, attendanceSheets, activeTab]);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value) || 10;
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setCurrentPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "active" | "archive");
    setCurrentPage(1);
  };

  // Create filter options
  const filterOptions = [
    { id: "all", name: "All Years" },
    ...availableYears.map((year) => ({
      id: year.toString(),
      name: year.toString(),
    })),
  ];

  if (error) {
    return (
      <div className="w-full h-full p-4 text-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  return (
    <div className="w-full h-full p-4">
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Attendance Record
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          View and manage the signed attendance sheets.
        </p>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" />

      <div className="w-full mb-4">
        <div className="flex flex-col md:flex-row justify-start gap-3">
          <div className="relative w-full md:w-auto">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search"
              className="pl-10 bg-white w-full"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <SelectLayout
            className="bg-white w-full md:w-auto"
            label=""
            placeholder="Filter"
            options={filterOptions}
            value={filter}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      <div className="w-full bg-white border border-none">
        <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-4">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-8"
              value={pageSize}
              onChange={handlePageSizeChange}
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archive">
                <div className="flex items-center gap-2">
                  <Archive size={16} /> Archive
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
            <Spinner size="lg" />
            Loading attendance records...
          </div>
        ) : (
          <>
            <Tabs value={activeTab}>
              <TabsContent value="active">
                <DataTable columns={columns} data={tableData} />
              </TabsContent>
              <TabsContent value="archive">
                <HistoryTable columns={columns} data={tableData} />
              </TabsContent>
            </Tabs>

            <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
              <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                Showing{" "}
                {tableData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
                {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
                rows
              </p>

              {totalPages > 1 && (
                <div className="w-full sm:w-auto flex justify-center">
                  <PaginationLayout
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default AttendancePage;