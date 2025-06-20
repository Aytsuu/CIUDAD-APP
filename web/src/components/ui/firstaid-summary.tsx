"use client";

import { CheckCircle2 } from "lucide-react";

interface FirstAid {
  id: string;
  name: string;
  dosage?: string;
  form?: string;
}

interface RequestSummaryProps {
  selectedFirstAids: {
    finv_id: string;
    qty: number;
    reason: string;
  }[];
  firstAidStocksOptions: FirstAid[]; // Renamed for consistency
  totalSelectedQuantity: number;
}

export const RequestSummary = ({
  selectedFirstAids,
  firstAidStocksOptions,
  totalSelectedQuantity,
}: RequestSummaryProps) => {
  return (
    <div className="p-10 rounded-sm border border-gray-300 mx-4 mt-4">
      <h3 className="font-bold text-xl text-center mb-4">Summary</h3>
      <div className="space-y-4">
        {selectedFirstAids.map((firstAid) => {
          const faInfo = firstAidStocksOptions.find(
            (m) => m.id === firstAid.finv_id
          );
          return (
            <div
              key={firstAid.finv_id}
              className="flex justify-between items-center border-b border-gray-200 pb-2"
            >
              <div>
                <p className="font-medium">{faInfo?.name ?? "Unknown Item"}</p>
                <p className="text-sm text-gray-600">
                  {faInfo?.dosage ?? "N/A"} • {faInfo?.form ?? "N/A"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">Qty: {firstAid.qty}</p>
                {firstAid.reason && (
                  <p className="text-sm text-gray-600">
                    Reason: {firstAid.reason}
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