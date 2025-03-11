
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

interface VaccineStocksRecord {
  batchNumber: string;
  category: string;
  item: {
    antigen: string; // This is the name of the antigen
    dosage: number;
    unit: string;
  };
  qty: string;
  administered: string;
  wastedDose: string;
  availableStock: string;
  expiryDate: string;
}

interface EditVacStockFormProps {
  vaccine: VaccineStocksRecord;
}

export default function EditVacStockForm({
  vaccine,

}: EditVacStockFormProps) {
  // List of antigens with `id` and `name`
  const antigenlist = [
    { id: "covid19", name: "COVID-19 mRNA Vaccine" },
    { id: "flu", name: "Influenza Vaccine" },
    { id: "hepb", name: "Hepatitis B Vaccine" },
    { id: "SterileGloves", name: "Sterile Gloves" },
    // Add more options as needed
  ];

  // Find the initial selected antigen ID based on the vaccine's antigen name
  const initialAntigenId =
    antigenlist.find((antigen) => antigen.name === vaccine.item.antigen)?.id ||
    "";

  const form = useForm<VaccineStockType>({
    resolver: zodResolver(VaccineStocksSchema),
    defaultValues: {
      antigen: initialAntigenId, // Use the ID instead of the name
      category: vaccine.category,
      batchNumber: vaccine.batchNumber,
      volume: vaccine.item.dosage || 0,
      expiryDate: vaccine.expiryDate,
      vialBoxCount: 0,
      dosesPcsCount: 0,
    },
  });

  // Watch the category field to dynamically update the form
  const category = form.watch("category");
  const isMedicalSupply = category === "medsupplies";

  // Conditional labels based on category
  const quantityUnit = isMedicalSupply ? "pcs" : "doses";
  const containerLabel = isMedicalSupply ? "Box" : "Vial";
  const perContainerLabel = isMedicalSupply ? "Pieces per Box" : "Doses per Vial";

  const parseQuantity = (qty: string) => {
    if (isMedicalSupply) {
      const boxMatch = qty.match(/(\d+) boxes/);
      const pcsMatch = qty.match(/\((\d+) pcs\)/);
      const boxCount = boxMatch ? parseInt(boxMatch[1]) : 0;
      const totalPcs = pcsMatch ? parseInt(pcsMatch[1]) : 0;
      const pcsPerBox = boxCount > 0 ? Math.round(totalPcs / boxCount) : 0;
      return {
        vialBoxCount: boxCount,
        dosesPcsCount: pcsPerBox,
      };
    } else {
      const vialMatch = qty.match(/(\d+) vials/);
      const doseMatch = qty.match(/\((\d+) doses\)/);
      const vialCount = vialMatch ? parseInt(vialMatch[1]) : 0;
      const totalDoses = doseMatch ? parseInt(doseMatch[1]) : 0;
      const dosesPerVial =
        vialCount > 0 ? Math.round(totalDoses / vialCount) : 0;
      return {
        vialBoxCount: vialCount,
        dosesPcsCount: dosesPerVial,
      };
    }
  };

  useEffect(() => {
    const quantities = parseQuantity(vaccine.qty);
    form.reset({
      antigen: initialAntigenId, // Use the ID instead of the name
      category: vaccine.category,
      batchNumber: vaccine.batchNumber,
      volume: vaccine.item.dosage || 0,
      expiryDate: vaccine.expiryDate,
      ...quantities,
    });
  }, [vaccine, form, initialAntigenId]);

  const onSubmit = async (data: VaccineStockType) => {
   console.log(data)
   alert("success")
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
              name="antigen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isMedicalSupply ? "Item Name" : "Vaccine Name"}
                  </FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder={`Select ${
                        isMedicalSupply ? "item" : "vaccine"
                      } name`}
                      options={antigenlist}
                      value={field.value} // This should be the ID
                      onChange={field.onChange} // This will update the ID in the form state
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
                    {`Number of ${containerLabel}s`}
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
                    {perContainerLabel}
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
              {`Total ${quantityUnit}`}
            </FormLabel>
            <div className="flex items-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {totalUnits.toLocaleString()} {quantityUnit}
              <span className="ml-2 text-muted-foreground text-xs">
                ({vialBoxCount} {containerLabel.toLowerCase()}s ×{" "}
                {dosesPcsCount} {quantityUnit}/{containerLabel.toLowerCase()})
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