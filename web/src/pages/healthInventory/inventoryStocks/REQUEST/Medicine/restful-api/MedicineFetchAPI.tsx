import { getMedicines } from "../../../../InventoryList/restful-api/medicine/MedicineFetchAPI";
import { useQuery } from "@tanstack/react-query";
import { showErrorToast } from "@/components/ui/toast";

export const fetchMedicines = () => {
  return useQuery({
    queryKey: ["medicines"],
    queryFn: async () => {
      try {
        const medicines = await getMedicines();

        if (!medicines || !Array.isArray(medicines)) {
          return {
            default: [],
            formatted: [],
          };
        }

        return {
          default: medicines,
          formatted: medicines.map((medicine: any) => ({
            id: `${String(medicine.med_id)},${medicine.med_name},${medicine.med_dsg}.${medicine.med_dsg_unit},${medicine.med_form}`,
            name: (
              <div className="flex items-center gap-3">
                <span>
                  <span className="bg-green-500 rounded text-white p-1 mt-2 mr-4">{medicine.med_id}</span>
                  {`${medicine.med_name} - ${medicine.med_dsg}.${medicine.med_dsg_unit}, ${medicine.med_form} ${medicine.med_name === "gc" ? "(green)" : ""}`}
                  <span className="ml-2 text-sm text-blue-600">{medicine.catlist ? `(${medicine.catlist})` : "(No Category)"}</span>
                </span>
              </div>
            ),
            rawName: medicine.med_name,
            category: medicine.catlist || "No Category",
          })),
        };
      } catch (error) {
        showErrorToast("Failed to fetch medicines data");
        throw error;
      }
    },
  });
};
