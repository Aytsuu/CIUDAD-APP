import { Card, CardContent } from "@/components/ui/card/card";
import { Button } from "@/components/ui/button/button";
import { BsChevronLeft } from "react-icons/bs";
import { useNavigate } from "react-router";
import { FileText } from "lucide-react";
import { MdOutlinePregnantWoman } from "react-icons/md";
import { PostpartumHistoryTable } from "../maternal-components/postpartum-history";

interface PostpartumVisit {
  date: string;
  lochialDischarges: string;
  bloodPressure: string;
  feedings: string;
  findings: string;
  nursesNotes: string;
}

const postpartumData: PostpartumVisit[] = [
  {
    date: "April 10, 2025",
    lochialDischarges: "Moderate, reddish",
    bloodPressure: "120/80 mmHg",
    feedings: "Breastfeeding every 3 hours",
    findings: "Uterus firm, no tenderness",
    nursesNotes: "Mother reports mild nipple soreness, advised care"
  },
  {
    date: "April 15, 2025",
    lochialDischarges: "Light, pinkish",
    bloodPressure: "118/76 mmHg",
    feedings: "Formula feeding 4 oz every 4 hrs",
    findings: "No signs of infection",
    nursesNotes: "Baby feeding well, good weight gain observed"
  }
];

export default function PostpartumIndivHistory() {
  const hasData = postpartumData && postpartumData.length > 0;
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <div className="flex items-center mb-2">
        <Button className="text-black p-2" variant={"outline"} onClick={() => navigate(-1)}>
          <BsChevronLeft />
        </Button>
      </div>

      {/* Clinical Header */}
      <div className="flex flex-col items-center gap-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <MdOutlinePregnantWoman className="h-6 w-6 " />
            <h2 className="text-xl font-semibold text-black">Postpartum Visit Records</h2>
          </div>
          <p className="text-slate-600 text-sm font-medium">Complete record of postpartum visits and clinical notes</p>
        </div>
      </div>

      {/* Postpartum History Table */}
      {hasData ? (
        <PostpartumHistoryTable data={postpartumData} />
      ) : (
        <Card className="text-center py-16 border-slate-200">
          <CardContent>
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">
              No Clinical Records Available
            </h3>
            <p className="text-slate-500">
              No postpartum examination records have been documented.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}