"use client";


interface Medicine {
    id: string;
    name: string;
    dosage?: string;
    form?: string;
}

interface RequestSummaryProps {
    selectedMedicines: {
        minv_id: string;
        medrec_qty: number;
        reason: string;
    }[];
    medicineStocksOptions: Medicine[];
    totalSelectedQuantity: number;
}

export const RequestSummary = ({
    selectedMedicines,
    medicineStocksOptions,
    totalSelectedQuantity,
}: RequestSummaryProps) => {
    return (
        <div className="p-10  rounded-sm border border-gray-300 mx-4 mt-4">
            <h3 className="font-bold text-xl text-center mb-4"> Summary</h3>
            <div className="space-y-4">
                {selectedMedicines.map((medicine) => {
                    const medInfo = medicineStocksOptions.find(
                        (m) => m.id === medicine.minv_id
                    );
                    return (
                        <div
                            key={medicine.minv_id}
                            className="flex justify-between items-center border-b border-gray-200 pb-2"
                        >
                            <div>
                                <p className="font-medium">{medInfo?.name}</p>
                                <p className="text-sm text-gray-600">
                                    {medInfo?.dosage} • {medInfo?.form}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">Qty: {medicine.medrec_qty}</p>
                                {medicine.reason && (
                                    <p className="text-sm text-gray-600">
                                        Reason: {medicine.reason}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-300">
                <div className="flex justify-between items-center">
                    <p className="font-medium text-lg">Total Items:</p>
                    <p className="font-bold text-lg">{totalSelectedQuantity}</p>
                </div>
            </div>
        </div>
    );
};