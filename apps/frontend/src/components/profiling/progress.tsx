import { User } from "lucide-react";

interface ProgressVariable {
  progress: number;
}

export default function Progress({ progress }: ProgressVariable) {
  return (
    <div className="flex">
      <div
        className={`rounded-full w-10 h-10 bg-green-500 flex items-center justify-center`}
      >
        <User className="text-white" />
      </div>
      <div className="flex w-20 rounded-sm bg-black h-2 items-center justify-center"></div>
      <div
        className={`rounded-full w-10 h-10 bg-[#263D67]
        ${
          progress === 50 || progress === 100 ? `bg-green-500` : `bg-[#263D67]`
        }`}
      ></div>
      <div
        className={`rounded-full w-10 h-10 bg-[#263D67]
        ${progress === 100 ? `bg-green-500` : `bg-[#263D67]`}`}
      ></div>
    </div>
  );
}
