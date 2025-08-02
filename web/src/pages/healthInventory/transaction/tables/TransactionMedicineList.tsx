"use client"

import React from "react"
import { DataTable } from "@/components/ui/table/data-table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { Skeleton } from "@/components/ui/skeleton"
import type { MedicineRecords } from "./type"
import { Medcolumns } from "./columns/MedicineListColumsn"
import { useMedicine } from "../queries/FetchQueries"
import { ExportButton } from "@/components/ui/export"

export default function MedicineList() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [pageSize, setPageSize] = React.useState(10)
  const [currentPage, setCurrentPage] = React.useState(1)
  const columns = Medcolumns()
  const { data: medicines, isLoading: isLoadingMedicines } = useMedicine()

  const formatMedicineData = React.useCallback((): MedicineRecords[] => {
    if (!medicines) return []
    return medicines.map((medicine: any) => {
      const staffFirstName = medicine.staff_detail?.rp?.per?.per_fname || ""
      const staffLastName = medicine.staff_detail?.rp?.per?.per_lname || ""
      const staffFullName = `${staffFirstName} ${staffLastName}`.trim()

      return {
        mdt_id: medicine.mdt_id,
        med_detail: {
          med_name: medicine.med_name,
          minv_dsg: medicine.minv_detail?.minv_dsg,
          minv_dsg_unit: medicine.minv_detail?.minv_dsg_unit,
          minv_form: medicine.minv_detail?.minv_form,
        },
        inv_id:medicine.minv_detail?.inv_detail?.inv_id,
        mdt_qty: medicine.mdt_qty,
        mdt_action: medicine.mdt_action,
        staff: staffFullName || medicine.staff, // Use full name, fallback to staff ID if names are not available
        created_at: new Date(medicine.created_at).toLocaleDateString(),
      }
    })
  }, [medicines])

  const filteredMedicines = React.useMemo(() => {
    return formatMedicineData().filter((record) =>
      Object.values(record).join(" ").toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery, formatMedicineData])

  const totalPages = Math.ceil(filteredMedicines.length / pageSize)
  const paginatedMedicines = filteredMedicines.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const exportColumns = [
    { key: "mdt_id", header: "ID" },
    { key: "med_detail.med_name", header: "Medicine Name" },
    {
      key: "med_detail.minv_dsg",
      header: "Dosage",
      format: (value: any) => `${value || ""} ${(value?.med_detail?.minv_dsg_unit || "")}`,
    },
    { key: "med_detail.minv_form", header: "Form" },
    {
      key: "mdt_qty",
      header: "Quantity",
      format: (value: any) => value || 0,
    },
    { key: "mdt_action", header: "Action" },
    { key: "staff", header: "Staff" },
    { key: "created_at", header: "Date" },
  ]

  if (isLoadingMedicines) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    )
  }
  return (
    <div>
      <div className="hidden lg:flex justify-between items-center mb-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input
              placeholder="Search..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-md">
        <div className="flex justify-between p-3">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-6"
              value={pageSize}
              onChange={(e) => {
                const value = +e.target.value
                if (value >= 1) {
                  setPageSize(value)
                } else {
                  setPageSize(1) // Reset to 1 if invalid
                }
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <ExportButton data={filteredMedicines} filename="medicine-transactions" columns={exportColumns} />
        </div>
        <div className="overflow-x-auto">
          <DataTable columns={columns} data={paginatedMedicines} />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredMedicines.length)} of{" "}
            {filteredMedicines.length} rows
          </p>
          {paginatedMedicines.length > 0 && (
            <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </div>
      </div>
    </div>
  )
}
