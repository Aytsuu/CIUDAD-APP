// pages/PrenatalIndivHistory.tsx
import { Card, CardContent } from "@/components/ui/card/card";
import { Button } from "@/components/ui/button/button";
import { BsChevronLeft } from "react-icons/bs";
import { useNavigate } from "react-router";
import { Stethoscope, FileText } from "lucide-react";
import { MdOutlinePregnantWoman } from "react-icons/md";
import { PrenatalHistoryTable } from "../maternal-components/prenatal-history";

interface PrenatalVisit {
  date: string;
  aog: string;
  weight: string;
  bloodPressure: string;
  leopoldsFindings: {
    fundalHeight: string;
    fetalHeartbeat: string;
    fetalPosition: string;
  };
  notes: {
    complaint: string;
    advice: string;
  };
}

const prenatalData: PrenatalVisit[] = [
  {
    date: "January 15, 2025",
    aog: "12 wks 3 days",
    weight: "55 kg",
    bloodPressure: "110/70 mmHg",
    leopoldsFindings: {
      fundalHeight: "3cm",
      fetalHeartbeat: "132 BPM",
      fetalPosition: "Cephalic"
    },
    notes: {
      complaint: "Heartburn and Leg Cramps",
      advice: "Avoiding foods and drinks that trigger heartburn, such as citrus, spicy, fatty or greasy foods, caffeine, and carbonated beverages."
    }
  },
  {
    date: "February 15, 2025",
    aog: "16 wks 3 days",
    weight: "60 kg",
    bloodPressure: "110/80 mmHg",
    leopoldsFindings: {
      fundalHeight: "4cm",
      fetalHeartbeat: "120 BPM",
      fetalPosition: "Cephalic"
    },
    notes: {
      complaint: "Weight Gain",
      advice: "Eat a balanced diet rich in whole grains, fruits, vegetables, lean proteins, and low-fat dairy while limiting added sugars, solid fats, and highly processed foods"
    }
  },
  {
    date: "March 15, 2025",
    aog: "20 wks 3 days",
    weight: "63 kg",
    bloodPressure: "120/80 mmHg",
    leopoldsFindings: {
      fundalHeight: "4cm",
      fetalHeartbeat: "120 BPM",
      fetalPosition: "Cephalic"
    },
    notes: {
      complaint: "Weight Gain and Back Pain",
      advice: "Eat a balanced diet rich in whole grains, fruits, vegetables, lean proteins, and low-fat dairy while limiting added sugars, solid fats, and highly processed foods"
    }
  },
  {
    date: "April 15, 2025",
    aog: "24 wks 3 days",
    weight: "63 kg",
    bloodPressure: "120/80 mmHg",
    leopoldsFindings: {
      fundalHeight: "4cm",
      fetalHeartbeat: "120 BPM",
      fetalPosition: "Cephalic"
    },
    notes: {
      complaint: "Weight Gain and Back Pain",
      advice: "Eat a balanced diet rich in whole grains, fruits, vegetables, lean proteins, and low-fat dairy while limiting added sugars, solid fats, and highly processed foods"
    }
  }
];

export default function PrenatalIndivHistory() {
  const hasData = prenatalData && prenatalData.length > 0;
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
          <MdOutlinePregnantWoman className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-black">Prenatal Visit Records</h2>
        </div>
			  <p className="text-slate-600 text-sm font-medium">Complete record of prenatal visits and clinical notes</p>
			</div>
		</div>

		{/* Prenatal History Table */}
		{hasData ? (
			<PrenatalHistoryTable data={prenatalData} />
		) : (
			<Card className="text-center py-16 border-slate-200">
			<CardContent>
				<FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
				<h3 className="text-lg font-medium text-slate-700 mb-2">
					No Clinical Records Available
				</h3>
				<p className="text-slate-500">
					No prenatal examination records have been documented.
				</p>
			</CardContent>
			</Card>
		)}
	</div>
  );
}