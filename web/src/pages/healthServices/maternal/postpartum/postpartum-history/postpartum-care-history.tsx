import { Card, CardContent } from "@/components/ui/card";
// import { useNavigate, useLocation } from "react-router";
import { FileText } from "lucide-react";
import { PostpartumHistoryTable } from "../../maternal-components/postpartum-history";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

interface PostpartumVisit {
  date: string;
  lochialDischarges: string;
  bloodPressure: string;
  feedings: string;
  findings: string;
  nursesNotes: string;
}

interface PostpartumAssessment {
  ppa_id: string;
  ppa_date: string;
  ppa_lochial_discharges: string;
  ppa_blood_pressure: string;
  ppa_feedings: string;
  ppa_findings: string;
  ppa_nurses_notes: string;
  created_at: string;
  updated_at: string;
}

interface Patient {
  pat_id: string;
  personal_info: {
    per_fname: string;
    per_lname: string;
    per_mname: string;
  };
}

export default function PostpartumCareHistory() {
  const [postpartumData, setPostpartumData] = useState<PostpartumVisit[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [recordId, setRecordId] = useState<string>("");
  const [hasRealData, setHasRealData] = useState<boolean>(false);
  
  const location = useLocation();
  // const navigate = useNavigate();

  // Mock data for demonstration when no real data is available
  const mockPostpartumData: PostpartumVisit[] = [
    {
      date: "April 10, 2025",
      lochialDischarges: "Moderate, reddish-brown",
      bloodPressure: "120/80 mmHg",
      feedings: "Breastfeeding every 2-3 hours",
      findings: "Uterus firm and well-contracted, fundus at umbilicus level",
      nursesNotes: "Mother reports mild afterpains, advised on normal healing process. Good latch observed during feeding."
    },
    {
      date: "April 15, 2025",
      lochialDischarges: "Light, pinkish-brown",
      bloodPressure: "118/76 mmHg",
      feedings: "Combination feeding - breast & formula 4 oz every 4 hrs",
      findings: "No signs of infection, episiotomy healing well",
      nursesNotes: "Baby feeding well, weight gain on track. Mother feeling more confident with feeding routine."
    },
    {
      date: "April 22, 2025",
      lochialDischarges: "Minimal, yellowish-white",
      bloodPressure: "115/72 mmHg",
      feedings: "Breastfeeding established, supplementing as needed",
      findings: "Complete uterine involution, no abnormal discharge",
      nursesNotes: "Excellent recovery progress. Mother ready for discharge from postpartum care. Provided follow-up instructions."
    }
  ];

  useEffect(() => {
    if (location.state?.params) {
      const { patientData, recordId: passedRecordId, postpartumRecord } = location.state.params;
      
      setSelectedPatient(patientData);  
      setRecordId(passedRecordId);
      console.log(recordId)
      
      // If postpartum record data is passed directly
      if (postpartumRecord?.postpartum_assessment && postpartumRecord.postpartum_assessment.length > 0) {
        const formattedData = postpartumRecord.postpartum_assessment.map((assessment: PostpartumAssessment) => ({
          date: new Date(assessment.ppa_date).toLocaleDateString(),
          lochialDischarges: assessment.ppa_lochial_discharges || "N/A",
          bloodPressure: assessment.ppa_blood_pressure || "N/A",
          feedings: assessment.ppa_feedings || "N/A",
          findings: assessment.ppa_findings || "N/A",
          nursesNotes: assessment.ppa_nurses_notes || "N/A"
        }));
        setPostpartumData(formattedData);
        setHasRealData(true);
      } else {
        // Use mock data when no real data is available
        setPostpartumData(mockPostpartumData);
        setHasRealData(false);
      }
    } else {
      // Use mock data as fallback
      setPostpartumData(mockPostpartumData);
      setHasRealData(false);
    }
  }, [location.state]);

  const hasData = postpartumData && postpartumData.length > 0;

  return (
    <div className="space-y-4">
      {/* Postpartum History Table */}
      {hasData ? (
        <div className="space-y-4">
          {!hasRealData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-800">Sample Data Display</h4>
              </div>
              <p className="text-blue-700 text-sm">
                The following data is for demonstration purposes only. No actual postpartum assessment records were found for this patient.
              </p>
            </div>
          )}
          <PostpartumHistoryTable data={postpartumData} />
        </div>
      ) : (
        <Card className="text-center py-16 border-slate-200">
          <CardContent>
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">
              No Clinical Records Available
            </h3>
            <p className="text-slate-500">
              No postpartum examination records have been documented for this patient.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}