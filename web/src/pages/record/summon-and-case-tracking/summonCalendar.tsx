// import { useState } from "react";
// import { Box, Card, CardContent, CardHeader, Container, Checkbox } from "@mui/material";
// import { Calendar, dateFnsLocalizer } from "react-big-calendar";
// import format from "date-fns/format";
// import parse from "date-fns/parse";
// import startOfWeek from "date-fns/startOfWeek";
// import getDay from "date-fns/getDay";
// import enUS from "date-fns/locale/en-US";
// import "react-big-calendar/lib/css/react-big-calendar.css";

// const locales = { "en-US": enUS };
// const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// const SummonCalendar = () => {
//   const [selectedDates, setSelectedDates] = useState<Date[]>([]);

//   const handleCheckboxChange = (date: Date) => {
//     setSelectedDates(prev => {
//       const dateStr = date.toDateString();
//       const isSelected = prev.some(d => d.toDateString() === dateStr);
      
//       if (isSelected) {
//         return prev.filter(d => d.toDateString() !== dateStr);
//       } else {
//         return [...prev, new Date(date)];
//       }
//     });
//   };

//   const renderDateCell = (date: Date) => {
//     const isSelected = selectedDates.some(d => d.toDateString() === date.toDateString());
//     return (
//       <div style={{
//         position: "absolute",
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "flex-start",
//         padding: "2px"
//       }}>
//         <Checkbox
//           checked={isSelected}
//           onChange={() => handleCheckboxChange(date)}
//           color="primary"
//           size="small"
//           style={{ 
//             padding: "0",
//             margin: "2px"
//           }}
//         />
//         <span style={{
//           margin: "4px 6px 0 0",
//           fontSize: "0.875rem",
//           fontWeight: "bold"
//         }}>
//         </span>
//       </div>
//     );
//   };

//   return (
//     <Box mb={2} component="main" sx={{ flexGrow: 1, py: 1 }}>
//       <Container>
//         <Card>
//           <CardHeader 
//             title="Summon Calendar"
//             sx={{
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//               padding: '16px 24px'
//             }}
//           />
//           <CardContent>
//             <Calendar
//               localizer={localizer}
//               events={[]}
//               startAccessor="start"
//               endAccessor="end"
//               defaultView="month"
//               selectable={false}
//               components={{
//                 dateCellWrapper: ({ children, value }) => (
//                   <div style={{ 
//                     position: "relative",
//                     height: "100%",
//                     width: "100%"
//                   }}>
//                     {renderDateCell(value)}
//                   </div>
//                 )
//               }}
//               style={{ height: 900, width: "100%" }}
//             />
//           </CardContent>
//         </Card>
//       </Container>
//     </Box>
//   );
// };

// export default SummonCalendar;

// import { useState } from "react";
// import { Box, Card, CardContent, CardHeader, Container, Checkbox } from "@mui/material";
// import { Calendar, dateFnsLocalizer } from "react-big-calendar";
// import format from "date-fns/format";
// import parse from "date-fns/parse";
// import startOfWeek from "date-fns/startOfWeek";
// import getDay from "date-fns/getDay";
// import enUS from "date-fns/locale/en-US";
// import "react-big-calendar/lib/css/react-big-calendar.css";

// const locales = { "en-US": enUS };
// const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// const SummonCalendar = () => {
//   const [selectedDates, setSelectedDates] = useState<Date[]>([]);

//   const handleCheckboxChange = (date: Date) => {
//     setSelectedDates(prev => {
//       const dateStr = date.toDateString();
//       const isSelected = prev.some(d => d.toDateString() === dateStr);
      
//       if (isSelected) {
//         return prev.filter(d => d.toDateString() !== dateStr);
//       } else {
//         return [...prev, new Date(date)];
//       }
//     });
//   };

