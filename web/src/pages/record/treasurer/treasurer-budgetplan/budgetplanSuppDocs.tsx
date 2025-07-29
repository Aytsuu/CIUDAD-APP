import { FolderOpen, Plus, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import DialogLayout from '@/components/ui/dialog/dialog-layout';
import { useState } from 'react';
import BudgetPlanSuppDocForm from './supp-doc-form';
import { useGetBudgetPlanSuppDoc } from './queries/budgetplanFetchQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTimestamp } from '@/helpers/timestampformatter';
import { useDeleteBudgetPlanFile } from './queries/budgetPlanDeleteQueries';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

export default function BudgetPlanSuppDocs({ plan_id }: { plan_id: number }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { data: suppDocs, isLoading, refetch } = useGetBudgetPlanSuppDoc(plan_id.toString());
    const { mutate: deleteSuppDoc } = useDeleteBudgetPlanFile()

    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col gap-4">
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="flex justify-end">
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

            {suppDocs && suppDocs.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {suppDocs.map((doc) => (
                        <ImageCard 
                            key={doc.bpf_id} 
                            doc={doc} 
                            onDelete={() => deleteSuppDoc(doc.bpf_id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-lg shadow">
                    <FolderOpen className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No Supporting Documents
                    </h3>
                    <p className="text-gray-500 text-center max-w-md">
                        There are no supporting documents uploaded for this budget plan yet.
                    </p>
                </div>
            )}
        </div>
    );
}

function ImageCard({ 
    doc, 
    onDelete 
}: { 
    doc: { 
        bpf_id: number; 
        bpf_url: string; 
        bpf_name: string;
        bpf_upload_date: string;
    };
    onDelete: () => void;
}) {
    return (
        <div className="group relative aspect-square bg-gray-100 rounded-md overflow-hidden">
            <a 
                href={doc.bpf_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full h-full block"
            >
                <img 
                    src={doc.bpf_url} 
                    alt={doc.bpf_name}
                    className="object-cover w-full h-full hover:opacity-90 transition-opacity"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <div className="text-white text-xs truncate">
                        {doc.bpf_name}
                    </div>
                    <div className="flex items-center text-white/80 text-xs mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatTimestamp(doc.bpf_upload_date)}
                    </div>
                </div>
            </a>
            
            <ConfirmationModal
                title="Delete Document"
                description="Are you sure you want to delete this document? This action cannot be undone."
                actionLabel="Confirm"
                trigger={
                    <button
                        className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        aria-label="Delete document"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                }
                onClick={onDelete}
            />
        </div>
    );
}