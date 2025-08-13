import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Pencil, Trash, Eye, Plus, Search, Download, Loader2 } from 'lucide-react';
import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from '@/components/ui/input';
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/card';
import { toast } from 'sonner';
import { Ordinance, getAllOrdinances, deleteOrdinance } from './restful-api/OrdinanceGetAPI';
import { getAllTemplates, deleteTemplate, OrdinanceTemplate } from './restful-api/TemplateAPI';
import { Link, useNavigate } from 'react-router';

// Combined type for ordinances and templates
type OrdinanceItem = Ordinance | (OrdinanceTemplate & { type: 'template' });

// Type guard to check if item is a template
function isTemplate(item: OrdinanceItem): item is OrdinanceTemplate & { type: 'template' } {
    return 'type' in item && item.type === 'template';
}

function OrdinancePage() {
    const navigate = useNavigate();
    const [ordinanceItems, setOrdinanceItems] = useState<OrdinanceItem[]>([]);
    const [filter, setFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<OrdinanceItem | null>(null);

    const filterOptions = [
        { id: "all", name: "All" },
        { id: "Council", name: "Council" },
        { id: "Waste Committee", name: "Waste Committee" },
        { id: "GAD", name: "GAD" },
        { id: "Template", name: "Templates" }
    ];

    useEffect(() => {
        fetchAllItems();
    }, [filter, currentPage]);

    const fetchAllItems = async () => {
        try {
            setLoading(true);
            const [ordinances, templates] = await Promise.all([
                getAllOrdinances(),
                getAllTemplates()
            ]);

            // Combine ordinances and templates
            const combinedItems: OrdinanceItem[] = [
                ...ordinances,
                ...templates.map((template: OrdinanceTemplate) => ({ ...template, type: 'template' as const }))
            ];

            // Apply filter
            let filtered = combinedItems;
            if (filter === "Template") {
                filtered = combinedItems.filter(item => isTemplate(item));
            } else if (filter !== "all") {
                filtered = combinedItems.filter(item => 
                    !isTemplate(item) && item.ord_category === filter
                );
            }

            setOrdinanceItems(filtered);
            setTotalPages(Math.ceil(filtered.length / 10));
        } catch (error) {
            console.error('Error fetching items:', error);
            toast.error('Failed to fetch ordinances and templates');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (item: OrdinanceItem) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        
        const isTemplateItem = isTemplate(itemToDelete);
        const itemType = isTemplateItem ? 'template' : 'ordinance';
        
        try {
            if (isTemplateItem) {
                await deleteTemplate(itemToDelete.template_id);
                toast.success('Template deleted successfully');
            } else {
                await deleteOrdinance(itemToDelete.ord_num);
                toast.success('Ordinance deleted successfully');
            }
            fetchAllItems();
        } catch (error) {
            console.error(`Error deleting ${itemType}:`, error);
            toast.error(`Failed to delete ${itemType}`);
        } finally {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const handleDownloadPDF = (pdfUrl: string, title: string) => {
        if (pdfUrl) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `${title.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            toast.error('PDF not available for download');
        }
    };

    const filteredItems = ordinanceItems.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        if (isTemplate(item)) {
            return item.title.toLowerCase().includes(searchLower);
        } else {
            return item.ord_title.toLowerCase().includes(searchLower) || 
                   item.ord_num.toLowerCase().includes(searchLower);
        }
    });

    return (
        <div className="w-full h-full">
            <div className="flex-col items-center mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                    Ordinance Record
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Manage and view ordinances and templates
                </p>
            </div>
            <hr className="border-gray mb-6 sm:mb-10" />        

            <div className='w-full flex flex-col md:flex-row justify-between mb-4 gap-2'>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
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
                    <Link to="/template-maker"><Button className="w-full md:w-auto"><Plus />Create Ordinance</Button></Link>
                </div>
            </div>                    

            <div className="w-full">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#1273B8]" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No ordinances or templates found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => {
                            const isTemplateItem = isTemplate(item);
                            
                            return (
                                <Card key={isTemplateItem ? item.template_id : item.ord_num} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            {isTemplateItem ? item.title : item.ord_title}
                                        </CardTitle>
                                        <div className="text-sm text-gray-500">
                                            {isTemplateItem ? (
                                                <>
                                                    <div>Type: Template</div>
                                                    <div>Created: {new Date(item.created_at).toLocaleDateString()}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div>Ordinance No: {item.ord_num}</div>
                                                    <div>Category: {item.ord_category}</div>
                                                </>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="text-sm text-gray-600">
                                                {isTemplateItem 
                                                    ? `${item.template_body.substring(0, 100)}...`
                                                    : `${item.ord_details?.substring(0, 100) || 'No details available'}...`
                                                }
                                            </div>
                                            
                                            {isTemplateItem && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    {item.with_seal && (
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            With Seal
                                                        </span>
                                                    )}
                                                    {item.with_signature && (
                                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                                            With Signature
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                {isTemplateItem && item.pdf_url && (
                                                    <Button
                                                        onClick={() => handleDownloadPDF(item.pdf_url!, item.title)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Download className="h-3 w-3" />
                                                        Download PDF
                                                    </Button>
                                                )}
                                                
                                                {isTemplateItem && (
                                                    <Button
                                                        onClick={() => window.open(item.pdf_url, '_blank')}
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex items-center gap-1"
                                                        disabled={!item.pdf_url}
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        View PDF
                                                    </Button>
                                                )}

                                                {!isTemplateItem && (
                                                    <TooltipLayout
                                                        trigger={
                                                            <div className="flex items-center h-10">
                                                                <Link to={`/update-ord/${item.ord_num}`}>
                                                                    <Button className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer shadow-none h-full flex items-center">
                                                                        <Pencil size={16} />
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        }
                                                        content="Update"
                                                    />
                                                )}

                                                {isTemplateItem && (
                                                    <TooltipLayout
                                                        trigger={
                                                            <Button 
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex items-center gap-1"
                                                                onClick={() => navigate(`/template-maker?id=${item.template_id}`)}
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                                Update
                                                            </Button>
                                                        }
                                                        content="Update Template"
                                                    />
                                                )}

                                                <Button
                                                    onClick={() => handleDeleteItem(item)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
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
                description={`Are you sure you want to delete this ${itemToDelete && (isTemplate(itemToDelete) ? 'template' : 'ordinance') || 'item'}? This action cannot be undone.`}
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
        </div>
    );
}

export default OrdinancePage;
