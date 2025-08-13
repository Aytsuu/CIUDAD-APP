// import { ChangeEvent, Dispatch, MouseEvent, SetStateAction } from "react"
// import {
//   TextField,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   Button,
//   Autocomplete,
//   Box,
// } from "@mui/material"
// import { EventFormData, ITodo } from "./EventCalendar"

// interface IProps {
//     open: boolean
//     handleClose: Dispatch<SetStateAction<void>>
//     eventFormData: EventFormData
//     setEventFormData: Dispatch<SetStateAction<EventFormData>>
//     onAddEvent: (e: MouseEvent<HTMLButtonElement>) => void
//     todos: ITodo[]
//   }

//   const AddEventModal = ({ open, handleClose, eventFormData, setEventFormData, onAddEvent, todos }: IProps) => {
//     const { description } = eventFormData
  
//     const onClose = () => handleClose()
  
//     const onChange = (event: ChangeEvent<HTMLInputElement>) => {
//       setEventFormData((prevState) => ({
//         ...prevState,
//         [event.target.name]: event.target.value,
//       }))
//     }
  
//     const handleTodoChange = (e: React.SyntheticEvent, value: ITodo | null) => {
//       setEventFormData((prevState) => ({
//         ...prevState,
//         todoId: value?._id,
//       }))
//     }
  
//     return (
//       <Dialog open={open} onClose={onClose}>
//         <DialogTitle>Add event</DialogTitle>
//         <DialogContent>
//           <DialogContentText>To add a event, please fill in the information below.</DialogContentText>
//           <Box component="form">
//             <TextField
//               name="description"
//               value={description}
//               margin="dense"
//               id="description"
//               label="Description"
//               type="text"
//               fullWidth
//               variant="outlined"
//               onChange={onChange}
//             />
//             <Autocomplete
//               onChange={handleTodoChange}
//               disablePortal
//               id="combo-box-demo"
//               options={todos}
//               sx={{ marginTop: 4 }}
//               getOptionLabel={(option) => option.title}
//               renderInput={(params) => <TextField {...params} label="Todo" />}
//             />
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button color="error" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button disabled={description === ""} color="success" onClick={onAddEvent}>
//             Add
//           </Button>
//         </DialogActions>
//       </Dialog>
//     )
//   }
  
//   export default AddEventModal

import { ChangeEvent, Dispatch, MouseEvent, SetStateAction } from "react";
import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Box,
} from "@mui/material";
import { HexColorPicker } from "react-colorful";

interface IProps {
  open: boolean;
  handleClose: Dispatch<SetStateAction<void>>;
  eventFormData: any;
  setEventFormData: Dispatch<SetStateAction<any>>;
  onAddEvent: (e: MouseEvent<HTMLButtonElement>) => void;
}

const AddEventModal = ({ open, handleClose, eventFormData, setEventFormData, onAddEvent }: IProps) => {
  const { description, color } = eventFormData;

  const onClose = () => handleClose();

  // Handle changes to the description field
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEventFormData((prevState: any) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  // Handle changes to the selected color
  const handleColorChange = (newColor: string) => {
    setEventFormData((prevState: any) => ({
      ...prevState,
      color: newColor, // Update the color in eventFormData
    }));
  };

  // Handle the "Add" button click
  const handleAddEvent = (e: MouseEvent<HTMLButtonElement>) => {
    onAddEvent(e);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add event</DialogTitle>
      <DialogContent>
        <DialogContentText>To add an event, please fill in the information below.</DialogContentText>
        <Box component="form">
          {/* Event Name/Title */}
          <TextField
            name="description"
            value={description}
            margin="dense"
            id="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            onChange={onChange}
          />

          {/* Color Picker */}
          <Box sx={{ marginTop: 4, display: "flex", justifyContent: "space-around" }}>
            <HexColorPicker color={color} onChange={handleColorChange} />
            <Box
              sx={{ height: 80, width: 80, borderRadius: 1 }}
              className="value"
              style={{ backgroundColor: color }}
            ></Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={description === ""} color="success" onClick={handleAddEvent}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEventModal;
