// EditMedicineForm.tsx
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectLayout } from "@/components/ui/select/select-layout";
import {
  MedicineStocksSchema,
  MedicineStockType,
} from "@/form-schema/inventory/inventoryStocksSchema";
import { useEffect, useState } from "react";
import { z } from "zod";

interface EditMedicineFormProps {
  medicine: {
    id: number;
    medicineInfo: {
      medicineName: string;
      dosage: number;
      dsgUnit: string;
      form: string;
    };
    expiryDate: string;
    category: string;
    qty: string;
    availQty: string;
    distributed: string;
  };
  // onSave: (data: any) => void;
}

export default function EditMedicineForm({
  medicine,
}: // onSave,
EditMedicineFormProps) {
  const form = useForm<MedicineStockType>({
    resolver: zodResolver(MedicineStocksSchema),
    defaultValues: {
      medicineName: medicine.medicineInfo.medicineName,
      category: medicine.category,
      // id: medicine.id,
      dosage: medicine.medicineInfo.dosage,
      dsgUnit: medicine.medicineInfo.dsgUnit,
      form: medicine.medicineInfo.form,
      qty: parseInt(medicine.qty.split(" ")[0]) || 1,
      unit: medicine.qty.includes("boxes") ? "boxes" : "bottles",
      pcs: medicine.qty.includes("boxes")
        ? parseInt(medicine.qty.split("(")[1]) || 1
        : 0,
      expiryDate: medicine.expiryDate,
    },
  });

  useEffect(() => {
    form.reset({
      medicineName: medicine.medicineInfo.medicineName,
      category: medicine.category,
      // id: medicine.id,
      dosage: medicine.medicineInfo.dosage,
      dsgUnit: medicine.medicineInfo.dsgUnit,
      form: medicine.medicineInfo.form,
      qty: parseInt(medicine.qty.split(" ")[0]) || 1,
      unit: medicine.qty.includes("boxes") ? "boxes" : "bottles",
      pcs: medicine.qty.includes("boxes")
        ? parseInt(medicine.qty.split("(")[1]) || 1
        : 0,
      expiryDate: medicine.expiryDate,
    });
  }, [medicine, form]);

  const onSubmit = async (data: MedicineStockType) => {
    console.log("saved data", data);
    alert("Medicine stock updated successfully!");
  };
  const currentUnit = form.watch("unit");
  const qty = form.watch("qty") || 0;
  const pcs = form.watch("pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : 0;

  const medicineOptions = [
    { id: "Paracetamol", name: "Paracetamol" },
    { id: "Amoxicillin", name: "Amoxicillin" },
  ];

  const categoryOptions = [
    { id: "Analgesic", name: "Analgesic" },
    { id: "Antibiotic", name: "Antibiotic" },
  ];

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* // Medicine Name Field */}
            <FormField
              control={form.control}
              name="medicineName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicine Name</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Medicine"
                      options={medicineOptions}
                      value={field.value}
                      onChange={(value) => field.onChange(value)} // Ensure this passes the `id` string
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* // Category Field */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Category"
                      options={categoryOptions}
                      value={field.value}
                      onChange={(value) => field.onChange(value)} // Ensure this passes the `id` string
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosage</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dsgUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosage Unit</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Unit"
                      options={[
                        { id: "mg", name: "mg" },
                        { id: "ml", name: "ml" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="form"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Form"
                      options={[
                        { id: "tablet", name: "Tablet" },
                        { id: "capsule", name: "Capsule" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="qty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {currentUnit === "boxes" ? "Number of Boxes" : "Quantity"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      value={field.value}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(isNaN(value) ? 1 : value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Unit"
                      options={[
                        { id: "boxes", name: "Boxes" },
                        { id: "bottles", name: "Bottles" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {currentUnit === "boxes" && (
              <FormField
                control={form.control}
                name="pcs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pieces per Box</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={field.value}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.onChange(isNaN(value) ? 1 : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {currentUnit === "boxes" && (
              <FormItem className="sm:col-span-2">
                <FormLabel>Total Pieces</FormLabel>
                <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {totalPieces.toLocaleString()} pieces
                  <span className="ml-2 text-muted-foreground text-xs">
                    ({qty} boxes × {pcs} pieces/box)
                  </span>
                </div>
              </FormItem>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2">
            <Button type="submit" className="w-[120px]">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
