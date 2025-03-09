// EditVacStockForm.tsx
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
  VaccineStockType,
  VaccineStocksSchema,
} from "@/form-schema/inventory/inventoryStocksSchema";
import { useEffect } from "react";

type VaccineStocksRecord = {
  batchNumber: string;
  category: string;
  item: {
    name: string;
    dosage?: number;
    unit?: string;
  };
  qty: string;
  administered: string;
  wastedDose: string;
  availableStock: string;
  expiryDate: string;
};

interface EditVacStockFormProps {
  vaccine: VaccineStocksRecord;
  onSave: (updatedVaccine: VaccineStocksRecord) => void;
}

export default function EditVacStockForm({
  vaccine,
  onSave,
}: EditVacStockFormProps) {
  const isMedicalSupply = vaccine.category === "medsupplies";

  const parseQuantity = (qty: string) => {
    if (isMedicalSupply) {
      const boxMatch = qty.match(/(\d+) boxes/);
      const pcsMatch = qty.match(/(\d+) pcs/);
      return {
        vialBoxCount: boxMatch ? parseInt(boxMatch[1]) : 0,
        dosesPcsCount: pcsMatch ? parseInt(pcsMatch[1]) : 0,
      };
    } else {
      const vialMatch = qty.match(/(\d+) vials/);
      const doseMatch = qty.match(/(\d+) doses/);
      return {
        vialBoxCount: vialMatch ? parseInt(vialMatch[1]) : 0,
        dosesPcsCount: doseMatch ? parseInt(doseMatch[1]) : 0,
      };
    }
  };

  const form = useForm<VaccineStockType>({
    resolver: zodResolver(VaccineStocksSchema),
    defaultValues: {
      vaccineName: vaccine.item.name,
      category: vaccine.category,
      batchNumber: vaccine.batchNumber,
      volume: vaccine.item.dosage || 0,
      expiryDate: vaccine.expiryDate,
      ...parseQuantity(vaccine.qty),
    },
  });

  useEffect(() => {
    const quantities = parseQuantity(vaccine.qty);
    form.reset({
      vaccineName: vaccine.item.name,
      category: vaccine.category,
      batchNumber: vaccine.batchNumber,
      volume: vaccine.item.dosage || 0,
      expiryDate: vaccine.expiryDate,
      ...quantities,
    });
  }, [vaccine, form]);

  const onSubmit = async (data: VaccineStockType) => {
    try {
      console.log("Form submission data:", data);

      const isValid = await form.trigger();
      if (!isValid) {
        console.log("Form validation failed");
        return;
      }

      // Handle empty values before validation
      const submissionData = {
        ...data,
        vialBoxCount: data.vialBoxCount || 0,
        dosesPcsCount: data.dosesPcsCount || 0,
        volume: data.volume || 0,
      };

      console.log("Processed submission data:", submissionData);

      const validatedData = VaccineStocksSchema.parse(submissionData);
      console.log("Validated data:", validatedData);

      const qty = isMedicalSupply
        ? `${validatedData.vialBoxCount} boxes (${
            validatedData.vialBoxCount * validatedData.dosesPcsCount
          } pcs)`
        : `${validatedData.vialBoxCount} vials (${
            validatedData.vialBoxCount * validatedData.dosesPcsCount
          } doses)`;

      const updatedVaccine: VaccineStocksRecord = {
        ...vaccine,
        batchNumber: validatedData.batchNumber,
        item: {
          ...vaccine.item,
          name: validatedData.vaccineName,
          ...(isMedicalSupply
            ? {}
            : {
                dosage: validatedData.volume,
                unit: "ml",
              }),
        },
        qty,
        expiryDate: validatedData.expiryDate,
      };

      console.log("Saving updated vaccine:", updatedVaccine);
      onSave(updatedVaccine);
      alert("Successfully saved changes!"); // Success alert
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Update failed. Please check the form.");
    }
  };

  const vialBoxCount = form.watch("vialBoxCount") || 0;
  const dosesPcsCount = form.watch("dosesPcsCount") || 0;
  const totalUnits = vialBoxCount * dosesPcsCount;

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="vaccineName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isMedicalSupply ? "Item Name" : "Vaccine Name"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={`Enter ${
                        isMedicalSupply ? "item" : "vaccine"
                      } name`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="batchNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter batch number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      options={[
                        { id: "vaccine", name: "Vaccine" },
                        { id: "medsupplies", name: "Medical Supplies" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isMedicalSupply && (
              <FormField
                control={form.control}
                name="volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage Volume (ml)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="vialBoxCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isMedicalSupply ? "Number of Boxes" : "Number of Vials"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dosesPcsCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isMedicalSupply ? "Units per Box (pcs)" : "Doses per Vial"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormItem>
            <FormLabel>
              {isMedicalSupply ? "Total Pieces" : "Total Doses"}
            </FormLabel>
            <div className="flex items-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {totalUnits.toLocaleString()} {isMedicalSupply ? "pcs" : "doses"}
              <span className="ml-2 text-muted-foreground text-xs">
                ({vialBoxCount} {isMedicalSupply ? "boxes" : "vials"} ×{" "}
                {dosesPcsCount} {isMedicalSupply ? "pcs/box" : "doses/vial"})
              </span>
            </div>
          </FormItem>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2">
            <Button type="submit" className="w-[120px]">
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
