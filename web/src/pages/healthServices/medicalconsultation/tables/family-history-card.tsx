// components/FamilyHistoryTab.tsx
import React, { useCallback } from "react";
import { Loader2, Users, Calendar, Search, X } from "lucide-react";
import CardLayout from "@/components/ui/card/card-layout";
import { Input } from "@/components/ui/input";

interface FamilyHistoryTabProps {
  pat_id: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  famHistoryData: any;
  isFamHistoryLoading: boolean;
  isFamHistoryError: boolean;
}

// Family History Search Component (integrated)
const FamilyHistorySearch = ({ 
  searchValue, 
  onSearchChange, 
  onClearSearch 
}: { 
  searchValue: string; 
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
      <Input 
        placeholder="Search family history by illness name, code, or description..." 
        className="pl-10 pr-10 bg-white w-full" 
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {searchValue && (
        <button 
          onClick={onClearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          type="button"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export const FamilyHistoryTab: React.FC<FamilyHistoryTabProps> = ({
  pat_id,
  searchValue,
  onSearchChange,
  onClearSearch,
  famHistoryData,
  isFamHistoryLoading,
  isFamHistoryError
}) => {
  // Memoize family history data processing
  const getFamilyHistoryCardsData = useCallback(() => {
    if (isFamHistoryLoading) {
      return [];
    }

    if (isFamHistoryError) {
      return [
        {
          id: "error-card",
          illness: "Error loading family history",
          relationship: "Please try again",
          isError: true
        }
      ];
    }

    if (!famHistoryData || !famHistoryData.ph_illnesses?.data) {
      return [];
    }

    const familyIllnesses = famHistoryData.ph_illnesses.data.filter((illness: any) => illness.has_family_history);

    // Apply client-side search filtering if needed (backend should handle it, but this is fallback)
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      return familyIllnesses.filter((illness: any) => 
        illness.illname?.toLowerCase().includes(searchLower) ||
        illness.ill_code?.toLowerCase().includes(searchLower) ||
        illness.ill_description?.toLowerCase().includes(searchLower)
      );
    }

    return familyIllnesses;
  }, [famHistoryData, isFamHistoryLoading, isFamHistoryError, searchValue]);

  const familyHistoryCards = getFamilyHistoryCardsData();

  return (
    <div className="space-y-4">
      <FamilyHistorySearch 
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onClearSearch={onClearSearch}
      />

      <CardLayout
        title={
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-500" />
            <span className="text-lg font-semibold text-green-600">Family History</span>
            {searchValue && (
              <span className="text-sm text-gray-500 ml-2">
                ({familyHistoryCards.length} results for "{searchValue}")
              </span>
            )}
          </div>
        }
        cardClassName="shadow-lg rounded-md"
        content={
          <div className="overflow-y-auto max-h-96 w-full space-y-1.5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            {isFamHistoryLoading && searchValue ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-500 mr-2" />
                <span className="text-gray-600">Searching family history...</span>
              </div>
            ) : familyHistoryCards.length > 0 ? (
              familyHistoryCards.map((illness: any) => {
                return (
                  <div key={illness.ill_id} className="border rounded-md p-3 w-full bg-gray-50/50 border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1.5 flex-1">
                        <h3 className="fon
                        t-medium text-sm text-gray-800">{illness.illname}</h3>
                        {illness.ill_description && (
                          <p className="text-xs text-gray-600">{illness.ill_description}</p>
                        )}
                        {illness.ill_code && (
                          <p className="text-xs text-gray-500">Code: {illness.ill_code}</p>
                        )}
                      </div>
                      {illness.year && (
                        <span className="flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 ml-2">
                          <Calendar className="h-3 w-3 mr-1" />
                          {illness.year}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-6 text-sm">
                {searchValue ? `No family history found for "${searchValue}"` : "No family history records found"}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
};