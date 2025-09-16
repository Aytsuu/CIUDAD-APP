"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, History, Package, CheckCircle } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { confirmedItemsColumns } from "./columns";
import { usePendingItemsMedRequest } from "../queries/fetch";
import { MedicineDisplay } from "@/components/ui/medicine-display";
import { fetchMedicinesWithStock } from "../../restful-api/fetchAPI";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { registerPatient } from "@/pages/record/health/patientsRecord/restful-api/post";
import { useCheckPatientExists } from "@/pages/record/health/patientsRecord/queries/fetch";
import { PersonalInfoCard } from "./personal-info";
import { useCreateMedicineAllocation } from "../queries/post";
import { SignatureField, SignatureFieldRef } from "@/pages/healthServices/Reports/firstaid-report/signature";

export default function MedicineRequestDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const staff_id = user?.staff?.staff_id || null;

  // Get the medreqData from state params
  const patientData = location.state?.params?.patientData;
  const request = location.state?.params?.request as any;
  console.log("mrfreq", request);
  console.log("personal info", patientData);

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [medicineDisplayPage, setMedicineDisplayPage] = useState(1);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState<any[]>([]);
  const [currentPatId, setCurrentPatId] = useState<string | null>(request?.pat_id || null);
  const [initialSelectionsSet, setInitialSelectionsSet] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const signatureRef = useRef<SignatureFieldRef>(null);

  const handleSignatureChange = useCallback((signature: string | null) => {
    setSignature(signature);
  }, []);

  const { data: medicineStocksOptions, isLoading: isMedicinesLoading } = fetchMedicinesWithStock();
  const { data: apiResponse, isLoading, error: confirmedRequestError } = usePendingItemsMedRequest(request.medreq_id, currentPage, pageSize);

  // Check if patient exists using your existing hook
  const { data: patientExists, isLoading: isCheckingPatient, refetch: refetchPatientExists } = useCheckPatientExists(request.rp_id);

  // Helper functions to determine patient status
 // Helper functions to determine patient status
