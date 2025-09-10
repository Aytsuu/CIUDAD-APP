import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetGarbageCardAnalytics } from "./garbage-pickup-analytics-queries";

const sectionpending = [
  {
    title: "Pending Garbage Pickup Requests",
    description: "",
    dataKey: "pending",
  },
  {
    title: "Accepted Garbage Pickup Requests",    
    description: "",
    dataKey: "accepted",
  },
  {
    title: "Completed Garbage Pickup Requests",
    description: "",
    dataKey: "completed",
  },
  {
    title: "Rejected Garbage Pickup Requests",
    description: "",
    dataKey: "rejected",
  },
];

export const GargbagePickupSectionCards = () => {
  const { data, isLoading } = useGetGarbageCardAnalytics();

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