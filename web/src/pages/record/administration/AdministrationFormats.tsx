import { Badge } from "@/components/ui/badge";

// Format positions for searching
export const formatPositions = (positions: any) => {
  if (!positions) return [];

  const positionList = positions.map(
    (item: { pos_id: string; pos_title: string }) => ({
      id: String(item.pos_id),
      name: item.pos_title,
    })
  );

  return positionList;
};

export const formatPositionGroups = (groups: any) => {
  if(!groups) return [];
  
  return groups.map((group: any) => ({
    id: group.toLowerCase(),
    name: group
  }))
}

// Format staffs for searching
export const formatStaffs = (staffs: any) => {
  if (!staffs) return [];

  // Begin formatting
  return staffs.map((staff: any) => ({
    id: `${staff.staff_id} ${staff.position}-${staff.lname} ${staff.fname} ${staff.mname ? staff.mname : ''}`,
    name: (
      <div className="flex flex-col gap-2 items-start pb-2">
        <div className="flex gap-2">
          <Badge className="bg-green-500 hover:bg-green-500">
            {staff.staff_id}
          </Badge>
          <Badge>
            {staff.position}
          </Badge>
        </div>
        {`${staff.lname}, ${staff.fname} ${staff.mname ? staff.mname : ''}`}
      </div>
    ),
  }));

};