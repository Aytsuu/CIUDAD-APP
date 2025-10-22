"use client"

import React from "react";

interface PageProps {
   onPageChange: (page: number) => void
}

export default function PFHistoryTab({ onPageChange }: PageProps) {
   const [selectedPageNum, setSelectedPageNum] = React.useState(1);

   const handlePageChange = (pageNum: number) => {
      setSelectedPageNum(pageNum);
      onPageChange(pageNum);
   }

   const getTabStyle = (page: number) => {
		const baseClasses = "flex justify-center items-center cursor-pointer text-black/70 transition-colors duration-200 ease-in-out rounded-md p-2 h-[32px] w-[100px]";

		if (selectedPageNum === page) {
			// Active tab styles
			return `${baseClasses} bg-white shadow-md border text-blue-500`;
		} else {
			// Inactive tab styles
			return `${baseClasses} bg-blue-50 text-gray-100 hover:bg-white/`;
		}
  };

  return (
   <div className="flex items-center justify-center">
      <div className="flex border bg-blue-50 rounded-md px-1 py-1 gap-2">
         <span className={getTabStyle(1)} onClick={() => handlePageChange(1)}>
            <h6 className="text-sm font-semibold text-gray-800">Page 1</h6>
         </span>
         <span className={getTabStyle(2)} onClick={() => handlePageChange(2)}>
            <h6 className="text-sm font-semibold text-gray-800">Page 2</h6>
         </span>
      </div>
   </div>
  )
}