"use client";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  VaccinesSchema,
  type VaccineType,
  type VaccineRecord,
  type ExistingVaccineRecord,
} from "@/form-schema/chr-schema/chr-schema";
import { ImmunizationTracking } from "./types";

type Page3Props = {
  onPrevious: () => void;
  onNext: () => void;
  updateFormData: (data: Partial<VaccineType>) => void;
  formData: VaccineType;
  immunizationTracking: ImmunizationTracking[];
};

export default function ChildHRPage3({
  onPrevious,
  onNext,
  immunizationTracking
}: Page3Props) {
  // Check if immunizationTracking has data
  const hasImmunizationData = immunizationTracking && immunizationTracking.length > 0;

  return (
    <div className="bg-white p-8">
      <div className="font-light text-zinc-400 flex justify-end mb-8">
        Page 3 of 4
      </div>

      <h2 className="text-lg font-semibold mb-4">Immunization History</h2>
      
      {hasImmunizationData ? (
        <div className="space-y-4">
          {immunizationTracking.map((track, index) => (
            <div key={`${track.vaccine_name}-${track.dose_number}-${index}`} 
                 className="border p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{track.vaccine_name}</span>
                <Badge variant={track.status === "completed" ? "default" : "outline"}>
                  Dose {track.dose_number}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Date: </span>
                  {track.date_administered || "Not specified"}
                </div>
                <div>
                  <span className="font-medium">Status: </span>
                  {track.status}
                </div>
                {track.batch_number && (
                  <div>
                    <span className="font-medium">Batch: </span>
                    {track.batch_number}
                  </div>
                )}
                {track.expiry_date && (
                  <div>
                    <span className="font-medium">Expiry: </span>
                    {track.expiry_date}
                  </div>
                )}
                {track.follow_up_date && (
                  <div className="col-span-2">
                    <span className="font-medium">Next follow-up: </span>
                    {track.follow_up_date} ({track.follow_up_status})
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 p-4 border rounded-lg text-center">
          No immunization records found
        </div>
      )}

      <div className="flex justify-end items-center pt-6 gap-2 border-t mt-8">
        <Button
          variant="outline"
          type="button"
          onClick={onPrevious}
          className="flex items-center gap-2 px-6 py-2 hover:bg-zinc-100 transition-colors duration-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button 
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6"
        >
          Continue
          <ChevronLeft className="h-4 w-4 rotate-180 ml-2" />
        </Button>
      </div>
    </div>
  );
}