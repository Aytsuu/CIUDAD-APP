import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";

type Feature = {
  id: string;
  name: string;
};

const features: Feature[] = [
  { id: "profiling", name: "Profiling" },
  { id: "blotter", name: "Blotter Complaint" },
  { id: "drr-report", name: "Incident Report" },
  { id: "clearance", name: "Clearance" },
  { id: "summon", name: "Summon" },
  { id: "session-sched", name: "Session Scheduling" },
  { id: "budget-plan", name: "Budget Plan" },
  { id: "edu-grant", name: "Educational Grants" },
  { id: "waste-sched", name: "Waste Scheduling" },
  { id: "waste-report", name: "Waste Report" },
  { id: "ord-res", name: "Ordinance & Resolution" },
  { id: "income-expense", name: "Income and Expense" },
  { id: "development-plan", name: "Annual Development Plan" },
  { id: "project-proposal", name: "Project Proposal" },
  { id: "disbursement", name: "Disbursement and Monitoring" },
  { id: "donation", name: "Donation" },
  { id: "announcement", name: "Announcement" },
];

export default function FeatureSelection() {
  // State to track selected features
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, boolean>>(
    features.reduce((acc, feature) => {
      acc[feature.id] = false; // Initialize all checkboxes as unchecked
      return acc;
    }, {} as Record<string, boolean>)
  );

  // Handle checkbox change
  const handleCheckboxChange = (id: string) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the checkbox state
    }));
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {features.map((feature) => (
        <div key={feature.id} className="w-full flex items-center gap-3">
          <Checkbox
            id={feature.id}
            checked={selectedFeatures[feature.id]}
            onCheckedChange={() => handleCheckboxChange(feature.id)}
          />
          <Label htmlFor={feature.id} className="text-black/80 text-[15px] cursor-pointer">
            {feature.name}
          </Label>
        </div>
      ))}
    </div>
  );
}