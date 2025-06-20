import { ColumnDef } from "@tanstack/react-table";

type WARColumns = {
  incident_area: string;
  act_undertaken: string;
  time_started: string;
  time_completed: string;
  result: string;
}

export const WARDummy = [
  {
    incident_area: "Sitio Palma, AOR",
    act_undertaken: "Swimming",
    time_started: "10:30 AM",
    time_completed: "12:30 PM",
    result: "Happy"
  }
]

export const WARTemplateColumns: ColumnDef<WARColumns>[] = [
  {
    accessorKey: 'incident_area',
    header: 'INCIDENT AREA'
  }, 
  {
    accessorKey: 'act_undertaken',
    header: 'ACTIVITIES UNDERTAKEN'
  },
  {
    accessorKey: 'time_started',
    header: 'TIME FRAME/STARTED'
  },
  {
    accessorKey: 'time_completed',
    header: 'TIME FRAME/COMPLETED'
  },
  {
    accessorKey: 'result',
    header: 'RESULT'
  }
]