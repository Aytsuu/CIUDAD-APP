import { BarChart3, TrendingUp } from 'lucide-react';
import { useGetConciliationIncidentChart } from './conciliation-analytics-queries';
import { Spinner } from "@/components/ui/spinner";

// Define proper types for the incident data
interface IncidentChartItem {
    it_name: string;
    count: number;
}

interface IncidentChartProps {
    title?: string;
    maxItems?: number;
    className?: string;
}

export function ConciliationIncidentChart({ 
    title = "Conciliation Incident Types Overview",
    maxItems = 5,
    className = ""
}: IncidentChartProps) {
    const { data, isLoading, error } = useGetConciliationIncidentChart();
    
    if (isLoading) {
        return (
            <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
                <div className="flex items-center justify-center h-40">
                    <Spinner size="sm" />
                    <span className="ml-2 text-gray-600">Loading data...</span>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
                <div className="flex items-center justify-center h-40 text-red-600">
                    <span>Error loading incident data</span>
                </div>
            </div>
        );
    }
    
    // Type guard to ensure data is an array
    const chartData: IncidentChartItem[] = Array.isArray(data) 
        ? data.slice(0, maxItems).filter((item): item is IncidentChartItem => 
            item && typeof item === 'object' && 'it_name' in item && 'count' in item
        )
        : [];
    
    const maxCount = chartData.length > 0 
        ? Math.max(...chartData.map(item => item.count), 1)
        : 1;
    
    const totalCount = chartData.reduce((sum, item) => sum + item.count, 0);
    
    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                </div>
                {chartData.length > 0 && (
                    <span className="text-xs text-gray-500">Top {chartData.length}</span>
                )}
            </div>
            
            {/* Chart Content */}
            {chartData.length > 0 ? (
                <div className="space-y-5">
                    {chartData.map((item, index) => {
                        const percentage = (item.count / maxCount) * 100;
                        
                        return (
                            <div key={`${item.it_name}-${index}`} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                                            <span className="text-xs font-semibold text-blue-600">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <span className="font-medium text-gray-700 truncate max-w-[160px] sm:max-w-[200px]">
                                            {item.it_name || "Unknown"}
                                        </span>
                                    </div>
                                    <span className="font-semibold text-gray-900">
                                        {item.count}
                                    </span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div 
                                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700"
                                        style={{ 
                                            width: `${percentage}%`,
                                            transitionDelay: `${index * 100}ms`
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <TrendingUp className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No incident data available</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Cases with incident types will appear here
                    </p>
                </div>
            )}
            
            {/* Footer Stats */}
            {chartData.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Total incidents tracked</span>
                        <span className="font-semibold">
                            {totalCount}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}


// Also update your query hook with proper types