import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  VaccineStockType,
  VaccineStocksSchema,
} from "@/form-schema/inventory/stocks/inventoryStocksSchema";
import { useEffect, useState } from "react";
import { getVaccine } from "../REQUEST/Antigen/restful-api/VaccineGetAPI";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { useNavigate } from "react-router";
import { Pill, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useSubmitVaccineStock } from "../REQUEST/Antigen/queries/VaccinePostQueries";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { useBatchNumbers } from "../REQUEST/Antigen/restful-api/VaccineFetchAPI";
import { useAuth } from "@/context/AuthContext";


export default function AddVaccineStock() {

  const{user}=useAuth()
  const staff_id = user?.staff?.staff_id
  const form = useForm<VaccineStockType>({
    resolver: zodResolver(VaccineStocksSchema),
    defaultValues: {
      vac_id: "",
      batchNumber: "",
      volume: undefined,
      qty: undefined,
      expiryDate: "",
      solvent: "doses",
    },
  });

  const [vaccineOptions, setVaccineOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { mutate: submit, isPending } = useSubmitVaccineStock();
  const navigate = useNavigate();
  const solvent = form.watch("solvent");
  const vialBoxCount = form.watch("qty") || 0;
  const dosesPcsCount = form.watch("volume") || 0;
  const totalDoses = solvent === "doses" ? vialBoxCount * dosesPcsCount : null;
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const batchNumbers = useBatchNumbers();
  const [formData, setFormData] = useState<VaccineStockType | null>(null);

  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const options = await getVaccine();
        setVaccineOptions(options);
      } catch (error) {
        console.error("Error fetching vaccines:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVaccines();
  }, []);

  const isDuplicateBatchNumber = (
    stocks: { batchNumber: string }[],
    newBatchNumber: string
  ) => {
    return stocks.some(
      (stock) =>
        stock.batchNumber.trim().toLowerCase() ===
        newBatchNumber.trim().toLowerCase()
    );
  };

  const onSubmit = (data: VaccineStockType) => {
    setFormData(data);
    if (isDuplicateBatchNumber(batchNumbers, data.batchNumber)) {
      form.setError("batchNumber", {
        type: "manual",
        message: "Batch number already exists for this immunization supply",
      });
      return;
    }
    setIsAddConfirmationOpen(true);
  };

  const confirmAdd = async () => {
    if (!formData) return;
    setIsAddConfirmationOpen(false);
    submit({ data: formData, staff_id });
  };

  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white p-5 w-full max-w-[600px] rounded-sm space-y-5"
        >
          <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3 sm:py-5">
            <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            Add Vaccine Stocks
          </Label>

          <div className="space-y-6 p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                control={form.control}
                name="vac_id"
                label="Vaccine Name"
                options={vaccineOptions}
                isLoading={loading}
              />
              <FormInput
                control={form.control}
                name="batchNumber"
                label="Batch Number"
                placeholder="Batch number"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormDateTimeInput
                control={form.control}
                name="expiryDate"
                label="Expiry Date"
                type="date"
              />
              <FormSelect
                control={form.control}
                name="solvent"
                label="Solvent Type"
                options={[
                  { id: "diluent", name: "Diluent" },
                  { id: "doses", name: "Doses" },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="qty"
                label={
                  solvent === "doses"
                    ? "Number of Vials"
                    : "Number of Containers"
                }
                type="number"
              />
              {solvent === "diluent" ? (
                <FormInput
                  control={form.control}
                  name="volume"
                  label="Dosage (ml)"
                  type="number"
                />
              ) : (
                <FormInput
                  control={form.control}
                  name="volume"
                  label="Doses per Vial"
                  type="number"
                />
              )}
            </div>

            {solvent === "doses" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <Label className="text-darkGray mb-2">Total Doses</Label>
                  <div className="border rounded px-3 py-2 bg-gray-100">
                    {totalDoses?.toString() || "0"}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 bottom-0 bg-white pb-2 pt-8">
            <Button variant="outline" className="w-full" onClick={() => navigate(-1)} >
              Cancel
            </Button>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving... </> ) : ( "Save")}
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        isOpen={isAddConfirmationOpen}
        onOpenChange={setIsAddConfirmationOpen}
        onConfirm={confirmAdd}
        title="Add Vaccine Stock"
        description={`Are you sure you want to add new Stock for Vaccine?`}
      />
    </div>
  );
}
