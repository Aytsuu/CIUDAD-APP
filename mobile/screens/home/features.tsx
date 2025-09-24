import { MessageSquareWarning } from "@/lib/icons/MessageSquareWarning";
import Request from '@/assets/icons/features/request.svg'
import Blotter from '@/assets/icons/features/blotter.svg'
import Business from '@/assets/icons/features/business.svg'
import Profiling from '@/assets/icons/features/profiling.svg'
import Health from '@/assets/icons/features/health.svg'
import Report from '@/assets/icons/features/report.svg'
import Securado from '@/assets/icons/features/securado.svg'
import { User } from "../_Enums";

type FeatureType = {
  name: string;
  icon: React.ReactNode;
  route: string;
  users?: string[]
}

export const features: FeatureType[] = [
  {
    name: "Request",
    icon: <Request width={30} height={30}/>,
    route: "/(request)",
    users: [User.resident]
  },
  {
    name: "Report",
    icon: <Report width={30} height={30}/>,
    route: "/(report)",
    users: [User.resident]
  },
  {
    name: "Blotter",
    icon: <Blotter width={30} height={30}/>,
    route: "/(complaint)",
    users: [User.resident]
  },
  { 
    name: "Profiling",
    icon: <Profiling width={30} height={30}/>,
    route: "/(profiling)",
    users: ["profiling"]
  },
  {
    name: "Business",
    icon: <Business width={30} height={30}/>,
    route: "/(business)",
    users: []
  },
  {
    name: "Health",
    icon: <Health width={30} height={30}/>,
    route: "/(health)",
    users: [User.resident]
  },
  {
    name: "Securado",
    icon: <Securado width={30} height={30}/>,
    route: "/(securado)",
    users: [User.resident]  
  },
]