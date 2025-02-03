import { Label } from "./label"
import { cn } from "@/lib/utils"

interface CardProps{
    icon: React.ReactNode,
    title: string,
    actionText: string,
    className: string
}

const Card = ({ icon, title, actionText, className } : CardProps) => (
    <a href="" className={cn("relative w-full h-[15%] bg-lightBlue flex flex-col", className)}>
      {icon ? icon : ''}
      <div className="w-full h-full flex items-center p-5 z-10">
        <Label className="text-black text-[20px] font-semibold cursor-pointer">{title}</Label>
      </div>
      <div className="w-full h-[25%] bg-darkBlue3 flex items-center p-3 z-10">
        <Label className="text-white cursor-pointer">{actionText}</Label>
      </div>
    </a> 
);

export default Card;
