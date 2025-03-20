import React from 'react';
import { Button } from '@/components/ui/button/button';

interface Announcement {
    id: string;
    title: string;
}

interface DeleteConfirmationModalProps {
    announcement: Announcement;
    onCancel: () => void;
    onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ announcement, onCancel, onConfirm }) => {
    return (
        <div className="p-6">
            <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-medium">{announcement.title}</span> announcement? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700" onClick={onConfirm}>
                    Delete
                </Button>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
