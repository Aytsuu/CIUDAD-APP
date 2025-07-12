"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
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
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { FirstAidDisplay } from "@/components/ui/first-aid-display";
import { RequestSummary } from "@/components/ui/firstaid-summary";
import { useFirstRequestMutation } from "./queries/postQueries";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { useAuth } from "@/context/AuthContext";
// Updated schema to allow zero quantities
const FirstaidRequestArraySchema = z.object({
  pat_id: z.string(),
  firstaid: z.array(
    z.object({
      finv_id: z.string(),
      qty: z.number().int().min(0), // Changed from min(1) to min(0)
      reason: z.string().optional(),
    })
  ),
});

type FirstaidRequestArrayType = z.infer<typeof FirstaidRequestArraySchema>;

interface Patient {
  pat_id: string;
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

export default function IndivPatNewFirstAidRecForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPatientData, setSelectedPatientData] = useState<Patient | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitConfirmationOpen, setIsSubmitConfirmationOpen] = useState(false);
  const { firstAidStocksOptions, isLoading: isFirstAidLoading } = fetchFirstaidsWithStock();
  const [selectedFirstAids, setSelectedFirstAids] = useState<
    { finv_id: string; qty: number; reason: string }[]
  >([]);
  const {user} = useAuth()
  const staff_id =user?.staff?.staff_id
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { mutateAsync: submitFirstaidRequest, isPending: isSubmitting } = useFirstRequestMutation();

  useEffect(() => {
    if (location.state?.params?.patientData) {
      const patientData = location.state.params.patientData;
      setSelectedPatientData(patientData);
      form.setValue("pat_id", patientData.pat_id.toString());
    }
  }, [location.state]);

  const handleSelectedFirstAidChange = useCallback(
    (updatedFirstAids: { finv_id: string; qty: number; reason: string }[]) => {
      setSelectedFirstAids(updatedFirstAids);
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePreview = useCallback(() => {
    if (!selectedPatientData || selectedFirstAids.length === 0) {
      toast.error("Please complete all required fields");
      return;
    }
    setShowSummary(true);
  }, [selectedPatientData, selectedFirstAids]);

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

 // In your form component
const onSubmit = useCallback(
  async (data: FirstaidRequestArrayType) => {
    setIsConfirming(true);
    setIsSubmitConfirmationOpen(true);

    
    // Remove the zero quantity filter - now we'll process all items
    const requestData = {
      pat_id: data.pat_id,
      firstaid: data.firstaid.map((med) => ({
        finv_id: med.finv_id,
        qty: med.qty,
        reason: med.reason || "No reason provided",
      })),
    };

    try {
      await submitFirstaidRequest({ 
        data: requestData, 
        staff_id: staff_id 
      });

    } catch (error) {
      toast.error("Failed to submit first aid request");
    } finally {
      setIsConfirming(false);
      setIsSubmitConfirmationOpen(false);
    }
  },
  [submitFirstaidRequest, navigate, staff_id]
);

const handleConfirmSubmit = () => {
  // Remove the non-zero quantity check
  setIsSubmitConfirmationOpen(true);
};

  const totalSelectedQuantity = selectedFirstAids.reduce(
    (sum, fa) => sum + fa.qty,
    0
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
          <div className="flex-col items-center">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              First Aid Request
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Request first aid items for a patient
            </p>
          </div>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />

        {selectedPatientData ? (
          <div className="mb-4">
            <PatientInfoCard patient={selectedPatientData} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <Label className="text-base font-semibold text-red-500">
                No patient selected
              </Label>
            </div>
            <p className="text-sm text-gray-600">
              Please select a patient from the first aid records page first.
            </p>
          </div>
        )}

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

          {(!selectedPatientData || selectedFirstAids.length === 0) && (
            <div className="mx-3 mb-4 mt-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      {!selectedPatientData
                        ? "Patient Required"
                        : "First Aid Items Required"}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      {!selectedPatientData
                        ? "Please select a patient first from the first aid records page."
                        : "Please select at least one first aid item to submit the request."}
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
                    !selectedPatientData ||
                    selectedFirstAids.length === 0 ||
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
            title="Submit First Aid Request"
            description="Are you sure you want to submit this first aid request? This action will process the request and update the inventory."
          />
        </div>
      </div>
    </div>
  );
}