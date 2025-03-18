import { formatDate } from "@/helpers/dateFormatter";
import api from "@/api/api";

export const generateFamilyNo = async (buildingType: string) => {
    const familyList: Record<string, string>[] = await getFamilyList();
    const nextVal = familyList.length + 1;
    let type: string;

    switch(buildingType){
        case 'owner': type = 'O'; break;
        case 'renter': type = 'R'; break;
        case 'other' : type = 'I'; break;
        default: type = '';
    }

    let date: any = formatDate(new Date());
    date = date.split('-');
    date = date.join('')

    const familyNo = date + '00' + String(nextVal) + '-' + type
    
    return familyNo

}

const getFamilyList = async () => {
    try {
        const res = await api.get('profiling/family/')
        return res.data

    } catch (err) {
        console.log(err)
    }
}
