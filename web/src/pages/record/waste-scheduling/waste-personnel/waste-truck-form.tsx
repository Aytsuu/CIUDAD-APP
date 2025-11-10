import { useState, useEffect } from "react";
import { Eye, ArchiveRestore, Trash, Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TruckFormSchema from "@/form-schema/waste-truck-form-schema";
import { useUpdateWasteTruck } from "./queries/truckUpdate";
import { useGetTrucks } from "./queries/truckFetchQueries";
import {
  useDeleteWasteTruck,
  useRestoreWasteTruck,
} from "./queries/truckDelQueries";
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
import {
  TruckStatus,
  TruckData,
  TruckManagementProps,
} from "./waste-personnel-types";
import { useAuth } from "@/context/AuthContext";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { useLoading } from "@/context/LoadingContext";

const TruckManagement = ({
  searchTerm,
  currentPage,
  pageSize,
}: TruckManagementProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active");
  const [currentTruck, setCurrentTruck] = useState<TruckData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const { showLoading, hideLoading } = useLoading();
  const {
    data: trucksData = { results: [], count: 0 },
    isLoading: isTrucksLoading,
  } = useGetTrucks(currentPage, pageSize, searchTerm, activeTab === "archive");
  useEffect(() => {
    if (isTrucksLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isTrucksLoading, showLoading, hideLoading]);
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

  const truckColumns: ColumnDef<any>[] = [
    {
      accessorKey: "truck_id",
      header: "Truck ID",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("truck_id")}</div>
      ),
      size: 100,
    },
    {
      accessorKey: "truck_plate_num",
      header: "Plate Number",
      cell: ({ row }) => (
        <div className="flex-row items-center bg-blue-50 px-2.5 py-0.5 rounded-full border border-primary">
          <div className="text-primary text-sm font-medium">{row.getValue("truck_plate_num")}</div>
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "truck_model",
      header: "Model",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("truck_model")}</div>
      ),
      size: 150,
    },
    {
      accessorKey: "truck_capacity",
      header: "Capacity (tons)",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("truck_capacity")}</div>
      ),
      size: 120,
    },
    {
      accessorKey: "truck_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("truck_status") as string;
        const statusColors = {
          Operational: "bg-green-100 text-green-800",
          Maintenance: "bg-yellow-100 text-yellow-800",
          "Out of Service": "bg-red-100 text-red-800",
        };
        return (
          <div className="text-center">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                statusColors[status as keyof typeof statusColors] ||
                "bg-gray-100 text-gray-800"
              }`}
            >
              {status}
            </span>
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const truck = row.original;
        const isArchived = truck.truck_is_archive;

        return (
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

            {isArchived ? (
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
                      onClick={() =>
                        handleDeleteTruck(truck.truck_id, false, true)
                      }
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
                            <Trash className="h-4 w-4" />
                          )}
                        </Button>
                      }
                      title="Confirm Dispose"
                      description={`Are you sure you want to record truck ${truck.truck_plate_num} as disposed? It will be moved to the disposed trucks list.`}
                      actionLabel="Confirm"
                      onClick={() =>
                        handleDeleteTruck(truck.truck_id, false, false)
                      }
                    />
                  </div>
                }
                content="Dispose"
              />
            )}

            {/* {activeTab === "archive" && (
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
                            <Ban className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      }
                      title="Confirm Permanent Delete"
                      description={`This will permanently delete truck ${truck.truck_plate_num}. This action cannot be undone.`}
                      actionLabel="Delete"
                      onClick={() =>
                        handleDeleteTruck(truck.truck_id, true, false)
                      }
                    />
                  </div>
                }
                content="Delete"
              />
            )} */}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 150,
    },
  ];

  const truckTableData = trucksData.results.map((truck: TruckData) => ({
    truck_id: truck.truck_id.toString(),
    truck_plate_num: truck.truck_plate_num,
    truck_model: truck.truck_model,
    truck_capacity: String(truck.truck_capacity),
    truck_status: truck.truck_status as TruckStatus,
    truck_last_maint: truck.truck_last_maint,
    truck_is_archive: truck.truck_is_archive,
  }));

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

  const handleDeleteTruck = (
    id: string,
    permanent: boolean = false,
    isRestore: boolean = false
  ) => {
    if (isRestore) {
      restoreTruck.mutate(parseInt(id), {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["trucks"] });
        },
      });
    } else {
      deleteTruck.mutate(
        { truck_id: parseInt(id), permanent },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trucks"] });
          },
        }
      );
    }
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
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "active" | "archive")}
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="active">Active Trucks</TabsTrigger>
            <TabsTrigger value="archive">Disposed Trucks</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "active" && (
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

      <Tabs value={activeTab} className="w-full">
        <TabsContent value="active" className="m-0">
          <DataTable columns={truckColumns} data={truckTableData} />
        </TabsContent>

        <TabsContent value="archive" className="m-0">
          <div className="bg-gray-50 rounded-lg">
            <DataTable columns={truckColumns} data={truckTableData} />
          </div>
        </TabsContent>
      </Tabs>

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
                        content={
                          currentTruck.truck_is_archive
                            ? "Cannot edit archived truck"
                            : "Edit truck details"
                        }
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
                          title={`Confirm ${
                            currentTruck ? "Update" : "Add"
                          } Truck`}
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
