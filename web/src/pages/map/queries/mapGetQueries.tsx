import { mapApi } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useConvertCoordinatesToAddress = (lat: number, lng: number) => {
  return useQuery({
    queryKey: ["convertCoordinates", lat, lng],
    queryFn: async () => {
      try {
        const res = await mapApi.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              "User-Agent": "bluedot21/1.0",
            },
          }
        );
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
  });
};