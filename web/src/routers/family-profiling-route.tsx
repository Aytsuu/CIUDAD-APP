import  FamilyProfilingMain  from "@/pages/health-profiling/FamilyProfilingMain"
import { FamilyProfileForm } from "@/pages/health-profiling/form-pages/FamilyProfileForm"
import  FamilyProfileView from "@/pages/health-profiling/FamilyProfileView"
import HealthFamilyForm from "@/pages/record/health-family-profiling/HealthFamilyForm"
import { DemographicData } from "@/pages/health-profiling/form-pages/DemographicData"

export const familyProfilingRoute = [

    {
        path: 'family-profiling-main',
        element: <FamilyProfilingMain />
    },
    {
        path: 'family-profile-form',
        element: <FamilyProfileForm />
    },
    {
        path: 'family-profile-view',
        element: <FamilyProfileView></FamilyProfileView>
    },
    {
        path: 'family/family-profile-form',
        element: <HealthFamilyForm />,
    },
    {
        path: 'family/dependents-information',
        element: <FamilyProfileForm />,
    }
    
   
]