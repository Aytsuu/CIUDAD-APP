import { Label } from "@/components/ui/label";

// Format residents for searching
export const formatResidents = (residents: any) => {
  if (!residents) return [];

  // Begin formatting
  const formatted = residents.map((resident: any) => ({
    id: `${resident.rp_id} ${resident.name}`,
    name: (
      <div className="flex gap-4 items-center">
        <span className="bg-green-500 text-white py-1 px-2 text-[14px] rounded-md shadow-md">
          #{resident.rp_id}
        </span>
        {resident.name}
      </div>
    ),
  }));

  return formatted;
};

// Format sitio for searching
export const formatSitio = (sitio: any) => {
  if (!sitio) return [];

  const sitioList = sitio.map(
    (item: { sitio_id: string; sitio_name: string }) => ({
      id: String(item.sitio_id),
      name: item.sitio_name,
    })
  );

  return sitioList;
};

// Format households for searching
export const formatHouseholds = (households: any) => {
  if (!households) return [];

  return households.map((household: any) => ({
    id: household.hh_id,
    name: (
      <div className="flex gap-4 items-center">
        <span className="bg-green-500 text-white py-1 px-2 text-[14px] rounded-md shadow-md">
          #{household.hh_id}
        </span>
        <div className="flex items-center gap-2">
          <Label>Head:</Label>
          {household.head}
        </div>
      </div>
    ),
  }));
};
