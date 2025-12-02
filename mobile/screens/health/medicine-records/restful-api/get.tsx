import { api2 } from "@/api/api"


export const getChildren = async (id:string) => {
	try{
		const res = await api2.get(`/patientrecords/parent-children/${id}/`);
		return res.data || [];
	}catch(error){
		console.error("Error fetching children:", error);
		throw error;
	}
}
	