import api from "@/api/api";
import { formatDate } from "@/helpers/dateFormatter";

export const staff = async(personalId: string, positionId: string, ) => {
    try {

        console.log({
            staff_id: personalId,
            pos: positionId,
            manager: 1
        })

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