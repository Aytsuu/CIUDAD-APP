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
import { useCreateMedicineAllocation } from "../queries.tsx/post";
import { api2 } from "@/api/api";

export default function MedicineRequestPendingItems() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the medreqData from state params
  const medreq_id = location.state?.params?.medreq_id;
  const patientInfo = location.state?.params?.patientData;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [medicineDisplayPage, setMedicineDisplayPage] = useState(1);
  
  // State to track selected medicines
  const [selectedMedicines, setSelectedMedicines] = useState<any[]>([]);
  const [initialSelectionsSet, setInitialSelectionsSet] = useState(false);
  
  // Use the existing fetchMedicinesWithStock function
  const { data: medicineStocksOptions, isLoading: isMedicinesLoading } = fetchMedicinesWithStock();
  const { mutate: createAllocation, isPending, error: createMedicineError } = useCreateMedicineAllocation();

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
  const { data: apiResponse, isLoading, error: pendingRequestError } = usePendingItemsMedRequest(medreq_id, currentPage, pageSize);

  // Extract data from paginated response
  const medicineData = apiResponse?.results || [];
  const totalCount = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Flatten the data for the table
  const tableData = medicineData.flatMap((medicine: any) =>
    medicine.request_items.map((item: any) => ({
      ...item,
      med_name: medicine.med_name,
      med_type: medicine.med_type,
      total_available_stock: medicine.total_available_stock,
      med_id: medicine.med_id,
      reason: item.reason || "No reason provided",
      medreq_id: item.medreq_id
    }))
  );

  // Create a mapping between stock medicines and pending request items
  // This matches medicines by med_id and creates a proper relationship
  const createMedicineMapping = () => {
    if (!medicineStocksOptions || !medicineData.length) return [];

    const mappedMedicines: any = [];

    // For each pending medicine request
    medicineData.forEach((pendingMedicine: any) => {
      // Find all stock entries that match this medicine
      const matchingStocks = medicineStocksOptions.filter((stock: any) => 
        String(stock.med_id) === String(pendingMedicine.med_id)
      );

      // For each matching stock, create an entry
      matchingStocks.forEach((stock: any, stockIndex: number) => {
        // Get the pending items for this medicine
        const pendingItems = pendingMedicine.request_items.filter((item: any) => 
          item.status === "pending"
        );

        // If there are pending items, create mapping entries
        pendingItems.forEach((item: any, itemIndex: number) => {
          const uniqueId = `${pendingMedicine.med_id}_${stock.id}_${item.medreqitem_id}`;
          
          mappedMedicines.push({
            ...stock,
            id: uniqueId, // Unique identifier for this specific stock-request combination
            display_id: `${pendingMedicine.med_name} (Stock ID: ${stock.id})`, // For display purposes
            med_name: pendingMedicine.med_name,
            med_type: pendingMedicine.med_type,
            medreqitem_id: item.medreqitem_id,
            requested_qty: item.medreqitem_qty,
            pending_reason: item.reason || "No reason provided",
            request_item: item, // Store the full request item
            pending_medicine: pendingMedicine, // Store the full pending medicine
            original_stock_id: stock.id // Keep track of original stock ID
          });
        });
      });
    });

    return mappedMedicines;
  };

  // Get the enhanced medicine stocks with proper mapping
  const enhancedMedicineStocks = createMedicineMapping();

  // Helper function to find medicine data by the unique ID
  const getMedicineDataByUniqueId = (uniqueId: string) => {
    return enhancedMedicineStocks.find((med: any) => med.id === uniqueId);
  };

  // Handler for when medicines are selected/deselected in MedicineDisplay
  const handleSelectedMedicinesChange = (updatedSelectedMedicines: any[]) => {
    console.log("Updated Selected Medicines:", updatedSelectedMedicines);
    
    // Auto-fill reasons for newly selected medicines
    const enhancedSelectedMedicines = updatedSelectedMedicines.map((selectedMed: any) => {
      const medicineData = getMedicineDataByUniqueId(selectedMed.minv_id);
      
      if (medicineData) {
        // Auto-fill reason if not already set
        const reason = selectedMed.reason || medicineData.pending_reason || "No reason provided";
        
        return {
          ...selectedMed,
          medreqitem_id: medicineData.medreqitem_id,
          med_name: medicineData.med_name,
          med_id: medicineData.med_id,
          original_stock_id: medicineData.original_stock_id,
          minv_id: selectedMed.minv_id, // Keep the unique ID as minv_id
          reason: reason // Use existing reason or auto-fill from pending data
        };
      }
      
      // Fallback - this shouldn't happen with proper mapping
      console.warn("Could not find medicine data for selected medicine:", selectedMed);
      return selectedMed;
    });

    console.log("Enhanced Selected Medicines with proper data:", enhancedSelectedMedicines);
    setSelectedMedicines(enhancedSelectedMedicines);
  };

  // Prepare initial selected medicines from the pending items
  useEffect(() => {
    if (enhancedMedicineStocks.length > 0 && !initialSelectionsSet) {
      // Auto-select all medicines that have pending requests
      const initialSelected = enhancedMedicineStocks.map((medicine: any) => ({
        minv_id: medicine.id, // Use the unique ID
        medrec_qty: medicine.requested_qty || 1,
        reason: medicine.pending_reason || "No reason provided", // Auto-fill reason
        medreqitem_id: medicine.medreqitem_id,
        med_name: medicine.med_name,
        med_id: medicine.med_id,
        original_stock_id: medicine.original_stock_id
      }));

      console.log("Setting initial selected medicines:", initialSelected);
      setSelectedMedicines(initialSelected);
      setInitialSelectionsSet(true);
    }
  }, [enhancedMedicineStocks, initialSelectionsSet]);

  // Reset initial selections when medicine data changes
  useEffect(() => {
    setInitialSelectionsSet(false);
  }, [medicineData, medicineStocksOptions]);

  const processMedicineAllocation = () => {
    // Validate that all selected medicines have required data
    const validSelectedMedicines = selectedMedicines.filter(med => 
      med.medreqitem_id && med.minv_id && med.medrec_qty > 0
    );

    if (validSelectedMedicines.length === 0) {
      console.error("No valid medicines selected for allocation");
      return;
    }

    const payload = {
      medreq_id: medreq_id,
      selected_medicines: validSelectedMedicines.map((med) => ({
        minv_id: med.original_stock_id || med.minv_id, // Use original stock ID for API
        medrec_qty: med.medrec_qty,
        medreqitem_id: med.medreqitem_id,
        reason: med.reason // Include reason in payload
      }))
    };

    console.log("Sending payload:", payload);
    createAllocation(payload);
  };

  // Guard clause for missing medreq_id
  if (!medreq_id) {
    return <div>Error: Medicine Request ID not provided</div>;
  }

  if (pendingRequestError || createMedicineError) {
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
          ) : pendingRequestError ? (
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
              </div>
            </>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Select Medicines to Process</h3>
          <MedicineDisplay
            medicines={enhancedMedicineStocks}
            initialSelectedMedicines={selectedMedicines}
            onSelectedMedicinesChange={handleSelectedMedicinesChange}
            itemsPerPage={10}
            currentPage={medicineDisplayPage}
            onPageChange={setMedicineDisplayPage}
            autoFillReasons={true} // Ensure this prop is passed
            isLoading={isMedicinesLoading}
          />
        </div>

        {/* Debug info - Enhanced to show more details */}
        {selectedMedicines.length > 0 && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h4 className="font-semibold mb-2">Selected Medicines Debug Info:</h4>
            <div className="text-sm">
              {selectedMedicines.map((med, index) => (
                <div key={index} className="mb-2 p-2 bg-white rounded">
                  <div>Medicine: <span className="font-semibold text-blue-600">{med.med_name || "Unknown"}</span></div>
                  <div>MinvId: <span className="text-gray-600">{med.minv_id}</span></div>
                  <div>Original Stock ID: <span className="text-purple-600">{med.original_stock_id}</span></div>
                  <div>Qty: <span className="text-green-600">{med.medrec_qty}</span></div>
                  <div>Reason: <span className="text-orange-600">{med.reason}</span></div>
                  <div>
                    MedReqItem ID: <span className={med.medreqitem_id ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{med.medreqitem_id || "N/A"}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Total Enhanced Medicine Stocks: {enhancedMedicineStocks.length} | 
              Total Pending Medicine Data: {medicineData.length} | 
              Total Stock Options: {medicineStocksOptions?.length || 0}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-3 mb-3">
          <Button 
            onClick={processMedicineAllocation}
            disabled={isPending || selectedMedicines.length === 0}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Process Request (${selectedMedicines.length} items)`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}