//   const renderDateCell = (date: Date) => {
//     const isSelected = selectedDates.some(d => d.toDateString() === date.toDateString());
//     return (
//       <div style={{
//         position: "absolute",
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "flex-start",
//         padding: "2px",
//         backgroundColor: isSelected ? "rgba(63, 81, 181, 0.1)" : "transparent",
//         borderRadius: "4px"
//       }}>
//         <Checkbox
//           checked={isSelected}
//           onChange={() => handleCheckboxChange(date)}
//           color="primary"
//           size="small"
//           style={{ 
//             padding: "0",
//             margin: "2px",
//             color: isSelected ? "#3f51b5" : undefined
//           }}
//         />
//         <span style={{
//           margin: "4px 6px 0 0",
//           fontSize: "0.875rem",
//           fontWeight: isSelected ? "bold" : "normal",
//           color: isSelected ? "#3f51b5" : "inherit"
//         }}>
//         </span>
//       </div>
//     );
//   };

//   return (
//     <Box mb={2} component="main" sx={{ flexGrow: 1, py: 1 }}>
//       <Container>
//         <Card>
//           <CardHeader 
//             title="Summon Calendar"
//             sx={{
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//               padding: '16px 24px'
//             }}
//           />
//           <CardContent>
//             <Calendar
//               localizer={localizer}
//               events={[]}
//               startAccessor="start"
//               endAccessor="end"
//               defaultView="month"
//               selectable={false}
//               components={{
//                 dateCellWrapper: ({ children, value }) => (
//                   <div style={{ 
//                     position: "relative",
//                     height: "100%",
//                     width: "100%"
//                   }}>
//                     {children}
//                     {renderDateCell(value)}
//                   </div>
//                 )
//               }}
//               style={{ height: 900, width: "100%" }}
//             />
//           </CardContent>
//         </Card>
//       </Container>
//     </Box>
//   );
// };

// export default SummonCalendar;

import { useState } from "react";
import { Box, Container, CardHeader } from "@mui/material";
import { Button } from "@/components/ui/button/button";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card/card";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const SummonCalendar = () => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [tempSelectedDates, setTempSelectedDates] = useState<Date[]>([]);

  const handleDateSelection = (date: Date) => {
    if (!editMode) return;
    
    setTempSelectedDates(prev => {
      const dateStr = date.toDateString();
      const isSelected = prev.some(d => d.toDateString() === dateStr);
      
      return isSelected 
        ? prev.filter(d => d.toDateString() !== dateStr)
        : [...prev, new Date(date)];
    });
  };

  const handleEditClick = () => {
    setTempSelectedDates([...selectedDates]);
    setEditMode(true);
  };

  const handleSave = () => {
    setSelectedDates([...tempSelectedDates]);
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  const renderDateCell = (date: Date) => {
    const isSelected = editMode 
      ? tempSelectedDates.some(d => d.toDateString() === date.toDateString())
      : selectedDates.some(d => d.toDateString() === date.toDateString());
    
    return (
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "2px",
          backgroundColor: isSelected ? "rgba(63, 81, 181, 0.1)" : "transparent",
          borderRadius: "4px",
          cursor: editMode ? "pointer" : "default"
        }}
        onClick={(e) => {
          if (!editMode) return;
          if (e.target === e.currentTarget) {
            handleDateSelection(date);
          }
        }}
      >
        {editMode && (
          <Checkbox checked={isSelected} onChange={() => handleDateSelection(date)} />
        )}
        <span style={{
          margin: "4px 6px 0 0",
          fontSize: "0.875rem",
          fontWeight: isSelected ? "bold" : "normal",
          color: isSelected ? "#3f51b5" : "inherit"
        }}>
        </span>
      </div>
    );
  };

  return (
    <Box mb={2} component="main" sx={{ flexGrow: 1, py: 1 }}>
      <Container>
        <Card>
          <CardHeader 
            title="Summon Calendar"
            action={
              editMode ? (
                <div className='flex flex-grid gap-3'>
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                </div>
                
              ) : (
                <Button onClick={handleEditClick}>
                  Edit
                </Button>
              )
            }
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px'
            }}
          />
          <CardContent>
            <Calendar
              localizer={localizer}
              events={[]}
              startAccessor="start"
              endAccessor="end"
              defaultView="month"
              selectable={false}
              components={{
                dateCellWrapper: ({ children, value }) => (
                  <div style={{ 
                    position: "relative",
                    height: "100%",
                    width: "100%"
                  }}>
                    {children}
                    {renderDateCell(value)}
                  </div>
                )
              }}
              style={{ height: 900, width: "100%" }}
            />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default SummonCalendar;