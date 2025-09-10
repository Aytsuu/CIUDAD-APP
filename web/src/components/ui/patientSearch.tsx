"use client";

import { useEffect, useCallback } from "react";
import { User } from "lucide-react";
import { Link } from "react-router-dom";

import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { toast } from "sonner";
import { usePatientsQuery, usePatients5yearsbelowQuery } from "@/pages/healthServices/restful-api-patient/FetchPatient";

export interface Patient {
  pat_id: string;
  pat_type: string;
  name?: string;
  trans_id?: string;
  rp_id?: { rp_id?: string };
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
    add_sitio?: string;
    full_address?: string;
  };
  family?: {
    fam_id: string;
    fc_role: string;
  };
  family_head_info?: {
    fam_id: string | null;
    family_heads?: {
      mother?: {
        role?: string;
        personal_info?: {
          per_fname?: string | null;
          per_mname?: string | null;
          per_lname?: string | null;
          per_dob?: string | null;
          per_sex?: string | null;
        };
      };
      father?: {
        role?: string;
        personal_info?: {
          per_fname?: string | null;
          per_mname?: string | null;
          per_lname?: string | null;
          per_dob?: string | null;
          per_sex?: string | null;
        };
      };
    };
  };
  spouse_info?: {
    spouse_info?: {
      spouse_fname?: string
      spouse_lname?: string
      spouse_mname?: string
      spouse_dob?: string
      spouse_occupation?: string
    }
  };
}

interface PatientSearchProps {
  onPatientSelect: (patient: Patient | null, patientId: string) => void;
  className?: string;
  value: string;
  onChange: (id: string) => void;
  ischildren?: boolean;
}

export function PatientSearch({
  onPatientSelect,
  className,
  value,
  onChange,
  ischildren = false,
}: PatientSearchProps) {
  const {
    data: patientsData,
    isLoading,
    isError,
    error,
  } = usePatientsQuery();

  const {
    data: patients5YearsBelowData,
    isLoading: isLoading5YearsBelow,
    isError: isError5YearsBelow,
    error: error5YearsBelow,
  } = usePatients5yearsbelowQuery();

  useEffect(() => {
    if (isError) {
      toast.error(`Failed to load patients: ${(error as Error).message}`);
    }
    if (isError5YearsBelow) {
      toast.error(`Failed to load children patients: ${(error5YearsBelow as Error).message}`);
    }
  }, [isError, error, isError5YearsBelow, error5YearsBelow]);

  const handlePatientSelection = useCallback(
    (id: string) => {
      onChange(id);
      const dataSource = ischildren ? patients5YearsBelowData?.default : patientsData?.default;
      const selectedPatient = dataSource?.find(
        (patient: any) => patient.pat_id.toString() === id.split(",")[0].trim()
      );
      onPatientSelect(selectedPatient || null, id);
    },
    [patientsData?.default, patients5YearsBelowData?.default, onPatientSelect, onChange, ischildren]
  );

  const currentData = ischildren ? patients5YearsBelowData : patientsData;
  const currentIsLoading = ischildren ? isLoading5YearsBelow : isLoading;
  const currentEmptyMessage = ischildren ? "No child patient found." : "No patient found.";

  return (
    <div
      className={`bg-white rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center gap-3 mb-2">
      <User className="h-4 w-4 text-darkBlue3" />
      <Label className="text-base font-semibold text-darkBlue3">
        {ischildren ? "Select Child Patient" : "Select Patient"}
      </Label>
      </div>
      <Combobox
      options={currentData?.formatted ?? []}
      value={value}
      onChange={handlePatientSelection}
      placeholder={
        currentIsLoading ? "Loading patients..." : `Search and select ${ischildren ? "a child" : "a"} patient`
      }
      triggerClassName="font-normal w-full"
      emptyMessage={
        <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
        <Label className="font-normal text-xs">
          {currentIsLoading ? "Loading..." : currentEmptyMessage}
        </Label>
        <Link to="/patient-records/new">
          <Label className="font-normal text-xs text-teal cursor-pointer hover:underline">
          Register New Patient
          </Label>
        </Link>
        </div>
      }
      />
      {/* <span className="text-xs italic text-red-400 mt-2">
      Note: Ensure the selected patient does not have any existing records. 
      </span> */}
    </div>
  );
}