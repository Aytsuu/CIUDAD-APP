import api from "@/api/api"
import { formatDate } from "@/helpers/dateFormatter"

const obstetrical = async (data: Record<string, any>) => {
    try {
        console.log({
            g_pregnancy: data.obstetricalHistory.g_pregnancies,
            p_pregnancy: data.obstetricalHistory.p_pregnancies,
            fullterm: data.obstetricalHistory.fullTerm,
            premature: data.obstetricalHistory.premature,
            abortion: data.obstetricalHistory.abortion,
            living_children: data.obstetricalHistory.livingChildren,
            last_deliverydate: formatDate(data.obstetricalHistory.lastDeliveryDate),
            typeofLastDelivery: data.obstetricalHistory.typeOfLastDelivery,
            last_menstrual: formatDate(data.obstetricalHistory.lastMenstrualPeriod),
            prev_menstrual: formatDate(data.obstetricalHistory.previousMenstrualPeriod),
            menstrual_flow: data.obstetricalHistory.menstrualFlow,
            dysme: data.obstetricalHistory.dysmenorrhea,
            hydatidiform: data.obstetricalHistory.hydatidiformMole,
            history_ectopic: data.obstetricalHistory.ectopicPregnancyHistory,
        })

        const res = await api.post("familyplanning/obstetrical/", {
            g_pregnancies: data.obstetricalHistory.g_pregnancies,
            p_pregnancies: data.obstetricalHistory.p_pregnancies,
            full_term: data.obstetricalHistory.fullTerm,
            premature: data.obstetricalHistory.premature,
            abortion: data.obstetricalHistory.abortion,
            living_children: data.obstetricalHistory.livingChildren,

            last_delivery_date: data.obstetricalHistory.lastDeliveryDate || null,
            type_of_last_delivery: data.obstetricalHistory.typeOfLastDelivery || null,

            last_menstrual_period: data.obstetricalHistory.lastMenstrualPeriod,
            previous_menstrual_period: data.obstetricalHistory.previousMenstrualPeriod,

            menstrual_flow: data.obstetricalHistory.menstrualFlow,
            dysmenorrhea: data.obstetricalHistory.dysmenorrhea,
            hydatidiform_mole: data.obstetricalHistory.hydatidiformMole,
            ectopic_pregnancy_history: data.obstetricalHistory.ectopicPregnancyHistory,
        })

        return res.data.per_id
    } catch (err) {
        console.log(err)
    }
}

const risks_sti = async (data: Record<string, any>) => {
    try {
        console.log({
            abnormalDischarge: data.sexuallyTransmittedInfections.abnormalDischarge,
            dischargeFrom: data.sexuallyTransmittedInfections.dischargeFrom,
            sores: data.sexuallyTransmittedInfections.sores,
            pain: data.sexuallyTransmittedInfections.pain,
            history: data.sexuallyTransmittedInfections.history,
            hiv: data.sexuallyTransmittedInfections.hiv,
        })

        const res = await api.post("familyplanning/risk_sti/", {
            abnormalDischarge: data.sexuallyTransmittedInfections.abnormalDischarge,
            dischargeFrom: data.sexuallyTransmittedInfections.dischargeFrom,
            sores: data.sexuallyTransmittedInfections.sores,
            pain: data.sexuallyTransmittedInfections.pain,
            history: data.sexuallyTransmittedInfections.history,
            hiv: data.sexuallyTransmittedInfections.hiv,
        })

        return res.data.per_id
    } catch (err) {
        console.log(err)
    }
}

const risks_vaw = async (data: Record<string, any>) => {
    try {
        console.log({
            unpleasantRelationship: data.violenceAgainstWomen.unpleasantRelationship,
            partnerDisapproval: data.violenceAgainstWomen.partnerDisapproval,
            domesticViolence: data.violenceAgainstWomen.domesticViolence,
            referredTo: data.violenceAgainstWomen.referredTo,
            otherReferral: data.violenceAgainstWomen.otherReferral,
        })

        const res = await api.post("familyplanning/risk_vaw/", {
            unpleasantRelationship: data.violenceAgainstWomen.unpleasantRelationship,
            partnerDisapproval: data.violenceAgainstWomen.partnerDisapproval,
            domesticViolence: data.violenceAgainstWomen.domesticViolence,
            referredTo: data.violenceAgainstWomen.referredTo,
            otherReferral: data.violenceAgainstWomen.otherReferral,
        })

        return res.data.per_id
    } catch (err) {
        console.log(err)
    }
}

const physical_exam = async (data: Record<string, any>) => {
    try {
        // Get the method from the data
        const method = data.methodCurrentlyUsed

        // Create a base request object with the required fields
        const requestData = {
            method: method,
            weight: data.weight,
            height: data.height,
            bloodPressure: data.bloodPressure,
            pulseRate: data.pulseRate,

            // Common examination fields
            skinExamination: data.skinExamination,
            conjunctivaExamination: data.conjunctivaExamination,
            neckExamination: data.neckExamination,
            breastExamination: data.breastExamination,
            abdomenExamination: data.abdomenExamination,
            extremitiesExamination: data.extremitiesExamination,
        }

        // Only include IUD-specific fields if the method is IUD
        if (method === "IUD") {
            Object.assign(requestData, {
                pelvicExamination: data.pelvicExamination,
                cervicalConsistency: data.cervicalConsistency,
                cervicalTenderness: data.cervicalTenderness,
                cervicalAdnexalMassTenderness: data.cervicalAdnexalMassTenderness,
                uterinePosition: data.uterinePosition,
                uterineDepth: data.uterineDepth || null,
            })
        }

        console.log("Sending physical exam data:", requestData)

        const res = await api.post("familyplanning/physical_exam/", requestData)
        return res.data.per_id
    } catch (err) {
        const error = err as any
        console.error("Error submitting physical examination:", error.response?.data || error.message)
    }
}

const acknowledgement = async (data: Record<string, any>) => {
    try {
        console.log({
            selectedMethod: data.acknowledgement.selectedMethod,
            clientSignature: data.acknowledgement.clientSignature,
            clientSignatureDate: data.acknowledgement.clientSignatureDate,
            guardianName: data.acknowledgement.guardianName,
            guardianSignature: data.acknowledgement.guardianSignature,
            guardianSignatureDate: data.acknowledgement.guardianSignatureDate,
            
        })
        const res = await api.post("familyplanning/acknowledgement/", {
            selectedMethod: data.acknowledgement.selectedMethod,
            clientSignature: data.acknowledgement.clientSignature,
            clientSignatureDate: data.acknowledgement.clientSignatureDate,
            guardianName: data.acknowledgement.guardianName,
            guardianSignature: data.acknowledgement.guardianSignature,
            guardianSignatureDate: data.acknowledgement.guardianSignatureDate,
        })
        return res.data.per_id
    } catch (err) {
        console.log(err)
    }
}



export { obstetrical, risks_sti, risks_vaw, physical_exam, acknowledgement }

