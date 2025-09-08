import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { PatientInfoCard } from "@/components/ui/patientInfoCard"
import { AlertCircle, Pill, Calendar, User, FileText, Eye, Clock, Hash, ChevronLeft, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button/button"
import { DocumentModal } from "../../tables/columns/inv-med-col"
import { Link } from "react-router"
import { MedicineDisplay } from "@/components/ui/medicine-display"
import { fetchMedicinesWithStock } from "../../restful-api/fetchAPI"
import { useCreateMedicineAllocation } from "../queries.tsx/post"

export default function MedicineRequestPendingItems() {
  const location = useLocation()
  const medicineRequestData = location.state?.params?.medicineRequestData
  const navigate = useNavigate()
  const [selectedPatientData, setSelectedPatientData] = useState<any | null>(null)
  const [selectedMedicineRequestData, setSelectedMedicineRequestData] = useState<any | null>(null)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<any[]>([])
  
  // Medicine display states
  const [selectedMedicines, setSelectedMedicines] = useState<any[]>([])
  const [medicineDisplayPage, setMedicineDisplayPage] = useState(1)
  const [initialSelectionsSet, setInitialSelectionsSet] = useState(false)

  // Fetch medicine stocks
  const { data: medicineStocksOptions, isLoading: isMedicinesLoading } = fetchMedicinesWithStock()
  const { mutate: createAllocation, isPending, error: createMedicineError } = useCreateMedicineAllocation()

  useEffect(() => {
    if (location.state?.params?.patientData) {
      setSelectedPatientData(location.state.params.patientData)
    }
    if (location.state?.params?.medicineRequestData) {
      setSelectedMedicineRequestData(location.state.params.medicineRequestData)
    }
  }, [location.state])

  // Create medicine mapping for MedicineDisplay
  const createMedicineMapping = () => {
    if (!medicineStocksOptions || !selectedMedicineRequestData) return []

    const mappedMedicines: any = []

    // Find matching stock for the current medicine request
    const matchingStocks = medicineStocksOptions.filter((stock: any) => 
      String(stock.med_id) === String(selectedMedicineRequestData.med_id)
    )

    // Create mapping entries for each matching stock
    matchingStocks.forEach((stock: any, stockIndex: number) => {
      const uniqueId = `${selectedMedicineRequestData.med_id}_${stock.id}_${selectedMedicineRequestData.medreqitem_id}`
      
      mappedMedicines.push({
        ...stock,
        id: uniqueId,
        display_id: `${selectedMedicineRequestData.med_name} (Stock ID: ${stock.id})`,
        med_name: selectedMedicineRequestData.med_name,
        med_type: selectedMedicineRequestData.med_type,
        medreqitem_id: selectedMedicineRequestData.medreqitem_id,
        requested_qty: selectedMedicineRequestData.medreqitem_qty,
        pending_reason: selectedMedicineRequestData.reason || "No reason provided",
        request_item: selectedMedicineRequestData,
        original_stock_id: stock.id
      })
    })

    return mappedMedicines
  }

  // Get enhanced medicine stocks
  const enhancedMedicineStocks = createMedicineMapping()

  // Handler for medicine selection
  const handleSelectedMedicinesChange = (updatedSelectedMedicines: any[]) => {
    const enhancedSelectedMedicines = updatedSelectedMedicines.map((selectedMed: any) => {
      const medicineData = enhancedMedicineStocks.find((med: any) => med.id === selectedMed.minv_id)
      
      if (medicineData) {
        return {
          ...selectedMed,
          medreqitem_id: medicineData.medreqitem_id,
          med_name: medicineData.med_name,
          med_id: medicineData.med_id,
          original_stock_id: medicineData.original_stock_id,
          minv_id: selectedMed.minv_id,
          reason: selectedMed.reason || medicineData.pending_reason
        }
      }
      return selectedMed
    })

    setSelectedMedicines(enhancedSelectedMedicines)
  }

  // Set initial selections
  useEffect(() => {
    if (enhancedMedicineStocks.length > 0 && !initialSelectionsSet) {
      const initialSelected = enhancedMedicineStocks.map((medicine: any) => ({
        minv_id: medicine.id,
        medrec_qty: medicine.requested_qty || 1,
        reason: medicine.pending_reason,
        medreqitem_id: medicine.medreqitem_id,
        med_name: medicine.med_name,
        med_id: medicine.med_id,
        original_stock_id: medicine.original_stock_id
      }))

      setSelectedMedicines(initialSelected)
      setInitialSelectionsSet(true)
    }
  }, [enhancedMedicineStocks, initialSelectionsSet])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 font-medium">
            Rejected
          </Badge>
        )
      case "referred":
        return (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
            Referred
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleViewDocuments = (files: any[]) => {
    setSelectedFiles(files)
    setIsDocumentModalOpen(true)
  }

  const processMedicineAllocation = () => {
    const validSelectedMedicines = selectedMedicines.filter(med => 
      med.medreqitem_id && med.minv_id && med.medrec_qty > 0
    )

    if (validSelectedMedicines.length === 0) {
      console.error("No valid medicines selected for allocation")
      return
    }

    const payload = {
      medreq_id: selectedMedicineRequestData?.medreq_id,
      selected_medicines: validSelectedMedicines.map((med) => ({
        minv_id: med.original_stock_id || med.minv_id,
        medrec_qty: med.medrec_qty,
        medreqitem_id: med.medreqitem_id,
        reason: med.reason
      }))
    }

    console.log("Allocation payload:", payload)
    createAllocation(payload)
  }

  return (
    <LayoutWithBack title="Medicine Request Details" description="View details of the selected medicine request">
      <div className="space-y-6">
        {/* Patient Information Section */}
        {selectedPatientData ? (
          <div className="mb-8">
            <PatientInfoCard patient={selectedPatientData} />
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <Label className="text-lg font-semibold text-amber-800">No Patient Selected</Label>
                <p className="text-sm text-amber-700 mt-1">
                  Please select a patient from the medicine records page first.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Medicine Request Details Section */}
        {selectedMedicineRequestData ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Medicine Request Details</h2>
                    <p className="text-sm text-gray-600">Request ID: {selectedMedicineRequestData.medreq_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/IndivMedicineRecord`}
                    state={{
                      params: {
                        patientData: location.state?.params?.patientData
                      }
                    }}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View History
                  </Link>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Request Information */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-600" />
                      Request Information
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-1">Request Date</p>
                          <p className="text-sm text-gray-900 font-medium">
                            {formatDate(selectedMedicineRequestData.requested_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-1">Current Status</p>
                          <div>{getStatusBadge(selectedMedicineRequestData.medreq_status)}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Hash className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-1">Request Item ID</p>
                          <p className="text-sm text-gray-900 font-medium">
                            {selectedMedicineRequestData.medreqitem_id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medicine Information */}
                <div className="lg:col-span-2">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Pill className="h-4 w-4 text-green-600" />
                      Medicine Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Pill className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">Medicine Name</p>
                            <p className="text-base font-semibold text-gray-900">
                              {selectedMedicineRequestData.med_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">ID: {selectedMedicineRequestData.med_id}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Pill className="h-4 w-4 text-teal-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">Medicine Type</p>
                            <p className="text-sm font-medium text-gray-900">{selectedMedicineRequestData.med_type}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Pill className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">Quantity Requested</p>
                            <p className="text-sm font-medium text-gray-900">{selectedMedicineRequestData.medreqitem_qty}</p>
                          </div>
                        </div>
                      </div>

                      {/* Documents Section */}
                      <div className="flex items-center justify-center">
                        {selectedMedicineRequestData.medicine_files &&
                        selectedMedicineRequestData.medicine_files.length > 0 ? (
                          <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {selectedMedicineRequestData.medicine_files.length} document
                              {selectedMedicineRequestData.medicine_files.length !== 1 ? "s" : ""} attached
                            </p>
                            <Button
                              onClick={() => handleViewDocuments(selectedMedicineRequestData.medicine_files)}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
                            >
                              <Eye className="h-4 w-4" />
                              View Documents
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center text-gray-400">
                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No documents attached</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason Section */}
              {selectedMedicineRequestData.reason && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    Reason for Request
                  </h3>
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg p-5 border border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{selectedMedicineRequestData.reason}</p>
                  </div>
                </div>
              )}

              {/* Medicine Display Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Medicine Stock</h3>
                <MedicineDisplay
                  medicines={enhancedMedicineStocks}
                  initialSelectedMedicines={selectedMedicines}
                  onSelectedMedicinesChange={handleSelectedMedicinesChange}
                  itemsPerPage={5}
                  currentPage={medicineDisplayPage}
                  onPageChange={setMedicineDisplayPage}
                  autoFillReasons={true}
                  isLoading={isMedicinesLoading}
                />
              </div>

              {/* Process Button */}
              {selectedMedicines.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-end">
                    <Button 
                      onClick={processMedicineAllocation}
                      disabled={isPending}
                      className="flex items-center gap-2"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Process Allocation (${selectedMedicines.length} item${selectedMedicines.length !== 1 ? 's' : ''})`
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <Label className="text-lg font-semibold text-amber-800">No Medicine Request Data</Label>
                <p className="text-sm text-amber-700 mt-1">No medicine request details available to display.</p>
              </div>
            </div>
          </div>
        )}


         {/* Debug info - Enhanced to show more details */}
         {selectedMedicines.length > 0 && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h4 className="font-semibold mb-2">Selected Medicines Debug Info:</h4>
            <div className="text-sm">
              {selectedMedicines.map((med, index) => (
                <div key={index} className="mb-2 p-2 bg-white rounded">
                  <div>Medicine: <span className="font-semibold text-blue-600">{med.med_name || "Unknown"}</span></div>
                  <div>MinvId: <span className="text-gray-600">{med.minv_id}</span></div>
                  <div>Original Stock ID: <span className="text-purple-600">{med.original_stock_id}</span></div>
                  <div>Qty: <span className="text-green-600">{med.medrec_qty}</span></div>
                  <div>Reason: <span className="text-orange-600">{med.reason}</span></div>
                  <div>
                    MedReqItem ID: <span className={med.medreqitem_id ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{med.medreqitem_id || "N/A"}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Total Enhanced Medicine Stocks: {enhancedMedicineStocks.length} | 
              Total Stock Options: {medicineStocksOptions?.length || 0}
            </div>
          </div>
        )}

        {/* Document Modal */}
        <DocumentModal
          files={selectedFiles}
          isOpen={isDocumentModalOpen}
          onClose={() => setIsDocumentModalOpen(false)}
        />
      </div>
    </LayoutWithBack>
  )
}