const shouldShowRegisterButton = () => {
  // If still checking, don't show button
  if (isCheckingPatient) return false;

  // If patient exists, don't show register button
  if ((patientExists as any)?.exists) return false;

  // Show register button if patient doesn't exist
  return true;
};

  const isPatientRegistered = () => {
    const patientData = patientExists as any;
    return patientData?.exists && patientData?.patient?.pat_id;
  };

  // Set currentPatId if patient already exists
  useEffect(() => {
    const patientData = patientExists as any;
    if (patientData?.exists && patientData?.patient?.pat_id) {
      setCurrentPatId(patientData.patient.pat_id);
    }
  }, [patientExists]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const medicineData = apiResponse?.results || [];
  const totalCount = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

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

  // Calculate the actual count of confirmed items
  const confirmedItemsCount = medicineData.reduce((count: any, medicine: any) => {
    const confirmedItems = medicine.request_items.filter((item: any) => item.status === "confirmed");
    return count + confirmedItems.length;
  }, 0);

  // Updated handleRegisterPatient function
  const handleRegisterPatient = async () => {
    // setCurrentPatId(patId);
    // // Refetch patient existence data to update the UI

    if (!request) return;
    setIsRegistering(true);
    try {
      const response = await registerPatient({
        medreq_id: request.medreq_id,
        pat_status: "active",
        rp_id: request.rp_id,
        personal_info: request.personal_info,
        pat_type: "Resident"
      });

      if (!response.pat_id) {
        throw new Error("Patient ID not returned from the server");
      }
      setCurrentPatId(response.pat_id);
          refetchPatientExists();

      toast.success("Successfully registered");
    } catch (error) {
      toast.error("Failed to register patient");
      console.error("Registration error:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const createMedicineMapping = () => {
    if (!medicineStocksOptions || !medicineData?.length) {
      return [];
    }

    const mappedMedicines: any = [];

    // For each confirmed medicine request
    medicineData.forEach((confirmedMedicine: any) => {
      // Find all stock entries that match this medicine
      const matchingStocks = medicineStocksOptions.filter((stock) => {
        const match = String(stock.med_id) === String(confirmedMedicine.med_id);
        return match;
      });

      // For each matching stock, create an entry
      matchingStocks.forEach((stock) => {
        // Get the confirmed items for this medicine
        const confirmedItems = confirmedMedicine.request_items?.filter((item: any) => item.status === "confirmed") || [];
        // If there are confirmed items, create mapping entries
        confirmedItems.forEach((item: any) => {
          const uniqueId = `${confirmedMedicine.med_id}_${stock.id}_${item.medreqitem_id}`;
          const mappedItem = {
            ...stock,
            id: uniqueId,
            display_id: `${confirmedMedicine.med_name} (Stock ID: ${stock.id})`,
            med_name: confirmedMedicine.med_name,
            med_type: confirmedMedicine.med_type,
            medreqitem_id: item.medreqitem_id,
            requested_qty: item.medreqitem_qty,
            confirmed_reason: item.reason || "No reason provided",
            request_item: item,
            confirmed_medicine: confirmedMedicine,
            original_stock_id: stock.id,
            // Add these properties that MedicineDisplay expects
            name: confirmedMedicine.med_name,
            dosage: stock.dosage || "N/A",
            form: stock.form || "N/A",
            avail: stock.avail || 0,
            unit: stock.unit || "pcs",
            expiry: stock.expiry,
            inv_id: stock.inv_id || stock.id,
            // Pre-fill the reason and quantity for autofill
            preFilledReason: item.reason || "No reason provided",
            defaultQuantity: item.medreqitem_qty || 1
          };
          mappedMedicines.push(mappedItem);
        });
      });
    });
    return mappedMedicines;
  };

  const enhancedMedicineStocks = createMedicineMapping();

  // Helper function to find medicine data by the unique ID
  const getMedicineDataByUniqueId = (uniqueId: string) => {
    return enhancedMedicineStocks.find((med: any) => med.id === uniqueId);
  };

  const handleSelectedMedicinesChange = (updatedSelectedMedicines: any[]) => {
    console.log("Updated Selected Medicines:", updatedSelectedMedicines);

    // Auto-fill reasons and quantities for newly selected medicines
    const enhancedSelectedMedicines = updatedSelectedMedicines.map((selectedMed: any) => {
      const medicineData = getMedicineDataByUniqueId(selectedMed.minv_id);

      if (medicineData) {
        // Check if this is a newly selected medicine (quantity is 1 and no custom reason)
        const isNewlySelected = selectedMed.medrec_qty === 1 && !selectedMed.reason;
        const reason = selectedMed.reason || medicineData.confirmed_reason || "No reason provided";
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
          minv_id: selectedMed.minv_id, // Keep the unique ID as minv_id
          medrec_qty: quantity, // Use autofilled quantity
          reason: reason // Use existing reason or auto-fill from confirmed data
        };
      }

      // Fallback - this shouldn't happen with proper mapping
      console.warn("Could not find medicine data for selected medicine:", selectedMed);
      return selectedMed;
    });

    console.log("Enhanced Selected Medicines with autofilled quantities and reasons:", enhancedSelectedMedicines);
    setSelectedMedicines(enhancedSelectedMedicines);
  };

  // Reset initial selections when medicine data changes
  useEffect(() => {
    setInitialSelectionsSet(false);
  }, [medicineData, medicineStocksOptions]);

  const { mutate: createAllocation, isPending } = useCreateMedicineAllocation();
  const processMedicineAllocation = () => {
    // Validate that all selected medicines have required data
    const validSelectedMedicines = selectedMedicines.filter((med) => med.medreqitem_id && med.minv_id && med.medrec_qty > 0);

    if (validSelectedMedicines.length === 0) {
      console.error("No valid medicines selected for allocation");
      return;
    }
    console.log(signature);

    const payload = {
      medreq_id: request.medreq_id,
      requested_at: request.requested_at,
      staff_id: staff_id,
      signature: signature,
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

  if (confirmedRequestError) {
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
    <LayoutWithBack title="Medicine Request Items" description="Review and confirm confirmed medicine requests">
      <div className="">
        {/* Patient Information Card */}
        <div className="mb-5">
          <PersonalInfoCard
            personalInfo={request.personal_info}
            address={request.address}
            currentPatId={currentPatId || request.pat_id}
            rp_id={request.rp_id}
            medreq_id={request.medreq_id}
            onPatientRegistered={handleRegisterPatient}
            // Add these new props for patient existence check
            shouldShowRegisterButton={shouldShowRegisterButton()}
            isPatientRegistered={isPatientRegistered()}
            isCheckingPatient={isCheckingPatient}
            patientExists={patientExists}
          />
        </div>

        {/* confirmed Items Table */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <CardTitle>
                Medicine Requests <span className="bg-red-500 text-white rounded-full text-sm px-2"> {totalCount}</span>
              </CardTitle>
              <CardDescription>Review confirmed medicine request items before confirmation</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/IndivMedicineRecord"
                state={{
                  params: {
                    patientData: {

                      pat_id:(patientExists as any)?.pat_id,
                      pat_type: patientData.pat_type,
                  age: patientData.age,
                  addressFull: patientData.address.full_address || "No address provided",
                  address: {
                    add_street: patientData.address.add_street,
                    add_barangay: patientData.address.add_barangay,
                    add_city: patientData.address.add_city,
                    add_province: patientData.address.add_province,
                    add_sitio: patientData.address.add_sitio
                  },
                  households: [{ hh_id: patientData.householdno }],
                  personal_info: {
                    per_fname: patientData.personal_info.per_fname,
                    per_mname: patientData.personal_info.per_mname,
                    per_lname: patientData.personal_info.per_lname,
                    per_dob: patientData.personal_info.per_dob,
                    per_sex: patientData.personal_info.per_sex

                  }
                    }
                  }
                }}
              >
                <Button size="sm">
                  <History className="h-4 w-4 mr-2" />
                  View History
                </Button>
              </Link>
            </div>
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
                    const value = Math.max(1, Math.min(+e.target.value, 10)); // Ensure the value is between 1 and 10
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
                  <span className="ml-2 text-gray-600">Loading confirmed items...</span>
                </div>
              ) : confirmedRequestError ? (
                <div className="flex items-center justify-center py-12 text-red-600">
                  <AlertCircle className="h-8 w-8 mr-2" />
                  <span>Error loading confirmed items. Please try again.</span>
                </div>
              ) : tableData.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  <Package className="h-8 w-8 mr-2" />
                  <span>{debouncedSearch ? "No items found for your search" : "No confirmed items found"}</span>
                </div>
              ) : (
                <>
                  <DataTable columns={confirmedItemsColumns} data={tableData} />
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

        {/* Medicine Display */}
        <Card className="mt-4">
          <CardContent>
            <div className="">
              <h3 className="text-lg font-semibold mb-4 mt-3">Select Medicines to Process</h3>
              {/* Show loading state */}
              {isMedicinesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading medicine inventory...</span>
                </div>
              ) : enhancedMedicineStocks.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  <AlertCircle className="h-8 w-8 mr-2" />
                  <div className="text-center">
                    <div>No medicines available for processing</div>
                    <div className="text-sm mt-1">
                      This could be because:
                      <ul className="list-disc list-inside mt-2 text-xs">
                        <li>No confirmed medicine requests exist</li>
                        <li>No matching inventory stocks found</li>
                        <li>Data is still loading</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <MedicineDisplay
                    medicines={enhancedMedicineStocks}
                    initialSelectedMedicines={selectedMedicines}
                    onSelectedMedicinesChange={handleSelectedMedicinesChange}
                    itemsPerPage={10}
                    currentPage={medicineDisplayPage}
                    onPageChange={setMedicineDisplayPage}
                    autoFillReasons={true}
                    isLoading={isMedicinesLoading}
                  />

                  <div className="mt-6">
                    <SignatureField ref={signatureRef} title="Signature" onSignatureChange={handleSignatureChange} required={true} />
                  </div>
                </>
              )}
            </div>

            {/* Debug info for selected medicines */}
            {selectedMedicines.length > 0 && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <h4 className="font-semibold mb-2">Selected Medicines Debug Info:</h4>
                <div className="text-sm">
                  {selectedMedicines.map((med, index) => (
                    <div key={index} className="mb-2 p-2 bg-white rounded">
                      <div>
                        Medicine: <span className="font-semibold text-blue-600">{med.med_name || "Unknown"}</span>
                      </div>
                      <div>
                        MinvId: <span className="text-gray-600">{med.minv_id}</span>
                      </div>
                      <div>
                        Original Stock ID: <span className="text-purple-600">{med.original_stock_id}</span>
                      </div>
                      <div>
                        Qty: <span className="text-green-600">{med.medrec_qty}</span>
                      </div>
                      <div>
                        Reason: <span className="text-orange-600">{med.reason}</span>
                      </div>
                      <div>
                        MedReqItem ID: <span className={med.medreqitem_id ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{med.medreqitem_id || "N/A"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end mt-4">
          <Button onClick={processMedicineAllocation} disabled={confirmedItemsCount === 0 || selectedMedicines.length === 0 || isPending || isRegistering || !signature} size="lg" className="min-w-[200px] bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Process Allocation ({selectedMedicines.length})
              </>
            )}
          </Button>
        </div>
      </div>
    </LayoutWithBack>
  );
}
