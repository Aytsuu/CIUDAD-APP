<<<<<<< HEAD
import * as React from "react";
import { format, getMonth, getYear, setMonth, setYear, addDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
=======
import * as React from "react"
import { format, getMonth, getYear, setMonth, setYear } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
>>>>>>> mobile/feature/landing-page
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
<<<<<<< HEAD
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select/select";
=======
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select/select"
>>>>>>> mobile/feature/landing-page

interface DatePickerProps {
  startYear?: number;
  endYear?: number;
}
export function DatePicker({
  startYear = getYear(new Date()) - 100,
  endYear = getYear(new Date()) + 100,
}: DatePickerProps) {
<<<<<<< HEAD
  const [date, setDate] = React.useState<Date>(new Date());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
=======

  const [date, setDate] = React.useState<Date>(new Date());

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
>>>>>>> mobile/feature/landing-page
  ];
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  const handleMonthChange = (month: string) => {
    const newDate = setMonth(date, months.indexOf(month));
    setDate(newDate);
<<<<<<< HEAD
  };

  const handleYearChange = (year: string) => {
    const newDate = setYear(date, parseInt(year));
    setDate(newDate);
  };

  const handleSelect = (selectedData: Date | undefined) => {
    if (selectedData) {
      setDate(selectedData);
    }
  };
=======
  }

  const handleYearChange = (year: string) => {
    const newDate = setYear(date, parseInt(year));
    setDate(newDate)
  }

  const handleSelect = (selectedData: Date | undefined) => {
    if (selectedData) {
      setDate(selectedData)
    }
  }
>>>>>>> mobile/feature/landing-page

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex justify-between p-2">
          <Select
            onValueChange={handleMonthChange}
            value={months[getMonth(date)]}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
<<<<<<< HEAD
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
=======
              {months.map(month => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
>>>>>>> mobile/feature/landing-page
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={handleYearChange}
            value={getYear(date).toString()}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
<<<<<<< HEAD
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
=======
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
>>>>>>> mobile/feature/landing-page
              ))}
            </SelectContent>
          </Select>
        </div>

        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          month={date}
          onMonthChange={setDate}
        />
      </PopoverContent>
    </Popover>
<<<<<<< HEAD
  );
}

export function DatePickerWithRange({
  className,
  value,
  onChange,
}: {
  className?: string;
  value?: DateRange | undefined;
  onChange?: (date: DateRange | undefined) => void;
}) {
  const [date, setDate] = React.useState<DateRange | undefined>(
    value || {
      from: new Date(2022, 0, 20),
      to: addDays(new Date(2022, 0, 20), 20),
    }
  );

  // Update local state when value prop changes
  React.useEffect(() => {
    if (value) {
      setDate(value);
    }
  }, [value]);

  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (onChange) {
      onChange(newDate);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
=======
  )
>>>>>>> mobile/feature/landing-page
}