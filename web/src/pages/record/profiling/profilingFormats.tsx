import { Label } from "@/components/ui/label";

// Format residents for searching
export const formatResidents = (params: any) => {
  if (!params.residents) return [];

  // Begin formatting
  const formatted = params.residents.map((resident: any) => ({
    id: `${resident.rp_id} ${resident.per.per_fname} ${resident.per.per_mname} ${resident.per.per_lname}`,
    name: (
      <div className="flex gap-4 items-center">
        <span className="bg-green-500 text-white py-1 px-2 text-[14px] rounded-md shadow-md">
          #{resident.rp_id}
        </span>
        {`${resident.per.per_lname}, ${resident.per.per_fname} ${
          resident.per.per_mname ? resident.per.per_mname.charAt(0) + "." : ""
        }`}
      </div>
    ),
  }));

  return formatted;
};

// Format sitio for searching
export const formatSitio = (params: any) => {
  if (!params.sitio) return [];

  const sitioList = params.sitio.map(
    (item: { sitio_id: string; sitio_name: string }) => ({
      id: String(item.sitio_id),
      name: item.sitio_name,
    })
  );

  return sitioList;
};

// Format households for searching
export const formatHouseholds = (params: any) => {
  if (!params.households) return [];

  return params.households.map((household: any) => ({
    id: household.hh_id,
    name: (
      <div className="flex gap-4 items-center">
        <span className="bg-green-500 text-white py-1 px-2 text-[14px] rounded-md shadow-md">
          #{household.hh_id}
        </span>
        <div className="flex items-center gap-2">
          <Label>Head:</Label>
          {`${household.rp.per.per_lname}, ${household.rp.per.per_fname} ${
            household.rp.per.per_mname
              ? household.rp.per.per_mname.charAt(0) + "."
              : ""
          }`}
        </div>
      </div>
    ),
  }));
};
