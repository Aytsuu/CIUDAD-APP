import api from "@/api/api"
import formatDate from "@/helpers/dateFormatter"

// API REQUESTS ---------------------------------------------------------------------------------------------------------
    
const address = async (sitio: string, streetAddress: string) => {

    try{
        const res = await api.post('profiling/address/', {
            add_province: 'Cebu',
            add_city: 'Cebu City',
            add_barangay: 'San Roque',
            add_street: streetAddress,
            sitio: sitio
        })

        return res.data.add_id
    } catch (err) {
        console.log(err)
    } 
}

const personal = async (personalInfo: Record<string, string>) => {

    try {
        
        const res = await api.post('profiling/personal/', {
            per_lname: personalInfo.lastName,
            per_fname: personalInfo.firstName,
            per_mname: personalInfo.middleName,
            per_suffix: personalInfo.suffix,
            per_dob: formatDate(personalInfo.dateOfBirth),
            per_sex: personalInfo.sex,
            per_status: personalInfo.status,
            per_religion: personalInfo.religion,
            per_contact: personalInfo.contact
        })

        return res.data.per_id

    } catch (err) {
        console.log(err)
    }
}

const mother = async (motherInfo: Record<string, string>) => {

    try {
        const res = await api.post('profiling/mother/', {
            mother_lname: motherInfo.lastName,
            mother_fname: motherInfo.firstName,
            mother_mname: motherInfo.middleName,
            mother_suffix: motherInfo.suffix,
            mother_dob: formatDate(motherInfo.dateOfBirth),
            mother_status: motherInfo.status,
            mother_religion: motherInfo.religion,
            mother_ed_attainment: motherInfo.edAttainment,
            mother_contact: motherInfo.contact,
            mother_philhealth: motherInfo.philhealth,
            mother_vacstatus: motherInfo.vacStatus,
            mother_bloodtype: motherInfo.bloodType,
        })

        return res.data.mother_id
    } catch (err) {
        console.log(err)
    }
}

const father = async (fatherInfo: Record<string, string>) => {

    try {

        const res = await api.post('profiling/father/', {
            father_lname: fatherInfo.lastName,
            father_fname: fatherInfo.firstName,
            father_mname: fatherInfo.middleName,
            father_suffix: fatherInfo.suffix,
            father_dob: formatDate(fatherInfo.dateOfBirth),
            father_status: fatherInfo.status,
            father_religion: fatherInfo.religion,
            father_ed_attainment: fatherInfo.edAttainment,
            father_contact: fatherInfo.contact,
            father_philhealth: fatherInfo.philhealth,
            father_vacstatus: fatherInfo.vacStatus,
            father_bloodtype: fatherInfo.bloodType,
        })

        return res.data.father_id

    } catch (err) {
        console.log(err)
    }
}

const family = async (mother_id: string, father_id: string, family_id: string) => { 

    try{

        const res = await api.post('profiling/family/',{
            fam_id: family_id,
            fam_date_registered: formatDate(new Date()),
            father: father_id,
            mother: mother_id
        })

        return res.data.fam_id

    } catch (err) {
        console.log(err)
    }
}

const dependents = (dependentsInfo: Record<string, string>[], family_id: string) => {

    try{

        dependentsInfo.map((dependent) => {  
            api.post('profiling/dependent/', {
                dep_lname: dependent.lastName,
                dep_fname: dependent.firstName,
                dep_mname: dependent.middleName,
                dep_suffix: dependent.suffix,
                dep_dob: formatDate(dependent.dateOfBirth),
                dep_sex: dependent.sex,
                fam: family_id,
            })
        })

    } catch (err) {
        console.log(err)
    }

}

const familyComposition = (family_id: string, personal_id: string) => {

    try{

        api.post('profiling/family-composition/', {
            fam: family_id,
            per: personal_id
        })

    } catch (err) {
        console.log(err)
    }

}

const building = (householNo: string, family_id: string, building: string) => {
    
    try{

        api.post('profiling/building/', {
            build_type: building,
            hh: householNo,
            fam: family_id 
        })

    } catch (err) {
        console.log(err)
    }
}

// ----------------------------------------------------------------------------------------------------------------------------

export { address, personal, father, mother, family, dependents, building, familyComposition };