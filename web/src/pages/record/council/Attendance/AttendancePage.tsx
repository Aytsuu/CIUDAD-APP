import { useState } from "react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Eye, Stamp, Search, Trash2 } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout.tsx";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useDeleteAttendanceSheet } from "../Calendar/queries/delqueries";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Skeleton } from "@/components/ui/skeleton";
import Attendees from "./Attendees";
import { useGetCouncilEvents, useGetAttendanceSheets, Attendance } from "../Calendar/queries/fetchqueries";

export const columns: ColumnDef<Attendance>[] = [
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
      const lines = title.split('\n');
      const displayText = lines.length > 3 
        ? `${lines.slice(0, 3).join('\n')}\n...` 
        : title;
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
      const lines = desc.split('\n');
      const displayText = lines.length > 3 
        ? `${lines.slice(0, 3).join('\n')}\n...` 
        : desc;
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
      const { data: attendanceSheet } = useGetAttendanceSheets();
      const sheets = attendanceSheet?.filter(
        sheet => sheet.ce_id === ceId && !sheet.att_is_archive
      ) || [];
      const deleteAttendanceSheet = useDeleteAttendanceSheet();

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
                          {sheet.file_url ? (
                            <div className="flex flex-col items-start">
                              <div className="relative w-full">
                                <img
                                  src={sheet.file_url}
                                  alt={`Event File ${index + 1}`}
                                  className="w-full h-auto max-h-[calc(100vh-200px)] object-contain"
                                />
                                <TooltipLayout
                                  trigger={
                                    <ConfirmationModal
                                      trigger={
                                        <div
                                          className="absolute top-2 right-2 w-6 h-6 cursor-pointer text-gray-500 hover:text-red-500 transition-colors"
                                        >
                                          <Trash2 size={16} />
                                        </div>
                                      }
                                      title="Confirm Deletion"
                                      description="Are you sure you want to delete this attendance sheet? This action cannot be undone."
                                      actionLabel="Delete"
                                      onClick={() => deleteAttendanceSheet.mutate(sheet.att_id)}
                                    />
                                  }
                                  content="Delete this attendance sheet"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              No file uploaded for Attendance Sheet #{index + 1}.
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
                title="Mark Attendance"
                description="Confirm participants attendance."
                mainContent={<Attendees />}
              />
            }
            content="Mark"
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 100,
  },
];

function AttendancePage() {
  const { data: councilEvents = [], isLoading, error } = useGetCouncilEvents();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const data: Attendance[] = councilEvents
    ?.filter(event => event.ce_type === "meeting")
    .map(event => ({
      ceId: event.ce_id,
      attMettingTitle: event.ce_title,
      attMeetingDate: event.ce_date,
      attMeetingDescription: event.ce_description,
      attAreaOfFocus: [event.ce_type],
      isArchived: event.ce_is_archive,
    }))
    .filter(event => !event.isArchived) || [];

  const years = [...new Set(
    data.map(record => new Date(record.attMeetingDate).getFullYear().toString())
  )].sort((a, b) => parseInt(b) - parseInt(a));
  const filterOptions = [
    { id: "all", name: "All" },
    ...years.map(year => ({ id: year, name: year })),
  ];

  const [filter, setFilter] = useState<string>("all");

  const filteredData = data
    .filter(record => {
      const matchesSearch = searchTerm === ""
        ? true
        : [
            record.attMeetingDate.toLowerCase(),
            record.attMettingTitle.toLowerCase(),
            record.attMeetingDescription.toLowerCase(),
          ].some(field => field.includes(searchTerm.toLowerCase()));
      const matchesYear = filter === "all"
        ? true
        : new Date(record.attMeetingDate).getFullYear().toString() === filter;
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
        <div className="flex gap-x-2 items-center p-4">
          <p className="text-xs sm:text-sm">Show</p>
          <Input
            type="number"
            className="w-14 h-8"
            defaultValue="10"
            onChange={handlePageSizeChange}
          />
          <p className="text-xs sm:text-sm">Entries</p>
        </div>

        <DataTable columns={columns} data={paginatedData} />
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