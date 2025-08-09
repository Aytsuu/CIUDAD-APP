import {
  fetchVaccineStockById,
  createVaccineWasteTransaction,
  updateImmunizationStockQuantity,
  createImmunizationWasteTransaction,
  fetchImzSupplyStockById,
} from "../restful-api/WastedAPI";
import { StockRecords } from "../../../tables/type";
import { isVaccine, isSupply } from "../../../tables/VaccineStocks";
import { updateVaccineStock } from "../restful-api/VaccinePutAPI";

export const useHandleWaste = () => {
  const handleVaccineWaste = async (
    record: StockRecords,
    data: { wastedAmount: number; staff_id?: string }
  ) => {
    if (!isVaccine(record)) {
      throw new Error("Invalid vaccine record");
    }

    if (!record.vacStck_id) {
      throw new Error("Missing vaccine stock ID");
    }

    const existingItem = await fetchVaccineStockById(record.vacStck_id);
    if (!existingItem) {
      throw new Error("Vaccine stock not found");
    }

    const currentQtyAvail = existingItem.vacStck_qty_avail;
    if (currentQtyAvail < data.wastedAmount) {
      throw new Error(`Cannot waste ${data.wastedAmount} doses, only ${currentQtyAvail} available`);
    }

    const unit = record.solvent === "diluent" ? "containers" : "doses";
    const newQty = currentQtyAvail - data.wastedAmount;

    await Promise.all([
      updateVaccineStock({
        vacStck_id: record.vacStck_id,
        wasted_dose: (Number(record.wastedDose || 0) + data.wastedAmount).toString(),
        vacStck_qty_avail: newQty,
      }),
      createVaccineWasteTransaction({
        vacStck_id: record.vacStck_id,
        antt_qty: `${data.wastedAmount} ${unit}`,
        antt_action: "Wasted",
        staff: data.staff_id || null,
      }),
    ]);
  };

  const handleSupplyWaste = async (
    record: StockRecords,
    data: { wastedAmount: number; staff_id?: string }
  ) => {
    if (!isSupply(record)) {
      throw new Error("Invalid supply record");
    }

    if (!record.imzStck_id) {
      throw new Error("Missing supply stock ID");
    }

    const existingItem = await fetchImzSupplyStockById(record.imzStck_id);
    if (!existingItem) {
      throw new Error("Supply stock not found");
    }

    const currentQtyAvail = existingItem.imzStck_avail;
    if (currentQtyAvail < data.wastedAmount) {
      throw new Error(`Cannot waste ${data.wastedAmount} items, only ${currentQtyAvail} available`);
    }

    const unit = record.imzStck_unit === "boxes" ? "boxes" : "pcs";
    const newAvailableStock = currentQtyAvail - data.wastedAmount;
    const newWastedItems = (existingItem.wasted_items || 0) + data.wastedAmount;

    await Promise.all([
      updateImmunizationStockQuantity({
        imzStck_id: record.imzStck_id,
        wasted_items: newWastedItems,
        imzStck_avail: newAvailableStock,
      }),
      createImmunizationWasteTransaction({
        imzStck_id: record.imzStck_id,
        imzt_qty: `${data.wastedAmount} ${unit}`,
        imzt_action: "Wasted",
        staff: data.staff_id || null,
      }),
    ]);
  };

  return { handleVaccineWaste, handleSupplyWaste };
};