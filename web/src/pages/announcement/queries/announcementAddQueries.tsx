import {useMutation, useQueryClient} from '@tanstack/react-query';
import { toast } from 'sonner'; 
import { CircleCheck } from 'lucide-react';
import { useNavigate } from "react-router";
import { postAnnouncement } from '../request-db/announcementPostRequest';

export type Announcement = {
  ann_id?: number;
  ann_title: string;
  ann_details: string;
  ann_created_at: Date;
  ann_start_at: Date;
  ann_end_at: Date;
  ann_type: string;
  // staff: number;
};

export const useAddAnnouncement = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (newAnnouncement: Announcement) => postAnnouncement(newAnnouncement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement added successfully', {
        icon: <CircleCheck className="h-4 w-4" />,
      });
      navigate('/announcement');
    },
    onError: (error) => {
      toast.error(`Error adding announcement: ${error.message}`);
    },
  });
};