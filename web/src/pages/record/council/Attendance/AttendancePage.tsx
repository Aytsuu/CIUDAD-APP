import { useState, useMemo, useEffect } from "react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Eye, Search } from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import { AttendanceDocumentCard } from "./AttendanceSuppDocsModal";

// Updated ArchiveTabActions
const ArchiveTabActions = ({
  row,
  onView,
}: {
  row: { original: AttendanceRecord };
  onView: (record: AttendanceRecord) => void;
}) => {
  return (
    <div className="flex justify-center gap-2">
      <TooltipLayout
        trigger={
          <div 
            className="w-[50px] h-[35px] bg-white border border-gray flex justify-center items-center rounded-[5px] shadow-sm cursor-pointer hover:bg-[#f3f2f2]"
            onClick={() => onView(row.original)}
          >
            <Eye size={16} className="text-black" />
          </div>
        }
        content="View"
      />
    </div>
  );
};

// Updated columns
export const columns = (onViewRecord: (record: AttendanceRecord) => void): ColumnDef<AttendanceRecord>[] => [
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
      if (row.original.isArchived) {
        return (
          <ArchiveTabActions
            row={row}
            onView={onViewRecord}
          />
        );
      }

      return (
        <div className="flex justify-center gap-1">
          <TooltipLayout
            trigger={
              <div 
                className="w-[50px] h-[35px] bg-white border border-gray flex justify-center items-center rounded-[5px] shadow-sm cursor-pointer hover:bg-[#f3f2f2]"
                onClick={() => onViewRecord(row.original)}
              >
                <Eye size={16} className="text-black" />
              </div>
            }
            content="View"
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 150,
  },
];

// Attendance Sheets Dialog Component
function AttendanceSheetsDialog({
  attendanceRecord,
  isOpen,
  onOpenChange,
  viewMode,
}: {
  attendanceRecord: AttendanceRecord | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  viewMode: "active" | "archive";
}) {
  const [filesTab, setFilesTab] = useState<"active" | "archived">(viewMode === "archive" ? "archived" : "active");
  const { data: attendanceSheets = [], isLoading: isSheetsLoading, refetch: refetchSheets } = useGetAttendanceSheets();
  const archiveSheet = useArchiveAttendanceSheet();
  const restoreSheet = useRestoreAttendanceSheet();
  const deleteSheet = useDeleteAttendanceSheet();
  const { refetch: refetchEvents } = useGetCouncilEvents();

  if (!attendanceRecord) return null;

  const sheets = attendanceSheets.filter(
    (sheet) => sheet.ce_id === attendanceRecord.ceId
  );

  const activeSheets = sheets.filter(sheet => !sheet.att_is_archive);
  const archivedSheets = sheets.filter(sheet => sheet.att_is_archive);

  const handleArchive = (attId: any) => {
    archiveSheet.mutate(attId, {
      onSuccess: () => {
        refetchSheets();
        refetchEvents();
      },
    });
  };

  const handleRestore = (attId: any) => {
    restoreSheet.mutate(attId, {
      onSuccess: () => {
        refetchSheets();
        refetchEvents();
      },
    });
  };

  const handleDelete = (attId: any) => {
    deleteSheet.mutate(attId, {
      onSuccess: () => {
        refetchSheets();
        refetchEvents();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader className="sticky top-0 z-10 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>
              Attendance Sheets - {attendanceRecord.attMettingTitle}
            </DialogTitle>
          </div>
        </DialogHeader>

        <Tabs
          value={filesTab}
          onValueChange={(value) => setFilesTab(value as "active" | "archived")}
          className="w-full flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {isSheetsLoading ? (
                <div className="col-span-full flex items-center justify-center py-16 gap-2 text-gray-500">
                  <Spinner size="lg" />
                  Loading attendance sheets...
                </div>
              ) : activeSheets.length > 0 ? (
                activeSheets.map((sheet, index) => (
                  <AttendanceDocumentCard
                    key={sheet.att_id}
                    doc={sheet}
                    index={index}
                    showActions={viewMode === "active"}
                    onArchive={() => handleArchive(sheet.att_id)}
                    isArchived={false}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No active attendance sheets found.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="archived" className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {isSheetsLoading ? (
                <div className="col-span-full flex items-center justify-center py-16 gap-2 text-gray-500">
                  <Spinner size="lg" />
                  Loading archived sheets...
                </div>
              ) : archivedSheets.length > 0 ? (
                archivedSheets.map((sheet, index) => (
                  <AttendanceDocumentCard
                    key={sheet.att_id}
                    doc={sheet}
                    index={index}
                    showActions={true}
                    onRestore={() => handleRestore(sheet.att_id)}
                    onDelete={() => handleDelete(sheet.att_id)}
                    isArchived={true}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No archived attendance sheets found.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function AttendancePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filter, setFilter] = useState<string>("all");
  const [activeTab] = useState<"active" | "archive">("active");
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const handleViewRecord = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setIsDialogOpen(true);
  };

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
                <DataTable columns={columns(handleViewRecord)} data={tableData} />
              </TabsContent>
              <TabsContent value="archive">
                <HistoryTable columns={columns(handleViewRecord)} data={tableData} />
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

      <AttendanceSheetsDialog
        attendanceRecord={selectedRecord}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        viewMode={activeTab}
      />
    </div>
  );
}

export default AttendancePage;