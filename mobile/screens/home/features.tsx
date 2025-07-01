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
    route: "(health)/admin/requestspage"
  },
  {
    name: "Report",
    icon: <MessageSquareWarning className="text-white"/>,
    route: "/(report)"
  },
  {
    name: "Complaint",
    icon: <MessageCircleWarning className="text-white"/>,
    route: "/(complaint)"
  },
  {
    name: "Health",
    icon: <HeartPulse className="text-white"/>,
    route: "/(health)/home"
  },
]