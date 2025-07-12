import { FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import DialogLayout from '@/components/ui/dialog/dialog-layout';
import { useState } from 'react';
import BudgetPlanSuppDocForm from './supp-doc-form';

export default function BudgetPlanSuppDocs({ plan_id }: {
    plan_id: number;}
) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    return (
        <div className="w-full h-full flex flex-col gap-4">
            {/* Button positioned top right */}
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
                            plan_id = {plan_id}
                            onSuccess={() => setIsDialogOpen(false)}
                        />
                        
                    }
                    title="Add Image"
                    description="Upload budget plan supporting documents."
                    isOpen={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                />
            
            </div>    

            {/* White background content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
                <FolderOpen className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No Supporting Documents
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                    There are no supporting documents uploaded for this budget plan yet.
                </p>
            </div>
        </div>
    );
}