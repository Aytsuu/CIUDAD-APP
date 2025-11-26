
import FPReportDetails from "../../famplanning-report/FPRecordDetails";

export default function Page1({onNext }: any) {
  return (
    <div className="min-h-[500px] flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Page 1 – Family Planning Report
        </h2>
    
      </div>

      {/* The whole FP table lives here */}
      <div className="flex-1 overflow-auto">
        <FPReportDetails />
      </div>

      <div className="flex justify-end mt-8 pt-6 border-t">
        <button
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          onClick={onNext}
        >
          Continue
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}