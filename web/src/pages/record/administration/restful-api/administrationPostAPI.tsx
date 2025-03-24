import api from "@/api/api";
import { formatDate } from "@/helpers/dateFormatter";

export const addStaff = async(personalId: string, positionId: string, ) => {

    try {

        const res = await api.post('administration/staff/', {
            staff_id: personalId,
            staff_assign_date: formatDate(new Date()),
            rp: personalId,
            pos: positionId,
            manager: "00001250323"
        })

        return res.data

    } catch (err) {
        console.log(err)
    }

}

// Add new position
export const addPosition = async (position: string) => {

    try {

        const res = await api.post("administration/position/", {
            pos_title: position
        })

        return res.data

    } catch (err) {
        console.error(err)
    }

}

export const assignFeature = async (selectedPosition: string, featureId: string) => {

    try {

        console.log({
            feat: featureId,
            pos: selectedPosition,
            assi_date: formatDate(new Date())
        })

        const res = await api.post(`administration/assignment/`, {
            feat: featureId,
            pos: selectedPosition,
            assi_date: formatDate(new Date())
        })
        return res.data

    } catch (err) {
        console.error(err)
    }

}

export const setPermissions = async (assignmentId: string) => {

    try {

        const res = await api.post('administration/permission/', {
            assi: assignmentId
        })

        return res.data

    } catch (err) {
        console.error(err)
    }

}