// src/features/medicine/pages/MedicineRequestPendingItems.tsx
import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Pill, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { Label } from "@/components/ui/label";
import { pendingItemsColumns } from "./columns";
import { usePendingItemsMedRequest } from "../queries.tsx/fetch";
import { MedicineDisplay } from "@/components/ui/medicine-display";
import { fetchMedicinesWithStock } from "../../restful-api/fetchAPI";

export default function MedicineRequestPendingItems() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get the medreqData from state params
  const medreq_id = location.state?.params?.medreq_id;
  const patientInfo = location.state?.params?.patientData;
  console.log("patientInfo:", patientInfo);

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [medicineDisplayPage, setMedicineDisplayPage] = useState(1);

  // Use the existing fetchMedicinesWithStock function
  const { data: medicineStocksOptions, isLoading: isMedicinesLoading } = fetchMedicinesWithStock();

  // Guard clause for missing medreq_id
  if (!medreq_id) {
    return <div>Error: Medicine Request ID not provided</div>;
  }

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Use query with pagination parameters
  const { data: apiResponse, isLoading, error } = usePendingItemsMedRequest(medreq_id, currentPage, pageSize);
  // Extract data from paginated response
  const medicineData = apiResponse?.results || [];
  const totalCount = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Prepare selected medicines from the pending items with the reason field
  // const selectedMedicines = medicineData.flatMap((medicine: any) =>
  //   medicine.request_items.map((item: any) => ({
  //     minv_id: medicine.med_id, // This should match the id field in medicine display
  //     medrec_qty: item.medreqitem_qty || item.quantity || 1,
  //     reason: item.reason || "No reason provided", // Use the reason field from request_items
  //     inventory_id: item.inventory?.minv_id || null
  //   }))
  // );

  console.log("Selected Medicines:", selectedMedicines);
  console.log("Medicine Data:", medicineData);

  // Enhance medicine stocks with pre-filled reasons
  const enhancedMedicineStocks = medicineStocksOptions?.map((medicine: any) => {
    // Find matching selected medicine to get the reason
    const matchingSelectedMed = selectedMedicines.find((selectedMed: any) => {
      // Try multiple matching strategies
      const matchesMedId = medicine.med_id === selectedMed.minv_id;
      const matchesId = medicine.id === selectedMed.minv_id;
      const matchesStringId = medicine.id === String(selectedMed.minv_id);
      
      return matchesMedId || matchesId || matchesStringId;
    });
    
    // Add pre-filled reason if found
    return {
      ...medicine,
      preFilledReason: matchingSelectedMed?.reason || ""
    };
  }) || [];

  console.log("Enhanced Medicine Stocks:", enhancedMedicineStocks);

  // Filter to only include medicines that are in the selectedMedicines
  const filteredMedicineStocks = enhancedMedicineStocks.filter((medicine: any) =>
    selectedMedicines.some((selectedMed: any) => {
      const matchesMedId = medicine.med_id === selectedMed.minv_id;
      const matchesId = medicine.id === selectedMed.minv_id;
      const matchesStringId = medicine.id === String(selectedMed.minv_id);
      
      return matchesMedId || matchesId || matchesStringId;
    })
  );

  console.log("Filtered Medicine Stocks:", filteredMedicineStocks);

  // Flatten the data for the table
  const tableData = medicineData.flatMap((medicine: any) =>
    medicine.request_items.map((item: any) => ({
      ...item,
      med_name: medicine.med_name,
      med_type: medicine.med_type,
      total_available_stock: medicine.total_available_stock,
      med_id: medicine.med_id,
      reason: item.reason || "No reason provided" ,// Use the reason field
      medreq_id: item.medreq_id
    }))
  );

  // Check if all items are rejected or referred
  const allItemsRejectedOrReferred = tableData.every((item: any) => 
    item.status === 'rejected' || item.status === 'referred' || item.status === 'on referred'
  );

  // Check if there are any pending items
  const hasPendingItems = tableData.some((item: any) => item.status === 'pending');

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500">Error loading medicine request items</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button className="text-black p-2 mb-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Medicine Request Pending Items</h1>
          <p className="text-xs sm:text-sm text-darkGray">Manage and review pending medicine request items</p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      {patientInfo ? (
        <div className="mb-4">
          <PatientInfoCard patient={patientInfo} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <Label className="text-base font-semibold text-yellow-500">No patient information</Label>
          </div>
          <p className="text-sm text-gray-700">Patient information not available for this request.</p>
        </div>
      )}

      <div className="w-full lg:flex justify-end items-center mb-4 gap-6 mt-4">
        <div className="flex gap-2 items-center p-2">
          <div className="flex items-center justify-center">
            <Pill className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 pr-2">Total Pending Items</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
        </div>
      </div>

      <div className="h-full w-full rounded-md">
        <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-center sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-8"
              value={pageSize}
              onChange={(e) => {
                const value = +e.target.value;
                setPageSize(value >= 1 ? value : 1);
                setCurrentPage(1);
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
        </div>

        <div className="bg-white w-full overflow-x-auto">
          {isLoading ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading pending items...</span>
            </div>
          ) : error ? (
            <div className="w-full h-[100px] flex text-red-500 items-center justify-center">
              <span className="ml-2">Error loading pending items. Please check console.</span>
            </div>
          ) : tableData.length === 0 ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <span className="ml-2">{debouncedSearch ? "No items found for your search" : "No pending items found"}</span>
            </div>
          ) : (
           <>
            <DataTable columns={pendingItemsColumns} data={tableData} />
             <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
          </p>
          <div className="w-full sm:w-auto flex justify-center">
            <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div></>
          )}
        </div>

        {/* Medicine Display (Read-only) - Only show medicines that have the same med_id */}
        {!isMedicinesLoading && filteredMedicineStocks.length > 0 && (
          <div className="mt-6">
            <MedicineDisplay 
              medicines={filteredMedicineStocks} 
              initialSelectedMedicines={selectedMedicines}
              onSelectedMedicinesChange={() => {}} // Empty function for read-only
              itemsPerPage={pageSize}
              currentPage={medicineDisplayPage}
              onPageChange={setMedicineDisplayPage}
              autoFillReasons={true}
              isLoading={isMedicinesLoading}
            />
          </div>
        )}

        <div className="flex justify-end mt-3 mb-3">
          <Button 
            disabled={allItemsRejectedOrReferred || !hasPendingItems}
            className={allItemsRejectedOrReferred || !hasPendingItems ? "opacity-50 cursor-not-allowed" : ""}
          >
            {allItemsRejectedOrReferred ? "All Items Processed" : "Process Request"}
          </Button>
        </div>
       
      </div>
    </div>
  );
}