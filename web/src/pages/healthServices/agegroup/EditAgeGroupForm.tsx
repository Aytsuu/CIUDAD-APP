import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import { toast } from "sonner";
import {
  AgeGroupSchema,
  AgeGroupType,
  time_unit_options,
} from "./types";
import { createAgegroup, updateAgegroup, getAgegroup } from "./restful-api/agepostAPI";
import { useQueryClient } from "@tanstack/react-query";

interface AgeGroupFormProps {
  ageGroup?: AgeGroupType & { id?: string };
  onSubmitSuccess: (ageGroup: AgeGroupType & { id: string }) => void;
  onCancel: () => void;
}

export function EditAgeGroupForm({ ageGroup, onSubmitSuccess, onCancel }: AgeGroupFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const queryClient = useQueryClient();
  const queryKey = ["ageGroups"]; // Define the query key

  const form = useForm<AgeGroupType>({
    resolver: zodResolver(AgeGroupSchema),
    defaultValues: {
      agegroup_name: ageGroup?.agegroup_name ?? "",
      min_age: ageGroup?.min_age ?? 0,
      max_age: ageGroup?.max_age ?? 0,
      time_unit: ageGroup?.time_unit ?? "",
    },
  });

  const checkForDuplicate = async (data: AgeGroupType) => {
    const existingAgeGroups = await queryClient.fetchQuery({
      queryKey,
      queryFn: getAgegroup,
    });

    return existingAgeGroups.some(
      (group: AgeGroupType & { id?: string }) =>
        group.min_age === data.min_age &&
        group.max_age === data.max_age &&
        group.time_unit === data.time_unit &&
        group.id !== ageGroup?.id // Exclude current age group from duplicate check
    );
  };

  const onSubmit = async (data: AgeGroupType) => {
    setIsLoading(true);
    try {
      // Check for duplicates
      const isDuplicate = await checkForDuplicate(data);
      if (isDuplicate) {
        toast.error(
          "An age group with the same minimum age, maximum age, and time unit already exists."
        );
        setIsLoading(false);
        return;
      }

      if (ageGroup?.id) {
        const result = await updateAgegroup(ageGroup.id, data);
        toast.success("Age group updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["ageGroups"] }); // Invalidate the cache
        onSubmitSuccess({ ...data, id: result.id });
      }
    } catch (error) {
      toast.error("An error occurred while updating the age group. Please try again.");
      console.error("Submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-center mb-6">
            <Users className="h-6 w-6 mr-2 text-blue-600" />
            <Label className="text-xl text-darkBlue2">Edit Age Group</Label>
          </div>

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
              onClick={onCancel}
              disabled={isLoading}
              aria-label="Cancel form"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue text-white"
              aria-label="Update age group"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating...
                </span>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}