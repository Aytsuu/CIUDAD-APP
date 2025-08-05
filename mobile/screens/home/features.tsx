import { Book } from "@/lib/icons/Book";
import { Building } from "@/lib/icons/Building";
import { ClipboardPlus } from "@/lib/icons/ClipboardPlus";
import { HeartPulse } from "@/lib/icons/HeartPulse";
import { MessageCircleWarning } from "@/lib/icons/MessageCircleWarning";
import { MessageSquareWarning } from "@/lib/icons/MessageSquareWarning";

type FeatureType = {
  name: string;
  icon: React.ReactNode;
  route: string;
}

export const features: FeatureType[] = [
  {
    name: "Request",
    icon: <ClipboardPlus className="text-white"/>,
    route: "/(request)"
  },
  {
    name: "Report",
    icon: <MessageSquareWarning className="text-white"/>,
    route: "/(report)"
  },
  {
    name: "Blotter",
    icon: <MessageCircleWarning className="text-white"/>,
    route: "/(complaint)"
  },
  {
    name: "Profiling",
    icon: <Book className="text-white"/>,
    route: "/(profiling)"
  },
  {
    name: "Business",
    icon: <Building className="text-white"/>,
    route: "/(business)"
  },
  {
    name: "Health",
    icon: <HeartPulse className="text-white"/>,
    route: ""
  },

]