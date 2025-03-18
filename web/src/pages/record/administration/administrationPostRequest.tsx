import api from "@/api/api";

export const staff = async(personalId: string, positionId: string, ) => {
    try {
        console.log({
            staff_id: personalId,
            pos: positionId,
            manager: 1
        })

        const res = await api.post('administration/staffs/', {
            staff_id: personalId,
            pos: positionId,
            manager: 1
        })

        return res.data

    } catch (err) {
        console.log(err)
    }
}