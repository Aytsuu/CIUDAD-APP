import { useMutation } from "@tanstack/react-query";
import {
  fetchVaccineStockById,
  createVaccineWasteTransaction,
  updateImmunizationStockQuantity,
  createImmunizationWasteTransaction,
  fetchImzSupplyStockById,
} from "../restful-api/WastedAPI";
import { updateVaccineStock } from "../restful-api/VaccinePutAPI";

// Vaccine Stock Mutations
export const useFetchVaccineStockById = () => {
  return useMutation({
    mutationFn: (vacStck_id: number) => fetchVaccineStockById(vacStck_id),
    onError: (error: Error) => {
      console.error("Error fetching vaccine stock:", error.message);
    },
  });
};

export const useFetchImzSupplyById = () => {
  return useMutation({
    mutationFn: (imzStck_id: number) => fetchImzSupplyStockById(imzStck_id),
    onError: (error: Error) => {
      console.error("Error fetching vaccine stock:", error.message);
    },
  });
};

export const useUpdateVaccineStockQuantity = () => {
  return useMutation({
    mutationFn: (data: Record<string, any> ) =>
      updateVaccineStock({data}),
    onError: (error: Error) => {
      console.error("Error updating vaccine stock quantity:", error.message);
    },
  });
};

export const useCreateVaccineWasteTransaction = () => {
  return useMutation({
    mutationFn: ({
      vacStck_id,
      wastedAmount,
      unit,
    }: {
      vacStck_id: number;
      wastedAmount: number;
      unit: "doses" | "containers";
    }) => createVaccineWasteTransaction(vacStck_id, wastedAmount, unit),
    onError: (error: Error) => {
      console.error("Error creating vaccine waste transaction:", error.message);
    },
  });
};

// Immunization Stock Mutations
export const useUpdateImmunizationStockQuantity = () => {
  return useMutation({
    mutationFn: ({
      imzStck_id,
      wasted_items,
      imzStck_avail,
    }: {
      imzStck_id: number;
      wasted_items: number;
      imzStck_avail: number;
    }) =>
      updateImmunizationStockQuantity(imzStck_id, wasted_items, imzStck_avail),
    onError: (error: Error) => {
      console.error(
        "Error updating immunization stock quantity:",
        error.message
      );
    },
  });
};

export const useCreateImmunizationWasteTransaction = () => {
  return useMutation({
    mutationFn: ({
      imzStck_id,
      wastedAmount,
      unit,
    }: {
      imzStck_id: number;
      wastedAmount: number;
      unit: "pcs" | "boxes";
    }) => createImmunizationWasteTransaction(imzStck_id, wastedAmount, unit),
    onError: (error: Error) => {
      console.error(
        "Error creating immunization waste transaction:",
        error.message
      );
    },
  });
};

import { StockRecords } from "../../../tables/type";
import { isVaccine, isSupply } from "../../../tables/VaccineStocks";

export const useHandleWaste = () => {
  const { mutateAsync: fetchVaccineStock } = useFetchVaccineStockById();
  const { mutateAsync: updateVaccineStock } = useUpdateVaccineStockQuantity();
  const { mutateAsync: createVaccineWaste } =
    useCreateVaccineWasteTransaction();
  // const { mutateAsync: updateImmunizationStock } =
  //   useUpdateImmunizationStockQuantity();
  const { mutateAsync: createImmunizationWaste } =
    useCreateImmunizationWasteTransaction();

  const handleVaccineWaste = async (
    record: StockRecords,
    wastedAmount: number
  ) => {
    if (!isVaccine(record)) return;

    const existingItem = await fetchVaccineStock(record.vacStck_id);
    if (!existingItem) {
      throw new Error("Vaccine item not found. Please check the ID.");
    }

    const currentQtyAvail = existingItem.vacStck_qty_avail;

    if (currentQtyAvail === 0) {
      throw new Error("Current quantity available is 0.");
    }
    if (wastedAmount > currentQtyAvail) {
      throw new Error("Cannot use more items than available.");
    }

    const newQty = currentQtyAvail - wastedAmount;
    const unit = record.solvent === "diluent" ? "containers" : "doses";

    await updateVaccineStock({
      vacStck_id: record.vacStck_id,
      wasted_dose:
        (record.wastedDose ? parseInt(record.wastedDose) : 0) + wastedAmount,
      vacStck_qty_avail: newQty,
    });

    await createVaccineWaste({
      vacStck_id: record.vacStck_id,
      wastedAmount,
      unit,
    });
  };

  const handleSupplyWaste = async (
    record: StockRecords,
    wastedAmount: number
  ) => {
    if (!isSupply(record)) return;

    const existingItem = await fetchImzSupplyStockById(record.imzStck_id);
    if (!existingItem) {
      throw new Error("Immunization item not found. Please check the ID.");
    }
    const currentQtyAvail = existingItem.imzStck_avail;
    const existingWastedItems = existingItem.wasted_items;

    if (currentQtyAvail === 0) {
      throw new Error("Current quantity available is 0.");
    }
    if (wastedAmount > currentQtyAvail) {
      throw new Error("Cannot waste more items than available.");
    }

    const transactionUnit = record.imzStck_unit === "boxes" ? "pcs" : "pcs";
    let piecesToDeduct = wastedAmount;

    // Calculate new values
    const newWastedItems = existingWastedItems + wastedAmount;
    const newAvailableStock = currentQtyAvail - wastedAmount;

    const updatePayload: {
      wasted_items: number;
      imzStck_avail: number;
    } = {
      wasted_items: newWastedItems, // Updated wasted items (existing + new)
      imzStck_avail: newAvailableStock,
    };

    if (record.imzStck_unit === "boxes") {
      const pcsPerBox = record.imzStck_pcs || 0;
      piecesToDeduct = wastedAmount * pcsPerBox;
    }

    // Update the stock
    await updateImmunizationStockQuantity(
      record.imzStck_id,
      updatePayload.wasted_items,
      updatePayload.imzStck_avail
    );

    // Create waste record
    await createImmunizationWaste({
      imzStck_id: record.imzStck_id,
      wastedAmount,
      unit: transactionUnit,
    });
  };

  return { handleVaccineWaste, handleSupplyWaste };
};
