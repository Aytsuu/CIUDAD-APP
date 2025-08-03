import { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowUpDown,
  CircleCheck,
  Ellipsis,
  Info,
  Loader2,
  Pen,
  Trash,
  User,
  UserRoundCheck,
} from "lucide-react";
import { AdministrationRecord } from "./administrationTypes";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Button } from "@/components/ui/button/button";
import { Action } from "./administrationEnums";
import { useUpdateStaff } from "./queries/administrationUpdateQueries";
import { useDeleteStaff } from "./queries/administrationDeleteQueries";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import React from "react";
import { FormSelect } from "@/components/ui/form/form-select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { positionAssignmentSchema } from "@/form-schema/administration-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { Form } from "@/components/ui/form/form";
import { LoadButton } from "@/components/ui/button/load-button";
import { usePositions } from "./queries/administrationFetchQueries";
import { formatPositions } from "./AdministrationFormats";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useLoading } from "@/context/LoadingContext";
import { getPersonalInfo } from "../profiling/restful-api/profilingGetAPI";

export const administrationColumns: ColumnDef<AdministrationRecord>[] = [
  {
    accessorKey: "icon",
    header: "",
    cell: () => (
      <UserRoundCheck size={20} className="text-green-600 w-full text-center" />
    ),
  },
  {
    accessorKey: "staff_id",
    header: ({ column }) => (
      <div
        className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Staff ID
        <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
      </div>
    ),
  },
  {
    accessorKey: "lname",
    header: ({ column }) => (
      <div
        className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Name
        <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
      </div>
    ),
  },
  {
    accessorKey: "fname",
    header: ({ column }) => (
      <div
        className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        First Name
        <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
      </div>
    ),
  },
  {
    accessorKey: "mname",
    header: ({ column }) => (
      <div
        className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Middle Name
        <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="hidden lg:block max-w-xs truncate">
        {row.getValue("mname") ? row.getValue("mname") : "-"}
      </div>
    ),
  },
  {
    accessorKey: "contact",
    header: "Contact",
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "staff_assign_date",
    header: "Date Assigned",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const navigate = useNavigate();
      const { showLoading, hideLoading } = useLoading();
      const [isEditModalOpen, setIsEditModalOpen] =
        React.useState<boolean>(false);
      const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
      
      // Main database hooks (APIs handle dual database operations)
      const { mutateAsync: updateStaff, isPending: isUpdatingMain } = useUpdateStaff();
      const { mutateAsync: deleteStaff, isPending: isDeletingMain } = useDeleteStaff();
      
      const { data: positions, isLoading: isLoadingPositions } = usePositions();

      // Combined loading states
      const isUpdatingAny = isUpdatingMain;
      const isDeletingAny = isDeletingMain;

      const defaultValues = generateDefaultValues(positionAssignmentSchema);
      const form = useForm<z.infer<typeof positionAssignmentSchema>>({
        resolver: zodResolver(positionAssignmentSchema),
        defaultValues,
      });

      // Initialize form with current staff position
      React.useEffect(() => {
        if (positions && isEditModalOpen) {
          const currentPosition = positions?.find(
            (pos: any) => pos.pos_title === row.original.position
          );
          if (currentPosition) {
            form.setValue("assignPosition", String(currentPosition.pos_id));
          }
        }
      }, [positions, isEditModalOpen, row.original.position, form]);

      const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setIsSubmitting(false);
        // Reset form to original values
        const currentPosition = positions?.find(
          (pos: any) => pos.pos_title === row.original.position
        );
        if (currentPosition) {
          form.setValue("assignPosition", String(currentPosition.pos_id));
        }
        form.clearErrors();
      };

      const handleAction = (action: string) => {
        if (action === Action.Edit) {
          handleEdit();
        } else if (action === Action.Delete) {
          handleDelete();
        } else {
          handleView();
        }
      };

      const handleView = async () => {
        showLoading();
        try {
          const personalInfo = await getPersonalInfo(row.original.staff_id);
          navigate("/resident/view", {
            state: {
              params: {
                type: 'viewing',
                data: {
                  personalInfo: personalInfo,
                  residentId: row.original.staff_id,
                  familyId: row.original.fam
                },
              }
            },
          });
        } finally {
          hideLoading();
        }
      }

      const handleEdit = () => {
        setIsEditModalOpen(true);
        // Reset form state when opening
        setIsSubmitting(false);
        form.clearErrors();
      };

      const handleSaveEdit = async () => {
        setIsSubmitting(true);

        try {
          const formIsValid = await form.trigger();
          if (!formIsValid) {
            setIsSubmitting(false);
            return;
          }

          const values = form.getValues();
          const selectedPosition = positions?.find(
            (pos: any) => pos.pos_id === parseInt(values.assignPosition)
          );

          // Check if position actually changed
          if (selectedPosition?.pos_title === row.original.position) {
            toast("No changes were made to the staff position", {
              icon: <Info size={24} className="fill-blue-500 stroke-white" />,
            });
            setIsSubmitting(false);
            setIsEditModalOpen(false);
            return;
          }

          const updateData = {
            pos: values.assignPosition,
          };

          // Update staff position (API handles dual database update)
          await updateStaff({
            data: updateData,
            staffId: row.original.staff_id,
          });

          toast(`Staff position updated to ${selectedPosition?.pos_title}`, {
            icon: (
              <CircleCheck size={24} className="fill-green-500 stroke-white" />
            ),
          });

          setIsEditModalOpen(false);
          setIsSubmitting(false);
        } catch (error) {
          console.error("Failed to update staff:", error);
          toast("Failed to update staff position. Please try again.", {
            icon: (
              <AlertCircle size={24} className="fill-red-500 stroke-white" />
            ),
          });
          setIsEditModalOpen(false);
          setIsSubmitting(false);
        }
      };

      const handleDelete = async () => {
        try {
          // Delete staff (API handles dual database deletion)
          await deleteStaff(row.original.staff_id);

          toast("Staff has been removed successfully", {
            icon: (
              <CircleCheck
                size={24}
                className="fill-green-500 stroke-white"
              />
            ),
          });
        } catch (error) {
          console.error("Failed to delete staff:", error);
          toast("Failed to remove staff. Please try again.", {
            icon: (
              <AlertCircle size={24} className="fill-red-500 stroke-white" />
            ),
          });
        }
      };

      const getCurrentPositionName = () => {
        return row.original.position || "No position assigned";
      };

      const getSelectedPositionName = () => {
        const selectedPosId = form.watch("assignPosition");
        const selectedPosition = positions?.find(
          (pos: any) => pos.pos_id === parseInt(selectedPosId)
        );
        return selectedPosition?.pos_title || "";
      };

      return (
        <div className="py-2">
          <DropdownLayout
            trigger={
              <Button variant={"outline"} className="border">
                {isDeletingAny ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Ellipsis />
                )}
              </Button>
            }
            options={[
              {
                id: "view",
                name: "View Profile",
                icon: <User className="w-4 h-4" />,
                variant: "default",
              },
              {
                id: "edit",
                name: "Change Role",
                icon: <Pen className="w-4 h-4" />,
                variant: "default",
                disabled: row.original.position.toLowerCase() === "admin" || isUpdatingAny || isDeletingAny
              },
              {
                id: "delete",
                name: "Remove Staff",
                icon: <Trash className="w-4 h-4" />,
                variant: "delete",
                disabled: row.original.position.toLowerCase() === "admin" || isUpdatingAny || isDeletingAny
              }
            ]}
            onSelect={handleAction}
          />

          <DialogLayout
            title="Update Staff Position"
            description={
              <div className="space-y-2">
                <p>
                  Change the position for{" "}
                  <strong>
                    {row.original.fname} {row.original.lname}
                  </strong>
                </p>
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <span>Current Position:</span>
                    <span className="font-medium">
                      {getCurrentPositionName()}
                    </span>
                  </div>
                  {form.watch("assignPosition") &&
                    getSelectedPositionName() !== getCurrentPositionName() && (
                      <div className="flex justify-between items-center mt-2 pt-2 border-t">
                        <span>New Position:</span>
                        <span className="font-medium text-blue-600">
                          {getSelectedPositionName()}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            }
            mainContent={
              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveEdit();
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <FormSelect
                      control={form.control}
                      name="assignPosition"
                      label="Select New Position"
                      options={formatPositions(positions)}
                    />

                    {isLoadingPositions && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 size={16} className="animate-spin" />
                        Loading positions...
                      </div>
                    )}

                    {isUpdatingAny && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Loader2 size={16} className="animate-spin" />
                        Updating staff position in both databases...
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                      disabled={isSubmitting || isUpdatingAny}
                    >
                      Cancel
                    </Button>

                    {!isSubmitting && !isUpdatingAny ? (
                      <Button
                        type="submit"
                        disabled={
                          isLoadingPositions || !form.watch("assignPosition")
                        }
                      >
                        <UserRoundCheck size={16} className="mr-2" />
                        Update Position
                      </Button>
                    ) : (
                      <LoadButton>
                        {isUpdatingAny ? "Updating..." : "Processing..."}
                      </LoadButton>
                    )}
                  </div>
                </form>
              </Form>
            }
            isOpen={isEditModalOpen}
            onOpenChange={handleCloseModal}
          />
        </div>
      );
    },
  },
];