import { useState } from "react";
import { Eye, Archive, ArchiveRestore, Trash, Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TruckFormSchema from "@/form-schema/waste-truck-form-schema";
import { useUpdateWasteTruck } from "./queries/truckUpdate";
import { useGetTrucks } from "./queries/truckFetchQueries";
import { useDeleteWasteTruck, useRestoreWasteTruck } from "./queries/truckDelQueries";
import { useAddWasteTruck } from "./queries/truckAddQueries";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { TruckStatus, TruckData } from "./waste-personnel-types";
import { useAuth } from "@/context/AuthContext";

const TruckManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [truckViewMode, setTruckViewMode] = useState<"active" | "archive">("active");
  const [currentTruck, setCurrentTruck] = useState<TruckData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);

  const { data: trucks = [], isLoading: isTrucksLoading } = useGetTrucks();
  const addTruck = useAddWasteTruck();
  const updateTruck = useUpdateWasteTruck();
  const deleteTruck = useDeleteWasteTruck();
  const restoreTruck = useRestoreWasteTruck();

  const form = useForm<z.infer<typeof TruckFormSchema>>({
    resolver: zodResolver(TruckFormSchema),
    defaultValues: {
      truck_plate_num: "",
      truck_model: "",
      truck_capacity: "",
      truck_status: "Operational",
      truck_last_maint: new Date().toISOString().split("T")[0],
      staff: user?.staff?.staff_id || "00001250909",
    },
  });

  const filteredTrucks = trucks
    .map((truck) => ({
      truck_id: truck.truck_id.toString(),
      truck_plate_num: truck.truck_plate_num,
      truck_model: truck.truck_model,
      truck_capacity: String(truck.truck_capacity),
      truck_status: truck.truck_status as TruckStatus,
      truck_last_maint: truck.truck_last_maint,
      truck_is_archive: truck.truck_is_archive,
    }))
    .filter((truck) => truckViewMode === "active" ? !truck.truck_is_archive : truck.truck_is_archive);

  const handleSubmit = (values: z.infer<typeof TruckFormSchema>) => {
    const parsedValues = {
      ...values,
      truck_capacity: String(values.truck_capacity).replace(/,/g, ""),
      staff: user?.staff?.staff_id || "00001250909",
    };

    if (currentTruck) {
      updateTruck.mutate(
        {
          truck_id: parseInt(currentTruck.truck_id),
          truckData: parsedValues,
        },
        {
          onSuccess: () => {
            setIsReadOnly(true);
            queryClient.invalidateQueries({ queryKey: ["trucks"] });
          },
        }
      );
    } else {
      addTruck.mutate(parsedValues, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setCurrentTruck(null);
          queryClient.invalidateQueries({ queryKey: ["trucks"] });
        },
      });
    }
  };

  const handleDeleteTruck = (id: string, permanent: boolean = false) => {
    deleteTruck.mutate(
      { truck_id: parseInt(id), permanent },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["trucks"] });
        },
      }
    );
  };

  const handleRestoreTruck = (id: string) => {
    restoreTruck.mutate(parseInt(id), {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["trucks"] });
      },
    });
  };

  const openDialog = (truck: TruckData | null, readOnly: boolean) => {
    setCurrentTruck(truck);
    setIsReadOnly(readOnly);
    if (truck) {
      form.reset({
        ...truck,
        truck_capacity: String(truck.truck_capacity).replace(",", ""),
      });
    } else {
      form.reset({
        truck_plate_num: "",
        truck_model: "",
        truck_capacity: "",
        truck_status: "Operational",
        truck_last_maint: new Date().toISOString().split("T")[0],
      });
    }
    setIsDialogOpen(true);
  };

  if (isTrucksLoading) {
    return <div className="text-center p-4">Loading trucks...</div>;
  }

  return (
    <div className="w-full h-full p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex border rounded-lg p-1 bg-gray-100">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              truckViewMode === "active"
                ? "bg-white shadow text-primary"
                : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setTruckViewMode("active")}
          >
            Active Trucks
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              truckViewMode === "archive"
                ? "bg-white shadow text-primary"
                : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setTruckViewMode("archive")}
          >
            Archived Trucks
          </button>
        </div>

        {truckViewMode === "active" && (
          <Button
            size="sm"
            className="gap-1"
            onClick={() => openDialog(null, false)}
            disabled={addTruck.isPending}
          >
            {addTruck.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Truck
              </>
            )}
          </Button>
        )}
      </div>

      <div className={`bg-white rounded-lg shadow-sm border p-4 ${truckViewMode === "archive" ? "bg-gray-50" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-center">Truck ID</th>
                <th className="p-2 text-center">Plate Number</th>
                <th className="p-2 text-center">Model</th>
                <th className="p-2 text-center">Capacity (tons)</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrucks.map((truck) => (
                <tr key={truck.truck_id} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-center">{truck.truck_id}</td>
                  <td className="p-2 text-center">{truck.truck_plate_num}</td>
                  <td className="p-2 text-center">{truck.truck_model}</td>
                  <td className="p-2 text-center">{truck.truck_capacity}</td>
                  <td className="p-2 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        truck.truck_status === "Operational"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {truck.truck_status}
                    </span>
                  </td>
                  <td className="p-2">
                    <div className="flex justify-center items-center gap-1">
                      <TooltipLayout
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDialog(truck, true)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        }
                        content="View"
                      />

                      {truck.truck_is_archive ? (
                        <TooltipLayout
                          trigger={
                            <div className="flex items-center h-8">
                              <ConfirmationModal
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={restoreTruck.isPending}
                                  >
                                    {restoreTruck.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <ArchiveRestore className="h-4 w-4 text-green-500" />
                                    )}
                                  </Button>
                                }
                                title="Confirm Restore"
                                description={`Are you sure you want to restore truck ${truck.truck_plate_num}? It will be moved back to active trucks.`}
                                actionLabel="Restore"
                                onClick={() => handleRestoreTruck(truck.truck_id)}
                              />
                            </div>
                          }
                          content="Restore"
                        />
                      ) : (
                        <TooltipLayout
                          trigger={
                            <div className="flex items-center h-8">
                              <ConfirmationModal
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={deleteTruck.isPending}
                                  >
                                    {deleteTruck.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Archive className="h-4 w-4" />
                                    )}
                                  </Button>
                                }
                                title="Confirm Archive"
                                description={`Are you sure you want to archive truck ${truck.truck_plate_num}? It will be moved to the archived trucks list.`}
                                actionLabel="Archive"
                                onClick={() => handleDeleteTruck(truck.truck_id, false)}
                              />
                            </div>
                          }
                          content="Archive"
                        />
                      )}

                      {truckViewMode === "archive" && (
                        <TooltipLayout
                          trigger={
                            <div className="flex items-center h-8">
                              <ConfirmationModal
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={deleteTruck.isPending}
                                  >
                                    {deleteTruck.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash className="h-4 w-4 text-red-500" />
                                    )}
                                  </Button>
                                }
                                title="Confirm Permanent Delete"
                                description={`This will permanently delete truck ${truck.truck_plate_num}. This action cannot be undone.`}
                                actionLabel="Delete"
                                onClick={() => handleDeleteTruck(truck.truck_id, true)}
                              />
                            </div>
                          }
                          content="Delete"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DialogLayout
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setIsReadOnly(true);
          }
        }}
        className="max-w-[55%]"
        title={
          isReadOnly
            ? "Truck Details"
            : currentTruck
            ? "Edit Truck"
            : "Add New Truck"
        }
        description=""
        mainContent={
          <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
            <div className="grid gap-4">
              <Form {...form}>
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="flex flex-col gap-4"
                >
                  <FormInput
                    control={form.control}
                    name="truck_plate_num"
                    label="Plate Number"
                    placeholder="Enter plate number"
                    readOnly={isReadOnly}
                  />

                  <FormInput
                    control={form.control}
                    name="truck_model"
                    label="Model"
                    placeholder="Enter truck model"
                    readOnly={isReadOnly}
                  />

                  <FormInput
                    control={form.control}
                    name="truck_capacity"
                    label="Capacity (tons)"
                    placeholder="Enter capacity"
                    readOnly={isReadOnly}
                    type="number"
                  />

                  {isReadOnly ? (
                    <FormInput
                      control={form.control}
                      name="truck_status"
                      label="Status"
                      readOnly={true}
                    />
                  ) : (
                    <FormSelect
                      control={form.control}
                      name="truck_status"
                      label="Status"
                      options={[
                        { id: "Operational", name: "Operational" },
                        { id: "Maintenance", name: "Maintenance" },
                      ]}
                      readOnly={isReadOnly}
                    />
                  )}

                  <FormDateTimeInput
                    control={form.control}
                    name="truck_last_maint"
                    type="date"
                    label="Last Maintenance"
                    readOnly={isReadOnly}
                  />

                  <div className="mt-8 flex justify-end gap-3">
                    {isReadOnly && currentTruck && (
                      <TooltipLayout
                        trigger={
                          <Button
                            type="button"
                            onClick={() => setIsReadOnly(false)}
                            disabled={currentTruck.truck_is_archive}
                          >
                            Edit
                          </Button>
                        }
                        content={currentTruck.truck_is_archive ? "Cannot edit archived truck" : "Edit truck details"}
                      />
                    )}

                    {!isReadOnly && (
                      <>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => {
                            if (currentTruck) {
                              setIsReadOnly(true);
                            } else {
                              setIsDialogOpen(false);
                            }
                          }}
                        >
                          Cancel
                        </Button>
                        <ConfirmationModal
                          trigger={
                            <Button
                              type="button"
                              disabled={
                                currentTruck
                                  ? updateTruck.isPending
                                  : addTruck.isPending
                              }
                            >
                              {currentTruck ? "Update" : "Add"} Truck
                              {(currentTruck
                                ? updateTruck.isPending
                                : addTruck.isPending) && (
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              )}
                            </Button>
                          }
                          title={`Confirm ${currentTruck ? "Update" : "Add"} Truck`}
                          description={
                            currentTruck
                              ? `Are you sure you want to update truck ${currentTruck.truck_plate_num}?`
                              : "Are you sure you want to add this new truck?"
                          }
                          actionLabel={currentTruck ? "Update" : "Add"}
                          onClick={form.handleSubmit(handleSubmit)}
                        />
                      </>
                    )}
                  </div>
                </form>
              </Form>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default TruckManagement;