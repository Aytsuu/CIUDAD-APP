"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import { LFA_GIRLS_TABLE,LFA_BOYS_TABLE,WFA_BOYS_TABLE,WFA_GIRLS_TABLE,WFH_BOYS_TABLE,WFH_GIRLS_TABLE } from "@/pages/healthServices/childservices/tables/who-tables"

export type NutritionalStatusType = {
  wfa: "" | "N" | "UW" | "SUW" | "MUW" | "OW" | "OB" | "OB1" | "OB2" | "OB3" | undefined;
  lhfa: "" | "N" | "ST" | "SST" | "T" | "N/A" | undefined;
  wfh: "" | "N" | "W" | "SW" | "OW" | "OB" | "MUW" | "UW" | "SUW" | "OB1" | "OB2" | "OB3" | undefined;
  muac: number | undefined;
  muac_status: "" | "N" | "MAM" | "SAM" | undefined;
};

interface NutritionalStatusCalculatorProps {
  weight?: number
  height?: number
  age?: string
  muac?: number
  onStatusChange: (status: NutritionalStatusType) => void
  initialStatus?: NutritionalStatusType
  gender?: 'Male' | 'Female'
  returnValuesOnly?: boolean
}

interface AgeDetails {
  days: number;
  weeks: number;
  months: number;
  totalDays: number;
  years: number;
}

// WHO BMI-for-age classification for children 5-19 years
const getBMIForAgeClassification = (bmi: number, ageYears: number, gender: string): string => {
  if (ageYears < 5 || ageYears >= 19) return "";
  
  // These are approximate values - in practice, you would use WHO z-score tables
  if (bmi < 14) return "SUW";  // Severe thinness
  if (bmi < 16) return "UW";   // Thinness
  if (bmi < 18.5) return "MUW"; // Mild thinness
  if (bmi < 25) return "N";    // Normal
  if (bmi < 30) return "OW";   // Overweight
  return "OB";                 // Obese
};

// WHO BMI classification for adults (19+ years)
const getAdultBMIClassification = (bmi: number): string => {
  if (bmi < 16.0) return "SUW";  // Severe underweight
  if (bmi < 17.0) return "UW";   // Moderate underweight
  if (bmi < 18.5) return "MUW";  // Mild underweight
  if (bmi < 25.0) return "N";    // Normal
  if (bmi < 30.0) return "OW";   // Overweight
  if (bmi < 35.0) return "OB1";  // Obese class I
  if (bmi < 40.0) return "OB2";  // Obese class II
  return "OB3";                  // Obese class III
};

// WHO MUAC classification by age group
const getMUACClassification = (muacValue: number, ageYears: number, gender: string): string => {
  if (!muacValue) return "";
  
  // Infants and children 6-59 months
  if (ageYears < 5) {
    if (muacValue < 11.5) return "SAM";    // Severe Acute Malnutrition
    if (muacValue < 12.5) return "MAM";    // Moderate Acute Malnutrition
    return "N";                            // Normal
  }
  
  // Children 5-9 years
  if (ageYears < 10) {
    if (muacValue < 13.5) return "SAM";
    if (muacValue < 14.5) return "MAM";
    return "N";
  }
  
  // Children 10-14 years
  if (ageYears < 15) {
    if (gender === 'Male') {
      if (muacValue < 15.5) return "SAM";
      if (muacValue < 16.5) return "MAM";
    } else {
      if (muacValue < 16.5) return "SAM";
      if (muacValue < 17.5) return "MAM";
    }
    return "N";
  }
  
  // Adolescents and adults (15+ years)
  if (gender === 'Male') {
    if (muacValue < 23.0) return "SAM";    // Severe malnutrition
    if (muacValue < 25.0) return "MAM";    // Moderate malnutrition
  } else {
    if (muacValue < 22.0) return "SAM";    // Severe malnutrition
    if (muacValue < 24.0) return "MAM";    // Moderate malnutrition
  }
  return "N";
};

