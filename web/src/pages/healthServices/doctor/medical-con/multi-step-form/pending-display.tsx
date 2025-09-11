import { Button } from "@/components/ui/button/button";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import CurrentConsultationCard from "@/pages/healthServices/medicalconsultation/medicalhistory/current-medrec";


interface PendingDisplayMedicalConsultationProps {
  patientData: any;
  MedicalConsultation: any;
  onNext: () => void;
}

export default function PendingDisplayMedicalConsultation({ patientData, MedicalConsultation, onNext }: PendingDisplayMedicalConsultationProps) {

  const currentConsultation = useMemo(() => {
    return MedicalConsultation;
  }, [MedicalConsultation]);

  return (
    <div className="">
      <div className="font-light text-zinc-400 flex justify-end mb-8 mt-4">Page 1 of 2</div>


      <div>
        {/* Current Consultation Card */}
        {currentConsultation && <CurrentConsultationCard consultation={currentConsultation} patientData={patientData} />}

        {/* Navigation Buttons */}
        <div className="flex justify-end mt-6 sm:mt-8">
            <Button onClick={onNext} className="w-[100px] flex items-center justify-center">
            Next
            <ChevronRight className="ml-2" />
            </Button>
        </div>
      </div>
    </div>
  );
}
