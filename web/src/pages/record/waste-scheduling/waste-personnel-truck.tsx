import { useState } from "react";
import { Shield, Truck, User, Trash2, Plus, Eye, Trash, Edit } from "lucide-react";
import CardLayout from "@/components/ui/card/card-layout";
import { Button } from "@/components/ui/button/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TruckFormSchema from "@/form-schema/waste-truck-form-schema";

type PersonnelCategory = "Watchmen" | "Truck Drivers" | "Waste Collectors" | "Trucks";
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
  "Trucks": TruckData[];
}

const WastePersonnel = () => {
  const [activeTab, setActiveTab] = useState<PersonnelCategory>("Watchmen");
  const [trucks, setTrucks] = useState<TruckData[]>([
    { 
      truck_id: "1", 
      truck_plate_num: "ABC123", 
      truck_model: "Model X", 
      truck_capacity: "5 tons", 
      truck_status: "Operational", 
      truck_last_maint: "2023-05-15" 
    },
    { 
      truck_id: "2", 
      truck_plate_num: "XYZ789", 
      truck_model: "Model Y", 
      truck_capacity: "3 tons", 
      truck_status: "Maintenance", 
      truck_last_maint: "2023-06-20" 
    },
  ]);
  const [currentTruck, setCurrentTruck] = useState<TruckData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true); // Default to view mode

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

  // Sample personnel data
  const personnelData: PersonnelData = {
    Watchmen: [
      { id: "1", name: "John Smith" },
      { id: "2", name: "Maria Garcia" },
      { id: "3", name: "Robert Chen" },
    ],
    "Truck Drivers": [
      { id: "4", name: "Sarah Johnson" },
      { id: "5", name: "David Kim" },
    ],
    "Waste Collectors": [
      { id: "6", name: "Michael Brown" },
      { id: "7", name: "Emma Wilson" },
    ],
    "Trucks": trucks,
  };

  // Get icon component for each category
  const getCategoryIcon = (category: PersonnelCategory) => {
    switch(category) {
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

  // Get background color for each category
  const getCategoryColor = (category: PersonnelCategory) => {
    switch(category) {
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

  // Handle form submission
  const handleSubmit = (values: z.infer<typeof TruckFormSchema>) => {
    if (currentTruck) {
      // Update existing truck
      const updatedTrucks = trucks.map(truck => 
        truck.truck_id === currentTruck.truck_id ? { ...values, truck_id: currentTruck.truck_id } : truck
      );
      setTrucks(updatedTrucks);
    } else {
      // Add new truck
      const newTruck: TruckData = {
        ...values,
        truck_id: Date.now().toString(),
      };
      setTrucks([...trucks, newTruck]);
    }
    form.reset();
    setIsDialogOpen(false);
    setCurrentTruck(null);
    setIsReadOnly(true);
  };

  const handleDeleteTruck = (id: string) => {
    setTrucks(trucks.filter(truck => truck.truck_id !== id));
  };

  // Open dialog in view or edit mode
  const openDialog = (truck: TruckData | null, readOnly: boolean) => {
    setCurrentTruck(truck);
    setIsReadOnly(readOnly);
    if (truck) {
      form.reset(truck);
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
                  <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                    {getCategoryIcon(category)}
                  </div>
                  <span className="text-2xl font-semibold">
                    {personnelData[category].length}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium">{category}</h3>
                  <div className={`flex items-center gap-1 text-sm ${
                    category === "Trucks" ? "text-purple-600" : "text-green-600"
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${
                      category === "Trucks" ? "bg-purple-500" : "bg-green-500"
                    }`}></span>
                    <span>
                      {category === "Trucks" 
                        ? `Operational: ${trucks.filter(t => t.truck_status === "Operational").length}` 
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
        <h2 className="text-xl font-semibold mb-6">Personnel & Collection Vehicle Directory</h2>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center justify-center bg-white rounded-full p-1 shadow-md">
            {(Object.keys(personnelData) as PersonnelCategory[]).map((category) => (
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
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${getCategoryColor(activeTab)}`}>
                {getCategoryIcon(activeTab)}
              </div>
              {activeTab}
            </h3>
            {activeTab === "Trucks" && (
              <Button 
                size="sm" 
                className="gap-1"
                onClick={() => openDialog(null, false)}
              >
                <Plus className="h-4 w-4" />
                Add Truck
              </Button>
            )}
          </div>
          
          {activeTab === "Trucks" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Truck ID</th>
                    <th className="p-2 text-left">Plate Number</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trucks.map((truck) => (
                    <tr key={truck.truck_id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{truck.truck_id}</td>
                      <td className="p-2">{truck.truck_plate_num}</td>
                      <td className="p-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          truck.truck_status === "Operational"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {truck.truck_status}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDialog(truck, true)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDialog(truck, false)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTruck(truck.truck_id)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
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
                <li key={person.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    getCategoryColor(activeTab).replace('text', 'bg').split(' ')[0]
                  } ${getCategoryColor(activeTab).includes('text') ? 
                    getCategoryColor(activeTab).split(' ')[1] : ''}`}
                  >
                    {person.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium">{person.name}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Truck Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <DialogHeader>
                <DialogTitle>
                  {isReadOnly ? "Truck Details" : currentTruck ? "Edit Truck" : "Add New Truck"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Plate Number */}
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

                {/* Model */}
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

                {/* Capacity */}
                <FormField
                  control={form.control}
                  name="truck_capacity"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <Label>Capacity</Label>
                      <FormControl>
                        <Input {...field} readOnly={isReadOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="truck_status"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <Label>Status</Label>
                      <FormControl>
                        {isReadOnly ? (
                          <Input 
                            value={field.value} 
                            readOnly 
                          />
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

                {/* Last Maintenance */}
                <FormField
                  control={form.control}
                  name="truck_last_maint"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <Label>Last Maintenance</Label>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          readOnly={isReadOnly} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isReadOnly && (
                  <div className="flex justify-end gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {currentTruck ? "Update" : "Add"} Truck
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WastePersonnel;