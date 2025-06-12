import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAnimalBitePatientDetails } from "./api/get-api"; 
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { ArrowLeft } from "lucide-react";

// Re-using the PatientRecordDetail type from overall.tsx
type PatientRecordDetail = {
  bite_id: number;
  exposure_type: string;
  actions_taken: string;
  referredby: string;
  biting_animal: string;
  exposure_site: string;
  patient_fname: string;
  patient_lname: string;
  patient_mname?: string;
  patient_sex: string;
  patient_dob: string;
  patient_address: string;
  patient_id: string; // This is the pat_id from the Patient model (varchar)
  referral_id: number;
  referral_date: string;
  referral_transient: boolean;
  referral_receiver: string;
  referral_sender: string;
  record_created_at: string;
  patrec_id: number;
};

const IndividualPatientHistory: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>(); // Get patientId from URL

  const {
    data: patientRecords,
    isLoading,
    isError,
    error,
  } = useQuery<PatientRecordDetail[], Error>({
    queryKey: ["animalbitePatientHistory", patientId],
    queryFn: () => getAnimalBitePatientDetails(patientId!), // Fetch all records for this patient
    enabled: !!patientId, 
  });

  const columns: ColumnDef<PatientRecordDetail>[] = useMemo(() => [
    {
      accessorKey: "referral_date",
      header: "Referral Date",
      cell: ({ row }) => new Date(row.original.referral_date).toLocaleDateString(),
    },
    {
      accessorKey: "exposure_type",
      header: "Exposure Type",
    },
    {
      accessorKey: "exposure_site",
      header: "Site of Exposure",
    },
    {
      accessorKey: "biting_animal",
      header: "Biting Animal",
    },
    {
      accessorKey: "actions_taken",
      header: "Actions Taken",
    },
    {
      accessorKey: "referredby",
      header: "Referred By",
    },
    {
      accessorKey: "referral_receiver",
      header: "Receiver",
    },
    {
      accessorKey: "referral_sender",
      header: "Sender",
    },
    {
      accessorKey: "referral_transient",
      header: "Transient",
      cell: ({ row }) => (row.original.referral_transient ? "Yes" : "No"),
    },
    {
      accessorKey: "record_created_at",
      header: "Record Created At",
      cell: ({ row }) => new Date(row.original.record_created_at).toLocaleString(),
    },
  ], []);

  if (!patientId) {
    return <div className="p-4 text-center">No patient ID provided.</div>;
  }

  if (isLoading) {
    return <div className="p-4 text-center">Loading patient history...</div>;
  }

  if (isError) {
    return <div className="p-4 text-center text-red-600">Error: {error?.message || "Failed to load patient history."}</div>;
  }

  const patientName = patientRecords && patientRecords.length > 0
    ? `${patientRecords[0].patient_fname} ${patientRecords[0].patient_lname}`
    : "Unknown Patient";

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/animalbites/overall">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Animal Bite History for {patientName} (ID: {patientId})</h1>
      </div>

      <div className="rounded-md border">
        {patientRecords && patientRecords.length > 0 ? (
          <DataTable columns={columns} data={patientRecords} />
        ) : (
          <p className="text-center py-8 text-gray-500">No animal bite records found for this patient.</p>
        )}
      </div>
    </div>
  );
};

export default IndividualPatientHistory;