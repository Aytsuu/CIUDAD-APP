import { Form } from "@/components/ui/form/form";
import React from "react";
import { useForm } from "react-hook-form";
import { positionFormSchema, useValidatePosition } from "@/form-schema/administration-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/ui/form/form-input";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card/card";
import { Users, Badge, Info } from "lucide-react";
import { useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useAddPosition } from "./queries/administrationAddQueries";
import { useUpdatePosition } from "./queries/administrationUpdateQueries";
import { renderActionButton } from "./AdministrationActionConfig";
import { Type } from "./AdministrationEnums";
import { usePositionGroups } from "./queries/administrationFetchQueries";
import { FormSelect } from "@/components/ui/form/form-select";
import { formatPositionGroups } from "./AdministrationFormats";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { Combobox } from "@/components/ui/combobox";

export default function NewPositionForm() {
  const { user } = useAuth(); 
  const { mutateAsync: addPosition, isPending: isAdding } = useAddPosition();
  const { mutateAsync: editPosition, isPending: isUpdating } = useUpdatePosition();
  const { data: positionGroups } = usePositionGroups();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params || {}, [location.state]);
  const formType = React.useMemo(() => params?.type || '', [params]);
  const formattedPositionGroups = React.useMemo(() => formatPositionGroups(positionGroups) || [], [positionGroups])
  const { isPositionUnique } = useValidatePosition();
  
  const form = useForm({
    resolver: zodResolver(positionFormSchema(isPositionUnique, params?.data?.pos_title)),
    defaultValues: {
      pos_group: '',
      pos_title: '',
      pos_max: '1'
    }
  });

  React.useEffect(() => {
    if (isAdding || isUpdating) setIsSubmitting(true);
    else setIsSubmitting(false);
  }, [isAdding, isUpdating]);

  // Prevent typing negative values and 0
  React.useEffect(() => {
    const max_holders = form.watch('pos_max');
    const maxHoldersNumber = Number(max_holders);
    if (max_holders === '0' || maxHoldersNumber < 0) {
      form.setValue('pos_max', '1');
      console.log('max_holders:',max_holders)
    }
  }, [form.watch('pos_max')]);

  // Execute population of fields if type edit
  React.useEffect(() => {
    if (formType === Type.Edit) populateFields();
  }, [formType]);

  const populateFields = React.useCallback(() => {
    const position = params.data;
    form.setValue("pos_group", position.pos_group || '');
    form.setValue("pos_title", position.pos_title);
    form.setValue("pos_max", String(position.pos_max));
  }, [params.data]);

  const create = async (values: Record<string, any>, staffId: string) => {
    try {
      // Add position (API handles dual database insertion)
      await addPosition({ data: values, staffId });
      // Reset form on success
      form.setValue('pos_title', '');
      form.setValue('pos_max', '1');
      form.setValue('pos_group', '');
      
      showSuccessToast("Position created successfully");
    } catch (err) {
      showErrorToast('Failed to create position. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const update = async (values: Record<string, any>, positionId: string) => {
    try {
      await editPosition({ positionId, values });
      showSuccessToast("Position has been updated successfully.")
    } catch (err) {
      showErrorToast("Failed to update position. Please try again.")
    } finally {
      setIsSubmitting(false);
    }
  }

  // Add new position (dual database insertion handled by API)
  const submit = async () => {
    const formIsValid = await form.trigger();
    if (!formIsValid) {
      (!form.watch('pos_title') || !form.watch('pos_max') || !form.watch('pos_group')) &&
        showErrorToast("Please fill out all required fields.")
      return;
    }

    const values = form.getValues();
    const staffId = user?.staff?.staff_id || "";
    const staffType = user?.staff?.staff_type;

    setIsSubmitting(true);
    switch(formType){
      case Type.Add:
        create({
          ...values, 
          pos_category: staffType == "Barangay Staff" ? "Barangay Position" : "Health Position" 
        }, staffId);
        break;
      case Type.Edit:
        const positionId = params.data.pos_id;
        update(values, positionId);
        break;
    }
  };

  return (
    <main className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        <LayoutWithBack
          title={params.title}
          description={params.description}
        >
          <div className="mt-8">
            <Card className="p-8 bg-white">
              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                  }}
                  className="space-y-8"
                >
                  {/* Form Fields */}
                  <div className="space-y-6">
                    {/* Group Selection */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                          Group Assignment
                        </span>
                      </div>

                      <Combobox 
                        options={formattedPositionGroups}
                        value={form.watch("pos_group")}
                        onChange={(value) => form.setValue("pos_group", value as string)}
                        placeholder="Select a Position Group (optional)"
                        triggerClassName="w-full"
                      />

                      <p className="text-xs text-gray-500 ml-1">
                        Choose which organizational group this position belongs to
                        (default non-grouped)
                      </p>
                    </div>

                    {/* Position Details */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                          Position Details
                        </span>
                      </div>
                      
                      <FormInput 
                        control={form.control} 
                        name="pos_title" 
                        label="Position Title" 
                        placeholder="e.g., Secretary, BPSO"
                        className="text-base"
                        readOnly={params?.data?.pos_is_predefined}
                      />
                      
                      <FormInput 
                        control={form.control} 
                        name="pos_max" 
                        label="Maximum Holders" 
                        placeholder="Enter maximum number of people for this position" 
                        type="number"
                        className="text-base"
                      />
                      <p className="text-xs text-gray-500 ml-1">
                        How many people can hold this position simultaneously?
                      </p>
                    </div>
                  </div>

                  {/* Help Text */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <h4 className="font-medium mb-2">Tips for creating positions:</h4>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Use clear, descriptive titles that reflect the role's responsibilities</li>
                          <li>Consider future organizational needs when setting maximum holders</li>
                          <li>Ensure the position aligns with the selected group structure</li>
                          <li>Data will be synchronized across both main and health databases</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex justify-end">
                      {renderActionButton({
                        formType,
                        isSubmitting,
                        submit
                      })}
                    </div>
                  </div>
                </form>
              </Form>
            </Card>

            {/* Status indicator for dual database operations */}
            {isSubmitting && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Synchronizing data across databases...</span>
                </div>
              </div>
            )}
          </div>
        </LayoutWithBack>
      </div>
    </main>
  );
}