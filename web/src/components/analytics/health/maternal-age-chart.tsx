import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, subMonths, addMonths, parseISO, isSameMonth } from "date-fns";
import { useState } from "react";
import { CardTitle } from "@/components/ui/card";
import CardLayout from "@/components/ui/card/card-layout";
import { useMaternalCharts } from "@/pages/healthServices/maternal/queries/maternalFetchQueries";

interface MaternalAgeChartProps {
  initialMonth: string;
}

const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f97316", // Orange
];

// Helper function to calculate age from date of birth
const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Helper function to categorize age into groups
const categorizeAge = (age: number): string => {
  if (age < 15) return "Under 15";
  if (age >= 15 && age <= 19) return "15-19";
  if (age >= 20 && age <= 24) return "20-24";
  if (age >= 25 && age <= 29) return "25-29";
  if (age >= 30 && age <= 34) return "30-34";
  if (age >= 35 && age <= 39) return "35-39";
  if (age >= 40 && age <= 44) return "40-44";
  return "45+";
};

export function MaternalAgeDistributionChart({ initialMonth }: MaternalAgeChartProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const { data, isLoading, error } = useMaternalCharts(currentMonth);

  const currentDate = parseISO(`${currentMonth}-01`);
  const today = new Date();
  const currentMonthDate = parseISO(`${format(today, "yyyy-MM")}-01`);

  const nextMonthDisabled = isSameMonth(currentDate, currentMonthDate);

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate =
      direction === "prev"
        ? subMonths(currentDate, 1)
        : addMonths(currentDate, 1);
    setCurrentMonth(format(newDate, "yyyy-MM"));
  };

  // Process patient data and categorize by age
  const ageDistribution = data?.patients
    ? data.patients.reduce((acc: Record<string, number>, patient: any) => {
        if (patient.personal_info?.per_dob) {
          const age = calculateAge(patient.personal_info.per_dob);
          const ageGroup = categorizeAge(age);
          acc[ageGroup] = (acc[ageGroup] || 0) + 1;
        }
        return acc;
      }, {})
    : {};

  // Define age group order
  const ageGroupOrder = [
    "Under 15",
    "15-19",
    "20-24",
    "25-29",
    "30-34",
    "35-39",
    "40-44",
    "45+"
  ];

  // Transform to chart data with ordered age groups
  const chartData = ageGroupOrder
    .map(ageGroup => ({
      ageGroup,
      count: ageDistribution[ageGroup] || 0
    }))
    .filter(item => item.count > 0); // Only show age groups with patients

  const totalPatients = data?.total_patients || 0;

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (active && payload && payload.length) {
      const percentage = totalPatients > 0 
        ? ((payload[0].value / totalPatients) * 100).toFixed(1)
        : "0.0";
      
      return (
        <div className="bg-white p-4 shadow-md rounded-md border border-gray-200">
          <p className="font-semibold">Age Group: {payload[0].payload.ageGroup}</p>
          <p className="text-sm">
            Patients: <span className="font-medium">{payload[0].value}</span>
          </p>
          <p className="text-sm">
            Percentage: <span className="font-medium">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <CardLayout
        title="Maternal Age Distribution"
        description="Error loading data"
        content={
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-sm">
              Failed to load maternal age distribution data. Please try again later.
            </AlertDescription>
          </Alert>
        }
        cardClassName="border border-gray-200 shadow-sm rounded-xl"
      />
    );
  }

  return (
    <CardLayout
      title={
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-500" />
          <CardTitle className="text-xl font-semibold text-gray-900">
            Maternal Age Distribution
          </CardTitle>
        </div>
      }
      description={`Age distribution of maternal patients in ${format(
        currentDate,
        "MMMM yyyy"
      )}`}
      content={
        <div className="space-y-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-lg text-gray-900">{totalPatients}</span> Total Patients
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-lg text-blue-600">{data?.prenatal_records || 0}</span> Prenatal
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-lg text-purple-600">{data?.postpartum_records || 0}</span> Postpartum
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
                className="group flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Previous</span>
              </Button>
              <div className="px-4 py-1.5 bg-blue-50 text-blue-800 rounded-md text-sm font-medium min-w-[120px] text-center">
                {format(currentDate, "MMMM yyyy")}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
                disabled={nextMonthDisabled}
                className="group flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                aria-label="Next month"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : !data || chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center h-[300px]">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Data Available
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                No maternal patient data available for the selected period.
              </p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-500 text-center mb-2">
                Age distribution across {chartData.length} age group{chartData.length !== 1 ? 's' : ''}
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <XAxis
                      dataKey="ageGroup"
                      tick={{ fontSize: 12 }}
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      label={{ value: 'Number of Patients', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      name="Patients"
                      dataKey="count"
                      barSize={50}
                      radius={[8, 8, 0, 0]}
                    >
                      {chartData.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      }
      cardClassName="w-full mt-4"
      headerClassName="border-b border-gray-200 pb-6"
    />
  );
}
