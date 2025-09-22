
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button/button";
import { Plus, Search, Loader2, Eye, FileText, Brain, Folder } from 'lucide-react';
import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from '@/components/ui/input';
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Ordinance, getAllOrdinances, deleteOrdinance, OrdinanceFolder, groupOrdinancesIntoFolders, updateOrdinance } from './restful-api/OrdinanceGetAPI';
import { useNavigate } from 'react-router-dom';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form/form.tsx";
import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input.tsx';
import { FormInput } from '@/components/ui/form/form-input';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ordinanceUploadFormSchema } from '@/form-schema/council/ordinanceUploadSchema';
import { MediaUpload, MediaUploadType } from '@/components/ui/media-upload';
import { useInsertOrdinanceUpload } from './queries/OrdinanceUploadInsertQueries.tsx';
// import { OrdinanceAISummary } from './queries/OrdinanceAISummary.tsx';
import { huggingFaceAIService, AIAnalysisResponse } from './services/HuggingFaceAIService';
import { Badge } from '@/components/ui/badge';

// Type for ordinances only
type OrdinanceItem = Ordinance;


function OrdinancePage() {
    const navigate = useNavigate();
    const [ordinanceItems, setOrdinanceItems] = useState<OrdinanceItem[]>([]);
    const [ordinanceFolders, setOrdinanceFolders] = useState<OrdinanceFolder[]>([]);
    const [filter, setFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<OrdinanceItem | null>(null);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const [repealDialogOpen, setRepealDialogOpen] = useState(false);
    const [ordinanceToToggle, setOrdinanceToToggle] = useState<OrdinanceItem | null>(null);
    const [creationMode, setCreationMode] = useState<'new' | 'amend' | 'repeal'>('new');
    
    // New states for ordinance amendment functionality
    const [selectedExistingOrdinance, setSelectedExistingOrdinance] = useState<string>("new");
    const [showUploadAIAnalysis, setShowUploadAIAnalysis] = useState(false);
    const [uploadAIAnalysisResult, setUploadAIAnalysisResult] = useState<AIAnalysisResponse | null>(null);
    
    // State for individual ordinance AI analysis
    const [individualAnalysisLoading, setIndividualAnalysisLoading] = useState<string | null>(null);
    const [fileExtractionLoading, setFileExtractionLoading] = useState<string | null>(null);
    
    // State for ordinance creation loading
    const [isCreatingOrdinance, setIsCreatingOrdinance] = useState(false);
    
    // State for folder amendment comparison loading
    const [folderAmendmentLoading, setFolderAmendmentLoading] = useState<string | null>(null);
    
    // State for folder view popup
    const [selectedFolder, setSelectedFolder] = useState<OrdinanceFolder | null>(null);
    const [folderViewOpen, setFolderViewOpen] = useState(false);
    const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);
    const [selectedOrdinanceForAnalysis, setSelectedOrdinanceForAnalysis] = useState<OrdinanceItem | null>(null);
    
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
    
    // Function to load AI analysis results from localStorage
    const loadAnalysisFromStorage = (ordinanceId: string): AIAnalysisResponse | null => {
        try {
            const existingAnalyses = JSON.parse(localStorage.getItem('ordinanceAnalyses') || '{}');
            const analysis = existingAnalyses[ordinanceId];
            
            // Check if analysis is less than 24 hours old (optional: you can adjust this)
            if (analysis && analysis.timestamp) {
                const hoursSinceAnalysis = (Date.now() - analysis.timestamp) / (1000 * 60 * 60);
                if (hoursSinceAnalysis < 24) {
                    return analysis;
                } else {
                    // Remove expired analysis
                    delete existingAnalyses[ordinanceId];
                    localStorage.setItem('ordinanceAnalyses', JSON.stringify(existingAnalyses));
                }
            }
            return null;
        } catch (error) {
            console.error('Error loading analysis from localStorage:', error);
            return null;
        }
    };
    
    // Summary popup state removed - summary now shown in AI analysis popup
    
    const aiService = useMemo(() => {
        try {
            return huggingFaceAIService;
        } catch (error) {
            console.error("Failed to initialize AI service:", error);
            return null;
        }
    }, []);
    
    const {mutate: addOrdinance} = useInsertOrdinanceUpload(() => {
        console.log('Ordinance added successfully, refreshing data...');
        setUploadDialogOpen(false);
        
        // Set loading state to false
        setIsCreatingOrdinance(false);
        
        // Show success message based on whether it was an amendment
        if (selectedExistingOrdinance && selectedExistingOrdinance !== "new") {
            toast.success('Amendment created successfully! It will appear in the same folder as the base ordinance.');
        } else {
            toast.success('Ordinance created successfully!');
        }
        
        // Reset form and selected ordinance
        resetUploadForm();
        
        // Refresh data to show the new folder structure
        fetchAllItems();
    });
    
    // Handle error case to reset loading state
    const handleOrdinanceError = () => {
        setIsCreatingOrdinance(false);
    };
    
    const form = useForm<z.infer<typeof ordinanceUploadFormSchema>>({
        resolver: zodResolver(ordinanceUploadFormSchema),
        defaultValues: {
            ordinanceTitle: "",        
            ordinanceDate: "",
            ordinanceCategory: "",
            ordinanceDetails: "",
            ordinanceFile: "",
            ord_repealed: false
        },
    });

    const ordinanceCategories = [
        { id: "Council", name: "Council" },
        { id: "Waste Committee", name: "Waste Committee" },
        { id: "GAD", name: "GAD" },
        { id: "Finance", name: "Finance" }
    ];

    const filterOptions = [
        { id: "all", name: "All" },
        { id: "Council", name: "Council" },
        { id: "Waste Committee", name: "Waste Committee" },
        { id: "GAD", name: "GAD" },
        { id: "Finance", name: "Finance" }
    ];

    const ordinanceOptions = ordinanceItems
        .filter(ord => ord.ord_num && ord.ord_num.trim() !== '') // Filter out any items with empty ord_num
        .filter(ord => !ord.ord_repealed) // Exclude repealed ordinances from amendment selection
        .map(ord => ({
            id: ord.ord_num,
            name: `${ord.ord_num} - ${ord.ord_title} (${ord.ord_year})`
        }));

    useEffect(() => {
        fetchAllItems();
    }, [filter, currentPage]);

    // Debug: Log ordinance data to see file structure
    useEffect(() => {
        if (ordinanceItems.length > 0) {
            console.log('Ordinance items:', ordinanceItems);
            ordinanceItems.forEach(item => {
                console.log(`File for ${item.ord_num}:`, item.file);
            });
        }
    }, [ordinanceItems]);

    const fetchAllItems = async () => {
        try {
            setLoading(true);
            const ordinances = await getAllOrdinances();
            console.log('Fetched ordinances from backend:', ordinances);
            
            // Check for amendment fields
            ordinances.forEach((ord: Ordinance, index: number) => {
                console.log(`Ordinance ${index}:`, {
                    ord_num: ord.ord_num,
                    ord_title: ord.ord_title,
                    ord_parent: ord.ord_parent,
                    ord_is_ammend: ord.ord_is_ammend,
                    ord_ammend_ver: ord.ord_ammend_ver
                });
            });

            // Apply filter
            let filtered = ordinances;
            if (filter !== "all" && filter !== "Template") {
                filtered = ordinances.filter((item: Ordinance) => item.ord_category === filter);
            }

            // Load existing AI analyses from localStorage
            const ordinancesWithAnalyses = filtered.map(ordinance => {
                const existingAnalysis = loadAnalysisFromStorage(ordinance.ord_num);
                return existingAnalysis ? { ...ordinance, aiAnalysisResult: existingAnalysis } : ordinance;
            });

            setOrdinanceItems(ordinancesWithAnalyses);
            
            // Group ordinances into folders
            const folders = groupOrdinancesIntoFolders(ordinancesWithAnalyses);
            console.log('Created folders:', folders);
            setOrdinanceFolders(folders);
            
            setTotalPages(Math.ceil(folders.length / 10));
        } catch (error) {
            console.error('Error fetching items:', error);
            toast.error('Failed to fetch ordinances');
        } finally {
            setLoading(false);
        }
    };

    const requestToggleRepealed = (item: OrdinanceItem) => {
        setOrdinanceToToggle(item);
        setRepealDialogOpen(true);
    };

    const confirmToggleRepealed = async () => {
        if (!ordinanceToToggle) return;
        try {
            const newValue = !Boolean(ordinanceToToggle.ord_repealed);
            await updateOrdinance(ordinanceToToggle.ord_num, { ord_repealed: newValue });
            toast.success(newValue ? 'Ordinance marked as repealed' : 'Ordinance un-repealed');
            setRepealDialogOpen(false);
            setOrdinanceToToggle(null);
            fetchAllItems();
        } catch (e) {
            console.error('Failed to toggle repeal:', e);
            toast.error('Failed to update ordinance repeal status');
        }
    };



    // Function to get folder status and styling
    const getFolderStatus = (folder: OrdinanceFolder) => {
        if (folder.totalOrdinances === 1) {
            return { text: "Single Ordinance", color: "text-gray-600", bgColor: "bg-gray-100" };
        } else if (folder.amendments.length > 0) {
            return { text: "Multiple Ordinances", color: "text-blue-600", bgColor: "bg-blue-100" };
        } else {
            return { text: "Base Ordinance", color: "text-green-600", bgColor: "bg-green-100" };
        }
    };
    
    const handleFolderView = (folder: OrdinanceFolder) => {
        setSelectedFolder(folder);
        setFolderViewOpen(true);
    };

    // Function to handle AI analysis for ordinances (individual or amendment comparison)
    const handleOpenAIAnalysis = async (ordinance: OrdinanceItem) => {
        if (!aiService) {
            toast.error("AI service is not available. Please try again later.");
            return;
        }

        // Check if this is a base ordinance with amendments - if so, automatically do amendment comparison
        const folder = ordinanceFolders.find(f => f.baseOrdinance.ord_num === ordinance.ord_num);
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


    const confirmDelete = async () => {
        if (!itemToDelete) return;
        
        try {
            await deleteOrdinance(itemToDelete.ord_num);
            toast.success('Ordinance deleted successfully');
            fetchAllItems();
        } catch (error) {
            console.error('Error deleting ordinance:', error);
            toast.error('Failed to delete ordinance');
        } finally {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    // const handleDownloadPDF = (pdfUrl: string, title: string) => {
    //     if (pdfUrl) {
    //         const link = document.createElement('a');
    //         link.href = pdfUrl;
    //         link.download = `${title.replace(/\s+/g, '_')}.pdf`;
    //         document.body.appendChild(link);
    //         link.click();
    //         document.body.removeChild(link);
    //     } else {
    //         toast.error('PDF not available for download');
    //     }
    // };

    const handleUploadSubmit = (values: z.infer<typeof ordinanceUploadFormSchema>) => {
        console.log("Form values:", values);
        console.log('Media Files:', mediaFiles);
        console.log('Selected existing ordinance:', selectedExistingOrdinance);
        
        // Set loading state to true
        setIsCreatingOrdinance(true);
        
        // Based on creation mode
        if (creationMode === 'amend') {
            if (!selectedExistingOrdinance || selectedExistingOrdinance === 'new') {
                toast.error('Please select an ordinance to amend.');
                setIsCreatingOrdinance(false);
                return;
            }
            // If new ordinance marked repealed, block amendment creation
            if (values.ord_repealed) {
                toast.error('A repealed ordinance cannot be created as an amendment.');
                setIsCreatingOrdinance(false);
                return;
            }

            // Also block if selected parent is repealed (client-side check based on loaded data)
            const parent = ordinanceItems.find(o => o.ord_num === selectedExistingOrdinance);
            if (parent && parent.ord_repealed) {
                toast.error('Cannot amend a repealed ordinance.');
                setIsCreatingOrdinance(false);
                return;
            }
            // Count existing amendments for this parent
            const existingAmendments = ordinanceItems.filter(ord => 
                ord.ord_parent === selectedExistingOrdinance || 
                ord.ord_num === selectedExistingOrdinance
            ).length;
            
            const amendmentData = {
                ...values,
                ord_repealed: false,
                ord_parent: selectedExistingOrdinance,
                ord_is_ammend: true,
                ord_ammend_ver: existingAmendments + 1
            };
            console.log("Creating amendment with data:", amendmentData);
            console.log("Sending to addOrdinance:", { values: amendmentData, mediaFiles });
            addOrdinance({ values: amendmentData, mediaFiles }, { onError: handleOrdinanceError });
        } else if (creationMode === 'repeal') {
            if (!selectedExistingOrdinance || selectedExistingOrdinance === 'new') {
                toast.error('Please select an ordinance to repeal.');
                setIsCreatingOrdinance(false);
                return;
            }
            const repealData = {
                ...values,
                ord_repealed: true,
                // Link to the ordinance being repealed (optional business rule)
                ord_parent: selectedExistingOrdinance,
                ord_is_ammend: false,
            };
            console.log("Creating repeal with data:", repealData);
            addOrdinance({ values: repealData, mediaFiles }, { onError: handleOrdinanceError });
        } else {
            console.log("Creating new standalone ordinance");
            const newData = { ...values, ord_repealed: false } as any;
            addOrdinance({ values: newData, mediaFiles }, { onError: handleOrdinanceError });
        }
    };

    useEffect(() => {
        const first: any = (mediaFiles && mediaFiles.length > 0) ? (mediaFiles[0] as any) : undefined;
        const publicUrl: string | undefined = first?.publicUrl || first?.url;
        if (publicUrl) {
            form.setValue('ordinanceFile', publicUrl);
        } else {
            form.setValue('ordinanceFile', 'no-image-url-fetched');
        }
    }, [mediaFiles, form]);

    // Watch for changes in ordinance details to update AI analysis content
    useEffect(() => {
        const subscription = form.watch(() => {
            // Handle form field changes if needed
        });
        return () => subscription.unsubscribe();
    }, [form]);

    const resetUploadForm = () => {
        form.reset();
        setMediaFiles([]);
        setActiveVideoId("");
        setSelectedExistingOrdinance("new");
        setUploadAIAnalysisResult(null);
    };


    const handleIndividualAIAnalysis = async (item: OrdinanceItem) => {
        if (!aiService) {
            toast.error("AI service is not available. Please try again later.");
            return;
        }

        setIndividualAnalysisLoading(item.ord_num);
        setFileExtractionLoading(item.ord_num);
        try {
            // Use the new Hugging Face AI service with comparison support
            const result = await aiService.analyzeOrdinanceWithComparison({
                ordinance: item,
                analysisType: "summary",
                includeFileContent: true
            });
            
            // Convert to the expected format
            const analysisResult = {
                summary: result.summary,
                keyPoints: result.keyPoints,
                recommendations: result.recommendations,
                analysisType: "summary",
                timestamp: new Date().toISOString(),
                riskLevel: "low" as const,
                complianceStatus: "compliant" as const,
                confidence: 0.8,
                analysisTimestamp: new Date().toISOString()
            };
            
            // Save the analysis result to localStorage
            saveAnalysisToStorage(item.ord_num, analysisResult);
            
            // Update the ordinance item with AI analysis result
            setOrdinanceItems(prev => prev.map(ord => 
                ord.ord_num === item.ord_num 
                    ? { ...ord, aiAnalysisResult: analysisResult }
                    : ord
            ));
            
            // Also update the folder structure
            setOrdinanceFolders(prev => prev.map(folder => {
                if (folder.baseOrdinance.ord_num === item.ord_num) {
                    return {
                        ...folder,
                        baseOrdinance: { ...folder.baseOrdinance, aiAnalysisResult: analysisResult }
                    };
                }
                const updatedAmendments = folder.amendments.map(amendment =>
                    amendment.ord_num === item.ord_num
                        ? { ...amendment, aiAnalysisResult: analysisResult }
                        : amendment
                );
                if (updatedAmendments.some(amendment => amendment.ord_num === item.ord_num)) {
                    return { ...folder, amendments: updatedAmendments };
                }
                return folder;
            }));
            
            toast.success("Document analysis completed successfully!");
            
            // Open the AI analysis popup to show the results
            // Use the updated item with the new analysis result
            const updatedItem = { ...item, aiAnalysisResult: analysisResult };
            setSelectedOrdinanceForAnalysis(updatedItem);
            setAiAnalysisOpen(true);
        } catch (error) {
            console.error("Error analyzing ordinance:", error);
            toast.error("Failed to analyze ordinance. Please try again.");
        } finally {
            setIndividualAnalysisLoading(null);
            setFileExtractionLoading(null);
        }
    };

    // Function to handle AI analysis for amendments within folders

    // New function to analyze and compare all amendments within a folder
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
            
            // Use the new Hugging Face AI service to compare multiple ordinances
            const comparisonResult = await aiService.compareMultipleOrdinances(allOrdinances);
            
            // Create a custom analysis result for the folder comparison
            const folderComparisonResult = {
                summary: `Amendment Comparison Analysis for ${folder.baseOrdinance.ord_title}\n\n${comparisonResult.analysis}`,
                keyPoints: comparisonResult.similarities, // Similarities as key points
                keyDifferences: comparisonResult.differences, // Differences as key differences
                similarities: comparisonResult.similarities, // Keep similarities
                differences: comparisonResult.differences, // Keep differences
                recommendations: [
                    'Review both documents for compliance',
                    'Check for conflicting provisions',
                    'Ensure consistency in legal language',
                    'Verify effective dates and penalties'
                ],
                analysisType: "amendment_comparison",
                timestamp: new Date().toISOString(),
                similarityScore: comparisonResult.similarityScore,
                riskLevel: "low" as const,
                complianceStatus: "compliant" as const,
                confidence: 0.8,
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
            
            // Store the comparison result in the folder
            setOrdinanceFolders(prev => prev.map(f =>
                f.id === folder.id 
                    ? { ...f, amendmentComparisonResult: folderComparisonResult }
                    : f
            ));
            
            // Show the comparison result directly in the AI analysis popup
            setSelectedOrdinanceForAnalysis({
                ...folder.baseOrdinance,
                aiAnalysisResult: folderComparisonResult
            });
            setAiAnalysisOpen(true);
            
            toast.success("Amendment comparison analysis completed successfully!");
        } catch (error) {
            console.error("Error comparing amendments:", error);
            toast.error("Failed to compare amendments. Please try again.");
        } finally {
            setFolderAmendmentLoading(null);
        }
    };

    // Removed unused color functions for risk and compliance badges

    const filteredItems = ordinanceFolders.filter(folder => {
        const searchLower = searchTerm.toLowerCase();
        const baseOrdinance = folder.baseOrdinance;
        const amendments = folder.amendments;
        
        // Check if search term matches base ordinance
        const baseMatches = baseOrdinance.ord_title.toLowerCase().includes(searchLower) || 
                           baseOrdinance.ord_num.toLowerCase().includes(searchLower);
        
        // Check if search term matches any amendment
        const amendmentMatches = amendments.some(amendment => 
            amendment.ord_title.toLowerCase().includes(searchLower) || 
            amendment.ord_num.toLowerCase().includes(searchLower)
        );
        
        return baseMatches || amendmentMatches;
    });

    return (
        <div className="w-full h-full px-2 md:px-4 lg:px-6">
            <div className="flex-col items-center mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                    Ordinance Record
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Manage and view ordinances and templates
                </p>
            </div>
            <hr className="border-gray mb-6 sm:mb-10" />        



            <div className='w-full flex flex-col md:flex-row justify-between mb-6 gap-4'>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                        <Input 
                            placeholder="Search..." 
                            className="pl-10 w-full md:w-72 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <SelectLayout
                        className="bg-white"
                        label=""
                        placeholder="Filter"
                        options={filterOptions}
                        value={filter}
                        onChange={(value) => setFilter(value)}
                    />     
                </div>
                <div className="w-full md:w-auto mt-4 md:mt-0 flex gap-2">
                    <Button 
                        className="w-full md:w-auto"
                        onClick={() => {
                            setUploadDialogOpen(true);
                            resetUploadForm();
                        }}
                    >
                        <Plus />Upload Ordinance
                    </Button>
                </div>
            </div>                    

            <div className="w-full mt-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#1273B8]" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No ordinances found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                        {filteredItems.map((folder) => (
                            <Card key={folder.id} className="hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                                {/* Folder Header */}
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {folder.totalOrdinances > 1 && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleFolderView(folder)}
                                                    className="h-7 px-2 text-xs hover:bg-blue-50"
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    View All
                                                </Button>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Folder className="h-3 w-3 text-gray-600" />
                                                <span className="text-xs font-medium text-gray-700">
                                                    Ordinance Folder
                                                </span>
                                                <Badge 
                                                    variant="secondary" 
                                                    className={`text-xs px-2 py-0.5 ${getFolderStatus(folder).bgColor} ${getFolderStatus(folder).color}`}
                                                >
                                                    {getFolderStatus(folder).text}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Analysis Summary removed - now shown in analyze button popup */}

                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold text-black mb-2">
                                        {folder.baseOrdinance.ord_title}
                                    </CardTitle>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                <span className="font-semibold">ORD:</span> {folder.baseOrdinance.ord_num}
                                            </span>
                                            {folder.baseOrdinance.ord_repealed && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Repealed
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                folder.baseOrdinance.ord_category === 'Council' ? 'bg-purple-100 text-purple-800' :
                                                folder.baseOrdinance.ord_category === 'Waste Committee' ? 'bg-green-100 text-green-800' :
                                                folder.baseOrdinance.ord_category === 'GAD' ? 'bg-pink-100 text-pink-800' :
                                                folder.baseOrdinance.ord_category === 'Finance' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {folder.baseOrdinance.ord_category}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 pb-4">
                                    <div className="space-y-3">
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText size={14} className="text-blue-500" />
                                                <span className="font-semibold text-blue-700 text-sm">Details</span>
                                            </div>
                                            <div className="text-xs text-gray-700 leading-relaxed pl-4 border-l-2 border-blue-100 pt-1">
                                                {folder.baseOrdinance.ord_details ? (
                                                    folder.baseOrdinance.ord_details.length > 80 ? 
                                                    `${folder.baseOrdinance.ord_details.substring(0, 80)}...` : 
                                                    folder.baseOrdinance.ord_details
                                                ) : (
                                                    <span className="text-gray-500 italic">No details available</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 pt-3">
                                            <TooltipLayout
                                                trigger={
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            handleOpenAIAnalysis(folder.baseOrdinance);
                                                        }}
                                                        disabled={!aiService || individualAnalysisLoading === folder.baseOrdinance.ord_num || folderAmendmentLoading === folder.id}
                                                        className="h-8 px-3 text-xs hover:bg-purple-50 hover:border-purple-300"
                                                    >
                                                        {(individualAnalysisLoading === folder.baseOrdinance.ord_num || folderAmendmentLoading === folder.id) ? (
                                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                        ) : folder.baseOrdinance.aiAnalysisResult ? (
                                                            <Eye className="h-4 w-4 mr-1" />
                                                        ) : (
                                                            <Brain className="h-4 w-4 mr-1" />
                                                        )}
                                                        {(individualAnalysisLoading === folder.baseOrdinance.ord_num || folderAmendmentLoading === folder.id) ? 
                                                         (fileExtractionLoading === folder.baseOrdinance.ord_num ? 'Extracting...' : 'Analyzing...') : 
                                                         folder.baseOrdinance.aiAnalysisResult ? 'View Analysis' : 'Analyze'}
                                                    </Button>
                                                }
                                                content={folder.baseOrdinance.aiAnalysisResult ? 'View AI Analysis Results' : 'Run AI Analysis'}
                                            />

                                            <TooltipLayout
                                                trigger={
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => requestToggleRepealed(folder.baseOrdinance)}
                                                        className="h-8 px-3 text-xs hover:bg-red-50 hover:border-red-300"
                                                    >
                                                        {folder.baseOrdinance.ord_repealed ? 'Un-repeal' : 'Mark Repealed'}
                                                    </Button>
                                                }
                                                content={folder.baseOrdinance.ord_repealed ? 'Mark as active again' : 'Mark this ordinance as repealed'}
                                            />

                                            <TooltipLayout
                                                trigger={
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-300"
                                                        onClick={() => {
                                                            if (folder.baseOrdinance.file && folder.baseOrdinance.file.file_url) {
                                                                window.open(folder.baseOrdinance.file.file_url, '_blank');
                                                            } else {
                                                                toast.error('No file available to view');
                                                            }
                                                        }}
                                                    >
                                                        <Eye size={12} className="text-green-600" />
                                                    </Button>
                                                }
                                                content="View File"
                                            />

                                            
                                            {/* <TooltipLayout
                                                trigger={
                                                    <Button
                                                        onClick={() => handleDeleteItem(folder.baseOrdinance)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300"
                                                    >
                                                        <Trash size={14} className="text-red-600" />
                                                    </Button>
                                                }
                                                content="Delete Ordinance"
                                            /> */}
                                        </div>
                                    </div>
                                </CardContent>



                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                    Showing {filteredItems.length > 0 ? ((currentPage - 1) * 10) + 1 : 0}-
                    {Math.min(currentPage * 10, filteredItems.length)} of {filteredItems.length} rows
                </p>

                <div className="w-full sm:w-auto flex justify-center">
                    <PaginationLayout 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <DialogLayout
                isOpen={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                className="max-w-md"
                title="Confirm Delete"
                description={`Are you sure you want to delete this ordinance? This action cannot be undone.`}
                mainContent={
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setItemToDelete(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </div>
                }
            />

            {/* Repeal Confirmation Dialog */}
            <DialogLayout
                isOpen={repealDialogOpen}
                onOpenChange={setRepealDialogOpen}
                className="max-w-md"
                title={ordinanceToToggle?.ord_repealed ? 'Un-repeal Ordinance' : 'Mark as Repealed'}
                description={ordinanceToToggle?.ord_repealed ?
                    `This will mark ${ordinanceToToggle?.ord_num} as active again.` :
                    `This will mark ${ordinanceToToggle?.ord_num} as repealed. It cannot be amended while repealed.`}
                mainContent={
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRepealDialogOpen(false);
                                setOrdinanceToToggle(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={confirmToggleRepealed}>
                            Confirm
                        </Button>
                    </div>
                }
            />

            {/* Upload Ordinance Dialog */}
            <DialogLayout
                isOpen={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
                className="max-w-2xl"
                title="Upload Ordinance"
                description="Fill in the details and upload your ordinance document"
                mainContent={
                    <div className="max-h-[80vh] overflow-y-auto p-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleUploadSubmit)} className="space-y-4">
                                {/* Creation Mode Selection */}
                                <div className="border rounded-lg p-4 mb-4 bg-blue-50 border-blue-200">
                                    <h3 className="text-lg font-semibold mb-3 text-blue-900">Upload Ordinance</h3>
                                    <p className="text-sm mb-4 text-blue-700">
                                        Choose to create a new ordinance, amend an existing one, or file a repeal.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                                        <Button variant={creationMode === 'new' ? 'default' : 'outline'} onClick={() => {
                                            setCreationMode('new');
                                            setSelectedExistingOrdinance('new');
                                            form.setValue('ord_repealed', false);
                                        }}>New</Button>
                                        <Button variant={creationMode === 'amend' ? 'default' : 'outline'} onClick={() => {
                                            setCreationMode('amend');
                                            form.setValue('ord_repealed', false);
                                        }}>Amend</Button>
                                        <Button variant={creationMode === 'repeal' ? 'default' : 'outline'} onClick={() => {
                                            setCreationMode('repeal');
                                            form.setValue('ord_repealed', true);
                                        }}>Repeal</Button>
                                    </div>

                                    {(creationMode === 'amend' || creationMode === 'repeal') && (
                                        <div className="w-full">
                                            <SelectLayout
                                                className="w-full"
                                                label={creationMode === 'amend' ? 'Select ordinance to amend' : 'Select ordinance to repeal'}
                                                placeholder={creationMode === 'amend' ? 'Choose ordinance to amend' : 'Choose ordinance to repeal'}
                                                options={ordinanceOptions}
                                                value={selectedExistingOrdinance === 'new' ? '' : selectedExistingOrdinance}
                                                onChange={(value) => {
                                                    setSelectedExistingOrdinance(value || 'new');
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Title Field */}
                                <FormInput
                                    control={form.control}
                                    name="ordinanceTitle"
                                    label="Ordinance Title"    
                                />

                                {/* Date Field */}
                                <FormDateTimeInput
                                    control={form.control}
                                    name="ordinanceDate"
                                    label="Date"
                                    type="date"    
                                />

                                {/* Details Field */}
                                <FormField
                                    control={form.control}
                                    name="ordinanceDetails"
                                    render={() => (
                                        <FormItem>
                                            <FormControl>
                                                <FormTextArea
                                                    control={form.control}
                                                    name="ordinanceDetails"
                                                    label="Ordinance Details"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Category Field */}
                                <FormField
                                    control={form.control}
                                    name="ordinanceCategory"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <SelectLayout
                                                    label="Select category"
                                                    placeholder="Select category"
                                                    options={ordinanceCategories}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Repealed flag is controlled by creation mode; no manual checkbox */}

                                {/* File Upload Field */}
                                <FormField
                                    control={form.control}
                                    name="ordinanceFile"
                                    render={() => (
                                        <FormItem>
                                            <FormControl>
                                                <MediaUpload
                                                    title="Ordinance File"
                                                    description="Upload ordinance document"
                                                    mediaFiles={mediaFiles}
                                                    setMediaFiles={setMediaFiles}
                                                    activeVideoId={activeVideoId}
                                                    setActiveVideoId={setActiveVideoId}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Submit Button */}
                                <div className="flex items-center justify-end pt-4">
                                    <Button 
                                        type="submit" 
                                        className="min-w-[120px]"
                                        disabled={isCreatingOrdinance}
                                    >
                                        {isCreatingOrdinance ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                }
            />



            {/* Upload AI Analysis Results Dialog */}
            <DialogLayout
                isOpen={showUploadAIAnalysis}
                onOpenChange={setShowUploadAIAnalysis}
                className="max-w-4xl"
                title="AI Ordinance Comparison Analysis"
                description="Analysis of differences between existing and new ordinance"
                mainContent={
                    <div className="max-h-[80vh] overflow-y-auto p-4">
                        {uploadAIAnalysisResult && (
                            <div className="space-y-6">
                                {/* Analysis Header - Removed risk and compliance badges */}

                                {/* Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Executive Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line">
                                            {uploadAIAnalysisResult.summary}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Key Differences */}
                                {uploadAIAnalysisResult.keyDifferences && uploadAIAnalysisResult.keyDifferences.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Key Differences</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {uploadAIAnalysisResult.keyDifferences?.map((difference: string, index: number) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                        <span className="text-sm text-gray-700">{difference}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
                }
            />

            {/* Folder View Popup Dialog */}
            <DialogLayout
                isOpen={folderViewOpen}
                onOpenChange={setFolderViewOpen}
                className="max-w-4xl"
                title={`Ordinance Folder: ${selectedFolder?.baseOrdinance.ord_title}`}
                description={`Viewing all ordinances in this folder (${selectedFolder?.totalOrdinances} total)`}
                mainContent={
                    <div className="max-h-[80vh] overflow-y-auto p-4">
                        {selectedFolder && (
                            <div className="space-y-6">
                                {/* Base Ordinance */}
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm font-semibold text-blue-700">Base Ordinance</span>
                                        <Badge variant="outline" className="text-xs">Original</Badge>
                                    </div>
                                    
                                                                                    <div className="space-y-3">
                                                    {/* Base Ordinance Actions - Moved above title */}
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleOpenAIAnalysis(selectedFolder.baseOrdinance)}
                                                            disabled={!aiService || individualAnalysisLoading === selectedFolder.baseOrdinance.ord_num || folderAmendmentLoading === selectedFolder.id}
                                                            className="text-xs px-3 py-1 h-7"
                                                        >
                                                            {(individualAnalysisLoading === selectedFolder.baseOrdinance.ord_num || folderAmendmentLoading === selectedFolder.id) ? (
                                                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                            ) : (
                                                                <Brain className="h-3 w-3 mr-1" />
                                                            )}
                                                            {(individualAnalysisLoading === selectedFolder.baseOrdinance.ord_num || folderAmendmentLoading === selectedFolder.id) ? 'Analyzing...' : 'Analyze'}
                                                        </Button>
                                                        
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                if (selectedFolder.baseOrdinance.file && selectedFolder.baseOrdinance.file.file_url) {
                                                                    window.open(selectedFolder.baseOrdinance.file.file_url, '_blank');
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
                                                    
                                                    <div className="text font-medium text-lg">{selectedFolder.baseOrdinance.ord_title}</div>
                                                    <div className="text-xs text-gray-600">ORD: {selectedFolder.baseOrdinance.ord_num} • {selectedFolder.baseOrdinance.ord_date_created}</div>
                                                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                                        {selectedFolder.baseOrdinance.ord_details || 'No details available'}
                                                    </div>
                                        

                                    </div>
                                </div>

                                {/* Amendments */}
                                {selectedFolder.amendments.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <h3 className="text-lg font-semibold text-gray-800">Amendments ({selectedFolder.amendments.length})</h3>
                                        </div>

                                        {/* Amendment Comparison Results */}
                                        {selectedFolder.amendmentComparisonResult && (
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
                                                            {selectedFolder.amendmentComparisonResult.summary}
                                                        </div>
                                                    </div>

                                                    {/* Key Differences */}
                                                    {selectedFolder.amendmentComparisonResult.keyDifferences && selectedFolder.amendmentComparisonResult.keyDifferences.length > 0 && (
                                                        <div className="bg-white rounded p-3 border border-green-100">
                                                            <div className="text-xs font-medium text-green-700 mb-2">Key Differences Between Amendments</div>
                                                            <ul className="space-y-1">
                                                                {selectedFolder.amendmentComparisonResult.keyDifferences.map((difference: string, index: number) => (
                                                                    <li key={index} className="flex items-start gap-2">
                                                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                                        <span className="text-xs text-gray-700">{difference}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Recommendations */}
                                                    {selectedFolder.amendmentComparisonResult.recommendations.length > 0 && (
                                                        <div className="bg-white rounded p-3 border border-green-100">
                                                            <div className="text-xs font-medium text-green-700 mb-2">Recommendations</div>
                                                            <ul className="space-y-1">
                                                                {selectedFolder.amendmentComparisonResult.recommendations.map((recommendation: string, index: number) => (
                                                                    <li key={index} className="flex items-start gap-2">
                                                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                                        <span className="text-xs text-gray-700">{recommendation}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Metadata */}
                                                    <div className="flex items-center gap-4 text-xs text-gray-600">
                                                        <span>Total Ordinances: {selectedFolder.amendmentComparisonResult.metadata?.ordinanceCount || 0}</span>
                                                        <span>Years: {selectedFolder.amendmentComparisonResult.metadata?.yearRange?.min || 0} - {selectedFolder.amendmentComparisonResult.metadata?.yearRange?.max || 0}</span>
                                                        <span>Confidence: {Math.round((selectedFolder.amendmentComparisonResult.confidence || 0) * 100)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedFolder.amendments.map((amendment, index) => (
                                            <div key={amendment.ord_num} className="bg-white rounded-lg border border-gray-200 p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className="text-sm font-semibold text-green-700">Amendment {index + 1}</span>
                                                    <Badge variant="outline" className="text-xs">Version {amendment.ord_ammend_ver || index + 1}</Badge>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                                                                        {/* Amendment Actions - Moved above title */}
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleOpenAIAnalysis(amendment)}
                                                            disabled={!aiService || individualAnalysisLoading === amendment.ord_num || folderAmendmentLoading === selectedFolder.id}
                                                            className="text-xs px-3 py-1 h-7"
                                                        >
                                                            {(individualAnalysisLoading === amendment.ord_num || folderAmendmentLoading === selectedFolder.id) ? (
                                                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                            ) : (
                                                                <Brain className="h-3 w-3 mr-1" />
                                                            )}
                                                            {(individualAnalysisLoading === amendment.ord_num || folderAmendmentLoading === selectedFolder.id) ? 'Analyzing...' : 'Analyze'}
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
                                    </div>
                                )}
                            </div>
                        )}
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
                                                            {selectedOrdinanceForAnalysis.aiAnalysisResult.keyDifferences.map((difference: string, index: number) => (
                                                                <li key={index} className="flex items-start gap-3">
                                                                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
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

            {/* Summary popup removed - summary now shown in AI analysis popup */}
        </div>
    );
}

export default OrdinancePage;

