import { ProfilingForm } from "./ProfilingForm";

export default function ResidentRegistration() {
  return (
    <div>
      {/* <div className="flex gap-2 justify-between pb-4">
        <p className="text-md text-gray-700 text-xl">
          <span className="border-l-4 rounded-sm border-[#263D67] pr-2"></span>
          Resident Registration
        </p>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString(undefined, {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })}
        </p>
      </div> */}

      {/* <hr /> */}

      {/* Form */}
      <div className="">
        <ProfilingForm />
      </div>
    </div>
  );
}
