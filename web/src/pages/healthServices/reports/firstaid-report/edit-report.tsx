// MonthlyFirstAidDetails.tsx
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Loader2, Edit } from "lucide-react";
import { SignatureField, SignatureFieldRef } from "@/pages/healthServices/Reports/firstaid-report/signature";
import { Combobox } from "@/components/ui/combobox";
import { fetchStaffWithPositions } from "@/pages/healthServices/Reports/firstaid-report/queries/fetchQueries";
import { Label } from "@/components/ui/label";
import { update_monthly_recipient_list_report } from "@/pages/healthServices/Reports/firstaid-report/restful-api/updateAPI";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function EditMonthlyRecipientList() {
  const location = useLocation();
  const {
    reports,
    monthlyrcplist_id,

    year
  } = location.state || {};
  const navigate = useNavigate();
  const signatureRef = useRef<SignatureFieldRef>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [office, setOffice] = useState("");
  const [control_no, setcontrol_no] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: staffOptions, isLoading } = fetchStaffWithPositions();
  const queryClient = useQueryClient();
  const passedStaffId = reports?.staff_details?.staff_id || "";
  const signatureBase64 = reports?.signature || null;

  useEffect(() => {
    if (passedStaffId && staffOptions?.formatted) {
      const staffExists = staffOptions.formatted.some((staff) => staff.id === passedStaffId);
      if (staffExists) {
        setSelectedStaffId(passedStaffId);
      }
    }
    if (reports) {
      setOffice(reports.office || "");
      setcontrol_no(reports.control_no || "");
    }
  }, [passedStaffId, staffOptions]);

  useEffect(() => {
    if (signatureBase64 && signatureRef.current) {
      signatureRef.current.setSignature(signatureBase64);
      setSignature(signatureBase64);
    }
  }, [signatureBase64]);

  const handleSubmit = async () => {
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
        control_no: control_no
      });

      toast.promise(submissionPromise, {
        loading: "Saving changes...",
        success: () => {
          queryClient.invalidateQueries({
            queryKey: ["firstAidRecords", year]
          });
          return "Recipient list updated successfully!";
        },
        error: "Failed to update recipient list"
      });
      await submissionPromise;
      navigate(-1);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Button className="text-black p-2 mb-2 self-start" variant={"outline"} onClick={() => navigate(-1)} disabled={isSubmitting}>
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Edit recipients ledger/list</h1>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <div className="flex justify-center">
        <div className="w-[816px] min-h-[1320px] bg-white shadow-lg p-8">
          {" "}
          {/* Long bond paper size */}
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="w-24 h-24 bg-gray-200 rounded-full relative flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const imgElement = document.createElement("img");
                        imgElement.src = event.target?.result as string;
                        imgElement.className = "w-full h-full object-cover rounded-full";
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
                <span className="text-xs text-gray-500">Upload Logo</span>
              </div>

              {/* Header Text */}
              <div className="flex-1 text-center px-4">
                <h1 className="text-sm font-bold uppercase mb-1">Republic of the Philippines</h1>
                <h2 className="text-lg font-bold uppercase mb-1">CEBU CITY HEALTH DEPARTMENT</h2>
                <p className="text-xs mb-1">General Maxilom Extension, Carreta, Cebu City</p>
                <p className="text-xs">(032) 232-6820; 232-6863</p>
              </div>

              {/* Empty space for balance */}
              <div className="w-24"></div>
            </div>

            {/* Title Section */}
            <div className="text-center py-4 border-b border-t border-gray-300 my-4">
              <h3 className="text-xl font-bold uppercase tracking-widest">RECIPIENTS LEDGER / LIST</h3>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <Label className="font-medium">Office:</Label>
                <div className="border-b border-black relative">
                  <input className="w-full bg-transparent focus:outline-none py-1" value={office} onChange={(e) => setOffice(e.target.value)} disabled={isSubmitting} />
                  <Edit className="absolute right-2 bottom-2 h-4 w-4 text-gray-500" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="font-medium">Control No:</Label>
                <div className="border-b border-black relative">
                  <input className="w-full bg-transparent focus:outline-none py-1" value={control_no} onChange={(e) => setcontrol_no(e.target.value)} disabled={isSubmitting} />
                  <Edit className="absolute right-2 bottom-2 h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Report Content Area */}
            <div className="border border-gray-300 bg-gray-50 h-96 p-4">
              <p className="text-center text-gray-500">Report content will appear here</p>
            </div>

            {/* Certification Text */}
            <div className="py-4 text-sm italic">Hereby certify that the names listed above are recipients of the item as indicated below</div>

            {/* Signature Field */}
            <SignatureField ref={signatureRef} title="Authorized Signature" onSignatureChange={signature} initialSignature={signatureBase64} required={true} />

            {/* Staff Selection */}
            <div className="mt-6">
              <Label className="block mb-2">Name</Label>
              <div className="relative">
                <Combobox options={staffOptions?.formatted || []} value={selectedStaffId} onChange={(value) => setSelectedStaffId(value || "")} placeholder={isLoading ? "Loading staff..." : "Select staff member"} emptyMessage="No available staff members" triggerClassName="w-full" />
                <Edit className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-200">
              <Button onClick={() => navigate(-1)} variant="outline" className="px-8" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="px-8 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting || isLoading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
