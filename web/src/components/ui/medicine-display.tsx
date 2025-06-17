import { useState, useMemo, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";
import { StockBadge } from "@/components/ui/medicine-stock-badge";
import { Button } from "@/components/ui/button/button";

interface Medicine {
    id: string;
    name: string;
    dosage: string;
    form: string;
    avail: number;
    unit: string;
    expiry?: string | null;
}

interface MedicineDisplayProps {
    medicines: Medicine[];
    initialSelectedMedicines: {
        minv_id: string;
        medrec_qty: number;
        reason: string;
    }[];
    onSelectedMedicinesChange: (
        selectedMedicines: { minv_id: string; medrec_qty: number; reason: string }[]
    ) => void;
    itemsPerPage?: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export const MedicineDisplay = ({
    medicines,
    initialSelectedMedicines,
    onSelectedMedicinesChange,
    itemsPerPage = 5,
    currentPage,
    onPageChange,
}: MedicineDisplayProps) => {
    const [internalSelectedMedicines, setInternalSelectedMedicines] = useState(initialSelectedMedicines);

    // Sync internal state with props
    useEffect(() => {
        setInternalSelectedMedicines(initialSelectedMedicines);
    }, [initialSelectedMedicines]);

    const totalPages = Math.ceil(medicines.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentMedicines = useMemo(
        () => medicines.slice(startIndex, startIndex + itemsPerPage),
        [medicines, startIndex, itemsPerPage]
    );

    const updateSelectedMedicines = useCallback((updater: (prev: typeof internalSelectedMedicines) => typeof internalSelectedMedicines) => {
        setInternalSelectedMedicines(prev => {
            const updated = updater(prev);
            // Schedule the callback to avoid state updates during render
            setTimeout(() => onSelectedMedicinesChange(updated), 0);
            return updated;
        });
    }, [onSelectedMedicinesChange]);

    const handleMedicineSelection = useCallback(
        (minv_id: string, isChecked: boolean) => {
            updateSelectedMedicines((prev) => {
                if (isChecked) {
                    const medicineExists = prev.some((med) => med.minv_id === minv_id);
                    if (!medicineExists) {
                        return [...prev, { minv_id, medrec_qty: 1, reason: "" }];
                    }
                    return prev;
                }
                return prev.filter((med) => med.minv_id !== minv_id);
            });
        },
        [updateSelectedMedicines]
    );

    const handleQuantityChange = useCallback(
        (minv_id: string, value: number) => {
            updateSelectedMedicines((prev) =>
                prev.map((med) =>
                    med.minv_id === minv_id
                        ? { ...med, medrec_qty: Math.max(0, value) }
                        : med
                )
            );
        },
        [updateSelectedMedicines]
    );

    const handleReasonChange = useCallback(
        (minv_id: string, value: string) => {
            updateSelectedMedicines((prev) =>
                prev.map((med) =>
                    med.minv_id === minv_id ? { ...med, reason: value } : med
                )
            );
        },
        [updateSelectedMedicines]
    );

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const isNearExpiry = (expiryDate?: string | null): boolean => {
        if (!expiryDate) return false;
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffInDays = Math.ceil(
            (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        return diffInDays <= 30 && diffInDays > 0;
    };

    const PaginationControls = () => (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, medicines.length)} of {medicines.length} medicines
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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">
                            Available Medicines
                        </h2>
                    </div>
                    <div className="text-sm text-gray-500">
                        {medicines.length} medicines available
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
                                Medicine Details
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Expiry
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock Status
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantity
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reason
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentMedicines.map((medicine) => {
                            const isSelected = internalSelectedMedicines.some(
                                (m) => m.minv_id === medicine.id
                            );
                            const selectedMedicine = internalSelectedMedicines.find(
                                (m) => m.minv_id === medicine.id
                            );

                            return (
                                <tr
                                    key={medicine.id}
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
                                                    handleMedicineSelection(medicine.id, e.target.checked)
                                                }
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center gap-3 justify-center">
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
                                    <td className="px-2 py-4 text-center">
                                        <div>
                                            <div className="text-sm text-gray-600">
                                                Expiry Date: {medicine.expiry}
                                            </div>
                                            {isNearExpiry(medicine.expiry) && (
                                                <div className="text-sm text-red-500 font-semibold">
                                                    Near Expiry
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <StockBadge
                                            quantity={Number(medicine.avail)}
                                            unit={medicine.unit}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        {isSelected && (
                                            <div className="flex flex-col items-center gap-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max={medicine.avail}
                                                    className="border rounded-lg px-3 py-1 w-20 text-center focus:ring-2"
                                                    value={selectedMedicine?.medrec_qty || 0}
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value) || 0;
                                                        handleQuantityChange(medicine.id, value);
                                                    }}
                                                />
                                                {(selectedMedicine?.medrec_qty ?? 0) < 1 && (
                                                    <span className="text-red-500 text-xs">
                                                        Quantity must be more than zero
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
            {medicines.length > itemsPerPage && <PaginationControls />}
        </div>
    );
};