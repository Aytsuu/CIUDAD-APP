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
import { CircleCheck, Plus, CalendarIcon, Clock, Trash2 } from "lucide-react";
import { useGetSummonDates, useGetSummonTimeSlots } from "./queries/summonFetchQueries";
import { localDateFormatter } from "@/helpers/localDateFormatter";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import SummonTimeSlot from "./summonTimeSlot";
import { Label } from "@/components/ui/label";
import { formatTime } from "@/helpers/timeFormatter";

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
  const [selectedDateForTimeSlots, setSelectedDateForTimeSlots] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSdId, setCurrentSdId] = useState<number | undefined>(undefined);
  const isBooked = false;

  const onSuccess = () => {
    toast.success('Dates saved successfully!', {
      icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      duration: 2000
    });
  };

  const { mutate: addDate, isPending } = useAddSummonDates(onSuccess);
  const { data: summonDates = [], isLoading: isLoadingDates } = useGetSummonDates();

  // Fetch time slots only when we have a valid sd_id
  const { data: fetchedTimeSlots = [], isLoading: isLoadingTimeSlots, refetch: refetchTimeSlots } = useGetSummonTimeSlots(currentSdId || 0);

  // Update currentSdId when selected date changes
  useEffect(() => {
    if (selectedDateForTimeSlots) {
      const found = summonDates.find(item => {
        const dbDate = new Date(item.sd_date);
        return (
          dbDate.getFullYear() === selectedDateForTimeSlots.getFullYear() &&
          dbDate.getMonth() === selectedDateForTimeSlots.getMonth() &&
          dbDate.getDate() === selectedDateForTimeSlots.getDate()
        );
      });
      setCurrentSdId(found?.sd_id);
    } else {
      setCurrentSdId(undefined);
    }
  }, [selectedDateForTimeSlots, summonDates]);

  // Initialize selected dates from summonDates
  useEffect(() => {
    if (summonDates.length > 0) {
      const dates = summonDates.map(item => {
        const [year, month, day] = item.sd_date.split('-').map(Number);
        return new Date(year, month - 1, day);
      });
      setSelectedDates(dates);
      setTempSelectedDates(dates);
    }
  }, [summonDates]);

  const handleTimeSlotSuccess = () => {
    setIsDialogOpen(false);
    if (currentSdId) {
      refetchTimeSlots();
    }
  };

  const handleDateSelection = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!editMode) {
      if (date < today) return;
      
      const isSelectedDate = selectedDates.some(d => 
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );

      if (isSelectedDate) {
        setSelectedDateForTimeSlots(date);
      } else {
        toast.info('Enable this date to view and add time slots.');
      }
    } else {
      setTempSelectedDates(prev => {
        const isSelected = prev.some(d => 
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
        );
        
        return isSelected 
          ? prev.filter(d => 
              !(d.getFullYear() === date.getFullYear() &&
                d.getMonth() === date.getMonth() &&
                d.getDate() === date.getDate())
            )
          : [...prev, new Date(date)];
      });
    }
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
    const isSelected = editMode
      ? tempSelectedDates.some(d => 
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
        )
      : selectedDates.some(d => 
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
        );

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
          cursor: "pointer" 
        }}
        onClick={() => handleDateSelection(date)}
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

  if (isLoadingDates) {
    return (
      <Box mb={2} component="main" sx={{ flexGrow: 1, py: 1 }}>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
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
            </div>
            <div className="lg:col-span-1">
              <Skeleton variant="rounded" height={400} width="100%" />
            </div>
          </div>
        </Container>
      </Box>
    );
  }

  return (
    <Box mb={2} component="main" sx={{ flexGrow: 1, py: 1 }}>
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar Area */}
          <div className="lg:col-span-2">
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
                <div className="mb-4 text-sm text-gray-600">
                  {editMode 
                    ? "Select dates to add to your summon calendar" 
                    : "Click on a date to manage time slots"}
                </div>
                
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
          </div>

          {/* Time Slots Management Area */}
          <div className="lg:col-span-1">
            <Card className="h-fit sticky top-4">
              <CardHeader
                title={
                  <div className="flex items-center gap-2">
                    <Clock size={20} />
                    <span>Time Slots</span>
                  </div>
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 24px",
                }}
              />
              <CardContent className="space-y-4">
                {selectedDateForTimeSlots ? (
                  <>
                    <div className="text-sm font-medium text-center p-3 bg-blue-50 rounded-lg border">
                      <div className="flex items-center justify-center gap-2 text-blue-700">
                        <CalendarIcon size={16} />
                        <span>{format(selectedDateForTimeSlots, "EEEE")}</span>
                      </div>
                      <div className="text-lg font-semibold text-blue-800 mt-1">
                        {format(selectedDateForTimeSlots, "MMMM d, yyyy")}
                      </div>
                    </div>

                    {/* Existing Time Slots */}
                    <div>
                      <Label className="text-sm font-medium">Available Time Slots</Label>
                      {isLoadingTimeSlots ? (
                        <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                          {[1, 2, 3].map((_, index) => (
                            <div key={index} className="p-3 border rounded-lg animate-pulse">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                          {fetchedTimeSlots.filter(slot => slot.sd_id === currentSdId).length === 0 ? (
                            <div className="text-center py-8">
                              <Clock size={32} className="mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">No time slots available</p>
                              <p className="text-xs text-gray-400">Add your first time slot below</p>
                            </div>
                          ) : (
                            fetchedTimeSlots
                              .filter(slot => slot.sd_id === currentSdId)
                              .map(slot => (
                                <div
                                  key={slot.st_id}
                                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                                    isBooked
                                      ? "bg-red-50 border-red-200 hover:bg-red-100"
                                      : "bg-green-50 border-green-200 hover:bg-green-100"
                                  }`}
                                >
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">
                                      {formatTime(slot.st_start_time)} - {formatTime(slot.st_end_time)}
                                    </div>
                                    <div className={`text-xs ${isBooked ? "text-red-600" : "text-green-600"}`}>
                                      {isBooked ? "Booked" : "Available"}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 h-auto"
                                    >
                                      <Trash2 size={12} color="red" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      )}
                    </div>

                    {/* Add New Time Slot */}
                    <DialogLayout
                      trigger={
                        <Button className="w-full mt-3" variant="outline">
                          <Plus size={14} className="mr-2" /> Add Time Slot
                        </Button>
                      }
                      title={`Add new time slots for ${format(selectedDateForTimeSlots, "MMMM d, yyyy")}`}
                      description="Add or manage time slots for the selected date"
                      mainContent={
                        <SummonTimeSlot
                          sd_id={currentSdId}
                          onSuccess={handleTimeSlotSuccess}
                        />
                      }
                      isOpen={isDialogOpen}
                      onOpenChange={setIsDialogOpen}
                    />
                  </>
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Date</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Click on an enabled date from the calendar to view and manage time slots
                    </p>
                    <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium mb-1">💡 Tip:</p>
                      <p>Only dates that are enabled (highlighted) can have time slots</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </Box>
  );
};

export default SummonCalendar;