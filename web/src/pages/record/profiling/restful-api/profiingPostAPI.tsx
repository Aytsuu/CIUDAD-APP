import api from "@/api/api"
import { formatDate } from "@/helpers/dateFormatter"
import { generateFamilyNo } from "@/helpers/generateFamilyNo";
import { generateResidentNo } from "@/helpers/generateResidentNo";
import { useCapitalize } from "@/helpers/useCapitalize";

// API REQUESTS ---------------------------------------------------------------------------------------------------------

export const personal = async (personalInfo: Record<string, string>) => {

    try {
        
        const res = await api.post('profiling/personal/', {
            per_id: await generateResidentNo(),
            per_lname: useCapitalize(personalInfo.per_lname),
            per_fname: useCapitalize(personalInfo.per_fname),
            per_mname: useCapitalize(personalInfo.per_mname) || null,
            per_suffix: useCapitalize(personalInfo.per_suffix) || null,
            per_dob: formatDate(personalInfo.per_dob),
            per_sex: useCapitalize(personalInfo.per_sex),
            per_status: useCapitalize(personalInfo.per_status),
            per_address: useCapitalize(personalInfo.per_address),
            per_edAttainment: useCapitalize(personalInfo.per_edAttainment) || null,
            per_religion: useCapitalize(personalInfo.per_religion),
            per_contact: useCapitalize(personalInfo.per_contact)
        })

        return res.data.per_id

    } catch (err) {
        console.log(err)
    }
}

export const registered = async (personalId: string) => {
    
    try{

        await api.post('profiling/registered/', {
            per: personalId
        })

    } catch (err) {
        console.log(err)
    }

}

export const mother = async (personalId: string) => {

    try {
        const res = await api.post('profiling/mother/', {
            per: personalId
        })

        return res.data.mother_id
    } catch (err) {
        console.log(err)
    }
}

export const father = async (personalId: string) => {

    try {

        const res = await api.post('profiling/father/', {
            per: personalId
        })

        return res.data.father_id

    } catch (err) {
        console.log(err)
    }
}

export const dependents = (dependentsInfo: Record<string, string>[], familyId: string) => {

    try{

        dependentsInfo.map((dependent) => { 
            
            console.log({
                per: dependent.id,
                fam: familyId,
            })

            api.post('profiling/dependent/', {
                per: dependent.id,
                fam: familyId,
            })

            familyComposition(familyId, dependent.id);
        })

    } catch (err) {
        console.log(err)
    }

}

export const family = async (demographicInfo: Record<string, string>, fatherId: string | null, motherId: string | null) => { 

    try{

        console.log({
            fam_id: await generateFamilyNo(demographicInfo.building),
            fam_indigenous: demographicInfo.indigenous,
            fam_date_registered: formatDate(new Date()),
            father: fatherId || null,
            mother: motherId || null
        })

        const res = await api.post('profiling/family/', {
            fam_id: await generateFamilyNo(demographicInfo.building),
            fam_indigenous: demographicInfo.indigenous,
            fam_date_registered: formatDate(new Date()),
            father: fatherId || null,
            mother: motherId || null
        })

        return res.data.fam_id

    } catch (err) {
        console.log(err)
    }
} 

export const familyComposition = (familyId: string, personalId: string) => {
    try {

        console.log({
            fam: familyId,
            per: personalId
        })

        api.post('profiling/family-composition/', {
            fam: familyId,
            per: personalId
        })

    } catch (err) {
        console.log(err)
    }
}

export const building = async (familyNo: string, demographicInfo: Record<string, string>) => {
    try {

        console.log({
            build_type: demographicInfo.building,
            hh: demographicInfo.householdNo,
            fam: familyNo
        })

        const res = await api.post('profiling/building/', {
            build_type: demographicInfo.building,
            hh: demographicInfo.householdNo,
            fam: familyNo
        })

        return res.data.build_id

    } catch (err) {
        console.log(err)
    }
}

export const household = async (householdInfo: Record<string, string>) => {

    try{

        const res = await api.post('profiling/household/', {
            hh_id: householdInfo.householdNo,
            hh_existing_no: householdInfo.existingHouseNo || null,
            hh_nhts: householdInfo.nhts,
            hh_province: 'Cebu',
            hh_city: 'Cebu City',
            hh_barangay: 'San Roque',
            hh_street: householdInfo.street,
            hh_date_registered: formatDate(new Date()),
            per: householdInfo.householdHead,
            sitio: householdInfo.sitio,
        })

        return res.data

    } catch (err) {
        console.log(err)
    }

}

// ----------------------------------------------------------------------------------------------------------------------------
