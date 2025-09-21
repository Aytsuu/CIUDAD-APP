import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useUpdateBusiness, useUpdateBusinessModification } from "../queries/profilingUpdateQueries";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";
import { getDateTimeFormat } from "@/helpers/dateHelper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Info, Loader2, X } from "lucide-react";
import { MediaGallery } from "@/components/ui/media-gallery";

interface FieldComparisonProps {
  label: string;
  current: string | number;
  proposed: string | number;
}

function FieldComparison({ label, current, proposed }: FieldComparisonProps) {
  const hasChanged = current !== proposed;

  if (!hasChanged) return;

  return (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-sm font-medium text-gray-600">{label}</div>
        <div className="bg-red-500 w-1 h-1 rounded-full"/>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Current</div>
          <div className="text-gray-600 line-through">{current}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">New</div>
          <div className="text-green-700 font-medium">{proposed}</div>
        </div>
      </div>
    </div>
  );
}

export default function ModificationRequest({ data } : {
  data: Record<string, any>
}) {
  const { user } = useAuth();
  const { mutateAsync: updateBusiness } = useUpdateBusiness();
  const { mutateAsync: updateBusinessModification } = useUpdateBusinessModification();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    const { current_details, ...updated } = data;
    const current_name = current_details.bus_name;
    const current_gs = current_details.bus_gross_sales;
    const current_sitio = current_details.sitio.toLowerCase();
    const current_street = current_details.bus_street;
    const updated_name = updated.bm_updated_name;
    const updated_gs = updated.bm_updated_gs;
    const updated_sitio = updated.sitio.toLowerCase();
    const updated_street = updated.bus_street;

    try {
      await updateBusiness(
        {
          data: {
            ...(current_name !== updated_name && { bus_name: updated_name }),
            ...(current_gs !== updated_gs && { bus_gross_sales: updated_gs }),
            ...((current_sitio !== updated_sitio ||
              current_street !== updated_street) && { bus_name: updated.add }),
            modification_files: updated.files,
            staff: user?.staff?.staff_id,
          },
          businessId: data?.current_details.bus_id,
        });

      await updateBusinessModification({
        data: {
          bm_status: 'Approved'
        },
        bm_id: data.bm_id
      })

      showSuccessToast("Business record updated successfully!");
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      showErrorToast("Failed to update business");
    }
  };

  const handleReject = () => {
    
  };

  return (
    <div className="w-full max-w-sm">
      <Card className="rounded-md shadow-none border-2 border-green-500">
        <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div>
            <CardTitle className="text-xl">Modification Request #{data?.bm_id}</CardTitle> 
            <p className="text-gray-600 text-sm">{getDateTimeFormat(data.bm_submitted_at)}</p> 
          </div>
        </div>
      </CardHeader>

        <CardContent className="space-y-0">
          <FieldComparison
            label="Business Name"
            current={data?.current_details.bus_name}
            proposed={data?.bm_updated_name}
          />

          <FieldComparison
            label="Gross Sales"
            current={`₱${data?.current_details.bus_gross_sales.toLocaleString()}`}
            proposed={`₱${data?.bm_updated_gs.toLocaleString()}`}
          />

          <FieldComparison
            label="Street Address"
            current={data?.current_details.sitio}
            proposed={data?.sitio}
          />

          <FieldComparison
            label="Street Address"
            current={data?.current_details.bus_street}
            proposed={data?.bus_street}
          />

          <p className="pt-4 pb-2 text-[15px]">Supporting Documents</p>
          <MediaGallery 
            mediaFiles={data?.files}
          />

          <div className="pt-10 space-y-6">
            <div className="flex gap-3 items-center justify-center">
              {isSubmitting ? (<>
                <Loader2 className="animate-spin w-5 h-5 text-gray-600"/>
              </>) : (<>
                <ConfirmationModal
                  trigger={<Button className="flex-1 bg-green-500 hover:bg-green-400">
                    <Check/> Approve
                  </Button>}
                  title="Confirm Approval"
                  description="Review the changes thoroughly before proceeding. Once approved, this action cannot be reversed."
                  onClick={handleApprove}
                  actionLabel="Confirm"
                />

                <Button
                  onClick={handleReject}
                  variant="outline"
                  className="flex-1 bg-transparent border-red-200 text-red-500 hover:text-red-500 hover:bg-red-100"
                >
                  <X/> Reject
                </Button>
              </>)}
            </div>
            <Alert className="space-x-2 border-amber-300 bg-amber-50">
              <Info size={24} className="fill-amber-500 stroke-white"/>
              <AlertDescription className="text-amber-700">
                Please review the updated details carefully and confirm that all information is correct.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
