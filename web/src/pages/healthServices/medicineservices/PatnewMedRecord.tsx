"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  MapPin,
  UserCheck,
  Plus,
  Package,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { calculateAge } from "@/helpers/ageCalculator";
import { fetchPatientRecords } from "../restful-api-patient/FetchPatient";
import { fetchMedicinesWithStock } from "./restful-api/fetchAPI";
import { z } from "zod";
import { positiveNumberSchema } from "@/helpers/PositiveNumber";

// Schema definition
export const MedicineRequestArraySchema = z.object({
  pat_id: z.string().min(1, "Patient ID is required"),
  medicines: z
    .array(
      z.object({
        minv_id: z.string().min(1, "Medicine is required"),
        medrec_qty: positiveNumberSchema,
        reason: z.string().optional(),
      })
    )
    .min(1, "At least one medicine must be selected"),
});

export type MedicineRequestArrayType = z.infer<
  typeof MedicineRequestArraySchema
>;

const StockBadge = ({ quantity, unit }: { quantity: number; unit: string }) => {
  if (quantity === 0) {
    return (
      <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full border border-red-200">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        Out of Stock
      </span>
    );
  }
  if (quantity <= 10) {
    return (
      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200">
        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
        Low: {quantity} {unit}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200">
      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
      {quantity} {unit}
    </span>
  );
};

const PatientInfoCard = ({ patient }: { patient: any }) => {
  if (!patient) {
    return (
      <div className="rounded-xl p-8 text-center">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Patient Selected
        </h3>
        <p className="text-gray-500">
          Please select a patient to view their information
        </p>
      </div>
    );
  }

  const fullName = `${patient.personal_info?.per_fname || ""} ${
    patient.personal_info?.per_mname || ""
  } ${patient.personal_info?.per_lname || ""}`.trim();
  const fullAddress = [
    patient.address?.add_street,
    patient.address?.add_barangay,
    patient.address?.add_city,
    patient.address?.add_province,
    patient.address?.add_external_sitio,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-white   p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <User className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Patient Information
          </h2>
          <p className="text-sm text-gray-600">Current patient details</p>
        </div>
        <div className="ml-auto text-right">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            {format(new Date(), "MMM dd, yyyy")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-gray-500 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-700">Full Name</p>
              <p className="text-gray-900">{fullName || "Not provided"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-gray-500 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-700">Address</p>
              <p className="text-gray-900">{fullAddress || "Not provided"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-gray-500 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-700">Date of Birth</p>
              <p className="text-gray-900">
                {patient.personal_info?.per_dob
                  ? format(
                      new Date(patient.personal_info.per_dob),
                      "MMM dd, yyyy"
                    )
                  : "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <UserCheck className="h-4 w-4 text-gray-500 mt-1" />
            <div className="flex gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Age</p>
                <p className="text-gray-900">
                  {patient.personal_info?.per_dob
                    ? calculateAge(
                        new Date(patient.personal_info.per_dob).toISOString()
                      )
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Gender</p>
                <p className="text-gray-900">
                  {patient.personal_info?.per_sex || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Type</p>
                <p className="text-gray-900">
                  {patient.pat_type || "Standard"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PatNewMedRecForm() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState({
    default: [] as any[],
    formatted: [] as { id: string; name: string }[],
  });
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedPatientData, setSelectedPatientData] = useState<any>(null);
  const { medicineStocksOptions, isLoading } = fetchMedicinesWithStock();
  const [selectedMedicines, setSelectedMedicines] = useState<
    { minv_id: string; medrec_qty: number; reason: string }[]
  >([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(medicineStocksOptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMedicines = medicineStocksOptions.slice(startIndex, endIndex);

  // Load patients on mount
  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      try {
        const data = await fetchPatientRecords();
        setPatients(data);
      } catch (error) {
        toast.error("Failed to load patients");
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, []);

  // Handle patient selection
  const handlePatientSelection = (id: string) => {
    setSelectedPatientId(id);
    const selectedPatient = patients.default.find(
      (patient) => patient.pat_id.toString() === id
    );
    setSelectedPatientData(selectedPatient);
    form.setValue("pat_id", id);
  };

  // Handle medicine selection
  const handleMedicineSelection = (minv_id: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedMedicines((prev) => [
        ...prev,
        { minv_id, medrec_qty: 1, reason: "" },
      ]);
    } else {
      setSelectedMedicines((prev) =>
        prev.filter((med) => med.minv_id !== minv_id)
      );
    }
  };

  // Handle quantity change
  const handleQuantityChange = (minv_id: string, value: number) => {
    setSelectedMedicines((prev) =>
      prev.map((med) =>
        med.minv_id === minv_id ? { ...med, medrec_qty: value } : med
      )
    );
  };

  // Handle reason change
  const handleReasonChange = (minv_id: string, value: string) => {
    setSelectedMedicines((prev) =>
      prev.map((med) =>
        med.minv_id === minv_id ? { ...med, reason: value } : med
      )
    );
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Form setup
  const form = useForm<MedicineRequestArrayType>({
    resolver: zodResolver(MedicineRequestArraySchema),
    defaultValues: {
      pat_id: "",
      medicines: [],
    },
  });

  // Form submission
  const onSubmit = (data: MedicineRequestArrayType) => {
    const submissionData = {
      pat_id: data.pat_id,
      medicines: selectedMedicines.map((med) => ({
        minv_id: med.minv_id,
        medrec_qty: med.medrec_qty,
        reason: med.reason,
      })),
    };

    console.log("Submitting:", submissionData);
    toast.success("Medicine request submitted successfully");
    navigate("/medicine-records");
  };

  const totalSelectedQuantity = selectedMedicines.reduce(
    (sum, med) => sum + med.medrec_qty,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  New Medicine Request
                </h1>
                <p className="text-gray-600">
                  Create a new medicine request for a patient
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-gray-600" />
            <Label className="text-lg font-semibold text-gray-900">
              Select Patient
            </Label>
          </div>
          <Combobox
            options={patients.formatted}
            value={selectedPatientId}
            onChange={handlePatientSelection}
            triggerClassName="w-full"
            placeholder={
              loading ? "Loading patients..." : "Search and select a patient"
            }
            emptyMessage={
              <div className="flex gap-2 justify-center items-center p-4">
                <Label className="font-normal text-sm text-gray-600">
                  {loading ? "Loading..." : "No patient found."}
                </Label>
                <Link to="/patient-records/new">
                  <Label className="font-medium text-sm text-blue-600 cursor-pointer hover:text-blue-800 hover:underline">
                    Register New Patient
                  </Label>
                </Link>
              </div>
            }
          />
        </div>

        <div className="bg-white rounded-md pb-5">
          {/* Patient Information Display */}
          <div className="mb-6">
            <PatientInfoCard patient={selectedPatientData} />
          </div>

          {/* Selected Medicines Summary */}
          {selectedMedicines.length > 0 && (
            <div className="bg-white rounded-md p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900">
                      {selectedMedicines.length} medicine
                      {selectedMedicines.length > 1 ? "s" : ""} selected
                    </p>
                    <p className="text-sm text-emerald-700">
                      Total quantity: {totalSelectedQuantity} items
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-600">Ready to submit</p>
                </div>
              </div>
            </div>
          )}

          {/* Medicines Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 sm px-4  mx-3 ">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Available Medicines
                  </h2>
                </div>
                <div className="text-sm text-gray-500">
                  {medicineStocksOptions.length} medicines available
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medicine Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentMedicines.map((medicine) => {
                    const isSelected = selectedMedicines.some(
                      (m) => m.minv_id === medicine.id
                    );
                    const selectedMedicine = selectedMedicines.find(
                      (m) => m.minv_id === medicine.id
                    );
                    const isOutOfStock = medicine.avail === 0;

                    return (
                      <tr
                        key={medicine.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          isSelected
                            ? "bg-blue-50 border-l-4 border-l-blue-500"
                            : ""
                        } ${isOutOfStock ? "opacity-60" : ""}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isOutOfStock}
                              onChange={(e) =>
                                handleMedicineSelection(
                                  medicine.id,
                                  e.target.checked
                                )
                              }
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <Package className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {medicine.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {medicine.dosage} • {medicine.form}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StockBadge
                            quantity={Number(medicine.avail)}
                            unit={medicine.unit}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isSelected && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                max={medicine.avail}
                                className="border border-gray-300 rounded-lg px-3 py-1 w-20 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={selectedMedicine?.medrec_qty || 0}
                                placeholder="Qty"
                                onChange={(e) =>
                                  handleQuantityChange(
                                    medicine.id,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isSelected && (
                            <input
                              type="text"
                              className="border border-gray-300 rounded-lg px-3 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter reason for prescription..."
                              value={selectedMedicine?.reason || ""}
                              onChange={(e) =>
                                handleReasonChange(medicine.id, e.target.value)
                              }
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {medicineStocksOptions.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No medicines available
                </h3>
                <p className="text-gray-500">
                  There are currently no medicines in stock.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 animate-pulse"
                  >
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {medicineStocksOptions.length > itemsPerPage && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 mb-6">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({startIndex + 1}-
                    {Math.min(endIndex, medicineStocksOptions.length)} of{" "}
                    {medicineStocksOptions.length})
                  </span>
                </div>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
        {/* Validation Messages
        {!selectedPatientId && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Patient Required</p>
                <p className="text-sm text-amber-700">Please select a patient to continue with the medicine request.</p>
              </div>
            </div>
          </div>
        )} */}

        {/* Actions */}
        <div className="flex justify-end items-center">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="px-8"
            >
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={!selectedPatientId || selectedMedicines.length === 0}
              className="px-8  text-white"
            >
              Submit Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
