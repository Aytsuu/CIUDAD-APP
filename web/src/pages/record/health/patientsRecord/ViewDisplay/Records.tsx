import { Tabs, TabsContent } from "@/components/ui/tabs";
import CardLayout from "@/components/ui/card/card-layout";
import { SyringeIcon, Pill, Baby, Heart } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a Skeleton component
import { FaDog, FaFirstAid } from "react-icons/fa";
import { MdPregnantWoman } from "react-icons/md";

// Skeleton component for loading state
const ChildHealthSkeleton = () => (
  <div className="p-4 rounded-lg border border-pink-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <div>
          <Skeleton className="h-5 w-40 mb-2" />
          <div className="flex items-center space-x-4 mt-1">
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

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
  childHistoryLoading,
  famplanCount,
  animalbitesCount,
}: any) {
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
    (!prenatalCount || prenatalCount === 0) &&
    (!famplanCount || famplanCount === 0) &&
    (!animalbitesCount || animalbitesCount === 0);

  const services = [
    {
      count: vaccinationCount,
      title: "Vaccination",
      icon: <SyringeIcon className="w-5 h-5 text-blue-600" />,
      link: "/services/vaccination/records",
      borderColor: "border-sky-200",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      count: medicineCount,
      title: "Medicine",
      icon: <Pill className="w-5 h-5 text-purple-600" />,
      link: "/services/medicine/records",
      borderColor: "border-purple-200",
      bgColor: "bg-purple-200",
      textColor: "text-purple-600",
    },
    {
      count: firstAidCount,
      title: "First Aid",
      icon: <FaFirstAid className="w-5 h-5 text-red-600" />,
      link: "/services/firstaid/records",
      borderColor: "border-red-200",
      bgColor: "bg-red-200",
      textColor: "text-red-600",
    },
    {
      count: medicalconCount,
      title: "Medical Consultation",
      icon: <Pill className="w-5 h-5 text-green-600" />,
      link: "/services/medical-consultation/records",
      borderColor: "border-green-300",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      count: postpartumCount,
      title: "Postpartum Care",
      icon: <Baby className="w-5 h-5 text-pink-600" />,
      link: "/maternalindividualrecords",
      borderColor: "border-pink-200",
      bgColor: "bg-pink-200",
      textColor: "text-pink-600",
    },
    {
      count: famplanCount,
      title: "Family Planning",
      icon: <Baby className="w-5 h-5 text-yellow-600" />,
      link: "/fammilyplannifrouterari",
      borderColor: "border-yellow-200",
      bgColor: "bg-yellow-200",
      textColor: "text-yellow-600",
    },
    {
      count: animalbitesCount,
      title: "Animal Bites",
      icon: <FaDog className="w-5 h-5 text-yellow-600" />,
      link: "/animalbites",
      borderColor: "border-yellow-200",
      bgColor: "bg-yellow-200",
      textColor: "text-yellow-600",
    },
    {
      count: childHealthCount,
      title: "Child Health Record",
      icon: <Baby className="w-5 h-5 text-pink-600" />,
      link: "/services/childhealthrecords/records",
      borderColor: "border-pink-200",
      bgColor: "bg-pink-100",
      textColor: "text-pink-600",
      disabled: !firstChildHealthRecord,
    },
    {
      count: prenatalCount,
      title: "Prenatal Care",
      icon: <MdPregnantWoman className="w-5 h-5 text-red-600" />,
      link: "/maternalindividualrecords",
      borderColor: "border-red-200",
      bgColor: "bg-red-200",
      textColor: "text-red-600",
    },
  ];

  return (
    <Tabs defaultValue="medical">
      <TabsContent value="medical" className="mt-0">
        <CardLayout
          title="All Services Records"
          description="Patient's records for all services are listed below. Click on the 'View Details' button to see more information about each service."
          content={
            <div className="space-y-6">
              {hasNoRecords ? (
                <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">No Records Found</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    There are currently no records available for this patient. Please check back later or add new records.
                  </p>
                </div>
              ) : (
                services.map(
                  (service, index) =>
                    service.count !== 0 && (
                      <div key={index} className={`p-4 rounded-lg border ${service.borderColor}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${service.bgColor}`}>{service.icon}</div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className={`text-sm text-gray-600 ${service.bgColor} px-2 py-1 rounded-md`}>
                                  {service.count !== undefined ? service.count : "0"} Records
                                </span>
                              </div>
                            </div>
                          </div>
                          <Link
                            to={service.link}
                            state={{ params: { patientData: patientLinkData } }}
                            className="transition-transform hover:scale-105"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-10 px-6 bg-white ${service.borderColor} ${service.textColor} font-medium`}
                              disabled={service.disabled}
                            >
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                )
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
