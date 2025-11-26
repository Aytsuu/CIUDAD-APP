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

  const patientData = location.state?.params?.patientData;
  const request = location.state?.params?.request as any;

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

  const shouldShowRegisterButton = () => {
    if (isCheckingPatient) return false;
    if ((patientExists as any)?.exists) return false;
    return true;
  };

  const patientDataFetch = patientExists as any;

  const isPatientRegistered = () => {
    const patientData = patientExists as any;
    return patientData?.exists && patientData?.pat_id;
  };

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
      const displayQuantity = item.allocations?.reduce((sum: number, alloc: any) => sum + (alloc.allocated_qty || 0), 0) || 0;
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
        allocations: item.allocations || [],
        total_allocated_qty: item.total_allocated_qty || 0,
        remaining_qty: item.remaining_qty || item.medreqitem_qty,
        is_fully_allocated: item.is_fully_allocated || false,
        display_quantity: displayQuantity,
        medreqitem_qty: displayQuantity,
      };
    })
  );

  const confirmedItemsCount = medicineData.reduce((count: any, medicine: any) => {
    const confirmedItems = medicine.request_items.filter((item: any) => item.status === "confirmed");
    return count + confirmedItems.length;
  }, 0);

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

  // Enhanced mapping: auto-select allocations, fallback to stock if no allocations
  const createMedicineMapping = () => {
    if (!medicineData?.length) return [];
    const mappedMedicines: any = [];
    medicineData.forEach((confirmedMedicine: any) => {
      const confirmedItems = confirmedMedicine.request_items?.filter((item: any) => item.status === "confirmed") || [];
      confirmedItems.forEach((item: any) => {
        if (item.allocations && item.allocations.length > 0) {
          item.allocations.forEach((allocation: any) => {
            const uniqueId = `${confirmedMedicine.med_id}_${allocation.minv_id}_${item.medreqitem_id}_alloc_${allocation.alloc_id}`;
            const minvDetails = allocation.minv_details || {};
            const invDetails = allocation.inv_details || {};
            mappedMedicines.push({
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
              name: allocation.minv_name || confirmedMedicine.med_name,
              dosage: allocation.minv_dsg ? `${allocation.minv_dsg} ${allocation.minv_dsg_unit || ""}` : "N/A",
              form: allocation.minv_form || "N/A",
              avail: minvDetails.minv_qty_avail || allocation.allocated_qty,
              unit: minvDetails.minv_qty_unit || "pcs",
              expiry: invDetails.expiry_date || null,
              inv_id: allocation.inv_id || allocation.minv_id,
              preFilledReason: item.reason || "No reason provided",
              defaultQuantity: allocation.allocated_qty,
              has_minv_id: true,
              minv_id: allocation.minv_id,
              selection_type: "allocation",
              allocation_id: allocation.alloc_id,
              created_at: allocation.created_at,
              pcs_per_box: minvDetails.minv_pcs || 0,
              total_quantity: minvDetails.minv_qty || 0,
              wasted: minvDetails.wasted || 0,
              temporary_deduction: minvDetails.temporary_deduction || 0,
              is_archived: invDetails.is_archived || false,
              is_auto_selected: true,
            });
          });
        } else if (medicineStocksOptions?.medicines) {
          // Fallback: auto-select from stock if no allocations
          const stock = medicineStocksOptions.medicines.find(
            (s: any) => String(s.med_id) === String(confirmedMedicine.med_id)
          );
          if (stock) {
            mappedMedicines.push({
              id: `${confirmedMedicine.med_id}_${stock.id}_${item.medreqitem_id}`,
              display_id: `${confirmedMedicine.med_name} (Stock ID: ${stock.id})`,
              med_name: confirmedMedicine.med_name,
              med_type: confirmedMedicine.med_type,
              medreqitem_id: item.medreqitem_id,
              requested_qty: item.medreqitem_qty,
              confirmed_reason: item.reason || "No reason provided",
              request_item: item,
              confirmed_medicine: confirmedMedicine,
              original_stock_id: stock.id,
              name: confirmedMedicine.med_name,
              dosage: confirmedMedicine.med_dsg ? `${confirmedMedicine.med_dsg} ${confirmedMedicine.med_dsg_unit || ""}` : "N/A",
              form: confirmedMedicine.med_form || "N/A",
              avail: stock.avail || 0,
              unit: stock.unit || "pcs",
              expiry: stock.expiry || null,
              inv_id: stock.inv_id || stock.id,
              preFilledReason: item.reason || "No reason provided",
              defaultQuantity: item.medreqitem_qty || 1,
              has_minv_id: true,
              minv_id: stock.id,
              selection_type: "stock",
              allocation_id: null,
              created_at: null,
              pcs_per_box: stock.minv_pcs || 0,
              total_quantity: stock.minv_qty || 0,
              wasted: stock.wasted || 0,
              temporary_deduction: stock.temporary_deduction || 0,
              is_archived: stock.is_archived || false,
              is_auto_selected: true,
            });
          }
        }
      });
    });
    return mappedMedicines;
  };

  const enhancedMedicineStocks = createMedicineMapping();

  useEffect(() => {
    // Always auto-select medicines with is_auto_selected and quantity > 0
    const autoSelectedMedicines = enhancedMedicineStocks
      .filter((med: any) => med.is_auto_selected && (med.medrec_qty ?? med.requested_qty ?? med.defaultQuantity) > 0)
      .map((med: any) => ({
        minv_id: med.minv_id,
        medreqitem_id: med.medreqitem_id,
        med_name: med.med_name,
        med_id: med.med_id,
        med_type: med.med_type,
        med_dsg: med.dosage,
        med_form: med.form,
        med_dsg_unit: med.dsg_unit,
        original_stock_id: med.original_stock_id,
        medrec_qty: med.medrec_qty ?? med.requested_qty ?? med.defaultQuantity,
        reason: med.reason || med.confirmed_reason || "No reason provided",
        allocation_id: med.allocation_id,
        is_from_allocation: !!med.allocation_id,
        is_auto_selected: true,
        s_from_allocation: true,
      }));
    autoSelectedMedicines.push(autoSelectedMedicines);
  }, [enhancedMedicineStocks]);

  const getMedicineDataByUniqueId = (uniqueId: string) => {
    return enhancedMedicineStocks.find((med: any) => med.id === uniqueId);
  };

  const handleSelectedMedicinesChange = (updatedSelectedMedicines: any[]) => {
    const enhancedSelectedMedicines = updatedSelectedMedicines.map((selectedMed: any) => {
      const medicineData = getMedicineDataByUniqueId(selectedMed.minv_id);
      if (medicineData) {
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
          minv_id: selectedMed.minv_id,
          medrec_qty: quantity,
          reason: reason,
        };
      }
      return selectedMed;
    });
    setSelectedMedicines(enhancedSelectedMedicines);
  };

  const { mutate: createAllocation, isPending } = useCreateMedicineAllocation();
  const processMedicineAllocation = () => {
    const validSelectedMedicines = selectedMedicines.filter((med) => med.medreqitem_id && med.minv_id && med.medrec_qty > 0);
    if (validSelectedMedicines.length === 0) {
      return;
    }
    const payload = {
      medreq_id: request.medreq_id,
      requested_at: request.requested_at,
      staff_id: staff_id,
      signature: signature,
      mode: request.mode,
      pat_id: currentPatId || patientDataFetch?.pat_id,
      selected_medicines: validSelectedMedicines.map((med) => ({
        minv_id: med.original_stock_id || med.minv_id,
        medrec_qty: med.medrec_qty,
        medreqitem_id: med.medreqitem_id,
        reason: med.reason,
      })),
    };
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
        <div className="mb-5">
          <PersonalInfoCard
            personalInfo={request.personal_info}
            address={request.address}
            currentPatId={currentPatId || request.pat_id}
            rp_id={request.pat_id || request.rp_id}
            medreq_id={request.medreq_id}
            onPatientRegistered={handleRegisterPatient}
            shouldShowRegisterButton={shouldShowRegisterButton()}
            isPatientRegistered={isPatientRegistered()}
            isCheckingPatient={isCheckingPatient}
            patientExists={patientExists}
          />
        </div>
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <CardTitle>
                Medicine Requests <span className="bg-red-500 text-white rounded-full text-sm px-2"> {totalCount}</span>
              </CardTitle>
              <CardDescription>Review medicine requests and their allocations</CardDescription>
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
        <Card className="mt-4">
          <CardContent>
            <div className="">
              <h3 className="text-lg font-semibold mb-4 mt-3">Review Allocated Medicines</h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading allocated medicines...</span>
                </div>
              ) : enhancedMedicineStocks.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  <AlertCircle className="h-8 w-8 mr-2" />
                  <div className="text-center">
                    <div>No allocated medicines found</div>
                    <div className="text-sm mt-1">
                      <span>No allocations have been made for this medicine request yet.</span>
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
          </CardContent>
        </Card>
        <div className="flex justify-end mt-4">
          <Button
            onClick={processMedicineAllocation}
            disabled={confirmedItemsCount === 0 || selectedMedicines.length === 0 || isPending || isRegistering || !signature}
            size="lg"
            className="min-w-[200px] bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {`Submit (${selectedMedicines.length})`}
              </>
            )}
          </Button>
        </div>
      </div>
    </LayoutWithBack>
  );
}