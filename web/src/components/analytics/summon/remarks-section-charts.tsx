import { BarChart3, CheckCircle, AlertCircle } from 'lucide-react';
import { useGetRemarksChartAnalytics } from './remarks-analytics-queries';
import { Spinner } from "@/components/ui/spinner";

interface HearingClosureStats {
    total_open_hearings: number;
    total_closed_hearings: number;
    closed_with_remarks: number;
    closed_without_remarks: number;
    open_with_remarks: number;
    total_hearings?: number;
    hearings_with_remarks?: number;
    hearings_without_remarks?: number;
}

interface HearingClosureChartProps {
    className?: string;
    title?: string;
}

export function RemarksSectionCharts({ 
    className = "",
    title = "Summon Remarks Overview"
}: HearingClosureChartProps) {
    const { data, isLoading, error } = useGetRemarksChartAnalytics();
    
    if (isLoading) {
        return (
            <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
                <div className="flex items-center justify-center h-64">
                    <Spinner size="sm" />
                    <span className="ml-2 text-gray-600">Loading hearing data...</span>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
                <div className="flex items-center justify-center h-64 text-red-600">
                    <span>Error loading hearing data</span>
                </div>
            </div>
        );
    }
    
    // Type guard to ensure data has required properties
    const chartData: HearingClosureStats = data && typeof data === 'object' 
        ? {
            total_open_hearings: data.total_open_hearings || 0,
            total_closed_hearings: data.total_closed_hearings || 0,
            closed_with_remarks: data.closed_with_remarks || 0,
            closed_without_remarks: data.closed_without_remarks || 0,
            open_with_remarks: data.open_with_remarks || 0,
            total_hearings: data.total_hearings || 0,
            hearings_with_remarks: data.hearings_with_remarks || 0,
            hearings_without_remarks: data.hearings_without_remarks || 0,
        }
        : {
            total_open_hearings: 0,
            total_closed_hearings: 0,
            closed_with_remarks: 0,
            closed_without_remarks: 0,
            open_with_remarks: 0,
        };
    
    // Calculate derived metrics
    const openWithoutRemarks = chartData.total_open_hearings - chartData.open_with_remarks;
    
    // Prepare chart data
    const barChartData = [
        {
            category: 'Open Hearings',
            subcategories: [
                { name: 'With Remarks', value: chartData.open_with_remarks, color: 'bg-blue-500' },
                { name: 'Without Remarks', value: openWithoutRemarks, color: 'bg-blue-300' }
            ],
            total: chartData.total_open_hearings
        },
        {
            category: 'Closed Hearings',
            subcategories: [
                { name: 'With Remarks', value: chartData.closed_with_remarks, color: 'bg-green-500' },
                { name: 'Without Remarks', value: chartData.closed_without_remarks, color: 'bg-red-500' }
            ],
            total: chartData.total_closed_hearings
        }
    ];
    
    // Calculate percentages
    const closureRate = chartData.total_closed_hearings > 0 
        ? (chartData.closed_with_remarks / chartData.total_closed_hearings) * 100 
        : 0;
    
    const readinessRate = chartData.total_open_hearings > 0
        ? (chartData.open_with_remarks / chartData.total_open_hearings) * 100
        : 0;

    const completionRate = chartData.total_hearings ? 
        ((chartData.hearings_with_remarks || 0) / chartData.total_hearings) * 100 : 0;

    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-gray-600">{closureRate.toFixed(1)}% compliant</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs text-gray-600">{readinessRate.toFixed(1)}% ready</span>
                    </div>
                </div>
            </div>
            
            {/* Bar Chart */}
            <div className="space-y-6">
                {barChartData.map((item, index) => (
                    <div key={index}>
                        {/* Category Header */}
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-700">{item.category}</h4>
                                <span className="text-sm text-gray-500">({item.total})</span>
                            </div>
                            <div className="text-sm text-gray-600">
                                {item.category === 'Open Hearings' 
                                    ? `${readinessRate.toFixed(1)}% ready` 
                                    : `${closureRate.toFixed(1)}% compliant`
                                }
                            </div>
                        </div>
                        
                        {/* Bar Container */}
                        <div className="relative w-full h-8 rounded-lg overflow-hidden bg-gray-100">
                            {/* Stacked Bar */}
                            <div className="absolute inset-0 flex">
                                {item.subcategories.map((sub, subIndex) => {
                                    const width = item.total > 0 ? (sub.value / item.total) * 100 : 0;
                                    return (
                                        <div
                                            key={subIndex}
                                            className={`${sub.color} h-full transition-all duration-700`}
                                            style={{ 
                                                width: `${width}%`,
                                                transitionDelay: `${subIndex * 100}ms`
                                            }}
                                            title={`${sub.name}: ${sub.value}`}
                                        />
                                    );
                                })}
                            </div>
                            
                            {/* Bar Labels */}
                            <div className="absolute inset-0 flex items-center justify-between px-3">
                                {item.subcategories.map((sub, subIndex) => {
                                    const width = item.total > 0 ? (sub.value / item.total) * 100 : 0;
                                    if (width < 20) return null; // Don't show label if too small
                                    
                                    return (
                                        <span 
                                            key={subIndex}
                                            className="text-xs font-semibold text-white drop-shadow-sm"
                                        >
                                            {sub.value} {sub.name}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {/* Legend Below Bar */}
                        <div className="flex flex-wrap gap-3 mt-2">
                            {item.subcategories.map((sub, subIndex) => (
                                <div key={subIndex} className="flex items-center gap-1">
                                    <div className={`w-3 h-3 rounded ${sub.color}`} />
                                    <span className="text-xs text-gray-600">
                                        {sub.name}: <span className="font-semibold">{sub.value}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Summary Stats */}
            <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                            {chartData.total_open_hearings}
                        </div>
                        <div className="text-sm text-gray-600">Open Hearings</div>
                        <div className="text-xs text-gray-500">
                            {chartData.open_with_remarks} with remarks
                        </div>
                    </div>
                    
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {chartData.total_closed_hearings}
                        </div>
                        <div className="text-sm text-gray-600">Closed Hearings</div>
                        <div className="text-xs text-gray-500">
                            {closureRate.toFixed(1)}% with remarks
                        </div>
                    </div>
                    
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                            {chartData.closed_without_remarks}
                        </div>
                        <div className="text-sm text-gray-600">Missing Docs</div>
                        <div className="text-xs text-gray-500">
                            Closed without remarks
                        </div>
                    </div>
                </div>
                
                {/* Overall Stats */}
                {chartData.total_hearings !== undefined && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-gray-700">Overall Completion</div>
                                <div className="text-xs text-gray-500">
                                    {chartData.hearings_with_remarks || 0} of {chartData.total_hearings} hearing schedules have remarks
                                </div>
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                                {completionRate.toFixed(1)}%
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                                className="h-2 rounded-full bg-blue-500"
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
