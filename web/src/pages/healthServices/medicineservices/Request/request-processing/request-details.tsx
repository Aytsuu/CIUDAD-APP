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

  const isAppMode = request?.mode === "app"; // Check if mode is app

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
    if (patientData?.exists && patientData?.pat_id) {
      setCurrentPatId(patientData.pat_id || request.pat_id || null);
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
    medicine.request_items.map((item: any) => {
      // For app mode, use the sum of allocated quantities instead of medreqitem_qty
      const displayQuantity = isAppMode ? item.allocations?.reduce((sum: number, alloc: any) => sum + (alloc.allocated_qty || 0), 0) || 0 : item.medreqitem_qty || 0;

      return {
        ...item,
        med_name: medicine.med_name,
        med_type: medicine.med_type,
        total_available_stock: medicine.total_available_stock,
        med_id: medicine.med_id,
        reason: item.reason || "No reason provided",
        medreq_id: item.medreq_id,
        med_dsg: medicine.med_dsg || "",
        med_form: medicine.med_form || "",
        med_dsg_unit: medicine.med_dsg_unit || "",
        // Include allocation data if available
        allocations: item.allocations || [],
        total_allocated_qty: item.total_allocated_qty || 0,
        remaining_qty: item.remaining_qty || item.medreqitem_qty,
        is_fully_allocated: item.is_fully_allocated || false,
        // Use allocated quantity sum for display in app mode
        display_quantity: displayQuantity,
        medreqitem_qty: displayQuantity, // Override the original quantity for display
      };
    })
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
        pat_type: "Resident",
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

  // Create medicine mapping - different logic for app mode vs non-app mode
  const createMedicineMapping = () => {
    if (!medicineData?.length) {
      return [];
    }

    // APP MODE: Create mapping from allocations
    if (isAppMode) {
      console.log("=== Creating medicine mapping for APP MODE ===");
      const mappedMedicines: any = [];

      medicineData.forEach((confirmedMedicine: any) => {
        const confirmedItems = confirmedMedicine.request_items?.filter((item: any) => item.status === "confirmed") || [];

        confirmedItems.forEach((item: any) => {
          if (item.allocations && item.allocations.length > 0) {
            item.allocations.forEach((allocation: any) => {
              const uniqueId = `${confirmedMedicine.med_id}_${allocation.minv_id}_${item.medreqitem_id}_alloc_${allocation.alloc_id}`;

              // Extract detailed information from minv_details and inv_details
              const minvDetails = allocation.minv_details || {};
              const invDetails = allocation.inv_details || {};

              const mappedItem = {
                id: uniqueId,
                display_id: `${allocation.minv_name || confirmedMedicine.med_name} (Inv ID: ${allocation.inv_id})`,
                med_name: confirmedMedicine.med_name,
                med_type: confirmedMedicine.med_type,
                medreqitem_id: item.medreqitem_id,
                requested_qty: allocation.allocated_qty,
                confirmed_reason: item.reason || "No reason provided",
                request_item: item,
                confirmed_medicine: confirmedMedicine,
                original_stock_id: allocation.minv_id,
                // Use detailed information from minv_details
                name: allocation.minv_name || confirmedMedicine.med_name,
                dosage: allocation.minv_dsg ? `${allocation.minv_dsg} ${allocation.minv_dsg_unit || ""}` : "N/A",
                form: allocation.minv_form || "N/A",
                avail: minvDetails.minv_qty_avail || allocation.allocated_qty,
                unit: minvDetails.minv_qty_unit || "pcs",
                // Use expiry from inv_details
                expiry: invDetails.expiry_date || null,
                inv_id: allocation.inv_id || allocation.minv_id,
                preFilledReason: item.reason || "No reason provided",
                defaultQuantity: allocation.allocated_qty,
                has_minv_id: true,
                minv_id: allocation.minv_id,
                selection_type: "allocation",
                allocation_id: allocation.alloc_id,
                created_at: allocation.created_at,
                // Additional details for display
                pcs_per_box: minvDetails.minv_pcs || 0,
                total_quantity: minvDetails.minv_qty || 0,
                wasted: minvDetails.wasted || 0,
                temporary_deduction: minvDetails.temporary_deduction || 0,
                is_archived: invDetails.is_archived || false,
                // Mark as auto-selected for MedicineDisplay
                is_auto_selected: true,
              };

              mappedMedicines.push(mappedItem);
              console.log(`Mapped allocation ${allocation.alloc_id}:`, mappedItem);
            });
          }
        });
      });

      console.log(`Total mapped medicines from allocations: ${mappedMedicines.length}`);
      return mappedMedicines;
    }

    // NON-APP MODE: Original logic
    if (!medicineStocksOptions) {
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
              dosage: confirmedMedicine.dosage || `${confirmedMedicine?.med_dsg || 0} ${confirmedMedicine?.med_dsg_unit || ""}`.trim(),
              form: confirmedMedicine.med_form || "",
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
              selection_type: "specific_stock", // Track how this was selected
              is_auto_selected: true,
            };
            mappedMedicines.push(mappedItem);
            console.log(`Added specific stock for ${confirmedMedicine.med_name} with inventory ID: ${inventoryId}`);
          }
        } else {
          // CASE 2: No inventory ID - show all available stocks for this medicine
          console.log(`No inventory ID found for ${confirmedMedicine.med_name}, showing all available stocks`);

          const availableStocks = medicineStocksOptions.medicines.filter((stock: any) => String(stock.med_id) === String(confirmedMedicine.med_id) && (stock.avail || 0) > 0);

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
                dosage: `${confirmedMedicine?.med_dsg || 0} ${confirmedMedicine?.med_dsg_unit || ""}`.trim(),
                form: confirmedMedicine?.med_form || "",
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
                selection_type: "general_stock", // Track how this was selected
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
    console.log(
      `Breakdown: ${mappedMedicines.filter((m: any) => m.selection_type === "specific_stock").length} specific stocks, ${
        mappedMedicines.filter((m: any) => m.selection_type === "general_stock").length
      } general stocks`
    );

    return mappedMedicines;
  };

  const enhancedMedicineStocks = createMedicineMapping();

  // Improved auto-selection logic - handles both app mode and non-app mode
  useEffect(() => {
    console.log("=== Auto-selection useEffect triggered ===");
    console.log("Mode:", isAppMode ? "APP MODE" : "NON-APP MODE");

    // Check if we have all required data
    if (!medicineData || medicineData.length === 0) {
      console.log("No medicineData available");
      return;
    }

    if (isLoading) {
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

    const autoSelectedMedicines: any[] = [];

    if (isAppMode) {
      // APP MODE: Auto-select based on allocations
      console.log("=== APP MODE: Processing allocations ===");

      medicineData.forEach((confirmedMedicine: any, medicineIndex: number) => {
        console.log(`\n--- Processing medicine ${medicineIndex + 1}: ${confirmedMedicine.med_name} (ID: ${confirmedMedicine.med_id}) ---`);

        const confirmedItems = confirmedMedicine.request_items?.filter((item: any) => item.status === "confirmed") || [];
        console.log(`Found ${confirmedItems.length} confirmed items`);

        confirmedItems.forEach((item: any, itemIndex: number) => {
          console.log(`\n  Processing item ${itemIndex + 1}:`, {
            medreqitem_id: item.medreqitem_id,
            quantity: item.medreqitem_qty,
            reason: item.reason,
            allocations: item.allocations,
          });

          // Check if item has allocations
          if (item.allocations && item.allocations.length > 0) {
            console.log(`  Found ${item.allocations.length} allocation(s) for this item`);

            // Process each allocation
            item.allocations.forEach((allocation: any, allocIndex: number) => {
              console.log(`    Processing allocation ${allocIndex + 1}:`, allocation);

              const uniqueId = `${confirmedMedicine.med_id}_${allocation.minv_id}_${item.medreqitem_id}_alloc_${allocation.alloc_id}`;

              const autoSelectedMedicine = {
                minv_id: uniqueId,
                medreqitem_id: item.medreqitem_id,
                med_name: confirmedMedicine.med_name,
                med_id: confirmedMedicine.med_id,
                original_stock_id: allocation.minv_id,
                medrec_qty: allocation.allocated_qty,
                reason: item.reason || "No reason provided",
                allocation_id: allocation.alloc_id,
                is_from_allocation: true,
              };

              console.log(`    ✅ Auto-selecting from allocation:`, autoSelectedMedicine);
              autoSelectedMedicines.push(autoSelectedMedicine);
            });
          } else {
            console.log(`  ⚠️ No allocations found for item ${item.medreqitem_id}`);
          }
        });
      });
    } else {
      // NON-APP MODE: Auto-select based on inventory (original logic)
      console.log("=== NON-APP MODE: Processing inventory ===");

      if (!medicineStocksOptions || !medicineStocksOptions.medicines) {
        console.log("No medicineStocksOptions available");
        return;
      }

      if (isMedicinesLoading) {
        console.log("Medicine stocks still loading");
        return;
      }

      console.log("Available stock options:", medicineStocksOptions.medicines);

      medicineData.forEach((confirmedMedicine: any, medicineIndex: number) => {
        console.log(`\n--- Processing medicine ${medicineIndex + 1}: ${confirmedMedicine.med_name} (ID: ${confirmedMedicine.med_id}) ---`);

        const confirmedItems = confirmedMedicine.request_items?.filter((item: any) => item.status === "confirmed") || [];
        console.log(`Found ${confirmedItems.length} confirmed items`);

        confirmedItems.forEach((item: any, itemIndex: number) => {
          console.log(`\n  Processing item ${itemIndex + 1}:`, {
            medreqitem_id: item.medreqitem_id,
            quantity: item.medreqitem_qty,
            reason: item.reason,
            inventory: item.inventory,
          });

          const inventoryId = item.inventory?.minv_id || item.inventory?.id || item.minv_id;

          if (!inventoryId) {
            console.log(`  ❌ No inventory ID found for item ${item.medreqitem_id}`);
            return;
          }

          console.log(`  🔍 Looking for stock with ID: ${inventoryId} for medicine ID: ${confirmedMedicine.med_id}`);

          const matchingStock = medicineStocksOptions.medicines.find((stock: any) => {
            const medIdMatch = String(stock.med_id) === String(confirmedMedicine.med_id);
            const stockIdMatch = String(stock.id) === String(inventoryId) || String(stock.inv_id) === String(inventoryId);

            console.log(`    Checking stock ID ${stock.id}:`, {
              stockMedId: stock.med_id,
              stockId: stock.id,
              stockInvId: stock.inv_id,
              medIdMatch,
              stockIdMatch,
            });

            return medIdMatch && stockIdMatch;
          });

          if (matchingStock) {
            console.log(`  ✅ Found matching stock:`, matchingStock);

            const uniqueId = `${confirmedMedicine.med_id}_${matchingStock.id}_${item.medreqitem_id}`;

            const autoSelectedMedicine = {
              minv_id: uniqueId,
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

            const availableStocks = medicineStocksOptions.medicines.filter((stock: any) => String(stock.med_id) === String(confirmedMedicine.med_id));
            console.log(`  Available stocks for medicine ${confirmedMedicine.med_id}:`, availableStocks);
          }
        });
      });
    }

    console.log(`\n=== Auto-selection complete ===`);
    console.log(`Total medicines auto-selected: ${autoSelectedMedicines.length}`);
    console.log("Auto-selected medicines:", autoSelectedMedicines);

    if (autoSelectedMedicines.length > 0) {
      setSelectedMedicines(autoSelectedMedicines);
    } else {
      const totalConfirmedItems = medicineData.reduce((count: number, med: any) => {
        return count + (med.request_items?.filter((item: any) => item.status === "confirmed").length || 0);
      }, 0);

      console.log("Debug summary:", {
        mode: isAppMode ? "app" : "non-app",
        totalMedicines: medicineData.length,
        totalConfirmedItems,
        totalStockOptions: medicineStocksOptions?.medicines?.length || 0,
        selectedMedicinesLength: selectedMedicines.length,
      });
    }
  }, [medicineData, medicineStocksOptions, isLoading, isMedicinesLoading, isAppMode]);

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
          med_type: medicineData.med_type,
          med_dsg: medicineData.dosage,
          med_form: medicineData.form,
          med_dsg_unit: medicineData.dsg_unit,
          original_stock_id: medicineData.original_stock_id,
          minv_id: selectedMed.minv_id, // Keep the unique ID as minv_id
          medrec_qty: quantity, // Use autofilled quantity
          reason: reason, // Use existing reason or auto-fill from confirmed data
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
      mode: request.mode,
      pat_id: currentPatId || patientDataFetch?.pat_id,
      selected_medicines: validSelectedMedicines.map((med) => ({
        minv_id: med.original_stock_id || med.minv_id, // Use original stock ID for API
        medrec_qty: med.medrec_qty,
        medreqitem_id: med.medreqitem_id,
        reason: med.reason, // Include reason in payload
      })),
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
              <CardDescription>{isAppMode ? "Review medicine requests and their allocations" : "Review confirmed medicine request items before confirmation"}</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/services/medicine/records/individual-records"
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
                        add_sitio: patientData.address.add_sitio,
                      },
                      households: [{ hh_id: patientData.householdno }],
                      personal_info: {
                        per_fname: patientData.personal_info.per_fname,
                        per_mname: patientData.personal_info.per_mname,
                        per_lname: patientData.personal_info.per_lname,
                        per_dob: patientData.personal_info.per_dob,
                        per_sex: patientData.personal_info.per_sex,
                      },
                    },
                  },
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

        {/* Medicine Display - Show for both modes but with different behavior */}
        <Card className="mt-4">
          <CardContent>
            <div className="">
              <h3 className="text-lg font-semibold mb-4 mt-3">{isAppMode ? "Review Allocated Medicines" : "Select Medicines to Process"}</h3>
              {/* Show loading state */}
              {(isAppMode ? isLoading : isMedicinesLoading) ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">{isAppMode ? "Loading allocated medicines..." : "Loading medicine inventory..."}</span>
                </div>
              ) : enhancedMedicineStocks.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  <AlertCircle className="h-8 w-8 mr-2" />
                  <div className="text-center">
                    <div>{isAppMode ? "No allocated medicines found" : "No medicines available for processing"}</div>
                    <div className="text-sm mt-1">
                      {isAppMode ? (
                        <span>No allocations have been made for this medicine request yet.</span>
                      ) : (
                        <>
                          This could be because:
                          <ul className="list-disc list-inside mt-2 text-xs">
                            <li>No confirmed medicine requests have specific inventory assignments (minv_id)</li>
                            <li>The assigned inventory stocks are not found in current stock</li>
                            <li>Data is still loading</li>
                          </ul>
                        </>
                      )}
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
                    isLoading={isAppMode ? isLoading : isMedicinesLoading}
                  />

                  <div className="mt-6">
                    <SignatureField ref={signatureRef} title="Signature" onSignatureChange={handleSignatureChange} required={true} />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end mt-4">
          <Button
            onClick={processMedicineAllocation}
            disabled={confirmedItemsCount === 0 || selectedMedicines.length === 0 || isPending || isRegistering || !signature}
            size="lg"
            className="min-w-[200px] bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
          >
            {isPending ? (
              <>
                {" "}
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {isAppMode ? `Complete Request (${selectedMedicines.length})` : `Submit (${selectedMedicines.length})`}
              </>
            )}
          </Button>
        </div>
      </div>
    </LayoutWithBack>
  );
}
