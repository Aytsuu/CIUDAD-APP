import DialogLayout from "@/components/ui/dialog/dialog-layout";
 
import { Button } from "@/components/ui/button/button";
import { Badge } from '@/components/ui/badge';
import { Eye, Brain, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Ordinance, OrdinanceFolder } from './restful-api/OrdinanceGetAPI';
// import { OrdinanceAIService, AIAnalysisResponse } from './queries/OrdinanceAIService.ts';
import { useMemo, useState } from 'react';
import { huggingFaceAIService, AIAnalysisResponse } from './services/HuggingFaceAIService';

interface ViewOrdinanceProps {
    folder: OrdinanceFolder | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onAnalysisComplete: (folder: OrdinanceFolder) => void;
    // aiService: OrdinanceAIService | null;
}

function ViewOrdinance({ 
    folder, 
    isOpen, 
    onOpenChange, 
    onAnalysisComplete,
    // aiService 
}: ViewOrdinanceProps) {

    const aiService = useMemo(() => {
        try { return huggingFaceAIService; } catch { return null; }
    }, []);

    const [individualAnalysisLoading, setIndividualAnalysisLoading] = useState<string | null>(null);
    // Extraction loading state is managed in parent during analysis operations
    // const [fileExtractionLoading, setFileExtractionLoading] = useState<string | null>(null);
    const [folderAmendmentLoading, setFolderAmendmentLoading] = useState<string | null>(null);
    const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);
    const [selectedOrdinanceForAnalysis, setSelectedOrdinanceForAnalysis] = useState<Ordinance | null>(null);

    // Function to save AI analysis results to localStorage
    const saveAnalysisToStorage = (ordinanceId: string, analysisResult: AIAnalysisResponse) => {
        try {
            const existingAnalyses = JSON.parse(localStorage.getItem('ordinanceAnalyses') || '{}');
            existingAnalyses[ordinanceId] = {
                ...analysisResult,
                timestamp: Date.now()
            };
            localStorage.setItem('ordinanceAnalyses', JSON.stringify(existingAnalyses));
        } catch (error) {
            console.error('Error saving analysis to localStorage:', error);
        }
    };

    // Function to handle AI analysis for ordinances (individual or amendment comparison)
    const handleOpenAIAnalysis = async (ordinance: Ordinance) => {
        if (!aiService) {
            toast.error("AI service is not available. Please try again later.");
            return;
        }

        // Check if this is a base ordinance with amendments - if so, automatically do amendment comparison
        if (folder && folder.amendments.length > 0) {
            // Automatically proceed with amendment comparison
            await handleFolderAmendmentComparison(folder);
            return;
        }

        // If no amendments, proceed with individual analysis
        if (ordinance.aiAnalysisResult) {
            // If analysis exists, open the popup to view it
            setSelectedOrdinanceForAnalysis(ordinance);
            setAiAnalysisOpen(true);
        } else {
            // If no analysis exists, run the analysis
            await handleIndividualAIAnalysis(ordinance);
        }
    };

    const handleIndividualAIAnalysis = async (item: Ordinance) => {
        if (!aiService) {
            toast.error("AI service is not available. Please try again later.");
            return;
        }

        setIndividualAnalysisLoading(item.ord_num);
        try {
            const fileUrl = item.file?.file_url || '';
            const result = await aiService.analyzeOrdinance(fileUrl);
            
            // Save the analysis result to localStorage
            saveAnalysisToStorage(item.ord_num, result);
            
            // Update the ordinance item with AI analysis result
            const updatedItem = { ...item, aiAnalysisResult: result };
            setSelectedOrdinanceForAnalysis(updatedItem);
            setAiAnalysisOpen(true);
            
            toast.success("AI analysis completed successfully!");
        } catch (error) {
            console.error("Error analyzing ordinance:", error);
            toast.error("Failed to analyze ordinance. Please try again.");
        } finally {
            setIndividualAnalysisLoading(null);
        }
    };

    // Function to handle AI analysis for amendments within folders
    // Removed unused handleAmendmentAIAnalysis

    // Function to analyze and compare all amendments within a folder
    const handleFolderAmendmentComparison = async (folder: OrdinanceFolder) => {
        if (!aiService) {
            toast.error("AI service is not available. Please try again later.");
            return;
        }
        if (folder.amendments.length === 0) {
            toast.info("No amendments found to compare.");
            return;
        }
        
        // Check if comparison already exists and user wants to view it
        if (folder.amendmentComparisonResult) {
            // Show the existing comparison result in the AI analysis popup
            setSelectedOrdinanceForAnalysis({
                ...folder.baseOrdinance,
                aiAnalysisResult: folder.amendmentComparisonResult
            });
            setAiAnalysisOpen(true);
            return;
        }
        
        setFolderAmendmentLoading(folder.id);
        try {
            // Create a comprehensive comparison of all ordinances
            const allOrdinances = [folder.baseOrdinance, ...folder.amendments];
            
            // Use the AI service to compare multiple ordinances (base + amendments)
            const comparisonResult = await aiService.compareMultipleOrdinances(allOrdinances);
            
            // Create a custom analysis result for the folder comparison
            const folderComparisonResult: AIAnalysisResponse = {
                summary: `Amendment Comparison Analysis for ${folder.baseOrdinance.ord_title}`,
                keyPoints: [],
                keyDifferences: comparisonResult.differences,
                similarities: comparisonResult.similarities,
                differences: comparisonResult.differences,
                // recommendations removed per requirements
                similarityScore: comparisonResult.similarityScore,
                analysisType: 'amendment_comparison',
                timestamp: new Date().toISOString(),
                analysisTimestamp: new Date().toISOString(),
                metadata: {
                    ordinanceCount: allOrdinances.length,
                    categories: [...new Set(allOrdinances.map(ord => ord.ord_category))],
                    yearRange: {
                        min: Math.min(...allOrdinances.map(ord => ord.ord_year)),
                        max: Math.max(...allOrdinances.map(ord => ord.ord_year))
                    }
                }
            };
            
            // Save the comparison result to localStorage for the base ordinance
            saveAnalysisToStorage(folder.baseOrdinance.ord_num, folderComparisonResult);
            
            // Update the folder with the comparison result
            const updatedFolder = { ...folder, amendmentComparisonResult: folderComparisonResult };
            
            // Notify parent component about the analysis completion
            onAnalysisComplete(updatedFolder);
            
            // Show the comparison result directly in the AI analysis popup
            setSelectedOrdinanceForAnalysis({
                ...folder.baseOrdinance,
                aiAnalysisResult: folderComparisonResult
            });
            setAiAnalysisOpen(true);
            
            toast.success("Amendment comparison analysis completed successfully! File content from all ordinances has been analyzed and compared.");
        } catch (error) {
            console.error("Error comparing amendments:", error);
            toast.error("Failed to compare amendments. Please try again.");
        } finally {
            setFolderAmendmentLoading(null);
        }
    };

    if (!folder) return null;

    return (
        <>
            {/* Folder View Popup Dialog */}
            <DialogLayout
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                className="max-w-4xl"
                title={`Ordinance Folder: ${folder.baseOrdinance.ord_title}`}
                description={`Viewing all ordinances in this folder (${folder.totalOrdinances} total)`}
                mainContent={
                    <div className="max-h-[80vh] overflow-y-auto p-4">
                        <div className="space-y-6">
                            {/* Base Ordinance */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-semibold text-blue-700">Base Ordinance</span>
                                    <Badge variant="outline" className="text-xs">Original</Badge>
                                </div>
                                
                                <div className="space-y-3">
                                    {/* Base Ordinance Actions */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenAIAnalysis(folder.baseOrdinance)}
                                            disabled={!aiService || individualAnalysisLoading === folder.baseOrdinance.ord_num || folderAmendmentLoading === folder.id}
                                            className="text-xs px-3 py-1 h-7"
                                        >
                                            {(individualAnalysisLoading === folder.baseOrdinance.ord_num || folderAmendmentLoading === folder.id) ? (
                                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                            ) : (
                                                <Brain className="h-3 w-3 mr-1" />
                                            )}
                                            {(individualAnalysisLoading === folder.baseOrdinance.ord_num || folderAmendmentLoading === folder.id) ? 'Analyzing...' : 'Analyze'}
                                        </Button>
                                        
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (folder.baseOrdinance.file && folder.baseOrdinance.file.file_url) {
                                                    window.open(folder.baseOrdinance.file.file_url, '_blank');
                                                } else {
                                                    toast.error('No file available to view');
                                                }
                                            }}
                                            className="text-xs px-3 py-1 h-7"
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            View File
                                        </Button>
                                    </div>
                                    
                                    <div className="text font-medium text-lg">{folder.baseOrdinance.ord_title}</div>
                                    <div className="text-xs text-gray-600">ORD: {folder.baseOrdinance.ord_num} • {folder.baseOrdinance.ord_date_created}</div>
                                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                        {folder.baseOrdinance.ord_details || 'No details available'}
                                    </div>
                                </div>
                            </div>

                            {/* Amendments and Repeals separated */}
                            {folder.amendments.length > 0 && (() => {
                                const amendmentItems = folder.amendments.filter(a => Boolean(a.ord_is_ammend));
                                const repealItems = folder.amendments.filter(a => Boolean(a.ord_repealed) && !a.ord_is_ammend);
                                return (
                                <div className="space-y-6">
                                    {amendmentItems.length > 0 && (
                                        <>
                                            <div className="flex items-center justify-between border-b pb-2">
                                                <h3 className="text-lg font-semibold text-gray-800">Amendments ({amendmentItems.length})</h3>
                                            </div>

                                    {/* Amendment Comparison Results */}
                                    {folder.amendmentComparisonResult && (
                                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-4 mb-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Brain className="h-4 w-4 text-green-600" />
                                                <h4 className="text-sm font-semibold text-green-800">Amendment Comparison Analysis</h4>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {/* Summary */}
                                                <div className="bg-white rounded p-3 border border-green-100">
                                                    <div className="text-xs font-medium text-green-700 mb-1">Summary</div>
                                                    <div className="text-sm text-gray-700 whitespace-pre-line">
                                                        {folder.amendmentComparisonResult.summary}
                                                    </div>
                                                </div>

                                                {/* Key Differences */}
                                                {folder.amendmentComparisonResult.keyDifferences && folder.amendmentComparisonResult.keyDifferences.length > 0 && (
                                                    <div className="bg-white rounded p-3 border border-green-100">
                                                        <div className="text-xs font-medium text-green-700 mb-2">Key Differences Between Amendments</div>
                                                        <ul className="space-y-1">
                                                            {folder.amendmentComparisonResult.keyDifferences.map((difference, index) => (
                                                                <li key={index} className="flex items-start gap-2">
                                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                                    <span className="text-xs text-gray-700">{difference}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Recommendations removed */}

                                                {/* Metadata */}
                                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                                    <span>Total Ordinances: {folder.amendmentComparisonResult.metadata?.ordinanceCount}</span>
                                                    <span>Years: {folder.amendmentComparisonResult.metadata?.yearRange?.min} - {folder.amendmentComparisonResult.metadata?.yearRange?.max}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {amendmentItems.map((amendment, index) => (
                                        <div key={amendment.ord_num} className="bg-white rounded-lg border border-gray-200 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-sm font-semibold text-green-700">Amendment {index + 1}</span>
                                                <Badge variant="outline" className="text-xs">Version {amendment.ord_ammend_ver || index + 1}</Badge>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {/* Amendment Actions */}
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpenAIAnalysis(amendment)}
                                                        disabled={!aiService || individualAnalysisLoading === amendment.ord_num || folderAmendmentLoading === folder.id}
                                                        className="text-xs px-3 py-1 h-7"
                                                    >
                                                        {(individualAnalysisLoading === amendment.ord_num || folderAmendmentLoading === folder.id) ? (
                                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                        ) : (
                                                            <Brain className="h-3 w-3 mr-1" />
                                                        )}
                                                        {(individualAnalysisLoading === amendment.ord_num || folderAmendmentLoading === folder.id) ? 'Analyzing...' : 'Analyze'}
                                                    </Button>
                                                    
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (amendment.file && amendment.file.file_url) {
                                                                window.open(amendment.file.file_url, '_blank');
                                                            } else {
                                                                toast.error('No file available to view');
                                                            }
                                                        }}
                                                        className="text-xs px-3 py-1 h-7"
                                                    >
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        View File
                                                    </Button>
                                                </div>
                                                
                                                <div className="text font-medium text-lg">{amendment.ord_title}</div>
                                                <div className="text-xs text-gray-600">ORD: {amendment.ord_num} • {amendment.ord_date_created}</div>
                                                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                                    {amendment.ord_details || 'No details available'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    </>
                                    )}

                                    {repealItems.length > 0 && (
                                        <>
                                            <div className="flex items-center justify-between border-b pb-2">
                                                <h3 className="text-lg font-semibold text-gray-800">Repeals ({repealItems.length})</h3>
                                            </div>
                                            {repealItems.map((repeal) => (
                                                <div key={repeal.ord_num} className="bg-white rounded-lg border border-gray-200 p-4">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                        <span className="text-sm font-semibold text-red-700">Repeal</span>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleOpenAIAnalysis(repeal)}
                                                                disabled={!aiService || individualAnalysisLoading === repeal.ord_num || folderAmendmentLoading === folder.id}
                                                                className="text-xs px-3 py-1 h-7"
                                                            >
                                                                {(individualAnalysisLoading === repeal.ord_num || folderAmendmentLoading === folder.id) ? (
                                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                                ) : (
                                                                    <Brain className="h-3 w-3 mr-1" />
                                                                )}
                                                                {(individualAnalysisLoading === repeal.ord_num || folderAmendmentLoading === folder.id) ? 'Analyzing...' : 'Analyze'}
                                                            </Button>

                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    if (repeal.file && repeal.file.file_url) {
                                                                        window.open(repeal.file.file_url, '_blank');
                                                                    } else {
                                                                        toast.error('No file available to view');
                                                                    }
                                                                }}
                                                                className="text-xs px-3 py-1 h-7"
                                                            >
                                                                <Eye className="h-3 w-3 mr-1" />
                                                                View File
                                                            </Button>
                                                        </div>

                                                        <div className="text font-medium text-lg">{repeal.ord_title}</div>
                                                        <div className="text-xs text-gray-600">ORD: {repeal.ord_num} • {repeal.ord_date_created}</div>
                                                        <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                                            {repeal.ord_details || 'No details available'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                                )})()}
                        </div>
                    </div>
                }
            />

            {/* AI Analysis Popup Dialog */}
            <DialogLayout
                isOpen={aiAnalysisOpen}
                onOpenChange={setAiAnalysisOpen}
                className="max-w-4xl"
                title={`AI Analysis: ${selectedOrdinanceForAnalysis?.ord_title}`}
                description={`Analyzing ordinance ${selectedOrdinanceForAnalysis?.ord_num}`}
                mainContent={
                    <div className="max-h-[80vh] overflow-y-auto p-4">
                        {selectedOrdinanceForAnalysis && (
                            <div className="space-y-4">
                                {/* Ordinance Info */}
                                <div className="bg-gray-50 p-3 rounded">
                                    <div className="text-sm font-medium">{selectedOrdinanceForAnalysis.ord_title}</div>
                                    <div className="text-xs text-gray-600">ORD: {selectedOrdinanceForAnalysis.ord_num} • {selectedOrdinanceForAnalysis.ord_date_created}</div>
                                </div>

                                {/* AI Analysis Results */}
                                {selectedOrdinanceForAnalysis.aiAnalysisResult ? (
                                    <div className="space-y-4">
                                        {/* Amendment Comparison Results - Enhanced Display */}
                                        {selectedOrdinanceForAnalysis.aiAnalysisResult.metadata?.ordinanceCount && selectedOrdinanceForAnalysis.aiAnalysisResult.metadata.ordinanceCount > 1 ? (
                                            <div className="space-y-4">
                                                {/* Header for Amendment Comparison */}
                                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-4">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Brain className="h-5 w-5 text-green-600" />
                                                        <h3 className="text-lg font-semibold text-green-800">Amendment Comparison Analysis</h3>
                                                    </div>
                                                    <div className="text-sm text-green-700">
                                                        Comparing {selectedOrdinanceForAnalysis.aiAnalysisResult.metadata.ordinanceCount} ordinances
                                                        {selectedOrdinanceForAnalysis.aiAnalysisResult.metadata.yearRange && (
                                                            <span> • Years: {selectedOrdinanceForAnalysis.aiAnalysisResult.metadata.yearRange.min} - {selectedOrdinanceForAnalysis.aiAnalysisResult.metadata.yearRange.max}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* File Content Analysis Status */}
                                                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="text-md font-semibold text-blue-800">File Content Analysis</h4>
                                                    </div>
                                                    <div className="text-sm text-blue-700">
                                                        <div className="font-medium mb-1">Comprehensive Document Analysis Completed</div>
                                                        <div>All ordinance documents have been analyzed and compared for detailed amendment tracking. The AI has examined the actual content of each ordinance to identify specific changes, additions, and deletions.</div>
                                                    </div>
                                                </div>

                                                {/* Executive Summary - Enhanced */}
                                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <h4 className="text-lg font-semibold text-gray-800">Executive Summary</h4>
                                                    </div>
                                                    <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 whitespace-pre-line leading-relaxed">
                                                        {selectedOrdinanceForAnalysis.aiAnalysisResult.summary}
                                                    </div>
                                                </div>

                                                {/* Key Differences */}
                                                {selectedOrdinanceForAnalysis.aiAnalysisResult.keyDifferences && selectedOrdinanceForAnalysis.aiAnalysisResult.keyDifferences.length > 0 && (
                                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <h4 className="text-lg font-semibold text-gray-800">Key Differences Between Amendments</h4>
                                                        </div>
                                                        <ul className="space-y-3">
                                                            {selectedOrdinanceForAnalysis.aiAnalysisResult.keyDifferences.map((difference, index) => (
                                                                <li key={index} className="flex items-start gap-3">
                                                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                                                    <span className="text-sm text-gray-700 leading-relaxed">{difference}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* Regular Individual Analysis Display */
                                            <div className="space-y-4">
                                                {/* File Content Analysis Status for Individual Ordinance */}
                                                {selectedOrdinanceForAnalysis.file?.file_url && (
                                                    <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="text-md font-semibold text-green-800">File Content Analysis</h4>
                                                        </div>
                                                        <div className="text-sm text-green-700">
                                                            <div className="font-medium mb-1">Document Content Analyzed</div>
                                                            <div>The ordinance document has been analyzed using both metadata and extracted file content for comprehensive understanding.</div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Individual Analysis Summary */}
                                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <h4 className="text-lg font-semibold text-blue-900">AI Analysis Summary</h4>
                                                    </div>
                                                    <div className="text-blue-800 leading-relaxed whitespace-pre-line">
                                                        {selectedOrdinanceForAnalysis.aiAnalysisResult.summary}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-500 mb-2">No AI analysis available yet</div>
                                        <div className="text-xs text-gray-400">Click the Analyze button on the ordinance card to run AI analysis</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                }
            />
        </>
    );
}

export default ViewOrdinance;