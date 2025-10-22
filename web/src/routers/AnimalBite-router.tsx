// import Viewing from "@/pages/animalbites/history";
import IndividualPatientHistory from "@/pages/animalbites/individual";
import AnimalBites from "@/pages/animalbites/overall";

export const bites_route = [
    {
        path: '/services/animalbites',
        element: <AnimalBites></AnimalBites>
    },
    {
        path: '/services/animalbites/records',
        element: <IndividualPatientHistory />
    }
]