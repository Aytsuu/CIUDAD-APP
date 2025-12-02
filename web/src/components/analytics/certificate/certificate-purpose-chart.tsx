import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, TrendingDown, BarChart3, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCertificatePurposeTrending, useGetBusinessPermitAnalytics } from "./certificate-analytics-queries";
import { useLoading } from "@/context/LoadingContext";
import { Spinner } from "@/components/ui/spinner";
import React from "react";

interface CertificatePurposeChartProps {
  initialMonths?: number;
}

const MONTHS = [
  { name: "Jan", month: 0 },
  { name: "Feb", month: 1 },
  { name: "Mar", month: 2 },
  { name: "Apr", month: 3 },
  { name: "May", month: 4 },
  { name: "Jun", month: 5 },
  { name: "Jul", month: 6 },
  { name: "Aug", month: 7 },
  { name: "Sep", month: 8 },
  { name: "Oct", month: 9 },
  { name: "Nov", month: 10 },
  { name: "Dec", month: 11 }
];

export function CertificatePurposeChart({}: CertificatePurposeChartProps) {
  const currentYear = new Date().getFullYear().toString();
  const { data: certificateData, isLoading: certificateLoading, error: certificateError } = useGetCertificatePurposeTrending(12);
  const { data: permitData, isLoading: permitLoading, error: permitError } = useGetBusinessPermitAnalytics();
  const { showLoading, hideLoading } = useLoading();

  const isLoading = certificateLoading || permitLoading;
  const error = certificateError || permitError;

  // Debug logging
  console.log('CertificatePurposeChart - certificateData:', certificateData);
  console.log('CertificatePurposeChart - permitData:', permitData);
  console.log('CertificatePurposeChart - isLoading:', isLoading);
  console.log('CertificatePurposeChart - error:', error);

  React.useEffect(() => {
    if(isLoading) showLoading();
    else hideLoading();
  }, [isLoading]);

  // Process certificate monthly data
  const certificateMonthlyData = MONTHS.map((monthInfo) => {
    const result = {
      name: monthInfo.name,
      count: 0
    };

    // Aggregate data by month
    if (certificateData?.purpose_monthly_trends) {
      certificateData.purpose_monthly_trends.forEach((item: any) => {
        const itemDate = new Date(item.month);
        const month = itemDate.getMonth();
        
        if (month === monthInfo.month) {
          result.count += item.count || 0;
        }
      });
    }

    return result;
  });

  // Process permit monthly data
  const permitMonthlyData = MONTHS.map((monthInfo) => {
    const result = {
      name: monthInfo.name,
      count: 0
    };

    // Aggregate data by month
    if (permitData?.monthly_requests) {
      permitData.monthly_requests.forEach((item: any) => {
        const itemDate = new Date(item.month);
        const month = itemDate.getMonth();
        
        if (month === monthInfo.month) {
          result.count += item.count || 0;
        }
      });
    }

    return result;
  });

  // Calculate certificate analytics
  const certificateTotalRequests = certificateMonthlyData.reduce((sum, month) => sum + month.count, 0);
  const certificateAverageMonthly = certificateTotalRequests / 12;
  
  const certificateFirstHalfRequests = certificateMonthlyData.slice(0, 6).reduce((sum, month) => sum + month.count, 0);
  const certificateSecondHalfRequests = certificateMonthlyData.slice(6).reduce((sum, month) => sum + month.count, 0);
  
  const certificateFirstHalfAvg = certificateFirstHalfRequests / 6;
  const certificateSecondHalfAvg = certificateSecondHalfRequests / 6;
  
  const certificateTrendPercentage = certificateFirstHalfAvg > 0 
    ? Math.round(((certificateSecondHalfAvg - certificateFirstHalfAvg) / certificateFirstHalfAvg) * 100)
    : 0;
  
  const certificateIsIncreasing = certificateTrendPercentage > 0;
  const certificateHighestMonth = certificateMonthlyData.reduce((max, current) => 
    (current.count > (max?.count || 0)) ? current : max, 
    certificateMonthlyData[0]
  );

  // Calculate permit analytics
  const permitTotalRequests = permitMonthlyData.reduce((sum, month) => sum + month.count, 0);
  const permitAverageMonthly = permitTotalRequests / 12;
  
  const permitFirstHalfRequests = permitMonthlyData.slice(0, 6).reduce((sum, month) => sum + month.count, 0);
  const permitSecondHalfRequests = permitMonthlyData.slice(6).reduce((sum, month) => sum + month.count, 0);
  
  const permitFirstHalfAvg = permitFirstHalfRequests / 6;
  const permitSecondHalfAvg = permitSecondHalfRequests / 6;
  
  const permitTrendPercentage = permitFirstHalfAvg > 0 
    ? Math.round(((permitSecondHalfAvg - permitFirstHalfAvg) / permitFirstHalfAvg) * 100)
    : 0;
  
  const permitIsIncreasing = permitTrendPercentage > 0;
  const permitHighestMonth = permitMonthlyData.reduce((max, current) => 
    (current.count > (max?.count || 0)) ? current : max, 
    permitMonthlyData[0]
  );

  const certificateChartConfig = {
    count: {
      label: "Certificate Requests",
      color: "hsl(220, 90%, 56%)",
    },
  };

  const permitChartConfig = {
    count: {
      label: "Permit Requests",
      color: "hsl(142, 76%, 36%)",
    },
  };

  // Helper function to render chart content
  const renderChartContent = (monthlyData: any[], chartConfig: any, chartTitle: string, emptyMessage: string) => {
    if (monthlyData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-gray-100 p-6 mb-4">
            <BarChart3 className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-sm text-gray-600 max-w-sm">
            {emptyMessage}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Monthly Breakdown Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{chartTitle}</h3>
          <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 0,
                  bottom: 20,
                }}
              >
                <defs>
                  <linearGradient id={`color${chartTitle.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartConfig.count.color} stopOpacity={0.9}/>
                    <stop offset="100%" stopColor={chartConfig.count.color} stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  className="stroke-muted/30" 
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  minTickGap={32}
                  className="text-xs"
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  className="text-xs"
                  tick={{ fill: '#6b7280' }}
                  allowDecimals={false}
                  tickFormatter={(value) => Math.round(value).toString()}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  content={
                    <ChartTooltipContent
                      className="w-[200px] border shadow-lg bg-white"
                      formatter={(value) => [
                        <span className="font-semibold">{Number(value).toLocaleString()} requests</span>, 
                        chartConfig.count.label
                      ]}
                    />
                  }
                />
                <Bar
                  dataKey="count"
                  fill={`url(#color${chartTitle.replace(/\s+/g, '')})`}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>        
      </div>
    );
  };

  if (error) {
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="flex items-center justify-center py-8">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load certificate purpose data. Please try again later.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full h-full border-none shadow-none">
        <Spinner size="md" />
      </Card>
    );
  }

  return (
    <Card className="w-full border-none shadow-none">
      {/* Header */}
      <CardHeader className="border-b border-gray-100 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">Certificate & Permit Overview</CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              {currentYear} Certificate and Business Permit Requests Analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="certificates" className="w-full">
          <div className="relative bg-gray-50/30 border-b border-gray-200">
            <TabsList className="grid w-full grid-cols-2 bg-transparent p-1 h-auto rounded-none">
              <TabsTrigger 
                value="certificates" 
                className="relative px-8 py-4 text-sm font-semibold text-gray-500 data-[state=active]:text-white data-[state=active]:bg-blue-600 data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 rounded-lg transition-all duration-300 hover:text-gray-700 hover:bg-white/80 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
              >
                <span className="relative z-10">Certificates</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </TabsTrigger>
              <TabsTrigger 
                value="permits" 
                className="relative px-8 py-4 text-sm font-semibold text-gray-500 data-[state=active]:text-white data-[state=active]:bg-green-600 data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/25 rounded-lg transition-all duration-300 hover:text-gray-700 hover:bg-white/80 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
              >
                <span className="relative z-10">Permits</span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="certificates" className="p-6">
            {/* Certificate Stats Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x bg-gray-50/50 border-b border-gray-100 mb-6">
              {/* Total Requests */}
              <div className="px-6 py-4">
                <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Total Requests</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-blue-600">
                    {certificateTotalRequests.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Average Monthly */}
              <div className="px-6 py-4">
                <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Monthly Average</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    {Math.round(certificateAverageMonthly).toLocaleString()}
                  </span>
                  {certificateTrendPercentage !== 0 && (
                    <div className={`flex items-center gap-1 ${certificateIsIncreasing ? 'text-red-600' : 'text-green-600'}`}>
                      {certificateIsIncreasing ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="text-sm font-semibold">
                        {certificateIsIncreasing ? '+' : ''}{certificateTrendPercentage}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Highest Month */}
              <div className="px-6 py-4">
                <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Peak Month</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-orange-600">
                    {certificateHighestMonth?.count.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 font-medium bg-orange-100 px-2 py-1 rounded-full">
                    {certificateHighestMonth?.name}
                  </span>
                </div>
              </div>

              {/* Current Year */}
              <div className="px-6 py-4">
                <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Year</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-purple-600">
                    {currentYear}
                  </span>
                  <Target className="h-4 w-4 text-purple-400" />
                </div>
              </div>
            </div>

            {renderChartContent(
              certificateMonthlyData,
              certificateChartConfig,
              "Monthly Certificate Request Breakdown",
              `There are no certificate requests to display for ${currentYear}.`
            )}
          </TabsContent>

          <TabsContent value="permits" className="p-6">
            {/* Permit Stats Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x bg-gray-50/50 border-b border-gray-100 mb-6">
              {/* Total Requests */}
              <div className="px-6 py-4">
                <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Total Requests</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    {permitTotalRequests.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Average Monthly */}
              <div className="px-6 py-4">
                <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Monthly Average</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    {Math.round(permitAverageMonthly).toLocaleString()}
                  </span>
                  {permitTrendPercentage !== 0 && (
                    <div className={`flex items-center gap-1 ${permitIsIncreasing ? 'text-red-600' : 'text-green-600'}`}>
                      {permitIsIncreasing ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="text-sm font-semibold">
                        {permitIsIncreasing ? '+' : ''}{permitTrendPercentage}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Highest Month */}
              <div className="px-6 py-4">
                <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Peak Month</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-orange-600">
                    {permitHighestMonth?.count.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 font-medium bg-orange-100 px-2 py-1 rounded-full">
                    {permitHighestMonth?.name}
                  </span>
                </div>
              </div>

              {/* Current Year */}
              <div className="px-6 py-4">
                <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Year</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-purple-600">
                    {currentYear}
                  </span>
                  <Target className="h-4 w-4 text-purple-400" />
                </div>
              </div>
            </div>

            {renderChartContent(
              permitMonthlyData,
              permitChartConfig,
              "Monthly Permit Request Breakdown",
              `There are no business permit requests to display for ${currentYear}.`
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
