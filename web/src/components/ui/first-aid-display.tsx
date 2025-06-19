"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Package, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { StockBadge } from "@/components/ui/stock-badge";
import { Button } from "@/components/ui/button/button";

interface FirstAid {
  id: string;
  name: string;
  avail: number;
  unit: string;
  expiry?: string | null;
}

interface FirstAidDisplayProps {
  firstAids: FirstAid[];
  initialSelectedFirstAids: {
    finv_id: string;
    qty: number;
    reason: string;
  }[];
  onSelectedFirstAidChange: (
    selectedFirstAids: { finv_id: string; qty: number; reason: string }[]
  ) => void;
  itemsPerPage?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const FirstAidDisplay = ({
  firstAids,
  initialSelectedFirstAids,
  onSelectedFirstAidChange,
  itemsPerPage = 5,
  currentPage,
  onPageChange,
}: FirstAidDisplayProps) => {
  const [internalSelectedFirstAids, setInternalSelectedFirstAids] = useState(initialSelectedFirstAids);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync internal state with props
  useEffect(() => {
    setInternalSelectedFirstAids(initialSelectedFirstAids);
  }, [initialSelectedFirstAids]);

  // Filter first aids based on search query
  const filteredFirstAids = useMemo(() => {
    if (!searchQuery.trim()) return firstAids;
    const lowerQuery = searchQuery.toLowerCase();
    return firstAids.filter((firstAid) =>
      firstAid.name.toLowerCase().includes(lowerQuery)
    );
  }, [firstAids, searchQuery]);

  // Adjust pagination based on filtered first aids
  const totalPages = Math.ceil(filteredFirstAids.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFirstAids = useMemo(
    () => filteredFirstAids.slice(startIndex, startIndex + itemsPerPage),
    [filteredFirstAids, startIndex, itemsPerPage]
  );

  // Reset to page 1 when search query changes
  useEffect(() => {
    onPageChange(1);
  }, [searchQuery, onPageChange]);

  const updateSelectedFirstAids = useCallback(
    (updater: (prev: typeof internalSelectedFirstAids) => typeof internalSelectedFirstAids) => {
      setInternalSelectedFirstAids((prev) => {
        const updated = updater(prev);
        // Schedule the callback to avoid state updates during render
        setTimeout(() => onSelectedFirstAidChange(updated), 0);
        return updated;
      });
    },
    [onSelectedFirstAidChange]
  );

  const handleFirstAidSelection = useCallback(
    (finv_id: string, isChecked: boolean) => {
      updateSelectedFirstAids((prev) => {
        if (isChecked) {
          const firstAidExists = prev.some((fa) => fa.finv_id === finv_id);
          if (!firstAidExists) {
            return [...prev, { finv_id, qty: 1, reason: "" }];
          }
          return prev;
        }
        return prev.filter((fa) => fa.finv_id !== finv_id);
      });
    },
    [updateSelectedFirstAids]
  );

  const handleQuantityChange = useCallback(
    (finv_id: string, value: number) => {
      const firstAid = firstAids.find((fa) => fa.id === finv_id);
      const maxQty = firstAid?.avail ?? 0;
      updateSelectedFirstAids((prev) =>
        prev.map((fa) =>
          fa.finv_id === finv_id
            ? { ...fa, qty: Math.max(0, Math.min(value, maxQty)) }
            : fa
        )
      );
    },
    [updateSelectedFirstAids, firstAids]
  );

  const handleReasonChange = useCallback(
    (finv_id: string, value: string) => {
      updateSelectedFirstAids((prev) =>
        prev.map((fa) =>
          fa.finv_id === finv_id ? { ...fa, reason: value } : fa
        )
      );
    },
    [updateSelectedFirstAids]
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const formatExpiryDate = (expiryDate?: string | null): string => {
    if (!expiryDate) return "N/A";
    try {
      const date = new Date(expiryDate);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const isNearExpiry = (expiryDate?: string | null): boolean => {
    if (!expiryDate) return false;
    try {
      const today = new Date();
      const expiry = new Date(expiryDate);
      const diffInDays = Math.ceil(
        (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffInDays <= 30 && diffInDays > 0;
    } catch {
      return false;
    }
  };

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
      <div className="text-sm text-gray-500">
        Showing {startIndex + 1}-
        {Math.min(startIndex + itemsPerPage, filteredFirstAids.length)} of{" "}
        {filteredFirstAids.length} first aid items
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="lg:block bg-white rounded-xl shadow-sm border border-gray-200 mx-3">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Available First Aid Items
            </h2>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search first aid items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredFirstAids.length} first aid items found
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Select
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                First Aid Details
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray- CESTER tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentFirstAids.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    No first aid items found
                  </h3>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search query.
                  </p>
                </td>
              </tr>
            ) : (
              currentFirstAids.map((firstAid) => {
                const isSelected = internalSelectedFirstAids.some(
                  (fa) => fa.finv_id === firstAid.id
                );
                const selectedFirstAid = internalSelectedFirstAids.find(
                  (fa) => fa.finv_id === firstAid.id
                );

                return (
                  <tr
                    key={firstAid.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            handleFirstAidSelection(firstAid.id, e.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                          disabled={firstAid.avail === 0}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center gap-3 justify-center">
                        <div>
                          <div className="font-medium text-gray-900">
                            {firstAid.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 text-center">
                      <div>
                        <div className="text-sm text-gray-600">
                          {formatExpiryDate(firstAid.expiry)}
                        </div>
                        {isNearExpiry(firstAid.expiry) && (
                          <div className="text-sm text-red-500 font-semibold">
                            Near Expiry
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <StockBadge
                        quantity={Number(firstAid.avail)}
                        unit={firstAid.unit}
                      />
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {isSelected && (
                        <div className="flex flex-col items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max={firstAid.avail}
                            className="border rounded-lg px-3 py-1 w-20 text-center focus:ring-2"
                            value={selectedFirstAid?.qty ?? 0}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              handleQuantityChange(firstAid.id, value);
                            }}
                          />
                          {(selectedFirstAid?.qty ?? 0) < 1 && (
                            <span className="text-red-500 text-xs">
                              Quantity must be at least 1
                            </span>
                          )}
                          {(selectedFirstAid?.qty ?? 0) > firstAid.avail && (
                            <span className="text-red-500 text-xs">
                              Exceeds available stock
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center w-64">
                      {isSelected && (
                        <Input
                          type="text"
                          className="border border-gray-300 rounded-lg px-3 py-1 w-[300px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter reason for request..."
                          value={selectedFirstAid?.reason || ""}
                          onChange={(e) =>
                            handleReasonChange(firstAid.id, e.target.value)
                          }
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {filteredFirstAids.length > itemsPerPage && <PaginationControls />}
    </div>
  );
};