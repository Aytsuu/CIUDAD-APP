import { useState } from "react";
import api from "@/api/api";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";


interface Option {
    id: string;
    name: string;
}

export const useDeleteParticular = () => {

    const [particulars, setParticulars] = useState<Option[]>([]);
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
    const [particularToDelete, setParticularToDelete] = useState<number | null>(null);



    const handleDeleteParticular = async (partId: number) => {
        try {
          const res = await api.delete(`treasurer/delete-income-particular/${partId}/`);
          
          if (res.status === 200 || res.status === 204) {
            setParticulars(prev => prev.filter(part => part.id !== String(partId)));
          }
        } catch (err) {
          console.error(err);
          throw err;
        }
    };
    
    const handleDeleteConfirmation = (partId: number) => {
        setParticularToDelete(partId);
        setIsDeleteConfirmationOpen(true);
    };
    

    const handleConfirmDelete = () => {
        if (particularToDelete !== null) {
            handleDeleteParticular(particularToDelete);
        }
        setIsDeleteConfirmationOpen(false);
    };
    

    const ConfirmationDialogs = () => (
        <ConfirmationDialog
            isOpen={isDeleteConfirmationOpen}
            onOpenChange={setIsDeleteConfirmationOpen}
            onConfirm={handleConfirmDelete}
            title="Delete Particular"
            description="Are you sure you want to delete this particular?"
        />
    );

    return{
        handleDeleteConfirmation,
        ConfirmationDialogs
    };
};