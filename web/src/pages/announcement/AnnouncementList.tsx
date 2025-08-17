import { useState } from "react";
import { Link } from "react-router-dom";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Plus, Search, FileText, Eye, Trash, Filter } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Input } from "@/components/ui/input";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDeleteAnnouncement } from "./queries/announcementDeleteQueries";
import { useGetAnnouncement } from "./queries/announcementFetchQueries";
import { Button } from "@/components/ui/button/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";

function AnnouncementTracker() {
  const [error] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<string>("");

  const { data: announcements = [], isLoading } = useGetAnnouncement();
  const { mutate: deleteEntry } = useDeleteAnnouncement();

  const handleDelete = async (ann_id: number) => {
    deleteEntry(ann_id);
  };

  // ✅ Date formatter (Asia/Manila)
  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

// ✅ Apply search ONLY on announcement title
let filteredData = announcements.filter((announcement) => {
  return announcement.ann_title
    ?.toLowerCase()
    .includes(searchQuery.toLowerCase());
});
  // ✅ Apply filters
  if (filter === "dateRecent") {
    filteredData = [...filteredData].sort(
      (a, b) => new Date(b.ann_created_at).getTime() - new Date(a.ann_created_at).getTime()
    );
  } else if (filter === "a-z") {
    filteredData = [...filteredData].sort((a, b) => a.ann_title.localeCompare(b.ann_title));
  } else if (filter === "z-a") {
    filteredData = [...filteredData].sort((a, b) => b.ann_title.localeCompare(a.ann_title));
  } else if (filter === "toSms") {
    filteredData = filteredData.filter((a) => a.ann_to_sms === true);
  } else if (filter === "toEmail") {
    filteredData = filteredData.filter((a) => a.ann_to_email === true);
  }

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
        <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-80 opacity-30" />
          <Skeleton className="h-10 w-24 opacity-30" />
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full opacity-30" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <TooltipProvider>
      <div className="w-full h-full p-6">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Announcement Records</h1>
          <p className="text-xs sm:text-sm text-darkGray">Manage and view announcement records</p>
        </div>
        <hr className="border-gray mb-6 sm:mb-8" />

       

<div className="flex justify-between items-center mb-6 w-full">
  <div className="flex items-center gap-3 w-full max-w-xl">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
      <Input
        placeholder="Search announcements..."
        className="pl-10 bg-white w-full"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
      />
    </div>


    <Select
      value={filter}
      onValueChange={(val) => {
        setFilter(val);
        setCurrentPage(1);
      }}
    >
      <SelectTrigger className="w-[180px]">
        <Filter className="mr-2 h-4 w-4 text-gray-500" /> 
        <SelectValue placeholder="Filter by..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="dateRecent">Date Created</SelectItem>
        <SelectItem value="toSms">To SMS</SelectItem>
        <SelectItem value="toEmail">To Email</SelectItem>
        <SelectItem value="a-z">A–Z</SelectItem>
        <SelectItem value="z-a">Z–A</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <Link to="/announcement/create">
    <Button>
      <Plus size={16} /> Add Announcement
    </Button>
  </Link>
</div>

        {paginatedData.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
            <p className="text-gray-500">
              {searchQuery ? "Try adjusting your search terms." : "Get started by creating your first announcement."}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-6">
              {paginatedData.map((announcement) => (
                <Card key={announcement.ann_id} className="w-full shadow-md">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-4">
                      {/* LEFT CONTENT */}
                      <div className="flex-1 min-w-[250px]">
                        <h2 className="text-xl font-bold">{announcement.ann_title}</h2>
                        <p className="text-sm text-gray-500 mb-2">
                          Posted on {formatDate(announcement.ann_created_at)}
                        </p>
                        <p className="whitespace-pre-wrap text-gray-800 break-words">
                          {announcement.ann_details}
                        </p>
                      </div>

                      {/* RIGHT PANEL (✅ Always show Yes/No) */}
                      <div className="w-full sm:w-1/4 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-4 text-sm text-gray-700">
                        <p><strong>Start At:</strong><br />{formatDate(announcement.ann_start_at)}</p>
                        <p className="mt-2"><strong>End At:</strong><br />{formatDate(announcement.ann_end_at)}</p>
                        <p className="mt-2"><strong>Event Start:</strong><br />{formatDate(announcement.ann_event_start)}</p>
                        <p className="mt-2"><strong>Event End:</strong><br />{formatDate(announcement.ann_event_end)}</p>
                        <p className="mt-2"><strong>To SMS:</strong> {announcement.ann_to_sms ? "Yes" : "No"}</p>
                        <p className="mt-2"><strong>To Email:</strong> {announcement.ann_to_email ? "Yes" : "No"}</p>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Link to={`/announcement/${announcement.ann_id}`} className="flex-1">
                        <TooltipLayout
                          trigger={
                            <div className="w-full bg-white hover:bg-gray-50 border text-black px-3 py-2 rounded cursor-pointer flex items-center justify-center gap-2 text-sm">
                              <Eye size={14} />
                              View
                            </div>
                          }
                          content="View announcement details"
                        />
                      </Link>

                      <TooltipLayout
                        trigger={
                          <ConfirmationModal
                            trigger={
                              <div className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded cursor-pointer flex items-center justify-center">
                                <Trash size={14} />
                              </div>
                            }
                            title="Confirm Delete"
                            description="Are you sure you want to delete this announcement?"
                            actionLabel="Confirm"
                            onClick={() => announcement.ann_id !== undefined && handleDelete(announcement.ann_id)}
                          />
                        }
                        content="Delete announcement"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm text-gray-600">Show</p>
                  <Input
                    type="number"
                    className="w-16 h-8 text-center"
                    value={pageSize}
                    onChange={(e) => {
                      const value = +e.target.value;
                      setPageSize(value >= 1 ? value : 1);
                      setCurrentPage(1);
                    }}
                  />
                  <p className="text-xs sm:text-sm text-gray-600">per page</p>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredData.length)} of{" "}
                  {filteredData.length} announcements
                </p>
              </div>

              {filteredData.length > pageSize && (
                <PaginationLayout
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}

export default AnnouncementTracker;
