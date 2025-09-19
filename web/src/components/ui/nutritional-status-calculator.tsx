"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import type { NutritionalStatusType } from "@/form-schema/chr-schema/chr-schema";
import { LFA_GIRLS_TABLE, LFA_BOYS_TABLE, WFA_BOYS_TABLE, WFA_GIRLS_TABLE, WFH_BOYS_TABLE, WFH_GIRLS_TABLE } from "@/pages/healthServices/childservices/tables/who-tables";

interface NutritionalStatusCalculatorProps {
  weight?: number;
  height?: number;
  age?: string;
  muac?: number;
  onStatusChange: (status: NutritionalStatusType) => void;
  initialStatus?: NutritionalStatusType;
  gender?: "Male" | "Female";
}

interface AgeDetails {
  days: number;
  weeks: number;
  months: number;
  totalDays: number;
}

export function NutritionalStatusCalculator({ weight, height, age, muac, onStatusChange, initialStatus, gender = "Male" }: NutritionalStatusCalculatorProps) {
  const [nutritionalStatus, setNutritionalStatus] = useState<NutritionalStatusType>(
    initialStatus || {
      wfa: "",
      lhfa: "",
      wfh: "",
      muac: undefined,
      muac_status: ""
    }
  );
  const [manualMuac, setManualMuac] = useState<number | undefined>(muac);

  const parseAge = (ageStr: string): AgeDetails => {
    if (!ageStr) return { days: 0, weeks: 0, months: 0, totalDays: 0 };

    const yearsMatch = ageStr.match(/(\d+)\s*year/i);
    const monthsMatch = ageStr.match(/(\d+)\s*month/i);
    const weeksMatch = ageStr.match(/(\d+)\s*week/i);
    const daysMatch = ageStr.match(/(\d+)\s*day/i);

    const years = yearsMatch ? parseInt(yearsMatch[1]) : 0;
    const months = monthsMatch ? parseInt(monthsMatch[1]) : 0;
    const weeks = weeksMatch ? parseInt(weeksMatch[1]) : 0;
    const days = daysMatch ? parseInt(daysMatch[1]) : 0;

    const totalMonths = months + years * 12;
    const totalDays = days + weeks * 7 + totalMonths * 30.44;

    return {
      days,
      weeks,
      months: totalMonths,
      totalDays: Math.round(totalDays)
    };
  };

  // Weight-for-Age (WFA) calculation using WHO tables
  const calculateWFA = (weight: number, age: AgeDetails): string => {
    if (!weight || age.months > 71) return ""; // WFA only valid up to 71 months

    const table = gender === "Female" ? WFA_GIRLS_TABLE : WFA_BOYS_TABLE;
    const ageInMonths = Math.floor(age.months);

    // Get the reference values for this age
    const referenceData = table[ageInMonths];
    if (!referenceData) return "";

    // Classify based on WHO cutoff points
    if (weight <= referenceData.severelyCutoff) return "SUW"; // Severely underweight (< -3 SD)
    if (weight <= referenceData.underweightTo) return "UW"; // Underweight (-3 to -2 SD)
    if (weight >= referenceData.overweight) return "OW"; // Overweight (> +2 SD)
    return "N"; // Normal (-2 to +2 SD)
  };

  // Length/Height-for-Age (L/HFA) calculation using WHO tables
  const calculateLHFA = (height: number, age: AgeDetails): string => {
    if (!height || age.months > 71) return ""; // L/HFA only valid up to 71 months

    const table = gender === "Female" ? LFA_GIRLS_TABLE : LFA_BOYS_TABLE;
    const ageInMonths = Math.floor(age.months);

    // Get the reference values for this age
    const referenceData = table[ageInMonths];
    if (!referenceData) return "";

    // Classify based on WHO cutoff points
    if (height <= referenceData.severelyCutoff) return "SST"; // Severely stunted (< -3 SD)
    if (height <= referenceData.stuntedTo) return "ST"; // Stunted (-3 to -2 SD)
    if (height >= referenceData.tall) return "T"; // Tall (> +2 SD)
    return "N"; // Normal (-2 to +2 SD)
  };

  // Weight-for-Height (WFH) calculation using WHO tables
  const calculateWFH = (weight: number, height: number): string => {
    if (!weight || !height) return "";

    // Only valid for ages 24-60 months (heights roughly 65-120 cm)
    if (height < 65 || height > 120) return "";

    const table = gender === "Female" ? WFH_GIRLS_TABLE : WFH_BOYS_TABLE;

    // Find the closest height in the table (round to nearest 0.5 cm)
    const roundedHeight = Math.round(height * 2) / 2;
    const referenceData = table[roundedHeight];

    if (!referenceData) {
      // If exact height not found, try nearest values
      const availableHeights = Object.keys(table)
        .map(Number)
        .sort((a, b) => a - b);
      const closestHeight = availableHeights.reduce((prev, curr) => (Math.abs(curr - height) < Math.abs(prev - height) ? curr : prev));
      const closestData = table[closestHeight];
      if (!closestData) return "";

      // Classify based on WHO WFH cutoff points
      if (weight <= closestData.severelyCutoff) return "SW"; // Severely wasted (< -3 SD)
      if (weight <= closestData.wastedTo) return "W"; // Wasted (-3 to -2 SD)
      if (weight >= closestData.overweightFrom && weight <= closestData.overweightTo) return "OW"; // Overweight (+2 to +3 SD)
      if (weight >= closestData.obeseFrom) return "OB"; // Obese (> +3 SD)
      return "N"; // Normal (-2 to +2 SD)
    }

    // Classify based on WHO WFH cutoff points
    if (weight <= referenceData.severelyCutoff) return "SW"; // Severely wasted (< -3 SD)
    if (weight <= referenceData.wastedTo) return "W"; // Wasted (-3 to -2 SD)
    if (weight >= referenceData.overweightFrom && weight <= referenceData.overweightTo) return "OW"; // Overweight (+2 to +3 SD)
    if (weight >= referenceData.obeseFrom) return "OB"; // Obese (> +3 SD)
    return "N"; // Normal (-2 to +2 SD)
  };

  // MUAC classification
  const calculateMUACStatus = (muacValue: number, ageInMonths: number): string => {
    if (!muacValue || ageInMonths < 6 || ageInMonths > 59) return "";

    if (muacValue < 11.5) return "SAM"; // Severe Acute Malnutrition
    if (muacValue < 12.5) return "MAM"; // Moderate Acute Malnutrition
    return "N"; // Normal
  };

  useEffect(() => {
    const ageDetails = parseAge(age || "");

    const newStatus: NutritionalStatusType = {
      wfa: weight ? (calculateWFA(weight, ageDetails) as "" | "N" | "UW" | "SUW" | "OW" | undefined) : "",
      lhfa: height ? (calculateLHFA(height, ageDetails) as "" | "N" | "ST" | "SST" | "T" | undefined) : "",
      wfh: weight && height ? (calculateWFH(weight, height) as "" | "N" | "W" | "SW" | "OW" | "OB" | undefined) : "",
      muac: manualMuac,
      muac_status: manualMuac ? (calculateMUACStatus(manualMuac, ageDetails.months) as "" | "N" | "MAM" | "SAM" | undefined) : ""
    };

    setNutritionalStatus(newStatus);
    onStatusChange(newStatus);
  }, [weight, height, age, manualMuac, onStatusChange, gender]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "N":
        return "bg-green-100 text-green-800 border-green-200";
      case "UW":
      case "ST":
      case "W":
      case "MAM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "SUW":
      case "SST":
      case "SW":
      case "SAM":
        return "bg-red-100 text-red-800 border-red-200";
      case "OW":
      case "OB":
      case "T":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "N":
        return <CheckCircle className="w-4 h-4" />;
      case "UW":
      case "ST":
      case "W":
      case "MAM":
      case "OW":
      case "T":
        return <AlertTriangle className="w-4 h-4" />;
      case "SUW":
      case "SST":
      case "SW":
      case "SAM":
      case "OB":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getDetailedDescription = (indicator: string, status: string) => {
    const descriptions = {
      wfa: {
        SUW: "Severely underweight (below -3 SD cutoff)",
        UW: "Underweight (-3 to -2 SD range)",
        N: "Normal weight for age (-2 to +2 SD)",
        OW: "Overweight (above +2 SD cutoff)"
      },
      lhfa: {
        SST: "Severely stunted (z-score < -3)",
        ST: "Stunted (z-score -3 to -2)",
        N: "Normal height for age (z-score -2 to +2)",
        T: "Tall for age (z-score > +2)"
      },
      wfh: {
        SW: "Severely wasted (z-score < -3)",
        W: "Wasted (z-score -3 to -2)",
        N: "Normal weight for height (z-score -2 to +2)",
        OW: "Overweight (z-score +2 to +3)",
        OB: "Obese (z-score > +3)"
      },
      muac: {
        SAM: "Severe Acute Malnutrition (MUAC < 11.5 cm)",
        MAM: "Moderate Acute Malnutrition (MUAC 11.5-12.4 cm)",
        N: "Normal (MUAC ≥ 12.5 cm)"
      }
    };

    return descriptions[indicator as keyof typeof descriptions]?.[status as keyof (typeof descriptions)[keyof typeof descriptions]] || "No data";
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div>
            <Label className="text-sm font-medium">Current Measurements</Label>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <div>Weight: {weight ? `${weight} kg` : "Not recorded"}</div>
              <div>Height: {height ? `${height} cm` : "Not recorded"}</div>
              <div>Age: {age || "Not recorded"}</div>
              <div>Gender: {gender}</div>
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
              <p className="mt-1 text-xs text-gray-500">* Manual input required (valid for children 6-59 months)</p>
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
              <p className="text-xs mt-1">{nutritionalStatus.wfa ? getDetailedDescription("wfa", nutritionalStatus.wfa) : "No data available"}</p>
              {weight && <p className="text-xs mt-1 font-medium">{weight} kg</p>}
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
              <p className="text-xs mt-1">{nutritionalStatus.lhfa ? getDetailedDescription("lhfa", nutritionalStatus.lhfa) : "No data available"}</p>
              {height && <p className="text-xs mt-1 font-medium">{height} cm</p>}
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
              <p className="text-xs mt-1">{nutritionalStatus.wfh ? getDetailedDescription("wfh", nutritionalStatus.wfh) : "No data available"}</p>
              {weight && height && (
                <p className="text-xs mt-1 font-medium">
                  {weight}kg / {height}cm
                </p>
              )}
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
              <p className="text-xs mt-1">{nutritionalStatus.muac_status ? getDetailedDescription("muac", nutritionalStatus.muac_status) : "No data available"}</p>
              {manualMuac && <p className="text-xs mt-1 font-medium">{manualMuac} cm</p>}
            </div>
          </div>
        </div>

        {/* WHO Classification Note */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Classifications based on WHO Child Growth Standards:
            <br />• <strong>WFA:</strong> Uses official WHO weight-for-age reference tables with gender-specific cutoff points (0-71 months)
            <br />• <strong>L/HFA:</strong> Uses official WHO length/height-for-age reference tables with gender-specific cutoff points (0-71 months)
            <br />• <strong>WFH:</strong> Uses official WHO weight-for-height reference tables with gender-specific cutoff points (24-60 months, 65-120 cm)
            <br />• <strong>MUAC:</strong> WHO standard cutoffs for children 6-59 months only
            <br />• <strong>Classifications:</strong> Normal (-2 to +2 SD), Moderate (-3 to -2 SD), Severe (&lt; -3 SD), Overweight (+2 to +3 SD), Obese (&gt; +3 SD)
            <br />• <strong>All tables:</strong> Based on your provided WHO reference data with exact cutoff values for precise classification
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
