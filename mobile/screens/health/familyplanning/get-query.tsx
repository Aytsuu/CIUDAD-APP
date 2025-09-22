import { useQuery} from "@tanstack/react-query";
import { getPatientByResidentId } from "../animalbites/api/get-api";
import { getFPRecordsByPatientId } from "./get-api";
import { useState, useEffect } from "react"
import { api2 } from "@/api/api"

export const usePatientByResidentId = (rp_id: string, options = {}) => {
  return useQuery({
    queryKey: ['patientByResident', rp_id],
    queryFn: () => getPatientByResidentId(rp_id),
    enabled: !!rp_id, 
    ...options
  });
};

export const useFPRecordsByPatientId = (pat_id: string | null, options = {}) => {
  return useQuery({
    queryKey: ["fpRecordsByPatient", pat_id],
    queryFn: () => getFPRecordsByPatientId(pat_id!),
    enabled: !!pat_id, 
    ...options,
  });
};


interface CommodityItem {
  id: number
  name: string
  stock: number
  userType: string
}

export const useCommodities = () => {
  const [commodities, setCommodities] = useState<CommodityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCommodities = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api2.get("/inventory/commodityinventorylist/")

      // Filter only available commodities (stock > 0) and map to simplified structure
      const availableCommodities: CommodityItem[] = response.data
        .filter((item: any) => item.cinv_qty_avail > 0) // Only show items in stock
        .map((item: any) => ({
          id: item.cinv_id,
          name: item.com_detail?.com_name || item.com_id?.com_name || "Unknown Commodity",
          stock: item.cinv_qty_avail,
          userType: item.com_detail?.user_type || "all users",
        }))

      setCommodities(availableCommodities)
    } catch (err) {
      console.error("Failed to fetch commodities:", err)
      setError("Failed to load available supplies")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCommodities()
  }, [])

  return { commodities, isLoading, error, refetch: fetchCommodities }
}
