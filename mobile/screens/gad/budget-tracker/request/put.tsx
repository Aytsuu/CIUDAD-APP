import { api } from '@/api/api';
import { GADBudgetUpdatePayload, FileUploadPayload } from '../bt-types';

export const updateGADBudget = async (gbud_num: number, payload: GADBudgetUpdatePayload) => {
  try {
    const response = await api.patch(`/gad/gad-budget-tracker-entry/${gbud_num}/`, payload);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const updateGADBudgetFile = async (
  gbud_num: number,
  files: FileUploadPayload[],
  isDelete: boolean = false
) => {
  try {
    if (isDelete) {
      console.log('Sending delete request with files:', files); // Debug log
      const response = await api.post('/gad/gad-budget-files/', {
        gbud_num: gbud_num,
        filesToDelete: files.map(file => ({
          id: file.id,
          path: file.path,
        })),
      });
      console.log('Delete response:', response.data); // Debug log
      return response.data;
    } else {
      const validFiles = files.filter(file => 
        file.file && typeof file.file === 'string' && file.file.startsWith('data:')
      );
      if (validFiles.length === 0) {
        console.warn('No valid files to upload');
        return { success: true, message: 'No valid files to upload' };
      }
      console.log('Sending upload request with files:', validFiles); // Debug log
      const response = await api.post('/gad/gad-budget-files/', {
        gbud_num: gbud_num,
        files: validFiles.map(file => ({
          name: file.name || `file_${Date.now()}`,
          type: file.type || 'image/jpeg',
          file: file.file,
          path: file.path || `uploads/${file.name || `file_${Date.now()}`}`,
        })),
      });
      console.log('Upload response:', response.data); // Debug log
      return response.data;
    }
  } catch (err) {
    console.error('File operation error:', err); // Debug log
    throw new Error(isDelete ? 'Failed to delete files from server' : 'Failed to upload files to server');
  }
};