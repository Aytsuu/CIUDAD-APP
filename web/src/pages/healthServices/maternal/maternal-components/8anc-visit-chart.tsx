"use client"

import { Check } from "lucide-react"

interface PregnancyDataDetails {
  pregnancy_id: string
  status: string
  created_at: string
  updated_at: string
  prenatal_end_date?: string
  postpartum_end_date?: string
  pat_id: string
  prenatal_form?: {
    pf_id: string
    pf_lmp: string
    pf_edc: string
    created_at: string
  }[]
  postpartum_record?: {
    ppr_id: string
    delivery_date: string | "N/A"
    created_at: string
    updated_at: string
    postpartum_assessment?: {
      ppa_id: string
      ppa_date: string
      ppa_lochial_discharges: string
      ppa_blood_pressure: string
      ppa_feedings: string
      ppa_findings: string
      ppa_nurses_notes: string
      created_at: string
      updated_at: string
    }[]
  }[]
  follow_up?: {
    followv_id: number
    followv_date: string
    followv_status: string
    followv_description: string
    created_at: string
    completed_at: string | null
    patrec: number
  }[]
}

interface PregnancyVisitTrackerProps {
  pregnancies: PregnancyDataDetails[]
}

interface VisitCheckmarksProps {
  requiredVisits: number
  completedVisits: number
}

