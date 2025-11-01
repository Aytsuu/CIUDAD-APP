// components/analytics/familyplanning/fp-analytic.tsx

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api2 } from '@/api/api';
import { BarChart,Bar,LineChart,Line,PieChart,Pie,Cell,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer }  from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subMonths, addMonths, parseISO, isSameMonth } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { LoadingState } from '@/components/ui/health-component/loading-state';

// Color palettes
const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];

interface FamilyPlanningAnalyticsProps {
  initialMonth: string;
}
interface FPAnalyticsSummary {
  total_patients: number;
  new_acceptors: number;
  current_users: number;
  this_month_registrations: number;
  growth_rate: number;
}

// API Functions
const fetchFPMethodDistribution = async (month: string) => {
  const response = await api2.get(`/familyplanning/analytics/method-distribution/?month=${month}`);
  return response.data;
};

const fetchFPClientTypeDistribution = async (month: string) => {
  const response = await api2.get(`/familyplanning/analytics/client-type-distribution/?month=${month}`);
  return response.data;
};

const fetchFPMonthlyTrends = async (month: string) => {
  const response = await api2.get(`/familyplanning/analytics/monthly-trends/?month=${month}`);
  return response.data;
};

const fetchFPAgeDistribution = async (month: string) => {
  const response = await api2.get(`/familyplanning/analytics/age-distribution/?month=${month}`);
  return response.data;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};


// Method Distribution Chart
const FPMethodDistributionChart: React.FC<{ currentMonth: string }> = ({ currentMonth }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['fpMethodDistribution', currentMonth],
    queryFn: () => fetchFPMethodDistribution(currentMonth),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (isError || !data) {
    return <div className="text-center text-red-600">Failed to load method distribution data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Client Type Distribution Chart
const FPClientTypeChart: React.FC<{ currentMonth: string }> = ({ currentMonth }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['fpClientTypeDistribution', currentMonth],
    queryFn: () => fetchFPClientTypeDistribution(currentMonth),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (isError || !data) {
    return <div className="text-center text-red-600">Failed to load client type data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="value" fill="#8b5cf6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Monthly Trends Chart
const FPMonthlyTrendsChart: React.FC<{ currentMonth: string }> = ({ currentMonth }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['fpMonthlyTrends', currentMonth],
    queryFn: () => fetchFPMonthlyTrends(currentMonth),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (isError || !data) {
    return <div className="text-center text-red-600">Failed to load monthly trends data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line type="monotone" dataKey="newAcceptors" stroke="#8b5cf6" strokeWidth={2} name="New Acceptors" />
        <Line type="monotone" dataKey="currentUsers" stroke="#ec4899" strokeWidth={2} name="Current Users" />
        <Line type="monotone" dataKey="total" stroke="#06b6d4" strokeWidth={2} name="Total" />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Age Distribution Chart
const FPAgeDistributionChart: React.FC<{ currentMonth: string }> = ({ currentMonth }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['fpAgeDistribution', currentMonth],
    queryFn: () => fetchFPAgeDistribution(currentMonth),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (isError || !data) {
    return <div className="text-center text-red-600">Failed to load age distribution data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="ageGroup" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="count" fill="#ec4899" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const fetchFPAnalyticsSummary = async (month: string): Promise<FPAnalyticsSummary> => {
  const response = await api2.get(`/familyplanning/analytics/summary/?month=${month}`);
  return response.data;
}
// Main Analytics Component
export const FamilyPlanningAnalytics: React.FC<FamilyPlanningAnalyticsProps> = ({ initialMonth }) => {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const { isLoading, error } = useQuery({
    queryKey: ['fpAnalyticsSummary', currentMonth],
    queryFn: () => fetchFPAnalyticsSummary(currentMonth),
  });

      if(isLoading) {
        <LoadingState/>
      }
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

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription className="text-sm">
          Failed to load family planning analytics data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Analytics for {format(currentDate, "MMMM yyyy")}
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

          {/* Charts */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="methods">Methods</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
              {/* <TabsTrigger value="compliance">Compliance</TabsTrigger> */}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Type Distribution</CardTitle>
                    <CardDescription>New Acceptors vs Current Users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FPClientTypeChart currentMonth={currentMonth} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Method Distribution</CardTitle>
                    <CardDescription>Most used family planning methods</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FPMethodDistributionChart currentMonth={currentMonth} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="methods">
              <Card>
                <CardHeader>
                  <CardTitle>Family Planning Methods</CardTitle>
                  <CardDescription>Distribution of methods used by patients</CardDescription>
                </CardHeader>
                <CardContent>
                  <FPMethodDistributionChart currentMonth={currentMonth} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Family planning registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <FPMonthlyTrendsChart currentMonth={currentMonth} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="demographics">
              <Card>
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                  <CardDescription>Patient age groups using family planning services</CardDescription>
                </CardHeader>
                <CardContent>
                  <FPAgeDistributionChart currentMonth={currentMonth} />
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      )}

export default FamilyPlanningAnalytics;