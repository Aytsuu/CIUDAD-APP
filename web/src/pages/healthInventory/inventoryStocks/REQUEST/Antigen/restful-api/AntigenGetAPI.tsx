import { api } from "@/api/api";

export const getCombinedStock = async () => {
    try {
      const [vaccineStocks, supplyStocks, vaccines, supplies, inventory] =
        await Promise.all([
          api.get("inventory/vaccine_stocks/"),
          api.get("inventory/immunization_stock/"),
          api.get("inventory/vac_list/"),
          api.get("inventory/imz_supplies/"),
          api.get("inventory/inventorylist/"),
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
          wastedDose: stock.wasted_doses?.toString() || "0",
          availableStock: stock.vacStck_qty_avail,
          expiryDate: inventoryData?.expiry_date,
          solvent: stock.solvent,
          inv_id: stock.inv_id,
          dose_ml: stock.dose_ml,
          vacStck_id: stock.vacStck_id,
          dosesPerVial: dosesPerVial,
          vac_id: stock.vac_id,
        };
      });
  
      const supplyData = supplyStocks.data.map((stock: any) => {
        const supply = supplies.data.find((s: any) => s.imz_id === stock.imz_id);
        const inventoryData = inventory.data.find(
          (i: any) => i.inv_id === stock.inv_id
        );
  
        const pcsPerBox = stock.imzStck_per_pcs || 1;
        const totalPcs = stock.imzStck_pcs || stock.imzStck_qty * pcsPerBox;
  
        let qtyDisplay;
        if (stock.imzStck_unit === "pcs") {
          qtyDisplay = `${totalPcs} pcs`;
        } else {
          qtyDisplay = `${stock.imzStck_qty} ${stock.imzStck_unit} (${totalPcs} pcs)`;
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
          imzStck_per_pcs: pcsPerBox,
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
  