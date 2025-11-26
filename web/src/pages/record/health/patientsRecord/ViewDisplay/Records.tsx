//// filepath: /c:/CIUDAD-APP/web/src/pages/record/health/patientsRecord/ViewDisplay/Records.tsx
import { Tabs, TabsContent } from "@/components/ui/tabs";
import CardLayout from "@/components/ui/card/card-layout";
import { SyringeIcon, Pill, Baby } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router-dom";
import { FaDog, FaFirstAid } from "react-icons/fa";
import { MdPregnantWoman } from "react-icons/md";
import { useGetChildren } from "../queries/fetch";

// Helper function to calculate age
const calculateAge = (dob: any) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

// Format children data similar to your formatChildHealthData function
const formatChildrenData = (childrenData: any) => {
  if (!childrenData?.children) return [];
  return childrenData.children.map((child: any) => {
    const personalInfo = child.personal_info || {};
    const addressInfo = child.address || {};
    const childHealthInfo = child.child_health_info || {};

    // Calculate age from DOB
    const dob = personalInfo.per_dob || "";
    const age = dob ? calculateAge(dob).toString() : "";

    return {
      chrec_id: child.chrec_id || 0,
      pat_id: child.pat_id || "",
      fname: personalInfo.per_fname || "",
      lname: personalInfo.per_lname || "",
      mname: personalInfo.per_mname || "",
      sex: personalInfo.per_sex || "",
      age: age,
      dob: dob,
      householdno: child.households?.[0]?.hh_id || "",
      street: addressInfo.add_street || "",
      sitio: addressInfo.add_sitio || "",
      barangay: addressInfo.add_barangay || "",
      city: addressInfo.add_city || "",
      province: addressInfo.add_province || "",
      landmarks: addressInfo.add_landmarks || "",
      pat_type: "CHILD",
      address: addressInfo.full_address || "",
      mother_fname: child.parent_info?.mother?.fname || "",
      mother_lname: child.parent_info?.mother?.lname || "",
      mother_mname: child.parent_info?.mother?.mname || "",
      mother_contact: child.parent_info?.mother?.contact || "",
      mother_occupation: childHealthInfo.mother_occupation || "",
      father_fname: child.parent_info?.father?.fname || "",
      father_lname: child.parent_info?.father?.lname || "",
      father_mname: child.parent_info?.father?.mname || "",
      father_contact: child.parent_info?.father?.contact || "",
      father_occupation: childHealthInfo.father_occupation || "",
      family_no: childHealthInfo.family_no || "",
      birth_weight: 0,
      birth_height: 0,
      type_of_feeding: childHealthInfo.type_of_feeding || "Unknown",
      delivery_type: childHealthInfo.place_of_delivery_type || "",
      place_of_delivery_type: childHealthInfo.place_of_delivery_type || "",
      pod_location: childHealthInfo.pod_location || "",
      birth_order: childHealthInfo.birth_order || 0,
      tt_status: ""
    };
  });
};

