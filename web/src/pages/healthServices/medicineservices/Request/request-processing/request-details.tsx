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
import { SignatureField, SignatureFieldRef } from "@/pages/healthServices/reports/firstaid-report/signature";

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
  // const status = request.mode;

  const [searchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [medicineDisplayPage, setMedicineDisplayPage] = useState(1);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState<any[]>([]);
  const [currentPatId, setCurrentPatId] = useState<string | null>(request?.pat_id || null);
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
  const shouldShowRegisterButton = () => {
    // If still checking, don't show button
    if (isCheckingPatient) return false;

    // If patient exists, don't show register button
    if ((patientExists as any)?.exists) return false;

    // Show register button if patient doesn't exist
    return true;
  };

  const patientDataFetch = patientExists as any;

  const isPatientRegistered = () => {
    const patientData = patientExists as any;
    return patientData?.exists && patientData?.pat_id;
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
      // Get the confirmed items for this medicine
      const confirmedItems = confirmedMedicine.request_items?.filter((item: any) => item.status === "confirmed") || [];
      
      confirmedItems.forEach((item: any) => {
        // Check if item has minv_id - if yes, use specific stock; if no, use general medicine stock
        const inventoryId = item.inventory?.minv_id || item.inventory?.id || item.minv_id;
        
        if (inventoryId) {
          // CASE 1: Item has inventory ID - find specific stock
          const matchingStock = medicineStocksOptions.medicines.find((stock: any) => {
            const medIdMatch = String(stock.med_id) === String(confirmedMedicine.med_id);
            const stockIdMatch = String(stock.id) === String(inventoryId) || String(stock.inv_id) === String(inventoryId);
            return medIdMatch && stockIdMatch;
          });
  
          if (matchingStock) {
            const uniqueId = `${confirmedMedicine.med_id}_${matchingStock.id}_${item.medreqitem_id}`;
            const mappedItem = {
              ...matchingStock,
              id: uniqueId,
              display_id: `${confirmedMedicine.med_name} (Stock ID: ${matchingStock.id})`,
              med_name: confirmedMedicine.med_name,
              med_type: confirmedMedicine.med_type,
              medreqitem_id: item.medreqitem_id,
              requested_qty: item.medreqitem_qty,
              confirmed_reason: item.reason || "No reason provided",
              request_item: item,
              confirmed_medicine: confirmedMedicine,
              original_stock_id: matchingStock.id,
              // Add these properties that MedicineDisplay expects
              name: confirmedMedicine.med_name,
              dosage: matchingStock.dosage || "N/A",
              form: matchingStock.form || "N/A",
              avail: matchingStock.avail || 0,
              unit: matchingStock.unit || "pcs",
              expiry: matchingStock.expiry,
              inv_id: matchingStock.inv_id || matchingStock.id,
              // Pre-fill the reason and quantity for autofill
              preFilledReason: item.reason || "No reason provided",
              defaultQuantity: item.medreqitem_qty || 1,
              // Include inventory data if available
              has_minv_id: true, // This item has specific inventory
              minv_id: inventoryId,
              selection_type: "specific_stock" // Track how this was selected
            };
            mappedMedicines.push(mappedItem);
            console.log(`Added specific stock for ${confirmedMedicine.med_name} with inventory ID: ${inventoryId}`);
          }
        } else {
          // CASE 2: No inventory ID - show all available stocks for this medicine
          console.log(`No inventory ID found for ${confirmedMedicine.med_name}, showing all available stocks`);
          
          const availableStocks = medicineStocksOptions.medicines.filter((stock: any) => 
            String(stock.med_id) === String(confirmedMedicine.med_id) && (stock.avail || 0) > 0
          );
  
          if (availableStocks.length > 0) {
            availableStocks.forEach((stock: any, stockIndex: number) => {
              const uniqueId = `${confirmedMedicine.med_id}_${stock.id}_${item.medreqitem_id}_${stockIndex}`;
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
                defaultQuantity: item.medreqitem_qty || 1,
                // No specific inventory assignment
                has_minv_id: false,
                minv_id: null,
                selection_type: "general_stock" // Track how this was selected
              };
              mappedMedicines.push(mappedItem);
              console.log(`Added general stock for ${confirmedMedicine.med_name} from stock ID: ${stock.id}`);
            });
          } else {
            console.log(`No available stock found for medicine ID: ${confirmedMedicine.med_id}`);
          }
        }
      });
    });
  
    console.log(`Total mapped medicines: ${mappedMedicines.length}`);
    console.log(`Breakdown: ${mappedMedicines.filter((m:any) => m.selection_type === "specific_stock").length} specific stocks, ${mappedMedicines.filter((m:any) => m.selection_type === "general_stock").length} general stocks`);
    
    return mappedMedicines;
  };


  const enhancedMedicineStocks = createMedicineMapping();

  // Improved auto-selection logic
  useEffect(() => {
    console.log("=== Auto-selection useEffect triggered ===");
    
    // Check if we have all required data
    if (!medicineData || medicineData.length === 0) {
      console.log("No medicineData available");
      return;
    }
    
    if (!medicineStocksOptions || !medicineStocksOptions.medicines) {
      console.log("No medicineStocksOptions available");
      return;
    }
    
    if (isLoading || isMedicinesLoading) {
      console.log("Data still loading, skipping auto-selection");
      return;
    }
    
    // Only run if we don't already have selected medicines
    if (selectedMedicines.length > 0) {
      console.log("Medicines already selected, skipping auto-selection");
      return;
    }
    
    console.log("Starting auto-selection process...");
    console.log("Available medicine data:", medicineData);
    console.log("Available stock options:", medicineStocksOptions.medicines);
    
    const autoSelectedMedicines: any[] = [];
    
    medicineData.forEach((confirmedMedicine: any, medicineIndex: number) => {
      console.log(`\n--- Processing medicine ${medicineIndex + 1}: ${confirmedMedicine.med_name} (ID: ${confirmedMedicine.med_id}) ---`);
      
      const confirmedItems = confirmedMedicine.request_items?.filter((item: any) => item.status === "confirmed") || [];
      console.log(`Found ${confirmedItems.length} confirmed items`);
      
      confirmedItems.forEach((item: any, itemIndex: number) => {
        console.log(`\n  Processing item ${itemIndex + 1}:`, {
          medreqitem_id: item.medreqitem_id,
          quantity: item.medreqitem_qty,
          reason: item.reason,
          inventory: item.inventory
        });
        
        // Check different possible structures for inventory ID
        const inventoryId = item.inventory?.minv_id || item.inventory?.id || item.minv_id;
        
        if (!inventoryId) {
          console.log(`  ❌ No inventory ID found for item ${item.medreqitem_id}`);
          return;
        }
        
        console.log(`  🔍 Looking for stock with ID: ${inventoryId} for medicine ID: ${confirmedMedicine.med_id}`);
        
        // Find matching stock in medicineStocksOptions
        const matchingStock = medicineStocksOptions.medicines.find((stock: any) => {
          const medIdMatch = String(stock.med_id) === String(confirmedMedicine.med_id);
          const stockIdMatch = String(stock.id) === String(inventoryId) || String(stock.inv_id) === String(inventoryId);
          
          console.log(`    Checking stock ID ${stock.id}:`, {
            stockMedId: stock.med_id,
            stockId: stock.id,
            stockInvId: stock.inv_id,
            medIdMatch,
            stockIdMatch
          });
          
          return medIdMatch && stockIdMatch;
        });
        
        if (matchingStock) {
          console.log(`  ✅ Found matching stock:`, matchingStock);
          
          // Create the unique composite ID as used in enhancedMedicineStocks
          const uniqueId = `${confirmedMedicine.med_id}_${matchingStock.id}_${item.medreqitem_id}`;
          
          const autoSelectedMedicine = {
            minv_id: uniqueId, // Use the composite ID that MedicineDisplay expects
            medreqitem_id: item.medreqitem_id,
            med_name: confirmedMedicine.med_name,
            med_id: confirmedMedicine.med_id,
            original_stock_id: matchingStock.id,
            medrec_qty: item.medreqitem_qty || 1,
            reason: item.reason || "No reason provided",
          };
          
          console.log(`  📦 Auto-selecting medicine:`, autoSelectedMedicine);
          autoSelectedMedicines.push(autoSelectedMedicine);
        } else {
          console.log(`  ❌ No matching stock found for item ${item.medreqitem_id}`);
          
          // Debug: Show all available stocks for this medicine
          const availableStocks = medicineStocksOptions.medicines.filter((stock: any) => 
            String(stock.med_id) === String(confirmedMedicine.med_id)
          );
          console.log(`  Available stocks for medicine ${confirmedMedicine.med_id}:`, availableStocks);
        }
      });
    });
    
    console.log(`\n=== Auto-selection complete ===`);
    console.log(`Total medicines auto-selected: ${autoSelectedMedicines.length}`);
    console.log('Auto-selected medicines:', autoSelectedMedicines);
    
    if (autoSelectedMedicines.length > 0) {
      setSelectedMedicines(autoSelectedMedicines);
    } else {
      
      // Additional debugging
      const totalConfirmedItems = medicineData.reduce((count: number, med: any) => {
        return count + (med.request_items?.filter((item: any) => item.status === "confirmed").length || 0);
      }, 0);
      
      console.log("Debug summary:", {
        totalMedicines: medicineData.length,
        totalConfirmedItems,
        totalStockOptions: medicineStocksOptions.medicines.length,
        selectedMedicinesLength: selectedMedicines.length
      });
    }
  }, [medicineData, medicineStocksOptions, isLoading, isMedicinesLoading]); // Removed enhancedMedicineStocks from dependencies

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
      pat_id: currentPatId || patientDataFetch?.pat_id,
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
            rp_id={request.pat_id || request.rp_id}
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
                to="/services/medicine/records"
                state={{
                  params: {
                    patientData: {
                      pat_id: currentPatId,
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

        {/* Debug Component - Only in Development
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-4 border-yellow-200 bg-yellow-50">
            <CardContent>
              <h4 className="font-semibold mb-2 text-yellow-800">🐛 Auto-Selection Debug Info</h4>
              
              <div className="space-y-4 text-sm">
                <div>
                  <h5 className="font-semibold text-gray-700">Data Loading Status:</h5>
                  <ul className="list-disc list-inside text-gray-600">
                    <li>Medicine Data Loading: <span className={isLoading ? "text-red-600" : "text-green-600"}>{isLoading ? "Yes" : "No"}</span></li>
                    <li>Medicine Stocks Loading: <span className={isMedicinesLoading ? "text-red-600" : "text-green-600"}>{isMedicinesLoading ? "Yes" : "No"}</span></li>
                    <li>Medicine Data Length: <span className="text-blue-600">{medicineData.length}</span></li>
                    <li>Stock Options Available: <span className="text-blue-600">{medicineStocksOptions?.medicines?.length || 0}</span></li>
                    <li>Enhanced Stocks Length: <span className="text-blue-600">{enhancedMedicineStocks.length}</span></li>
                    <li>Currently Selected: <span className="text-purple-600">{selectedMedicines.length}</span></li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-700">Medicine Data Structure:</h5>
                  {medicineData.map((med: any, index: number) => (
                    <div key={index} className="ml-4 mb-3 p-2 bg-white rounded border">
                      <div><strong>Medicine:</strong> {med.med_name} (ID: {med.med_id})</div>
                      <div><strong>Confirmed Items:</strong></div>
                      {med.request_items?.filter((item: any) => item.status === "confirmed").map((item: any, itemIndex: number) => (
                        <div key={itemIndex} className="ml-4 p-1 bg-gray-100 rounded text-xs">
                          <div>Item ID: {item.medreqitem_id}</div>
                          <div>Quantity: {item.medreqitem_qty}</div>
                          <div>Status: {item.status}</div>
                          <div>Reason: {item.reason}</div>
                          <div className="text-red-600">
                            <strong>Inventory:</strong> {JSON.stringify(item.inventory, null, 2)}
                          </div>
                          <div className="text-purple-600">
                            <strong>Has MinvId:</strong> {item.inventory?.minv_id ? `Yes (${item.inventory.minv_id})` : "No"}
                          </div>
                          <div className="text-blue-600">
                            <strong>Will Show in Selection:</strong> {item.inventory?.minv_id ? "Yes" : "No"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div>
                  <h5 className="font-semibold text-gray-700">Items WITHOUT MinvId (Will be skipped):</h5>
                  {medicineData.map((med: any, index: number) => {
                    const itemsWithoutMinvId = med.request_items?.filter((item: any) => 
                      item.status === "confirmed" && !item.inventory?.minv_id
                    ) || [];
                    
                    if (itemsWithoutMinvId.length === 0) return null;
                    
                    return (
                      <div key={index} className="ml-4 mb-3 p-2 bg-red-50 rounded border border-red-200">
                        <div><strong>Medicine:</strong> {med.med_name} (ID: {med.med_id})</div>
                        <div><strong>Items without MinvId:</strong></div>
                        {itemsWithoutMinvId.map((item: any, itemIndex: number) => (
                          <div key={itemIndex} className="ml-4 p-1 bg-red-100 rounded text-xs">
                            <div>Item ID: {item.medreqitem_id}</div>
                            <div>Quantity: {item.medreqitem_qty}</div>
                            <div className="text-red-600">⚠️ No minv_id - Will be excluded from selection</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                <div>
                  <h5 className="font-semibold text-gray-700">Available Stock Options (First 3):</h5>
                  {medicineStocksOptions?.medicines?.slice(0, 3).map((stock: any, index: number) => (
                    <div key={index} className="ml-4 mb-2 p-2 bg-white rounded border text-xs">
                      <div>Stock ID: {stock.id}</div>
                      <div>Inv ID: {stock.inv_id}</div>
                      <div>Med ID: {stock.med_id}</div>
                      <div>Medicine: {stock.med_name}</div>
                      <div>Available: {stock.avail}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <h5 className="font-semibold text-gray-700">Enhanced Medicine Stocks (First 3):</h5>
                  {enhancedMedicineStocks.slice(0, 3).map((enhanced: any, index: number) => (
                    <div key={index} className="ml-4 mb-2 p-2 bg-white rounded border text-xs">
                      <div>Unique ID: {enhanced.id}</div>
                      <div>Original Stock ID: {enhanced.original_stock_id}</div>
                      <div>Med ID: {enhanced.med_id}</div>
                      <div>Medicine: {enhanced.med_name}</div>
                      <div>Request Item ID: {enhanced.medreqitem_id}</div>
                      <div>Has MinvId: {enhanced.has_minv_id ? "Yes" : "No"}</div>
                      <div>MinvId: {enhanced.minv_id}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )} */}

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
                        <li>No confirmed medicine requests have specific inventory assignments (minv_id)</li>
                        <li>The assigned inventory stocks are not found in current stock</li>
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

            {/* Debug info for selected medicines
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
                      <div>
                        Auto-selected: <span className="text-blue-600">{med.inventory?.minv_id ? "Yes (by minv_id)" : "No"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )} */}
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
                Submit ({selectedMedicines.length})   
              </>
            )}
          </Button>
        </div>
      </div>
    </LayoutWithBack>
  );
}