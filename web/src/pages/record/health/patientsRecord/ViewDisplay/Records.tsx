import { Tabs, TabsContent } from "@/components/ui/tabs";
import CardLayout from "@/components/ui/card/card-layout";
import { SyringeIcon, Pill, Baby, Heart } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router-dom"; // Use react-router-dom's Link

// Define the ChildHealthRecord interface as it's used in InvChildHealthRecords

interface PatientLinkData {
  pat_id: string;
  pat_type: string;
  age: string;
  addressFull: string;
  address: {
    add_street: string;
    add_barangay: string;
    add_city?: string;
    add_province: string;
    add_sitio: string;
  };
  households: Array<{ hh_id: string }>;
  personal_info: {
    per_fname: string;
    per_mname: string;
    per_lname: string;
    per_dob: string;
    per_sex: string;
  };
}

interface MedicalHistoryTabProps {
  vaccinationCount: number | undefined;
  medicineCount: number | undefined;
  firstAidCount: number | undefined;
  postpartumCount: number | undefined;
  medicalconCount: number | undefined;
  patientLinkData: PatientLinkData;
  childHealthCount?: number | undefined;
  childHealthRecords: any[];
  prenatalCount: number | undefined;
}

export default function Records({
  vaccinationCount,
  medicineCount,
  firstAidCount,
  postpartumCount,
  medicalconCount,
  patientLinkData,
  childHealthCount,
  childHealthRecords, // This is the array of formatted records
  prenatalCount
}: MedicalHistoryTabProps) {
  // Determine if there's at least one child health record to pass
  const firstChildHealthRecord = childHealthRecords.length > 0 ? childHealthRecords[0] : null;

  // Check if all service counts are zero or undefined
  const hasNoRecords =
    (!vaccinationCount || vaccinationCount === 0) &&
    (!medicineCount || medicineCount === 0) &&
    (!firstAidCount || firstAidCount === 0) &&
    (!postpartumCount || postpartumCount === 0) &&
    (!medicalconCount || medicalconCount === 0) &&
    (!childHealthCount || childHealthCount === 0) &&
    (!prenatalCount || prenatalCount === 0);

  return (
    <Tabs defaultValue="medical">
      <TabsContent value="medical" className="mt-0">
        <CardLayout
          title="All Services Records "
          description="Patient's records for all services are listed below. Click on the 'View Details' button to see more information about each service."
          content={
            <div className="space-y-6">
              {hasNoRecords ? (
                <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">No Records Found</h3>
                  <p className="text-sm text-gray-500 mt-2">There are currently no records available for this patient. Please check back later or add new records.</p>
                  <div className="mt-4"></div>
                </div>
              ) : (
                <>
                  {vaccinationCount !== 0 && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-sky-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <SyringeIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Vaccination</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-600 bg-sky-100 px-2 py-1 rounded-md">{vaccinationCount !== undefined ? vaccinationCount : "0"} Records</span>
                              <span className="text-sm text-gray-500">Last updated: June 2, 2023</span>
                            </div>
                          </div>
                        </div>
                        <Link to="/invVaccinationRecord" state={{ params: { patientData: patientLinkData } }} className="transition-transform hover:scale-105">
                          <Button variant="outline" size="sm" className="h-10 px-6 bg-white border-sky-300 text-sky-800 font-medium">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                  {medicineCount !== 0 && (
                    <div className="p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg">
                            <Pill className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Medicine</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-600 bg-purple-200 px-2 py-1 rounded-md">{medicineCount !== undefined ? medicineCount : "0"} Records</span>
                              <span className="text-sm text-gray-500">Last updated: June 2, 2023</span>
                            </div>
                          </div>
                        </div>
                        <Link to="/IndivMedicineRecord" state={{ params: { patientData: patientLinkData } }}>
                          <Button variant="outline" size="sm" className="h-10 px-6 bg-white border-purple-300 text-purple-700 font-medium">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                  {firstAidCount !== 0 && (
                    <div className="p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg">
                            <Pill className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">First Aid</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-600 bg-purple-200 px-2 py-1 rounded-md">{firstAidCount !== undefined ? firstAidCount : "0"} Records</span>
                              <span className="text-sm text-gray-500">Last updated: June 2, 2023</span>
                            </div>
                          </div>
                        </div>
                        <Link to="/indiv-firstaid-records" state={{ params: { patientData: patientLinkData } }}>
                          <Button variant="outline" size="sm" className="h-10 px-6 bg-white border-purple-300 text-purple-700 font-medium">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                  {medicalconCount !== 0 && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Pill className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Medical Consultation</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-600 bg-green-200 px-2 py-1 rounded-md">{medicalconCount !== undefined ? medicalconCount : "0"} Records</span>
                              <span className="text-sm text-gray-500">Last updated: June 2, 2023</span>
                            </div>
                          </div>
                        </div>
                        <Link to="/invMedicalRecord" state={{ params: { patientData: patientLinkData } }}>
                          <Button variant="outline" size="sm" className="h-10 px-6 bg-white border-green-300 text-green-700 font-medium">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                  {postpartumCount !== 0 && (
                    <div className="p-4 rounded-lg border border-pink-200 bg-pink-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-pink-200">
                            <Baby className="w-5 h-5 text-pink-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Postpartum Care</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-600 bg-pink-200 px-2 py-1 rounded-md">{postpartumCount !== undefined ? postpartumCount : "0"} Records</span>
                              <span className="text-sm text-gray-500">Maternal Services</span>
                            </div>
                          </div>
                        </div>
                        <Link to="/maternalindividualrecords" state={{ params: { patientData: patientLinkData } }} className="transition-transform hover:scale-105">
                          <Button variant="outline" size="sm" className="h-10 px-6 bg-white border-pink-300 text-pink-700 font-medium">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                  {childHealthCount !== 0 && (
                    <div className="p-4 rounded-lg border border-pink-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg">
                            <Baby className="w-5 h-5 text-pink-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Child Health Record</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-600 bg-pink-100 px-2 py-1 rounded-md">{childHealthCount !== undefined ? childHealthCount : "0"} Records</span>
                            </div>
                          </div>
                        </div>
                        <Link
                          to="/child-health-records"
                          state={{ ChildHealthRecord: firstChildHealthRecord }} // Pass the single record
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 px-6 bg-white border-pink-300 text-pink-700 font-medium"
                            // disabled={!firstChildHealthRecord} // Disable if no record to pass
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                  {prenatalCount !== 0 && (
                    <div className="p-4 rounded-lg border border-red-200 bg-red-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-red-200">
                            <Heart className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Prenatal Care</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-600 bg-red-200 px-2 py-1 rounded-md">{prenatalCount !== undefined ? prenatalCount : "0"} Records</span>
                              <span className="text-sm text-gray-500">Maternal Services</span>
                            </div>
                          </div>
                        </div>
                        <Link to="/maternalindividualrecords" state={{ params: { patientData: patientLinkData } }} className="transition-transform hover:scale-105">
                          <Button variant="outline" size="sm" className="h-10 px-6 bg-white border-red-300 text-red-700 font-medium">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          }
          cardClassName="border shadow-sm rounded-md"
          headerClassName="pb-3 border-b"
          contentClassName="pt-4"
        />
      </TabsContent>
    </Tabs>
  );
}
