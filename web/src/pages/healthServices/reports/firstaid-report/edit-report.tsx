import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Loader2, Edit, X } from "lucide-react";
import { SignatureField, SignatureFieldRef } from "@/pages/healthServices/reports/firstaid-report/signature";
import { Combobox } from "@/components/ui/combobox";
import { fetchStaffWithPositions } from "@/pages/healthServices/reports/firstaid-report/queries/fetch";
import { Label } from "@/components/ui/label";
import { useUpdateMonthlyRecipientList } from "./queries/post";
import { toast } from "sonner";

export default function EditMonthlyRecipientList() {
  const location = useLocation();
  const {
    recordCount,
    reports,
    monthlyrcplist_id,
    
  } = location.state || {};
  const navigate = useNavigate();
  const signatureRef = useRef<SignatureFieldRef>(null);
  
  // Use the mutation hook
  const { mutate: updateRecipientList, isPending: isSubmitting } = useUpdateMonthlyRecipientList();
  
  const [signature, setSignature] = useState<string | null>(null);
  const [office, setOffice] = useState("");
  const [control_no, setcontrol_no] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { data: staffOptions, isLoading } = fetchStaffWithPositions();
  
  // Safe access with optional chaining and fallbacks
  const passedStaffId = reports?.staff_details?.staff_id || "";
  const signatureBase64 = reports?.signature || null;

  useEffect(() => {
    if (passedStaffId && staffOptions?.formatted) {
      const staffExists = staffOptions.formatted.some((staff) => staff.id === passedStaffId);
      if (staffExists) {
        setSelectedStaffId(passedStaffId);
      }
    }
    
    // Safe initialization from reports
    if (reports) {
      setOffice(reports.office || "");
      setcontrol_no(reports.control_no || "");
      // Set initial logo preview if logo exists
      if (reports.logo) {
        setLogoPreview(reports.logo);
      }
    }
  }, [passedStaffId, staffOptions, reports]);

  useEffect(() => {
    if (signatureBase64 && signatureRef.current) {
      signatureRef.current.setSignature(signatureBase64);
      setSignature(signatureBase64);
    }
  }, [signatureBase64]);

  // Add loading state while reports is being accessed
  if (!reports) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading report data...</p>
        </div>
      </div>
    );
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setLogoFile(file);
      
      // Create preview and convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setLogoPreview(base64);
      };
      reader.readAsDataURL(file);
      
      // Reset the input to allow uploading the same file again
      event.target.value = '';
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

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

    // Prepare data as JSON object (not FormData)
    const payload: any = {
      staff: selectedStaffId || passedStaffId,
      signature: currentSignature,
      office: office.toUpperCase(),
      control_no: control_no,
      total_records:recordCount
    };

    // Add logo as base64 if selected
    if (logoFile && logoPreview) {
      payload.logo = {
        file: logoPreview, // This is the base64 data URL
        name: logoFile.name,
        type: logoFile.type
      };
    } else if (logoPreview === null) {
      // If logo is cleared, send empty value
      payload.logo = '';
    }

    // Use the mutation
    updateRecipientList(
      { 
        monthlyrcplist_id, 
        data: payload 
      },
      {
        onSuccess: () => {
          navigate(-1); // Navigate back on success
        }
      }
    );
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
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              {/* Logo Upload Section */}
              <div className="w-24 h-24 bg-gray-200 rounded-full relative flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                {logoPreview ? (
                  <div className="relative w-full h-full group">
                    <img 
                      src={logoPreview} 
                      alt="Logo" 
                      className="w-full h-full object-cover rounded-full"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                        <label htmlFor="logo-upload" className="cursor-pointer">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="text-xs bg-white text-black hover:bg-gray-100"
                            disabled={isSubmitting}
                          >
                            Change
                          </Button>
                        </label>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeLogo}
                          className="text-xs"
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="logo-upload" className="cursor-pointer w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Edit className="h-6 w-6 text-gray-500 mx-auto mb-1" />
                      <span className="text-xs text-gray-500 block">Upload Logo</span>
                      <span className="text-xs text-gray-400 block">Max 5MB</span>
                    </div>
                  </label>
                )}
                
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={isSubmitting}
                />
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
                  <input 
                    className="w-full bg-transparent focus:outline-none py-1" 
                    value={office} 
                    onChange={(e) => setOffice(e.target.value)} 
                    disabled={isSubmitting} 
                  />
                  <Edit className="absolute right-2 bottom-2 h-4 w-4 text-gray-500" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="font-medium">Control No:</Label>
                <div className="border-b border-black relative">
                  <input 
                    className="w-full bg-transparent focus:outline-none py-1" 
                    value={control_no} 
                    onChange={(e) => setcontrol_no(e.target.value)} 
                    disabled={isSubmitting} 
                  />
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
            <SignatureField 
              ref={signatureRef} 
              title="Authorized Signature" 
              onSignatureChange={setSignature} 
              initialSignature={signatureBase64} 
              required={true} 
            />

            {/* Staff Selection */}
            <div className="mt-6">
              <Label className="block mb-2">Name</Label>
              <div className="relative">
                <Combobox 
                  options={staffOptions?.formatted || []} 
                  value={selectedStaffId} 
                  onChange={(value) => setSelectedStaffId(value || "")} 
                  placeholder={isLoading ? "Loading staff..." : "Select staff member"} 
                  emptyMessage="No available staff members" 
                  triggerClassName="w-full"
                />
                <Edit className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-200">
              <Button 
                onClick={() => navigate(-1)} 
                variant="outline" 
                className="px-8" 
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="px-8 bg-blue-600 hover:bg-blue-700" 
                disabled={isSubmitting || isLoading}
              >
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