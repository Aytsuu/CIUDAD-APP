import React from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Check, CircleAlert, FileInput, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { ARColumns } from "../ReportColumns";
import { useGetAcknowledgementReport } from "../queries/reportFetch";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { LoadButton } from "@/components/ui/button/load-button";
import { useAddWAR, useAddWARComp } from "../queries/reportAdd";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Main component for the DRR Acknowledgement Report
export default function ARRecords() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [selectedRows, setSelectedRows] = React.useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isCreatingWeeklyAR, setIsCreatingWeeklyAR] = React.useState<boolean>(false)
  const { data: arReports, isLoading } = useGetAcknowledgementReport();
  const { mutateAsync: addWAR } = useAddWAR();
  const { mutateAsync: addWARComp } = useAddWARComp();

  const ARList = arReports?.results || [];
  const totalCount = arReports?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const onSelectedRowsChange = React.useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, [])

  const handleCreateWAR = async () => {
    setIsSubmitting(true);
    if(!(selectedRows.length) && !(selectedRows.length > 0)) {
      toast("Please select acknowledgement report(s)", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
        style: {
          border: '1px solid rgb(225, 193, 193)',
          padding: '16px',
          color: '#b91c1c',
          background: '#fef2f2',
        },
        action: {
          label: <X size={14} className="bg-transparent"/>,
          onClick: () => toast.dismiss(),
        },
      });
      setIsSubmitting(false);
      return;
    }

    try {
      console.log(selectedRows);
      addWAR(user?.staff.staff_id, {
        onSuccess: (data) => {
          const compositions = selectedRows.map((row) => {
            return {
              ar: row.ar_id,
              war: data.war_id
            }
          });

          addWARComp(compositions, {
            onSuccess: () => {
              console.log('Weekly AR Created!');
              setIsSubmitting(false);
            }
          })
        }
      })
    } catch (err) {
      setIsSubmitting(false);
      throw err;
    }
  }

  return (
    <MainLayoutComponent
      title="Acknowledgement Reports"
      description="Manage and view acknowledgement reports"
    >
      <div className="relative w-full lg:flex justify-between items-center gap-2 mb-4">
        <div className="relative flex-1">
          <div className="relative w-full flex">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full bg-white"
            />
          </div>
        </div>
        {!isSubmitting ? (!isCreatingWeeklyAR ? (<Button onClick={() => setIsCreatingWeeklyAR(true)}>
          <Plus />Create Weekly AR
        </Button>) :
          (<Button onClick={() => {
            setIsCreatingWeeklyAR(false);
            handleCreateWAR();
          }}>
            <Check/> Create
          </Button>)
        ) : (
          <LoadButton>Creating...</LoadButton>
        )}
      </div>

      <div className="bg-white rounded-md">
        <div className="flex justify-between p-3">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-6"
              value={pageSize}
              onChange={(e) => {
                const value = +e.target.value;
                if (value >= 1) {
                  setPageSize(value);
                } else {
                  setPageSize(1); // Reset to 1 if invalid
                }
              }}
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <DropdownLayout
            trigger={
              <Button variant="outline" className="h-[2rem]">
                <FileInput /> Export
              </Button>
            }
            options={[
              { id: "", name: "Export as CSV" },
              { id: "", name: "Export as Excel" },
              { id: "", name: "Export as PDF" },
            ]}
          />
        </div>

        <div className="overflow-x-auto">
          <DataTable 
            columns={ARColumns(isCreatingWeeklyAR)} 
            data={ARList} 
            onSelectedRowsChange={onSelectedRowsChange}
            isLoading={isLoading}
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, totalCount)} of{" "}
            {totalCount} rows
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
    </MainLayoutComponent>
  );
}
