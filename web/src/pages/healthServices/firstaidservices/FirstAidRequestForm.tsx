"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchFirstaidsWithStock } from "./restful-api/fetchAPI";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { FirstAidDisplay } from "@/components/ui/first-aid-display";
import { RequestSummary } from "@/components/ui/firstaid-summary";
import { useFirstRequestMutation } from "./queries/postQueries";
import { PatientSearch } from "@/components/ui/patientSearch";
import { useAuth } from "@/context/AuthContext";
import { FirstAidRequestSkeleton } from "../skeleton/firstmed-skeleton";
import { FirstaidRequestArraySchema, FirstaidRequestArrayType } from "./firstaidschema";
import { Patient } from "@/components/ui/patientSearch";
import CardLayout from "@/components/ui/card/card-layout";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { FirstAidRequestError } from "./firstaid-error";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { SignatureFieldRef, SignatureField } from "../Reports/firstaid-report/signature";
import { showErrorToast } from "@/components/ui/toast";

export default function FirstAidRequestForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const staff_id = user?.staff?.staff_id;
  const mode = location.state?.params?.mode || "fromallrecordtable";
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPatientData, setSelectedPatientData] = useState<Patient | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { firstAidStocksOptions, isLoading: isFirstAidLoading } = fetchFirstaidsWithStock();
  const [selectedFirstAids, setSelectedFirstAids] = useState<{ finv_id: string; qty: number; reason: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { mutateAsync: submitFirstaidRequest } = useFirstRequestMutation();
  const signatureRef = useRef<SignatureFieldRef>(null);
  const [signature] = useState<string | null>(null);

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

  const handleSelectedFirstAidChange = useCallback((updatedFirstAids: { finv_id: string; qty: number; reason: string }[]) => {
    setSelectedFirstAids(updatedFirstAids);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const form = useForm<FirstaidRequestArrayType>({
    resolver: zodResolver(FirstaidRequestArraySchema),
    defaultValues: {
      pat_id: "",
      firstaid: []
    }
  });

  useEffect(() => {
    form.setValue("firstaid", selectedFirstAids);
  }, [selectedFirstAids, form]);

  const onSubmit = useCallback(
    async (data: FirstaidRequestArrayType) => {
      const currentSignature = signatureRef.current?.getSignature();
      console.log("Current Signature:", currentSignature);
      if (!currentSignature) {
        showErrorToast("Please provide a signature before submitting.");
        return;
      }
      setIsConfirming(true);
      const requestData = {
        pat_id: data.pat_id,
        signature: currentSignature,
        staff_id: staff_id || "",
        firstaid: data.firstaid.map((item) => ({
          finv_id: item.finv_id,
          qty: item.qty,
          reason: item.reason || "No reason provided"
        }))
      };
      try {
        await submitFirstaidRequest({ data: requestData });
      } catch (error) {
        toast.error("Failed to submit first aid request");
      } finally {
        setIsConfirming(false);
      }
    },
    [submitFirstaidRequest, staff_id]
  );

  const handlePreview = useCallback(() => {
    const patientCheck = mode === "fromindivrecord" ? selectedPatientData : selectedPatientId;
    if (!patientCheck || selectedFirstAids.length === 0) {
      showErrorToast("Please complete all required fields");
      return;
    }
    setShowSummary(true);
  }, [selectedPatientData, selectedPatientId, selectedFirstAids, mode]);

  const totalSelectedQuantity = selectedFirstAids.reduce((sum, fa) => sum + fa.qty, 0);

  return (
    <>
      <LayoutWithBack title="First Aid Request" description={mode === "fromindivrecord" ? "Request first aid items for a patient" : "Manage and view patient's first aid records"}>
        <CardLayout
          content={
            <>
              {isFirstAidLoading ? (
                <FirstAidRequestSkeleton mode={mode} />
              ) : (
                <div className="w-full py-6">
                  <div className="px-4">
                    {/* Patient Selection Section - only shown in fromallrecordtable mode */}
                    {mode === "fromallrecordtable" && <PatientSearch value={selectedPatientId} onChange={setSelectedPatientId} onPatientSelect={handlePatientSelect} className="mb-4" />}

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
                          <Label className="text-base font-semibold text-red-500">No patient selected</Label>
                        </div>
                        <p className="text-sm text-gray-600">Please select a patient from the first aid records page first.</p>
                      </div>
                    )}
                  </div>
                  {showSummary ? (
                    <div className="w-full overflow-x-auto">
                      <RequestSummary selectedFirstAids={selectedFirstAids} firstAidStocksOptions={firstAidStocksOptions} totalSelectedQuantity={totalSelectedQuantity} />
                      <div className="w-full px-4">
                        <SignatureField ref={signatureRef} title="Signature" onSignatureChange={signature} required={true} />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full overflow-x-auto">
                      <FirstAidDisplay firstAids={firstAidStocksOptions} initialSelectedFirstAids={selectedFirstAids} onSelectedFirstAidChange={handleSelectedFirstAidChange} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={handlePageChange} />
                    </div>
                  )}

                  <div className="px-3 py-6">
                    {!isFirstAidLoading && ((mode === "fromindivrecord" && !selectedPatientData) || (mode === "fromallrecordtable" && !selectedPatientId) || selectedFirstAids.length === 0) && (
                      <FirstAidRequestError mode={mode} selectedPatientData={selectedPatientData} selectedPatientId={selectedPatientId} selectedFirstAidsLength={selectedFirstAids.length} />
                    )}
                  </div>
                </div>
              )}

              {!isFirstAidLoading && selectedFirstAids.length > 0 && !showSummary && (
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
                      <p className="text-xs text-emerald-700">Total quantity: {totalSelectedQuantity} items</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="px-3 pb-4 mt-5">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <Button variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto px-6 order-2 sm:order-1">
                    Cancel
                  </Button>
                  {!showSummary ? (
                    <Button onClick={handlePreview} disabled={(mode === "fromindivrecord" && !selectedPatientData) || (mode === "fromallrecordtable" && !selectedPatientId) || selectedFirstAids.length === 0 || isFirstAidLoading} className="w-full sm:w-auto px-6 text-white order-1 sm:order-2">
                      {isFirstAidLoading ? "Loading..." : "Preview Request"}
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setShowSummary(false)} className="w-full sm:w-auto px-6 order-1 sm:order-2">
                        Back to Edit
                      </Button>
                      <ConfirmationModal
                        trigger={
                          <Button disabled={isConfirming} className="w-full sm:w-auto px-6 text-white order-1 sm:order-2 bg-green-600 hover:bg-green-700">
                            {isConfirming ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Confirm and Submit"
                            )}
                          </Button>
                        }
                        title="Submit First Aid Request"
                        description="Are you sure you want to submit this first aid request? This action will process the request and update the inventory."
                        actionLabel="Submit"
                        variant="default"
                        onClick={form.handleSubmit(onSubmit)}
                      />
                    </>
                  )}
                </div>
              </div>
            </>
          }
        />
      </LayoutWithBack>
    </>
  );
}
