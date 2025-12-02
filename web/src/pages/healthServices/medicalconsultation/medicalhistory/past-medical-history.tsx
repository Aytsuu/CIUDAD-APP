import { AlertCircle, Loader2 } from "lucide-react";

const PHIllnessTable = ({ phHistoryData, isLoading, isError }: any) => {
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
        <span>Loading PH illness history...</span>
      </div>
    );
  }

  if (isError || !phHistoryData) {
    return (
      <div className="p-4 flex items-center gap-2 text-red-500">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load PH illness history</span>
      </div>
    );
  }

  const { ph_illnesses, other_illnesses } = phHistoryData;

  return (
    <div className="border border-black">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left  font-medium text-gray-900  border-r border-black">
                Past Medical History
                <br />
              </th>
              <th className="pb-1 text-center  font-medium text-gray-900 w-12 border-r border-black">Y</th>
              <th className="pb-1  text-center  font-medium text-gray-900 w-12 border-r border-black">N</th>
              <th className="pb-1  text-left  font-medium text-gray-900 min-w-[150px]">REMARKS</th>
            </tr>
          </thead>
          <tbody>
            {ph_illnesses?.data?.map((illness: any) => (
              <tr key={illness.ill_id} className="border-b border-black ">
                <td className="pb-1  text-sm text-gray-900 font-medium border-r border-black pr-20">{illness.illname}</td>
                <td className="pb-2  text-center border-r border-black">{illness.has_illness ? "✓ " : ""}</td>
                <td className="pb-1  text-center border-r border-black">{!illness.has_illness ? "✓ " : ""}</td>
                <td className="pb-1  text-sm text-gray-700">{illness.has_illness && illness.year ? `Diagnosed in ${illness.year}` : ""}</td>
              </tr>
            ))}

            {/* Others row */}
            <tr className="border-b border-black">
              <td className="pb-1  text-sm text-gray-900 font-medium border-r border-black">Others</td>
              <td className="pb-2  text-center border-r border-black">{other_illnesses && other_illnesses !== "None" ? "✓ " : ""}</td>
              <td className="pb-1  text-center border-r border-black">{!other_illnesses || other_illnesses === "None" ? "✓ " : ""}</td>
              <td className="pb-1  text-sm text-gray-700">{other_illnesses && other_illnesses !== "None" ? other_illnesses : ""}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PHIllnessTable;
