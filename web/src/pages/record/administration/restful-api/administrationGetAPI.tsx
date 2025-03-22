import api from "@/api/api";

// Fetch staffs
export const getStaffs = async () => {
    
    try {

        const res = await api.get('administration/staffs/')
        return res.data

    } catch (err) {
        console.error(err)
    }

}

// Fetch positions
export const getPositions = async () => {

    try { 

        const res = await api.get('administration/positions/')

        const formattedData = res.data.map((item: {pos_id: string, pos_title: string}) => ({
            id: String(item.pos_id),
            name: item.pos_title
        }))

        return formattedData

    } catch (err) {
        console.error(err)
    }
}