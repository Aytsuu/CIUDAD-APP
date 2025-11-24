import { Complaint } from "../complaint-type";
import { FilterState } from "./ComplaintFilterBar";

export function filterComplaints(
  complaints: Complaint[],
  query: string,
  filters: FilterState
): Complaint[] {
  return complaints.filter((c) => {
    // Search filter
    const matchesSearch = checkSearchQuery(c, query);

    // Type filter - if no types selected, show all; otherwise filter by selected types
    const matchesType =
      filters.types.length === 0 ||
      filters.types.includes(c.comp_incident_type);

    // Status filter - if no statuses selected, show all; otherwise filter by selected statuses
    const matchesStatus =
      filters.statuses.length === 0 ||
      filters.statuses.includes(c.comp_status);

    // Date filter - filter by date range
    const matchesDate = checkDateRange(
      c.comp_datetime,
      filters.dateRange.start,
      filters.dateRange.end
    );

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });
}

function checkSearchQuery(c: Complaint, query: string): boolean {
  if (!query.trim()) return true;

  const q = query.toLowerCase();
  const firstComplainant = c.complainant?.[0];
  const accusedNames = c.accused?.map((a) => a.acsd_name) || [];
  const accusedAddresses =
    c.accused?.flatMap((a) => [
      a?.address
    ]) || [];

  const fields = [
    c.comp_id?.toString(),
    c.comp_incident_type,
    c.comp_allegation,
    c.comp_status,
    firstComplainant?.cpnt_name,
    new Date(c.comp_datetime).toLocaleString(),
    firstComplainant?.address,
    ...accusedNames,
    ...accusedAddresses,
  ];

  return fields.some((val) => val);
}

function checkDateRange(
  dateString: string | undefined,
  startDate: string | null,
  endDate: string | null
): boolean {
  if (!startDate && !endDate) return true;
  if (!dateString) return false;

  const itemDate = new Date(dateString);
  itemDate.setHours(0, 0, 0, 0);

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return itemDate >= start && itemDate <= end;
  }

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    return itemDate >= start;
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return itemDate <= end;
  }

  return true;
}

// Helper to extract unique incident types for filter options
export function getUniqueTypes(complaints: Complaint[]): string[] {
  const types = new Set(
    complaints
      .map((c) => c.comp_incident_type)
      .filter((type): type is string => Boolean(type))
  );
  return Array.from(types).sort();
}

// Helper to extract unique statuses for filter options
export function getUniqueStatuses(complaints: Complaint[]): string[] {
  const statuses = new Set(
    complaints
      .map((c) => c.comp_status)
      .filter((status): status is string => Boolean(status))
  );
  return Array.from(statuses).sort();
}