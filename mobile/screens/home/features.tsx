import Request from '@/assets/icons/features/request.svg'
import Blotter from '@/assets/icons/features/blotter.svg'
import Business from '@/assets/icons/features/business.svg'
import Profiling from '@/assets/icons/features/profiling.svg'
import Health from '@/assets/icons/features/health.svg'
import Report from '@/assets/icons/features/report.svg'
import Donation from '@/assets/icons/features/donation.svg'
import Certificate from '@/assets/icons/features/certificate.svg'
import Finance from '@/assets/icons/features/finance.svg'
import Council from '@/assets/icons/features/council.svg'
import Waste from '@/assets/icons/features/waste.svg'
import SummonRemarks from '@/assets/icons/features/summon remarks.svg'
import GAD from '@/assets/icons/features/GAD.svg'
import CouncilMediation from '@/assets/icons/features/council mediation.svg'
import Conciliation from '@/assets/icons/features/conciliation.svg'
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
    icon: <Council width={30} height={30}/>,
    route: "/(council)",
    users: []
  },
  {
    name: "Donation",
    icon: <Donation width={30} height={30}/>,
    route: "/(donation)/staffDonationMain",
    users: []
  },
  {
    name: "Finance",
    icon: <Finance width={30} height={30}/>,
    route: "/(treasurer)",
    users: []
  },
  {
    name: "Waste",
    icon: <Waste width={30} height={30}/>,
    route: "/(waste)",
    users: []
  },
  {
    name: "GAD",
    icon: <GAD width={30} height={30}/>,
    route: "/(gad)",
    users: []
  },
  {
    name: "Certificates",
    icon: <Certificate width={30} height={30}/>,
    route: "/(certificates)/cert-main",
    users: []
  },
  {
    name: "Summon Remarks",
    icon: <SummonRemarks width={30} height={30}/>,
    route: "/(summon)/summon-remarks-main",
    users: []
  },
  {
    name: "Council Mediation",
    icon: <CouncilMediation width={30} height={30}/>,
    route: "/(summon)/council-mediation-main",
    users: []
  },
  {
    name: "Conciliation Proceedings",
    icon: <Conciliation width={30} height={30}/>,
    route: "/(summon)/lupon-conciliation-main",
    users: []
  }
]