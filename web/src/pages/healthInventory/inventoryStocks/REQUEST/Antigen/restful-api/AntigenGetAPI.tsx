import { api2 } from "@/api/api";

export const getCombinedStock = async () => {
  try {
    const [vaccineStocks, supplyStocks, vaccines, supplies, inventory] =
      await Promise.all([
        api2.get("inventory/vaccine_stocks/"),
        api2.get("inventory/immunization_stock/"),
        api2.get("inventory/vac_list/"),
        api2.get("inventory/imz_supplies/"),
        api2.get("inventory/inventorylist/"),
      ]);

    const vaccineData = vaccineStocks.data.map((stock: any) => {
      const vaccine = vaccines.data.find((v: any) => v.vac_id === stock.vac_id);
      const inventoryData = inventory.data.find(
        (i: any) => i.inv_id === stock.inv_id
      );

      const dosesPerVial = stock.dose_ml;
      const totalDoses = dosesPerVial * stock.qty;

      if (stock.solvent === "diluent") {
        return {
          type: "vaccine" as const,
          id: stock.vacStck_id,
          batchNumber: stock.batch_number,
          category: "vaccine",
          item: {
            antigen: vaccine?.vac_name || "Unknown Vaccine",
            dosage: stock.volume,
            unit: "container",
          },
          qty: `${stock.qty} containers`,
          administered: `${stock.vacStck_used} containers`,
          wastedDose: stock.wasted_doses?.toString() || "0",
          availableStock: stock.vacStck_qty_avail,
          expiryDate: inventoryData?.expiry_date,
          inv_id: stock.inv_id,
          solvent: stock.solvent,
          volume: stock.volume,
          vacStck_id: stock.vacStck_id,
          vac_id: stock.vac_id,
          qty_number: stock.qty,
          isArchived: stock.inv_details?.is_Archived, // Added property

        };
      }

      return {
        type: "vaccine" as const,
        id: stock.vacStck_id,
        batchNumber: stock.batch_number,
        category: "Vaccine",
        item: {
          antigen: vaccine?.vac_name || "Unknown Vaccine",
          dosage: stock.dose_ml,
          unit: "ml",
        },
        qty: `${stock.qty} vials (${totalDoses} doses)`,
        administered: `${stock.vacStck_used} doses`,
        wastedDose: stock.wasted_dose?.toString() || "0",
        availableStock: stock.vacStck_qty_avail,
        expiryDate: inventoryData?.expiry_date,
        solvent: stock.solvent,
        inv_id: stock.inv_id,
        dose_ml: stock.dose_ml,
        vacStck_id: stock.vacStck_id,
        dosesPerVial: dosesPerVial,
        vac_id: stock.vac_id,
        qty_number: stock.qty,
        isArchived: stock.inv_details?.is_Archived, // Added property

      };
    });

    const supplyData = supplyStocks.data.map((stock: any) => {
      const supply = supplies.data.find((s: any) => s.imz_id === stock.imz_id);
      const inventoryData = inventory.data.find(
        (i: any) => i.inv_id === stock.inv_id
      );

      const totalPcs = Number(stock.imzStck_qty) * Number(stock.imzStck_pcs);

      let qtyDisplay;
      if (stock.imzStck_unit === "pcs") {
        qtyDisplay = `${stock.imzStck_qty} pc/s`;
      } else {
        qtyDisplay = `${stock.imzStck_qty} boxes ${totalPcs} /)`;
      }

      return {
        type: "supply" as const,
        id: stock.imzStck_id,
        batchNumber: stock.batch_number || "N/A",
        category: "Immunization Supplies",
        item: {
          antigen: supply?.imz_name || "Unknown Supply",
          dosage: 1,
          unit: stock.imzStck_unit,
        },
        qty: qtyDisplay,
        administered: `${stock.imzStck_used} pcs`,
        wastedDose: stock.wasted_items?.toString() || "0",
        availableStock: stock.imzStck_avail,
        expiryDate: inventoryData?.expiry_date || "N/A",
        inv_id: stock.inv_id,
        imz_id: stock.imz_id,
        imzStck_id: stock.imzStck_id,
        imzStck_unit: stock.imzStck_unit,
        imzStck_used: stock.imzStck_used || 0,
        imzStck_pcs: stock.imzStck_pcs,
        qty_number: stock.imzStck_qty,
        isArchived: stock.inv_detail?.is_Archived, // Added property


      };
    });
    console.log("Vaccine Data:", vaccineData);
    console.log("Supply Data:", supplyData);

    return [...vaccineData, ...supplyData].sort((a, b) => b.id - a.id);
  } catch (err) {
    console.error("Error fetching combined stock data:", err);
    throw err;
  }
};
