import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { capitalize } from "@/helpers/capitalize";
import { formatCurrency } from "@/helpers/currencyFormat";
import { useNavigate } from "react-router";

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
      add_id: string,
      sitio: string,
      add_street: string,
    }, idx: number) => {
      if(item.sitio) {
        return {
          per_id: item.per,
          add_id: item.add_id,
          id: `address ${idx+1} - ${item.sitio.toLowerCase()}, ${item.add_street.toLowerCase()}`,
          name: `Address ${idx+1} - ${capitalize(item.sitio)}, ${item.add_street}`, 
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

export const formatRequestComposition = (compositions: any) => {
  if (!compositions) return [];

  return compositions.map((comp: any) => ({
    id: comp.per_id,
    name: <p>{`${comp.per_lname}, ${comp.per_fname}${comp.per_mname ? ` ${comp.per_mname}` : ""}`}</p>
  }))
}

export const formatOwnedBusinesses = (businesses: any) => {
  if(!businesses) return [];

  return businesses.map((bus: any) => ({
    id: bus.bus_id,
    name: (
      <div className="flex flex-col w-full items-start">
        <p className="text-[15px]">{bus.bus_name}</p>
        <div className="flex w-full justify-between items-center">
          <p className="text-xs text-gray-700">Gross Sales: {formatCurrency(bus.bus_gross_sales)}</p>
          <Badge className={`${bus.bus_status == 'Pending' ? 
            "bg-amber-500 hover:bg-amber-500" : 
            "bg-green-500 hover:bg-green-500"}`}>
              {bus.bus_status}
            </Badge>
        </div>
      </div>
    )
  }))
}

export const formatModificationRequests = (requests: any) => {
  const navigate = useNavigate()
  if(!requests) return [];
  return requests.map((req: any) => ({
      id: `${req.bm_id} ${req.current_details.bus_name}`,
      name: (
        <div className="flex flex-col w-full items-start py-2"
          onClick={() => navigate('form', {
            state: {
              params: {
                type: "viewing",
                busId: req.current_details.bus_id,
              }
            }
          })}
        >
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-medium">{req.current_details.bus_name}</p>
            <Badge variant="outline" className="text-xs">
              ID: {req.current_details.bus_id}
            </Badge>
          </div>
          <div className="flex w-full justify-between items-center mt-1">
            <p className="text-xs text-gray-600">
              Modification Request Pending
            </p>
            <Badge className="bg-amber-500 hover:bg-amber-500">
              Pending Review
            </Badge>
          </div>
        </div>
      )
    }))
}