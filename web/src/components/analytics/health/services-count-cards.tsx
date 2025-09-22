import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  useGetChildHealthTotalRecords,
  useGetFirstAidTotalRecords,
  useGetMedicineTotalRecords,
  useGetVaccinationTotalRecords,
  useGetMedicalConsultationTotalRecords,
  useGetMaternalTotalRecords,
} from "./queries/services-count-queries";

const healthCards = [
    {
      title: "Child Health",
      description: "Child health records",
      queryHook: useGetChildHealthTotalRecords,
    },
    {
      title: "First Aid",
      description: "First aid cases",
      queryHook: useGetFirstAidTotalRecords,
    },
    {
      title: "Medicine",
      description: "Medicine records",
      queryHook: useGetMedicineTotalRecords,
    },
    {
      title: "Vaccinations",
      description: "Vaccines administered",
      queryHook: useGetVaccinationTotalRecords,
      showBreakdown: true
    },
    {
      title: "Consultations",
      description: "Medical consultations",
      queryHook: useGetMedicalConsultationTotalRecords,
    },
    {
      title: "Consultations",
      description: "Maternal Health Records",
      queryHook: useGetMaternalTotalRecords,
    },
  ];
export const ServicesHealthRecordsSectionCards = () => {
  return (
    <>
      {healthCards.map((card) => {
        const { data, isLoading } = card.queryHook();
        
        return (
          <Card key={card.title}>
            <CardHeader>
              <CardDescription>{card.description}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl pb-6">
                {isLoading ? '...' : (data?.total_records ?? 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        )
      })}
    </>
  );
};