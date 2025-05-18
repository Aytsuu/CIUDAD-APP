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
          #{resident.rp_id}
        </span>
        {resident.name}
      </div>
    ),
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

export const formatAddresses = (addresses: any) => {
  if(!addresses) return [];

  return addresses.map( (item: {
      add_id: string,
      add_province: string, 
      add_city: string, 
      add_barangay: string, 
      sitio: string,
      add_street: string,
    }, idx: number) => ({
      id: `address ${idx+1} - ${item.sitio.toLowerCase()}, ${item.add_street.toLowerCase()}`,
      name: `Address ${idx+1} - ${capitalize(item.sitio)}, ${item.add_street}`,
      add_id: item.add_id
    })
  )
}