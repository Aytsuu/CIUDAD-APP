import Request from '@/assets/icons/features/request.svg'
import Blotter from '@/assets/icons/features/blotter.svg'
import Business from '@/assets/icons/features/business.svg'
import Profiling from '@/assets/icons/features/profiling.svg'
import Health from '@/assets/icons/features/health.svg'
import Report from '@/assets/icons/features/report.svg'
import { Feature, User } from "../_Enums";
import { Circle } from "react-native-svg";

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
    users: []
  },
  {
    name: "Report",
    icon: <Report width={30} height={30}/>,
    route: "/(report)",
    users: []
  },
  {
    name: "Blotter",
    icon: <Blotter width={30} height={30}/>,
    route: "/(complaint)",
    users: []
  },
  {  
    name: "Profiling",
    icon: <Profiling width={30} height={30}/>,
    route: "/(profiling)",
    users: [User.admin, Feature.profiling]
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
  // {
  //   name: "Securado",
  //   icon: <Securado width={30} height={30}/>,
  //   route: "/(securado)",
  //   users: [User.resident]
  // },
    {
    name: "Council",
    icon: <Circle />,
    route: "/(council)",
    users: []
  },
  {
    name: "Donation",
    icon: <Circle />,
    route: "/(donation)/staffDonationMain",
    users: []
  },
  {
    name: "Finance",
    icon: <Circle />,
    route: "/(treasurer)",
    users: []
  },
  {
    name: "Waste",
    icon: <Circle />,
    route: "/(waste)",
    users: []
  },
  {
    name: "GAD",
    icon: <Circle />,
    route: "/(gad)",
    users: []
  },
  {
    name: "Certificates",
    icon: <Circle />,
    route: "/(certificates)/cert-main",
    users: []
  },
  {
    name: "Summon Remarks",
    icon: <Circle />,
    route: "/(summon)/summon-remarks-main",
    users: []
  },
  {
    name: "Council Mediation",
    icon: <Circle />,
    route: "/(summon)/council-mediation-main",
    users: []
  },
  {
    name: "Conciliation Proceedings",
    icon: <Circle />,
    route: "/(summon)/lupon-conciliation-main",
    users: []
  }
]