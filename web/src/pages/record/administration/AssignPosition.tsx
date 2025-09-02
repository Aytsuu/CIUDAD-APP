import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalInfoSchema } from "@/form-schema/profiling-schema";
import { positionAssignmentSchema } from "@/form-schema/administration-schema";
import { useForm, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button/button";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { Loader2, UserPlus } from "lucide-react";
import { Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import { useAuth } from "@/context/AuthContext";

// Import hooks for dual database operations (handled by APIs)
import { usePositions } from "./queries/administrationFetchQueries";
import { formatPositions } from "./AdministrationFormats";
import { useAddStaff } from "./queries/administrationAddQueries";
import { useAddAllProfile } from "../profiling/queries/profilingAddQueries";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { capitalizeAllFields } from "@/helpers/capitalize";

export default function AssignPosition({
  personalInfoform,
  addresses,
  close,
}: {
  personalInfoform: UseFormReturn<z.infer<typeof personalInfoSchema>>;
  addresses: any;
  close: () => void;
}) {
  // ============= STATE INITIALIZATION ===============
  const { user } = useAuth();
  
  // Use regular database for positions (primary source)
  const {data: positions, isLoading: isLoadingPositions} = usePositions(
    user?.staff?.staff_type
  );
  
  // Hooks for dual database operations (APIs handle both databases)
  const { mutateAsync: addAllProfile } = useAddAllProfile();
  const {mutateAsync: addStaff} = useAddStaff();
  
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const defaultValues = generateDefaultValues(positionAssignmentSchema)
  const form = useForm<z.infer<typeof positionAssignmentSchema>>({
    resolver: zodResolver(positionAssignmentSchema),
    defaultValues,
  });

  // Get resident info for preview
  const residentInfo = personalInfoform.getValues();

  // ==================== HANDLERS ====================
  const submit = async () => {
    setIsSubmitting(true);

    try {
      const formIsValid = await form.trigger();

      if (!formIsValid) {
        setIsSubmitting(false);
        return;
      }
      
      const residentId = personalInfoform.getValues().per_id?.split(" ")[0];
      const positionId = form.getValues().assignPosition;

      // If resident exists, assign position 
      if (residentId && residentId !== "undefined") {
        console.log(residentId, positionId);
        
        // Assign staff position 
        await addStaff({
          residentId: residentId, 
          positionId: positionId,
          staffId: user?.staff?.staff_id || ""
        });

        deliverFeedback();

      } else {
        // Register resident first, then assign position (APIs handle dual database operations)
        personalInfoform.setValue("per_addresses", addresses)
        const personalInfo = personalInfoform.getValues();
        const {per_id, ...personal} = capitalizeAllFields(personalInfo)

        if (!personal) {
          setIsSubmitting(false);
          return;
        }
        
        // Register resident (API handles both databases)
        const resident = await addAllProfile({
          personal: personal,
          staff: user?.staff?.staff_id
        });

        // Then assign position (API handles both databases)
        await addStaff({
          residentId: resident.rp_id, 
          positionId: positionId,
          staffId: user?.staff?.staff_id || ""
        });

        deliverFeedback();
      }
    } catch (error) {
      console.error('Error during submission:', error);
      showErrorToast('An error occurred while processing the request');
      setIsSubmitting(false);
    }
  };

  const deliverFeedback = () => {
    // Clear forms
    form.setValue("assignPosition", "");
    personalInfoform.reset();
    close();
    setIsSubmitting(false);
    
    // Show success message
    showSuccessToast(
      'Position assigned successfully!'
    );
  };

  if (isLoadingPositions) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-buttonBlue" />
        </div>
        <p className="mt-4 text-sm font-medium text-gray-700">Loading positions...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Position Assignment</h2>
            <p className="text-blue-100 text-sm">
              Assign position to existing resident
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8">
        {/* Resident Info Preview */}
        {(residentInfo.per_fname || residentInfo.per_lname) && (
          <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Resident Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <span className="ml-2 text-gray-900">
                      {`${residentInfo.per_fname || ''} ${residentInfo.per_lname || ''}`.trim() || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800`}>
                      Existing Resident
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Section */}
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              submit();
            }}
            className="space-y-8"
          >

          <FormSelect
            control={form.control}
            name="assignPosition"
            label="Select Position"
            options={formatPositions(positions.filter((pos: any) => !pos.is_maxed))}
            readOnly={false}
          />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={close}
                className="sm:flex-none sm:px-8 h-12"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              
              <div className="flex-1">
                {!isSubmitting ? (
                  <Button 
                    type="submit" 
                    className="w-full h-12"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Position
                  </Button>
                ) : (
                  <Button className="w-full h-12" disabled>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning staff...
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Footer Info */}
      <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          This will assign the selected position to the existing resident.
        </p>
      </div>
    </div>
  );
}
