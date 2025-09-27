"use client"

import { Clock, CalendarCheck } from "lucide-react"


interface PregnancyDataDetails{
  pregnancy_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  prenatal_end_date?: string;
  postpartum_end_date?: string;
  pat_id: string;
  prenatal_form?: {
    pf_id: string;
    pf_lmp: string;
    pf_edc: string;
    created_at: string;
  }[]
  postpartum_record?: {
    ppr_id:string;
    delivery_date: string | "N/A";
    created_at: string;
    updated_at: string;
    postpartum_assessment?: {
      ppa_id: string;
      ppa_date: string;
      ppa_lochial_discharges: string;
      ppa_blood_pressure: string;
      ppa_feedings: string;
      ppa_findings: string;
      ppa_nurses_notes: string;
      created_at: string;
      updated_at: string;
    }[]
  }[]
}

interface PregnancyVisitTrackerProps {
	pregnancies: PregnancyDataDetails[];
}

export default function PregnancyVisitTracker({ pregnancies }: PregnancyVisitTrackerProps) {
	if (!pregnancies || pregnancies.length === 0) {
		return <div className="text-center text-gray-500">No pregnancy data available</div>
	}

// 	const normalizeStatus = (statusRaw: string | undefined): "Active" | "Completed" | "Pregnancy Loss" => {
//   if (!statusRaw) return "Pregnancy Loss";
//   const s = statusRaw.toLowerCase();
//   if (s === "active") return "Active";
//   if (s === "completed") return "Completed";
//   return "Pregnancy Loss";
// }

  // counts
  // const completedPregnancies = pregnancies.filter(p => normalizeStatus(p.status) === "Completed").length;
	

	return (
		<div className="bg-white rounded-sm shadow-md border border-gray-200">
			<div className="p-4 w-full">
				<h2 className="flex items-center text-lg font-semibold mb-3 gap-1"><CalendarCheck size={24} color="red"/> 8 ANC Visit Tracker</h2>
				<div className="grid grid-cols-3 gap-2 w-full">
					{/* 1st trimester */}
					<div className="flex flex-col text-center rounded-md border p-4 gap-2">
						<span className="flex flex-col">
              <div className="flex items-center">
                <Clock size={16} color="green"/>
                <h3 className="text-sm font-semibold ml-1">1-3 months</h3>
              </div>
							<div className="flex">
                <p className="text-[11px] pl-5 text-black/50 font-bold italic">Atleast 1 visit</p>
              </div>
						</span>
						<div className="flex justify-center p-4">
							<p className="text-[14px] font-bold">Date</p>
						</div>
					</div>
                    {/* 2nd trimester */}
          <div className="flex flex-col text-center rounded-md border p-4 gap-2">
						<span className="flex flex-col">
              <div className="flex items-center">
                <Clock size={16} color="green"/>
                <h3 className="text-sm font-semibold ml-1">4-6 months</h3>
              </div>
							<div className="flex">
                <p className="text-[11px] pl-5 text-black/50 font-bold italic">Atleast 2 visits</p>
              </div>
						</span>
						<div className="flex justify-center p-4">
							<p className="text-[14px] font-bold">Date</p>
						</div>
					</div>
                    {/* 3rd trimester */}
          <div className="flex flex-col text-center rounded-md border p-4 gap-2">
						<span className="flex flex-col">
              <div className="flex items-center">
                <Clock size={16} color="green"/>
                <h3 className="text-sm font-semibold ml-1">7-9 months</h3>
              </div>
							<div className="flex">
                <p className="text-[11px] pl-5 text-black/50 font-bold italic">Atleast 5 visits</p>
              </div>
						</span>
						<div className="flex justify-center p-4">
							<p className="text-[14px] font-bold">Date</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}