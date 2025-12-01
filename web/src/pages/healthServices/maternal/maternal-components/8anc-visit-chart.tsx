"use client"

import { Check } from "lucide-react"
import { usePrenatalFormsWithCare } from "../queries/maternalFetchQueries"
import { useMemo } from "react"

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
  pregnancies?: PregnancyDataDetails[]  // legacy prop (still supported)
  patientId?: string                    // new: fetch via hook
  pregnancyId?: string                  // optional filter
  pageSize?: number                     // optional page size for pagination
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

export default function PregnancyVisitTracker({ pregnancies, patientId, pregnancyId, pageSize = 50 }: PregnancyVisitTrackerProps) {
  const { data: prenatalFormsData } = usePrenatalFormsWithCare(1, pageSize, patientId, pregnancyId)

  const pregnanciesArray = useMemo(() => (Array.isArray(pregnancies) ? pregnancies : []), [pregnancies])

  const prenatalFormsWithAOG = useMemo(() => {
    // Handle different response structures
    let results = []
    if (Array.isArray(prenatalFormsData)) {
      results = prenatalFormsData
    } else if (prenatalFormsData?.results) {
      results = prenatalFormsData.results
    } else if (prenatalFormsData?.data) {
      results = prenatalFormsData.data
    }
    
    if (!Array.isArray(results)) return []
    const forms = results.map((form: any) => {
      const careEntries = form.prenatal_care_entries || []
      // Get the latest care entry (highest AOG) for this form
      const latestCare = careEntries.length > 0 
        ? careEntries.reduce((latest: any, current: any) => {
            const latestWeeks = latest.pfpc_aog_wks || 0
            const currentWeeks = current.pfpc_aog_wks || 0
            return currentWeeks > latestWeeks ? current : latest
          })
        : null
      
      return {
        pf_id: form.pf_id,
        aog_wks: latestCare?.pfpc_aog_wks,
        aog_days: latestCare?.pfpc_aog_days,
        date: latestCare?.pfpc_date || form.created_at,
      }
    }).filter(f => f.aog_wks != null) // Only count forms with valid AOG
    return forms
  }, [prenatalFormsData])

  // Fallback: if no fetched forms and no legacy pregnancies data
  const noData = !pregnanciesArray.length && !prenatalFormsWithAOG.length
  if (noData) {
    return <div className="text-center text-gray-500">No pregnancy / prenatal care data available</div>
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

  // Trimester classification based on AOG weeks (WHO simplified 8 ANC schedule boundaries)
  // 1st: <=13 weeks 6 days, 2nd: 14w0d - 27w6d, 3rd: >=28w0d
  const classifyTrimesterByAOG = (wks?: number | null): 1 | 2 | 3 | 0 => {
    if (wks == null || isNaN(wks)) return 0
    if (wks <= 13) return 1
    if (wks >= 14 && wks <= 27) return 2
    if (wks >= 28) return 3
    return 0
  }

  const visitCounts = useMemo(() => {
    let t1 = 0, t2 = 0, t3 = 0

    // Prefer prenatal forms with AOG if available (1 pf_id = 1 visit)
    if (prenatalFormsWithAOG.length) {
      prenatalFormsWithAOG.forEach(form => {
        const tri = classifyTrimesterByAOG(form.aog_wks)
        if (tri === 1) t1++
        else if (tri === 2) t2++
        else if (tri === 3) t3++
      })
    } else {
      // Legacy fallback using month-diff approach on pregnancies
      pregnanciesArray.forEach(preg => {
        const prenatalForms = preg.prenatal_form || []
        if (prenatalForms.length) {
          const firstForm = prenatalForms[0]
          const trimesterLabel = getFollowUpTrimester(firstForm.created_at, preg.created_at)
          if (trimesterLabel === '1-3 months') t1++
          else if (trimesterLabel === '4-6 months') t2++
          else if (trimesterLabel === '7-9 months') t3++
        }
        (preg.follow_up || []).forEach(v => {
          if (v.followv_status?.toLowerCase() === 'completed') {
            const trimesterLabel = getFollowUpTrimester(v.followv_date, preg.created_at)
            if (trimesterLabel === '1-3 months') t1++
            else if (trimesterLabel === '4-6 months') t2++
            else if (trimesterLabel === '7-9 months') t3++
          }
        })
      })
    }
    return { first: t1, second: t2, third: t3 }
  }, [prenatalFormsWithAOG, pregnanciesArray])

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
              <p className="text-xs text-gray-600">Minimum: 1 visit (≤13w)</p>
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
              <p className="text-xs text-gray-600">Minimum: 2 visits (14–27w)</p>
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
              <p className="text-xs text-gray-600">Minimum: 5 visits (≥28w)</p>
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
