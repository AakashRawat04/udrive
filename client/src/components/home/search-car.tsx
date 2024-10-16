import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/classes";
import { format } from "date-fns/format";
import { Calendar as CalendarIcon, CheckIcon, MapPinIcon } from "lucide-react";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Label } from "@/components/ui/label";
import { useParams, useSearch } from "@tanstack/react-router";

const locations = [
  { value: "new-york", label: "New York" },
  { value: "london", label: "London" },
  { value: "tokyo", label: "Tokyo" },
];

export const SearchForm: React.FC = () => {
  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState<Date>();
  const [dropDate, setDropDate] = useState<Date>();
  const today = new Date();

  return (
    <form className="flex flex-col md:flex-row justify-center items-end gap-6 md:gap-4 w-full max-w-7xl mx-auto md:bg-white/90 md:py-6 md:pt-8 px-6 rounded-xl">
      <div className="w-full flex flex-col gap-2">
        <Label htmlFor="location" className="text-muted-foreground font-normal">
          Location
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full min-w-[40%] justify-between px-3 py-5 rounded-lg",
                !location && "text-muted-foreground"
              )}
            >
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2" />
                {location
                  ? locations.find((l) => l.value === location)?.label
                  : "Select Location..."}
              </div>
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search framework..." className="h-9" />
              <CommandList>
                <CommandEmpty>No locations found.</CommandEmpty>
                <CommandGroup>
                  {locations.map((l) => (
                    <CommandItem
                      key={l.value}
                      value={l.value}
                      onSelect={() => setLocation(l.value)}
                    >
                      {l.label}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          location === l.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="w-full flex flex-col gap-2">
        <Label
          htmlFor="pickupDate"
          className="text-muted-foreground font-normal"
        >
          Pick up date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full max-w-sm justify-start text-left font-normal px-3 py-5 rounded-lg",
                !pickupDate && "text-muted-foreground"
              )}
            >
              {pickupDate ? (
                // @ts-ignore
                format(pickupDate, "PPP")
              ) : (
                <span>Pick up date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={pickupDate}
              onSelect={setPickupDate}
              fromDate={today}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="w-full flex flex-col gap-2">
        <Label htmlFor="dropDate" className="text-muted-foreground font-normal">
          Drop off date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full max-w-sm justify-start text-left font-normal px-3 py-5 rounded-lg",
                !dropDate && "text-muted-foreground"
              )}
            >
              {/* @ts-ignore */}
              {dropDate ? format(dropDate, "PPP") : <span>Drop off date</span>}
              <CalendarIcon className="ml-auto h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dropDate}
              onSelect={setDropDate}
              fromDate={today}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <Button
        type="submit"
        disabled
        className="w-full max-w-xs px-3 py-5 rounded-lg md:bg-black md:hover:bg-black/90 text-white"
      >
        Find A Vehicle
      </Button>
    </form>
  );
};
