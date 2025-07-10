// import RoleLayout from "@/pages/record/health/administration/RoleLayout"
import AdministrationRecords from "@/pages/record/health/administration/AdministrationRecords"
import PositionForm from "@/pages/record/health/administration/PositionForm"

export const health_administration_router = [
    {
        path: 'health-administration',
        element: <AdministrationRecords /> 
    },
    // {   
    //     path: 'health-administration/role',
    //     element: <RoleLayout /> 
    // }, 
    {
        path: 'health-administration/role/add-position',
        element: <PositionForm /> 
    }
]