  // DisplayMedicalConsultation.tsx
  "use client";
  import { useMemo } from "react";
  import { Card, CardContent } from "@/components/ui/card";
  import { useLocation } from "react-router-dom";
  import CurrentConsultationCard from "./current-medrec";
  import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

  export default function DisplayMedicalConsultation() {
    const location = useLocation();
    const { params } = location.state || {};
    const { patientData, MedicalConsultation } = params || {};

    const patientId = useMemo(() => patientData?.pat_id, [patientData]);

    const currentConsultation = useMemo(() => {
      // Since we're not fetching history in parent anymore, just return the current consultation
      return MedicalConsultation;
    }, [MedicalConsultation]);

    if (!patientData || !MedicalConsultation) {
      return (
        <div className="w-full min-h-screen flex items-center justify-center p-4">
          <p className="text-base sm:text-lg md:text-xl text-gray-600">No medical consultation data found.</p>
        </div>
      );
    }

    return (
      <LayoutWithBack title="Medical Consultation Record" description="View consultation details and patient information">
        <Card className="w-full mt-6 shadow-lg border-0">
          <CardContent className="p-6">
            <CurrentConsultationCard 
              consultation={currentConsultation} 
              patientData={patientData} 
              currentConsultationId={MedicalConsultation?.medrec_id}
            />
          </CardContent>
        </Card>
      </LayoutWithBack>
    );
  }