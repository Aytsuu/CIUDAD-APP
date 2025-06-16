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
  User,
  Package,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { fetchPatientRecords } from "../restful-api-patient/FetchPatient";
import { fetchMedicinesWithStock } from "./restful-api/fetchAPI";
import { z } from "zod";
import { MedicineTransactionType } from "@/pages/healthInventory/inventoryStocks/REQUEST/Medicine/queries/MedicinePostQueries";
import {
  MedicineRequestArraySchema,
  MedicineRequestArrayType,
} from "@/form-schema/medicineRequest";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { MedicineDisplay } from "@/components/ui/medicine-display";
import { RequestSummary } from "@/components/ui/medicine-sumdisplay";
// import { api } from "@/api/api";
// import axios from "axios";
// import { getMedicineInventory } from "@/pages/healthInventory/inventoryStocks/REQUEST/Medicine/restful-api/MedicineGetAPI";
// import {
//   updateMedicineStocks,
//   updateInventoryTimestamp,
// } from "@/pages/healthInventory/inventoryStocks/REQUEST/Medicine/restful-api/MedicinePutAPI";
// import { addMedicineTransaction } from "@/pages/healthInventory/inventoryStocks/REQUEST/Medicine/restful-api/MedicinePostAPI";
// import { createMedicineRecord } from "./restful-api/postAPI";
import { useMedicineRequestMutation } from "./queries/postQueries";

interface Patient {
  pat_id: number;
  name: string;
  pat_type: string;
  [key: string]: any;
}

export default function PatNewMedRecForm() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<{
    default: Patient[];
    formatted: { id: string; name: string }[];
  }>({ default: [], formatted: [] });
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedPatientData, setSelectedPatientData] =
    useState<Patient | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const { medicineStocksOptions, isLoading: isMedicinesLoading } =
    fetchMedicinesWithStock();
  const [selectedMedicines, setSelectedMedicines] = useState<
    { minv_id: string; medrec_qty: number; reason: string }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { mutateAsync: submitMedicineRequest, isPending: isSubmitting } =
    useMedicineRequestMutation();

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      try {
        const data = await fetchPatientRecords();
        setPatients(data);
      } catch (error) {
        toast.error(
          "Failed to load patients: " +
            (error instanceof Error ? error.message : "Unknown error")
        );
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, []);

  const handlePatientSelection = useCallback(
    (id: string) => {
      setSelectedPatientId(id);
      const selectedPatient = patients.default.find(
        (patient) => patient.pat_id.toString() === id.split(",")[0].trim()
      );

      if (selectedPatient) {
        setSelectedPatientData(selectedPatient);
        form.setValue("pat_id", selectedPatient.pat_id.toString());
      }
    },
    [patients.default]
  );

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

  const handlePreview = useCallback(() => {
    if (
      !selectedPatientId ||
      selectedMedicines.length === 0 ||
      hasInvalidQuantities
    ) {
      toast.error("Please complete all required fields");
      return;
    }
    setShowSummary(true);
  }, [selectedPatientId, selectedMedicines]);

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
      try {
        // Prepare the data in the format expected by processMedicineRequest
        const requestData = {
          pat_id: data.pat_id,
          medicines: selectedMedicines.map((med) => ({
            minv_id: med.minv_id,
            medrec_qty: med.medrec_qty,
            reason: med.reason || "",
          })),
        };

        await submitMedicineRequest(requestData);
      } catch (error) {
        // Error handling is already done in the mutation's onError
        // You can add additional component-specific error handling here if needed
        console.error("Error in onSubmit handler:", error);
      }
    },
    [selectedMedicines, submitMedicineRequest]
  );

  const totalSelectedQuantity = selectedMedicines.reduce(
    (sum, med) => sum + med.medrec_qty,
    0
  );

  const hasInvalidQuantities = selectedMedicines.some(
    (med) => med.medrec_qty < 1
  );

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
          <div className="flex-col items-center ">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Medicine Request
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Manage and view patient's vaccination records
            </p>
          </div>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-4 w-4 text-darkBlue3" />
            <Label className="text-base font-semibold text-darkBlue3">
              Select Patient
            </Label>
          </div>
          <Combobox
            options={patients.formatted}
            value={selectedPatientId}
            onChange={handlePatientSelection}
            triggerClassName="font-normal w-full"
            placeholder={
              loading ? "Loading patients..." : "Search and select a patient"
            }
            emptyMessage={
              <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                <Label className="font-normal text-xs">
                  {loading ? "Loading..." : "No patient found."}
                </Label>
                <a href="/patient-records/new">
                  <Label className="font-normal text-xs text-teal cursor-pointer hover:underline">
                    Register New Patient
                  </Label>
                </a>
              </div>
            }
          />
        </div>

        <div className="bg-white rounded-md pb-5">
          <div className="mb-4">
            <PatientInfoCard patient={selectedPatientData} />
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
                  {medicineStocksOptions.length === 0 && (
                    <div className="text-center py-12 mx-3">
                      <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-base font-medium text-gray-900 mb-2">
                        No medicines available
                      </h3>
                      <p className="text-sm text-gray-500">
                        There are currently no medicines in stock.
                      </p>
                    </div>
                  )}
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

          {(!selectedPatientId ||
            selectedMedicines.length === 0 ||
            hasInvalidQuantities) && (
            <div className="mx-3 mb-4 mt-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      {!selectedPatientId
                        ? "Patient Required"
                        : selectedMedicines.length === 0
                        ? "Medicines Required"
                        : "Invalid Quantities"}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      {!selectedPatientId
                        ? "Please select a patient to continue with the medicine request."
                        : selectedMedicines.length === 0
                        ? "Please select at least one medicine to submit the request."
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
                    !selectedPatientId ||
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
                    className="w-full sm:w-auto px-6 text-white order-1 sm:order-2 bg-green-600 hover:bg-green-700"
                  >
                    Confirm and Submit
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
