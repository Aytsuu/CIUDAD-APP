import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalInfoSchema } from "@/form-schema/profiling-schema";
import { positionAssignmentSchema } from "@/form-schema/administration-schema";
import { useForm, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button/button";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { Loader2, UserPlus, Building2, CheckCircle2, XCircle } from "lucide-react";
import { Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import { LoadButton } from "@/components/ui/button/load-button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Import hooks for both databases
import { usePositions } from "./queries/administrationFetchQueries";
import { usePositionsHealth } from "./queries/administrationFetchQueries";
import { formatPositions } from "./AdministrationFormats";
import { useAddStaff } from "./queries/administrationAddQueries";
import { useAddStaffHealth } from "./queries/administrationAddQueries";
import { useAddResidentAndPersonal } from "../profiling/queries/profilingAddQueries";
import { useAddResidentAndPersonalHealth } from "../health-family-profiling/family-profling/queries/profilingAddQueries";

export default function AssignPosition({
  personalInfoform,
  close,
}: {
  personalInfoform: UseFormReturn<z.infer<typeof personalInfoSchema>>;
  close: () => void;
}) {
  // ============= STATE INITIALIZATION ===============
  const { user } = React.useRef(useAuth()).current;
  
  // Use regular database for positions (primary source)
  const {data: positions, isLoading: isLoadingPositions} = usePositions();
  
  // Hooks for both databases
  const {mutateAsync: addResidentAndPersonal} = useAddResidentAndPersonal();
  const {mutateAsync: addResidentAndPersonalHealth} = useAddResidentAndPersonalHealth();
  const {mutateAsync: addStaff} = useAddStaff();
  const {mutateAsync: addStaffHealth} = useAddStaffHealth();
  
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const personalDefaults = generateDefaultValues(personalInfoSchema)
  const defaultValues = generateDefaultValues(positionAssignmentSchema)
  const form = useForm<z.infer<typeof positionAssignmentSchema>>({
    resolver: zodResolver(positionAssignmentSchema),
    defaultValues,
  });

  // Get resident info for preview
  const residentInfo = personalInfoform.getValues();
  const isExistingResident = !!residentInfo.per_id?.split(" ")[0];

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

      // If resident exists, assign position to both databases
      if (residentId) {
        console.log(residentId, positionId);
        
        // Insert to both databases simultaneously
        await Promise.all([
          addStaff({
            residentId: residentId, 
            positionId: positionId,
            staffId: user?.staff?.staff_id || ""
          }),
          addStaffHealth({
            residentId: residentId, 
            positionId: positionId,
            staffId: user?.staff?.staff_id || ""
          })
        ]);

        deliverFeedback();

      } else {
        // Register resident to both databases before assignment
        const personalInfo = personalInfoform.getValues();

        if (!personalInfo) {
          setIsSubmitting(false);
          return;
        }
        
        // Register resident in both databases
        const [resident, residentHealth] = await Promise.all([
          addResidentAndPersonal({
            personalInfo: personalInfo,
            staffId: user?.staff?.staff_id || ""
          }),
          addResidentAndPersonalHealth({
            personalInfo: personalInfo,
            staffId: user?.staff?.staff_id || ""
          })
        ]);

        // Then assign position to both databases
        await Promise.all([
          addStaff({
            residentId: resident.rp_id, 
            positionId: positionId,
            staffId: user?.staff?.staff_id || ""
          }),
          addStaffHealth({
            residentId: residentHealth.rp_id, 
            positionId: positionId,
            staffId: user?.staff?.staff_id || ""
          })
        ]);

        deliverFeedback();
      }
    } catch (error) {
      console.error('Error during submission:', error);
      toast.error('An error occurred while processing the request');
      setIsSubmitting(false);
    }
  };

  const deliverFeedback = () => {
    // Clear forms
    form.setValue("assignPosition", "");
    personalInfoform.reset(personalDefaults);
    close();
    setIsSubmitting(false);
    
    // Show success message
    toast.success(
      isExistingResident 
        ? 'Position assigned successfully to both databases!' 
        : 'Resident registered and position assigned successfully to both databases!'
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
              {isExistingResident ? 'Assign position to existing resident' : 'Register new resident and assign position'}
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
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
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      isExistingResident 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isExistingResident ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Existing Resident
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          New Registration
                        </>
                      )}
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
            options={formatPositions(positions)}
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
                    {isExistingResident ? 'Assign Position' : 'Register & Assign'}
                  </Button>
                ) : (
                  <Button className="w-full h-12" disabled>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isExistingResident ? 'Assigning to both databases...' : 'Registering & assigning to both databases...'}
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
          {isExistingResident 
            ? 'This will assign the selected position to the existing resident in both main and health databases.'
            : 'This will first register the resident in both systems, then assign the selected position to both databases.'
          }
        </p>
      </div>
    </div>
  );
}
