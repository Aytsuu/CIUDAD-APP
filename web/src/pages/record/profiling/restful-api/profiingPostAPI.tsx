import api from "@/api/api"
import { formatDate } from "@/helpers/dateFormatter"
import { generateFamilyNo } from "@/helpers/generateFamilyNo";
import { generateResidentNo } from "@/helpers/generateResidentNo";
import { capitalize } from "@/helpers/capitalize";
import { generateHouseholdNo } from "@/helpers/generateHouseholdNo";

// API REQUESTS ---------------------------------------------------------------------------------------------------------

export const personal = async (personalInfo: Record<string, string>) => {

    try {
        
        const res = await api.post('profiling/personal/', {
            per_lname: capitalize(personalInfo.per_lname),
            per_fname: capitalize(personalInfo.per_fname),
            per_mname: capitalize(personalInfo.per_mname) || null,
            per_suffix: capitalize(personalInfo.per_suffix) || null,
            per_dob: formatDate(personalInfo.per_dob),
            per_sex: capitalize(personalInfo.per_sex),
            per_status: capitalize(personalInfo.per_status),
            per_address: capitalize(personalInfo.per_address),
            per_edAttainment: capitalize(personalInfo.per_edAttainment) || null,
            per_religion: capitalize(personalInfo.per_religion),
            per_contact: capitalize(personalInfo.per_contact)
        })

        return res.data.per_id

    } catch (err) {
        console.error(err)
    }
}

export const residentProfile = async (personalId: string) => {
    
    try{

        console.log({
            rp_id: await generateResidentNo(),
            rp_date_registered: formatDate(new Date()),
            per_id: personalId,
            staff: "00001250323"
        })

        const res = await api.post('profiling/resident/', {
            rp_id: await generateResidentNo(),
            rp_date_registered: formatDate(new Date()),
            per_id: personalId,
            staff: "00001250323"
        })

        return res.data

    } catch (err) {
        console.error(err)
    }

}

export const mother = async (residentId: string) => {

    try {
        
        const res = await api.post('profiling/mother/', {
            rp: residentId
        })

        return res.data.mother_id
    } catch (err) {
        console.error(err)
    }
}

export const father = async (residentId: string) => {

    try {

        console.log({
            rp: residentId
        })

        const res = await api.post('profiling/father/', {
            rp: residentId
        })

        return res.data.father_id

    } catch (err) {
        console.error(err)
    }
}

export const dependents = (dependentsInfo: Record<string, string>[], familyId: string) => {

    try{

        dependentsInfo.map((dependent) => { 

            api.post('profiling/dependent/', {
                rp_id: dependent.id,
                fam: familyId,
            })

            familyComposition(familyId, dependent.id);
        })

    } catch (err) {
        console.error(err)
    }

}

export const family = async (demographicInfo: Record<string, string>, fatherId: string | null, motherId: string | null) => { 

    try{

        const res = await api.post('profiling/family/', {
            fam_id: await generateFamilyNo(demographicInfo.building),
            fam_indigenous: capitalize(demographicInfo.indigenous),
            fam_building: capitalize(demographicInfo.building),
            fam_date_registered: formatDate(new Date()),
            father_id: fatherId || null,
            mother_id: motherId || null,
            guard_id: null,
            hh_id: demographicInfo.householdNo || null,
            staff: "00001250323"
        })

        return res.data.fam_id

    } catch (err) {
        console.error(err)
    }
} 

export const familyComposition = (familyId: string, residentId: string) => {
    try {

        api.post('profiling/family-composition/', {
            fam: familyId,
            rp: residentId
        })

    } catch (err) {
        console.error(err)
    }
}

export const household = async (householdInfo: Record<string, string>) => {

    try{

        const res = await api.post('profiling/household/', {
            hh_id: await generateHouseholdNo(),
            hh_nhts: capitalize(householdInfo.nhts),
            hh_province: 'Cebu',
            hh_city: 'Cebu City',
            hh_barangay: 'San Roque',
            hh_street: capitalize(householdInfo.street),
            hh_date_registered: formatDate(new Date()),
            per_id: householdInfo.householdHead.split(" ")[0],
            sitio_id: householdInfo.sitio,
        })

        return res.data

    } catch (err) {
        console.error(err)
    }

}

// ----------------------------------------------------------------------------------------------------------------------------
