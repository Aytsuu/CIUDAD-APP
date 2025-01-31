import api from "@/api/api"
import { formatDate } from "@/helpers/dateFormatter"

// API REQUESTS ---------------------------------------------------------------------------------------------------------

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
            history_ectopic: data.obstetricalHistory.ectopicPregnancyHistory

        })

        const res = await api.post('familyplanning/obstetrical/', {
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
        });


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
            hiv: data.sexuallyTransmittedInfections.hiv
        })

        const res = await api.post('familyplanning/risk_sti/', {
            abnormalDischarge: data.sexuallyTransmittedInfections.abnormalDischarge,
            dischargeFrom: data.sexuallyTransmittedInfections.dischargeFrom,
            sores: data.sexuallyTransmittedInfections.sores,
            pain: data.sexuallyTransmittedInfections.pain,
            history: data.sexuallyTransmittedInfections.history,
            hiv: data.sexuallyTransmittedInfections.hiv
        });

        return res.data.per_id
    }
    catch (err) {
        console.log(err)
    }

}





export { obstetrical, risks_sti };


