import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Plus, Search, FileText, Pen, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDeleteAnnouncement } from "./queries/announcementDeleteQueries";
import { useGetAnnouncementList } from "./queries/announcementFetchQueries";
import { Button } from "@/components/ui/button/button";
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
import { SelectLayout } from "@/components/ui/select/select-layout";

function AnnouncementTracker() {
  const { user } = useAuth();
  const staff_id = user?.staff?.staff_id;
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, _setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = React.useState<string>("newest");
  const [recipient, setRecipient] = React.useState<string>("all");
  const [isCreated, setIsCreated] = React.useState<boolean>(false);
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
        <div className="bg-white w-full h-[750px] rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-col overflow-hidden">
          {/* Header Section - Fixed at top */}
          <div className="flex-shrink-0">
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

              <div className="w-full lg:w-1/2 flex justify-center gap-3 lg:justify-end p-5">
                <SelectLayout
                  withReset={false}
                  value={isCreated ? "created" : isCreated == null ? "" : "all"}
                  valueLabel="View"
                  className="gap-4 focus:ring-0"
                  onChange={(val) => {
                    val == "all" ? setIsCreated(false) : setIsCreated(true);
                    setCurrentPage(1);
                  }}
                  placeholder=""
                  options={[
                    { id: "all", name: "All" },
                    { id: "created", name: "Created" },
                  ]}
                />

                <SelectLayout
                  withReset={false}
                  value={sort}
                  valueLabel="Sort"
                  className="gap-4 focus:ring-0"
                  onChange={(val) => {
                    setSort(val);
                    setCurrentPage(1);
                  }}
                  placeholder=""
                  options={[
                    { id: "newest", name: "Newest" },
                    { id: "oldest", name: "Oldest" },
                    { id: "A - Z", name: "A - Z" },
                    { id: "Z - A", name: "Z - A" },
                  ]}
                />

                <SelectLayout
                  withReset={false}
                  value={filter}
                  valueLabel="Type"
                  className="gap-4 focus:ring-0"
                  onChange={(val) => {
                    setFilter(val);
                    setCurrentPage(1);
                  }}
                  placeholder=""
                  options={[
                    { id: "all", name: "All" },
                    { id: "general", name: "General" },
                    { id: "event", name: "Event" },
                  ]}
                />

                <SelectLayout
                  withReset={false}
                  value={recipient}
                  valueLabel="Recipient"
                  className="gap-4 focus:ring-0"
                  onChange={(val) => {
                    setRecipient(val);
                    setCurrentPage(1);
                  }}
                  placeholder=""
                  options={[
                    { id: "all", name: "All" },
                    { id: "staff", name: "Staff Only" },
                    { id: "resident", name: "Resident Only" },
                    { id: "public", name: "Public" },
                  ]}
                />
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
                of <span className="font-medium">{totalCount}</span>{" "}
                announcements
              </p>

              {totalPages > 0 && (
                <PaginationLayout
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </div>

          {/* Content Section - Scrollable */}
          <div className="flex-1 min-h-0">
            {isLoading && (
              <div className="h-full flex flex-col justify-center items-center gap-2">
                <Spinner size="lg" />
                <span className="ml-2 text-gray-600">
                  Loading announcements...
                </span>
              </div>
            )}

            {!isLoading && data.length == 0 && (
              <div className="h-full flex flex-col justify-center items-center">
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
                <ScrollArea className="relative w-full max-w-sm border-r h-full">
                  <div className="w-full flex flex-col p-4 gap-4">
                    {data.map((announcement: any) => (
                      <div
                        key={announcement.ann_id}
                        className="flex items-center gap-6"
                      >
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
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="flex flex-col items-center gap-4">
                        <Spinner size="lg" />
                        <p className="text-center text-sm">
                          Retrieving data...
                        </p>
                      </div>
                    </div>
                  )}
                </ScrollArea>

                <ScrollArea className="relative w-full h-full">
                  {selected && (
                    <div className="w-full p-8">
                      <div className="flex flex-col mb-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-end gap-4">
                            <Label className="text-lg text-primary">
                              {capitalize(selected.staff.name)}
                            </Label>
                            <p className="text-sm text-gray-400 mb-1">
                              {handleFormatDate(selected.ann_start_at)}
                            </p>
                          </div>
                          {selected.staff.id == staff_id && (
                            <div className="flex items-center justify-center">
                              <Button
                                variant={"outline"}
                                className="border-none shadow-none text-gray-700 hover:text-gray-700"
                                onClick={() => {
                                  navigate("create", {
                                    state: {
                                      params: {
                                        data: selected,
                                      },
                                    },
                                  });
                                }}
                              >
                                <Pen />
                                Edit
                              </Button>
                              <Separator
                                orientation="vertical"
                                className="data-[orientation=vertical]:h-4 bg-gray-300"
                              />
                              <ConfirmationModal
                                trigger={
                                  <Button
                                    variant={"outline"}
                                    className="border-none shadow-none text-red-500 hover:text-red-500"
                                  >
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
                                    await deleteEntry(selected.ann_id);
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
                      <Label className="text-md mb-4">
                        {selected.ann_title}
                      </Label>
                      <p className="mb-6">{selected.ann_details}</p>
                      <MediaGallery
                        mediaFiles={selected.files}
                        emptyState={<div></div>}
                      />
                    </div>
                  )}

                  {isDeleting && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="flex flex-col items-center gap-4">
                        <Spinner size="lg" />
                        <p className="text-center text-sm">
                          Deleting announcement...
                        </p>
                      </div>
                    </div>
                  )}

                  {!selected && (
                    <div className="absolute inset-0 flex items-center justify-center">
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
      </div>
    </MainLayoutComponent>
  );
}

export default AnnouncementTracker;
