
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Plus, Search, Eye, FileText } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from '@/components/ui/input';
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import CardLayout from '@/components/ui/card/card-layout';
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { Ordinance, deleteOrdinance, OrdinanceFolder, groupOrdinancesIntoFolders, updateOrdinance } from './restful-api/OrdinanceGetAPI';
import { useOrdinancesPaginated } from './queries/OrdinanceFetchQueries';
import { useDebounce } from "@/hooks/use-debounce";
import { useQueryClient } from "@tanstack/react-query";
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form/form.tsx";
import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input.tsx';
import { FormInput } from '@/components/ui/form/form-input';
import { useForm } from "react-hook-form"
import { MediaUpload, MediaUploadType } from '@/components/ui/media-upload';
import { useInsertOrdinanceUpload } from './queries/OrdinanceUploadInsertQueries.tsx';
import { Badge } from '@/components/ui/badge';

// Type for ordinances only
type OrdinanceItem = Ordinance;


function OrdinancePage() {
    const queryClient = useQueryClient();
    const [ordinanceItems, setOrdinanceItems] = useState<OrdinanceItem[]>([]);
    const [ordinanceFolders, setOrdinanceFolders] = useState<OrdinanceFolder[]>([]);
    const [filter, setFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [_totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Debounced values for API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const debouncedPageSize = useDebounce(pageSize, 100);
    
    // Use paginated query
    const { data: ordinancesData, isLoading: isOrdinancesLoading } = useOrdinancesPaginated(
        currentPage,
        debouncedPageSize,
        debouncedSearchTerm
    );

    // Handle both paginated and non-paginated API responses
    const ordinances = Array.isArray(ordinancesData) ? ordinancesData : (ordinancesData?.results || []);
    const totalCount = Array.isArray(ordinancesData) ? ordinancesData.length : (ordinancesData?.count || 0);
    const totalPagesFromAPI = ordinancesData?.total_pages || 1;
    
    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);
    
    // Process ordinances when data changes
    useEffect(() => {
        if (Array.isArray(ordinances) && ordinances.length > 0) {
            // Apply filter
            let filtered = ordinances;
            if (filter !== "all" && filter !== "Template") {
                filtered = ordinances.filter((item: Ordinance) => item.ord_category === filter);
            }

            setOrdinanceItems(filtered);
            
            // Group ordinances into folders
            const folders = groupOrdinancesIntoFolders(filtered);
            setOrdinanceFolders(folders);
            
            setTotalPages(Math.ceil(folders.length / 10));
        }
    }, [ordinances, filter]);
    
    // Update loading state
    useEffect(() => {
        setLoading(isOrdinancesLoading);
    }, [isOrdinancesLoading]);
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
    
    // State for ordinance creation loading
    const [isCreatingOrdinance, setIsCreatingOrdinance] = useState(false);
    
    
    // State for folder view popup
    const [selectedFolder, setSelectedFolder] = useState<OrdinanceFolder | null>(null);
    const [folderViewOpen, setFolderViewOpen] = useState(false);
    
    
    const {mutate: addOrdinance} = useInsertOrdinanceUpload(() => {
        setUploadDialogOpen(false);
        
        // Set loading state to false
        setIsCreatingOrdinance(false);
        
        // Show success message based on creation mode
        if (creationMode === 'amend') {
            showSuccessToast('Amendment created successfully! It will appear in the same folder as the base ordinance.');
        } else if (creationMode === 'repeal') {
            showSuccessToast('Ordinance repealed successfully! The original ordinance has been marked as repealed.');
        } else {
            showSuccessToast('Ordinance created successfully!');
        }
        
        // Reset form and selected ordinance
        resetUploadForm();
        
        // Refresh data to show the new folder structure
        queryClient.invalidateQueries({ queryKey: ["ordinancesPaginated"] });
    });
    
    // Handle error case to reset loading state
    const handleOrdinanceError = () => {
        setIsCreatingOrdinance(false);
    };

    const form = useForm<any>({
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        defaultValues: {
            ordTitle: "",        
            ordDate: "",
            ordAreaOfFocus: [],
            ordDetails: "",
            ordinanceFile: "",
            ordRepealed: false,
            ordTag: "",
            ordDesc: ""
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

    // Removed useEffect - now using paginated query


    // Removed fetchAllItems - now using paginated query

    // Removed unused requestToggleRepealed handler

    const confirmToggleRepealed = async () => {
        if (!ordinanceToToggle) return;
        try {
            const newValue = !ordinanceToToggle.ord_repealed;
            await updateOrdinance(ordinanceToToggle.ord_num, { ord_repealed: newValue });
            showSuccessToast(newValue ? 'Ordinance marked as repealed' : 'Ordinance un-repealed');
            setRepealDialogOpen(false);
            setOrdinanceToToggle(null);
            queryClient.invalidateQueries({ queryKey: ["ordinancesPaginated"] });
        } catch (e) {
            console.error('Failed to toggle repeal:', e);
            showErrorToast('Failed to update ordinance repeal status');
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



    const confirmDelete = async () => {
        if (!itemToDelete) return;
        
        try {
            await deleteOrdinance(itemToDelete.ord_num);
            showSuccessToast('Ordinance deleted successfully');
            queryClient.invalidateQueries({ queryKey: ["ordinancesPaginated"] });
        } catch (error) {
            console.error('Error deleting ordinance:', error);
            showErrorToast('Failed to delete ordinance');
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
    //         showErrorToast('PDF not available for download');
    //     }
    // };

    const handleUploadSubmit = (values: any) => {
        
        // Clear previous errors before validation
        form.clearErrors();
        
        let hasErrors = false;
        
        // Manual validation with inline errors
        // Always required fields
        if (!values.ordTitle || values.ordTitle.trim() === '') {
            form.setError('ordTitle', { type: 'manual', message: 'Ordinance title is required' });
            hasErrors = true;
        }
        
        if (!values.ordDate || values.ordDate.trim() === '') {
            form.setError('ordDate', { type: 'manual', message: 'Date is required' });
            hasErrors = true;
        }
        
        if (!values.ordinanceFile || values.ordinanceFile.trim() === '' || values.ordinanceFile === 'no-image-url-fetched') {
            form.setError('ordinanceFile', { type: 'manual', message: 'Please upload the ordinance document' });
            hasErrors = true;
        }
        
        // Mode-specific validation for ordTag
        if (creationMode === 'amend' || creationMode === 'repeal') {
            const selectedOrdinance = values.ordTag || selectedExistingOrdinance;
            if (!selectedOrdinance || selectedOrdinance === 'new' || selectedOrdinance === '') {
                const errorMessage = creationMode === 'amend' ? 'Please select an ordinance to amend' : 'Please select an ordinance to repeal';
                form.setError('ordTag', { type: 'manual', message: errorMessage });
                hasErrors = true;
            }
        }
        
        // Always validate ordDetails and ordAreaOfFocus for all modes
        if (!values.ordDetails || values.ordDetails.trim() === '') {
            form.setError('ordDetails', { type: 'manual', message: 'Ordinance details are required' });
            hasErrors = true;
        }
        
        if (!values.ordAreaOfFocus || values.ordAreaOfFocus.length === 0) {
            form.setError('ordAreaOfFocus', { type: 'manual', message: 'At least one area of focus must be selected' });
            hasErrors = true;
        }
        
        // If there are validation errors, stop here
        if (hasErrors) {
            setIsCreatingOrdinance(false);
            return;
        }
        
        // Set loading state to true
        setIsCreatingOrdinance(true);
        
        // Check both form value and state value for selected ordinance
        const selectedOrdinance = values.ordTag || selectedExistingOrdinance;
        
        // Transform form data to API format
        const transformFormData = (formValues: any, category: string) => {
            return {
                ordinanceTitle: formValues.ordTitle,
                ordinanceDate: formValues.ordDate,
                ordinanceDetails: formValues.ordDetails,
                ordinanceCategory: category,
                ord_repealed: formValues.ordRepealed,
                ordTag: formValues.ordTag,
                ordDesc: formValues.ordDesc,
                ordAreaOfFocus: formValues.ordAreaOfFocus,
                ordinanceFile: formValues.ordinanceFile
            };
        };

        // Based on creation mode
        if (creationMode === 'amend') {
            // If new ordinance marked repealed, block amendment creation
            if (values.ordRepealed) {
                showErrorToast('A repealed ordinance cannot be created as an amendment.');
                setIsCreatingOrdinance(false);
                return;
            }

            // Also block if selected parent is repealed (client-side check based on loaded data)
            const parent = ordinanceItems.find(o => o.ord_num === selectedOrdinance);
            if (parent && parent.ord_repealed) {
                showErrorToast('Cannot amend a repealed ordinance.');
                setIsCreatingOrdinance(false);
                return;
            }
            // Count existing amendments for this parent
            const existingAmendments = ordinanceItems.filter(ord => 
                ord.ord_parent === selectedOrdinance || 
                ord.ord_num === selectedOrdinance
            ).length;
            
            const category = parent?.ord_category || (values.ordAreaOfFocus && values.ordAreaOfFocus.length > 0 ? values.ordAreaOfFocus[0] : "");
            const amendmentData = {
                ...transformFormData(values, category),
                ord_parent: selectedOrdinance,
                ord_is_ammend: true,
                ord_ammend_ver: existingAmendments + 1
            };
            addOrdinance({ values: amendmentData, mediaFiles }, { onError: handleOrdinanceError });
        } else if (creationMode === 'repeal') {
            // Find the original ordinance to get its category
            const originalOrdinance = ordinanceItems.find(o => o.ord_num === selectedOrdinance);
            const category = originalOrdinance?.ord_category || (values.ordAreaOfFocus && values.ordAreaOfFocus.length > 0 ? values.ordAreaOfFocus[0] : "");
            const repealData = {
                ...transformFormData(values, category),
                ord_repealed: true,
                // Link to the ordinance being repealed (optional business rule)
                ord_parent: selectedOrdinance,
                ord_is_ammend: false,
            };
            addOrdinance({ values: repealData, mediaFiles }, { onError: handleOrdinanceError });
        } else {
            const category = values.ordAreaOfFocus && values.ordAreaOfFocus.length > 0 ? values.ordAreaOfFocus[0] : "";
            const newData = transformFormData(values, category);
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


    const resetUploadForm = () => {
        form.reset({
            ordTitle: "",        
            ordDate: "",
            ordAreaOfFocus: [],
            ordDetails: "",
            ordinanceFile: "",
            ordRepealed: false,
            ordTag: "",
            ordDesc: ""
        });
        form.clearErrors();
        setMediaFiles([]);
        setActiveVideoId("");
        setSelectedExistingOrdinance("new");
        setCreationMode('new');
    };




    // Removed unused color functions for risk and compliance badges

    const filteredItems = ordinanceFolders.filter(folder => {
        // If no search term, show all items
        if (!searchTerm || searchTerm.trim() === '') {
            return true;
        }
        
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
                    <div className="flex gap-x-2 items-center">
                        <p className="text-xs sm:text-sm">Show</p>
                        <Input 
                            type="number" 
                            className="w-14 h-8" 
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                        />
                        <p className="text-xs sm:text-sm">Entries</p>
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
                            resetUploadForm();
                            form.clearErrors();
                            setCreationMode('new');
                            setSelectedExistingOrdinance('new');
                            setUploadDialogOpen(true);
                        }}
                    >
                        <Plus />Upload Ordinance
                    </Button>
                </div>
            </div>                    

            <div className="w-full mt-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No ordinances found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                        {filteredItems.map((folder) => (
                            <CardLayout
                                key={folder.id}
                                title={
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-lg">{folder.baseOrdinance.ord_title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-500">ORD: {folder.baseOrdinance.ord_num}</span>
                                                    {folder.baseOrdinance.ord_repealed && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            Repealed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
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
                                    </div>
                                }
                                description={
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge 
                                                variant="secondary" 
                                                className={`text-xs px-2 py-0.5 ${getFolderStatus(folder).bgColor} ${getFolderStatus(folder).color}`}
                                            >
                                                {getFolderStatus(folder).text}
                                            </Badge>
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
                                }
                                content={
                                    <div className="space-y-4">
                                        {/* Ordinance Details */}
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

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-end gap-2">

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
                                                                showErrorToast('No file available to view');
                                                            }
                                                        }}
                                                    >
                                                        <Eye size={12} className="text-green-600" />
                                                    </Button>
                                                }
                                                content="View File"
                                            />
                                        </div>
                                    </div>
                                }
                                cardClassName="border shadow-sm rounded-lg bg-white hover:shadow-md transition-shadow duration-200"
                                headerClassName="pb-3"
                                contentClassName="pt-0"
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                    Showing {totalCount > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-
                    {Math.min(currentPage * pageSize, totalCount)} of {totalCount} rows
                </p>

                <div className="w-full sm:w-auto flex justify-center">
                    <PaginationLayout 
                        currentPage={currentPage}
                        totalPages={totalPagesFromAPI}
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
                                        {(() => {
                                            const canTargetExisting = ordinanceOptions.length > 0;
                                            const handleSetMode = (mode: 'new' | 'amend' | 'repeal') => {
                                                if ((mode === 'amend' || mode === 'repeal') && !canTargetExisting) {
                                                    return; // prevent switching when no eligible ordinances
                                                }
                                                // Clear all form errors completely
                                                form.clearErrors();
                                                setCreationMode(mode);
                                                if (mode === 'new') {
                                                    setSelectedExistingOrdinance('new');
                                                    form.setValue('ordRepealed', false);
                                                    form.setValue('ordTag', '');
                                                } else if (mode === 'amend') {
                                                    form.setValue('ordRepealed', false);
                                                } else if (mode === 'repeal') {
                                                    form.setValue('ordRepealed', true);
                                                }
                                            };
                                            return (
                                                <>
                                                    <Button
                                                        type="button"
                                                        variant={creationMode === 'new' ? 'default' : 'outline'}
                                                        onClick={() => handleSetMode('new')}
                                                    >
                                                        New
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={creationMode === 'amend' ? 'default' : 'outline'}
                                                        disabled={!canTargetExisting}
                                                        onClick={() => handleSetMode('amend')}
                                                        title={!canTargetExisting ? 'No eligible ordinances to amend' : undefined}
                                                    >
                                                        Amend
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={creationMode === 'repeal' ? 'default' : 'outline'}
                                                        disabled={!canTargetExisting}
                                                        onClick={() => handleSetMode('repeal')}
                                                        title={!canTargetExisting ? 'No eligible ordinances to repeal' : undefined}
                                                    >
                                                        Repeal
                                                    </Button>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {(creationMode === 'amend' || creationMode === 'repeal') && ordinanceOptions.length > 0 && (
                                        <FormField
                                            control={form.control}
                                            name="ordTag"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <SelectLayout
                                                            className="w-full"
                                                            label={creationMode === 'amend' ? 'Select ordinance to amend' : 'Select ordinance to repeal'}
                                                            placeholder={creationMode === 'amend' ? 'Choose ordinance to amend' : 'Choose ordinance to repeal'}
                                                            options={ordinanceOptions}
                                                            value={field.value || ''}
                                                            onChange={(value) => {
                                                                field.onChange(value);
                                                                setSelectedExistingOrdinance(value || 'new');
                                                                // Clear any existing error when a value is selected
                                                                if (value && value !== 'new' && value !== '') {
                                                                    (form as any).clearErrors('ordTag');
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                    {(creationMode === 'amend' || creationMode === 'repeal') && ordinanceOptions.length === 0 && (
                                        <div className="text-xs text-red-600">
                                            There are no eligible ordinances to {creationMode === 'amend' ? 'amend' : 'repeal'}.
                                        </div>
                                    )}
                                </div>

                                {/* Title Field */}
                                <FormInput
                                    control={form.control}
                                    name="ordTitle"
                                    label="Ordinance Title"
                                />

                                {/* Date Field */}
                                <FormDateTimeInput
                                    control={form.control}
                                    name="ordDate"
                                    label="Date"
                                    type="date"
                                />

                                {/* Details Field */}
                                <FormTextArea
                                    control={form.control}
                                    name="ordDetails"
                                    label="Ordinance Details"
                                />

                                {/* Area of Focus Field */}
                                <FormField
                                    control={form.control}
                                    name="ordAreaOfFocus"
                                    render={({ field }) => {
                                        // For amend/repeal modes, get the original ordinance's category
                                        const originalCategory = (creationMode === 'amend' || creationMode === 'repeal') && selectedExistingOrdinance 
                                            ? ordinanceItems.find(o => o.ord_num === selectedExistingOrdinance)?.ord_category
                                            : null;
                                        
                                        // Set the form field value to the original category if it exists
                                        if (originalCategory && (!field.value || field.value.length === 0)) {
                                            field.onChange([originalCategory]);
                                        }
                                        
                                        return (
                                            <FormItem>
                                                <FormControl>
                                                    <SelectLayout
                                                        label="Select area of focus"
                                                        placeholder="Select area of focus"
                                                        options={ordinanceCategories}
                                                        value={originalCategory || (field.value && field.value.length > 0 ? field.value[0] : "")}
                                                        onChange={(value) => {
                                                            if (originalCategory) {
                                                                return; // Don't allow changes if using original category
                                                            }
                                                            field.onChange([value]);
                                                        }}
                                                    />
                                                </FormControl>
                                                {originalCategory && (
                                                    <p className="text-xs text-blue-600 mt-1">
                                                        Using the same category as the original ordinance: <strong>{originalCategory}</strong>
                                                    </p>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />

                               
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
                                                <Spinner size="sm" />
                                                <span className="ml-2">Creating...</span>
                                            </>
                                        ) : (
                                            'Upload'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
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
                                                            onClick={() => {
                                                                if (selectedFolder.baseOrdinance.file && selectedFolder.baseOrdinance.file.file_url) {
                                                                    window.open(selectedFolder.baseOrdinance.file.file_url, '_blank');
                                                                } else {
                                                                    showErrorToast('No file available to view');
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

                                {/* Amendments & Repeals separated */}
                                {selectedFolder.amendments.length > 0 && (() => {
                                    const amendmentItems = selectedFolder.amendments.filter(a => Boolean(a.ord_is_ammend));
                                    const repealItems = selectedFolder.amendments.filter(a => Boolean(a.ord_repealed) && !a.ord_is_ammend);
                                    return (
                                    <div className="space-y-6">
                                        {amendmentItems.length > 0 && (
                                            <>
                                                <div className="flex items-center justify-between border-b pb-2">
                                                    <h3 className="text-lg font-semibold text-gray-800">Amendments ({amendmentItems.length})</h3>
                                                </div>


                                        {amendmentItems.map((amendment, index) => (
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
                                                            onClick={() => {
                                                                if (amendment.file && amendment.file.file_url) {
                                                                    window.open(amendment.file.file_url, '_blank');
                                                                } else {
                                                                    showErrorToast('No file available to view');
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
                                                                    onClick={() => {
                                                                        if (repeal.file && repeal.file.file_url) {
                                                                            window.open(repeal.file.file_url, '_blank');
                                                                        } else {
                                                                            showErrorToast('No file available to view');
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
                        )}
                    </div>
                }
            />




        </div>
    );
}

export default OrdinancePage;
