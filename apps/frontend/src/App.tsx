import FamilyPlanningForm from "./pages/familyplanning/view";

function App() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <FamilyPlanningForm data={{
        clientId: "",
        philhealthNo: "",
        nhts: {
          status: false,
          pantawidStatus: false
        },
        personalInfo: {
          lastName: "",
          givenName: "",
          middleInitial: "",
          dateOfBirth: "",
          age: 0,
          educationalAttainment: "",
          occupation: ""
        }
      }} />
    </div>
  );
}

export default App;