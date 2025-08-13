import { api } from "@/api/api";

const getLocalISOString = () => {
        const now = new Date();
        const tzOffset = now.getTimezoneOffset() * 60000; 
        const localISO = new Date(now.getTime() - tzOffset).toISOString().slice(0, -1);
        return localISO;
    };

export const addDecision = async (garb_id: string, decisionInfo: {reason: string}) => {
    try{
        console.log({
            dec_rejection_reason: decisionInfo.reason,
            dec_date: new Date().toISOString(),
            garb_id: garb_id
        })

        await api.put(`/waste/update-garbage-pickup-request/${garb_id}/`, {
            garb_req_status: "rejected"
        });

        const res = await api.post('/waste/pickup-request-decision/', {
            dec_rejection_reason: decisionInfo.reason,
            dec_date: getLocalISOString(), 
            garb_id: garb_id,
        });

        return res.data.dec_id

    } catch (err){
        console.error(err)
    }
}

export const addPickupAssignmentandCollectors = async (garb_id: string, assignmentInfo: {date: string; driver: string; time: string; truck: string; collectors: string[]}) => {
    try {
        console.log({
            pick_time: assignmentInfo.time,
            pick_date: assignmentInfo.date,
            truck_id: assignmentInfo.truck,
            wstp_id: assignmentInfo.driver,
            garb_id: garb_id,
            collectors: assignmentInfo.collectors
        });

        // 1. Update garbage pickup request status
        await api.put(`/waste/update-garbage-pickup-request/${garb_id}/`, {
            garb_req_status: "accepted"
        });

        // 2. Create the pickup assignment
        const res = await api.post('/waste/pickup-assignment/', {
            pick_time: assignmentInfo.time,
            pick_date: assignmentInfo.date,
            truck_id: assignmentInfo.truck,
            wstp_id: assignmentInfo.driver,
            garb_id: garb_id
        });

        const pick_id = res.data.pick_id;

        // 3. Add each collector to the assignment
        for (const collectorId of assignmentInfo.collectors) {
            await api.post('/waste/assignment-collector/', {
                pick_id: pick_id,
                wstp_id: collectorId
            });
        }

        // 4. Add decision record
        const res2 = await api.post('/waste/pickup-request-decision/', {
            dec_date: getLocalISOString(), 
            garb_id: garb_id,
        });


        return res.data.pick_id, res2.data; 

    } catch(err) {
        console.error(err);
        throw err;  
    }
}
