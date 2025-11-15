// components/MedicalHistoryTab.tsx
import React, { useCallback } from "react";
import { Loader2, Calendar, Search, X, AlertCircle } from "lucide-react";
import CardLayout from "@/components/ui/card/card-layout";
import { getServiceTypeColor } from "./servicetype-badge";
import { Input } from "@/components/ui/input";

interface MedicalHistoryTabProps {
  pat_id: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  medHistoryData: any;
  isMedHistoryLoading: boolean;
  isMedHistoryError: boolean;
  medHistoryError: any;
}

// Medical History Search Component (with inline loader)
const MedicalHistorySearch = ({
  searchValue,
  onSearchChange,
  onClearSearch,
  isLoading,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  isLoading: boolean;
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
      <Input
        placeholder="Search medical history by illness name, code, or description..."
        className="pl-10 pr-10 bg-white w-full"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {isLoading ? (
        <Loader2
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin"
          aria-label="Loading"
        />
      ) : (
        searchValue && (
          <button
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X size={16} />
          </button>
        )
      )}
    </div>
  );
};

export const MedicalHistoryTab: React.FC<MedicalHistoryTabProps> = ({
  // pat_id,
  searchValue,
  onSearchChange,
  onClearSearch,
  medHistoryData,
  isMedHistoryLoading,
  isMedHistoryError,
  medHistoryError,
}) => {
  // Prepare cards data
  const getMedicalHistoryCardsData = useCallback(() => {
    if (isMedHistoryLoading) {
      return [];
    }

    if (isMedHistoryError) {
      console.error("Error fetching medical history:", medHistoryError);
      return [
        {
          id: "error-card",
          illness: "Error loading data",
          ill_date: "Please try again",
          patrec_type: "N/A",
          isError: true,
        },
      ];
    }

    if (!medHistoryData || typeof medHistoryData !== "object") {
      return [];
    }

    const historyList = Array.isArray(medHistoryData.medical_history)
      ? medHistoryData.medical_history
      : [];

    return historyList.map((history: any) => ({
      id: history.medhist_id || Math.random().toString(36).substring(2, 9),
      illness: history.illness_name || history.ill?.illname || "N/A",
      ill_date: history.ill_date ? String(history.ill_date) : "Not specified",
      patrec_type: history?.patrec_type || "N/A",
      isError: false,
    }));
  }, [medHistoryData, isMedHistoryLoading, isMedHistoryError, medHistoryError]);

  const medicalHistoryCards = getMedicalHistoryCardsData();

  return (
    <div className="space-y-4">
      <MedicalHistorySearch
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onClearSearch={onClearSearch}
        isLoading={isMedHistoryLoading}
      />

      <CardLayout
        title={
          <div className="flex items-center gap-2">
            {searchValue && !isMedHistoryLoading && (
              <span className="text-sm text-gray-500 ml-2">
                ({medicalHistoryCards.length} results for "{searchValue}")
              </span>
            )}
          </div>
        }
        cardClassName="shadow-lg rounded-md"
        content={
          <div className="overflow-y-auto max-h-96 w-full space-y-1.5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            {isMedHistoryLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                <span className="text-gray-600">
                  {searchValue ? "Searching medical history..." : "Loading medical history..."}
                </span>
              </div>
            ) : isMedHistoryError ? (
              <div className="flex items-center justify-center py-8 text-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>Failed to load medical history</span>
              </div>
            ) : medicalHistoryCards.length > 0 ? (
              medicalHistoryCards.map((history: any) => {
                const serviceColor = getServiceTypeColor(history.patrec_type);

                return (
                  <div
                    key={history.id}
                    className={`border rounded-md p-3 w-full ${
                      history.isError ? "bg-red-50 border-red-200" : "bg-gray-50/50 border-gray-200"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <h3 className={`font-medium text-sm ${history.isError ? "text-red-600" : "text-gray-800"}`}>
                        {history.illness}
                      </h3>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">
                          recorded from:{" "}
                          <span
                            className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                              history.isError ? "text-red-600 bg-red-100" : serviceColor
                            }`}
                          >
                            {history.patrec_type}
                          </span>
                        </span>
                        {!history.isError && (
                          <span className="flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            <Calendar className="h-3 w-3 mr-1" />
                            {history.ill_date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-6 text-sm">
                {searchValue ? `No medical history found for "${searchValue}"` : "No medical history records found"}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
};