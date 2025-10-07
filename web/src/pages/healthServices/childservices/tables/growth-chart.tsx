"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { format, parseISO } from "date-fns";
import { useState } from "react";

interface NutritionalStatusData {
  bm_id: number;
  height: string;
  weight: string;
  patrec: number;
  staff: null;

  wfa: string;
  lhfa: string;
  wfl: string;
  muac: string;
  created_at: string;
  edemaSeverity: string;
  muac_status: string;
  bm: number;
  pat: string;
}

interface GrowthChartProps {
  data: NutritionalStatusData[];
  isLoading?: boolean;
  error?: any;
}

export function GrowthChart({ data = [], isLoading, error }: GrowthChartProps) {
  const [selectedMetrics, setSelectedMetrics] = useState({
    height: true,
    weight: true
  });

  // Transform data for the chart
  const chartData = data
    .map((item) => ({
      date: format(parseISO(item.created_at), "MMM dd"),
      fullDate: item.created_at,
      height: Number.parseFloat(item.height),
      weight: Number.parseFloat(item.weight),
      wfa: item.wfa,
      lhfa: item.lhfa,
      wfl: item.wfl,
      edemaSeverity: item.edemaSeverity
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 shadow-md rounded-md border border-gray-200">
          <p className="font-semibold mb-2">{label}</p>
          {selectedMetrics.height && (
            <p className="text-sm">
              Height: <span className="font-medium text-blue-600">{data.height} cm</span>
            </p>
          )}
          {selectedMetrics.weight && (
            <p className="text-sm">
              Weight: <span className="font-medium text-green-600">{data.weight} kg</span>
            </p>
          )}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              WFA: {data.wfa} | LHFA: {data.lhfa} | WFL: {data.wfl}
            </p>
            {data.edemaSeverity !== "None" && <p className="text-xs text-orange-600">Edema: {data.edemaSeverity}</p>}
          </div>
        </div>
      );
    }
    return null;
  };

  const toggleMetric = (metric: "height" | "weight") => {
    setSelectedMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  if (error) {
    return (
      <Card className="w-full mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-500" />
            Growth Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-sm">Failed to load growth data. Please try again later.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mt-4">
      <CardHeader className="border-b border-gray-200 pb-6">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <TrendingUp className="h-5 w-5 text-gray-500" />
          Growth Chart
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 mt-4">
            <Button variant={selectedMetrics.height ? "default" : "outline"} size="sm" onClick={() => toggleMetric("height")} className="flex items-center gap-2 bg-sky-100 text-blue-600 hover:bg-slate-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Height (cm)
            </Button>
            <Button variant={selectedMetrics.weight ? "default" : "outline"} size="sm" onClick={() => toggleMetric("weight")} className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Weight (kg)
            </Button>
          </div>
          <div className="text-sm text-gray-500">{chartData.length} measurements recorded</div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center h-[400px]">
            <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Growth Data Available</h3>
            <p className="text-sm text-gray-500 max-w-sm">No measurements have been recorded for this patient yet.</p>
          </div>
        ) : (
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#666" />
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} stroke="#666" label={{ value: "Height (cm)", angle: -90, position: "insideLeft" }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#666" label={{ value: "Weight (kg)", angle: 90, position: "insideRight" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {selectedMetrics.height && <Line yAxisId="left" type="monotone" dataKey="height" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }} name="Height (cm)" />}

                {selectedMetrics.weight && <Line yAxisId="right" type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }} name="Weight (kg)" />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-500">Latest Height</p>
              <p className="text-lg font-semibold text-blue-600">{chartData[chartData.length - 1]?.height} cm</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Latest Weight</p>
              <p className="text-lg font-semibold text-green-600">{chartData[chartData.length - 1]?.weight} kg</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Growth Period</p>
              <p className="text-lg font-semibold text-gray-700">{chartData.length > 1 ? `${format(parseISO(chartData[0].fullDate), "MMM yyyy")} - ${format(parseISO(chartData[chartData.length - 1].fullDate), "MMM yyyy")}` : format(parseISO(chartData[0].fullDate), "MMM yyyy")}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
