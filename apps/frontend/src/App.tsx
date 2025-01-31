import WasteEventSched from "@/pages/waste-scheduling/waste-event-sched"
import WasteColSched from "@/pages/waste-scheduling/waste-col-sched"
import WasteHotSched from "@/pages/waste-scheduling/waste-hotspot-sched"
import WasteIllegalDumping from "./pages/reports/waste-illegal-dumping"

function App() {

  return (
    <>
    <WasteColSched/>
    <WasteHotSched/>
    <WasteEventSched/>
    <WasteIllegalDumping/>
    </> 
  )
}

export default App