export default function Records({
  vaccinationCount,
  medicineCount,
  firstAidCount,
  postpartumCount,
  medicalconCount,
  patientLinkData,
  childHealthCount,
  childHealthRecords,
  prenatalCount,
  famplanCount,
  animalbitesCount,
}: any) {
  // Use the hook to get children data
  const { data: childrenData } = useGetChildren(patientLinkData?.pat_id);
  const famplanCountValue = famplanCount?.fp_methods_count || 0;
  // Format children data
  const formattedChildren = childrenData ? formatChildrenData(childrenData) : [];
  const firstChildHealthRecord =
    childHealthRecords && childHealthRecords.length > 0 ? childHealthRecords[0] : null;

    
  // Check if all service counts are zero or undefined (including children)
  const hasNoRecords =
    (!vaccinationCount || vaccinationCount === 0) &&
    (!medicineCount || medicineCount === 0) &&
    (!firstAidCount || firstAidCount === 0) &&
    (!postpartumCount || postpartumCount === 0) &&
    (!medicalconCount || medicalconCount === 0) &&
    (!childHealthCount || childHealthCount === 0) &&
    (!prenatalCount || prenatalCount === 0) &&
    (!famplanCountValue || famplanCountValue === 0) &&
    (!animalbitesCount || animalbitesCount === 0) &&
    formattedChildren.length === 0;

  const services = [
    {
      count: vaccinationCount,
      title: "Vaccination",
      icon: <SyringeIcon className="w-5 h-5 text-gray-600" />,
      link: "/services/vaccination/records",
      state: { params: { patientData: patientLinkData } },
    },
    {
      count: medicineCount,
      title: "Medicine",
      icon: <Pill className="w-5 h-5 text-gray-600" />,
      link: "/services/medicine/records",
      state: { params: { patientData: patientLinkData } },
    },
    {
      count: firstAidCount,
      title: "First Aid",
      icon: <FaFirstAid className="w-5 h-5 text-gray-600" />,
      link: "/services/firstaid/records",
      state: { params: { patientData: patientLinkData } },
    },
    {
      count: medicalconCount,
      title: "Medical Consultation",
      icon: <Pill className="w-5 h-5 text-gray-600" />,
      link: "/services/medical-consultation/records/individual-records",
      state: { params: { patientData: patientLinkData } },
    },
    {
      count: postpartumCount,
      title: "Postpartum Care",
      icon: <Baby className="w-5 h-5 text-gray-600" />,
      link: "/maternalindividualrecords",
      state: { params: { patientData: patientLinkData } },
    },
    {
      count: famplanCountValue,
      title: "Family Planning",
      icon: <Baby className="w-5 h-5 text-gray-600" />,
      link: "/services/familyplanning/records",
      state: { 
        patientId: patientLinkData?.pat_id,
        patientData: patientLinkData 
      },
    },
    {
      count: animalbitesCount,
      title: "Animal Bites",
      icon: <FaDog className="w-5 h-5 text-gray-600" />,
      link: "/services/animalbites/records",
      state: { 
        patientId: patientLinkData?.pat_id,
        patientData: patientLinkData 
      },
    },
    // Child Health Record - for the patient's own child health record
    {
      count: childHealthCount,
      title: "Child Health Record",
      icon: <Baby className="w-5 h-5 text-gray-600" />,
      link: "/services/childhealthrecords/records",
      state: { ChildHealthRecord: firstChildHealthRecord },
      disabled: !firstChildHealthRecord,
    },
    {
      count: prenatalCount,
      title: "Prenatal Care",
      icon: <MdPregnantWoman className="w-5 h-5 text-gray-600" />,
      link: "/maternalindividualrecords",
      state: { params: { patientData: patientLinkData } },
    },
  ];

  return (
    <Tabs defaultValue="medical">
      <TabsContent value="medical" className="mt-0">
        <CardLayout
          title="All Services Records"
          description="Patient's records for all services are listed below. Click on the 'View Details' button to see more information about each service."
          content={
            <div>
              {hasNoRecords ? (
                <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">No Records Found</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    There are currently no records available for this patient. Please check back later or add new records.
                  </p>
                </div>
              ) : (
                <>
                  {/* Regular Services - Grid Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service, index) => {
                      return (
                        <div key={index} className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all flex flex-col h-full">
                          <div className="flex items-start space-x-3 mb-3">
                            <div className="p-2 rounded-lg bg-gray-100 flex-shrink-0">{service.icon}</div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-gray-900 truncate">{service.title}</h3>
                              <span className="text-sm text-gray-600 mt-1 block">
                                {service.count && service.count > 0 ? `${service.count} Records` : "No Records"}
                              </span>
                            </div>
                          </div>
                          <Link to={service.link} state={service.state} className="mt-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 px-4 text-sm w-full"
                              disabled={service.disabled || !service.count || service.count === 0}
                            >
                              View Details
                            </Button>
                          </Link>
                        </div>
                      );
                    })}
                  </div>

                  {/* Children Section - Display only if there are children */}
                  {formattedChildren.length > 0 && (
                    <div className="mt-6">
                      <div className="p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 rounded-lg bg-gray-100">
                            <Baby className="w-5 h-5 text-gray-600" />
                          </div>
                          <h4 className="text-base font-semibold text-gray-900">Children</h4>
                        </div>
                        <div className="space-y-3">
                          {formattedChildren.map((child: any, childIndex: any) => (
                            <div key={childIndex} className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 rounded-lg bg-gray-100">
                                    <Baby className="w-4 h-4 text-gray-600" />
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-900">
                                      {child.fname} {child.mname} {child.lname}
                                    </h5>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className="text-xs text-gray-600">
                                        {child.age} years old
                                      </span>
                                      <span className="text-xs text-gray-400">•</span>
                                      <span className="text-xs text-gray-600">
                                        {child.sex}
                                      </span>
                                      <span className="text-xs text-gray-400">•</span>
                                      <span className="text-xs text-gray-600">
                                        Birth Order: {child.birth_order}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Link to="/services/childhealthrecords/records" state={{ ChildHealthRecord: child }} className="transition-transform hover:scale-105">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-4 text-xs"
                                  >
                                    View Child
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
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