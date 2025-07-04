import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card/card";
import { useGetProjectProposalStatusCounts } from "./projprop-analytics-queries";

const sectionpending = [
  {
    title: "Pending Projects",
    description: "",
    dataKey: "pending",
  },
  {
    title: "Viewed Projects",
    description: "",
    dataKey: "viewed",
  },
  {
    title: "Approved Projects",
    description: "",
    dataKey: "approved",
  },
  {
    title: "Rejected Projects",
    description: "",
    dataKey: "rejected",
  },
];

export const ProjPropPendingSectionCards = () => {
  const { data, isLoading } = useGetProjectProposalStatusCounts();

  return (
    <>
      {sectionpending.map((sec) => (
        <Card key={sec.title}>
          <CardHeader>
            <CardDescription>{sec.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {isLoading ? '...' : (data?.[sec.dataKey] ?? 0)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm"></CardFooter>
        </Card>
      ))}
    </>
  );
};