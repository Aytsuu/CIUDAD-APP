import React, { useState } from "react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Plus, Shield, Truck, User, Trash2, ChevronDown } from "lucide-react";
import CardLayout from "@/components/ui/card/card-layout";

const WastePersonnel = () => {
  const [selectedValue, setSelectedValue] = useState<string>("");

  const handleChange = (value: string) => {
    console.log("Selected Value (ID):", value);
    setSelectedValue(value);
  };

  return (
    <div className="w-full h-full">
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

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  {/* Watchmen Card - Green */}
  <CardLayout
    content={
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100 text-green-600">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-2xl font-semibold">5</span>
        </div>
        <div>
          <h3 className="font-medium">Watchmen</h3>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span>Active</span>
          </div>
        </div>
      </div>
    }
    cardClassName="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
  />

  {/* Truck Drivers Card - Yellow */}
  <CardLayout
    content={
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
            <div className="relative">
              <User className="h-5 w-5" />
              <Truck className="h-3 w-3 absolute -bottom-1 -right-1" />
            </div>
          </div>
          <span className="text-2xl font-semibold">4</span>
        </div>
        <div>
          <h3 className="font-medium">Truck Drivers</h3>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span>Active</span>
          </div>
        </div>
      </div>
    }
    cardClassName="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
  />

  {/* Waste Collectors Card - Blue */}
  <CardLayout
    content={
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-100 text-sky-600">
            <Trash2 className="h-5 w-5" />
          </div>
          <span className="text-2xl font-semibold">6</span>
        </div>
        <div>
          <h3 className="font-medium">Waste Collectors</h3>
          <div className="flex items-center gap-1 text-sm text-sky-600">
            <span className="h-2 w-2 rounded-full bg-sky-500"></span>
            <span>Active</span>
          </div>
        </div>
      </div>
    }
    cardClassName="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
  />

  {/* Trucks Card - Purple */}
  <CardLayout
    content={
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
            <Truck className="h-5 w-5" />
          </div>
          <span className="text-2xl font-semibold">6</span>
        </div>
        <div>
          <h3 className="font-medium">Trucks</h3>
          <div className="flex items-center gap-1 text-sm text-purple-600">
            <span className="h-2 w-2 rounded-full bg-purple-500"></span>
            <span>Operational: 4</span>
          </div>
        </div>
      </div>
    }
    cardClassName="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
  />
</div>

{/* Directory Section */}
<div className="mt-8">
  <h2 className="text-xl font-semibold mb-4">Personnel & Collection Vehicle Directory</h2>
  
  {/* Watchmen Section */}
  <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-medium flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-green-100 text-green-600">
          <Shield className="h-4 w-4" />
        </div>
        Watchmen
      </h3>
      <ChevronDown className="h-4 w-4 text-gray-500" />
    </div>
    <ul className="space-y-2">
      <li className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
          JS
        </div>
        <div>
          <p className="font-medium">John Smith</p>
          <p className="text-xs text-gray-500">Security Lead</p>
        </div>
      </li>
      <li className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
          MG
        </div>
        <div>
          <p className="font-medium">Maria Garcia</p>
          <p className="text-xs text-gray-500">Night Shift</p>
        </div>
      </li>
      <li className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
          RC
        </div>
        <div>
          <p className="font-medium">Robert Chen</p>
          <p className="text-xs text-gray-500">Day Shift</p>
        </div>
      </li>
    </ul>
  </div>

  {/* Truck Drivers Section */}
  <div className="bg-white rounded-lg shadow-sm border p-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-medium flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-yellow-100 text-yellow-600">
          <div className="relative">
            <User className="h-4 w-4" />
            <Truck className="h-2.5 w-2.5 absolute -bottom-1 -right-1" />
          </div>
        </div>
        Truck Drivers
      </h3>
      <ChevronDown className="h-4 w-4 text-gray-500" />
    </div>
    <ul className="space-y-2">
      <li className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
        <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
          SJ
        </div>
        <div>
          <p className="font-medium">Sarah Johnson</p>
          <p className="text-xs text-gray-500">Route A Driver</p>
        </div>
      </li>
      <li className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
        <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
          DK
        </div>
        <div>
          <p className="font-medium">David Kim</p>
          <p className="text-xs text-gray-500">Route B Driver</p>
        </div>
      </li>
    </ul>
  </div>
</div>
</div>
  );
};

export default WastePersonnel;