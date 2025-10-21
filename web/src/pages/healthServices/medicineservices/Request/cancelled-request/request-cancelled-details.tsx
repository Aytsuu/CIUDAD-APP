"use client";
import { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Package, History } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cancelledDetailsIColumns } from "./columns";
import { useMedicineRequestStatusesDetails } from "../queries/fetch";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";

export default function CancelledRequestDetail() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get the request data from state params
  const patientData = location.state?.params?.patientData;
  const medreq_id = location.state?.params?.medreq_id as any;

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch cancelled request details
  const {
    data: apiResponse,
    isLoading,
    error: cancelledRequestError,
  } = useMedicineRequestStatusesDetails(medreq_id, currentPage, pageSize, "cancelled");

  // Extract data from paginated response
  const medicineData = apiResponse?.results || [];
  const totalCount = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);



  if (cancelledRequestError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Error loading medicine request items</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <LayoutWithBack title="cancelled Medicine Request" description="View details of cancelled medicine request">
      <div className="">
        {/* Patient Information Card */}
        <div className="mb-5">
          <PatientInfoCard patient={patientData} />
        </div>

        {/* cancelled Items Table */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <CardTitle>
                cancelled Medicine Items{" "}
                <span className="bg-green-500 text-white rounded-full text-sm px-2">{totalCount}</span>
              </CardTitle>
              <CardDescription>All cancelled medicine request items with allocation details</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/services/medicine/records/individual-records"
                state={{
                  params: {
                    patientData: {
                      pat_id:  patientData?.pat_id,
                      pat_type: patientData?.pat_type,
                      age: patientData?.age,
                      addressFull: patientData?.address?.full_address || "No address provided",
                      address: {
                        add_street: patientData?.address?.add_street,
                        add_barangay: patientData?.address?.add_barangay,
                        add_city: patientData?.address?.add_city,
                        add_province: patientData?.address?.add_province,
                        add_sitio: patientData?.address?.add_sitio,
                      },
                      households: [{ hh_id: patientData?.householdno }],
                      personal_info: {
                        per_fname: patientData?.personal_info?.per_fname,
                        per_mname: patientData?.personal_info?.per_mname,
                        per_lname: patientData?.personal_info?.per_lname,
                        per_dob: patientData?.personal_info?.per_dob,
                        per_sex: patientData?.personal_info?.per_sex,
                      },
                    },
                  },
                }}
              >
                <Button size="sm">
                  <History className="h-4 w-4 mr-2" />
                  View History
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="pageSize" className="text-sm">
                  Show
                </Label>
                <Input
                  id="pageSize"
                  type="number"
                  className="w-20 h-8"
                  value={pageSize}
                  onChange={(e) => {
                    const value = Math.max(1, Math.min(+e.target.value, 100));
                    setPageSize(value);
                    setCurrentPage(1);
                  }}
                  min="1"
                  max="100"
                />
                <Label className="text-sm">entries</Label>
              </div>
            </div>

            {/* Table Content */}
            <div className="border rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              ) : cancelledRequestError ? (
                <div className="flex items-center justify-center py-12 text-red-600">
                  <AlertCircle className="h-8 w-8 mr-2" />
                  <span>Error loading items. Please try again.</span>
                </div>
              ) : medicineData.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  <Package className="h-8 w-8 mr-2" />
                  <span>No cancelled items found</span>
                </div>
              ) : (
                <>
                  <DataTable columns={cancelledDetailsIColumns} data={medicineData} />
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t bg-gray-50">
                    <p className="text-sm text-gray-600">
                      Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} items
                    </p>
                    <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

    
      </div>
    </LayoutWithBack>
  );
}