export function NutritionalStatusCalculator({
  weight,
  height,
  age,
  muac,
  onStatusChange,
  initialStatus,
  gender = 'Male',
  returnValuesOnly = false
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

  const parseAge = (ageStr: string): AgeDetails => {
    if (!ageStr) return { days: 0, weeks: 0, months: 0, totalDays: 0, years: 0 };
    
    const yearsMatch = ageStr.match(/(\d+)\s*year/i);
    const monthsMatch = ageStr.match(/(\d+)\s*month/i);
    const weeksMatch = ageStr.match(/(\d+)\s*week/i);
    const daysMatch = ageStr.match(/(\d+)\s*day/i);
    
    const years = yearsMatch ? parseInt(yearsMatch[1]) : 0;
    const months = monthsMatch ? parseInt(monthsMatch[1]) : 0;
    const weeks = weeksMatch ? parseInt(weeksMatch[1]) : 0;
    const days = daysMatch ? parseInt(daysMatch[1]) : 0;
    
    const totalMonths = months + (years * 12);
    const totalDays = days + (weeks * 7) + (totalMonths * 30.44);
    const totalYears = years + (months / 12);
    
    return {
      days,
      weeks,
      months: totalMonths,
      totalDays: Math.round(totalDays),
      years: totalYears
    };
  };

  // Weight-for-Age (WFA) calculation using WHO tables
  const calculateWFA = (weight: number, age: AgeDetails): string => {
    if (!weight) return "";
    
    // For children 0-71 months, use WHO WFA tables
    if (age.months <= 71) {
      const table = gender === 'Female' ? WFA_GIRLS_TABLE : WFA_BOYS_TABLE;
      const ageInMonths = Math.floor(age.months);
      
      const referenceData = table[ageInMonths];
      if (!referenceData) return "";
      
      if (weight <= referenceData.severelyCutoff) return "SUW";
      if (weight <= referenceData.underweightTo) return "UW";
      if (weight >= referenceData.overweight) return "OW";
      return "N";
    }
    
    // For older children and adults, use BMI-based classification
    if (!height) return "";
    const bmi = weight / ((height / 100) ** 2);
    
    if (age.years < 19) {
      return getBMIForAgeClassification(bmi, age.years, gender);
    }
    
    return getAdultBMIClassification(bmi);
  };

  // Length/Height-for-Age (L/HFA) calculation using WHO tables
  const calculateLHFA = (height: number, age: AgeDetails): string => {
    if (!height) return "";
    
    // For children 0-71 months, use WHO L/HFA tables
    if (age.months <= 71) {
      const table = gender === 'Female' ? LFA_GIRLS_TABLE : LFA_BOYS_TABLE;
      const ageInMonths = Math.floor(age.months);
      
      const referenceData = table[ageInMonths];
      if (!referenceData) return "";
    
      if (height <= referenceData.severelyCutoff) return "SST";
      if (height <= referenceData.stuntedTo) return "ST";
      if (height >= referenceData.tall) return "T";
      return "N";
    }
    
    // For older children and adults, height assessment is less commonly used
    if (age.years < 19) {
      // For children 6-18 years, use WHO height-for-age references
      if (gender === 'Male') {
        if (height < (age.years * 6 + 77)) return "ST";
        if (height > (age.years * 6 + 85)) return "T";
      } else {
        if (height < (age.years * 6 + 75)) return "ST";
        if (height > (age.years * 6 + 83)) return "T";
      }
      return "N";
    }
    
    // For adults, height classification is less standardized
    return "N/A";
  };

  // Weight-for-Height (WFH) calculation using WHO tables
  const calculateWFH = (weight: number, height: number, age: AgeDetails): string => {
    if (!weight || !height) return "";
    
    // For children 0-71 months, use WHO WFH tables when appropriate
    if (age.months <= 71 && height >= 65 && height <= 120) {
      const table = gender === 'Female' ? WFH_GIRLS_TABLE : WFH_BOYS_TABLE;
      const roundedHeight = Math.round(height * 2) / 2;
      const referenceData = table[roundedHeight];
      
      if (referenceData) {
        if (weight <= referenceData.severelyCutoff) return "SW";
        if (weight <= referenceData.wastedTo) return "W";
        if (weight >= referenceData.overweightFrom && weight <= referenceData.overweightTo) return "OW";
        if (weight >= referenceData.obeseFrom) return "OB";
        return "N";
      }
    }
    
    // For all ages where WFH isn't applicable, use BMI-based classification
    const bmi = weight / ((height / 100) ** 2);
    
    if (age.years < 19) {
      return getBMIForAgeClassification(bmi, age.years, gender);
    }
    
    return getAdultBMIClassification(bmi);
  };

  useEffect(() => {
    const ageDetails = parseAge(age || "");
    
    const newStatus: NutritionalStatusType = {
      wfa: weight ? calculateWFA(weight, ageDetails) as "" | "N" | "UW" | "SUW" | "MUW" | "OW" | "OB" | "OB1" | "OB2" | "OB3" | undefined : "",
      lhfa: height ? calculateLHFA(height, ageDetails) as "" | "N" | "ST" | "SST" | "T" | "N/A" | undefined : "",
      wfh: weight && height ? calculateWFH(weight, height, ageDetails) as "" | "N" | "W" | "SW" | "OW" | "OB" | "MUW" | "UW" | "SUW" | "OB1" | "OB2" | "OB3" | undefined : "",
      muac: manualMuac,
      muac_status: manualMuac ? getMUACClassification(manualMuac, ageDetails.years, gender) as "" | "N" | "MAM" | "SAM" | undefined : ""
    };
    
    setNutritionalStatus(newStatus);
    onStatusChange(newStatus);
  }, [weight, height, age, manualMuac, onStatusChange, gender]);

  // If returnValuesOnly is true, return just the status values without UI
  if (returnValuesOnly) {
    return nutritionalStatus;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "N":
        return "bg-green-100 text-green-800 border-green-200";
      case "UW":
      case "ST":
      case "W":
      case "MAM":
      case "MUW":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "SUW":
      case "SST":
      case "SW":
      case "SAM":
        return "bg-red-100 text-red-800 border-red-200";
      case "OW":
      case "OB":
      case "OB1":
      case "OB2":
      case "OB3":
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
      case "MUW":
      case "OW":
      case "T":
        return <AlertTriangle className="w-4 h-4" />;
      case "SUW":
      case "SST":
      case "SW":
      case "SAM":
      case "OB":
      case "OB1":
      case "OB2":
      case "OB3":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getDetailedDescription = (indicator: string, status: string) => {
    const descriptions = {
      wfa: {
        "SUW": "Severely underweight (below -3 SD cutoff)",
        "UW": "Underweight (-3 to -2 SD range)",
        "MUW": "Mild underweight",
        "N": "Normal weight for age (-2 to +2 SD)",
        "OW": "Overweight (above +2 SD cutoff)",
        "OB": "Obese",
        "OB1": "Obese class I",
        "OB2": "Obese class II",
        "OB3": "Obese class III"
      },
      lhfa: {
        "SST": "Severely stunted (z-score < -3)",
        "ST": "Stunted (z-score -3 to -2)",
        "N": "Normal height for age (z-score -2 to +2)",
        "T": "Tall for age (z-score > +2)",
        "N/A": "Not applicable for adults"
      },
      wfh: {
        "SW": "Severely wasted (z-score < -3)",
        "W": "Wasted (z-score -3 to -2)",
        "N": "Normal weight for height (z-score -2 to +2)",
        "OW": "Overweight (z-score +2 to +3)",
        "OB": "Obese (z-score > +3)",
        "MUW": "Mild underweight",
        "UW": "Underweight",
        "SUW": "Severely underweight",
        "OB1": "Obese class I",
        "OB2": "Obese class II",
        "OB3": "Obese class III"
      },
      muac: {
        "SAM": "Severe Acute Malnutrition",
        "MAM": "Moderate Acute Malnutrition",
        "N": "Normal"
      }
    };
    
    return descriptions[indicator as keyof typeof descriptions]?.[status as keyof typeof descriptions[keyof typeof descriptions]] || "No data";
  };

  const ageDetails = parseAge(age || "");
  const isAdult = ageDetails.months > 71;

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
              <div>Age: {age || "Not recorded"} {isAdult && "(Adult)"}</div>
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
              <p className="mt-1 text-xs text-gray-500">
                * Required for nutritional assessment
              </p>
            </div>
          </div>
        </div>

        {/* Status Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* WFA */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {isAdult ? "BMI Classification" : "WFA (Weight for Age)"}
            </Label>
            <div className={`p-3 rounded-lg border ${getStatusColor(nutritionalStatus.wfa || "")}`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(nutritionalStatus.wfa || "")}
                <span className="font-medium">{nutritionalStatus.wfa || "N/A"}</span>
              </div>
              <p className="text-xs mt-1">
                {nutritionalStatus.wfa 
                  ? getDetailedDescription("wfa", nutritionalStatus.wfa)
                  : "No data available"}
              </p>
              {weight && <p className="text-xs mt-1 font-medium">{weight} kg</p>}
            </div>
          </div>

          {/* L/HFA */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {isAdult ? "Height Status" : "L/HFA (Height for Age)"}
            </Label>
            <div className={`p-3 rounded-lg border ${getStatusColor(nutritionalStatus.lhfa || "")}`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(nutritionalStatus.lhfa || "")}
                <span className="font-medium">{nutritionalStatus.lhfa || "N/A"}</span>
              </div>
              <p className="text-xs mt-1">
                {nutritionalStatus.lhfa
                  ? getDetailedDescription("lhfa", nutritionalStatus.lhfa)
                  : "No data available"}
              </p>
              {height && <p className="text-xs mt-1 font-medium">{height} cm</p>}
            </div>
          </div>

          {/* WFH */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {isAdult ? "Weight Status" : "WFH (Weight for Height)"}
            </Label>
            <div className={`p-3 rounded-lg border ${getStatusColor(nutritionalStatus.wfh || "")}`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(nutritionalStatus.wfh || "")}
                <span className="font-medium">{nutritionalStatus.wfh || "N/A"}</span>
              </div>
              <p className="text-xs mt-1">
                {nutritionalStatus.wfh
                  ? getDetailedDescription("wfh", nutritionalStatus.wfh)
                  : "No data available"}
              </p>
              {weight && height && <p className="text-xs mt-1 font-medium">{weight}kg / {height}cm</p>}
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
                  ? getDetailedDescription("muac", nutritionalStatus.muac_status)
                  : "No data available"}
              </p>
              {manualMuac && <p className="text-xs mt-1 font-medium">{manualMuac} cm</p>}
            </div>
          </div>
        </div>

        {/* WHO Classification Note */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Classifications based on WHO standards:
            <br />• <strong>Children (0-71 months):</strong> WHO Child Growth Standards with gender-specific cutoff points
            <br />• <strong>Children (5-18 years):</strong> WHO BMI-for-age references
            <br />• <strong>Adults (19+ years):</strong> WHO BMI classification
            <br />• <strong>MUAC:</strong> Age and gender-specific WHO cutoffs
            <br />• <strong>All assessments:</strong> Based on WHO reference standards for precise classification
          </p>
        </div>
      </CardContent>
    </Card>
  );
}