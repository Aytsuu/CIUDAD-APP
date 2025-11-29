import { api2 } from "@/api/api";

// Helper to handle API errors safely
const handleApiError = (error: any, context: string) => {
  console.error(`Error fetching ${context}:`, error);
  // Return a safe empty structure so the app doesn't crash
  return { results: [], count: 0, filter_counts: {} };
};

// Generic fetcher that works for all your inventory types
export const fetchInventoryData = async (
  category: "medicine" | "commodity" | "first_aid" | "vaccine",
  page: number,
  pageSize: number,
  search: string,
  filter: string
) => {
  // Map frontend category to the correct backend URL
  let url = "";
  switch (category) {
    case "medicine":
      url = "/inventory/medicine-stock-table/";
      break;
    case "commodity":
      url = "/inventory/commodity-stock-table/";
      break;
    case "first_aid":
      url = "/inventory/first-aid-stock-table/";
      break;
    case "vaccine":
      // Based on vaccination_views.py, this endpoint handles vaccines
      url = "/inventory/combined-stock-table/";
      break;
  }

  try {
    const response = await api2.get(url, {
      params: {
        page: page,
        page_size: pageSize,
        search: search.trim(),
        filter: filter, // Backend expects: 'all', 'low_stock', 'out_of_stock', 'expired', 'near_expiry'
      },
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, category);
  }
};