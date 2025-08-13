import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface NutritionStatus {
  wfa: string;
  lhfa: string;
  wfl: string;
  muac: string;
  edemaSeverity: string;
}

interface ChartData {
  date: string;
  age: string;
  weight: number;
  height: number;
  bmi: number | null;
  nutritionStatus: NutritionStatus;
}

interface NutritionalStatusGraphProps {
  historyData: {
    updatedAt: string;
    age: string;
    wt: number;
    ht: number;
    bmi: string;
    nutritionStatus: NutritionStatus;
  }[];
}

const NUTRITIONAL_STATUS_DESCRIPTIONS = {
  wfa: {
    N: "Normal",
    UW: "Underweight",
    SUW: "Severely Underweight",
  },
  lhfa: {
    N: "Normal",
    ST: "Stunted",
    SST: "Severely Stunted",
    T: "Tall",
  },
  wfl: {
    N: "Normal",
    W: "Wasted",
    SW: "Severely Wasted",
    OW: "Overweight",
  },
  muac: {
    N: "Normal",
    MAM: "Moderate Acute Malnutrition",
    SAM: "Severe Acute Malnutrition",
  },
  edemaSeverity: {
    none: "No edema",
    mild: "Mild edema",
    moderate: "Moderate edema",
    severe: "Severe edema",
  },
};

const NutritionalStatusGraph = ({ historyData }: NutritionalStatusGraphProps) => {
  const chartData: ChartData[] = useMemo(() => {
    if (!historyData || !Array.isArray(historyData)) return [];
    
    return historyData
      .map(record => ({
        date: record.updatedAt,
        age: record.age,
        weight: record.wt,
        height: record.ht,
        bmi: record.bmi === "N/A" ? null : parseFloat(record.bmi),
        nutritionStatus: record.nutritionStatus || {
          wfa: "N/A",
          lhfa: "N/A",
          wfl: "N/A",
          muac: "N/A",
          edemaSeverity: "none"
        },
      }))
      .filter(item => item.weight && item.height);
  }, [historyData]);

  const getStatusDescription = (category: keyof typeof NUTRITIONAL_STATUS_DESCRIPTIONS, statusCode: string) => {
    const statusMap = NUTRITIONAL_STATUS_DESCRIPTIONS[category];
    return statusMap[statusCode as keyof typeof statusMap] || "Unknown Status";
  };

  const latestRecord = chartData[0];

  if (chartData.length === 0) {
    return (
      <div className="w-full bg-white p-4 rounded-lg shadow mb-6">
        <p>No nutritional data available to display</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Nutritional Status Overview</h2>
      
      {/* Current Status Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm font-medium text-gray-600">Weight-for-Age</h3>
          <p className="text-lg font-semibold">
            {getStatusDescription('wfa', latestRecord.nutritionStatus.wfa)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="text-sm font-medium text-gray-600">Height-for-Age</h3>
          <p className="text-lg font-semibold">
            {getStatusDescription('lhfa', latestRecord.nutritionStatus.lhfa)}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <h3 className="text-sm font-medium text-gray-600">Weight-for-Length</h3>
          <p className="text-lg font-semibold">
            {getStatusDescription('wfl', latestRecord.nutritionStatus.wfl)}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="text-sm font-medium text-gray-600">MUAC Status</h3>
          <p className="text-lg font-semibold">
            {latestRecord.nutritionStatus.muac ? 
              getStatusDescription('muac', latestRecord.nutritionStatus.muac) : "N/A"}
          </p>
        </div>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 gap-8">
        <div>
          <h3 className="text-md font-medium mb-2">Weight Progression (kg)</h3>
          <div className="text-sm text-gray-500 mb-2">
            Current WFA status: {getStatusDescription('wfa', latestRecord.nutritionStatus.wfa)}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} kg`, 
                    name === 'weight' ? 'Weight' : 'Reference'
                  ]}
                  labelFormatter={(label) => `Age: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  name="Weight" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-md font-medium mb-2">Height Progression (cm)</h3>
          <div className="text-sm text-gray-500 mb-2">
            Current LFA status: {getStatusDescription('lhfa', latestRecord.nutritionStatus.lhfa)}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} cm`, 
                    name === 'height' ? 'Height' : 'Reference'
                  ]}
                  labelFormatter={(label) => `Age: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="height" 
                  name="Height" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Nutritional Status Interpretation */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-md font-medium mb-2">Interpretation Guide</h3>
        <ul className="text-sm space-y-2">
          <li><span className="font-medium">WFA (Weight-for-Age):</span> Indicates underweight (UW) or severely underweight (SUW)</li>
          <li><span className="font-medium">LFA (Length/Height-for-Age):</span> Indicates stunting (ST) or severe stunting (SST)</li>
          <li><span className="font-medium">WFL (Weight-for-Length):</span> Indicates wasting (W) or severe wasting (SW)</li>
          <li><span className="font-medium">MUAC:</span> Measures acute malnutrition (MAM/SAM)</li>
          <li><span className="font-medium">Edema:</span> Presence indicates severe acute malnutrition</li>
        </ul>
      </div>
    </div>
  );
};

export default NutritionalStatusGraph;