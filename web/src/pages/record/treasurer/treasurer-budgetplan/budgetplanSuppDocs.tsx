import { FolderOpen, Plus, Trash2, Calendar, FileText, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import DialogLayout from '@/components/ui/dialog/dialog-layout';
import { useState } from 'react';
import BudgetPlanSuppDocForm from './supp-doc-form';
import { useGetBudgetPlanSuppDoc } from './queries/budgetplanFetchQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTimestamp } from '@/helpers/timestampformatter';
import { useDeleteBudgetPlanFile } from './queries/budgetPlanDeleteQueries';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Badge } from '@/components/ui/badge';

export default function BudgetPlanSuppDocs({ plan_id }: { plan_id: number }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { data: suppDocs, isLoading, refetch } = useGetBudgetPlanSuppDoc(plan_id.toString());
    const { mutate: deleteSuppDoc } = useDeleteBudgetPlanFile();

    if (isLoading) {
        return (
            <div className="w-full space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-7 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-10 w-36" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="aspect-square rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 mt-[-3rem]">
            {/* Header Section */}
            <div className="flex items-center justify-end">
                <DialogLayout
                    trigger={
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Documents
                        </Button>
                    }
                    mainContent={
                        <BudgetPlanSuppDocForm
                            plan_id={plan_id}
                            onSuccess={() => {
                                setIsDialogOpen(false);
                                refetch();
                            }}
                        />
                    }
                    title="Add Supporting Documents"
                    description="Upload images for this budget plan"
                    isOpen={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                />
            </div>

            {/* Content Section */}
            {suppDocs && suppDocs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {suppDocs.map((doc) => (
                        <DocumentCard
                            key={doc.bpf_id}
                            doc={doc}
                            onDelete={() => deleteSuppDoc(doc.bpf_id)}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState />
            )}
        </div>
    );
}

function DocumentCard({
    doc,
    onDelete
}: {
    doc: {
        bpf_id: number;
        bpf_url: string;
        bpf_name: string;
        bpf_upload_date: string;
        bpf_description: string;
    };
    onDelete: () => void;
}) {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            {/* Image Container */}
            <div className="relative aspect-square bg-gray-50">
                {!imageError ? (
                    <img
                        src={doc.bpf_url || "/placeholder.svg"}
                        alt={doc.bpf_name}
                        className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white/90 hover:bg-white text-gray-700 shadow-sm"
                            asChild
                        >
                            <a
                                href={doc.bpf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center"
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                            </a>
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white/90 hover:bg-white text-gray-700 shadow-sm"
                            asChild
                        >
                            <a
                                href={doc.bpf_url}
                                download={doc.bpf_name}
                                className="flex items-center"
                            >
                                <Download className="h-4 w-4 mr-1" />
                                Save
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Delete Button */}
                <div className="absolute top-2 right-2">
                    <ConfirmationModal
                        title="Delete Document"
                        description="Are you sure you want to delete this document? This action cannot be undone."
                        actionLabel="Delete"
                        trigger={
                            <Button
                                size="sm"
                                variant="destructive"
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 bg-red-500/90 hover:bg-red-600"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        }
                        onClick={onDelete}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Title and Date */}
                <div>
                    <h3 className="font-medium text-gray-900 truncate text-sm" title={doc.bpf_name}>
                        {doc.bpf_name}
                    </h3>
                    <div className="flex items-center text-gray-500 text-xs mt-1">
                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>{formatTimestamp(doc.bpf_upload_date)}</span>
                    </div>
                </div>

                {/* Description */}
                {doc.bpf_description && (
                    <div className="space-y-2">
                        <Badge variant="secondary" className="text-xs">
                            Description
                        </Badge>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {doc.bpf_description}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-4">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <FolderOpen className="w-12 h-12 text-blue-500" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Documents Yet
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                    Upload supporting documents like receipts, invoices, or images to keep track of your budget plan details.
                </p>
                
                {/* Features */}
                <div className="grid grid-cols-1 gap-3 text-sm text-gray-500 mb-8">
                    <div className="flex items-center justify-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                        Support for images and documents
                    </div>
                    <div className="flex items-center justify-center">
                        <Eye className="h-4 w-4 mr-2 text-blue-500" />
                        Easy preview and download
                    </div>
                </div>
            </div>
        </div>
    );
}