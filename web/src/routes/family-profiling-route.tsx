import  FamilyProfilingMain  from "@/pages/health-profiling/FamilyProfilingMain"
import { FamilyProfileForm } from "@/pages/health-profiling/form-pages/FamilyProfileForm"
import  FamilyProfileView from "@/pages/health-profiling/FamilyProfileView"

export const familyProfilingRoute = [

    {
        path: 'family-profiling-main',
        element: <FamilyProfilingMain />
    },
    {
        path: 'family-profile-form',
        element: <FamilyProfileForm></FamilyProfileForm>
    },
    {
        path: 'family-profile-view',
        element: <FamilyProfileView></FamilyProfileView>
    },
    
   
 ]