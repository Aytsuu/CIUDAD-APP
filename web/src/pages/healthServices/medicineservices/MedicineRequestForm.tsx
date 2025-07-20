"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { ChevronLeft, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchMedicinesWithStock } from "./restful-api/fetchAPI";
import {
  MedicineRequestArraySchema,
  MedicineRequestArrayType,
} from "@/form-schema/medicineRequest";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { MedicineDisplay } from "@/components/ui/medicine-display";
import { RequestSummary } from "@/components/ui/medicine-sumdisplay";
import { useMedicineRequestMutation } from "./queries/postQueries";
import { PatientSearch } from "@/components/ui/patientSearch";
import { useAuth } from "@/context/AuthContext";
import { Patient } from "@/components/ui/patientSearch";

export default function MedicineRequestForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const staffId = user?.staff?.staff_id || null;

  // Determine mode from location state
  const mode = location.state?.params?.mode || "fromallrecordtable";

  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPatientData, setSelectedPatientData] =
    useState<Patient | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const {
    data: medicineStocksOptions,
    isLoading: isMedicinesLoading,
    isError: isMedicinesError,
    error: medicinesError,
  } = fetchMedicinesWithStock();

  const [selectedMedicines, setSelectedMedicines] = useState<
    { minv_id: string; medrec_qty: number; reason: string }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { mutateAsync: submitMedicineRequest, isPending: isSubmitting } =
    useMedicineRequestMutation();

  // Initialize patient data based on mode
  useEffect(() => {
    if (mode === "fromindivrecord" && location.state?.params?.patientData) {
      const patientData = location.state.params.patientData;
      setSelectedPatientData(patientData);
      setSelectedPatientId(patientData.pat_id);
      form.setValue("pat_id", patientData.pat_id.toString());
    }
  }, [location.state, mode]);

  const handlePatientSelect = (patient: Patient | null, patientId: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientData(patient);
    if (patient) {
      form.setValue("pat_id", patient.pat_id.toString());
    } else {
      form.setValue("pat_id", "");
    }
  };

  const handleSelectedMedicinesChange = useCallback(
    (
      updatedMedicines: {
        minv_id: string;
        medrec_qty: number;
        reason: string;
      }[]
    ) => {
      setSelectedMedicines(updatedMedicines);
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const form = useForm<MedicineRequestArrayType>({
    resolver: zodResolver(MedicineRequestArraySchema),
    defaultValues: {
      pat_id: "",
      medicines: [],
    },
  });

  useEffect(() => {
    form.setValue("medicines", selectedMedicines);
  }, [selectedMedicines, form]);

  const onSubmit = useCallback(
    async (data: MedicineRequestArrayType) => {
      setIsConfirming(true);
      const requestData = {
        pat_id: data.pat_id,
        medicines: selectedMedicines.map((med) => ({
          minv_id: med.minv_id,
          medrec_qty: med.medrec_qty,
          reason: med.reason || "No reason provided",
        })),
      };
      await submitMedicineRequest({ data: requestData, staff_id: staffId });
      setIsConfirming(false);
    },
    [selectedMedicines, submitMedicineRequest, staffId]
  );

  const totalSelectedQuantity = selectedMedicines.reduce(
    (sum, med) => sum + med.medrec_qty,
    0
  );

  const hasInvalidQuantities = selectedMedicines.some((med) => {
    const medicine = medicineStocksOptions?.find((m) => m.id === med.minv_id);
    return med.medrec_qty < 1 || (medicine && med.medrec_qty > medicine.avail);
  });

  const hasExceededStock = selectedMedicines.some((med) => {
    const medicine = medicineStocksOptions?.find((m) => m.id === med.minv_id);
    return medicine && med.medrec_qty > medicine.avail;
  });

  const handlePreview = useCallback(() => {
    const patientCheck =
      mode === "fromindivrecord" ? selectedPatientData : selectedPatientId;

    if (
      !patientCheck ||
      selectedMedicines.length === 0 ||
      hasInvalidQuantities
    ) {
      toast.error("Please complete all required fields");
      return;
    }
    setShowSummary(true);
  }, [
    selectedPatientData,
    selectedPatientId,
    selectedMedicines,
    hasInvalidQuantities,
    mode,
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Button
            className="text-black p-2 mb-2 self-start"
            variant={"outline"}
            onClick={() => navigate(-1)}
          >
            <ChevronLeft />
          </Button>
          <div className="flex-col items-center">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Medicine Request
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              {mode === "fromindivrecord"
                ? "Request medicines for a patient"
                : "Manage and view patient's medicine records"}
            </p>
          </div>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />

        <div className="bg-white rounded-md pt-10 pb-5">
          <div className="px-4 s mb-4">
            {/* Patient Selection Section - only shown in fromallrecordtable mode */}
            {mode === "fromallrecordtable" && (
              <PatientSearch
                value={selectedPatientId}
                onChange={setSelectedPatientId}
                onPatientSelect={handlePatientSelect}
                className="mb-4"
              />
            )}

            {/* Patient Information Card */}
            {selectedPatientData && (
              <div className="mb-4">
                <PatientInfoCard patient={selectedPatientData} />
              </div>
            )}

            {mode === "fromindivrecord" && !selectedPatientData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <Label className="text-base font-semibold text-red-500">
                    No patient selected
                  </Label>
                </div>
                <p className="text-sm text-gray-600">
                  Please select a patient from the medicine records page first.
                </p>
              </div>
            )}
          </div>
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
                    medicineStocksOptions={medicineStocksOptions || []}
                    totalSelectedQuantity={totalSelectedQuantity}
                  />
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <MedicineDisplay
                    medicines={medicineStocksOptions || []}
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

          {((mode === "fromindivrecord" && !selectedPatientData) ||
            (mode === "fromallrecordtable" && !selectedPatientId) ||
            selectedMedicines.length === 0 ||
            hasInvalidQuantities) && (
            <div className="mx-3 mb-4 mt-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      {mode === "fromindivrecord" && !selectedPatientData
                        ? "Patient Required"
                        : mode === "fromallrecordtable" && !selectedPatientId
                        ? "Patient Required"
                        : selectedMedicines.length === 0
                        ? "Medicines Required"
                        : hasExceededStock
                        ? "Stock Limit Exceeded"
                        : "Invalid Quantities"}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      {mode === "fromindivrecord" && !selectedPatientData
                        ? "Please select a patient first from the medicine records page."
                        : mode === "fromallrecordtable" && !selectedPatientId
                        ? "Please select a patient to continue with the medicine request."
                        : selectedMedicines.length === 0
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
                    (mode === "fromindivrecord" && !selectedPatientData) ||
                    (mode === "fromallrecordtable" && !selectedPatientId) ||
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
