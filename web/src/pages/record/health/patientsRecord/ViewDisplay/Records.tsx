import { Tabs, TabsContent } from "@/components/ui/tabs";
import CardLayout from "@/components/ui/card/card-layout";
import { SyringeIcon, Pill, Baby } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { FaDog, FaFirstAid } from "react-icons/fa";
import { MdPregnantWoman } from "react-icons/md";
import { useGetChildren } from "../queries/fetch";

// Children List Skeleton
const ChildrenListSkeleton = () => (
  <div className="mt-4 ml-8 space-y-3">
    <Skeleton className="h-5 w-32 mb-2" />
    {[1, 2].map((item) => (
      <div key={item} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div>
              <Skeleton className="h-4 w-40 mb-1" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    ))}
  </div>
);

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
      mother_fname: child.parent_info?.mother?.fname|| "",
      mother_lname: child.parent_info?.mother?.lname || "",
      mother_mname: child.parent_info?.mother?.mname ||  "",
      mother_contact: child.parent_info?.mother?.contact || "",
      mother_occupation: childHealthInfo.mother_occupation || "",
      father_fname:child.parent_info?.father?.fname ||  "",
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

export default function Records({ vaccinationCount, medicineCount, firstAidCount, postpartumCount, medicalconCount, patientLinkData, childHealthCount, childHealthRecords, prenatalCount, famplanCount, animalbitesCount }: any) {
  // Use the hook to get children data
  const { data: childrenData, isLoading: childrenLoading } = useGetChildren(patientLinkData?.pat_id);

  console.log("Patient ID:", patientLinkData?.pat_id);
  console.log("Children Data:", childrenData);
  console.log("Children Loading:", childrenLoading);

  // Format children data
  const formattedChildren = childrenData ? formatChildrenData(childrenData) : [];

  const firstChildHealthRecord = childHealthRecords && childHealthRecords.length > 0 ? childHealthRecords[0] : null;

  // Check if all service counts are zero or undefined (excluding children)
  const hasNoRecords =
    (!vaccinationCount || vaccinationCount === 0) &&
    (!medicineCount || medicineCount === 0) &&
    (!firstAidCount || firstAidCount === 0) &&
    (!postpartumCount || postpartumCount === 0) &&
    (!medicalconCount || medicalconCount === 0) &&
    (!childHealthCount || childHealthCount === 0) &&
    (!prenatalCount || prenatalCount === 0) &&
    (!famplanCount || famplanCount === 0) &&
    (!animalbitesCount || animalbitesCount === 0) &&
    formattedChildren.length === 0;

  const services = [
    {
      count: vaccinationCount,
      title: "Vaccination",
      icon: <SyringeIcon className="w-5 h-5 text-blue-600" />,
      link: "/services/vaccination/records",
      borderColor: "border-sky-200",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      state: { params: { patientData: patientLinkData } }
    },
    {
      count: medicineCount,
      title: "Medicine",
      icon: <Pill className="w-5 h-5 text-purple-600" />,
      link: "/services/medicine/records",
      borderColor: "border-purple-200",
      bgColor: "bg-purple-200",
      textColor: "text-purple-600",
      state: { params: { patientData: patientLinkData } }
    },
    {
      count: firstAidCount,
      title: "First Aid",
      icon: <FaFirstAid className="w-5 h-5 text-red-600" />,
      link: "/services/firstaid/records",
      borderColor: "border-red-200",
      bgColor: "bg-red-200",
      textColor: "text-red-600",
      state: { params: { patientData: patientLinkData } }
    },
    {
      count: medicalconCount,
      title: "Medical Consultation",
      icon: <Pill className="w-5 h-5 text-green-600" />,
      link: "/services/medical-consultation/records",
      borderColor: "border-green-300",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      state: { params: { patientData: patientLinkData } }
    },
    {
      count: postpartumCount,
      title: "Postpartum Care",
      icon: <Baby className="w-5 h-5 text-pink-600" />,
      link: "/maternalindividualrecords",
      borderColor: "border-pink-200",
      bgColor: "bg-pink-200",
      textColor: "text-pink-600",
      state: { params: { patientData: patientLinkData } }
    },
    {
      count: famplanCount,
      title: "Family Planning",
      icon: <Baby className="w-5 h-5 text-yellow-600" />,
      link: "/fammilyplannifrouterari",
      borderColor: "border-yellow-200",
      bgColor: "bg-yellow-200",
      textColor: "text-yellow-600",
      state: { params: { patientData: patientLinkData } }
    },
    {
      count: animalbitesCount,
      title: "Animal Bites",
      icon: <FaDog className="w-5 h-5 text-yellow-600" />,
      link: "/animalbites",
      borderColor: "border-yellow-200",
      bgColor: "bg-yellow-200",
      textColor: "text-yellow-600",
      state: { params: { patientData: patientLinkData } }
    },
    // Child Health Record - for the patient's own child health record
    {
      count: childHealthCount,
      title: "Child Health Record",
      icon: <Baby className="w-5 h-5 text-pink-600" />,
      link: "/services/childhealthrecords/records",
      borderColor: "border-pink-200",
      bgColor: "bg-pink-100",
      textColor: "text-pink-600",
      state: { ChildHealthRecord: firstChildHealthRecord },
      disabled: !firstChildHealthRecord
    },
    {
      count: prenatalCount,
      title: "Prenatal Care",
      icon: <MdPregnantWoman className="w-5 h-5 text-red-600" />,
      link: "/maternalindividualrecords",
      borderColor: "border-red-200",
      bgColor: "bg-red-200",
      textColor: "text-red-600",
      state: { params: { patientData: patientLinkData } }
    }
  ];

  return (
    <Tabs defaultValue="medical">
      <TabsContent value="medical" className="mt-0">
        <CardLayout
          title="All Services Records"
          description="Patient's records for all services are listed below. Click on the 'View Details' button to see more information about each service."
          content={
            <div className="space-y-6">
              {hasNoRecords && !childrenLoading ? (
                <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">No Records Found</h3>
                  <p className="text-sm text-gray-500 mt-2">There are currently no records available for this patient. Please check back later or add new records.</p>
                </div>
              ) : (
                <>
                  {/* Regular Services */}
                  {services.map((service, index) => {
                    const shouldShowService = service.count > 0;

                    return (
                      shouldShowService && (
                        <div key={index}>
                          {childrenLoading ? (
                            <ChildrenListSkeleton />
                          ) : (
                            <>
                              <div className={`p-4 rounded-lg border ${service.borderColor}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${service.bgColor}`}>{service.icon}</div>
                                    <div>
                                      <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                                      <div className="flex items-center space-x-4 mt-1">
                                        <span className={`text-sm text-gray-600 ${service.bgColor} px-2 py-1 rounded-md`}>{service.count !== undefined ? service.count : "0"} Records</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Link to={service.link} state={service.state} className="transition-transform hover:scale-105">
                                    <Button variant="outline" size="sm" className={`h-10 px-6 bg-white ${service.borderColor} ${service.textColor} font-medium`} disabled={service.disabled}>
                                      View Details
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    );
                  })}

                  {/* Children Section - Always displayed if loading or has children */}
                  {(childrenLoading || formattedChildren.length > 0) && (
                    <div className="mt-6">
                      <div className={`p-4 rounded-lg border border-indigo-200`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg bg-indigo-100`}>
                              <Baby className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-4 mt-1"></div>
                            </div>
                          </div>
                        </div>
                        {/* Children List - Automatically displayed if there are children records */}
                        {formattedChildren.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <h4 className="text-md font-semibold text-gray-700 mb-3">Children List:</h4>
                            {formattedChildren.map((child: any, childIndex: any) => (
                              <div key={childIndex} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-lg bg-indigo-100">
                                      <Baby className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div>
                                      <h5 className="text-sm font-medium text-gray-900">
                                        {child.fname} {child.mname} {child.lname}
                                      </h5>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{child.age} years old</span>
                                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{child.sex}</span>
                                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">Birth Order: {child.birth_order}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Link to="/services/childhealthrecords/records" state={{ ChildHealthRecord: child }} className="transition-transform hover:scale-105">
                                    <Button variant="outline" size="sm" className="h-8 px-4 bg-white border-indigo-300 text-indigo-700 font-medium text-xs">
                                      View Child
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
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
