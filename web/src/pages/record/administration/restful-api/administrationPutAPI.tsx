import api from "@/api/api";

export const updatePermission = async (assignmentId: string, option: string, permission: boolean) => {

    try {

        const res = await api.put(`administration/permission/${assignmentId}/`, { [option]: permission })
        return res
        
    } catch (err) {
        console.error(err)
    }

}