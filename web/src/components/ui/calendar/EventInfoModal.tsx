// import { SetStateAction, MouseEvent, Dispatch } from "react"
// import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Box, Typography } from "@mui/material"
// import { IEventInfo } from "./EventCalendar"

// interface IProps {
//   open: boolean
//   handleClose: Dispatch<SetStateAction<void>>
//   onDeleteEvent: (e: MouseEvent<HTMLButtonElement>) => void
//   currentEvent: IEventInfo | null
// }

// const EventInfoModal = ({ open, handleClose, onDeleteEvent, currentEvent }: IProps) => {
//   const onClose = () => {
//     handleClose()
//   }

//   return (
//     <Dialog open={open} onClose={onClose}>
//       <DialogTitle>Event Info</DialogTitle>
//       <DialogContent>
//         <DialogContentText>
//           <Typography sx={{ fontSize: 14, marginTop: 3 }} color="text.secondary" gutterBottom>
//             {currentEvent?.description}
//           </Typography>
//         </DialogContentText>
//         <Box component="form"></Box>
//       </DialogContent>
//       <DialogActions>
//         <Button color="error" onClick={onClose}>
//           Cancel
//         </Button>
//         <Button color="info" onClick={onDeleteEvent}>
//           Delete Event
//         </Button>
//       </DialogActions>
//     </Dialog>
//   )
// }

// export default EventInfoModal
import { Modal, Box } from "@mui/material";
import { Event } from "react-big-calendar";
import React from "react";
import {X} from 'lucide-react'

// Types
export interface EventDetailColumn<T> {
  accessorKey: keyof T;
  header: string;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
}

interface IEventInfo<T = any> extends Event {
  _id: string;
  description: string;
  color: string;
  originalData: T;
  title: string;
}

interface EventInfoModalProps<T extends Record<string, any>> {
  open: boolean;
  handleClose: () => void;
  currentEvent: IEventInfo<T> | null;
  columns: EventDetailColumn<T>[];
  title: string; 
}

const EventInfoModal = <T extends Record<string, any>>({
  open,
  handleClose,
  currentEvent,
  columns,
  title, // ← add this line
}: EventInfoModalProps<T>) => {

  if (!currentEvent) return null;

  const dataSource = currentEvent.originalData;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
    <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[600px] max-h-[80vh] bg-white rounded-lg py-10 px-7 overflow-y-auto shadow-xl outline-none border-none">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray hover:text-red-600 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-center text-darkBlue2 text-[25px] font-semibold mb-6 mt-5">
          {title}
        </h2>

        {/* Details Area */}
        <div className="border border-gray-300 p-4 mb-6">
            <div className="grid grid-cols-[150px_1fr] gap-3">
              {columns.map((column) => {
                const value = dataSource[column.accessorKey];
                const displayValue = column.cell
                  ? column.cell({ row: { original: dataSource } })
                  : value !== undefined && value !== null
                    ? value.toString()
                    : 'N/A';

                return (
                  <React.Fragment key={String(column.accessorKey)}>
                    <p className="font-semibold text-black">{column.header}:</p>
                    <p className="text-md text-black">{displayValue}</p>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
      </Box>
    </Modal>
  );
};

export default EventInfoModal;
