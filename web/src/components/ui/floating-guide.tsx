import { BookOpen } from "lucide-react";

export const FloatingGuide = () => {
  return (
    <div className="flex items-center">
      <button
        className={`
            flex items-center bg-blue-600 text-white rounded-full
            hover:bg-blue-700 p-4 gap-2
            h-9
          `}
      >
        <div className="flex items-center justify-center flex-shrink-0">
          <BookOpen size={18} />
        </div>

        <span
          className={`
              whitespace-nowrap font-medium text-sm
            `}
        >
          User Guide
        </span>
      </button>
    </div>
  );
};
