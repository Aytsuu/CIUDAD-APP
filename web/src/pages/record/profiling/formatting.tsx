import { Label } from "@/components/ui/label";

// Format residents for searching
export const formatResidents = (params: any, isHousehold: boolean) => {
    if (!params.residents || !params.households) return [];

    const formatted = params.residents.map((resident: any) => ({
        id: `${resident.per_id} ${resident.per_fname} ${resident.per_mname} ${resident.per_lname}`,
        name: (
            <div className="flex gap-4 items-center">
                <span className="bg-green-500 text-white py-1 px-2 text-[14px] rounded-md shadow-md">
                    #{resident.per_id}
                </span>
                {`${resident.per_lname}, ${resident.per_fname}, ${resident.per_mname.slice(0, 1)}.`}
            </div>
        ),
    }));

    // Filter unassigned residents for household registration
    const filtered = formatted.filter((resident: any) => !params.households.some((household: any) => 
        household.per.per_id === resident.id.split(" ")[0]
    ));
    
    return isHousehold ? filtered : formatted
};

// Format sitio for searching
export const formatSitio = (params: any) => {
    if (!params.sitio) return [];

    const sitioList = params.sitio.map((item: { sitio_id: string; sitio_name: string }) => ({
        id: String(item.sitio_id),
        name: item.sitio_name,
    }));

    return sitioList;
};

// Format households for searching
export const formatHouseholds = (params: any) => {
    if(!params.households) return [];

    return params.households
        .map((household: any) => ({
            id: household.hh_id,
            name: (
                <div className="flex gap-4 items-center">
                    <span className="bg-green-500 text-white py-1 px-2 text-[14px] rounded-md shadow-md">
                        #{household.hh_id}
                    </span>
                    <div className="flex items-center gap-2">
                        <Label>Head:</Label>
                        {`${household.per.per_lname}, ${household.per.per_fname}, ${household.per.per_mname.slice(0,1)}.`}
                    </div>
                </div>
            )
        }));
}