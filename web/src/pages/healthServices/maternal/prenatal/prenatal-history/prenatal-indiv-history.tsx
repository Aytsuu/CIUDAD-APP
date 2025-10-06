// pages/PrenatalIndivHistory.tsx
// import { useNavigate } from "react-router";
// import { Card, CardContent } from "@/components/ui/card/card";
// import { Button } from "@/components/ui/button/button";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useState } from "react";


// import { FileText } from "lucide-react";
// import { MdOutlinePregnantWoman } from "react-icons/md";
import { PrenatalHistoryTable } from "../../maternal-components/prenatal-history";
// import PrenatalIndivHistoryTab from "./prenatal-indiv-history-tab";
import PrenatalFormHistory from "./prenatal-form-history";

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
  const [activeTab, setActiveTab] = useState("prenatalcare");

 const getTabStyle = (tab: string) => {
		const baseClasses = "flex justify-center items-center cursor-pointer text-black/70 transition-colors duration-200 ease-in-out rounded-md p-2";
		
		if (activeTab === tab) {
			// Active tab styles
			return `${baseClasses} bg-white shadow-md border text-blue-500`;
		} else {
			// Inactive tab styles
			return `${baseClasses} bg-blue-50 text-gray-100 hover:bg-white/`;
		}
	}

  return (
    <LayoutWithBack 
      title="Prenatal Visit Records"
      description="Complete record of prenatal visits and clinical notes"
    >
      <div className="bg-blue-50/50 p-3 space-y-2">
        <div className="bg-white/70 p-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={getTabStyle("prenatalcare")} onClick={() => setActiveTab("prenatalcare")}>
              <h2 className="font-semibold">Prenatal Care History</h2>
            </div>

            <div className={getTabStyle("prenatalform")} onClick={() => setActiveTab("prenatalform")}>
              <h2 className="font-semibold">Prenatal Form History</h2>
            </div>
          </div>
        </div>

        {/* Prenatal History Table */}
        {hasData && activeTab === "prenatalcare" && (
          <PrenatalHistoryTable data={prenatalData} />
        // ) : (
        //   <Card className="text-center py-16 border-slate-200">
        //   <CardContent>
        //     <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        //     <h3 className="text-lg font-medium text-slate-700 mb-2">
        //       No Clinical Records Available
        //     </h3>
        //     <p className="text-slate-500">
        //       No prenatal examination records have been documented.
        //     </p>
        //   </CardContent>
        //   </Card>
        )}

        {activeTab === "prenatalform" && (
          <PrenatalFormHistory/>
        )}
      </div>
    </LayoutWithBack>
  );
}