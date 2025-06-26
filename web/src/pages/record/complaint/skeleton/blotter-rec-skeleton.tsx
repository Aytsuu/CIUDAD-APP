import { Search } from "lucide-react"

export function BlotterRecordSkeleton() {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col justify-center mb-6">
        <div className="h-7 w-48 bg-sky-200 rounded-md animate-pulse mb-3"></div>
        <div className="h-4 w-64 bg-sky-100 rounded-md animate-pulse"></div>
      </div>

      <hr className="border-slate-100 mb-6" />

      {/* Search and filters - Responsive layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-300" size={18} />
          <div className="h-10 w-full bg-sky-100 rounded-lg animate-[pulse_2s_ease-in-out_infinite] pl-10"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-sky-100 rounded-lg animate-[pulse_2.2s_ease-in-out_infinite]"></div>
          <div className="h-10 w-28 bg-sky-200 rounded-lg animate-[pulse_1.8s_ease-in-out_infinite]"></div>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full flex flex-col rounded-xl overflow-hidden border border-slate-100 shadow-sm">
        {/* Table Controls */}
        <div className="w-full bg-white flex justify-between p-3 border-b border-slate-100">
          <div className="flex gap-x-3 items-center">
            <div className="h-4 w-16 bg-sky-100 rounded-md animate-[pulse_2s_ease-in-out_infinite]"></div>
            <div className="w-20 h-8 bg-sky-100 rounded-md animate-[pulse_1.7s_ease-in-out_infinite]"></div>
          </div>
          <div className="h-8 w-8 bg-sky-100 rounded-md animate-[pulse_2.3s_ease-in-out_infinite]"></div>
        </div>

        <div className="bg-white">
          {/* Table Header */}
          <div className="border-b border-slate-100 bg-white p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {["w-20", "w-32", "w-40", "w-24", "w-28"].map((width, i) => (
                <div
                  key={i}
                  className={`h-5 ${width} bg-sky-200 rounded-md animate-[pulse_${1.8 + i * 0.1}s_ease-in-out_infinite] ${i > 2 ? "hidden md:block" : i > 0 ? "hidden sm:block" : ""}`}
                ></div>
              ))}
            </div>
          </div>

          {/* Table Rows */}
          {[...Array(5)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 py-4 px-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
              style={{ animationDelay: `${rowIndex * 0.1}s` }}
            >
              {[
                { width: "w-16", mobileHide: false },
                { width: "w-28", mobileHide: true },
                { width: "w-40", mobileHide: true },
                { width: "w-24", mobileHide: true },
                { width: "w-20", mobileHide: true },
              ].map((col, colIndex) => (
                <div
                  key={colIndex}
                  className={`${col.mobileHide ? (colIndex > 2 ? "hidden md:block" : "hidden sm:block") : ""}`}
                >
                  <div
                    className={`h-4 ${col.width} bg-sky-100 rounded-md animate-[pulse_${2 + colIndex * 0.15}s_ease-in-out_infinite]`}
                    style={{ animationDelay: `${colIndex * 0.05}s` }}
                  ></div>
                  {colIndex === 0 && (
                    <div className="h-3 w-24 bg-sky-100 rounded-md mt-2 animate-[pulse_2.2s_ease-in-out_infinite] sm:hidden"></div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-5 gap-4 sm:gap-0">
        <div className="h-4 w-36 bg-sky-100 rounded-md animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-9 w-9 bg-sky-100 rounded-md animate-[pulse_2s_ease-in-out_infinite]"></div>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`h-9 w-9 rounded-md animate-[pulse_${1.8 + i * 0.2}s_ease-in-out_infinite] ${i === 1 ? "bg-sky-200" : "bg-sky-100"}`}
            ></div>
          ))}
          <div className="h-9 w-9 bg-sky-100 rounded-md animate-[pulse_2.4s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  )
}
