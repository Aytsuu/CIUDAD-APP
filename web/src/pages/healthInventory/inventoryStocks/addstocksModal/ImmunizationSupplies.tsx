import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { getSupplies } from "../REQUEST/Antigen/restful-api/ImzGetAPI";
import {
  ImmunizationSuppliesSchema,
  ImmunizationSuppliesType,
} from "@/form-schema/inventory/stocks/inventoryStocksSchema";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { useSubmitImmunizationStock } from "../REQUEST/Antigen/queries/ImzSupplyPostQueries";
import { Link } from "react-router";
import { Label } from "@/components/ui/label";
import { Pill } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useBatchNumbers } from "../REQUEST/Antigen/restful-api/ImzGetAPI";
import { useAuth } from "@/context/AuthContext";
import { Combobox } from "@/components/ui/combobox";

export default function AddImzSupplyStock() {
  const { user } = useAuth();
  const staff = user?.staff?.staff_id || "";
  
  const form = useForm<ImmunizationSuppliesType>({
    resolver: zodResolver(ImmunizationSuppliesSchema),
    defaultValues: {
      imz_id: "",
      batch_number: "",
      imzStck_qty: 0,
      imzStck_pcs: 0,
      imzStck_unit: "boxes",
      expiry_date: "",
      inv_type:"Antigen",
      staff: staff ,
    },
  });

  const [supplyOptions, setSupplyOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [formData, setFormData] = useState<ImmunizationSuppliesType | null>(
    null
  );
  
  const currentUnit = form.watch("imzStck_unit");
  const qty = form.watch("imzStck_qty");
  const pcs = form.watch("imzStck_pcs");
  const totalPieces = currentUnit === "boxes" ? qty * (pcs || 0) : qty;
  
  const { mutate: submit, isPending } = useSubmitImmunizationStock();
  const { batchNumbers, isLoading: isBatchNumbersLoading } = useBatchNumbers();

  useEffect(() => {
    const fetchSupplies = async () => {
      try {
        const options = await getSupplies();
        setSupplyOptions(options);
      } catch (error) {
        console.error("Error fetching supplies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSupplies();
  }, []);

  const isDuplicateBatchNumber = (
    stocks: { batchNumber: string }[],
    newBatchNumber: string
  ) => {
    return stocks.some(
      (stock) =>
        stock.batchNumber.trim().toLowerCase() === newBatchNumber.trim().toLowerCase()
    );
  };

  const onSubmit = (data: ImmunizationSuppliesType) => {
    setFormData(data);
    if (isDuplicateBatchNumber(batchNumbers, data.batch_number)) {
      form.setError("batch_number", {
        type: "manual",
        message: "Batch number already exists for this immunization supply",
      });
      return;
    }
    setIsConfirmationOpen(true);
  };

  const handleConfirm = () => {
    if (!formData) return;
    setIsConfirmationOpen(false);
    submit({ data: formData });
  };

  return (
    <>
      <div className="w-full flex items-center justify-center p-4 sm:p-4">
        <Form {...form}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="bg-white p-5 w-full max-w-[600px] rounded-sm space-y-5"
          >
            <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3 sm:py-5">
              <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Add Immunization Supply Stocks
            </Label>
            <div className="space-y-6 p-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Immunization Supply Combobox */}
                <div className="mt-2">
                  <Label className="block mb-2 text-black/70">Immunization Supply</Label>
                  <div className="relative">
                    <Combobox
                      options={supplyOptions || []}
                      value={form.watch("imz_id")}
                      onChange={(value) => form.setValue("imz_id", value)}
                      placeholder={loading ? "Loading supplies..." : "Select immunization supply"}
                      emptyMessage="No available supplies"
                      triggerClassName="w-full"
                    />
                  </div>
                </div>
                <FormInput
                  control={form.control}
                  name="batch_number"
                  label="Batch Number"
                  placeholder="Batch number"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  control={form.control}
                  name="imzStck_qty"
                  label={
                    currentUnit === "boxes"
                      ? "Number of Boxe/s"
                      : "Quantity (pc/s)"
                  }
                  type="number"
                  placeholder="Quantity"
                />
                <FormSelect
                  control={form.control}
                  name="imzStck_unit"
                  label="Unit"
                  options={[
                    { id: "boxes", name: "Boxes" },
                    { id: "pcs", name: "Pieces" },
                  ]}
                />
              </div>
              {currentUnit === "boxes" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    control={form.control}
                    name="imzStck_pcs"
                    label="Pieces per Box"
                    placeholder="Pieces per box"
                    type="number"
                  />
                  <div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none">
                        Total Pieces
                      </label>
                      <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {totalPieces.toLocaleString()} pc/s
                        {currentUnit === "boxes" && (
                          <span className="ml-2 text-muted-foreground text-xs">
                            ({qty} boxe/s × {pcs} pc/s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormDateTimeInput
                  control={form.control}
                  name="expiry_date"
                  label="Expiry Date"
                  type="date"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 bottom-0 bg-white pb-2 pt-8">
              <Button variant="outline" className="w-full">
                <Link to="/mainInventoryStocks">Cancel</Link>
              </Button>
              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
                onClick={form.handleSubmit(onSubmit)}
              >
                {isPending || loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        onConfirm={handleConfirm}
        title="Add Immunization Stock"
        description="Are you sure you want to add this immunization stock?"
      />
    </>
  );
}