"use client";
import { useState, useEffect, useMemo } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, History, Package, CheckCircle } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { pendingItemsColumns } from "./columns";
import { usePendingItemsMedRequest } from "../queries/fetch";
import { MedicineDisplay } from "@/components/ui/medicine-display";
import { fetchMedicinesWithStock } from "../../restful-api/fetchAPI";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { toast } from "sonner";
import { useConfirmAllPendingItems } from "../queries/update";
import { useCheckPatientExists } from "@/pages/record/health/patientsRecord/queries/fetch";
import { useAuth } from "@/context/AuthContext";

export default function MedicineRequestPendingItems() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const staff_id = user?.staff?.staff_id || null;

  // Get the medreqData from state params
  const medreq_id = location.state?.params?.medreq_id;
  const patientInfo = location.state?.params?.patientData;

  const [searchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [medicineDisplayPage, setMedicineDisplayPage] = useState(1);
  const [medicineSearchQuery, setMedicineSearchQuery] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState<any[]>([]);

  // Improved patient ID logic
  const [currentPatId, setCurrentPatId] = useState<string | null>(null);

  // Check if patient exists using useCheckPatientExists
  const { data: patientExists, isLoading: isCheckingLoading } = useCheckPatientExists(patientInfo?.pat_id);

  // Consolidated patient ID logic
  useEffect(() => {
    const patientData = patientExists as any;

    if (patientData?.exists && patientData?.pat_id) {
      setCurrentPatId(patientData.pat_id);
    } else if (patientInfo?.pat_id) {
      setCurrentPatId(patientInfo.pat_id);
    } else {
      setCurrentPatId(null);
    }
  }, [patientExists, patientInfo]);

  // Helper function to get the final patient ID
  const getFinalPatientId = () => {
    return currentPatId || (patientExists as any)?.patient?.pat_id || patientInfo?.pat_id || null;
  };

  const patientData = useMemo(() => {
    if (!patientInfo) return null;

    const finalPatId = getFinalPatientId();

    return {
      pat_id: finalPatId,
      pat_type: patientInfo.pat_type,
      age: patientInfo.age,
      addressFull: patientInfo.addressFull || "No address provided",
      address: {
        add_street: patientInfo.address?.add_street,
        add_barangay: patientInfo.address?.add_barangay,
        add_city: patientInfo.address?.add_city,
        add_province: patientInfo.address?.add_province,
        add_sitio: patientInfo.address?.add_sitio
      },
      households: patientInfo.households || [],
      personal_info: {
        per_fname: patientInfo.personal_info?.per_fname,
        per_mname: patientInfo.personal_info?.per_mname,
        per_lname: patientInfo.personal_info?.per_lname,
        per_dob: patientInfo.personal_info?.per_dob,
        per_sex: patientInfo.personal_info?.per_sex
      }
    };
  }, [patientInfo, currentPatId, patientExists]);

  // Use the existing fetchMedicinesWithStock function
  const { data: medicineStocksOptions, isLoading: isMedicinesLoading } = fetchMedicinesWithStock({ is_temp: true });

  // Use the original mutation hook
  const { mutate: confirmAllPendingItems, isPending, error: confirmError, isSuccess } = useConfirmAllPendingItems();

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
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
  const createMedicineMapping = () => {
    if (!medicineStocksOptions || !medicineData.length) return [];

    const mappedMedicines: any = [];

    // For each pending medicine request
    medicineData.forEach((pendingMedicine: any) => {
      // Find all stock entries that match this medicine
      const matchingStocks = Array.isArray(medicineStocksOptions?.medicines) ? medicineStocksOptions.medicines.filter((stock: any) => String(stock.med_id) === String(pendingMedicine.med_id) && (stock.avail || 0) > 0) : [];

      // For each matching stock, create an entry
      matchingStocks.forEach((stock: any) => {
        // Get the pending items for this medicine
        const pendingItems = pendingMedicine.request_items.filter((item: any) => item.status === "pending");

        // If there are pending items, create mapping entries
        pendingItems.forEach((item: any) => {
          const uniqueId = `${pendingMedicine.med_id}_${stock.id}_${item.medreqitem_id}`;
          mappedMedicines.push({
            ...stock,
            id: uniqueId,
            display_id: `${pendingMedicine.med_name} (Stock ID: ${stock.id})`,
            med_name: pendingMedicine.med_name,
            med_type: pendingMedicine.med_type,
            medreqitem_id: item.medreqitem_id,
            requested_qty: item.medreqitem_qty,
            pending_reason: item.reason || "No reason provided",
            request_item: item,
            pending_medicine: pendingMedicine,
            original_stock_id: stock.id,
            // Add properties that MedicineDisplay expects
            name: pendingMedicine.med_name,
            dosage: stock.dosage || "N/A",
            form: stock.form || "N/A",
            avail: stock.avail || 0,
            unit: stock.unit || "pcs",
            expiry: stock.expiry,
            inv_id: stock.inv_id || stock.id,
            // Pre-fill the reason and quantity for autofill
            preFilledReason: item.reason || "No reason provided",
            defaultQuantity: item.medreqitem_qty || 1
          });
        });
      });
    });

    return mappedMedicines;
  };

  // Get the enhanced medicine stocks with proper mapping
  const enhancedMedicineStocks = createMedicineMapping();

  // Filter medicines based on search query
  const filteredMedicineStocks = useMemo(() => {
    if (!medicineSearchQuery.trim()) {
      return enhancedMedicineStocks;
    }

    const query = medicineSearchQuery.toLowerCase();
    return enhancedMedicineStocks.filter(
      (medicine: any) =>
        medicine.name?.toLowerCase().includes(query) ||
        medicine.med_name?.toLowerCase().includes(query) ||
        medicine.dosage?.toLowerCase().includes(query) ||
        medicine.form?.toLowerCase().includes(query) ||
        medicine.med_type?.toLowerCase().includes(query) ||
        medicine.inv_id?.toLowerCase().includes(query) ||
        medicine.id?.toString().toLowerCase().includes(query)
    );
  }, [enhancedMedicineStocks, medicineSearchQuery]);

  // Implement client-side pagination for medicine display
  const paginatedMedicines = useMemo(() => {
    const startIndex = (medicineDisplayPage - 1) * 10;
    const endIndex = startIndex + 10;
    return filteredMedicineStocks.slice(startIndex, endIndex);
  }, [filteredMedicineStocks, medicineDisplayPage]);

  const medicineTotalPages = Math.ceil(filteredMedicineStocks.length / 10);

  // Calculate the actual count of pending items
  const pendingItemsCount = medicineData.reduce((count: any, medicine: any) => {
    const pendingItems = medicine.request_items.filter((item: any) => item.status === "pending");
    return count + pendingItems.length;
  }, 0);

  // Handle medicine selection
  const handleSelectedMedicinesChange = (updatedSelectedMedicines: any[]) => {
    console.log("Updated Selected Medicines:", updatedSelectedMedicines);

    // Auto-fill reasons and quantities for newly selected medicines
    const enhancedSelectedMedicines = updatedSelectedMedicines.map((selectedMed: any) => {
      const medicineData = enhancedMedicineStocks.find((med: any) => med.id === selectedMed.minv_id);

      if (medicineData) {
        // Check if this is a newly selected medicine (quantity is 1 and no custom reason)
        const isNewlySelected = selectedMed.medrec_qty === 1 && !selectedMed.reason;
        const reason = selectedMed.reason || medicineData.pending_reason || "No reason provided";
        let quantity = selectedMed.medrec_qty;
        if (isNewlySelected || selectedMed.medrec_qty === 1) {
          quantity = medicineData.requested_qty || medicineData.defaultQuantity || 1;
        }

        return {
          ...selectedMed,
          medreqitem_id: medicineData.medreqitem_id,
          med_name: medicineData.med_name,
          med_id: medicineData.med_id,
          original_stock_id: medicineData.original_stock_id,
          minv_id: selectedMed.minv_id,
          medrec_qty: quantity,
          reason: reason
        };
      }

      console.warn("Could not find medicine data for selected medicine:", selectedMed);
      return selectedMed;
    });

    setSelectedMedicines(enhancedSelectedMedicines);
  };

  // Process medicine allocation - UPDATED to use proper payload
  const processMedicineAllocation = () => {
    // Validate that all selected medicines have required data
    const validSelectedMedicines = selectedMedicines.filter((med) => med.medreqitem_id && med.minv_id && med.medrec_qty > 0);

    if (validSelectedMedicines.length === 0) {
      toast.error("No valid medicines selected", {
        description: "Please select at least one medicine to allocate."
      });
      return;
    }

    const finalPatId = getFinalPatientId();
    if (!finalPatId) {
      toast.error("Patient ID missing", {
        description: "Unable to determine patient ID."
      });
      return;
    }

    if (!medreq_id) {
      toast.error("Invalid Request", {
        description: "Medicine Request ID is missing."
      });
      return;
    }

    // Create the payload that matches backend expectations
    const payload = {
      medreq_id: medreq_id,
      selected_medicines: validSelectedMedicines.map((med) => ({
        minv_id: med.original_stock_id || med.minv_id,
        medrec_qty: med.medrec_qty,
        medreqitem_id: med.medreqitem_id,
        reason: med.reason
      })),
      staff_id: staff_id,
      pat_id: finalPatId
    };

    console.log("Sending payload to backend:", payload);
    confirmAllPendingItems(payload);
  };

  const handleMedicineSearch = (searchTerm: string) => {
    setMedicineSearchQuery(searchTerm);
    setMedicineDisplayPage(1);
  };

  // Guard clause for missing medreq_id
  if (!medreq_id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Medicine Request ID not provided</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pendingRequestError || confirmError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Error loading medicine request items</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <LayoutWithBack title="Pending Medicine Request Items" description="Review and confirm pending medicine requests">
      <div className="mx-auto space-y-6">
        {/* Success Message */}
        {isSuccess && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <p className="font-medium">Medicine allocation submitted successfully!</p>
              </div>
              <p className="text-sm text-green-600 mt-1">Redirecting you back...</p>
            </CardContent>
          </Card>
        )}

        {/* Patient Information Card */}
        {patientInfo ? (
          <PatientInfoCard patient={patientData} />
        ) : (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <AlertCircle className="h-5 w-5" />
                No Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700">Patient information not available for this request.</p>
            </CardContent>
          </Card>
        )}

        {/* Pending Items Table */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <CardTitle>
                Pending Medicine Requests <span className="bg-red-500 text-white rounded-full text-sm px-2"> {totalCount}</span>
              </CardTitle>
              <CardDescription>Review pending medicine request items before confirmation</CardDescription>
            </div>
            {isCheckingLoading ? (
              <div>...</div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/services/medicine/records/individual-records"
                  state={{
                    params: {
                      patientData: patientData
                    }
                  }}
                >
                  <Button size="sm">
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </Link>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="pageSize" className="text-sm">
                  Show
                </Label>
                <Input
                  id="pageSize"
                  type="number"
                  className="w-20 h-8"
                  value={pageSize}
                  onChange={(e) => {
                    const value = Math.max(1, Math.min(+e.target.value, 10));
                    setPageSize(value);
                    setCurrentPage(1);
                  }}
                  min="1"
                  max="10"
                />
                <Label className="text-sm">entries</Label>
              </div>
            </div>

            {/* Table Content */}
            <div className="border rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading pending items...</span>
                </div>
              ) : pendingRequestError ? (
                <div className="flex items-center justify-center py-12 text-red-600">
                  <AlertCircle className="h-8 w-8 mr-2" />
                  <span>Error loading pending items. Please try again.</span>
                </div>
              ) : tableData.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  <Package className="h-8 w-8 mr-2" />
                  <span>{debouncedSearch ? "No items found for your search" : "No pending items found"}</span>
                </div>
              ) : (
                <>
                  <DataTable columns={pendingItemsColumns} data={tableData} />
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t bg-gray-50">
                    <p className="text-sm text-gray-600">
                      Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} items
                    </p>
                    <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medicine Display - SELECTABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Available Medicine Inventory</CardTitle>
            <CardDescription className="pb-2">
              Select medicines to allocate for the pending request
              {selectedMedicines.length > 0 && <span className="ml-2 text-green-600 font-semibold">({selectedMedicines.length} selected)</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MedicineDisplay
              medicines={paginatedMedicines}
              initialSelectedMedicines={selectedMedicines}
              onSelectedMedicinesChange={handleSelectedMedicinesChange}
              itemsPerPage={10}
              currentPage={medicineDisplayPage}
              onPageChange={setMedicineDisplayPage}
              autoFillReasons={true}
              isLoading={isMedicinesLoading}
              readonly={false} // SELECTABLE
              totalItems={filteredMedicineStocks.length}
              totalPages={medicineTotalPages}
              onSearch={handleMedicineSearch}
              searchQuery={medicineSearchQuery}
              isSearching={false}
            />
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button onClick={processMedicineAllocation} disabled={isPending || isSuccess || selectedMedicines.length === 0 || pendingItemsCount === 0} size="lg" className="min-w-[200px]">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmed
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Selected Items ({selectedMedicines.length})
              </>
            )}
          </Button>
        </div>
      </div>
    </LayoutWithBack>
  );
}
