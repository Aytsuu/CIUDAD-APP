import { formatQuantityString } from "../../FormatQuantityString";
import { addInventory } from "../../InventoryAPIQueries";
import { getMedicineInventory } from "../restful-api/MedicineGetAPI";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { MedicineStockType } from "@/form-schema/inventory/stocks/inventoryStocksSchema";
import {
  useAddMedicineInventory,
  useAddMedicineTransaction,
  MedicineTransactionType,
} from "../queries/MedicinePostQueries"; // Import your mutation hooks
import {
  useUpdateMedicineStocks,
  useUpdateInventoryTimestamp,
} from "../queries/MedicineUpdateQueries";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

export const useSubmitMedicineStock = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutateAsync: addMedicineInventoryMutation } =
    useAddMedicineInventory();
  const { mutateAsync: addMedicineTransactionMutation } =
    useAddMedicineTransaction();

  return useMutation({
    mutationFn: async ({ data, staff_id }: { data: MedicineStockType; staff_id: string }) => {
      try {
        const inv_type = "Medicine";
        const inventoryResponse = await addInventory(data, inv_type, staff_id);
        console.log("Inventory Response:", inventoryResponse);
        if (!inventoryResponse?.inv_id) {
          throw new Error("Failed to create inventory record");
        }
        const inv_id = inventoryResponse.inv_id;
        console.log("Inventory ID:", inv_id);

        if (!data.medicineID) {
          throw new Error("Medicine ID is required");
        }

        // Use the mutation for adding medicine inventory
        const medicineInventoryResponse = await addMedicineInventoryMutation({
          data,
          inv_id,
          staff: staff_id
        });

        const quantityString = formatQuantityString(
          Number(data.qty) || 0,
          data.unit,
          Number(data.pcs) || 0
        );

        const transactionPayload: MedicineTransactionType = {
          mdt_qty: quantityString,
          mdt_action: "Added",
          staff: staff_id, // You might want to get this from auth/session
          minv_id: medicineInventoryResponse.minv_id,
        };

        // Use the mutation for adding transaction
        await addMedicineTransactionMutation(transactionPayload);
        queryClient.invalidateQueries({ queryKey: ["medicineinventorylist"] });

        return;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    onSuccess: () => {
      navigate(-1);
      toast.success("Added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || "Failed to add";
      toast.error(message, {
        icon: <CircleCheck size={24} className="fill-red-500 stroke-white" />,
        duration: 2000,
      });
    },
  });
};

export const useUpdateMedicineStock = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutateAsync: updateStocksMutation } = useUpdateMedicineStocks();
  const { mutateAsync: updateTimestampMutation } =
    useUpdateInventoryTimestamp();
  const { mutateAsync: addMedicineTransactionMutation } =
    useAddMedicineTransaction();
  return useMutation({
    mutationFn: async ({
      initialData,
      data,
      staff_id
    }: {
      initialData: { id: number };
      data: any;
      staff_id:string
    }) => {
      try {
        // Fetch existing medicine data
        const inventoryList = await getMedicineInventory();
        const existingMedicine = inventoryList.find(
          (med: any) => med.minv_id === initialData.id
        );

        if (!existingMedicine) {
          throw new Error("Medicine not found in inventory");
        }

        // Calculate new quantities
        const currentMinvQtyAvail = existingMedicine.minv_qty_avail;
        let qty = existingMedicine.minv_qty;
        const currentMinvPcs = existingMedicine.minv_pcs;
        const inv_id = existingMedicine.inv_detail?.inv_id;

        let newMinvQtyAvail = currentMinvQtyAvail;

        if (data.minv_qty_unit === "boxes") {
          qty += data.minv_qty;
          newMinvQtyAvail = qty * currentMinvPcs;
        } else {
          qty += data.minv_qty;
          newMinvQtyAvail = qty;
        }

        // Use the mutation for updating medicine stocks
        await updateStocksMutation({
          id: initialData.id,
          data: {
            minv_qty: qty,
            minv_qty_avail: newMinvQtyAvail,
          },
        });

        // Update inventory timestamp if exists
        if (inv_id) {
          await updateTimestampMutation(inv_id);
        }

        // Create and add transaction
        const quantityString = formatQuantityString(
          data.minv_qty,
          data.minv_qty_unit,
          data.minv_pcs
        );

        const transactionPayload: MedicineTransactionType = {
          mdt_qty: quantityString,
          mdt_action: "Added",
          staff: staff_id, // You might want to get this from auth/session
          minv_id: initialData.id,
        };

        // Use the mutation for adding transaction
        await addMedicineTransactionMutation(transactionPayload);
        queryClient.invalidateQueries({ queryKey: ["medicineinventorylist"] });

        return;
      } catch (error) {
        console.error("Error updating medicine stock:", error);
        throw error;
      }
    },
    onSuccess: () => {
      navigate(-1);
      toast.success("Added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || "Failed to add";
      toast.error(message, {
        icon: <CircleCheck size={24} className="fill-red-500 stroke-white" />,
        duration: 2000,
      });
    },
  });
};
