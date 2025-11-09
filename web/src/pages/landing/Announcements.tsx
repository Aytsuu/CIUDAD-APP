import React, { useState } from "react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Search, Megaphone, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { useDebounce } from "@/hooks/use-debounce";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { formatDate, formatTimeAgo } from "@/helpers/dateHelper";
import { Badge } from "@/components/ui/badge";
import { MediaGallery } from "@/components/ui/media-gallery";
import { Spinner } from "@/components/ui/spinner";
import { useGetAnnouncementList } from "../announcement/queries/announcementFetchQueries";

function AnnouncementTracker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, _setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<string>("");
  const [sort, setSort] = React.useState<string>("");
  const [selected, setSelected] = React.useState<Record<string, any> | null>(
    null
  );

  const [isHeaderVisible, setIsHeaderVisible] = React.useState<boolean>(false);
  const [isMainContentVisibile, setIsMainContentVisible] =
    React.useState<boolean>(false);
  const headerRef = React.useRef<HTMLDivElement | null>(null);
  const mainContentRef = React.useRef<HTMLDivElement | null>(null);

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
    null,
    sort,
    filter,
    "public"
  );

  const data = announcements?.results || [];
  const totalCount = announcements?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

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

  React.useEffect(() => {
    const headerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsHeaderVisible(true);
        }
      });
    });

    const mainContentObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsMainContentVisible(true);
        }
      });
    });

    if (headerRef.current) headerObserver.observe(headerRef.current);
    if (mainContentRef.current)
      mainContentObserver.observe(mainContentRef.current);

    return () => {
      headerObserver.disconnect(), mainContentObserver.disconnect();
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-white py-16 overflow-hidden">
      <div className="container mx-auto px-8">
        <div
          ref={headerRef}
          className={`w-full lg:w-4/5 mx-auto text-darkBlue1 mb-8 gap-3 transition-all duration-700 ${
            isHeaderVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <p className="text-3xl font-bold">Public Announcements</p>
          <p className="text-base text-darkBlue2">
            Stay informed with the latest updates, activities, and public
            notices from Barangay San Roque.
          </p>
        </div>

        <div
          ref={mainContentRef}
          className={`w-full lg:w-4/5 mx-auto rounded-lg border ${
            totalPages > 0 ? "h-[750px]" : "h-[300px]"
          } border-gray-200 shadow-md mb-6 overflow-hidden transition-all duration-700 ${
            isMainContentVisibile
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          {totalPages > 0 && (
            <>
              <div className="flex flex-col gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full lg:w-2/3 p-5">
                  <div className="relative w-full lg:max-w-md">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <Input
                      placeholder="Search"
                      className="pl-11 bg-white border-gray-200 shadow-sm w-full focus:ring-2 focus:ring-blue-500/20"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  <Select
                    value={sort}
                    onValueChange={(val) => {
                      sort != val && setSort(val);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full lg:w-[200px] bg-white border-gray-200 shadow-sm">
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
                    <SelectTrigger className="w-full lg:w-[200px] bg-white border-gray-200 shadow-sm">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center border-b py-4 px-5">
                <p className="text-sm text-gray-600 mb-4 sm:mb-0">
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
                <PaginationLayout
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}

          {isLoading && (
            <div className="mx-auto flex flex-col justify-center items-center gap-2 py-16">
              <Spinner size="lg" />
              <span className="ml-2 text-gray-600">
                Loading announcements...
              </span>
            </div>
          )}

          {!isLoading && data.length == 0 && (
            <div className="flex flex-col items-center gap-2 py-16">
              <div>
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <Megaphone className="mx-auto h-14 w-14 text-gray-300" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-3">
                No announcements posted
              </h3>
            </div>
          )}

          {!isLoading && data.length > 0 && (
            <div className="flex h-full">
              <ScrollArea
                className={`relative w-full lg:max-w-sm lg:border-r transition-all duration-300 ${
                  selected ? "w-0 lg:w-full" : "w-full"
                }`}
              >
                <div className="w-full flex flex-col pb-16 p-4 gap-4">
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
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-start pt-40 justify-center z-10">
                    <div className="flex flex-col items-center gap-4">
                      <Spinner size="lg" />
                      <p className="text-center text-sm">Retrieving data...</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
              <ScrollArea
                className={`hidden lg:block relative w-full transition-all duration-300 ${
                  selected ? "block" : "hidden"
                }`}
              >
                {/* Display full info of selected announcement */}
                {selected && (
                  <div className="w-full p-8 pb-44">
                    <div className="flex justify-between items-center mb-4">
                      <div className="bg-gray-100 shadow-sm border rounded-full p-2 lg:hidden"
                        onClick={() => setSelected(null)}
                      >
                        <ArrowLeft size={22} className="text-gray-700"/>
                      </div>
                      <p className="text-sm text-gray-400">
                        {handleFormatDate(selected.ann_start_at)}
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
    </div>
  );
}

export default AnnouncementTracker;
