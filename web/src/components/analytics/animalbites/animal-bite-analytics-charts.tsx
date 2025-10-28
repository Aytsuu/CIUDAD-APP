import  { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PawPrint, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { useAnimalBiteAnalytics } from '@/pages/animalbites/db-request/get-query';
const COLORS = {
  primary: ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
  danger: ['#ef4444', '#f87171', '#fca5a5', '#fecaca'],
  warning: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
  success: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  mixed: ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899']
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

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className={`bg-gradient-to-br ${color} rounded-lg p-6 shadow-md`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="p-3 bg-white bg-opacity-50 rounded-full">
        <Icon className="w-6 h-6 text-gray-700" />
      </div>
    </div>
  </div>
);

export const AnimalBiteAnalyticsCharts = ({ months = 12 }: { months?: number }) => {
  const { data: analyticsData, isLoading } = useAnimalBiteAnalytics(months);

  const chartData = useMemo(() => {
    if (!analyticsData) return null;

    return {
      monthlyData: analyticsData.monthlyTrends || [],
      exposureData: analyticsData.exposureTypes || [],
      animalData: analyticsData.animalTypes || [],
      patientTypeData: analyticsData.patientTypes || [],
      siteData: analyticsData.exposureSites || []
    };
  }, [analyticsData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Cases"
          value={analyticsData?.totalCases || 0}
          icon={Users}
          color="from-blue-100 to-blue-200"
        />
        <StatCard
          title="Bite Cases"
          value={analyticsData?.biteCases || 0}
          icon={AlertTriangle}
          color="from-red-100 to-red-200"
        />
        <StatCard
          title="Most Common Animal"
          value={analyticsData?.mostCommonAnimal || "N/A"}
          icon={PawPrint}
          color="from-orange-100 to-orange-200"
        />
        <StatCard
          title="Monthly Average"
          value={analyticsData?.monthlyAverage || 0}
          icon={TrendingUp}
          color="from-green-100 to-green-200"
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="animals">Animals</TabsTrigger>
          <TabsTrigger value="exposure">Exposure</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        {/* Monthly Trends */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Animal Bite Trends</CardTitle>
              <CardDescription>Track incident patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData?.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cases" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Total Cases"
                    dot={{ fill: '#3b82f6', r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bites" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Bite Cases"
                    dot={{ fill: '#ef4444', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Animal Types */}
        <TabsContent value="animals">
          <Card>
            <CardHeader>
              <CardTitle>Cases by Animal Type</CardTitle>
              <CardDescription>Distribution of biting animals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData?.animalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="animal" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    fill="#f59e0b"
                    name="Number of Cases"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exposure Types */}
        <TabsContent value="exposure">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Exposure Type Distribution</CardTitle>
                <CardDescription>Bite vs Non-bite exposures</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData?.exposureData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData?.exposureData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS.mixed[index % COLORS.mixed.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Exposure Sites</CardTitle>
                <CardDescription>Body parts most affected</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={chartData?.siteData} 
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      type="number"
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      dataKey="site" 
                      type="category"
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                      width={100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="count" 
                      fill="#10b981"
                      name="Cases"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Demographics */}
        <TabsContent value="demographics">
          <Card>
            <CardHeader>
              <CardTitle>Patient Demographics</CardTitle>
              <CardDescription>Resident vs Transient distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData?.patientTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData?.patientTypeData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-4">
                  {chartData?.patientTypeData.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS.primary[index % COLORS.primary.length] }}
                        />
                        <span className="font-medium text-gray-900">{item.name}</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};