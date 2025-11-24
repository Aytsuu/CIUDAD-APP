import {api} from '@/api/api'

export const addBudgetPlanSuppDoc = async ( plan_id: number, files: { name: string | undefined; type: string | undefined; file: string | undefined }[], description: string
) => {
    try {
        const data = {
            plan_id,
            bpf_description: description,
            files: files.map(file => ({
                name: file.name,
                type: file.type,
                file: file.file  
            }))
        };

        const response = await api.post('treasurer/budget-plan-file/', data);

        return response.data;
    } catch (error: any) {
        console.error('Upload failed:', error.response?.data || error);
        throw error;
    }
};