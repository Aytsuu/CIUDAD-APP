import React from 'react';
import { Button } from '@/components/ui/button';


interface DeleteConfirmationModalProps {
  isOpen: boolean;
  itemName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  itemName,
  onCancel,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-in fade-in duration-300">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-medium text-gray-800">{itemName}</span>? 
          This action cannot be undone.
        </p>
        
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" className="bg-red-600 hover:bg-red-700" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;