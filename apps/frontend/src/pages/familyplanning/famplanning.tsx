// famplanning.tsx
import { useState, useEffect } from 'react';
import FamilyPlanningView from './view';

// Define the interface for our data
interface FamilyPlanningRecord {
  clientId: string;
  philhealthNo: string;
  nhts: {
    status: boolean;
    pantawidStatus: boolean;
  };
  personalInfo: {
    lastName: string;
    givenName: string;
    middleInitial: string;
    dateOfBirth: string;
    age: number;
    educationalAttainment: string;
    occupation: string;
  };
  
}

const FamilyPlanningPage = () => {
  const [records, setRecords] = useState<FamilyPlanningRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<FamilyPlanningRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating API call - replace with your actual API call
    const fetchRecords = async () => {
      try {
        // Replace this with your actual API endpoint
        const response = await fetch('/api/family-planning-records');
        const data = await response.json();
        setRecords(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching records:', error);
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex gap-4">
        {/* Left side - List of records */}
        <div className="w-1/4">
          <h2 className="text-lg font-semibold mb-4">Patient Records</h2>
          <div className="space-y-2">
            {records.map((record) => (
              <div
                key={record.clientId}
                className={`p-2 cursor-pointer rounded ${
                  selectedRecord?.clientId === record.clientId
                    ? 'bg-blue-100'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedRecord(record)}
              >
                <div className="font-medium">
                  {`${record.personalInfo.lastName}, ${record.personalInfo.givenName}`}
                </div>
                <div className="text-sm text-gray-600">{record.clientId}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Selected record view */}
        <div className="w-3/4">
          {selectedRecord ? (
            <FamilyPlanningView data={selectedRecord} />
          ) : (
            <div className="text-center text-gray-500 mt-10">
              Select a patient record to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyPlanningPage;