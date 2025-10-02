// Format health staff for searching
export const formatHealthStaff = (staff: any) => {
  if (!staff) return [];
  
  console.log('formatHealthStaff - Input staff:', staff);

  return staff.map((staffMember: any) => {
    console.log('formatHealthStaff - Processing staff member:', staffMember);
    console.log('formatHealthStaff - Staff member keys:', Object.keys(staffMember));
    
    return {
      id: `${staffMember.staff_id} ${staffMember.fname} ${staffMember.lname}`,
      name: (
        <div className="flex items-center">
          <span className="text-green-600 font-medium">{staffMember.staff_id}</span>
          <span className="text-gray-700 ml-2">- {`${staffMember.fname} ${staffMember.mname ? staffMember.mname + ' ' : ''}${staffMember.lname}`.toUpperCase()}</span>
        </div>
      ),
      staff_id: staffMember.staff_id,
      position: staffMember.position,
      fullName: `${staffMember.fname} ${staffMember.mname ? staffMember.mname + ' ' : ''}${staffMember.lname}`
    };
  });
};
