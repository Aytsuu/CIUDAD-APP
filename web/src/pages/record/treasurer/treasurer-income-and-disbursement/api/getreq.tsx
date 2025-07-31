import { api } from "@/api/api";

export const getIncomeImages = async (archive: boolean = false, folderId?: number) => {
  try {
    const params: Record<string, string> = { archive: archive.toString() }
    if (folderId) params.folder = folderId.toString()
    const res = await api.get('treasurer/income-tab/images/', { params })
    const data = res.data?.data ?? res.data ?? []
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error("API Error:", err)
    return []
  }
}

export const getDisbursementImages = async (archive: boolean = false, folderId?: number) => {
  try {
    const params: Record<string, string> = { archive: archive.toString() }
    if (folderId) params.folder = folderId.toString()
    const res = await api.get('treasurer/disbursement-tab/images/', { params })
    const data = res.data?.data ?? res.data ?? []
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error("API Error:", err)
    return []
  }
}