function VisitCheckmarks({ requiredVisits, completedVisits }: VisitCheckmarksProps) {
  return (
    <div className="flex gap-2 justify-center items-center flex-wrap">
      {Array.from({ length: requiredVisits }).map((_, index) => {
        const isCompleted = index < completedVisits
        return (
          <div
            key={index}
            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
              isCompleted ? "bg-green-500 border-green-500" : "bg-gray-200 border-gray-300"
            }`}
          >
            <Check size={14} className={isCompleted ? "text-white" : "text-gray-400"} />
          </div>
        )
      })}
    </div>
  )
}

export default function PregnancyVisitTracker({ pregnancies }: PregnancyVisitTrackerProps) {
  // Ensure pregnancies is always an array
  const pregnanciesArray = Array.isArray(pregnancies) ? pregnancies : []
  
  if (pregnanciesArray.length === 0) {
    return <div className="text-center text-gray-500">No pregnancy data available</div>
  }

  // Helper function: Calculate which trimester a follow-up visit belongs to
  const getFollowUpTrimester = (
    followUpDate: string,
    pregnancyStartDate: string
  ): "1-3 months" | "4-6 months" | "7-9 months" | "unknown" => {
    const followUp = new Date(followUpDate)
    const pregnancyStart = new Date(pregnancyStartDate)
    
    // Calculate months difference
    const monthsDiff = 
      (followUp.getFullYear() - pregnancyStart.getFullYear()) * 12 +
      (followUp.getMonth() - pregnancyStart.getMonth())
    
    if (monthsDiff >= 0 && monthsDiff < 3) {
      return "1-3 months"
    } else if (monthsDiff >= 3 && monthsDiff < 6) {
      return "4-6 months"
    } else if (monthsDiff >= 6 && monthsDiff < 9) {
      return "7-9 months"
    }
    
    return "unknown"
  }

  // Helper function: Count completed visits per trimester
  const countVisitsByTrimester = () => {
    let firstTrimester = 0
    let secondTrimester = 0
    let thirdTrimester = 0

    // Process each pregnancy (including all statuses, not just "active")
    pregnanciesArray.forEach((pregnancy) => {
      const pregnancyStartDate = pregnancy.created_at
      const followUps = pregnancy.follow_up || []
      const prenatalForms = pregnancy.prenatal_form || []

      // Count only the FIRST prenatal form creation as the initial visit
      if (prenatalForms.length > 0) {
        const firstPrenatalForm = prenatalForms[0]
        const trimester = getFollowUpTrimester(firstPrenatalForm.created_at, pregnancyStartDate)
        
        switch (trimester) {
          case "1-3 months":
            firstTrimester++
            break
          case "4-6 months":
            secondTrimester++
            break
          case "7-9 months":
            thirdTrimester++
            break
        }
      }

      // Count completed follow-ups by trimester
      followUps.forEach((visit) => {
        // Only count completed visits
        if (visit.followv_status.toLowerCase() === "completed") {
          const trimester = getFollowUpTrimester(visit.followv_date, pregnancyStartDate)
          
          switch (trimester) {
            case "1-3 months":
              firstTrimester++
              break
            case "4-6 months":
              secondTrimester++
              break
            case "7-9 months":
              thirdTrimester++
              break
          }
        }
      })
    })

    return {
      first: firstTrimester,
      second: secondTrimester,
      third: thirdTrimester,
    }
  }

  // Calculate actual visit counts
  const visitCounts = countVisitsByTrimester()
  const firstTrimesterVisits = visitCounts.first
  const secondTrimesterVisits = visitCounts.second
  const thirdTrimesterVisits = visitCounts.third

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200">
      <div className="p-4 w-full">
        <h2 className="flex justify-between items-center text-lg font-semibold mb-3 gap-1">
          8 ANC Visit Tracker <p className="bg-pink-200 text-xs text-pink-800 border-pink-600 border rounded-md px-2 py-0.5">Latest Pregnancy</p>
        </h2>
        <div className="grid grid-cols-3 gap-2 w-full">
          {/* 1st trimester */}
          <div className="flex flex-col text-center rounded-md border p-4 gap-2">
            <span className="flex flex-col">
              <div className="flex items-center justify-center">
                <h3 className="text-sm font-semibold">1st Trimester</h3>
              </div>
              <div className="flex justify-center">
                <p className="text-[11px] text-black/50 font-bold italic">1-3 months</p>
              </div>
            </span>
            <div className="flex flex-col gap-2 p-2">
              <p className="text-xs text-gray-600">Minimum: 1 visit</p>
              <p className="text-sm font-semibold text-gray-800">
                {firstTrimesterVisits} {firstTrimesterVisits === 1 ? "visit" : "visits"}
              </p>
              <VisitCheckmarks requiredVisits={1} completedVisits={firstTrimesterVisits} />
            </div>
          </div>

          {/* 2nd trimester */}
          <div className="flex flex-col text-center rounded-md border p-4 gap-2">
            <span className="flex flex-col">
              <div className="flex items-center justify-center">
                <h3 className="text-sm font-semibold">2nd Trimester</h3>
              </div>
              <div className="flex justify-center">
                <p className="text-[11px] text-black/50 font-bold italic">4-6 months</p>
              </div>
            </span>
            <div className="flex flex-col gap-2 p-2">
              <p className="text-xs text-gray-600">Minimum: 2 visits</p>
              <p className="text-sm font-semibold text-gray-800">
                {secondTrimesterVisits} {secondTrimesterVisits === 1 ? "visit" : "visits"}
              </p>
              <VisitCheckmarks requiredVisits={2} completedVisits={secondTrimesterVisits} />
            </div>
          </div>

          {/* 3rd trimester */}
          <div className="flex flex-col text-center rounded-md border p-4 gap-2">
            <span className="flex flex-col">
              <div className="flex items-center justify-center">
                <h3 className="text-sm font-semibold">3rd Trimester</h3>
              </div>
              <div className="flex justify-center">
                <p className="text-[11px] text-black/50 font-bold italic">7-9 months</p>
              </div>
            </span>
            <div className="flex flex-col gap-2 p-2">
              <p className="text-xs text-gray-600">Minimum: 5 visits</p>
              <p className="text-sm font-semibold text-gray-800">
                {thirdTrimesterVisits} {thirdTrimesterVisits === 1 ? "visit" : "visits"}
              </p>
              <VisitCheckmarks requiredVisits={5} completedVisits={thirdTrimesterVisits} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
