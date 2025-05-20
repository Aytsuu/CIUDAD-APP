import { useState } from "react";
import { Shield, Truck, User, Trash2, Plus, Edit, Trash } from "lucide-react";
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

type PersonnelCategory = "Watchmen" | "Truck Drivers" | "Waste Collectors" | "Trucks";
type TruckStatus = "Operational" | "Maintenance";

interface TruckData {
  id: string;
  name: string;
  status: TruckStatus;
  lastService: string;
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
    { id: "1", name: "Truck #101", status: "Operational", lastService: "2023-05-15" },
    { id: "2", name: "Truck #102", status: "Maintenance", lastService: "2023-06-20" },
  ]);
  const [newTruck, setNewTruck] = useState<Omit<TruckData, "id">>({
    name: "",
    status: "Operational",
    lastService: new Date().toISOString().split("T")[0],
  });
  const [editingTruck, setEditingTruck] = useState<TruckData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  // CRUD Operations for Trucks
  const handleAddTruck = () => {
    const newTruckWithId: TruckData = {
      ...newTruck,
      id: Date.now().toString(),
    };
    setTrucks([...trucks, newTruckWithId]);
    setNewTruck({
      name: "",
      status: "Operational",
      lastService: new Date().toISOString().split("T")[0],
    });
    setIsDialogOpen(false);
  };

  const handleUpdateTruck = () => {
    if (!editingTruck) return;
    setTrucks(trucks.map(truck => 
      truck.id === editingTruck.id ? editingTruck : truck
    ));
    setEditingTruck(null);
    setIsDialogOpen(false);
  };

  const handleDeleteTruck = (id: string) => {
    setTrucks(trucks.filter(truck => truck.id !== id));
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
                        ? `Operational: ${trucks.filter(t => t.status === "Operational").length}` 
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
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="gap-1"
                    onClick={() => {
                      setEditingTruck(null);
                      setNewTruck({
                        name: "",
                        status: "Operational",
                        lastService: new Date().toISOString().split("T")[0],
                      });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Truck
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingTruck ? "Edit Truck" : "Add New Truck"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="name" className="text-right">
                        Truck Name
                      </label>
                      <Input
                        id="name"
                        value={editingTruck ? editingTruck.name : newTruck.name}
                        onChange={(e) => 
                          editingTruck
                            ? setEditingTruck({...editingTruck, name: e.target.value})
                            : setNewTruck({...newTruck, name: e.target.value})
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="status" className="text-right">
                        Status
                      </label>
                      <select
                        id="status"
                        value={editingTruck ? editingTruck.status : newTruck.status}
                        onChange={(e) => {
                          const value = e.target.value as TruckStatus;
                          editingTruck
                            ? setEditingTruck({...editingTruck, status: value})
                            : setNewTruck({...newTruck, status: value});
                        }}
                        className="col-span-3 border rounded-md p-2"
                      >
                        <option value="Operational">Operational</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="lastService" className="text-right">
                        Last Service
                      </label>
                      <Input
                        type="date"
                        id="lastService"
                        value={editingTruck 
                          ? editingTruck.lastService 
                          : newTruck.lastService}
                        onChange={(e) => 
                          editingTruck
                            ? setEditingTruck({...editingTruck, lastService: e.target.value})
                            : setNewTruck({...newTruck, lastService: e.target.value})
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={editingTruck ? handleUpdateTruck : handleAddTruck}
                        disabled={!newTruck.name && !editingTruck}
                      >
                        {editingTruck ? "Update" : "Add"} Truck
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {activeTab === "Trucks" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Truck Name</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Last Service</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trucks.map((truck) => (
                    <tr key={truck.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{truck.name}</td>
                      <td className="p-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          truck.status === "Operational"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {truck.status}
                        </span>
                      </td>
                      <td className="p-2">{truck.lastService}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTruck(truck);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTruck(truck.id)}
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
    </div>
  );
};

export default WastePersonnel;