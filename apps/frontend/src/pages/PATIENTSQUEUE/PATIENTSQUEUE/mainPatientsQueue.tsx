import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PatientsQueueTable from "./patientsQueueTable";
import NoShowTable from "./noShowTable";
import NotArrivedTable from "./notArrivedTable";
import { useState } from "react";

export default function MainPatientQueueTable() {
    const [selectedView, setSelectedView] = useState('queue');

    const renderContent = () => {
        switch (selectedView) {
            case 'queue':
                return <PatientsQueueTable />;
            case 'notArrived':
                return <NotArrivedTable />;
            case 'noShow':
                return <NoShowTable />;
            default:
                return <PatientsQueueTable />;
        }
    };

    const getTitle = () => {
        switch (selectedView) {
            case 'queue':
                return 'Patients Queue';
            case 'notArrived':
                return 'Not Arrived';
            case 'noShow':
                return 'No Show';
            default:
                return 'Patients Queue';
        }
    };

    return (
        <div className="w-full max-w-6xl h-full my-10 mx-auto bg-white rounded-lg shadow p-4 md:p-6 lg:p-8">
            <CardHeader className="border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-2xl font-semibold pl-4 border-l-8 border-blue">
                        {getTitle()}
                    </CardTitle>

                    <div className="flex gap-2">
                        <Button
                            variant={selectedView === 'queue' ? "default" : "outline"}
                            onClick={() => setSelectedView('queue')}
                            className={selectedView === 'queue' ? "hover:text-white hover:bg-blue bg-blue text-white" : ""}
                        >
                            Patient Queue
                        </Button>
                        <Button
                            variant={selectedView === 'notArrived' ? "default" : "outline"}
                            onClick={() => setSelectedView('notArrived')}
                            className={selectedView === 'notArrived' ? "bg-green-500 text-white hover:bg-green-500" : ""}
                        >
                            Not Arrived
                        </Button>
                        <Button
                            variant={selectedView === 'noShow' ? "default" : "outline"}
                            onClick={() => setSelectedView('noShow')}
                            className={selectedView === 'noShow' ? "bg-red-500 text-white hover:bg-red-500" : ""}
                        >
                            No Show
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                {renderContent()}
            </CardContent>
        </div>
    );
}