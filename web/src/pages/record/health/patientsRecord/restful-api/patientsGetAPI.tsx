import { api2 } from "@/api/api"

export const getResident = async () => {
	 try {
		  const res = await api2.get("/patientrecords/residents-available/")
		  return res.data || [];
	 } catch (error) {
		  console.error("Error fetching residents:", error);
        
		if (typeof error === "object" && error !== null && "response" in error) {
			const err = error as { response: { status: number; data: any } };
			console.error("Response status:", err.response.status);
			// console.error("Response data:", err.response.data);
		}
	 }
}
