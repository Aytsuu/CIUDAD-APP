// MonthlyFirstAidDetails.tsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { SignatureField, SignatureFieldRef } from "./signature";
import { Combobox } from "@/components/ui/combobox";
import { fetchStaffWithPositions } from "./queries/fetchQueries";
import { Label } from "@/components/ui/label";
import { update_monthly_recipient_list_report } from "./restful-api/updateAPI";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function EditMonthlyRecipientList() {
  const location = useLocation();
  const navigate = useNavigate();
  const signatureRef = useRef<SignatureFieldRef>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [office, setOffice] = useState("");
  const [control_no, setcontrol_no] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: staffOptions, isLoading } = fetchStaffWithPositions();
  const queryClient = useQueryClient();

  // Get passed data with proper typing
  const { reports, monthlyrcplist_id, recordCount, state_office, state_control, year } = location.state || {};
  const passedStaffId = reports?.staff_details?.staff_id || "";

  // Auto-select the passed staff member when data loads
  useEffect(() => {
    if (passedStaffId && staffOptions?.formatted) {
      const staffExists = staffOptions.formatted.some(
        (staff) => staff.id === passedStaffId
      );
      if (staffExists) {
        setSelectedStaffId(passedStaffId);
      }
    }
    if (reports) {
      setOffice(reports.office || "");
      setcontrol_no(reports.control_no || "");
    }
  }, [passedStaffId, staffOptions]);

  const signatureBase64 = reports?.signature || null;

  // Initialize signature when component mounts or signature data changes
  useEffect(() => {
    if (signatureBase64 && signatureRef.current) {
      // Set signature in the component
      signatureRef.current.setSignature(signatureBase64);
      setSignature(signatureBase64);
    }
  }, [signatureBase64]);

  const handleSignatureChange = useCallback((newSignature: string | null) => {
    setSignature(newSignature);
  }, []);

  const handleSubmit = async () => {
    // Get the current signature from the component
    const currentSignature = signatureRef.current?.getSignature();

    if (!currentSignature) {
      toast.error("Please provide your signature!");
      return;
    }

    if (!selectedStaffId && !passedStaffId) {
      toast.error("Please select a staff member!");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submissionPromise = update_monthly_recipient_list_report({
        monthlyrcplist_id,
        staff: selectedStaffId || passedStaffId,
        signature: currentSignature,
        office: office.toUpperCase(),
        control_no: control_no,
      });

      toast.promise(submissionPromise, {
        loading: 'Saving changes...',
        success: () => {
          queryClient.invalidateQueries({
            queryKey: ["firstAidRecords", year],
          });
          return 'Recipient list updated successfully!';
        },
        error: 'Failed to update recipient list',
      });

      await submissionPromise;
      navigate(-1); // Navigate back after successful submission
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="pb-10">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Button
            className="text-black p-2 mb-2 self-start"
            variant={"outline"}
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            <ChevronLeft />
          </Button>
          <div className="flex-col items-center ">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Edit recipients ledger/list
            </h1>
          </div>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />

        <div className="bg-white py-4 px-8">
          <div className="">
            {/* Header Section */}
            <div className="p-6 border-black flex items-center">
              {/* Logo */}
              <div className="left-0 top-0 flex items-center justify-center w-32 h-32 bg-gray-200 rounded-full">
                <input
                  type="file"
                  accept="image/*"
                  className=" opacity-0 w-full h-full cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const imgElement = document.createElement("img");
                        imgElement.src = event.target?.result as string;
                        imgElement.className =
                          "w-full h-full object-cover rounded-full";
                        const container = e.target?.parentElement;
                        if (container) {
                          container.innerHTML = "";
                          container.appendChild(imgElement);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <div className="text-xs text-gray-500">Upload Logo</div>
              </div>

              {/* Header Text */}
              <div className="flex-1 text-center mr-20">
                <h1 className="text-sm font-bold uppercase mb-1">
                  Republic of the Philippines
                </h1>
                <h2 className="text-lg font-bold uppercase mb-2">
                  CEBU CITY HEALTH DEPARTMENT
                </h2>
                <p className="text-xs mb-1">
                  General Maxilom Extension, Carreta, Cebu City
                </p>
                <p className="text-xs">(032) 232-6820; 232-6863</p>
              </div>
            </div>
            {/* Title Section */}
            <div className="text-center py-8">
              <h3 className="text-xl font-bold uppercase tracking-widest underline">
                RECIPIENTS LEDGER / LIST
              </h3>
            </div>
          </div>

          <div className="pb-4 order-b sm:items-center gap-4">
            <div className="flex flex-col space-y-2 mt-6">
              {/* First Row */}
              <div className="flex justify-between items-end">
                <div className="flex items-end gap-2 flex-1 mr-8">
                  <Label className="font-medium whitespace-nowrap">
                    Office:
                  </Label>
                  <div className="border-b border-black bg-transparent min-w-0 flex-1 ">
                    <input
                      className="bg-transparent focus:outline-none"
                      placeholder="Enter office name"
                      value={office}
                      onChange={(e) => setOffice(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex items-end gap-2 flex-1">
                  <Label className="font-medium whitespace-nowrap">
                    Control No:
                  </Label>
                  <div className="min-w-0 flex-1 border-b border-black ">
                    <input
                      className="bg-transparent focus:outline-none"
                      placeholder="Enter Control No"
                      value={control_no}
                      onChange={(e) => setcontrol_no(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Second Row */}
              <div className="flex justify-between items-end">
                <div className="flex items-end gap-2 flex-1 mr-8">
                  <Label className="font-medium whitespace-nowrap">
                    Item Description:
                  </Label>
                  <div className="border-b border-black bg-transparent min-w-0 flex-1 "></div>
                </div>

                <div className="flex items-end gap-2 flex-1">
                  <Label className="font-medium whitespace-nowrap">
                    Total:
                  </Label>
                  <div className="border-b border-black bg-transparent min-w-0 flex-1">
                    {recordCount || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center h-64 border border-gray-300 bg-gray-50">
            <p>This is where the report content would appear.</p>
          </div>

          <div className="py-5">
            <span>
              Hereby certify that the names listed above are recipients of the
              item as indicated below
            </span>
          </div>

          {/* Signature Field */}
          <SignatureField
            ref={signatureRef}
            title="Authorized Signature"
            onSignatureChange={handleSignatureChange}
            initialSignature={signatureBase64}
            required={true}
          />

          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Name</Label>
              <Combobox
                options={staffOptions?.formatted || []}
                value={selectedStaffId}
                onChange={setSelectedStaffId}
                placeholder={
                  isLoading ? "Loading staff..." : "Select staff member"
                }
                emptyMessage="No available staff members"
                triggerClassName="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-8">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="px-6 py-2"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}