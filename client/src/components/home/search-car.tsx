import React from "react";
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
import { useQueryState } from "nuqs";
import { api, type APIResponse } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { Branch } from "@/data/branch";
import type { User } from "@/data/user";
import { Link } from "@tanstack/react-router";

export const SearchForm: React.FC = () => {
  const [location, setLocation] = useQueryState("location");
  const [pickupDate, setPickupDate] = useQueryState<Date>("pickupDate", {
    parse: (v) => new Date(v),
    serialize: (v) => v.toISOString().split("T")[0],
  });
  const [dropDate, setDropDate] = useQueryState<Date>("dropDate", {
    parse: (v) => new Date(v),
    serialize: (v) => v.toISOString().split("T")[0],
  });
  const today = new Date();

  const branches = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const branches = await api<
        APIResponse<
          {
            branch: Branch;
            user: User;
          }[]
        >
      >("/branch.getAll", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!branches.data) {
        throw new Error(branches.error);
      }

      return branches.data;
    },
    refetchInterval: 10000,
  });

  const canSubmit = location && pickupDate && dropDate;

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
                {branches.data?.find(({ branch }) => branch.id === location)
                  ?.branch.name ?? "Select Location..."}
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
                  {branches.data?.map(({ branch }) => (
                    <CommandItem
                      key={branch.id}
                      value={branch.id}
                      onSelect={() => setLocation(branch.id)}
                    >
                      {branch.name}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          location === branch.id ? "opacity-100" : "opacity-0"
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
              selected={pickupDate ?? undefined}
              onSelect={(date) => {
                if (date) {
                  setPickupDate(date);
                  if (!dropDate || date > dropDate) {
                    setDropDate(date);
                  }
                }
              }}
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
              selected={dropDate ?? undefined}
              onSelect={(date) => {
                if (date) {
                  setDropDate(date);
                }
              }}
              fromDate={pickupDate ?? today}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <Button
        disabled={!canSubmit}
        className="w-full max-w-xs px-3 py-5 rounded-lg md:bg-black md:hover:bg-black/90 text-white"
        asChild
      >
        <Link
          to="/search"
          search={{
            location,
            pickupDate: pickupDate?.toISOString().split("T")[0],
            dropDate: dropDate?.toISOString().split("T")[0],
          }}
        >
          Find A Vehicle
        </Link>
      </Button>
    </form>
  );
};
