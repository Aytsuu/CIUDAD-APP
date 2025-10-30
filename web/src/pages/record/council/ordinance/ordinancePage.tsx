
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
import { FormComboCheckbox } from '@/components/ui/form/form-combo-checkbox';
import ViewOrdinance from "./viewOrdinance";

// Type for ordinances only
type OrdinanceItem = Ordinance;


function OrdinancePage() {
    const queryClient = useQueryClient();
    const [ordinanceItems, setOrdinanceItems] = useState<OrdinanceItem[]>([]);
    const [ordinanceFolders, setOrdinanceFolders] = useState<OrdinanceFolder[]>([]);
    const [filter, setFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12; // fixed page size
    const [_totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Debounced values for API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    
    // Use paginated query
    const { data: ordinancesData, isLoading: isOrdinancesLoading } = useOrdinancesPaginated(
        currentPage,
        pageSize,
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
                filtered = ordinances.filter((item: Ordinance) => 
                    Array.isArray(item.ord_category) ? item.ord_category.includes(filter) : item.ord_category === filter
                );
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
    
    // Add state:
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [activeOrdinance, setActiveOrdinance] = useState<OrdinanceFolder | null>(null);
    
    
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

    // Function to check if ordinance has been repealed
    const isOrdinanceRepealed = (folder: OrdinanceFolder) => {
        return folder.baseOrdinance.ord_repealed || 
               folder.amendments.some(amendment => amendment.ord_repealed && !amendment.ord_is_ammend);
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
        const transformFormData = (formValues: any, categories: string[]) => {
            return {
                ordinanceTitle: formValues.ordTitle,
                ordinanceDate: formValues.ordDate,
                ordinanceDetails: formValues.ordDetails,
                ordinanceCategory: categories, // *** now always an array ***
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
            
            const normalizedOrdCategories = Array.isArray(values.ordAreaOfFocus)
              ? values.ordAreaOfFocus.map((id: string) =>
                  ordinanceCategories.find(option => option.id.toLowerCase() === id.toLowerCase())?.id || id
                )
              : [];

            const amendmentData = {
                ...transformFormData(values, normalizedOrdCategories), // <-- pass full array
                ord_category: normalizedOrdCategories,
                ord_parent: selectedOrdinance,
                ord_is_ammend: true,
                ord_ammend_ver: existingAmendments + 1
            };
            addOrdinance({ values: amendmentData, mediaFiles }, { onError: handleOrdinanceError });
        } else if (creationMode === 'repeal') {
            // Find the original ordinance to get its category
            const normalizedOrdCategories = Array.isArray(values.ordAreaOfFocus) ? values.ordAreaOfFocus.map(
                (id: string) => (ordinanceCategories.find(option => option.id.toLowerCase() === id.toLowerCase())?.id || id)
            ) : [];
            const repealData = {
                ...transformFormData(values, normalizedOrdCategories), // <-- pass full array
                ord_category: normalizedOrdCategories,
                ord_repealed: true,
                ord_parent: selectedOrdinance,
                ord_is_ammend: false,
            };
            addOrdinance({ values: repealData, mediaFiles }, { onError: handleOrdinanceError });
        } else {
            const normalizedOrdCategories = Array.isArray(values.ordAreaOfFocus) ? values.ordAreaOfFocus.map(
                (id: string) => (ordinanceCategories.find(option => option.id.toLowerCase() === id.toLowerCase())?.id || id)
            ) : [];
            const newData = {
                ...transformFormData(values, normalizedOrdCategories), // <-- pass full array, NOT [0]
                ord_category: normalizedOrdCategories,
            };
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

    useEffect(() => {
      if ((creationMode === 'amend' || creationMode === 'repeal') && selectedExistingOrdinance && selectedExistingOrdinance !== 'new') {
        const ord = ordinanceItems.find(o => o.ord_num === selectedExistingOrdinance);
        if (ord) {
          let categories = Array.isArray(ord.ord_category) ? ord.ord_category : [ord.ord_category];
          categories = categories.map((cat: string) => (cat || '').toLowerCase());
          form.setValue('ordAreaOfFocus', categories, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
          (form as any).clearErrors('ordAreaOfFocus');
        }
      }
    }, [creationMode, selectedExistingOrdinance, ordinanceItems]);


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

    // Category color utility —matching resolutionPage.tsx:
    const getCategoryColor = (focus: string) => {
      switch ((focus || '').toLowerCase()) {
        case 'gad':
          return 'bg-purple-100 text-purple-800';
        case 'finance':
          return 'bg-orange-100 text-orange-800';
        case 'council':
          return 'bg-primary/10 text-primary';
        case 'waste':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

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
                        {filteredItems.map((folder) => {
                            const isRepealed = isOrdinanceRepealed(folder);
                            return (
                                <div
                                    key={folder.id}
                                    className="outline-none focus:ring-2 rounded-lg transition-shadow duration-200 cursor-pointer"
                                    tabIndex={0} // for accessibility
                                    onClick={() => {
                                        handleFolderView(folder);
                                    }}
                                >
                                    <CardLayout
                                        cardClassName={`border shadow-sm rounded-lg bg-white hover:shadow-md transition-shadow duration-200 ${isRepealed ? 'opacity-75' : ''}`}
                                        title={
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg text-white shadow-sm ${isRepealed ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <span className="block font-semibold text-base md:text-lg text-gray-900 line-clamp-2 max-h-[2.8em] break-words">{folder.baseOrdinance.ord_title}</span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-gray-500">{folder.baseOrdinance.ord_num}</span>
                                                            {isRepealed && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                                    REPEALED
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
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
                                                    {/* CATEGORY BADGES (Multi-category!) */}
                                                    <div className="flex flex-wrap gap-1">
                                                        {Array.isArray(folder.baseOrdinance.ord_category)
                                                            ? folder.baseOrdinance.ord_category.map((cat: string, i: number) => (
                                                                <span key={i} className={`text-xs font-bold px-2 py-0.5 rounded mr-1 mb-1 ${getCategoryColor(cat)}`}>{cat}</span>
                                                            ))
                                                            : (
                                                                <span className={`text-xs font-bold px-2 py-0.5 rounded mr-1 mb-1 ${getCategoryColor(folder.baseOrdinance.ord_category)}`}>{folder.baseOrdinance.ord_category}</span>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                        content={
                                            <div className="space-y-4">
                                                {/* Ordinance Details */}
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-semibold text-blue-700 text-sm">Details</span>
                                                    </div>
                                                    <div className="text-xs text-gray-700 leading-relaxed pl-4 border-l-2 border-blue-100 pt-1 line-clamp-2 max-w-[95%] break-words">
                                                        {folder.baseOrdinance.ord_details || <span className="text-gray-500 italic">No details available</span>}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center justify-between gap-2">
                                                    {/* Bottom-left: View More / View All */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); handleFolderView(folder); }}
                                                        className="h-7 px-2 text-xs hover:bg-blue-50"
                                                    >
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        {folder.totalOrdinances > 1 ? 'View All' : 'View More'}
                                                    </Button>

                                                    {/* Bottom-right: View file */}
                                                    <div className="flex items-center gap-2">
                                                         
                                                         <TooltipLayout
                                                             trigger={
                                                                 <Button
                                                                     variant="outline"
                                                                     size="sm"
                                                                     className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-300"
                                                                     onClick={(e) => { e.stopPropagation(); if (folder.baseOrdinance.file && folder.baseOrdinance.file.file_url) { window.open(folder.baseOrdinance.file.file_url, '_blank'); } else { showErrorToast('No file available to view'); } }}
                                                                 >
                                                                     <Eye size={12} className="text-green-600" />
                                                                 </Button>
                                                             }
                                                             content="View File"
                                                         />
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                        headerClassName="pb-3"
                                        contentClassName="pt-0"
                                    />
                                </div>
                            );
                        })}
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

                                {/* Area of Focus Field (replaces old manual checkboxes with advanced dropdown) */}
                                <FormComboCheckbox
                                  control={form.control}
                                  name="ordAreaOfFocus"
                                  label="Select Area of Focus"
                                  options={ordinanceCategories}
                                  readOnly={creationMode !== 'new'}
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
            <ViewOrdinance folder={selectedFolder} isOpen={folderViewOpen} onOpenChange={setFolderViewOpen} />

            {/* Details Dialog when card is clicked */}
            <DialogLayout
                isOpen={detailsDialogOpen && !!activeOrdinance}
                onOpenChange={setDetailsDialogOpen}
                className="max-w-2xl"
                title={activeOrdinance ? (
                    activeOrdinance.baseOrdinance.ord_title.length > 120
                      ? activeOrdinance.baseOrdinance.ord_title.slice(0, 117) + '...'
                      : activeOrdinance.baseOrdinance.ord_title
                ) : ''}
                description={null}
                mainContent={activeOrdinance && (
                    <div className="p-2 space-y-6">
                        {/* Full/multi-line title displayed inside dialog for best spacing */}
                        <div className="font-bold text-lg md:text-xl line-clamp-2 break-words max-w-full mb-1">
                            {activeOrdinance.baseOrdinance.ord_title}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">{getFolderStatus(activeOrdinance).text}</span>
                            {Array.isArray(activeOrdinance.baseOrdinance.ord_category) ? (
                                activeOrdinance.baseOrdinance.ord_category.map((cat, i) => (
                                    <span key={i} className={`text-xs font-bold px-2 py-0.5 rounded mr-1 mb-1 ${getCategoryColor(cat)}`}>{cat}</span>
                                ))
                            ) : (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded mr-1 mb-1 ${getCategoryColor(activeOrdinance.baseOrdinance.ord_category)}`}>{activeOrdinance.baseOrdinance.ord_category}</span>
                            )}
                            {activeOrdinance.baseOrdinance.ord_repealed && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">REPEALED</span>
                            )}
                            <span className="text-xs text-gray-500">{activeOrdinance.baseOrdinance.ord_num}</span>
                            <span className="text-xs text-gray-500">{activeOrdinance.baseOrdinance.ord_date_created}</span>
                        </div>
                        <div className="text-lg font-semibold text-darkBlue2">Ordinance Details</div>
                        <div className="text-gray-700 text-sm whitespace-pre-line bg-gray-50 p-3 rounded max-h-[240px] overflow-y-auto">
                            {activeOrdinance.baseOrdinance.ord_details || <span className="text-gray-400 italic">No details available</span>}
                        </div>
                        {activeOrdinance.baseOrdinance.file?.file_url && (
                            <a
                                href={activeOrdinance.baseOrdinance.file.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 underline mt-2 block"
                            >
                                View Ordinance File
                            </a>
                        )}
                        <div className="flex gap-2 mt-6 justify-end">
                            <Button onClick={() => setDetailsDialogOpen(false)} variant="outline">Close</Button>
                        </div>
                    </div>
                )}
            />
        </div>
    );
}

export default OrdinancePage;
