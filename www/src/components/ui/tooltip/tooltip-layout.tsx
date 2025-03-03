import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip/tooltip"

interface TooltipProps{
    trigger: React.ReactNode,
    content: String
}


const TooltipLayout = ({trigger, content} : TooltipProps) => (
    <TooltipProvider>
    <Tooltip>
        <TooltipTrigger>{trigger}</TooltipTrigger>
        <TooltipContent>
        <p>{content}</p>
        </TooltipContent>
    </Tooltip>
    </TooltipProvider>
);

export default TooltipLayout;