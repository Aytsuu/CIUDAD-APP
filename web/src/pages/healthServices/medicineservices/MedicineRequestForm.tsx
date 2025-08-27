"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { ChevronLeft, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchMedicinesWithStock } from "./restful-api/fetchAPI";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { MedicineDisplay } from "@/components/ui/medicine-display";
import { RequestSummary } from "@/components/ui/medicine-sumdisplay";
import { useMedicineRequestMutation } from "./queries/postQueries";
import { PatientSearch } from "@/components/ui/patientSearch";
import { useAuth } from "@/context/AuthContext";
import { FirstAidRequestSkeleton } from "../skeleton/firstmed-skeleton";
import { MedicineRequestArraySchema, MedicineRequestArrayType } from "@/form-schema/medicineRequest";
import { Patient } from "@/components/ui/patientSearch";
import CardLayout from "@/components/ui/card/card-layout";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { MedicineRequestError } from "./medicine-error";
import { SignatureFieldRef } from "../Reports/firstaid-report/signature";
import { SignatureField } from "../Reports/firstaid-report/signature";
import { showErrorToast } from "@/components/ui/toast";
import { MediaUploadType,MediaUpload } from "@/components/ui/media-upload";
export default function MedicineRequestForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const staffId = user?.staff?.staff_id || null;
  const mode = location.state?.params?.mode || "fromallrecordtable";
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPatientData, setSelectedPatientData] = useState<Patient | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { data: medicineStocksOptions, isLoading: isMedicinesLoading } = fetchMedicinesWithStock();
  const [selectedMedicines, setSelectedMedicines] = useState<{ minv_id: string; medrec_qty: number; reason: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { mutateAsync: submitMedicineRequest } = useMedicineRequestMutation();
  const signatureRef = useRef<SignatureFieldRef>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
  const [activeVideoId, setActiveVideoId] = useState<string>("");

  const form = useForm<MedicineRequestArrayType>({
    resolver: zodResolver(MedicineRequestArraySchema),
    defaultValues: {
      pat_id: "",
      medicines: []
    }
  });

  // Initialize patient data based on mode
  useEffect(() => {
    if (mode === "fromindivrecord" && location.state?.params?.patientData) {
      const patientData = location.state.params.patientData;
      setSelectedPatientData(patientData);
      setSelectedPatientId(patientData.pat_id);
      form.setValue("pat_id", patientData.pat_id.toString());
    }
  }, [location.state, mode]);

  useEffect(() => {
    form.setValue("medicines", selectedMedicines);
  }, [selectedMedicines, form]);

  const handleSignatureChange = useCallback((signature: string | null) => {
    setSignature(signature);
  }, []);

  // Handle patient selection from PatientSearch component
  const handlePatientSelect = (patient: Patient | null, patientId: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientData(patient);
    if (patient) {
      form.setValue("pat_id", patient.pat_id.toString());
    } else {
      form.setValue("pat_id", "");
    }
  };

  // Handle selected medicines change from MedicineDisplay component
  const handleSelectedMedicinesChange = useCallback((updatedMedicines: { minv_id: string; medrec_qty: number; reason: string }[]) => {
    setSelectedMedicines(updatedMedicines);
  }, []);

  // Handle page change in MedicineDisplay component
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const onSubmit = useCallback(
    async (data: MedicineRequestArrayType) => {
      const currentSignature = signatureRef.current?.getSignature();
      if (!currentSignature) {
        showErrorToast("Please provide a signature before submitting.");
        return;
      }
      setIsConfirming(true);
      const requestData = {
        pat_id: data.pat_id,
        signature: currentSignature || null,
        medicines: selectedMedicines.map((med) => ({
          minv_id: med.minv_id,
          medrec_qty: med.medrec_qty,
          reason: med.reason || "No reason provided"
        }))
      };
      try {
        await submitMedicineRequest({ data: requestData, staff_id: staffId });
      } catch (error) {
        toast.error("Failed to submit medicine request");
      } finally {
        setIsConfirming(false);
      }
    },
    [selectedMedicines, submitMedicineRequest, staffId]
  );

  const totalSelectedQuantity = selectedMedicines.reduce((sum, med) => sum + med.medrec_qty, 0);

  const hasInvalidQuantities = selectedMedicines.some((med) => {
    const medicine = medicineStocksOptions?.find((m: { id: string; avail: number }) => m.id === med.minv_id);
    return med.medrec_qty < 1 || (medicine && med.medrec_qty > medicine.avail);
  });

  const hasExceededStock = selectedMedicines.some((med) => {
    const medicine = medicineStocksOptions?.find((m: { id: string; avail: number }) => m.id === med.minv_id);
    return medicine && med.medrec_qty > medicine.avail;
  });

  const handlePreview = useCallback(() => {
    const patientCheck = mode === "fromindivrecord" ? selectedPatientData : selectedPatientId;

    if (!patientCheck || selectedMedicines.length === 0 || hasInvalidQuantities) {
      showErrorToast("Please complete all required fields");
      return;
    }
    setShowSummary(true);
  }, [selectedPatientData, selectedPatientId, selectedMedicines, hasInvalidQuantities, mode]);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Button className="text-black p-2 mb-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Medicine Request</h1>
          <p className="text-xs sm:text-sm text-darkGray">{mode === "fromindivrecord" ? "Request medicines for a patient" : "Manage and view patient's medicine records"}</p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <CardLayout
        content={
          <>
            {isMedicinesLoading ? (
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
                      <p className="text-sm text-gray-600">Please select a patient from the medicine records page first.</p>
                    </div>
                  )}
                </div>

                {showSummary ? (
                  <div className="w-full overflow-x-auto">
                    <RequestSummary selectedMedicines={selectedMedicines} medicineStocksOptions={medicineStocksOptions || []} totalSelectedQuantity={totalSelectedQuantity} />
                    <div className="w-full px-4">
                      <SignatureField ref={signatureRef} title="Signature" onSignatureChange={handleSignatureChange} required={true} />
                    </div>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <MedicineDisplay medicines={medicineStocksOptions || []} initialSelectedMedicines={selectedMedicines} onSelectedMedicinesChange={handleSelectedMedicinesChange} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={handlePageChange} />
                    {/* Image upload field */}
                    <div className="w-full">
                      <MediaUpload 
                      title="Supporting Documents" 
                      description="Upload documents to support the report" 
                      mediaFiles={mediaFiles} 
                      activeVideoId={activeVideoId} 
                      setActiveVideoId={setActiveVideoId} 
                      setMediaFiles={setMediaFiles} />
                    </div>
                    <div className="px-3 pt-6">
                      {!isMedicinesLoading && ((mode === "fromindivrecord" && !selectedPatientData) || (mode === "fromallrecordtable" && !selectedPatientId) || selectedMedicines.length === 0 || hasInvalidQuantities) && (
                        <MedicineRequestError mode={mode} selectedPatientData={selectedPatientData} selectedPatientId={selectedPatientId} selectedMedicinesLength={selectedMedicines.length} hasExceededStock={hasExceededStock} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isMedicinesLoading && selectedMedicines.length > 0 && !showSummary && (
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
                  <Button
                    onClick={handlePreview}
                    disabled={(mode === "fromindivrecord" && !selectedPatientData) || (mode === "fromallrecordtable" && !selectedPatientId) || selectedMedicines.length === 0 || hasInvalidQuantities || isMedicinesLoading}
                    className="w-full sm:w-auto px-6 text-white order-1 sm:order-2"
                  >
                    {isMedicinesLoading ? "Loading..." : "Preview Request"}
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
                      title="Submit Medicine Request"
                      description="Are you sure you want to submit this medicine request? This action will process the request and update the inventory."
                      actionLabel="Submit"
                      variant="default"
                      onClick={form.handleSubmit(onSubmit)}
                      onClose={() => setIsConfirming(false)}
                    />
                  </>
                )}
              </div>
            </div>
          </>
        }
      />
    </>
  );
}
