// components/multi-page-form.tsx
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";

// Import your page components
import Page1 from "./page1";
import Page2 from "./page2";
import Page3 from "./page3";
import Page4 from "./page4";
import Page5 from "./page5";
import Page6 from "./page6";
import Page7 from "./page7";

import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

export default function MultiPageFormFHIS() {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 7;

  // Page descriptions for dropdown and display
  const pageDescriptions = [
    "Family Planning Report",
    "Prenatal Care Services and Postpartum and Newborn Care Section",
    "Prenatal Care Services and Postpartum and Newborn Care Section",
    "Immunization",
    "Child Health and Nutrition Services",
    "Deworming Statistics",
    "Morbidity Report"
  ];

  // Get the state from location
  const state = location.state as {
    month: string;
    monthName: string;
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <LayoutWithBack
      title="FHSIS Monthly Report"
      description={`FHSIS Report for ${state?.monthName || ""} — Page ${currentPage}: ${pageDescriptions[currentPage - 1]}`}
    >
      {/* Page Indicator & Dropdown */}
      <div className="w-full mb-6">
      
        <div className="flex flex-col sm:flex-row  justify-start gap-2">
            <select
            className="ml-2 px-2 py-1 rounded border border-gray-300 text-sm bg-white shadow"
            value={currentPage}
            onChange={e => setCurrentPage(Number(e.target.value))}
            style={{ minWidth: 220 }}
          >
            {pageDescriptions.map((desc, idx) => (
              <option key={idx + 1} value={idx + 1}>{`Page ${idx + 1}: ${desc}`}</option>
            ))}
          </select>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
        
        </div>
      </div>

      {/* Page Content with styled header */}
      <Card className="p-6">
        <h2 className="text-xl font-bold  mb-4 t">
          {`Page ${currentPage}: ${pageDescriptions[currentPage - 1]}`}
        </h2>
        {currentPage === 1 && <Page1 onNext={nextPage} />}
        {currentPage === 2 && <Page2 state={state} onBack={prevPage} onNext={nextPage} />}
        {currentPage === 3 && <Page3 state={state} onBack={prevPage} onNext={nextPage} />}
        {currentPage === 4 && <Page4 state={state} onBack={prevPage} onNext={nextPage} />}
        {currentPage === 5 && <Page5 state={state} onBack={prevPage} onNext={nextPage} />}
        {currentPage === 6 && <Page6 state={state} onBack={prevPage} onNext={nextPage} />}
        {currentPage === 7 && <Page7 state={state} onBack={prevPage} />}
      </Card>
    </LayoutWithBack>
  );
}
