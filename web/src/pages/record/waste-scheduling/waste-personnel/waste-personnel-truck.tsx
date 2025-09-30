import { useState, useEffect } from "react";
import { Truck, User, Trash2 } from "lucide-react";
import CardLayout from "@/components/ui/card/card-layout";
import { Spinner } from "@/components/ui/spinner";
import { useGetAllPersonnel, useGetTrucks } from "./queries/truckFetchQueries";
import { PersonnelCategory, PersonnelData } from "./waste-personnel-types";
import TruckManagement from "./waste-truck-form";
import { useLoading } from "@/context/LoadingContext"; 

const WastePersonnelDashboard = () => {
  const [activeTab, setActiveTab] = useState<PersonnelCategory>("Driver Loader");
  const { showLoading, hideLoading } = useLoading();
  const categoryDisplayNames: Record<PersonnelCategory, string> = {
    "Driver Loader": "Driver Loader",
    "Loader": "Waste Loader",
    "Trucks": "Trucks"
  };

  const {
    data: trucks = [],
    isLoading: isTrucksLoading,
    isError: isTrucksError,
  } = useGetTrucks();

  const {
    data: personnel = [],
    isLoading: isPersonnelLoading,
    isError: isPersonnelError,
  } = useGetAllPersonnel();

  const normalizePosition = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("Driver Loader") || lower.includes("driver loader"))
      return "Driver Loader";
    if (lower.includes("Loader") || lower.includes("loader"))
      return "Loader";
    return title;
  };

   useEffect(() => {
    if (isPersonnelLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isPersonnelLoading, showLoading, hideLoading]);

   useEffect(() => {
    if (isTrucksLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isTrucksLoading, showLoading, hideLoading]);

  const personnelData: PersonnelData = {
    "Driver Loader": personnel
      .filter(
        (p) =>
          normalizePosition(p.staff.position?.title || "") === "Driver Loader"
      )
      .map((p) => ({
        id: p.wstp_id.toString(),
        name: `${p.staff.profile.personal?.fname || ""} ${
          p.staff.profile.personal?.mname || ""
        } ${p.staff.profile.personal?.lname || ""} ${
          p.staff.profile.personal?.suffix || ""
        }`,
        position: "Driver Loader",
        contact: p.staff.profile.personal?.contact || "N/A",
      })),
    "Loader": personnel
      .filter(
        (p) =>
          normalizePosition(p.staff.position?.title || "") === "Loader"
      )
      .map((p) => ({
        id: p.wstp_id.toString(),
        name: `${p.staff.profile.personal?.fname || ""} ${
          p.staff.profile.personal?.mname || ""
        } ${p.staff.profile.personal?.lname || ""} ${
          p.staff.profile.personal?.suffix || ""
        }`,
        position: "Loader",
        contact: p.staff.profile.personal?.contact || "N/A",
      })),
  };

  const getCategoryIcon = (category: PersonnelCategory) => {
    switch (category) {
      case "Driver Loader":
        return (
          <div className="relative">
            <User className="h-5 w-5" />
            <Truck className="h-3 w-3 absolute -bottom-1 -right-1" />
          </div>
        );
      case "Loader":
        return <Trash2 className="h-5 w-5" />;
      case "Trucks":
        return <Truck className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: PersonnelCategory) => {
    switch (category) {
      case "Driver Loader":
        return "bg-yellow-100 text-yellow-600";
      case "Loader":
        return "bg-sky-100 text-sky-600";
      case "Trucks":
        return "bg-purple-100 text-purple-600";
    }
  };

  if (isTrucksError || isPersonnelError) {
    return <div className="text-red-500 p-4">Error loading data</div>;
  }

  return (
    <div className="w-full h-full p-4">
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Waste Personnel & Collection Vehicle
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          List of waste management personnel and garbage collection vehicles.
        </p>
      </div>
      <hr className="border-gray mb-6 sm:mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {(
          [
            "Driver Loader",
            "Loader",
            "Trucks",
          ] as PersonnelCategory[]
        ).map((category) => (
          <CardLayout
            key={category}
             content={
              isPersonnelLoading || (category === "Trucks" && isTrucksLoading) ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="md" />
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${getCategoryColor(category)}`}
                    >
                      {getCategoryIcon(category)}
                    </div>
                    <span className="text-2xl font-semibold">
                      {category === "Trucks"
                        ? trucks.filter((t) => !t.truck_is_archive).length
                        : personnelData[category].length}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium">{categoryDisplayNames[category]}</h3>
                    {(category === "Trucks" ||
                      personnelData[category].length > 0) && (
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          category === "Trucks"
                            ? "text-purple-600"
                            : "text-green-600"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            category === "Trucks"
                              ? "bg-purple-500"
                              : "bg-green-500"
                          }`}
                        ></span>
                        <span>
                          {category === "Trucks"
                            ? `Operational: ${
                                trucks.filter(
                                  (t) =>
                                    t.truck_status === "Operational" &&
                                    t.truck_is_archive === false
                                ).length
                              }`
                            : "Active"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            }
            cardClassName="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          />
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6">
          Personnel & Collection Vehicle Directory
        </h2>

        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center justify-center bg-white rounded-full p-1 shadow-md">
            {(
              [
                "Driver Loader",
                "Loader",
                "Trucks",
              ] as PersonnelCategory[]
            ).map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === category
                    ? "bg-primary text-white shadow"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {categoryDisplayNames[category]}
              </button>
            ))}
          </div>
        </div>

        {isPersonnelLoading && activeTab !== "Trucks" ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : activeTab === "Trucks" ? (
          <TruckManagement />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="space-y-2">
              {personnelData[activeTab].map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        getCategoryColor(activeTab)
                          .replace("text", "bg")
                          .split(" ")[0]
                      } ${
                        getCategoryColor(activeTab).includes("text")
                          ? getCategoryColor(activeTab).split(" ")[1]
                          : ""
                      }`}
                    >
                      <span className="text-sm font-bold text-white">
                        {person.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{person.name}</p>
                      <p className="text-sm text-gray-500">
                        {categoryDisplayNames[person.position as PersonnelCategory]}
                      </p>
                    </div>
                  </div>
                  {person.contact && (
                    <a
                      href={`tel:${person.contact}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {person.contact}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WastePersonnelDashboard;