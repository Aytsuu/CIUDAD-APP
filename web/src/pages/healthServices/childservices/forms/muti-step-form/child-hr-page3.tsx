"use client";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button"; // Corrected import path
import {
  Calendar,
  Trash2,
  Loader2,
  Plus,
  Info,
  CheckCircle,
  AlertCircle,
  ChevronLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  VaccinesSchema,
  type VaccineType,
  type VaccineRecord,
  type ExistingVaccineRecord,
} from "@/form-schema/chr-schema/chr-schema";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api2 } from "@/api/api";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormInput } from "@/components/ui/form/form-input";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/table/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card"; // Corrected import path
import { Switch } from "@/components/ui/switch";

type Page3Props = {
  onPrevious: () => void;
  onNext: () => void;
  updateFormData: (data: Partial<VaccineType>) => void;
  formData: VaccineType;
  position: string; // Still passed, but not used for conditional rendering of forms
  mode: "addnewchildhealthrecord" | "newchildhealthrecord" | "immunization";
};

const fetchVaccinesWithStock = async () => {
  try {
    const response = await api2.get("/inventory/vaccine_stocks/");
    const stocks = response.data;
    if (!stocks || !Array.isArray(stocks)) {
      return { default: [], formatted: [] };
    }
    const availableStocks = stocks.filter((stock: any) => {
      const isExpired =
        stock.inv_details?.expiry_date &&
        new Date(stock.inv_details.expiry_date) < new Date();
      return stock.vacStck_qty_avail > 0 && !isExpired;
    });
    return {
      default: availableStocks,
      formatted: availableStocks.map((stock: any) => ({
        id: `${stock.vacStck_id.toString()},${stock.vac_id},${
          stock.vaccinelist?.vac_name || "Unknown"
        },${stock.inv_details?.expiry_date || ""}`,
        name: `${stock.vaccinelist?.vac_name || "Unknown"} (Exp: ${
          stock.inv_details?.expiry_date
            ? new Date(stock.inv_details.expiry_date).toLocaleDateString()
            : "N/A"
        })`,
        quantity: stock.vacStck_qty_avail,
      })),
    };
  } catch (error) {
    console.error("Error fetching vaccine stocks:", error);
    toast.error("Failed to load vaccine stocks");
    throw error;
  }
};

const fetchVaccineList = async () => {
  try {
    const response = await api2.get("/inventory/vac_list/");
    const vaccines = response.data;
    if (!vaccines || !Array.isArray(vaccines)) {
      return { default: [], formatted: [] };
    }
    return {
      default: vaccines,
      formatted: vaccines.map((vaccine: any) => ({
        id: `${vaccine.vac_id.toString()},${vaccine.vac_name}`,
        name: vaccine.vac_name,
      })),
    };
  } catch (error) {
    console.error("Error fetching vaccine list:", error);
    toast.error("Failed to load vaccine list");
    throw error;
  }
};

export default function ChildHRPage3({
  onPrevious,
  onNext,
  updateFormData,
  formData,
  position,
  mode,
}: Page3Props) {
  
  return (
    <div className="bg-white p-8">
      <div className="font-light text-zinc-400 flex justify-end mb-8 ">
        Page 3 of 4
      </div>

          <div className="flex justify-end items-center pt-6 gap-2 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={onPrevious}
              className="flex items-center gap-2 px-6 py-2 hover:bg-zinc-100 transition-colors duration-200 bg-transparent"
            >
                            <ChevronLeft className="h-4 w-4" />

              Previous
            </Button>
            <Button type="submit"      
                     className="flex items-center gap-2  px-6"
            >Continue

            <ChevronLeft className="h-4 w-4 rotate-180 ml-2" />

            </Button>
          </div>
    </div>
  );
}
