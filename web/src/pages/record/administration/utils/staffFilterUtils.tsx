import { User } from "@/context/auth-types";

export interface StaffFilterContext {
  canViewAllRecords: boolean;
  staffTypeFilter?: 'Barangay Staff' | 'Health Staff';
  isAdmin: boolean;
  isHealthStaff: boolean;
  isBarangayStaff: boolean;
}

/**
 * Determines filtering context based on logged-in staff's type and position
 */
export const getStaffFilterContext = (user: User | null): StaffFilterContext => {
  if (!user?.staff) {
    return {
      canViewAllRecords: false,
      isAdmin: false,
      isHealthStaff: false,
      isBarangayStaff: false,
    };
  }

  const staff = user.staff;
  const staffType = staff.staff_type as 'Barangay Staff' | 'Health Staff' | 'Admin';
  
  // Check if user is Admin by staff_type - Admins can see all records
  const isAdmin = staffType === 'Admin';
  
  // Determine staff type flags
  const isHealthStaff = staffType === 'Health Staff';
  const isBarangayStaff = staffType === 'Barangay Staff';
  
  return {
    canViewAllRecords: isAdmin, // Admin can view all records
    staffTypeFilter: isAdmin ? undefined : (staffType as 'Barangay Staff' | 'Health Staff'),
    isAdmin,
    isHealthStaff,
    isBarangayStaff,
  };
};

/**
 * Determines position filtering context for positions based on staff's context
 */
export const getPositionFilterContext = (user: User | null) => {
  const staffContext = getStaffFilterContext(user);
  
  return {
    ...staffContext,
    // For positions, if user is health staff and not admin, only show health positions
    shouldFilterHealthPositions: staffContext.isHealthStaff && !staffContext.isAdmin,
    // For positions, if user is barangay staff and not admin, only show barangay positions  
    shouldFilterBarangayPositions: staffContext.isBarangayStaff && !staffContext.isAdmin,
  };
};
