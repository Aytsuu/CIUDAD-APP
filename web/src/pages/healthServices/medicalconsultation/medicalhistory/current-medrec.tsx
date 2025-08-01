import { format } from "date-fns";
import { MedicalConsultationHistory } from "./table-history";

interface PatientData {
  pat_id: string;
  personal_info: {
    per_fname: string;
    per_lname: string;
    per_sex: string;
    per_dob: string;
  };
  addressFull: string;
}

interface CurrentConsultationCardProps {
  consultation: MedicalConsultationHistory;
  patientData: PatientData;
  className?: string;
}

export default function CurrentConsultationCard({
  consultation,
  patientData,
  className = "",
}: CurrentConsultationCardProps) {
  return (
    <div className={`bg-white ${className}`}>
      <h3 className="text-base sm:text-lg md:text-xl font-bold text-center mb-6 sm:mb-8 md:mb-10">
        PATIENT RECORD
      </h3>

      {/* Patient Information Section */}
      <div className="space-y-6 sm:space-y-8">
        {/* Row 1: Name and Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm sm:min-w-[80px]">
              Name:
            </span>
            <div className="border-b border-black flex-1 min-w-0">
              <span className="text-sm truncate">
                {`${patientData?.personal_info?.per_fname} ${patientData?.personal_info?.per_lname}`}
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm sm:min-w-[80px]">
              Date:
            </span>
            <div className="border-b border-black flex-1">
              <span className="text-sm">
                {format(new Date(consultation.created_at), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Age, Sex, and Date of Birth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm sm:min-w-[80px]">
              Age:
            </span>
            <div className="border-b border-black flex-1">
              <span className="text-sm">{consultation.medrec_age}</span>
            </div>
            <span className="font-bold text-black text-sm sm:min-w-[80px] sm:ml-4">
              Sex:
            </span>
            <div className="border-b border-black flex-1">
              <span className="text-sm">
                {patientData.personal_info.per_sex}
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm sm:min-w-[80px]">
              Date of Birth:
            </span>
            <div className="border-b border-black flex-1">
              <span className="text-sm">
                {patientData.personal_info.per_dob}
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: Address and BHW Assigned */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm sm:min-w-[80px]">
              Address:
            </span>
            <div className="border-b border-black flex-1 min-w-0">
              <span className="text-sm line-clamp-2">
                {patientData.addressFull}
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm sm:min-w-[80px]">
              BHW Assigned:
            </span>
            <div className="border-b border-black flex-1">
              <span className="text-sm">N/A</span>
            </div>
          </div>
        </div>

        {/* Vital Signs Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Left Column - BP, RR, HR, Temperature */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-baseline gap-2 flex-1">
                <span className="font-bold text-black text-sm sm:min-w-[80px]">
                  BP:
                </span>
                <div className="border-b border-black flex-1">
                  <span className="text-sm">
                    {consultation.vital_signs.vital_bp_systolic}/
                    {consultation.vital_signs.vital_bp_diastolic}
                  </span>
                </div>
                <span className="text-black text-sm">mmHg</span>
              </div>
              <div className="flex items-baseline gap-2 flex-1">
                <span className="font-bold text-black text-sm sm:min-w-[80px]">
                  RR:
                </span>
                <div className="border-b border-black flex-1">
                  <span className="text-sm">
                    {consultation.vital_signs.vital_RR}
                  </span>
                </div>
                <span className="text-black text-sm">cpm</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-baseline gap-2 flex-1">
                <span className="font-bold text-black text-sm sm:min-w-[80px]">
                  HR:
                </span>
                <div className="border-b border-black flex-1">
                  <span className="text-sm">
                    {consultation.vital_signs.vital_pulse}
                  </span>
                </div>
                <span className="text-black text-sm">bpm</span>
              </div>
              <div className="flex items-baseline gap-2 flex-1">
                <span className="font-bold text-black text-sm sm:min-w-[80px]">
                  Temperature:
                </span>
                <div className="border-b border-black flex-1">
                  <span className="text-sm">
                    {consultation.vital_signs.vital_temp}
                  </span>
                </div>
                <span className="text-black text-sm">°C</span>
              </div>
            </div>
          </div>

          {/* Right Column - WT, HT */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-black text-sm sm:min-w-[80px]">
                WT:
              </span>
              <div className="border-b border-black flex-1">
                <span className="text-sm">
                  {parseFloat(consultation.bmi_details.weight).toFixed(2).replace(/\.00$/, "")}
                </span>
              </div>
              <span className="text-black text-sm">kg</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-black text-sm sm:min-w-[80px]">
                HT:
              </span>
              <div className="border-b border-black flex-1">
                <span className="text-sm">
                    {parseFloat(consultation.bmi_details.height).toFixed(2).replace(/\.00$/, "")}
                </span>
              </div>
              <span className="text-black text-sm">cm</span>
            </div>
          </div>
        </div>

        {/* Chief Complaint */}
        <div className="pt-2">
          <div className="flex flex-col sm:flex-row items-baseline gap-2">
            <span className="font-bold text-black text-sm sm:min-w-[120px]">
              Chief of Complaint:
            </span>
            <div className="border-b border-black flex-1 min-w-0">
              <span className="text-sm">
                {consultation.medrec_chief_complaint}
              </span>
            </div>
          </div>
        </div>

        <div className=" p-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 ">
            {/* History of Present Illness/Findings */}
            <div className="border border-black py-4">
              <h5 className="text-md font-bold mb-2 text-center border-b border-black pb-4">
                History of Present Illness/Findings
              </h5>
              <div className="space-y-2 p-4">
                <div>
                  <span className="font-bold text-black text-sm">
                    Subjective Summary:
                  </span>
                  <div className="text-sm mt-1">
                    {consultation.find_details?.subj_summary}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-black text-sm">
                    Objective Summary:
                  </span>
                  <div className="text-sm mt-1">
                    {consultation.find_details?.obj_summary
                      ?.split("-")
                      .map((line, index) => (
                        <div key={index}>{line.trim()}</div>
                      ))}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-black text-sm">
                    Diagnosis:
                  </span>
                  <div className="text-sm mt-1">
                    {consultation.find_details?.assessment_summary
                      ?.split(",")
                      .map((item, index) => (
                        <div key={index}>{item.trim()}</div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Plan/Treatment */}
            <div className="border border-black py-4">
              <h5 className="text-md font-bold mb-2 text-center border-b border-black pb-4">
                Plan Treatment
              </h5>
              <div className="space-y-2 p-4">
                <div>
                  <div className="text-sm mt-1">
                    {consultation.find_details?.plantreatment_summary
                      ?.split("-")
                      .map((item, index) => (
                        <div key={index}>{item.trim()}</div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
