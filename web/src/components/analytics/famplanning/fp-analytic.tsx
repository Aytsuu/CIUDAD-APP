import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api2 } from '@/api/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select/select';

// API Functions
const fetchFPMethodDistribution = async () => {
  const response = await api2.get('/familyplanning/analytics/method-distribution/');
  return response.data;
};

const fetchFPClientTypeDistribution = async () => {
  const response = await api2.get('/familyplanning/analytics/client-type-distribution/');
  return response.data;
};

const fetchFPMonthlyTrends = async (year: string) => {
  const response = await api2.get(`/familyplanning/analytics/monthly-trends/?year=${year}`);
  return response.data;
};

const fetchFPAgeDistribution = async () => {
  const response = await api2.get('/familyplanning/analytics/age-distribution/');
  return response.data;
};

// Color palettes
const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];

// Method Distribution Chart
const FPMethodDistributionChart: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['fpMethodDistribution'],
    queryFn: fetchFPMethodDistribution,
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
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Client Type Distribution Chart
const FPClientTypeChart: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['fpClientTypeDistribution'],
    queryFn: fetchFPClientTypeDistribution,
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
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8b5cf6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Monthly Trends Chart
const FPMonthlyTrendsChart: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = React.useState(currentYear.toString());

  const { data, isLoading, isError } = useQuery({
    queryKey: ['fpMonthlyTrends', selectedYear],
    queryFn: () => fetchFPMonthlyTrends(selectedYear),
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

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="newAcceptors" stroke="#8b5cf6" strokeWidth={2} name="New Acceptors" />
          <Line type="monotone" dataKey="currentUsers" stroke="#ec4899" strokeWidth={2} name="Current Users" />
          <Line type="monotone" dataKey="total" stroke="#06b6d4" strokeWidth={2} name="Total" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Age Distribution Chart
const FPAgeDistributionChart: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['fpAgeDistribution'],
    queryFn: fetchFPAgeDistribution,
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
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#ec4899" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Main Analytics Component
export const FamilyPlanningAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="methods">Methods</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Type Distribution</CardTitle>
                <CardDescription>New Acceptors vs Current Users</CardDescription>
              </CardHeader>
              <CardContent>
                <FPClientTypeChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Method Distribution</CardTitle>
                <CardDescription>Most used family planning methods</CardDescription>
              </CardHeader>
              <CardContent>
                <FPMethodDistributionChart />
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
              <FPMethodDistributionChart />
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
              <FPMonthlyTrendsChart />
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
              <FPAgeDistributionChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilyPlanningAnalytics;