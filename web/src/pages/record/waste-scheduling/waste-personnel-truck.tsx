import { useState } from "react";
import {
  Shield,
  Truck,
  User,
  Trash2,
  Plus,
  Eye,
  Trash,
  Edit,
  Loader2,
  Search,
} from "lucide-react";
import CardLayout from "@/components/ui/card/card-layout";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectLayout } from "@/components/ui/select/select-layout";
import {
  Form,
  FormControl,
  FormItem,
  FormMessage,
  FormField
} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TruckFormSchema from "@/form-schema/waste-truck-form-schema";
import { useUpdateWasteTruck } from "./queries/truckUpdate";
import { useGetAllPersonnel, useGetTrucks } from "./queries/truckFetchQueries";
import { useDeleteWasteTruck } from "./queries/truckDelQueries";
import { useAddWasteTruck } from "./queries/truckAddQueries";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

type PersonnelCategory =
  | "Watchmen"
  | "Truck Drivers"
  | "Waste Collectors"
  | "Trucks";
type TruckStatus = "Operational" | "Maintenance";

interface TruckData {
  truck_id: string;
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: string;
  truck_status: TruckStatus;
  truck_last_maint: string;
}

interface PersonnelItem {
  id: string;
  name: string;
}

interface PersonnelData {
  Watchmen: PersonnelItem[];
  "Truck Drivers": PersonnelItem[];
  "Waste Collectors": PersonnelItem[];
  Trucks: TruckData[];
}

