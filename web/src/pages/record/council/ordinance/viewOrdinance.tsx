import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button/button";
import { Eye } from 'lucide-react';
import { showErrorToast } from "@/components/ui/toast";
import { OrdinanceFolder } from './restful-api/OrdinanceGetAPI';

interface ViewOrdinanceProps {
    folder: OrdinanceFolder | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

function ViewOrdinance({ 
    folder, 
    isOpen, 
    onOpenChange, 
}: ViewOrdinanceProps) {

    if (!folder) return null;

    const amendmentItems = folder.amendments || [];

    return (
        <DialogLayout
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            className="max-w-4xl"
            title={`Ordinance Details - ${folder.baseOrdinance.ord_title}`}
            description={`Viewing ordinance ${folder.baseOrdinance.ord_num} and its related documents`}
            mainContent={
                <div className="max-h-[80vh] overflow-y-auto p-4">
                    <div className="space-y-6">
                        {/* Base Ordinance */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-semibold text-blue-700">Base Ordinance</span>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            if (folder.baseOrdinance.file && folder.baseOrdinance.file.file_url) {
                                                window.open(folder.baseOrdinance.file.file_url, '_blank');
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
                                
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-800">
                                        {folder.baseOrdinance.ord_title}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        ORD: {folder.baseOrdinance.ord_num} • {folder.baseOrdinance.ord_date_created}
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        {folder.baseOrdinance.ord_details || 'No details available'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Amendments */}
                        {amendmentItems.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center justify-between border-b pb-2 mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Amendments ({amendmentItems.length})</h3>
                                </div>

                                {amendmentItems.map((amendment, index) => (
                                    <div key={amendment.ord_num} className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-sm font-semibold text-green-700">Amendment {index + 1}</span>
                                        </div>
                                        
                                        <div className="space-y-3">
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
                                            
                                            <div className="space-y-2">
                                                <div className="text-sm font-medium text-gray-800">
                                                    {amendment.ord_title}
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    ORD: {amendment.ord_num} • {amendment.ord_date_created}
                                                </div>
                                                <div className="text-sm text-gray-700">
                                                    {amendment.ord_details || 'No details available'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            }
        />
    );
}

export default ViewOrdinance;