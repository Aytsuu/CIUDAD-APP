import api from "@/api/api"

// Delete a position
export const deletePosition = async (selectedPosition: string) => {

    try {
        const res = await api.delete(`administration/position/${selectedPosition}/`)
        return res
    } catch (err) {
        console.log(err)
    }
}

export const deleteAssignedFeature = async (selectedPosition: string, featureId: string) => {

    try {

        const res = await api.delete(`administration/assignment/${featureId}/${selectedPosition}/`)
        return res

    } catch (err) {
        console.error(err)
    }
}