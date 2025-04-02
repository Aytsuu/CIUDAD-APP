import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip/tooltip"
import { cn } from "@/lib/utils"

interface TooltipProps{
    trigger: React.ReactNode,
    content: React.ReactNode
    contentClassName?: string
}


const TooltipLayout = ({trigger, content, contentClassName} : TooltipProps) => (
    <TooltipProvider>
    <Tooltip>
        <TooltipTrigger>{trigger}</TooltipTrigger>
        <TooltipContent className={cn("bg-darkGray", contentClassName)}>
        <p>{content}</p>
        </TooltipContent>
    </Tooltip>
    </TooltipProvider>
);

export default TooltipLayout;