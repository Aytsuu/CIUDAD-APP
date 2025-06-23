"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  Package,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { fetchFirstaidsWithStock } from "./restful-api/fetchAPI";
import { z } from "zod";
import { MedicineTransactionType } from "@/pages/healthInventory/inventoryStocks/REQUEST/Medicine/queries/MedicinePostQueries";
import {
  FirstaidRequestArraySchema,
  FirstaidRequestArrayType,
} from "@/form-schema/firstaid-schema";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { FirstAidDisplay } from "@/components/ui/first-aid-display";
import { RequestSummary } from "@/components/ui/firstaid-summary";
import { useFirstRequestMutation } from "./queries/postQueries";
import { PatientSearch } from "@/components/ui/patientSearch";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";

interface Patient {
  pat_id: number;
  pat_type: string;
  name?: string;
  personal_info?: {
    per_fname?: string;
    per_mname?: string;
    per_lname?: string;
    per_dob?: string;
    per_sex?: string;
  };
  households?: { hh_id: string }[];
  address?: {
    add_street?: string;
    add_barangay?: string;
    add_city?: string;
    add_province?: string;
    add_external_sitio?: string;
  };
}

export default function PatNewFirstaidRecForm() {
  const navigate = useNavigate();
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPatientData, setSelectedPatientData] =
    useState<Patient | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitConfirmationOpen, setIsSubmitConfirmationOpen] =
    useState(false);
  const { firstAidStocksOptions, isLoading: isFirstAidLoading } =
    fetchFirstaidsWithStock();
  const [selectedFirstAids, setSelectedFirstAids] = useState<
    { finv_id: string; qty: number; reason: string }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { mutateAsync: submitFirstaidRequest, isPending: isSubmitting } =
    useFirstRequestMutation();

  const handlePatientSelect = (patient: Patient | null, patientId: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientData(patient);
    if (patient) {
      form.setValue("pat_id", patient.pat_id.toString());
    } else {
      form.setValue("pat_id", "");
    }
  };

  const handleSelectedFirstAidChange = useCallback(
    (
      updatedFirstAids: {
        finv_id: string;
        qty: number;
        reason: string;
      }[]
    ) => {
      setSelectedFirstAids(updatedFirstAids);
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePreview = useCallback(() => {
    if (
      !selectedPatientId ||
      selectedFirstAids.length === 0 ||
      hasInvalidQuantities
    ) {
      toast.error("Please complete all required fields");
      return;
    }
    setShowSummary(true);
  }, [selectedPatientId, selectedFirstAids]);

  const form = useForm<FirstaidRequestArrayType>({
    resolver: zodResolver(FirstaidRequestArraySchema),
    defaultValues: {
      pat_id: "",
      firstaid: [],
    },
  });

  useEffect(() => {
    form.setValue("firstaid", selectedFirstAids);
  }, [selectedFirstAids, form]);

  const onSubmit = useCallback(
    async (data: FirstaidRequestArrayType) => {
      setIsConfirming(true);
      const requestData = {
        pat_id: data.pat_id,
        firstaid: selectedFirstAids.map((med) => ({
          finv_id: med.finv_id,
          qty: med.qty,
          reason: med.reason || "No reason provided",
        })),
      };
      await submitFirstaidRequest(requestData);
      setIsConfirming(false);
      setIsSubmitConfirmationOpen(false);
    },
    [selectedFirstAids, submitFirstaidRequest, navigate]
  );

  const handleConfirmSubmit = () => {
    setIsSubmitConfirmationOpen(false); // Close the dialog immediately
    form.handleSubmit(onSubmit)(); // Trigger the form submission
  };

  const totalSelectedQuantity = selectedFirstAids.reduce(
    (sum, fa) => sum + fa.qty,
    0
  );

  const hasInvalidQuantities = selectedFirstAids.some((fa) => fa.qty < 1);

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
              Manage and view patient's medicine records
            </p>
          </div>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />

        <PatientSearch onPatientSelect={handlePatientSelect} className="mb-4" />

        <div className="mb-4 bg-white">
          <PatientInfoCard patient={selectedPatientData} />
        </div>

        <div className="bg-white rounded-md pt-5">
          {isFirstAidLoading ? (
            <div className="p-4 flex justify-center items-center space-y-4">
              <p className="text-center text-red-600">
                Loading first aid items...
              </p>
            </div>
          ) : (
            <div className="w-full">
              {showSummary ? (
                <div className="w-full overflow-x-auto">
                  <RequestSummary
                    selectedFirstAids={selectedFirstAids}
                    firstAidStocksOptions={firstAidStocksOptions}
                    totalSelectedQuantity={totalSelectedQuantity}
                  />
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <FirstAidDisplay
                    firstAids={firstAidStocksOptions}
                    initialSelectedFirstAids={selectedFirstAids}
                    onSelectedFirstAidChange={handleSelectedFirstAidChange}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                  {firstAidStocksOptions.length === 0 && (
                    <div className="text-center py-12 mx-3">
                      <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-base font-medium text-gray-900 mb-2">
                        No first aid items available
                      </h3>
                      <p className="text-sm text-gray-500">
                        There are currently no first aid items in stock.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {selectedFirstAids.length > 0 && !showSummary && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mt-5 mr-5">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    {selectedFirstAids.length} first aid item
                    {selectedFirstAids.length > 1 ? "s" : ""} selected
                  </p>
                  <p className="text-xs text-emerald-700">
                    Total quantity: {totalSelectedQuantity} items
                  </p>
                </div>
              </div>
            </div>
          )}

          {(!selectedPatientId ||
            selectedFirstAids.length === 0 ||
            hasInvalidQuantities) && (
            <div className="mx-3 mb-4 mt-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      {!selectedPatientId
                        ? "Patient Required"
                        : selectedFirstAids.length === 0
                        ? "First Aid Items Required"
                        : "Invalid Quantities"}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      {!selectedPatientId
                        ? "Please select a patient to continue with the request."
                        : selectedFirstAids.length === 0
                        ? "Please select at least one first aid item to submit the request."
                        : "Please ensure all quantities are at least 1."}
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
                    selectedFirstAids.length === 0 ||
                    hasInvalidQuantities ||
                    isFirstAidLoading
                  }
                  className="w-full sm:w-auto px-6 text-white order-1 sm:order-2"
                >
                  {isFirstAidLoading ? "Loading..." : "Preview Request"}
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
                    onClick={handleConfirmSubmit}
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

          <ConfirmationDialog
            isOpen={isSubmitConfirmationOpen}
            onOpenChange={setIsSubmitConfirmationOpen}
            onConfirm={form.handleSubmit(onSubmit)}
            title="Submit Medicine Request"
            description="Are you sure you want to submit this medicine request? This action will process the request and update the inventory."
          />
        </div>
      </div>
    </div>
  );
}
