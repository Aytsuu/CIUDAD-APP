import PaginationLayout from "@/components/ui/pagination/pagination-layout";

type Props = {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalData: number;
  pageSize: number;
};

export default function ComplaintPagination({
  currentPage,
  setCurrentPage,
  totalData,
  pageSize,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalData / pageSize));
  const entriesStart = totalData > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const entriesEnd = Math.min(currentPage * pageSize, totalData);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
      <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
        Showing {entriesStart}-{entriesEnd} of {totalData} entries
      </p>
      <div className="w-full sm:w-auto flex justify-center">
        <PaginationLayout
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
