// Dashboard.tsx
import { useState } from 'react';
import {Dialog,DialogContent,DialogTrigger,DialogHeader,DialogDescription,DialogTitle} from '../components/ui/dialog.tsx'
import CalendarComp from '../components/ui/event-calendar.tsx';
import AddEvent from './AddEvent-Modal.tsx';



function Dashboard() {

    const [events, setEvents] = useState<{ start: Date; end: Date; title: string }[]>([]);


    return (
        <div>
            <div className="mt-[50px] ml-[1175px]">
                <Dialog>
                    <DialogTrigger className="bg-[#3D4C77] hover:bg-[#4e6a9b] text-white px-4 py-1.5 rounded cursor-pointe">
                        Add Event
                    </DialogTrigger>
                    <DialogContent className="max-w-[700px]">
                        <DialogHeader>
                            <DialogTitle></DialogTitle>
                            <DialogDescription>

                            </DialogDescription>
                            <AddEvent></AddEvent>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>                
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