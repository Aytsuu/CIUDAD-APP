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
import Page8 from "./page8";
import Page9 from "./page9";
import Page10 from "./page10";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

export default function MultiPageFormFHIS() {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

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
    <LayoutWithBack title="FHSIS Monthly Report" description={`FHSIS Report for ${state?.monthName || ""}`}>
      {/* Page Indicator */}
      <div className="w-full mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(currentPage / totalPages) * 100}%` }} />
        </div>
        <div className="text-center">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      </div>

      {/* Page Content */}
      <Card className="p-6">
        {currentPage === 1 && <Page1 state={state} onNext={nextPage} />}
        {currentPage === 2 && <Page2 state={state} onBack={prevPage} onNext={nextPage} />}
        {currentPage === 3 && <Page3 state={state} onBack={prevPage} onNext={nextPage} />}
        {currentPage === 4 && <Page4 state={state} onBack={prevPage} onNext={nextPage} />}
        {currentPage === 5 && <Page5 state={state} onBack={prevPage} onNext={nextPage} />}
        {currentPage === 6 && <Page6 state={state} onBack={prevPage} onNext={nextPage} />}
        {currentPage === 7 && <Page7 state={state} onBack={prevPage} onNext={nextPage} />}
        {currentPage === 8 && <Page8 state={state} onBack={prevPage} onNext={nextPage} />}
        {currentPage === 9 && <Page9 state={state} onBack={prevPage} onNext={nextPage} />}
        {currentPage === 10 && <Page10 state={state} onBack={prevPage} />}
      </Card>
    </LayoutWithBack>
  );
}
