"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { fetchMedicinesWithStock } from "@/pages/healthServices/medicineservices/restful-api/fetchAPI";
import {
  MedicineRequestArraySchema,
  MedicineRequestArrayType,
  MedicineRequestSchema,
} from "@/form-schema/medicineRequest";
import { MedicineDisplay } from "@/components/ui/medicine-display";
import { RequestSummary } from "@/components/ui/medicine-sumdisplay";
import { api2 } from "@/api/api"; // Adjust import path as needed

export default function PrescriptionMedicineStocks() {
    
  const navigate = useNavigate();
  const [showSummary, setShowSummary] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { medicineStocksOptions, isLoading: isMedicinesLoading } =
    fetchMedicinesWithStock();
  const [selectedMedicines, setSelectedMedicines] = useState<
    { minv_id: string; medrec_qty: number; reason: string }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const form = useForm<MedicineRequestArrayType>({
    resolver: zodResolver(MedicineRequestArraySchema),
    defaultValues: {
      pat_id: "", // Initialize with empty or default patient ID
      medicines: [],
    },
  });

  const handleSelectedMedicinesChange = useCallback(
    (updatedMedicines: { minv_id: string; medrec_qty: number; reason: string }[]) => {
      setSelectedMedicines(updatedMedicines);
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    form.setValue("medicines", selectedMedicines);
  }, [selectedMedicines, form]);

  const onSubmit = async (data: MedicineRequestArrayType) => {
    setIsConfirming(true);
    
    try {
      const requestData = {
        pat_id: data.pat_id,
        medicines: data.medicines.map(med => ({
          minv_id: med.minv_id,
          medrec_qty: med.medrec_qty,
          reason: med.reason || ""
        }))
      };

      const response = await api2.post("medicine/medicine-request-items/", requestData);

      if (response.status >= 200 && response.status < 300) {
        toast.success("Medicine request submitted successfully!");
        navigate("/medicine-requests/confirmation", { 
          state: { requestId: response.data.medreq_id } 
        });
      } else {
        throw new Error(response.data?.message || "Failed to submit request");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit medicine request. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  const totalSelectedQuantity = selectedMedicines.reduce(
    (sum, med) => sum + med.medrec_qty,
    0
  );

  // Check for invalid quantities (less than 1 or exceeds available stock)
  const hasInvalidQuantities = selectedMedicines.some((med) => {
    const medicine = medicineStocksOptions.find(m => m.id === med.minv_id);
    return med.medrec_qty < 1 || (medicine && med.medrec_qty > medicine.avail);
  });

  // Check for medicines that exceed available stock
  const hasExceededStock = selectedMedicines.some((med) => {
    const medicine = medicineStocksOptions.find(m => m.id === med.minv_id);
    return medicine && med.medrec_qty > medicine.avail;
  });

  
  const handlePreview = useCallback(() => {
    if (selectedMedicines.length === 0 || hasInvalidQuantities) {
      toast.error("Please complete all required fields");
      return;
    }
    setShowSummary(true);
  }, [selectedMedicines, hasInvalidQuantities]);


  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Button
            className="text-black p-2 mb-2 self-start"
            variant={"outline"}
            onClick={() => navigate(-1)}
          >
            <ChevronLeft />
          </Button>
          <div className="flex-col items-center ">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Medicine Request
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Request medicines
            </p>
          </div>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />

        <div className="bg-white rounded-md pt-10 pb-5">
          {isMedicinesLoading ? (
            <div className="p-4 flex justify-center items-center space-y-4">
              <p className="text-center text-red-600">Loading medicines...</p>
            </div>
          ) : (
            <div className="w-full">
              {showSummary ? (
                <div className="w-full overflow-x-auto">
                  <RequestSummary
                    selectedMedicines={selectedMedicines}
                    medicineStocksOptions={medicineStocksOptions}
                    totalSelectedQuantity={totalSelectedQuantity}
                  />
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <MedicineDisplay
                    medicines={medicineStocksOptions}
                    initialSelectedMedicines={selectedMedicines}
                    onSelectedMedicinesChange={handleSelectedMedicinesChange}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          )}

          {selectedMedicines.length > 0 && !showSummary && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mt-5 mr-5">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    {selectedMedicines.length} medicine
                    {selectedMedicines.length > 1 ? "s" : ""} selected
                  </p>
                  <p className="text-xs text-emerald-700">
                    Total quantity: {totalSelectedQuantity} items
                  </p>
                </div>
              </div>
            </div>
          )}

          {(selectedMedicines.length === 0 || hasInvalidQuantities) && (
            <div className="mx-3 mb-4 mt-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      {selectedMedicines.length === 0
                        ? "Medicines Required"
                        : hasExceededStock
                        ? "Stock Limit Exceeded"
                        : "Invalid Quantities"}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      {selectedMedicines.length === 0
                        ? "Please select at least one medicine to submit the request."
                        : hasExceededStock
                        ? "One or more medicines exceed available stock. Please adjust quantities."
                        : "Please ensure all medicine quantities are at least 1."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="px-3 pb-4 mt-5">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-6 order-2 sm:order-1"
              >
                Cancel
              </Button>
              {!showSummary ? (
                <Button
                  onClick={handlePreview}
                  disabled={
                    selectedMedicines.length === 0 ||
                    hasInvalidQuantities ||
                    isMedicinesLoading
                  }
                  className="w-full sm:w-auto px-6 text-white order-1 sm:order-2"
                >
                  {isMedicinesLoading ? "Loading..." : "Preview Request"}
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowSummary(false)}
                    className="w-full sm:w-auto px-6 order-1 sm:order-2"
                  >
                    Back to Edit
                  </Button>
                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isConfirming}
                    className="w-full sm:w-auto px-6 text-white order-1 sm:order-2 bg-green-600 hover:bg-green-700"
                  >
                    {isConfirming ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Confirm and Submit"
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}