// import Viewing from "@/pages/animalbites/history";
import IndividualPatientHistory from "@/pages/animalbites/individual";
import AnimalBites from "@/pages/animalbites/overall";

export const bites_route = [
    {
        path: '/Animalbite_viewing',
        element: <AnimalBites></AnimalBites>
    },
    {
        path: '/Animalbite_individual/:id',
        element: <IndividualPatientHistory />
    }
]