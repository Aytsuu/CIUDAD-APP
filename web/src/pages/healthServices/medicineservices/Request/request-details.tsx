import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { calculateAge } from "@/helpers/ageCalculator";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  Calendar,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  UserPlus,
  Package,
  ChevronLeft,
  Trash2,
  Mail,
  HeartPulse,
  Home,
  Landmark,
  Navigation
} from "lucide-react";
import { MedicineRequestDetailProps, MedicineRequestItem } from "./types";
import { fetchRequestItems } from "./restful-api/get";
import { createPatients } from "@/pages/record/health/patientsRecord/restful-api/patientsPostAPI";
import {
  createPatientRecord,
  createMedicineRecord,
} from "@/pages/healthServices/medicineservices/restful-api/postAPI";
import { updateMedicineRequest } from "./restful-api/update";

export default function MedicineRequestDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const request = location.state?.request as MedicineRequestDetailProps;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentPatId, setCurrentPatId] = useState<string | null>(request.pat_id);
  const [items, setItems] = useState<MedicineRequestItem[]>([]);
  const [quantityErrors, setQuantityErrors] = useState<{[key: number]: string}>({});

  const { data: requestItems, isLoading } = useQuery<MedicineRequestItem[]>({
    queryKey: ["requestItem"],
    queryFn: () =>
      request
        ? fetchRequestItems(
            request.medreq_id,
            request.pat_id || null,
            request.rp_id || null
          )
        : Promise.resolve([]),
    enabled: !!request,
  });

  useEffect(() => {
    if (requestItems) {
      setItems([...requestItems]);
    }
  }, [requestItems]);

  const updateQuantity = (index: number, newQuantity: number) => {
    const item = items[index];
    const availableQty = item?.minv_details?.minv_qty_avail || 0;
    
    // Clear any existing error for this item
    setQuantityErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });

    // Validate quantity
    if (newQuantity > availableQty) {
      setQuantityErrors(prev => ({
        ...prev,
        [index]: `Cannot exceed available quantity of ${availableQty}`
      }));
      // Still update the quantity to show the error state
    } else if (newQuantity < 1) {
      setQuantityErrors(prev => ({
        ...prev,
        [index]: "Quantity must be at least 1"
      }));
    }

    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        medreqitem_qty: newQuantity,
      };
      return updatedItems;
    });
  };

  const handleDeleteItem = (index: number) => {
    if (window.confirm("Are you sure you want to remove this item from the request?")) {
      setItems((prevItems) => {
        const newItems = [...prevItems];
        newItems.splice(index, 1);
        return newItems;
      });
      // Clear any error for this item
      setQuantityErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
      toast.success("Item removed from request");
    }
  };

  const columns: ColumnDef<MedicineRequestItem>[] = [
    {
      accessorKey: "medicine",
      header: "Medicine",
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px]">
          {row.original.minv_details?.med_detail?.med_name || "Unknown Medicine"}
        </div>
      ),
    },
    {
      accessorKey: "available_qty",
      header: "Available Quantity",
      cell: ({ row }) => {
        const minvDetails = row.original.minv_details;
        const unit = minvDetails?.minv_qty_unit === "boxes" ? "pcs" : minvDetails?.minv_qty_unit;
        const availableQty = minvDetails?.minv_qty_avail || 0;

        return (
          <div className="flex justify-center min-w-[200px]">
            {availableQty === 0 
              ? <span className="text-red-500">Out of stock</span> 
              : `${availableQty} ${unit || ""}`}
          </div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => {
        const index = row.index;
        const quantity = items[index]?.medreqitem_qty || 0;
        const minvDetails = row.original.minv_details;
        const availableQty = minvDetails?.minv_qty_avail || 0;
        const hasError = quantityErrors[index];
        const isOutOfStock = availableQty === 0;

        const handleIncrement = () => updateQuantity(index, quantity + 1);
        const handleDecrement = () => updateQuantity(index, Math.max(1, quantity - 1));

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = parseInt(e.target.value) || 0;
          updateQuantity(index, Math.max(0, value));
        };

        const isPlusDisabled = isOutOfStock || quantity >= availableQty;
        const isMinusDisabled = quantity <= 1;

        if (isOutOfStock) {
          return (
            <div className="flex flex-col items-center gap-2">
              <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md">
                <span className="text-red-600 text-sm font-medium">Out of Stock</span>
              </div>
            </div>
          );
        }

        return (
          <div className="flex flex-col items-center gap-2 min-w-[160px]">
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecrement}
                className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                  isMinusDisabled 
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400'
                }`}
                disabled={isMinusDisabled}
                title={isMinusDisabled ? "Minimum quantity is 1" : "Decrease quantity"}
              >
                -
              </button>
              
              <input
                type="number"
                value={quantity}
                onChange={handleInputChange}
                className={`w-16 text-center border rounded py-1 px-2 transition-colors ${
                  hasError 
                    ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                min="1"
                max={availableQty}
                title={hasError ? hasError : `Maximum available: ${availableQty}`}
              />
              
              <button
                onClick={handleIncrement}
                className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                  isPlusDisabled 
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400'
                }`}
                disabled={isPlusDisabled}
                title={isPlusDisabled ? `Maximum available quantity is ${availableQty}` : "Increase quantity"}
              >
                +
              </button>
            </div>

            {hasError && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span className="font-medium">{hasError}</span>
              </div>
            )}

            {/* {!hasError && quantity > 0 && (
              <div className="text-xs text-gray-500">
                of {availableQty} available
              </div>
            )} */}
          </div>
        );
      },
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <div className="flex justify-start">{row.original.reason || "-"}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const index = row.index;
        return (
          <div className="flex justify-center">
            <button
              onClick={() => handleDeleteItem(index)}
              className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
              title="Delete item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    }
  ];

  const handleRegisterPatient = async () => {
    setIsRegistering(true);
    try {
      const response = await createPatients({
        pat_status: "active",
        rp_id: request.rp_id,
        personal_info: request.personal_info,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pat_type: "Resident",
      });
      setCurrentPatId(response.pat_id);
      await updateMedicineRequest(request.medreq_id, {
        rp_id: null,
        pat_id: response.pat_id,
      });
      toast.success("Successfully registered");
    } catch (error) {
      toast.error("Failed to register patient");
      console.error("Registration error:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleMarkAsFulfilled = async () => {
    if (!items || items.length === 0) {
      toast.error("No items to fulfill");
      return;
    }

    // Validate all quantities before processing
    const errors: {[key: number]: string} = {};
    let hasValidationErrors = false;

    items.forEach((item, index) => {
      const availableQty = item.minv_details?.minv_qty_avail || 0;
      const requestedQty = item.medreqitem_qty;

      if (availableQty === 0) {
        errors[index] = "Item is out of stock";
        hasValidationErrors = true;
      } else if (requestedQty > availableQty) {
        errors[index] = `Cannot exceed available quantity of ${availableQty}`;
        hasValidationErrors = true;
      } else if (requestedQty < 1) {
        errors[index] = "Quantity must be at least 1";
        hasValidationErrors = true;
      }
    });

    if (hasValidationErrors) {
      setQuantityErrors(errors);
      toast.error("Please fix quantity errors before fulfilling the request");
      return;
    }

    setIsSubmitting(true);
    try {
      let patientRecordId = null;
      const effectivePatId = currentPatId || request.pat_id;

      if (effectivePatId) {
        try {
          const patientRecordResponse = await createPatientRecord(effectivePatId);
          patientRecordId = patientRecordResponse.patrec_id;
        } catch (error) {
          console.error("Error creating patient record:", error);
        }
      }

      const createRecordPromises = items.map(async (item) => {
        const recordData = {
          medrec_qty: item.medreqitem_qty,
          reason: item.reason || null,
          fulfilled_at: new Date().toISOString(),
          patrec_id: patientRecordId || null,
          minv_id: item.minv_details?.minv_id || null,
        };
        return createMedicineRecord(recordData);
      });

      await Promise.all(createRecordPromises);

      await updateMedicineRequest(request.medreq_id, {
        status: "fulfilled",
        fulfilled_at: new Date().toISOString(),
      });
      toast.success("Medicine request fulfilled successfully");
      navigate(-1);
    } catch (error) {
      toast.error("Failed to fulfill medicine request");
      console.error("Fulfillment error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!request) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Request Data</h3>
          <p className="text-gray-500">The medicine request data could not be found.</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const fullName = `${request.personal_info.per_lname}, ${request.personal_info.per_fname} ${request.personal_info.per_mname || ""}`.trim();
  const age = calculateAge(request.personal_info.per_dob);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" w-full p-6">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button className="text-black p-2 mb-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
              <ChevronLeft />
            </Button>
            <div className="flex-col items-center mb-4">
              <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Medicine Request Details</h1>
              <p className="text-xs sm:text-sm text-darkGray">View details of requested medicine</p>
            </div>
          </div>
          <hr className="border-gray mb-5 sm:mb-8" />
        </div>

        <div className="mb-5">
          {/* Patient Information Card */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Patient Information</h2>
              </div>

              <div className="space-y-6">
                {/* Main Patient Info */}
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{fullName}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {age} years old
                      </span>
                      <span>•</span>
                      <span>{request.personal_info.per_sex}</span>
                    </div>
                  </div>
                </div>

                {/* Compact Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(request.personal_info.per_dob).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Number</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {request.personal_info.per_contact || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <HeartPulse className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Patient Status</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {currentPatId || request.pat_id ? "Registered" : "Not Registered"}
                        </p>
                        {currentPatId || request.pat_id ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ID: {currentPatId || request.pat_id}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Unregistered
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Civil Status</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {request.personal_info.per_status || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                      <Home className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Complete Address</p>
                        <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                          {request.address?.full_address || "No Address Provided"}
                        </p>
                      </div>
                    </div>
                </div>

                {/* Registration Alert */}
                {!currentPatId && !request.pat_id && request.rp_id && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-blue-900 font-semibold mb-1">Registration Required</h4>
                        <p className="text-blue-700 text-sm mb-3">
                          Register this person as a patient to enable medical tracking and history.
                        </p>
                        <Button 
                          onClick={handleRegisterPatient} 
                          size="sm" 
                          disabled={isRegistering}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {isRegistering ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Registering...
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3 mr-2" />
                              Register Patient
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Requested Medicines Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Requested Medicines</h2>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                Requested on{" "}
                {new Date(request.requested_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <DataTable columns={columns} data={items} />
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
          {request.status === "pending" && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5"
              size="lg"
              onClick={handleMarkAsFulfilled}
              disabled={isSubmitting || isRegistering || items.length === 0}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Fulfilled
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}