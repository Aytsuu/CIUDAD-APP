// Dashboard.tsx
import { useState } from 'react';
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import CalendarComp from '../components/ui/event-calendar.tsx';
import AddEvent from './AddEvent-Modal.tsx';
import { Button } from "@/components/ui/button"



function Dashboard() {

    const [events, setEvents] = useState<{ start: Date; end: Date; title: string }[]>([]);


    return (
        <div>
            <div className="mt-[50px] ml-[1175px]">
                <DialogLayout   
                    trigger={<Button className="bg-[#3D4C77] hover:bg-[#4e6a9b] text-white px-4 py-1.5 rounded cursor-pointer"> Add Event </Button>}
                    className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                    title="Schedule Event"
                    description="Set an upcoming event."
                    mainContent={<AddEvent/>}
                />
            </div>

            <CalendarComp 
                events={events} 
                setEvents={setEvents} 
                className="h-[110px] w-[700px] ml-[520px]"
            />

        </div>
    );
}
export default Dashboard;