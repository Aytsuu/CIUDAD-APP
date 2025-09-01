import { useState, useMemo } from "react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Eye, Stamp, Search, Trash2, Archive, ArchiveRestore } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import Attendees from "./Attendees";
import {useGetCouncilEvents, useGetAttendanceSheets} from "../Calendar/queries/councilEventfetchqueries";
import { CouncilEvent, AttendanceSheet, AttendanceRecord } from "../Calendar/councilEventTypes";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HistoryTable } from "@/components/ui/table/history-table";

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
                        <div className="relative flex flex-row items-end gap-2">
                          <div className="flex-1">
                            <img
                              src={sheet.att_file_url}
                              alt={`Archived Event File ${index + 1}`}
                              className="w-full h-auto max-h-[calc(100vh-200px)] object-contain"
                              onError={(e) => (e.currentTarget.src = "/placeholder-image.png")}
                            />
                          </div>
                          <TooltipLayout
                            trigger={
                              <ConfirmationModal
                                trigger={
                                  <div className="w-6 h-6 cursor-pointer text-gray-500 hover:text-green-500 transition-colors">
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
                                  <div className="w-6 h-6 cursor-pointer text-gray-500 hover:text-red-500 transition-colors">
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
                          No file uploaded for Archived Attendance Sheet #{index + 1}
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
        {row.getValue("attMeetingDate")}
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
      const displayText = lines.length > 3 ? `${lines.slice(0, 3).join("\n")}\n...` : title;
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
      const displayText = lines.length > 3 ? `${lines.slice(0, 3).join("\n")}\n...` : desc;
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
      const { data: attendanceSheet, refetch: refetchSheets } = useGetAttendanceSheets();
      const { refetch: refetchEvents } = useGetCouncilEvents();
      const sheets = attendanceSheet?.filter(
        (sheet) => sheet.ce_id === ceId && !sheet.att_is_archive
      ) || [];
      const archiveSheet = useArchiveAttendanceSheet();
      const [isAttendeesDialogOpen, setIsAttendeesDialogOpen] = useState(false);
      const [isEditMode, setIsEditMode] = useState(false);

      const handleSaveSuccess = () => {
        setIsEditMode(false);
      };

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
                                      <div className="w-6 h-6 cursor-pointer text-gray-500 hover:text-yellow-500 transition-colors">
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
                      <div>No attendance sheets have been uploaded for this meeting yet.</div>
                    )}
                  </div>
                }
              />
            }
            content="View"
          />
          <TooltipLayout
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
                mainContent={
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
          />
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
  const [filter, setFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active");
  
  const { data: councilEvents = [], isLoading, error } = useGetCouncilEvents();
  const { data: attendanceSheets = [] } = useGetAttendanceSheets();

  const tableData = useMemo(() => {
    const eventMap = new Map<number, CouncilEvent>();
    councilEvents.forEach(event => {
      eventMap.set(event.ce_id, event);
    });

    const data: AttendanceRecord[] = [];

    if (activeTab === "active") {
      councilEvents
        .filter(event => event.ce_type === "meeting" && !event.ce_is_archive)
        .forEach(event => {
          const nonArchivedSheets = attendanceSheets.filter(
            sheet => sheet.ce_id === event.ce_id && !sheet.att_is_archive
          );
          data.push({
            ceId: event.ce_id,
            attMettingTitle: event.ce_title || "Untitled Meeting",
            attMeetingDate: event.ce_date || "N/A",
            attMeetingDescription: event.ce_description || "No description",
            isArchived: false,
            sheets: nonArchivedSheets
          });
        });
    } else {
      // Group archived sheets by ce_id to avoid duplicate meetings
      const archivedSheetsByEvent = new Map<number, AttendanceSheet[]>();
      attendanceSheets
        .filter(sheet => sheet.att_is_archive)
        .forEach(sheet => {
          const sheets = archivedSheetsByEvent.get(sheet.ce_id) || [];
          sheets.push(sheet);
          archivedSheetsByEvent.set(sheet.ce_id, sheets);
        });

      archivedSheetsByEvent.forEach((sheets, ce_id) => {
        const event = eventMap.get(ce_id);
        if (event && event.ce_type === "meeting") {
          data.push({
            ceId: event.ce_id,
            attMettingTitle: event.ce_title || "Untitled Meeting",
            attMeetingDate: event.ce_date || "N/A",
            attMeetingDescription: event.ce_description || "No description",
            isArchived: true,
            sheets
          });
        }
      });
    }

    return data;
  }, [councilEvents, attendanceSheets, activeTab]);

  const filteredData = tableData.filter(record => {
    const matchesSearch = searchTerm === "" || 
      [record.attMeetingDate, record.attMettingTitle, record.attMeetingDescription]
        .some(field => field.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesYear = filter === "all" || 
      record.attMeetingDate === "N/A" ||
      new Date(record.attMeetingDate).getFullYear().toString() === filter;
      
    return matchesSearch && matchesYear;
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value) || 10;
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const years = [
    ...new Set(
      tableData.map((record) =>
        record.attMeetingDate !== "N/A" ? new Date(record.attMeetingDate).getFullYear().toString() : null
      ).filter((year): year is string => year !== null)
    ),
  ].sort((a, b) => parseInt(b) - parseInt(a));
  const filterOptions = [
    { id: "all", name: "All" },
    ...years.map((year) => ({ id: year, name: year })),
  ];

  if (isLoading) {
    return (
      <div className="w-full h-full p-4">
        <div className="flex-col items-center mb-4">
          <Skeleton className="h-8 w-1/4 mb-2 opacity-30" />
          <Skeleton className="h-4 w-1/3 opacity-30" />
        </div>
        <Skeleton className="h-[1px] w-full mb-6 sm:mb-10 opacity-30" />

        <div className="w-full mb-4">
          <div className="flex flex-col md:flex-row justify-start gap-3">
            <Skeleton className="h-10 w-full md:w-[400px] opacity-30" />
            <Skeleton className="h-10 w-[120px] opacity-30" />
          </div>
        </div>

        <div className="w-full bg-white border border-none">
          <div className="flex gap-x-2 items-center p-4">
            <Skeleton className="h-4 w-10 opacity-30" />
            <Skeleton className="h-8 w-14 opacity-30" />
            <Skeleton className="h-4 w-16 opacity-30" />
          </div>

          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-6 w-24 opacity-30" />
                <Skeleton className="h-6 w-48 opacity-30" />
                <Skeleton className="h-6 w-72 opacity-30" />
                <Skeleton className="h-6 w-24 opacity-30" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <Skeleton className="h-4 w-48 opacity-30" />
          <Skeleton className="h-8 w-64 opacity-30" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full p-4 text-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4">
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Attendance Record
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Mark and view attendance information
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
              className="pl-10 bg-white w-full md:w-[400px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <SelectLayout
            className="bg-white"
            label=""
            placeholder="Filter"
            options={filterOptions}
            value={filter}
            onChange={(value) => setFilter(value)}
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
              defaultValue="10"
              onChange={handlePageSizeChange}
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "active" | "archive")}>
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

        <Tabs value={activeTab}>
          <TabsContent value="active">
            <DataTable
              columns={columns}
              data={paginatedData}
            />
          </TabsContent>
          <TabsContent value="archive">
            <HistoryTable
              columns={columns}
              data={paginatedData}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
          {filteredData.length} rows
        </p>

        {filteredData.length > 0 && (
          <div className="w-full sm:w-auto flex justify-center">
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendancePage;