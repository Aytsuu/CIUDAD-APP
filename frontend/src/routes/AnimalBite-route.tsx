import Viewing from "@/pages/animalbites/history";
import AnimalBites from "@/pages/animalbites/individual";

export const bites_route = [
    {
        path: '/Animalbite_viewing',
        element: <AnimalBites></AnimalBites>
    },
    {
        path: '/Animalbite_individual',
        element: <Viewing></Viewing>
    }
]