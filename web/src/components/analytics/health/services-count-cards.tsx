import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportsCount } from "@/pages/healthServices/count-return/count";

const healthCards = [
    {
      title: "Child Health",
      description: "Child health records",
      dataKey: "child_count",
    },
    {
      title: "First Aid",
      description: "First aid cases",
      dataKey: "firstaid_records_count",
    },
    {
      title: "Medicine",
      description: "Medicine records",
      dataKey: "medicine_records_count",
    },
    {
      title: "Vaccinations",
      description: "Vaccines administered",
      dataKey: "vaccination_records_count",
      showBreakdown: true
    },
    {
      title: "Consultations",
      description: "Medical consultations",
      dataKey: "medicalconsultation_records_count",
    },
    // {
    //   title: "Consultations",
    //   description: "Maternal Health Records",
    //   queryHook: useGetMaternalTotalRecords,
    // },
  ];

export const ServicesHealthRecordsSectionCards = () => {
  const { data, isLoading } = useReportsCount();

  return (
    <>
      {healthCards.map((card) => {
        const count = data?.success ? data.data[card.dataKey] : 0;
        
        return (
          <Card key={card.title}>
            <CardHeader>
              <CardDescription>{card.description}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl pb-6">
                {isLoading ? '...' : count}
              </CardTitle>
            </CardHeader>
          </Card>
        )
      })}
    </>
  );
};