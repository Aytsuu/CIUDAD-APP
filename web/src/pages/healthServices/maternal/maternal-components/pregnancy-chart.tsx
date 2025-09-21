"use client";

import { Clock, CheckCircle, HeartHandshake, Tally5 } from "lucide-react"

interface PregnancyDataDetails {
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
  }[];
  postpartum_record?: {
    ppr_id: string;
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
    }[];
  }[];
}

interface PregnancyChartProps {
  pregnancies: PregnancyDataDetails[];
}

export default function PregnancyChart({ pregnancies }: PregnancyChartProps) {
  if (!pregnancies || pregnancies.length === 0) {
    return <div className="text-center text-gray-500">No pregnancy data available</div>;
  }

  const normalizeStatus = (statusRaw: string): "Active" | "Completed" | "Pregnancy Loss" => {
    const s = statusRaw.toLowerCase();
    if (s === "active") return "Active";
    if (s === "completed") return "Completed";
    return "Pregnancy Loss"; // covers both "pregnancy loss" and any unknown variants
  };

  // Calculate counts using the normalized status
  const activePregnancies = pregnancies.filter((p) => normalizeStatus(p.status) === "Active").length;
  const completedPregnancies = pregnancies.filter((p) => normalizeStatus(p.status) === "Completed").length;
  const pregnancyLoss = pregnancies.filter((p) => normalizeStatus(p.status) === "Pregnancy Loss").length;

	return (
		<div className="bg-white rounded-sm shadow-md border border-gray-200">
			<div className="p-4 w-full">
				<h2 className="flex items-center text-lg font-semibold mb-3 gap-1"><Tally5 size={24} color="#f97316"/> Overall Pregnancy Summary</h2>
				<div className="grid grid-cols-2 gap-2 w-full">
					{/* active */}
					<div className="flex flex-col text-center rounded-md border p-4 gap-2">
						<span className="flex items-center">
							<CheckCircle size={16} color="blue"/>
							<h3 className="text-sm font-semibold ml-1">Completed Pregnancies</h3>
						</span>
						<div className="flex justify-center p-4">
							<p className="text-[30px] font-bold">{completedPregnancies}</p>
						</div>
						
					</div>
					{/* completed and pregnancy loss*/}
					<div className="grid grid-rows-2 gap-1">
						<div className="flex flex-col text-center border rounded-md p-3">
							<span className="flex items-center">
								<Clock size={16} color="green"/>
								<h3 className="text-sm font-semibold ml-1">Active Pregnancy</h3>
							</span>
							<p className="text-[20px] font-bold">{activePregnancies}</p>
						</div>
						<div className="flex flex-col text-center border rounded-md p-3">
							<span className="flex items-center">
								<HeartHandshake size={16} className="text-red-500"/>
								<h3 className="text-sm font-semibold ml-1">Pregnancy Loss</h3>
							</span>
							<p className="text-[20px] font-bold">{pregnancyLoss}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
