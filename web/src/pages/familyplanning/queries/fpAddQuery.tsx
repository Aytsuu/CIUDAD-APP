import { api2 } from "@/api/api"

export interface InventoryItem {
  id: number
  name: string
  type: "commodity" | "medicine" | "vaccine"
  current_stock: number
  unit: string
  method_compatibility?: string[]
}

export const getInventoryByMethod = async (method: string): Promise<InventoryItem[]> => {
  try {
    const response = await api2.get(`inventory/by-method/${method}/`)
    return response.data
  } catch (error) {
    console.error("Error fetching inventory for method:", error)
    return []
  }
}

export const deductInventory = async (itemId: number, quantity: number, itemType: string) => {
  try {
    const response = await api2.post(`inventory/deduct/`, {
      item_id: itemId,
      quantity: quantity,
      item_type: itemType,
      reason: "Family Planning Service",
    })
    return response.data
  } catch (error) {
    console.error("Error deducting inventory:", error)
    throw error
  }
}
