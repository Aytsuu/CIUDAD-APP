import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Plus, Search, FileText, Pen, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDeleteAnnouncement } from "./queries/announcementDeleteQueries";
import { useGetAnnouncementList } from "./queries/announcementFetchQueries";
import { Button } from "@/components/ui/button/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { useAuth } from "@/context/AuthContext";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { useDebounce } from "@/hooks/use-debounce";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { formatDate, formatTimeAgo } from "@/helpers/dateHelper";
import { Badge } from "@/components/ui/badge";
import { MediaGallery } from "@/components/ui/media-gallery";
import { capitalize } from "@/helpers/capitalize";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

function AnnouncementTracker() {
  const { user } = useAuth();
  const staff_id = user?.staff?.staff_id;
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, _setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<string>("");
  const [sort, setSort] = React.useState<string>("");
  const [recipient, setRecipient] = React.useState<string>("");
  const [isCreated, setIsCreated] = React.useState<boolean | null>(null);
  const [selected, setSelected] = React.useState<Record<string, any> | null>(
    null
  );
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const debouncedPageSize = useDebounce(pageSize, 100);
  const {
    data: announcements,
    isLoading,
    isFetching,
  } = useGetAnnouncementList(
    currentPage,
    debouncedPageSize,
    debouncedSearch,
    isCreated ? staff_id : null,
    sort,
    filter,
    recipient
  );

  const data = announcements?.results || [];
  const totalCount = announcements?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const { mutateAsync: deleteEntry } = useDeleteAnnouncement();

  React.useEffect(() => {
    if (isFetching) setSelected(null);
  }, [isFetching]);

  const handleFormatDate = (posted: string) => {
      const timeAgo = formatTimeAgo(posted);
      const raw = timeAgo?.split(" ")[0];
      const isPastWeek =
        parseInt(raw) > 7 && raw.split("")[raw.length - 1] == "d";
  
      return isPastWeek ? formatDate(posted, "short") : timeAgo;
    };
  


  return (
    <MainLayoutComponent
      title="Announcements "
      description="Manage and view announcement records"
    >
      <div className="w-full h-full">
        {/* Wrapped search bar, filter, add announcement, and show per page together in white background */}
        <div className="bg-white w-full h-[750px] rounded-lg border border-gray-200 shadow-sm mb-6 overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-2/3 p-5">
              <div className="relative w-full max-w-md">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search announcements..."
                  className="pl-11 bg-white border-gray-200 shadow-sm w-full focus:ring-2 focus:ring-blue-500/20"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex justify-center gap-2 lg:justify-end p-5">
              <Select
                value={isCreated ? "created" : isCreated == null ? "" : "all"}
                onValueChange={(val) => {
                  val == "all" ? setIsCreated(false) : setIsCreated(true);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[150px] bg-white border-gray-200 shadow-sm">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sort}
                onValueChange={(val) => {
                  sort != val && setSort(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[150px] bg-white border-gray-200 shadow-sm">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="A - Z">A - Z</SelectItem>
                  <SelectItem value="Z - A">Z - A</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filter}
                onValueChange={(val) => {
                  filter != val && setFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[150px] bg-white border-gray-200 shadow-sm">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={recipient}
                onValueChange={(val) => {
                  recipient != val && setRecipient(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[150px] bg-white border-gray-200 shadow-sm">
                  <SelectValue placeholder="Recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="staff">Staff Only</SelectItem>
                  <SelectItem value="resident">Resident Only</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>

              <Link to="/announcement/create" className="w-full lg:w-auto">
                <Button>
                  <Plus size={18} className="mr-2" /> Add Announcement
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center border-b py-4 px-5">
            <p className="text-sm text-gray-600 mb-2 sm:mb-0">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              -{" "}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{" "}
              of <span className="font-medium">{totalCount}</span> announcements
            </p>

            {totalPages > 0 && (
              <PaginationLayout
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>

          {isLoading && (
            <div className=" mx-auto flex flex-col justify-center items-center gap-2 py-16">
              <Spinner size="lg"/>
              <span className="ml-2 text-gray-600">Loading announcements...</span>
            </div>
          )}

          {!isLoading && data.length == 0 && (
            <div className="text-center py-16">
              <FileText className="mx-auto h-16 w-16 text-gray-300 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No announcements found
              </h3>
              <p className="text-gray-500 text-base">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : "Get started by creating your first announcement."}
              </p>
            </div>
          )}

          {!isLoading && data.length > 0 && (
            <div className="flex h-full">
              <ScrollArea className="relative w-full max-w-sm border-r">
                <div className="w-full flex flex-col pb-16 p-4 gap-4">
                  {data.map((announcement: any) => (
                    <div className="flex items-center gap-6">
                      <Button
                        variant={"link"}
                        className={`justify-start ${
                          announcement.ann_id == selected?.ann_id
                            ? "text-primary cursor-default hover:no-underline"
                            : "text-gray-700 hover:text-primary"
                        }`}
                        onClick={() => setSelected(announcement)}
                      >
                        {announcement.ann_title}
                      </Button>
                      {announcement.ann_type == "event" && (
                        <Badge className="rounded-full text-green-700 bg-green-100 border-green-300 hover:bg-green-100">
                          Event
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
                {isFetching && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-start pt-40 justify-center z-10">
                    <div className="flex flex-col items-center gap-4">
                      <Spinner size="lg" />
                      <p className="text-center text-sm">Retrieving data...</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
              <ScrollArea className="relative w-full ">
                {/* Display full info of selected announcement */}
                {selected && (
                  <div className="w-full p-8 pb-44">
                    <div className="flex flex-col mb-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-end gap-4">
                          <Label className="text-xl text-primary">
                            {capitalize(selected.staff.name)}
                          </Label>
                          <p className="text-sm text-gray-400">
                            {handleFormatDate(selected.ann_start_at)}
                          </p>
                        </div>
                        {selected.staff.id == staff_id && (
                          <div className="flex items-center justify-center">
                            <Button variant={"outline"} className=" border-none shadow-none text-gray-700 hover:text-gray-700"
                              onClick={() => {
                                navigate('create', {
                                  state: {
                                    params: {
                                      data: selected
                                    }
                                  }
                                })
                              }}
                            >
                              <Pen />
                              Edit
                            </Button>
                            <Separator orientation="vertical" className="data-[orientation=vertical]:h-4 bg-gray-300"/>
                            <ConfirmationModal 
                              trigger={
                                <Button variant={"outline"} className=" border-none shadow-none text-red-500 hover:text-red-500">
                                  <Trash />
                                  Remove
                                </Button>
                              }
                              title="Confirm Removal"
                              description="Are you sure you want to remove this announcement? You will not be able to undo this action."
                              actionLabel="Remove"
                              variant="destructive"
                              onClick={async () => {
                                try {
                                  setIsDeleting(true);
                                  await deleteEntry(selected.ann_id)
                                } finally {
                                  setIsDeleting(false);
                                } 
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-600">
                        {selected.staff.position}
                      </p>
                    </div>
                    <Label className="text-md mb-4">{selected.ann_title}</Label>
                    <p className="mb-6">{selected.ann_details}</p>
                    <MediaGallery
                      mediaFiles={selected.files}
                      emptyState={<div></div>}
                    />
                  </div>
                )}

                {isDeleting && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-start pt-40 justify-center z-10">
                    <div className="flex flex-col items-center gap-4">
                      <Spinner size="lg" />
                      <p className="text-center text-sm">Deleting announcement...</p>
                    </div>
                  </div>
                )}

                {!selected && (
                  <div className="absolute bg-white/50 backdrop-blur-sm top-1/3 left-1/2 -translate-x-1/2 z-10">
                    <p className="text-lg text-gray-500">
                      Select an announcement
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </MainLayoutComponent>
  );
}

export default AnnouncementTracker;
