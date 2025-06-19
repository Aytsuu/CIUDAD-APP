import React from "react";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Search } from "lucide-react";

interface PatientSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  patientTypeFilter: string;
  setPatientTypeFilter: (filter: string) => void;
  className?: string; // Optional for custom styling
}

const PatientSearch: React.FC<PatientSearchProps> = ({
  searchQuery,
  setSearchQuery,
  patientTypeFilter,
  setPatientTypeFilter,
  className = "",
}) => {
  return (
    <div className={`w-full flex flex-col sm:flex-row gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
          size={17}
        />
        <Input
          placeholder="Search..."
          className="pl-10 bg-white w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <SelectLayout
        placeholder="Filter records"
        label=""
        className="bg-white w-full sm:w-48"
        options={[
          { id: "all", name: "All Types" },
          { id: "resident", name: "Resident" },
          { id: "transient", name: "Transient" },
        ]}
        value={patientTypeFilter}
        onChange={(value) => setPatientTypeFilter(value)}
      />
    </div>
  );
};

export default PatientSearch;