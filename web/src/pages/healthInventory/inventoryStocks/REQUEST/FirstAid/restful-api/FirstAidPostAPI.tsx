import {api2} from "@/api/api";

// POST request for firstaidinventorylist model
export const createFirstAidStock = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("inventory/firstaidstock-create/", data);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// POST request for firstaidtransaction model
export const addFirstAidTransaction = async ( data:Record<string,any>) => {
  try {
    const res = await api2.post("inventory/firstaidtransaction/",data);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};