"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { zhCN, enUS } from "date-fns/locale";
import { addDays, isWithinInterval, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

interface PropertyCalendarProps {
  occupiedSlots: { from: Date; to: Date }[];
}

export function PropertyCalendar({ occupiedSlots }: PropertyCalendarProps) {
  const [range, setRange] = React.useState<Date | undefined>(new Date());

  // Function to check if a date is occupied
  const isOccupied = (date: Date) => {
    const day = startOfDay(date);
    return occupiedSlots.some(slot => {
      const start = startOfDay(new Date(slot.from));
      const end = startOfDay(new Date(slot.to));
      return isWithinInterval(day, { start, end });
    });
  };

  return (
    <div className="flex flex-col space-y-4 items-center md:items-start">
      <DayPicker
        mode="single"
        selected={range}
        onSelect={setRange}
        disabled={[{ before: new Date() }]}
        modifiers={{
          occupied: (date) => isOccupied(date),
        }}
        modifiersClassNames={{
          occupied: "bg-red-50 text-red-900 line-through opacity-50 cursor-not-allowed",
        }}
        className={cn("p-3 border-none shadow-none font-sans")}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center mb-4",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
          day: cn(
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-full transition-colors"
          ),
          day_selected: "bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white",
          day_today: "bg-gray-50 text-black border border-gray-200",
          day_outside: "text-gray-400 opacity-50",
          day_disabled: "text-gray-400 opacity-20",
          day_hidden: "invisible",
        }}
      />

      <div className="flex items-center space-x-6 text-xs text-gray-500 px-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-50 border border-red-100 mr-2" />
          <span>Occupied</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full border border-gray-200 mr-2" />
          <span>Available</span>
        </div>
      </div>
    </div>
  );
}
