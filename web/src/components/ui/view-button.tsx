import { CircleChevronRight } from "lucide-react";
import { Label } from "./label";

export default function ViewButton({onClick} : {
  onClick: () => void
}) {
  return (
    <div className="group flex justify-center items-center gap-2 px-3 py-2
                  rounded-lg border-none shadow-none hover:bg-muted
                  transition-colors duration-200 ease-in-out cursor-pointer"

        onClick={onClick}
    >
      <Label className="text-black/40 cursor-pointer group-hover:text-buttonBlue
              transition-colors duration-200 ease-in-out">
        View
      </Label> 
      <CircleChevronRight
        size={35}
        className="stroke-1 text-black/40 group-hover:fill-buttonBlue 
            group-hover:stroke-white transition-all duration-200 ease-in-out"
      />
    </div>
  )
}