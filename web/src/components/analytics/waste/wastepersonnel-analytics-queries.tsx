import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAllPersonnel, useGetTrucks } from "./wastepersonnel-section-cards";

const personnelSections = [
  {
    title: "Active Watchmen",
    description: "",
    dataKey: "Watchman",
  },
  {
    title: "Active Waste Drivers",
    description: "",
    dataKey: "Waste Driver",
  },
  {
    title: "Active Waste Collectors",
    description: "",
    dataKey: "Waste Collector",
  },
  {
    title: "Total Collection Vehicles",
    description: "",
    dataKey: "Trucks",
    statusKey: "Operational",
  },
];

export const WastePersonnelCards = () => {
  const { data: personnel = [], isLoading: isPersonnelLoading } = useGetAllPersonnel();
  const { data: trucks = [], isLoading: isTrucksLoading } = useGetTrucks();

  const normalizePosition = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("watchman") || lower.includes("watchmen")) return "Watchman";
    if (lower.includes("waste driver") || lower.includes("truck driver")) return "Waste Driver";
    if (lower.includes("waste collector") || lower.includes("waste collectors")) return "Waste Collector";
    return title;
  };

  const getCounts = () => {
    const counts = {
      Watchman: 0,
      "Waste Driver": 0,
      "Waste Collector": 0,
      Trucks: trucks.length,
      Operational: trucks.filter(t => t.truck_status === "Operational").length,
    };

    personnel.forEach((p) => {
      const position = normalizePosition(p.staff.position?.title || "");
      if (position === "Watchman") counts.Watchman++;
      if (position === "Waste Driver") counts["Waste Driver"]++;
      if (position === "Waste Collector") counts["Waste Collector"]++;
    });

    return counts;
  };

  const counts = getCounts();
  const isLoading = isPersonnelLoading || isTrucksLoading;

  return (
    <>
      {personnelSections.map((sec) => (
        <Card key={sec.title}>
          <CardHeader>
            <CardDescription>{sec.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {isLoading ? '...' : counts[sec.dataKey as keyof typeof counts] ?? 0}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
          </CardFooter>
        </Card>
      ))}
    </>
  );
};