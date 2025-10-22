import { Card } from "@/components/ui/card";
import { ChevronRight, Calendar, User, Banknote, Building } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useNavigate } from "react-router";
import { useGetDisbursementVouchers } from "@/pages/record/treasurer/treasurer-disbursement/queries/incDisb-fetchqueries";
import { DisbursementVoucher } from "@/pages/record/treasurer/treasurer-disbursement/incDisb-types";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { useState } from "react";
import { Label } from "@/components/ui/label";

export const DisbursementSidebar = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear().toString();
  const { data: disbursementsData, isLoading } = useGetDisbursementVouchers(
    1,
    10,
    "",
    currentYear,
    false
  );
  const [_selectedDisbursement, setSelectedDisbursement] =
    useState<DisbursementVoucher | null>(null);

  // Sort disbursements by ID (highest ID first, assuming higher ID = newer)
  const disbursements = disbursementsData?.results
    ? [...disbursementsData.results].sort(
        (a, b) => (b.dis_num || 0) - (a.dis_num || 0)
      )
    : [];

  const truncateText = (text: string, maxLength: number = 40) => {
    if (!text) return "No payee";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Calculate total amount from particulars
  const getTotalAmount = (particulars: any[] = []) => {
    return particulars.reduce((total, particular) => {
      const amount =
        typeof particular.amount === "string"
          ? parseFloat(particular.amount) || 0
          : particular.amount || 0;
      return total + amount;
    }, 0);
  };

  const handleDisbursementClick = (disbursement: DisbursementVoucher) => {
    setSelectedDisbursement(disbursement);
  };

  const handleViewAll = () => {
    navigate("/treasurer-disbursement");
  };

  return (
    <Card className="w-full bg-white h-full flex flex-col border-none">
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="h-4 bg-black/20 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-black/20 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-black/20 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : disbursements && disbursements.length > 0 ? (
          <div className="p-4 space-y-3">
            {disbursements.slice(0, 1).map((disbursement) => {
              const totalAmount = getTotalAmount(disbursement.dis_particulars);

              return (
                <DialogLayout
                  key={disbursement.dis_num}
                  trigger={
                    <Card
                      className="p-4 hover:shadow-sm transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-blue-200"
                      onClick={() => handleDisbursementClick(disbursement)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <Banknote className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-sm font-medium text-gray-700 line-clamp-2">
                                {truncateText(disbursement.dis_payee, 50)}
                              </h3>
                            </div>

                            <div className="space-y-1 text-xs text-gray-500">
                              {/* Date */}
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {disbursement.dis_date
                                    ? new Date(
                                        disbursement.dis_date
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : "Not specified"}
                                </span>
                              </div>

                              {/* Payee */}
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3" />
                                <span className="truncate">
                                  {disbursement.dis_payee}
                                </span>
                              </div>

                              {/* Bank */}
                              {disbursement.dis_bank && (
                                <div className="flex items-center gap-2">
                                  <Building className="w-3 h-3" />
                                  <span className="truncate">
                                    {disbursement.dis_bank}
                                  </span>
                                </div>
                              )}

                              {/* Amount */}
                              {totalAmount > 0 && (
                                <div className="flex items-center gap-2 text-blue-500 font-medium">
                                  <span>₱{totalAmount.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                      </div>
                    </Card>
                  }
                  title="Disbursement Voucher Details"
                  description={""}
                  mainContent={
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Payee
                          </Label>
                          <p className="text-sm text-gray-900 mt-1">
                            {disbursement.dis_payee}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Date
                          </Label>
                          <p className="text-sm text-gray-900 mt-1">
                            {disbursement.dis_date
                              ? new Date(
                                  disbursement.dis_date
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bank */}
                        {disbursement.dis_bank && (
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Bank
                            </Label>
                            <p className="text-sm text-gray-900 mt-1">
                              {disbursement.dis_bank}
                            </p>
                          </div>
                        )}

                        {/* Check Number */}
                        {disbursement.dis_checknum && (
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Check Number
                            </Label>
                            <p className="text-sm text-gray-900 mt-1">
                              {disbursement.dis_checknum}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Particulars */}
                      {disbursement.dis_particulars &&
                        disbursement.dis_particulars.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Particulars
                            </Label>
                            <div className="mt-2 space-y-2">
                              {disbursement.dis_particulars.map(
                                (particular, index) => (
                                  <div
                                    key={index}
                                    className="flex-col items-center justify-between gap-2 text-sm border-b pb-2 last:border-b-0"
                                  >
                                    <span className="text-gray-600 flex-1 pr-4">
                                      {particular.forPayment || "Payment"} -
                                    </span>
                                    <span className="font-medium text-blue-500 whitespace-nowrap">
                                      ₱
                                      {(
                                        particular.amount || 0
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  }
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Banknote className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-sm font-medium text-blue-700 mb-1">
              No disbursement vouchers
            </h3>
            <p className="text-sm text-gray-500">
              Disbursement vouchers will appear here once created
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {disbursements && disbursements.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <Button
            variant={"link"}
            onClick={handleViewAll}
            className="text-blue-500 hover:text-blue-700"
          >
            View All Disbursements
          </Button>
        </div>
      )}
    </Card>
  );
};
