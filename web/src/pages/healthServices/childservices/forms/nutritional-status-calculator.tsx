"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import type { NutritionalStatusType } from "@/form-schema/chr-schema/chr-schema"
import { NUTRITIONAL_STATUS_DESCRIPTIONS } from "@/form-schema/chr-schema/chr-schema"

interface NutritionalStatusCalculatorProps {
  weight?: number
  height?: number
  age?: string
  muac?: number
  onStatusChange: (status: NutritionalStatusType) => void
  initialStatus?: NutritionalStatusType
}

export function NutritionalStatusCalculator({
  weight,
  height,
  age,
  muac,
  onStatusChange,
  initialStatus,
}: NutritionalStatusCalculatorProps) {
  const [nutritionalStatus, setNutritionalStatus] = useState<NutritionalStatusType>(
    initialStatus || {
      wfa: "",
      lhfa: "",
      wfh: "",
      muac: undefined,
      muac_status: "",
    },
  )
  const [manualMuac, setManualMuac] = useState<number | undefined>(muac)

  // Convert age string to months (simplified - assumes format like "2 years 3 months" or "15 months")
  const parseAgeToMonths = (ageStr: string): number => {
    if (!ageStr) return 0

    // Simple parsing - you might want to make this more robust
    const yearMatch = ageStr.match(/(\d+)\s*year/i)
    const monthMatch = ageStr.match(/(\d+)\s*month/i)

    const years = yearMatch ? Number.parseInt(yearMatch[1]) : 0
    const months = monthMatch ? Number.parseInt(monthMatch[1]) : 0

    return years * 12 + months
  }

  // Simplified WHO z-score calculations (in real app, use actual WHO tables)
  const calculateWFA = (weight: number, ageInMonths: number): "" | "N" | "UW" | "SUW" | undefined => {
    if (!weight || !ageInMonths) return ""

    // Simplified calculation - replace with actual WHO standards
    const expectedWeight = 3.5 + ageInMonths * 0.5 // Very simplified
    const zScore = (weight - expectedWeight) / (expectedWeight * 0.15)

    if (zScore < -3) return "SUW"
    if (zScore < -2) return "UW"
    return "N"
  }

  const calculateLHFA = (height: number, ageInMonths: number): "" | "N" | "ST" | "SST" | "T" | "OB" | undefined => {
    if (!height || !ageInMonths) return ""

    // Simplified calculation - replace with actual WHO standards
    const expectedHeight = 50 + ageInMonths * 1.2 // Very simplified
    const zScore = (height - expectedHeight) / (expectedHeight * 0.1)

    if (zScore < -3) return "SST"
    if (zScore < -2) return "ST"
    if (zScore > 3) return "T"
    if (zScore > 2) return "OB"
    return "N"
  }

  const calculateWFH = (weight: number, height: number): "" | "N" | "W" | "SW" | "OW" | undefined => {
    if (!weight || !height) return ""

    // BMI-like calculation for children
    const bmi = weight / (height / 100) ** 2

    // Simplified thresholds - replace with actual WHO standards
    if (bmi < 12) return "SW"
    if (bmi < 14) return "W"
    if (bmi > 20) return "OW"
    if (bmi >= 14 && bmi <= 20) return "N"
    return ""
  }

  const calculateMUACStatus = (muacValue: number): "" | "N" | "MAM" | "SAM" | undefined => {
    if (!muacValue) return ""

    // MUAC thresholds in cm
    if (muacValue < 11.5) return "SAM"
    if (muacValue < 12.5) return "MAM"
    return "N"
  }

  // Calculate nutritional status when inputs change
  useEffect(() => {
    if (weight && height && age) {
      const ageInMonths = parseAgeToMonths(age)

      const newStatus: NutritionalStatusType = {
        wfa: calculateWFA(weight, ageInMonths),
        lhfa: calculateLHFA(height, ageInMonths),
        wfh: calculateWFH(weight, height),
        muac: manualMuac,
        muac_status: manualMuac ? calculateMUACStatus(manualMuac) : "",
      }

      setNutritionalStatus(newStatus)
      onStatusChange(newStatus)
    }
  }, [weight, height, age, manualMuac, onStatusChange])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "N":
        return "bg-green-100 text-green-800 border-green-200"
      case "UW":
      case "ST":
      case "W":
      case "MAM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "SUW":
      case "SST":
      case "SW":
      case "SAM":
        return "bg-red-100 text-red-800 border-red-200"
      case "T":
      case "OB":
      case "OW":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "N":
        return <CheckCircle className="w-4 h-4" />
      case "UW":
      case "ST":
      case "W":
      case "MAM":
        return <AlertTriangle className="w-4 h-4" />
      case "SUW":
      case "SST":
      case "SW":
      case "SAM":
        return <AlertCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <Card className="w-full">
     
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label className="text-sm font-medium">Current Measurements</Label>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <div>Weight: {weight ? `${weight} kg` : "Not recorded"}</div>
              <div>Height: {height ? `${height} cm` : "Not recorded"}</div>
              <div>Age: {age || "Not recorded"}</div>
            </div>
          </div>

          <div>
            <Label htmlFor="muac" className="text-sm font-medium">
              MUAC (Mid-Upper Arm Circumference) *
            </Label>
            <div className="mt-1">
              <input
                id="muac"
                type="number"
                step="0.1"
                placeholder="Enter MUAC in cm"
                value={manualMuac || ""}
                onChange={(e) => setManualMuac(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">* Manual input required</p>
            </div>
          </div>
        </div>

        {/* Status Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* WFA */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">WFA (Weight for Age)</Label>
            <div className={`p-3 rounded-lg border ${getStatusColor(nutritionalStatus.wfa || "")}`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(nutritionalStatus.wfa || "")}
                <span className="font-medium">{nutritionalStatus.wfa || "N/A"}</span>
              </div>
              <p className="text-xs mt-1">
                {nutritionalStatus.wfa
                  ? NUTRITIONAL_STATUS_DESCRIPTIONS.wfa[
                      nutritionalStatus.wfa as keyof typeof NUTRITIONAL_STATUS_DESCRIPTIONS.wfa
                    ]
                  : "No data"}
              </p>
            </div>
          </div>

          {/* L/HFA */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">L/HFA (Height for Age)</Label>
            <div className={`p-3 rounded-lg border ${getStatusColor(nutritionalStatus.lhfa || "")}`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(nutritionalStatus.lhfa || "")}
                <span className="font-medium">{nutritionalStatus.lhfa || "N/A"}</span>
              </div>
              <p className="text-xs mt-1">
                {nutritionalStatus.lhfa
                  ? NUTRITIONAL_STATUS_DESCRIPTIONS.lhfa[
                      nutritionalStatus.lhfa as keyof typeof NUTRITIONAL_STATUS_DESCRIPTIONS.lhfa
                    ]
                  : "No data"}
              </p>
            </div>
          </div>

          {/* WFH */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">WFH (Weight for Height)</Label>
            <div className={`p-3 rounded-lg border ${getStatusColor(nutritionalStatus.wfh || "")}`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(nutritionalStatus.wfh || "")}
                <span className="font-medium">{nutritionalStatus.wfh || "N/A"}</span>
              </div>
              <p className="text-xs mt-1">
                {nutritionalStatus.wfh
                  ? NUTRITIONAL_STATUS_DESCRIPTIONS.wfh[
                      nutritionalStatus.wfh as keyof typeof NUTRITIONAL_STATUS_DESCRIPTIONS.wfh
                    ]
                  : "No data"}
              </p>
            </div>
          </div>

          {/* MUAC */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">MUAC Status</Label>
            <div className={`p-3 rounded-lg border ${getStatusColor(nutritionalStatus.muac_status || "")}`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(nutritionalStatus.muac_status || "")}
                <span className="font-medium">{nutritionalStatus.muac_status || "N/A"}</span>
              </div>
              <p className="text-xs mt-1">
                {nutritionalStatus.muac_status
                  ? NUTRITIONAL_STATUS_DESCRIPTIONS.muac[
                      nutritionalStatus.muac_status as keyof typeof NUTRITIONAL_STATUS_DESCRIPTIONS.muac
                    ]
                  : "No data"}
              </p>
              {manualMuac && <p className="text-xs mt-1 font-medium">{manualMuac} cm</p>}
            </div>
          </div>
        </div>

      
      </CardContent>
    </Card>
  )
}
