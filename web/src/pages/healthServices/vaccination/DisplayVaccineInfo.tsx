"use client";
import { Button } from "@/components/ui/button/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card";
import {
  ChevronLeft,
  User,
  Syringe,
  Activity,
  MapPin,
  Calendar,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

// Define the VaccinationInterval type
type VaccinationInterval = {
  vacInt_id: string;
  dose_number: number;
  interval: number;
  time_unit: string;
};

export default function VaccinationView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData, Vaccination } = params || {};

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Vaccination Record
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            View vaccination details and patient information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-blue">
              <Syringe className="h-5 w-5 text-blue-600" />
              Vaccination Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Vaccine Type</p>
                <p className="font-medium">{Vaccination.vaccine_name}</p>
              </div>
             
              <div>
                <p className="text-sm text-gray-500">Date Vaccinated</p>
                <p className="font-medium">
                  {format(new Date(Vaccination.updated_at), "MMMM d, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dose</p>
                <p className="font-medium">
                  {Vaccination.vachist_doseNo} of{" "}
                  {Vaccination.vaccine_details.no_of_doses}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p
                  className={`font-medium inline-flex px-2 py-1 rounded-full text-sm ${
                    Vaccination.vachist_status === "completed"
                      ? "bg-green-100 text-green-800"
                      : Vaccination.vachist_status === "Partially Vaccinated"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {Vaccination.vachist_status}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-red-500">
              <Activity className="h-5 w-5 " />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Blood Pressure</p>
                <p className="font-medium">
                  {Vaccination.vital_signs.vital_bp_systolic}/
                  {Vaccination.vital_signs.vital_bp_diastolic} mmHg
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Temperature</p>
                <p className="font-medium">
                  {Vaccination.vital_signs.vital_temp} °C
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Respiratory Rate</p>
                <p className="font-medium">
                  {Vaccination.vital_signs.vital_RR}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Oxygen Saturation</p>
                <p className="font-medium">
                  {Vaccination.vital_signs.vital_o2}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-green-600">
            <User className="h-5 w-5 " />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Patient ID</p>
              <p className="font-medium">{patientData.pat_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">
                {`${patientData.lname}, ${patientData.fname} ${
                  patientData.mname || ""
                }`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">
                {patientData.dob
                  ? format(new Date(patientData.dob), "MMMM d, yyyy")
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p className="font-medium">{patientData.age || "N/A"} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sex</p>
              <p className="font-medium">
                {patientData.sex
                  ? patientData.sex.charAt(0).toUpperCase() +
                    patientData.sex.slice(1)
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Patient Type</p>
              <p className="font-medium">{patientData.pat_type || "N/A"}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
          <CardTitle className="text-lg flex items-center gap-2 text-green-600">
            <MapPin className="h-5 w-5 " />
            Patient Information
          </CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Household No.</p>
                <p className="font-medium">
                  {patientData.householdno || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Street</p>
                <p className="font-medium">{patientData.street || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sitio</p>
                <p className="font-medium">{patientData.sitio || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Barangay</p>
                <p className="font-medium">{patientData.barangay || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-medium">{patientData.city || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Province</p>
                <p className="font-medium">{patientData.province || "N/A"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-blue">
            <Calendar className="h-5 w-5 " />
            Vaccination Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Vaccination.intervals.map((interval: VaccinationInterval, index: number) => (
      <div key={interval.vacInt_id} className="bg-gray-50 p-4 rounded-md border border-gray-100">
        <p className="font-medium text-blue-700">
        {index === 0 ? "First" : index === 1 ? "Second" : "Booster"} Dose
        </p>
        <p className="text-sm text-gray-600">
        {Vaccination.vachist_doseNo === interval.dose_number.toString()
          ? `Completed on ${format(new Date(Vaccination.updated_at), "MMMM d, yyyy")}`
          : index === 0
            ? `Start at ${Vaccination.vaccine_details.age_group}`
            : `After ${interval.interval} ${interval.time_unit}${interval.interval > 1 ? 's' : ''}`}
        </p>
      </div>
    ))}
    </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button onClick={() => window.print()}>Print Record</Button>
      </div>
    </div>
  );
}
