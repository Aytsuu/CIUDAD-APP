import { api } from "@/api/api";


export const updateAssignmentCollectorsAndSchedule = async (pick_id: string, acl_ids: string[], values: {
    driver: string;
    truck: string;
    date: string;
    time: string;
    collectors: string[];
  }
) => {
  try {
    // 1. First update the pickup assignment record
    const updateResponse = await api.put(`/waste/update-pickup-assignment/${pick_id}/`,
      {
        wstp_id: values.driver, 
        truck_id: values.truck,
        pick_date: values.date,
        pick_time: values.time,
      }
    );

    // 2. Delete existing assignment collectors
    await Promise.all(acl_ids.map(async (acl_id) => {
        await api.delete(`/waste/delete-assignment-collector/${acl_id}/`);
      })
    );

    // 3. Create new assignment collectors
    for (const collectorId of values.collectors) {
        await api.post('/waste/assignment-collector/', {
            pick_id: pick_id,
            wstp_id: collectorId,
        });
    }

    return updateResponse.data;
  } catch (err) {
    console.error(err);
    throw err; 
  }
};