const WastePersonnel = () => {
  const [activeTab, setActiveTab] = useState<PersonnelCategory>("Watchmen");
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

  const form = useForm<z.infer<typeof TruckFormSchema>>({
    resolver: zodResolver(TruckFormSchema),
    defaultValues: {
      truck_plate_num: "",
      truck_model: "",
      truck_capacity: '',
      truck_status: "Operational",
      truck_last_maint: new Date().toISOString().split("T")[0],
    },
  });

  const validTrucks = Array.isArray(trucks) ? trucks : [];

  const personnelData: PersonnelData = {
    Watchmen: personnel
      .filter((p) => p.role === "Watchmen")
      .map((p) => ({ id: p.wstp_id.toString(), name: p.name })),
    "Truck Drivers": personnel
      .filter((p) => p.role === "Truck Drivers")
      .map((p) => ({ id: p.wstp_id.toString(), name: p.name })),
    "Waste Collectors": personnel
      .filter((p) => p.role === "Waste Collectors")
      .map((p) => ({ id: p.wstp_id.toString(), name: p.name })),
    Trucks: validTrucks.map((truck) => ({
      truck_id: truck.truck_id.toString(),
      truck_plate_num: truck.truck_plate_num,
      truck_model: truck.truck_model,
      truck_capacity: String(truck.truck_capacity),
      truck_status: truck.truck_status as TruckStatus,
      truck_last_maint: truck.truck_last_maint,
    })),
  };

  // Filter data based on search query
  const filteredTrucks = personnelData.Trucks.filter((truck) => {
    const searchString = `${truck.truck_id} ${truck.truck_plate_num} ${truck.truck_model} ${truck.truck_capacity} ${truck.truck_status}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

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
      case "Watchmen":
        return <Shield className="h-5 w-5" />;
      case "Truck Drivers":
        return (
          <div className="relative">
            <User className="h-5 w-5" />
            <Truck className="h-3 w-3 absolute -bottom-1 -right-1" />
          </div>
        );
      case "Waste Collectors":
        return <Trash2 className="h-5 w-5" />;
      case "Trucks":
        return <Truck className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: PersonnelCategory) => {
    switch (category) {
      case "Watchmen":
        return "bg-green-100 text-green-600";
      case "Truck Drivers":
        return "bg-yellow-100 text-yellow-600";
      case "Waste Collectors":
        return "bg-sky-100 text-sky-600";
      case "Trucks":
        return "bg-purple-100 text-purple-600";
    }
  };

 const handleSubmit = (values: z.infer<typeof TruckFormSchema>) => {
  const parsedValues = {
    ...values,
    truck_capacity: String(values.truck_capacity).replace(/,/g, ""),
  };

  if (currentTruck) {
    updateTruck.mutate({
      truck_id: parseInt(currentTruck.truck_id),
      truckData: parsedValues,
    }, {
      onSuccess: () => {
        setIsReadOnly(true); // Switch back to view mode after update
      }
    });
  } else {
    addTruck.mutate(parsedValues, {
      onSuccess: () => {
        setIsDialogOpen(false); // Close the modal after successful add
        setCurrentTruck(null); // Reset current truck
      }
    });
  }
};

  const handleDeleteTruck = (id: string) => {
  deleteTruck.mutate(parseInt(id));
};

  const openDialog = (truck: TruckData | null, readOnly: boolean) => {
    setCurrentTruck(truck);
    setIsReadOnly(readOnly);
    if (truck) {
      form.reset({
        ...truck,
        truck_capacity: String(truck.truck_capacity).replace(",", "")
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

  return (
    <div className="w-full h-full p-4">
      {/* Header Section */}
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Waste Personnel & Collection Vehicle
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          List of waste management personnel and garbage collection vehicles.
        </p>
      </div>
      <hr className="border-gray mb-6 sm:mb-8" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(Object.keys(personnelData) as PersonnelCategory[]).map((category) => (
          <CardLayout
            key={category}
            content={
              <div className="flex flex-col items-start gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${getCategoryColor(category)}`}
                  >
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
                      category === "Trucks"
                        ? "text-purple-600"
                        : "text-green-600"
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
                            trucks.filter(
                              (t) => t.truck_status === "Operational"
                            ).length
                          }`
                        : "Active"}
                    </span>
                  </div>
                </div>
              </div>
            }
            cardClassName="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          />
        ))}
      </div>

      {/* Personnel Directory Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6">
          Personnel & Collection Vehicle Directory
        </h2>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center justify-center bg-white rounded-full p-1 shadow-md">
            {(Object.keys(personnelData) as PersonnelCategory[]).map(
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

        {/* Search and Add Section */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full flex gap-2 mr-2">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {activeTab === "Trucks" && (
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

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          {activeTab === "Trucks" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-cente">Truck ID</th>
                    <th className="p-2 text-center">Plate Number</th>
                    <th className="p-2 text-center">Model</th>
                    <th className="p-2 text-center">Capacity (tons)</th>
                    <th className="p-2 text-center">Status</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrucks.map((truck) => (
                    <tr
                      key={truck.truck_id}
                      className="border-b hover:bg-gray-50"
                    >
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
                        <div className="flex justify-center items-center">
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
                                  title="Confirm Delete"
                                  description="Are you sure you want to delete this truck?"
                                  actionLabel="Confirm"
                                  onClick={() => handleDeleteTruck(truck.truck_id)}
                                />
                              </div>
                            }
                            content="Delete"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ul className="space-y-2">
              {personnelData[activeTab].map((person) => (
                <li
                  key={person.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded"
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      getCategoryColor(activeTab)
                        .replace("text", "bg")
                        .split(" ")[0]
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
                  <span>{person.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Truck Dialog */}
      <DialogLayout
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setIsReadOnly(true); // Reset to view mode when closing dialog
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="truck_plate_num"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <Label>Plate Number</Label>
                      <FormControl>
                        <Input {...field} readOnly={isReadOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="truck_model"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <Label>Model</Label>
                      <FormControl>
                        <Input {...field} readOnly={isReadOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="truck_capacity"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <Label>Capacity (tons)</Label>
                      <FormControl>
                        <Input {...field} readOnly={isReadOnly} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="truck_status"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <Label>Status</Label>
                      <FormControl>
                        {isReadOnly ? (
                          <Input value={field.value} readOnly />
                        ) : (
                          <SelectLayout
                            className="w-full"
                            label="Select Status"
                            placeholder="Select Status"
                            options={[
                              { id: "Operational", name: "Operational" },
                              { id: "Maintenance", name: "Maintenance" },
                            ]}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="truck_last_maint"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <Label>Last Maintenance</Label>
                      <FormControl>
                        <Input type="date" {...field} readOnly={isReadOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 mt-4">
                  {isReadOnly && currentTruck && (
                    <Button
                      type="button"
                      onClick={() => setIsReadOnly(false)}
                    >
                      Edit
                    </Button>
                  )}
                  
                  {!isReadOnly && (
                    <>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          if (currentTruck) {
                            setIsReadOnly(true); // Switch back to view mode
                          } else {
                            setIsDialogOpen(false); // Close dialog if it's a new truck
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
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
                    </>
                  )}
                </div>
              </div>
            </form>
          </Form>
        }
      />
    </div>
  );
};

export default WastePersonnel;