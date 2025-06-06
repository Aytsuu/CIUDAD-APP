// src/api/vaccineMutations.ts
import { useMutation,useQueryClient } from "@tanstack/react-query";
import { 
  getVaccineStock, 
  updateVaccineStock, 
  addVaccineTransaction 
} from "../restful-api/WastedAPI";

import { StockRecords } from "../type";




// src/api/supplyMutations.ts
import { 
  updateSupplyStock, 
  addSupplyTransaction 
} from "../restful-api/WastedAPI";

export const useUpdateSupplyStock = () => {
  return useMutation({
    mutationFn: ({
      imzStck_id,
      wasted_items,
      imzStck_avail,
      imzStck_pcs,
    }: {
      imzStck_id: number;
      wasted_items: number;
      imzStck_avail: number;
      imzStck_pcs?: number;
    }) => updateSupplyStock(imzStck_id, wasted_items, imzStck_avail, imzStck_pcs),
    onError: (error: Error) => {
      console.error("Error updating supply stock:", error.message);
    },
  });
};

export const useAddSupplyTransaction = () => {
  return useMutation({
    mutationFn: ({
      imzt_qty,
      staffId,
      imzStck_id,
    }: {
      imzt_qty: string;
      staffId: number;
      imzStck_id: number;
    }) => addSupplyTransaction(imzt_qty, staffId, imzStck_id),
    onError: (error: Error) => {
      console.error("Error adding supply transaction:", error.message);
    },
  });
};





export const useSubmitSupplyWaste = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: updateStock } = useUpdateSupplyStock();
  const { mutateAsync: addTransaction } = useAddSupplyTransaction();

  return useMutation({
    mutationFn: async ({
      record,
      wastedAmount,
      staffId = 0, // Default to 0 if not provided
    }: {
      record: StockRecords;
      wastedAmount: number;
      staffId?: number;
    }) => {
      if (!isSupply(record)) {
        throw new Error("Invalid supply record");
      }

      // 1. Determine units and calculate values
      const transactionUnit = record.imzStck_unit === "boxes" ? "pcs" : "pcs";
      let piecesToDeduct = wastedAmount;
      let imzStck_pcs: number | undefined;

      // 2. Handle box conversion if needed
      if (record.imzStck_unit === "boxes") {
        const pcsPerBox = record.imzStck_per_pcs || 1;
        piecesToDeduct = wastedAmount * pcsPerBox;
        if ("imzStck_pcs" in record) {
          imzStck_pcs = (Number(record.imzStck_pcs) || 0) - piecesToDeduct;
        }
      }

      // 3. Update supply stock
      await updateStock({
        imzStck_id: record.imzStck_id,
        wasted_items: (record.wastedDose ? parseInt(record.wastedDose) : 0) + wastedAmount,
        imzStck_avail: record.availableStock - wastedAmount,
        imzStck_pcs
      });

      // 4. Add transaction
      await addTransaction({
        imzt_qty: `${wastedAmount} ${transactionUnit}`,
        staffId,
        imzStck_id: record.imzStck_id
      });

      return { success: true };
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["supplyStocks"] });
      queryClient.invalidateQueries({ queryKey: ["supplyTransactions"] });
    },
    onError: (error: Error) => {
      console.error("Supply waste error:", error.message);
    },
  });
};

function isSupply(record: StockRecords): boolean {
    return (
        "imzStck_id" in record &&
        "imzStck_unit" in record &&
        "availableStock" in record &&
        typeof record.imzStck_id === "number" &&
        typeof record.imzStck_unit === "string" &&
        typeof record.availableStock === "number"
    );
}



export const useGetVaccineStock = () => {
  return useMutation({
    mutationFn: getVaccineStock,
    onError: (error: Error) => {
      console.error("Error fetching vaccine stock:", error.message);
    },
  });
};

export const useUpdateVaccineStock = () => {
  return useMutation({
    mutationFn: ({
      vacStck_id,
      wasted_dose,
      vacStck_qty_avail,
      vacStck_used,
    }: {
      vacStck_id: number;
      wasted_dose: number;
      vacStck_qty_avail: number;
      vacStck_used: number;
    }) => updateVaccineStock(vacStck_id, wasted_dose, vacStck_qty_avail, vacStck_used),
    onError: (error: Error) => {
      console.error("Error updating vaccine stock:", error.message);
    },
  });
};

export const useAddVaccineTransaction = () => {
  return useMutation({
    mutationFn: ({
      antt_qty,
      staffId,
      vacStck_id,
    }: {
      antt_qty: string;
      staffId: number;
      vacStck_id: number;
    }) => addVaccineTransaction(antt_qty, staffId, vacStck_id),
    onError: (error: Error) => {
      console.error("Error adding vaccine transaction:", error.message);
    },
  });
};

export const useSubmitVaccineWaste = () => {
    const queryClient = useQueryClient();
    const { mutateAsync: fetchVaccineStock } = useGetVaccineStock();
    const { mutateAsync: updateStock } = useUpdateVaccineStock();
    const { mutateAsync: addTransaction } = useAddVaccineTransaction();

    return useMutation({
        mutationFn: async ({
            record,
            wastedAmount,
            staffId = 0,
        }: {
            record: StockRecords;
            wastedAmount: number;
            staffId?: number;
        }) => {
            if (!isVaccine(record)) {
                throw new Error("Invalid vaccine record");
            }

            const inventoryList = await fetchVaccineStock();
            const existingItem = inventoryList.data.find(
                (item: any) => item.vacStck_id === record.vacStck_id
            );
            
            if (!existingItem) {
                throw new Error("Vaccine item not found. Please check the ID.");
            }

            const currentQtyAvail = existingItem.vacStck_qty_avail;
            const existingUsedItem = existingItem.vacStck_used;

            if (currentQtyAvail === 0) {
                throw new Error("Current quantity available is 0.");
            }
            if (wastedAmount > currentQtyAvail) {
                throw new Error("Cannot waste more items than available.");
            }

            const newQty = currentQtyAvail - wastedAmount;
            const newUsedItem = existingUsedItem + wastedAmount;
            const unit = record.solvent === "diluent" ? "containers" : "doses";

            await updateStock({
                vacStck_id: record.vacStck_id,
                wasted_dose: (record.wastedDose ? parseInt(record.wastedDose) : 0) + wastedAmount,
                vacStck_qty_avail: newQty,
                vacStck_used: newUsedItem
            });

            await addTransaction({
                antt_qty: `${wastedAmount} ${unit}`,
                staffId,
                vacStck_id: record.vacStck_id
            });

            return { success: true };
        },
        onSuccess: () => {  
            queryClient.invalidateQueries({ queryKey: ["vaccineStocks"] });
            queryClient.invalidateQueries({ queryKey: ["vaccineTransactions"] });
        }
        ,
        onError: (error: Error) => {
            console.error("Vaccine waste error:", error.message);
        },
});
}

function isVaccine(record: StockRecords): boolean {
    return (
        "vacStck_id" in record &&
        "vacStck_qty_avail" in record &&
        "vacStck_used" in record &&
        typeof record.vacStck_id === "number" &&
        typeof record.vacStck_qty_avail === "number" &&
        typeof record.vacStck_used === "number"
    );
}

