// MedicineRequestForm.tsx - IMPROVED WITH IMAGE DISPLAY
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { ChevronLeft, AlertCircle, CheckCircle2, Loader2, X, FileText, Pill, ImageIcon } from "lucide-react";
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
import { MedicineRequestError } from "./medicine-error";
import { SignatureFieldRef } from "../Reports/firstaid-report/signature";
import { SignatureField } from "../Reports/firstaid-report/signature";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { MediaUploadType, MediaUpload } from "@/components/ui/media-upload";

// Image Gallery Component for Summary
const ImageGallery = ({ mediaFiles }: { mediaFiles: MediaUploadType }) => {
  if (!mediaFiles || mediaFiles.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <ImageIcon className="h-5 w-5" />
        Uploaded Supporting Documents
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {mediaFiles.map((media, index) => (
          <div key={index} className="relative group">
            {media.type.startsWith("image/") ? (
              <img src={media.file as string} alt={media.name || `Supporting document ${index + 1}`} className="w-full h-32 object-cover rounded-lg border border-gray-200" />
            ) : (
              <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                <FileText className="h-8 w-8 text-gray-400" />
                <span className="sr-only">Document: {media.name}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
              <p className="text-white text-xs text-center px-2 truncate">{media.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom Modal Component
const MedicineSummaryModal = ({
  isOpen,
  onClose,
  selectedMedicines,
  medicineStocksOptions,
  totalSelectedQuantity,
  mediaFiles,
  onConfirm,
  isSubmitting,
  onBackToEdit,
  signatureRef,
  onSignatureChange,
  hasPrescriptionMedicine
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedMedicines: { minv_id: string; medrec_qty: number; reason: string }[];
  medicineStocksOptions: any[];
  totalSelectedQuantity: number;
  mediaFiles: MediaUploadType;
  onConfirm: () => void;
  isSubmitting: boolean;
  onBackToEdit: () => void;
  signatureRef: React.RefObject<SignatureFieldRef>;
  onSignatureChange: (signature: string | null) => void;
  hasPrescriptionMedicine: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Medicine Request Summary</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-gray-100">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">Review your medicine request before submission</p>

          <RequestSummary selectedMedicines={selectedMedicines} medicineStocksOptions={medicineStocksOptions} totalSelectedQuantity={totalSelectedQuantity} />

          {/* Display uploaded images */}
          <ImageGallery mediaFiles={mediaFiles} />

          <div className="mt-6">
            <SignatureField ref={signatureRef} title="Signature" onSignatureChange={onSignatureChange} required={true} />
          </div>

          {hasPrescriptionMedicine && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Prescription Medicine Included</span>
              </div>
              <p className="text-xs text-amber-700 mt-1">This request contains prescription medication that requires proper authorization.</p>
              {mediaFiles.length > 0 && <p className="text-xs text-green-700 mt-1">✓ Supporting documents have been uploaded.</p>}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end p-6 border-t border-gray-200 sticky bottom-0 bg-white">
          <Button variant="outline" onClick={onBackToEdit} disabled={isSubmitting} className="w-full sm:w-auto">
            Back to Edit
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm and Submit"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Status Indicator Component
const StatusIndicator = ({ selectedMedicines, totalSelectedQuantity, hasPrescriptionMedicine, mediaFiles }: { selectedMedicines: any[]; totalSelectedQuantity: number; hasPrescriptionMedicine: boolean; mediaFiles: MediaUploadType }) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
      <div className="bg-emerald-100 p-2 rounded-lg flex-shrink-0">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-emerald-900">
          {selectedMedicines.length} medicine
          {selectedMedicines.length > 1 ? "s" : ""} selected
        </p>
        <p className="text-xs text-emerald-700">Total quantity: {totalSelectedQuantity} items</p>
        {mediaFiles.length > 0 && (
          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            {mediaFiles.length} supporting document{mediaFiles.length > 1 ? "s" : ""} uploaded
          </p>
        )}
        {hasPrescriptionMedicine && (
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <Pill className="h-3 w-3" />
            Prescription medicine detected - {mediaFiles.length > 0 ? "✓ image uploaded" : "image upload required"}
          </p>
        )}
      </div>
    </div>
  );
};

export default function MedicineRequestForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const staffId = user?.staff?.staff_id || null;
  const mode = location.state?.params?.mode || "fromallrecordtable";
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPatientData, setSelectedPatientData] = useState<Patient | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
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
  const [hasPrescriptionMedicine, setHasPrescriptionMedicine] = useState(false);
  const [med_type,setmed_type]=useState("")
  const form = useForm<MedicineRequestArrayType>({
    resolver: zodResolver(MedicineRequestArraySchema),
    defaultValues: {
      pat_id: "",
      medicines: [],
      files: []
    }
  });

  // Check if any selected medicine is a prescription type
  useEffect(() => {
    if (selectedMedicines.length > 0 && medicineStocksOptions) {
      const hasPrescription = selectedMedicines.some((selectedMed) => {
        const medicine = medicineStocksOptions.find((m) => m.id === selectedMed.minv_id);
          setmed_type(medicine && medicine.med_type)
          console.log("med_type",med_type)
        return medicine && medicine.med_type === "Prescription";
      });
      setHasPrescriptionMedicine(hasPrescription);
    } else {
      setHasPrescriptionMedicine(false);
    }
  }, [selectedMedicines, medicineStocksOptions]);

  // Initialize patient data based on mode
  useEffect(() => {
    if (mode === "fromindivrecord" && location.state?.params?.patientData) {
      const patientData = location.state.params.patientData;
      setSelectedPatientData(patientData);
      setSelectedPatientId(patientData.pat_id);
      form.setValue("pat_id", patientData.pat_id.toString());
    }
  }, [location.state, mode, form]);

  useEffect(() => {
    form.setValue("medicines", selectedMedicines);
  }, [selectedMedicines, form]);

  // Update form value when mediaFiles change
  useEffect(() => {
    const files = mediaFiles
      .filter((media) => media.file && typeof media.file === "string" && media.file.startsWith("data:"))
      .map((media) => ({
        name: media.name,
        type: media.type,
        file: media.file
      }));
    form.setValue("files", files);
  }, [mediaFiles, form]);

  const handleSignatureChange = useCallback((signature: string | null) => {
    setSignature(signature);
  }, []);

  const handlePatientSelect = (patient: Patient | null, patientId: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientData(patient);
    if (patient) {
      form.setValue("pat_id", patient.pat_id.toString());
    } else {
      form.setValue("pat_id", "");
    }
  };

  const handleSelectedMedicinesChange = useCallback((updatedMedicines: { minv_id: string; medrec_qty: number; reason: string }[]) => {
    setSelectedMedicines(updatedMedicines);
  }, []);

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

      // Check if prescription medicine requires image upload
      if (hasPrescriptionMedicine && (!data.files || data.files.length === 0)) {
        showErrorToast("Prescription medicine requires an image upload.");
        return;
      }

      setIsConfirming(true);

      // Process files to ensure they're in the correct format
      const requestData = {
        pat_id: data.pat_id,
        signature: currentSignature || null,
        medicines: selectedMedicines.map((med) => ({
          minv_id: med.minv_id,
          medrec_qty: med.medrec_qty,
          reason: med.reason || "No reason provided",
          med_type:med_type
        })),
        files: data.files || []
      };

      try {
        submitMedicineRequest({ data: requestData, staff_id: staffId });
        setShowSummaryModal(false);
      } catch (error: any) {
        console.error("Submission error:", error);
        showErrorToast(error?.message || "Failed to submit medicine request");
      } finally {
        setIsConfirming(false);
      }
    },
    [selectedMedicines, submitMedicineRequest, staffId, navigate, hasPrescriptionMedicine]
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

    // Check if prescription medicine requires image upload
    if (hasPrescriptionMedicine && mediaFiles.length === 0) {
      showErrorToast("Prescription medicine requires an image upload.");
      return;
    }

    setShowSummaryModal(true);
  }, [selectedPatientData, selectedPatientId, selectedMedicines, hasInvalidQuantities, mode, hasPrescriptionMedicine, mediaFiles]);

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
                  {mode === "fromallrecordtable" && <PatientSearch value={selectedPatientId} onChange={setSelectedPatientId} onPatientSelect={handlePatientSelect} className="mb-4" />}

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

                <div className="w-full overflow-x-auto">
                  <MedicineDisplay medicines={medicineStocksOptions || []} initialSelectedMedicines={selectedMedicines} onSelectedMedicinesChange={handleSelectedMedicinesChange} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={handlePageChange} />

                  {/* Conditionally show MediaUpload only when prescription medicine is selected */}
                  {hasPrescriptionMedicine && (
                    <div className="w-full p-4">
                      <MediaUpload title="Supporting Documents" description="Prescription medicine selected. Image upload is required." mediaFiles={mediaFiles} activeVideoId={activeVideoId} setActiveVideoId={setActiveVideoId} setMediaFiles={setMediaFiles} maxFiles={5} />
                      {mediaFiles.length === 0 && <div className="mt-2 text-sm text-red-500">Image upload is required for prescription medicines.</div>}
                    </div>
                  )}

                  <div className="px-3 pt-6">
                    {!isMedicinesLoading && ((mode === "fromindivrecord" && !selectedPatientData) || (mode === "fromallrecordtable" && !selectedPatientId) || selectedMedicines.length === 0 || hasInvalidQuantities) && (
                      <MedicineRequestError mode={mode} selectedPatientData={selectedPatientData} selectedPatientId={selectedPatientId} selectedMedicinesLength={selectedMedicines.length} hasExceededStock={hasExceededStock} />
                    )}
                  </div>
                </div>
              </div>
            )}

            {!isMedicinesLoading && selectedMedicines.length > 0 && (
              <div className=" gap-3 mt-5 mr-5">
                <StatusIndicator selectedMedicines={selectedMedicines} totalSelectedQuantity={totalSelectedQuantity} hasPrescriptionMedicine={hasPrescriptionMedicine} mediaFiles={mediaFiles} />
              </div>
            )}

            <div className="pb-4 mt-5">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Button variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto px-6 order-2 sm:order-1">
                  Cancel
                </Button>
                <Button
                  onClick={handlePreview}
                  disabled={(mode === "fromindivrecord" && !selectedPatientData) || (mode === "fromallrecordtable" && !selectedPatientId) || selectedMedicines.length === 0 || hasInvalidQuantities || isMedicinesLoading || (hasPrescriptionMedicine && mediaFiles.length === 0)}
                  className="w-full sm:w-auto px-6 text-white order-1 sm:order-2"
                >
                  {isMedicinesLoading ? "Loading..." : "Preview Request"}
                </Button>
              </div>
            </div>
          </>
        }
      />

      {/* Medicine Summary Modal */}
      <MedicineSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        selectedMedicines={selectedMedicines}
        medicineStocksOptions={medicineStocksOptions || []}
        totalSelectedQuantity={totalSelectedQuantity}
        mediaFiles={mediaFiles}
        onConfirm={form.handleSubmit(onSubmit)}
        isSubmitting={isConfirming}
        onBackToEdit={() => setShowSummaryModal(false)}
        signatureRef={signatureRef}
        onSignatureChange={handleSignatureChange}
        hasPrescriptionMedicine={hasPrescriptionMedicine}
      />
    </>
  );
}
