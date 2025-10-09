import { Button } from "@/components/ui/button/button";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import CurrentConsultationCard from "@/pages/healthServices/medicalconsultation/medicalhistory/current-medrec";
import { Link } from "react-router-dom";
import { History } from "lucide-react";

interface PendingDisplayMedicalConsultationProps {
  patientData: any;
  MedicalConsultation: any;
  onNext: () => void;
}

export default function PendingDisplayMedicalConsultation({ patientData, MedicalConsultation, onNext }: PendingDisplayMedicalConsultationProps) {
  const currentConsultation = useMemo(() => {
    return MedicalConsultation;
  }, [MedicalConsultation]);

  console.log("Current Consultation:", currentConsultation);

  return (
    <div className="">
      <div className="font-light text-zinc-400 flex justify-end mb-8 mt-4">Page 1 of 2</div>


      <div className="flex justify-end mb-4">
          <Link to="/services/medical-consultation/records" state={{ params: { patientData, mode: "doctor" } }}>
            <Button className="flex gap-2 items-center text-white">
              <History className="w-4 h-4" /> View History
            </Button>
          </Link>
        </div>

      <div>
        {/* Current Consultation Card */}
        {currentConsultation && <CurrentConsultationCard consultation={currentConsultation} patientData={patientData} currentConsultationId={currentConsultation?.medrec_id} />}

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
