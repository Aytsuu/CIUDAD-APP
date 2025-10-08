import { FolderOpen, FileText, Calendar } from 'lucide-react';
import { useGetSummonSuppDoc } from './council-mediation/queries/summonFetchQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTimestamp } from '@/helpers/timestampformatter';
import { useState } from 'react';

export default function SummonSuppDocs({ hs_id }: { hs_id: string }) {
    const { data: suppDocs, isLoading } = useGetSummonSuppDoc(hs_id);

    if (isLoading) {
        return (
            <div className="w-full space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-7 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
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
        <div className="mt-[-3rem] w-full">
            {/* Content Section */}
            {suppDocs && suppDocs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {suppDocs.map((doc) => (
                        <DocumentCard
                            key={doc.ssd_id}
                            doc={doc}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState />
            )}
        </div>
    );
}

function DocumentCard({ doc }: {
    doc: {
        ssd_id: number;
        ssd_url: string;
        ssd_name: string;
        ssd_upload_date: string;
    };
}) {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="space-y-6 max-h-[calc(90vh-100px)] overflow-y-auto h-full group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Image Container */}
            <div className="relative aspect-square bg-gray-50">
                {!imageError ? (
                    <img
                        src={doc.ssd_url || "/placeholder.svg"}
                        alt={doc.ssd_name}
                        className="object-cover w-full h-full"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full flex items-center justify-center bg-gray-100">
                        <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Title and Date */}
                <div>
                    <h3 className="font-medium text-gray-900 truncate text-sm" title={doc.ssd_name}>
                        {doc.ssd_name}
                    </h3>
                    <div className="flex items-center text-gray-500 text-xs mt-1">
                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>{formatTimestamp(doc.ssd_upload_date)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
                    <FolderOpen className="w-12 h-12 text-blue-500" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Documents Available
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                    There are no supporting documents for this summon.
                </p>
            </div>
        </div>
    );
}