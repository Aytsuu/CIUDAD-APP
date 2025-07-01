import { useState } from "react";
import {
  Shield,
  Truck,
  User,
  Trash2,
  Plus,
  Eye,
  Trash,
  Loader2,
  Search,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import CardLayout from "@/components/ui/card/card-layout";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TruckFormSchema from "@/form-schema/waste-truck-form-schema";
import { useUpdateWasteTruck } from "./queries/truckUpdate";
import { useGetAllPersonnel, useGetTrucks } from "./queries/truckFetchQueries";
import { useDeleteWasteTruck, useRestoreWasteTruck } from "./queries/truckDelQueries";
import { useAddWasteTruck } from "./queries/truckAddQueries";
import { Skeleton } from "@/components/ui/skeleton";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { useQueryClient } from "@tanstack/react-query";

type PersonnelCategory = "Watchman" | "Waste Driver" | "Waste Collector" | "Trucks";

interface PersonnelItem {
  id: string;
  name: string;
  position: string;
  contact?: string;
}

interface PersonnelData {
  Watchman: PersonnelItem[];
  "Waste Driver": PersonnelItem[];
  "Waste Collector": PersonnelItem[];
  Trucks: TruckData[];
}

type TruckStatus = "Operational" | "Maintenance";

interface TruckData {
  truck_id: string;
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: string;
  truck_status: TruckStatus;
  truck_last_maint: string;
  truck_is_archive?: boolean;
}

const WastePersonnel = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<PersonnelCategory>("Watchman");
  const [truckViewMode, setTruckViewMode] = useState<"active" | "archive">("active");
  const [currentTruck, setCurrentTruck] = useState<TruckData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: trucks = [],
    isLoading: isTrucksLoading,
    isError: isTrucksError,
  } = useGetTrucks();

  const {
    data: personnel = [],
    isLoading: isPersonnelLoading,
    isError: isPersonnelError,
  } = useGetAllPersonnel();

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
    },
  });

  const validTrucks = Array.isArray(trucks) ? trucks : [];

  const normalizePosition = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("Watchman") || lower.includes("watchmen")) return "Watchman";
    if (lower.includes("Waste Driver") || lower.includes("truck driver")) return "Waste Driver";
    if (lower.includes("Waste Collector") || lower.includes("waste collectors")) return "Waste Collector";
    return title;
  };

  const personnelData: PersonnelData = {
    Watchman: personnel
      .filter((p) => normalizePosition(p.staff.position?.title || "") === "Watchman")
      .map((p) => ({
        id: p.wstp_id.toString(),
        name: `${p.staff.profile.personal?.fname || ""} ${
          p.staff.profile.personal?.mname || ""
        } ${p.staff.profile.personal?.lname || ""} ${
          p.staff.profile.personal?.suffix || ""
        }`,
        position: "Watchman",
        contact: p.staff.profile.personal?.contact || "N/A",
      })),
    "Waste Driver": personnel
      .filter((p) => normalizePosition(p.staff.position?.title || "") === "Waste Driver")
      .map((p) => ({
        id: p.wstp_id.toString(),
        name: `${p.staff.profile.personal?.fname || ""} ${
          p.staff.profile.personal?.mname || ""
        } ${p.staff.profile.personal?.lname || ""} ${
          p.staff.profile.personal?.suffix || ""
        }`,
        position: "Waste Driver",
        contact: p.staff.profile.personal?.contact || "N/A",
      })),
    "Waste Collector": personnel
      .filter((p) => normalizePosition(p.staff.position?.title || "") === "Waste Collector")
      .map((p) => ({
        id: p.wstp_id.toString(),
        name: `${p.staff.profile.personal?.fname || ""} ${
          p.staff.profile.personal?.mname || ""
        } ${p.staff.profile.personal?.lname || ""} ${
          p.staff.profile.personal?.suffix || ""
        }`,
        position: "Waste Collector",
        contact: p.staff.profile.personal?.contact || "N/A",
      })),
    Trucks: validTrucks.map((truck) => ({
      truck_id: truck.truck_id.toString(),
      truck_plate_num: truck.truck_plate_num,
      truck_model: truck.truck_model,
      truck_capacity: String(truck.truck_capacity),
      truck_status: truck.truck_status as TruckStatus,
      truck_last_maint: truck.truck_last_maint,
      truck_is_archive: truck.truck_is_archive,
    })),
  };

  const filteredTrucks = personnelData.Trucks.filter((truck) => {
    const searchString = `${truck.truck_id} ${truck.truck_plate_num} ${truck.truck_model} ${truck.truck_capacity} ${truck.truck_status}`.toLowerCase();
    return (
      searchString.includes(searchQuery.toLowerCase()) &&
      (truckViewMode === "active" ? !truck.truck_is_archive : truck.truck_is_archive)
    );
  });

  const handleSubmit = (values: z.infer<typeof TruckFormSchema>) => {
    const parsedValues = {
      ...values,
      truck_capacity: String(values.truck_capacity).replace(/,/g, ""),
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
          onError: (error) => {
            console.error("Error updating truck", error);
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
        onError: (error) => {
          console.error("Error adding truck", error);
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
        onError: (error) => {
          console.error(`Error ${permanent ? "deleting" : "archiving"} truck`, error);
        },
      }
    );
  };

  const handleRestoreTruck = (id: string) => {
    restoreTruck.mutate(parseInt(id), {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["trucks"] });
      },
      onError: (error) => {
        console.error("Error restoring truck", error);
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

  if (isTrucksLoading || isPersonnelLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
        <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
        <Skeleton className="h-10 w-full mb-4 opacity-30" />
        <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
      </div>
    );
  }

  if (isTrucksError || isPersonnelError) {
    return <div className="text-red-500 p-4">Error loading data</div>;
  }

  const getCategoryIcon = (category: PersonnelCategory) => {
    switch (category) {
      case "Watchman":
        return <Shield className="h-5 w-5" />;
      case "Waste Driver":
        return (
          <div className="relative">
            <User className="h-5 w-5" />
            <Truck className="h-3 w-3 absolute -bottom-1 -right-1" />
          </div>
        );
      case "Waste Collector":
        return <Trash2 className="h-5 w-5" />;
      case "Trucks":
        return <Truck className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: PersonnelCategory) => {
    switch (category) {
      case "Watchman":
        return "bg-green-100 text-green-600";
      case "Waste Driver":
        return "bg-yellow-100 text-yellow-600";
      case "Waste Collector":
        return "bg-sky-100 text-sky-600";
      case "Trucks":
        return "bg-purple-100 text-purple-600";
    }
  };

  return (
    <div className="w-full h-full p-4">
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Waste Personnel & Collection Vehicle
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          List of waste management personnel and garbage collection vehicles.
        </p>
      </div>
      <hr className="border-gray mb-6 sm:mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(["Watchman", "Waste Driver", "Waste Collector", "Trucks"] as PersonnelCategory[]).map(
          (category) => (
            <CardLayout
              key={category}
              content={
                <div className="flex flex-col items-start gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                      {getCategoryIcon(category)}
                    </div>
                    <span className="text-2xl font-semibold">
                      {personnelData[category].length}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium">{category}</h3>
                    <div
                      className={`flex items-center gap-1 text-sm ${
                        category === "Trucks" ? "text-purple-600" : "text-green-600"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          category === "Trucks" ? "bg-purple-500" : "bg-green-500"
                        }`}
                      ></span>
                      <span>
                        {category === "Trucks"
                          ? `Operational: ${
                              trucks.filter((t) => t.truck_status === "Operational").length
                            }`
                          : "Active"}
                      </span>
                    </div>
                  </div>
                </div>
              }
              cardClassName="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            />
          )
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6">
          Personnel & Collection Vehicle Directory
        </h2>

        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center justify-center bg-white rounded-full p-1 shadow-md">
            {(["Watchman", "Waste Driver", "Waste Collector", "Trucks"] as PersonnelCategory[]).map(
              (category) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === category
                      ? "bg-primary text-white shadow"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              )
            )}
          </div>
        </div>

        {activeTab === "Trucks" && (
          <div className="flex justify-between items-center mb-4">
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

            <div className="relative w-full flex gap-2 mr-2 max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
                size={17}
              />
              <Input
                placeholder="Search trucks..."
                className="pl-10 bg-white w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
        )}

        <div className={`bg-white rounded-lg shadow-sm border p-4 ${truckViewMode === "archive" ? "bg-gray-50" : ""}`}>
          {activeTab === "Trucks" ? (
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
          ) : (
            <div className="space-y-2">
              {personnelData[activeTab].map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        getCategoryColor(activeTab).replace("text", "bg").split(" ")[0]
                      } ${
                        getCategoryColor(activeTab).includes("text")
                          ? getCategoryColor(activeTab).split(" ")[1]
                          : ""
                      }`}
                    >
                      <span className="text-sm font-bold text-white">
                        {person.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{person.name}</p>
                      <p className="text-sm text-gray-500">{person.position}</p>
                    </div>
                  </div>
                  {person.contact && (
                    <a
                      href={`tel:${person.contact}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {person.contact}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
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
            <div className="pb-2">
              <h2 className="text-lg font-semibold">
                {isReadOnly
                  ? "TRUCK DETAILS"
                  : currentTruck
                  ? "EDIT TRUCK"
                  : "ADD NEW TRUCK"}
              </h2>
              <p className="text-xs text-black/50">
                Fill out all necessary fields
              </p>
            </div>
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

export default WastePersonnel;
