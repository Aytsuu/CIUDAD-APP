import React from "react";
// import ComplaintTable from "../ComplaintTable";
// import { useGetComplaint } from "../api-operations/queries/complaintGetQueries";


export default function ComplaintList() {
  const [searchQuery, _setSearchQuery] = React.useState("");
  const pageSize = React.useState(10);
  const [_currentPage, setCurrentPage] = React.useState(1);
  // const {data: complaints = [], isLoading, error} = useGetComplaint();

  React.useEffect(() =>{
    setCurrentPage(1);
  }, [searchQuery, pageSize]);
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col justify-center mb-4">
        <h1 className="flex flex-row font-semibold text-xl sm:text-2xl text-darkBlue2 items-center">
          Blotter Record
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          View documented incidents and their corresponding actions.
        </p>
      </div>
      <hr className="pb-4" />
      {/* <ComplaintTable
        data={paginatedData}
      /> */}
    </div>
  );
}
