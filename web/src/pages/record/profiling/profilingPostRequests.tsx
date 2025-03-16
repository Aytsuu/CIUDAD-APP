import api from "@/api/api"
import { formatDate } from "@/helpers/dateFormatter"
import { generateFamilyNo } from "@/helpers/generateFamilyNo";

// API REQUESTS ---------------------------------------------------------------------------------------------------------

const personal = async (personalInfo: Record<string, string>) => {

    try {

        console.log({
            per_lname: personalInfo.lastName,
            per_fname: personalInfo.firstName,
            per_mname: personalInfo.middleName,
            per_suffix: personalInfo.suffix,
            per_dob: formatDate(personalInfo.dateOfBirth),
            per_sex: personalInfo.sex,
            per_status: personalInfo.status,
            per_address: personalInfo.address,
            per_edAttainment: personalInfo.edAttainment,
            per_religion: personalInfo.religion,
            per_contact: personalInfo.contact
        })
        
        const res = await api.post('profiling/personal/', {
            per_lname: personalInfo.lastName,
            per_fname: personalInfo.firstName,
            per_mname: personalInfo.middleName || null,
            per_suffix: personalInfo.suffix || null,
            per_dob: formatDate(personalInfo.dateOfBirth),
            per_sex: personalInfo.sex,
            per_status: personalInfo.status,
            per_address: personalInfo.address,
            per_edAttainment: personalInfo.edAttainment || null,
            per_religion: personalInfo.religion,
            per_contact: personalInfo.contact
        })

        return res.data.per_id

    } catch (err) {
        console.log(err)
    }
}

const mother = async (personalId: string) => {

    try {
        const res = await api.post('profiling/mother/', {
            per: personalId
        })

        return res.data.mother_id
    } catch (err) {
        console.log(err)
    }
}

const father = async (personalId: string) => {

    try {

        const res = await api.post('profiling/father/', {
            per: personalId
        })

        return res.data.father_id

    } catch (err) {
        console.log(err)
    }
}

const dependents = (dependentsInfo: Record<string, string>[], familyId: string) => {

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

const family = async (demographicInfo: Record<string, string>, fatherId: string, motherId: string) => { 

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

const familyComposition = (familyId: string, personalId: string) => {
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

const building = async (familyNo: string, demographicInfo: Record<string, string>) => {
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

const household = async (householdInfo: Record<string, string>) => {

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

export { personal, father, mother, family, dependents, building, familyComposition, household};