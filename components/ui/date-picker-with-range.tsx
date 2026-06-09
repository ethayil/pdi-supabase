"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerWithRangeProps {
  className?: string;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: DatePickerWithRangeProps) {
  const [localRange, setLocalRange] = useState<DateRange | undefined>(date);
  const [tempStart, setTempStart] = useState<Date | null>(null);

  // const fromTime = date?.from?.getTime();
  // const toTime = date?.to?.getTime();

  useEffect(() => {
    setLocalRange(date);
    if (!date?.from) {
      setTempStart(null);
    }
  }, [date]);

  const handleSelect = (range: DateRange | undefined, selectedDay?: Date) => {
    console.log("DatePickerWithRange handleSelect:", range, selectedDay);
    if (!range) {
      setLocalRange(undefined);
      setTempStart(null);
      setDate(undefined);
      return;
    }

    const clickedDay = selectedDay || range.from;

    if (!tempStart && clickedDay) {
      // First click: record the starting point
      setTempStart(clickedDay);
      setLocalRange({ from: clickedDay, to: undefined });
    } else if (tempStart && clickedDay) {
      // Second click: construct final range and call parent setDate
      const finalRange = {
        from:
          tempStart.getTime() < clickedDay.getTime() ? tempStart : clickedDay,
        to: tempStart.getTime() < clickedDay.getTime() ? clickedDay : tempStart,
      };
      setLocalRange(finalRange);
      setTempStart(null);
      setDate(finalRange);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Revert local range to parent's date if popover is closed with an incomplete range selection
      if (localRange?.from && !localRange.to) {
        setLocalRange(date);
        setTempStart(null);
      }
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover onOpenChange={handleOpenChange}>
        <PopoverTrigger
          render={
            <Button
              id="date"
              variant="outline"
              size="sm"
              className={cn(
                "w-40 h-8 sm:w-60 justify-start text-left font-normal truncate shrink-0",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
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
                <span>Pick a date range</span>
              )}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={localRange?.from || date?.from}
            selected={localRange}
            onSelect={handleSelect}
            numberOfMonths={2}
            fixedWeeks
          />
          <div className="p-3 border-t flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-primary"
              onClick={() => handleSelect(undefined)}
            >
              Clear Range
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
