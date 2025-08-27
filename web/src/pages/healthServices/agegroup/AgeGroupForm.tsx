import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Users, X } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  AgeGroupSchema,
  AgeGroupType,
  time_unit_options,
} from "./types";
import { createAgegroup, updateAgegroup, getAgegroup } from "./restful-api/api";

interface AgeGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'add' | 'edit';
  ageGroupData?: any;
}

export function AgeGroupForm({
  isOpen,
  onClose,
  mode = 'add',
  ageGroupData,
}: AgeGroupModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const queryClient = useQueryClient();
  
  const isEditing = mode === 'edit';
  const ageGroupId = ageGroupData?.id;

  const form = useForm<AgeGroupType>({
    resolver: zodResolver(AgeGroupSchema),
    defaultValues: {
      agegroup_name: ageGroupData?.agegroup_name ?? "",
      min_age: ageGroupData?.min_age ?? 0,
      max_age: ageGroupData?.max_age ?? 0,
      time_unit: ageGroupData?.time_unit ?? "",
    },
  });

  // Reset form when modal opens/closes or data changes
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        agegroup_name: ageGroupData?.agegroup_name ?? "",
        min_age: ageGroupData?.min_age ?? 0,
        max_age: ageGroupData?.max_age ?? 0,
        time_unit: ageGroupData?.time_unit ?? "",
      });
    }
  }, [isOpen, ageGroupData, form]);

  const checkForDuplicate = async (data: AgeGroupType) => {
    try {
      const existingAgeGroups = await getAgegroup();
      return existingAgeGroups.some(
        (group: AgeGroupType & { id?: string }) =>
          group.agegroup_name === data.agegroup_name &&
          group.min_age === data.min_age &&
          group.max_age === data.max_age &&
          group.time_unit === data.time_unit 
      );
    } catch (error) {
      console.error("Error checking for duplicates:", error);
      return false;
    }
  };

  const onSubmit = async (data: AgeGroupType) => {
    setIsLoading(true);
    try {
      const isDuplicate = await checkForDuplicate(data);
      if (isDuplicate) {
        toast.error(
          "An age group with the same minimum age, maximum age, and time unit already exists."
        );
        return;
      }

      if (isEditing && ageGroupId) {
        await updateAgegroup(ageGroupId, data);
        toast.success("Age group updated successfully!");
      } else {
        await createAgegroup(data);
        toast.success("Age group added successfully!");
      }

      queryClient.invalidateQueries({ queryKey: ["ageGroups"] });
      onClose();
    } catch (error) {
      const action = isEditing ? "updating" : "adding";
      toast.error(`An error occurred while ${action} the age group. Please try again.`);
      console.error("Submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-600" />
            <Label className="text-xl text-darkBlue2">
              {isEditing ? "Edit Age Group" : "Add New Age Group"}
            </Label>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormInput
                control={form.control}
                name="agegroup_name"
                label="Age Group Name"
                placeholder="e.g., Toddler, Teen, Adult"
              />

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  control={form.control}
                  name="min_age"
                  label="Minimum Age"
                  placeholder="0"
                  type="number"
                />
                <FormInput
                  control={form.control}
                  name="max_age"
                  label="Maximum Age"
                  placeholder="0"
                  type="number"
                />
              </div>

              <FormSelect
                control={form.control}
                name="time_unit"
                label="Time Unit"
                options={time_unit_options}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  aria-label="Cancel form"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  aria-label={isEditing ? "Update age group" : "Add age group"}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      {isEditing ? "Updating..." : "Adding..."}
                    </span>
                  ) : (
                    isEditing ? "Update Age Group" : "Add Age Group"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}