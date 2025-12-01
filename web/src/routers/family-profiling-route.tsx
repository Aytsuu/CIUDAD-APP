import HealthFamilyForm from "@/pages/record/health-family-profiling/HealthFamilyForm"
import ContinueHealthProfiling from "@/pages/record/health-family-profiling/ContinueHealthProfiling"

export const familyProfilingRoute = [
    {
        path: 'family/family-profile-form',
        element: <HealthFamilyForm />,
    },
    {
        path: 'family/continue-profiling/:famId',
        element: <ContinueHealthProfiling />,
    },
]