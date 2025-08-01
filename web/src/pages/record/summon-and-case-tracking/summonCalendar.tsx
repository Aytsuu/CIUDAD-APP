import { useState, useEffect } from "react";
import { Box, Container, CardHeader, Skeleton } from "@mui/material";
import { Button } from "@/components/ui/button/button";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { enUS } from "date-fns/locale"; 
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card/card";
import { useAddSummonDates } from "./queries/summonInsertQueries";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useGetSummonDates } from "./queries/summonFetchQueries";
import { localDateFormatter } from "@/helpers/localDateFormatter";

const getStartOfWeek = (date: Date) => {
  return startOfWeek(date, { weekStartsOn: 1 }); 
};

const getWeekDay = (date: Date) => {
  return getDay(date) === 0 ? 6 : getDay(date) - 1; 
};

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: getStartOfWeek,
  getDay: getWeekDay,
  locales,
});

const SummonCalendar = () => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [tempSelectedDates, setTempSelectedDates] = useState<Date[]>([]);
  
  const onSuccess = () => {
    toast.success('Dates saved successfully!', {
      icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      duration: 2000
    });
  };

  const { mutate: addDate, isPending } = useAddSummonDates(onSuccess);
  const { data: summonDates = [], isLoading } = useGetSummonDates();

  // Initialize selected dates from fetched data
  useEffect(() => {
    if (summonDates.length > 0) {
      const dates = summonDates.map(item => new Date(item.sd_date));
      setSelectedDates(dates);
      // Also initialize tempSelectedDates with fetched dates
      setTempSelectedDates(dates);
    }
  }, [summonDates]);

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
    const formattedDates = tempSelectedDates.map(date => localDateFormatter(date));
    addDate({ 
      formattedDates 
    }, {
      onSuccess: () => {
        setSelectedDates([...tempSelectedDates]);
        setEditMode(false);
      }
    });
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  const renderDateCell = (date: Date) => {
    const isFetchedDate = summonDates.some(item => 
      new Date(item.sd_date).toDateString() === date.toDateString()
    );
    
    const isSelected = editMode 
      ? tempSelectedDates.some(d => d.toDateString() === date.toDateString())
      : isFetchedDate;

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
          <Checkbox 
            checked={isSelected} 
            onChange={() => handleDateSelection(date)}
            disabled={isPending}
          />
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

  const dayHeaderFormat = (date: Date) => {
    return format(date, 'EEE', { locale: enUS });
  };

  if (isLoading) {
    return (
      <Box mb={2} component="main" sx={{ flexGrow: 1, py: 1 }}>
        <Container>
          <Card>
            <CardHeader 
              title="Summon Dates"
              action={<Skeleton variant="rounded" width={100} height={36} />}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px'
              }}
            />
            <CardContent>
              <Skeleton variant="rounded" height={900} width="100%" />
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box mb={2} component="main" sx={{ flexGrow: 1, py: 1 }}>
      <Container>
        <Card>
          <CardHeader 
            title="Summon Dates"
            action={
              editMode ? (
                <div className='flex flex-grid gap-3'>
                  <Button 
                    onClick={handleSave}
                    disabled={isPending}
                  >
                    {isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
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
              formats={{
                dayHeaderFormat: dayHeaderFormat
              }}
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