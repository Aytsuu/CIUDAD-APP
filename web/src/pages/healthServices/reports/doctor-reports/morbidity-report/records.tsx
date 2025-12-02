// MonthlyMorbidityDetails.tsx
import { useLocation } from "react-router-dom";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import MonthlyMorbidityDetails from "../../fhisreport/fhis_pge17";

export default function DoctorMonthlyMorbidityDetails() {
  const location = useLocation();
  const state = location.state as {
    month: string;
    monthName: string;
    recordCount: number;
    totalIllnesses: number;
  };

 

  return (
    <LayoutWithBack title="Monthly Morbidity Details" description={`${state.monthName} - Surveillance Cases`}>
     <MonthlyMorbidityDetails state={{
         month: state.month,
         monthName: state.monthName,
     }} />
    </LayoutWithBack>
  );
}