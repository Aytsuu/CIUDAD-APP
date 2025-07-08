import { Label } from "@/components/ui/label";
import { capitalize } from "@/helpers/capitalize";

// Format residents for searching
export const formatResidents = (residents: any) => {
  if (!residents) return [];

  // Begin formatting
  return residents.map((resident: any) => ({
    id: `${resident.rp_id} ${resident.name}`,
    name: (
      <div className="flex gap-4 items-center">
        <span className="bg-green-500 text-white py-1 px-2 text-[14px] rounded-md shadow-md">
          {resident.rp_id}
        </span>
        {resident.name}
      </div>
    ),
    per_id: resident.personal_info.per_id
  }));

};

// Format sitio for searching
export const formatSitio = (sitio: any) => {
  if (!sitio) return [];

  return sitio.map(
    (item: { sitio_id: string; sitio_name: string }) => ({
      id: item.sitio_id,
      name: item.sitio_name,
    })
  );
};

// Format households for searching
export const formatHouseholds = (households: any) => {
  if (!households) return [];

  return households.map((household: any) => ({
    id: `${household.hh_id} ${household.head}`,
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

export const formatAddresses = (addresses: any) => {
  if(!addresses) return [];

  return addresses.map( (item: {
      per: string,
      add: string,
      add_sitio: string,
      add_street: string,
    }, idx: number) => {
      if(item.add_sitio) {
        return {
          per_id: item.per,
          add_id: item.add,
          id: `address ${idx+1} - ${item.add_sitio.toLowerCase()}, ${item.add_street.toLowerCase()}`,
          name: `Address ${idx+1} - ${capitalize(item.add_sitio)}, ${item.add_street}`, 
        }
      }
    }
  )
}

export const formatFamiles = (families: any) => {
  if (!families) return [];

  return families.map((family: any, idx: number) => ({
    id: family.fam_id,
    name: (
      <div className="flex gap-4 items-center">
        <span>
          {`(${idx + 1}) Family ID`}
        </span>
        <span className="bg-green-500 text-white py-1 px-2 text-[14px] rounded-md shadow-md">
          {family.fam_id}
        </span>
      </div>
    ),
  }));
}