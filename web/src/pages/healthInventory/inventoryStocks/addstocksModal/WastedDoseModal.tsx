import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { api } from "@/pages/api/api";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
import { useState } from "react";
import { isVaccine, isSupply } from "../tables/VaccineStocks";
import { StockRecords } from "../tables/type";
import { useLocation } from "react-router";
import { Pill } from "lucide-react";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  wastedDose: z
    .number()
    .min(1, "Wasted dose must be at least 1")
    .int("Must be a whole number"),
});


export default function WastedAntigen() {
  const location = useLocation();
  const { wasted, record } = location.state;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(
    null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wastedDose: 0,
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setFormData(data);
    setIsConfirmationOpen(true);
  };

  const handleConfirm = async () => {
    if (!formData) return;

    try {
      setIsSubmitting(true);

      if (isVaccine(record)) {
        await handleVaccineWaste(record, formData.wastedDose);
      } else if (isSupply(record)) {
        await handleSupplyWaste(record, formData.wastedDose);
      }

      alert("Wasted dose recorded successfully");
      form.reset();
    } catch (error: any) {
      console.error("Error recording wasted dose:", error);
      alert(
        `Failed to record wasted dose: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsSubmitting(false);
      setIsConfirmationOpen(false);
    }
  };

  const handleVaccineWaste = async (
    record: StockRecords,
    wastedAmount: number
  ) => {
    if (!isVaccine(record)) return;

    const inventoryList = await api.get("inventory/vaccine_stocks/");

    const existingItem = inventoryList.data.find(
      (item: any) => item.vacStck_id === record.vacStck_id
    );
    if (!existingItem) {
      throw new Error("Vaccine item not found. Please check the ID.");
    }
    const currentQtyAvail = existingItem.vacStck_qty_avail;
    const existingUsedItem = existingItem.vacStck_used;

    let newUsedItem = 0;
    let newQty = 0;
    if (currentQtyAvail === 0) {
      throw new Error("Current quantity available is 0.");
    } else if (wastedAmount > currentQtyAvail) {
      throw new Error("Cannot use more items than available.");
    } else {
      newQty = currentQtyAvail - wastedAmount;
      newUsedItem = existingUsedItem + wastedAmount;
    }

    const unit = record.solvent === "diluent" ? "containers" : "doses";
    const updatePayload = {
      wasted_dose:
        (record.wastedDose ? parseInt(record.wastedDose) : 0) + wastedAmount,
      vacStck_qty_avail: newQty,
      vacStck_used: newUsedItem,
    };

    await api.put(
      `inventory/vaccine_stocks/${record.vacStck_id}/`,
      updatePayload
    );

    const transactionPayload = {
      antt_qty: `${wastedAmount} ${unit}`,
      antt_action: "Wasted",
      staff: 0,
      vacStck_id: record.vacStck_id,
    };

    await api.post("inventory/antigens_stocks/", transactionPayload);
  };

  const handleSupplyWaste = async (
    record: StockRecords,
    wastedAmount: number
  ) => {
    if (!isSupply(record)) return;

    // Determine the unit for display (boxes or pcs)
    const displayUnit = record.imzStck_unit === "boxes" ? "boxes" : "pcs";
    // For transaction, always use pcs if the unit is boxes
    const transactionUnit = record.imzStck_unit === "boxes" ? "pcs" : "pcs";

    let piecesToDeduct = wastedAmount;
    let updatePayload: any = {
      wasted_items:
        (record.wastedDose ? parseInt(record.wastedDose) : 0) + wastedAmount,
      imzStck_avail: record.availableStock - wastedAmount,
    };

    if (record.imzStck_unit === "boxes") {
      const pcsPerBox = record.imzStck_per_pcs || 1;
      piecesToDeduct = wastedAmount * pcsPerBox;
      if ("imzStck_pcs" in record) {
        updatePayload.imzStck_pcs =
          (Number(record.imzStck_pcs) || 0) - piecesToDeduct;
      }
    }

    await api.put(
      `inventory/immunization_stock/${record.imzStck_id}/`,
      updatePayload
    );

    // Calculate the quantity for transaction

    const transactionPayload = {
      imzt_qty: `${wastedAmount} ${transactionUnit}`,
      imzt_action: "Wasted",
      staff: 0,
      imzStck_id: record.imzStck_id,
    };

    await api.post("inventory/imz_transaction/", transactionPayload);
  };



  const getFormLabel = () => {
    if (isVaccine(record)) {
      return "Wasted (enter doses)";
    } else {
      return `Wasted (enter pcs)`;
    }
  };

  const getConfirmationMessage = (amount: number) => {
    if (isVaccine(record)) {
      const unit = record.solvent === "diluent" ? "containers" : "doses";
      return `Are you sure you want to record ${amount} ${unit}?`;
    } else {
      if (record.imzStck_unit === "boxes") {
        const pcsPerBox = record.imzStck_per_pcs || 1;
        return `Are you sure you want to record ${amount} boxes (${
          amount * pcsPerBox
        } pcs)?`;
      }
      return `Are you sure you want to record ${amount} pcs?`;
    }
  };

  return (
    <>
      <div className="w-full flex items-center justify-center p-4 sm:p-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="bg-white p-5 w-full max-w-[500px] rounded-sm space-y-5"
          >
             <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3 sm:py-5">
            <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            Add First Aid Stocks
          </Label>
            <div>
              <FormField
                control={form.control}
                name="wastedDose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getFormLabel()}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={getFormLabel()
                          .replace("Wasted (", "Enter ")
                          .replace(")", "")}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : parseInt(value, 10)
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full flex justify-end mt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        onConfirm={handleConfirm}
        title="Confirm Wasted Dose"
        description={
          formData ? getConfirmationMessage(formData.wastedDose) : ""
        }
      />
    </>
  );
}
