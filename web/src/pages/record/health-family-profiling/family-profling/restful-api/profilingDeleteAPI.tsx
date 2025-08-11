import { api2 } from "@/api/api";

// Delete family member
export const deleteFamilyComposition = async (familyId: string, residentId: string) => {
  try {
    const res = await api2.delete(`health-profiling/family-composition/delete/${familyId}/${residentId}/`);
    return res;
  } catch (err) {
    console.error(err);
  }
}

// Environmental: delete endpoints
export const deleteWaterSupply = async (water_sup_id: string) => {
  const res = await api2.delete(`health-profiling/water-supply/${water_sup_id}/`);
  return res.data;
};

export const deleteSanitaryFacility = async (sf_id: string) => {
  const res = await api2.delete(`health-profiling/sanitary-facility/${sf_id}/`);
  return res.data;
};

export const deleteSolidWaste = async (swm_id: string) => {
  const res = await api2.delete(`health-profiling/solid-waste/${swm_id}/`);
  return res.data;
};

// ==================== DELETE SURVEY IDENTIFICATION ==================== (Status: Completed)
export const deleteSurveyIdentification = async (si_id: string) => {
  const res = await api2.delete(`health-profiling/survey-identification/${si_id}/delete/`);
  return res.data;
};