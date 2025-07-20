import { Complaint } from "../complaint-type";

export function filterComplaints(
  complaints: Complaint[],
  query: string,
  timeFilter: string | null
): Complaint[] {
  let result = [...complaints];
  const now = new Date();
  let startDate = new Date();

  if (timeFilter) {
    switch (timeFilter) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    result = result.filter(c => new Date(c.comp_created_at) >= startDate);
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(c => {
      const fields = [
        c.comp_id.toString(),
        c.comp_incident_type,
        c.comp_allegation,
        c.cpnt.cpnt_name,
        ...(c.accused_persons?.map(a => a.acsd_name) || []),
        new Date(c.comp_datetime).toLocaleString(),
        c.cpnt.add.add_province,
        c.cpnt.add.add_city,
        c.cpnt.add.add_barangay,
        ...(c.accused_persons?.flatMap(a => [
          a.add.add_province,
          a.add.add_city,
          a.add.add_barangay
        ]) || [])
      ];

      return fields.some(val => val?.toLowerCase().includes(q));
    });
  }

  return result;
}
