import { formatDate } from "@/helpers/dateFormatter";
import { getFamilies } from "@/pages/record/profiling/restful-api/profilingGetAPI";

export const generateFamilyNo = async (buildingType: string) => {
    const familyList: Record<string, string>[] = await getFamilies();
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