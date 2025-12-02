export const doctors = [
    { id: "1", name: "Kimmy Mo Ma Chung" },
    { id: "2", name: "Chi Chung" }
  ];
  
  export const civilStatusOptions = [
    { id: "SINGLE", name: "Single" },
    { id: "MARRIED", name: "Married" },
    { id: "WIDOWED", name: "Widowed" },
    { id: "SEPARATED", name: "Separated" },
    { id: "DIVORCED", name: "Divorced" }
  ];
  
export const ttStatusOptions = [
    { id: "TT1", name: "TT1" },
    { id: "TT2", name: "TT2" },
    { id: "TT3", name: "TT3" },
    { id: "TT4", name: "TT4" },
    { id: "TT5", name: "TT5" }
  ];
  
export const contraceptiveOptions = [
    { id: "pills", name: "Birth Control Pills" },
    { id: "condom", name: "Condom" },
    { id: "iud", name: "IUD" },
    { id: "injection", name: "Injectable" },
    { id: "implant", name: "Implant" },
    { id: "none", name: "None" }
  ];
  

export const TabButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button" // Add type="button" to prevent form submission
      onClick={onClick}
      className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${active ? "border-blue-600 text-blue-600 bg-blue-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
    >
      {children}
    </button>
);
  